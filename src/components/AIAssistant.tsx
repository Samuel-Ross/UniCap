import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, User, Paperclip, FileText, X, UploadCloud, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
const rinProfile = "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=256&auto=format&fit=crop";
import { saveToCookieDb, loadFromCookieDb, clearCookieDb } from '../lib/cookieDb';

interface Message {
  role: 'user' | 'model';
  text: string;
  file?: {
    name: string;
    type: string;
    size: number;
    base64: string;
  };
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Assalamu Alaikum! 😊 I am **Rin**, your friendly AI Study Assistant for the Unicap website. 📚✨ I am here to help you with your studies, programming, research, assignments, exams, or CGPA planning! How can I support you today? 🌸' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; size: number; base64: string } | null>(null);
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingIntervalRef = useRef<any>(null);

  // Load conversation on mount
  useEffect(() => {
    let savedMessages: Message[] | null = loadFromCookieDb('cgpa_chat_messages');

    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    setIsChatLoaded(true);
  }, []);

  // Save conversation whenever messages change
  useEffect(() => {
    if (!isChatLoaded) return;

    saveToCookieDb('cgpa_chat_messages', messages);
    localStorage.removeItem('cgpa_chat_messages');
  }, [messages, isChatLoaded]);

  const handleClearChat = () => {
    const defaultMessages: Message[] = [
      { role: 'model', text: 'Assalamu Alaikum! 😊 I am **Rin**, your friendly AI Study Assistant for the Unicap website. 📚✨ I am here to help you with your studies, programming, research, assignments, exams, or CGPA planning! How can I support you today? 🌸' }
    ];
    setMessages(defaultMessages);
    
    clearCookieDb('cgpa_chat_messages');
    localStorage.removeItem('cgpa_chat_messages');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const processFile = (file: File) => {
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      try {
        alert("File size is too large. Please select a file smaller than 10MB.");
      } catch (e) {
        console.error("File size is too large. Please select a file smaller than 10MB.");
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        base64: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading || isTyping) return;

    const userMessage = input.trim();
    setInput('');

    const fileToUpload = selectedFile ? {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      base64: selectedFile.base64
    } : undefined;

    setSelectedFile(null);

    // Clear file input element value to allow uploading same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Add user message to UI immediately
    const nextMessage: Message = { role: 'user', text: userMessage, file: fileToUpload };
    const newHistory = [...messages, nextMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: messages,
          message: userMessage,
          file: fileToUpload
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const fullResponse = data.text;

      setIsLoading(false);
      setIsTyping(true);

      // Add empty model message placeholder
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      let currentText = '';
      let index = 0;

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      typingIntervalRef.current = setInterval(() => {
        if (index < fullResponse.length) {
          currentText += fullResponse[index];
          index++;
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: currentText + '▊'
              };
            }
            return updated;
          });
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          // Set final text without the cursor
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: fullResponse
              };
            }
            return updated;
          });
          setIsTyping(false);
        }
      }, 10);
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);

      const errorMessage = 'Sorry, I encountered an error. Please check your API key or try again later.';
      setIsTyping(true);
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      let currentText = '';
      let index = 0;

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      typingIntervalRef.current = setInterval(() => {
        if (index < errorMessage.length) {
          currentText += errorMessage[index];
          index++;
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: currentText + '▊'
              };
            }
            return updated;
          });
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          // Set final error message without the cursor
          setMessages(prev => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: errorMessage
              };
            }
            return updated;
          });
          setIsTyping(false);
        }
      }, 10);
    }
  };

  return (
    <div 
      className="flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center border-2 border-dashed border-indigo-500 m-4 rounded-3xl pointer-events-none">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
            <UploadCloud className="w-10 h-10 text-indigo-500 animate-bounce" />
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">Drop your file here to send to Rin</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Supports images & documents up to 10MB</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 shadow-sm shrink-0 h-[55.7273px]">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-900 shadow-sm shrink-0">
            <img src={rinProfile} alt="Rin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">Rin</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Study Assistant
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/25 transition-all active:scale-95"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" /> Clear Chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 relative">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} max-w-full`}
          >
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm overflow-hidden border ${msg.role === 'user' ? 'bg-slate-800 dark:bg-slate-700 text-white border-transparent' : 'border-indigo-100 dark:border-indigo-900'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <img src={rinProfile} alt="Rin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
              </div>
              <div className={`p-4 rounded-[24px] ${
                msg.role === 'user' 
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-slate-800 dark:text-slate-200 border border-indigo-100/80 dark:border-indigo-900/40 rounded-tr-sm shadow-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60 shadow-sm rounded-tl-sm'
                } text-[15px] leading-relaxed flex flex-col gap-2`}
              >
                {/* Render Attached File */}
                {msg.file && (
                  <div className="max-w-full rounded-xl overflow-hidden self-start">
                    {msg.file.type.startsWith('image/') ? (
                      <div className="relative max-h-64 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-sm">
                        <img src={msg.file.base64} alt={msg.file.name} className="max-w-full max-h-64 object-contain rounded-lg" />
                        <div className="px-2 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] absolute bottom-2 left-2 rounded-md font-medium">
                          {msg.file.name}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/85 dark:border-slate-700 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-indigo-900/40">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 pr-1">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{msg.file.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{(msg.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {msg.text && (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:text-slate-800 dark:prose-pre:text-slate-200">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex justify-start"
          >
            <div className="flex gap-4 max-w-[85%]">
              <div className="shrink-0 w-10 h-10 rounded-full border border-indigo-100 dark:border-indigo-900 flex items-center justify-center shadow-sm overflow-hidden">
                <img src={rinProfile} alt="Rin" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="p-4 rounded-[24px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shadow-sm rounded-tl-sm flex items-center gap-3.5">
                <div className="flex items-center gap-1 px-1 py-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rin is typing...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 h-[85px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
          {/* File Preview Bar */}
          {selectedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 w-max max-w-full shadow-xs"
            >
              {selectedFile.type.startsWith('image/') ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shrink-0">
                  <img src={selectedFile.base64} alt="upload preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 pr-2">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          <div className="flex gap-3 items-center w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.txt,.doc,.docx,.csv"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isTyping}
              className="shrink-0 aspect-square h-[54px] w-[54px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-50 transition-colors shadow-xs"
              title="Attach image or file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedFile ? "Add details about this file..." : "Ask Rin about your grades or study plan..."}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full pl-6 pr-6 py-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white transition-all text-[15px] shadow-sm placeholder-slate-400 dark:placeholder-slate-500"
                disabled={isLoading || isTyping}
              />
            </div>

            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isLoading || isTyping}
              className="shrink-0 aspect-square h-[54px] w-[54px] bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
