import { useState, useEffect, useRef, ChangeEvent } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Upload, Trash2, Calculator, BarChart3, Settings2, Info, Plus, Printer, Award, Sparkles, ChevronRight, Calendar, Database, HardDrive, ShieldCheck, DatabaseBackup, MessageSquare, RotateCcw } from 'lucide-react';
import { SubjectTable } from './components/SubjectTable';
import { ResultCard } from './components/ResultCard';
import { Charts } from './components/Charts';
import { GradeTable } from './components/GradeTable';
import { AnimatedNumber } from './components/AnimatedNumber';
import { AIAssistant } from './components/AIAssistant';
import { AcademicCalendar } from './components/AcademicCalendar';
import { BirdLogo } from './components/BirdLogo';
import type { Subject, StudentInfo, InputMode, Semester } from './lib/ugc';
import { getGradeFromMarks, getGradeFromLetter } from './lib/ugc';
import { saveToCookieDb, loadFromCookieDb, clearCookieDb } from './lib/cookieDb';

export default function App() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string>('');
  
  const [info, setInfo] = useState<StudentInfo>({ name: '', university: '', department: '', semester: '', session: '' });
  const [inputMode, setInputMode] = useState<InputMode>('marks');
  const [activeTab, setActiveTab] = useState<'calculator' | 'charts' | 'info'>('calculator');
  const [currentNav, setCurrentNav] = useState('calculator');
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [printTheme, setPrintTheme] = useState<'modern' | 'professional'>('modern');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetSpinning, setIsResetSpinning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initializeDefault = () => {
    const initialId = Date.now().toString();
    setSemesters([{
      id: initialId, 
      name: 'Semester 1', 
      subjects: [
        { id: '1', name: '', credit: 3 },
        { id: '2', name: '', credit: 3 },
        { id: '3', name: '', credit: 3 }
      ]
    }]);
    setActiveSemesterId(initialId);
  }

  // Load from cookie database engine
  useEffect(() => {
    // Load data from the cookie engine
    let loadedObj: any = loadFromCookieDb('cgpa_data');

    if (loadedObj) {
      try {
        if (loadedObj.semesters && loadedObj.semesters.length > 0) {
          setSemesters(loadedObj.semesters);
          setActiveSemesterId(loadedObj.activeSemesterId || loadedObj.semesters[0].id);
        } else if (loadedObj.subjects) {
          // Migration from single semester
          const initialId = Date.now().toString();
          setSemesters([{ id: initialId, name: 'Semester 1', subjects: loadedObj.subjects }]);
          setActiveSemesterId(initialId);
        } else {
          initializeDefault();
        }
        
        if (loadedObj.info) setInfo(loadedObj.info);
        if (loadedObj.inputMode) setInputMode(loadedObj.inputMode);
        if (loadedObj.printTheme) setPrintTheme(loadedObj.printTheme);
      } catch (e) {
        console.error("Failed to parse saved data", e);
        initializeDefault();
      }
    } else {
      initializeDefault();
    }
    setIsLoaded(true);
  }, []);

  // Save to database engine(s)
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        const payload = { semesters, activeSemesterId, info, inputMode, printTheme };

        const savedSuccessfully = saveToCookieDb('cgpa_data', payload);
        
        // clean up old data if present
        localStorage.removeItem('cgpa_data');
        localStorage.removeItem('cgpa_storage_engine');

        if (savedSuccessfully) {
          setToastMessage(`Progress securely saved in Cookie Database`);
        } else {
          setToastMessage(`Unable to save to Cookie Database (size limit exceeded)`);
        }

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
      }, 1500); // 1.5s debounce

      return () => clearTimeout(timer);
    }
  }, [semesters, activeSemesterId, info, inputMode, printTheme, isLoaded]);

  // Global Calculations
  const calculateResult = () => {
    let globalTotalCredits = 0; // Attempted credits
    let globalEarnedPoints = 0;
    let passedCredits = 0; // Earned credits
    let failedCredits = 0;
    let highestPoint = -1;
    let lowestPoint = 5;
    
    let totalWeightedMarks = 0;
    let creditsWithMarks = 0;
    let validSubjectsCount = 0;

    let activeEarnedPoints = 0;
    let activeTotalCredits = 0;

    semesters.forEach(semester => {
      const validSubjects = semester.subjects.filter(s => s.credit > 0 && s.gradePoint !== undefined);
      
      validSubjects.forEach(s => {
        globalTotalCredits += s.credit;
        globalEarnedPoints += s.credit * s.gradePoint!;
        
        if (semester.id === activeSemesterId) {
          activeTotalCredits += s.credit;
          activeEarnedPoints += s.credit * s.gradePoint!;
        }

        if (s.gradePoint! > 0) passedCredits += s.credit;
        else failedCredits += s.credit;

        if (s.gradePoint! > highestPoint) highestPoint = s.gradePoint!;
        if (s.gradePoint! < lowestPoint) lowestPoint = s.gradePoint!;

        if (s.marks !== undefined) {
          totalWeightedMarks += s.marks * s.credit;
          creditsWithMarks += s.credit;
        }
        
        validSubjectsCount++;
      });
    });

    // Safely round to 2 decimal places to prevent float errors (e.g. 3.745 -> 3.75)
    const safeRound = (val: number) => (Math.round((val + Number.EPSILON) * 100) / 100).toFixed(2);
    
    const cgpa = globalTotalCredits > 0 ? safeRound(globalEarnedPoints / globalTotalCredits) : '0.00';
    const sgpa = activeTotalCredits > 0 ? safeRound(activeEarnedPoints / activeTotalCredits) : '0.00';
    
    let letterResult = 'N/A';
    
    if (globalTotalCredits > 0) {
       const numCgpa = parseFloat(cgpa);
       if (numCgpa === 4.00) letterResult = 'A+';
       else if (numCgpa >= 3.75) letterResult = 'A';
       else if (numCgpa >= 3.50) letterResult = 'A-';
       else if (numCgpa >= 3.25) letterResult = 'B+';
       else if (numCgpa >= 3.00) letterResult = 'B';
       else if (numCgpa >= 2.75) letterResult = 'B-';
       else if (numCgpa >= 2.50) letterResult = 'C+';
       else if (numCgpa >= 2.25) letterResult = 'C';
       else if (numCgpa >= 2.00) letterResult = 'D';
       else letterResult = 'F';
    }

    if (cgpa === '4.00' && validSubjectsCount > 0 && isLoaded) {
       confetti({
         particleCount: 100,
         spread: 70,
         origin: { y: 0.6 }
       });
    }

    return {
      cgpa,
      sgpa,
      letterResult,
      totalCredits: globalTotalCredits,
      activeTotalCredits,
      passedCredits,
      failedCredits,
      highestPoint: highestPoint === -1 ? 0 : highestPoint,
      lowestPoint: lowestPoint === 5 ? 0 : lowestPoint,
      averageMarks: creditsWithMarks > 0 ? (totalWeightedMarks / creditsWithMarks).toFixed(1) : 'N/A',
      totalSubjects: validSubjectsCount
    };
  };

  const result = calculateResult();
  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const activeSubjects = activeSemester?.subjects || [];

  const handleAddSemester = () => {
    const newId = Date.now().toString();
    setSemesters([...semesters, { id: newId, name: `Semester ${semesters.length + 1}`, subjects: [] }]);
    setActiveSemesterId(newId);
  };

  const handleRemoveSemester = (id: string) => {
    if (semesters.length === 1) {
       setToastMessage("You must have at least one semester.");
       return;
    }
    
    const updated = semesters.filter(s => s.id !== id);
    setSemesters(updated);
    if (activeSemesterId === id) {
      setActiveSemesterId(updated[updated.length - 1].id);
    }
    setToastMessage("Semester deleted successfully");
  };

  const handleUpdateSemesterName = (id: string, name: string) => {
    setSemesters(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const handleAddSubject = () => {
    setSemesters(prev => prev.map(sem => 
      sem.id === activeSemesterId 
        ? { ...sem, subjects: [...sem.subjects, { id: crypto.randomUUID(), name: '', credit: 3 }] }
        : sem
    ));
  };

  const handleRemoveSubject = (id: string) => {
    setSemesters(prev => prev.map(sem => 
      sem.id === activeSemesterId 
        ? { ...sem, subjects: sem.subjects.filter(s => s.id !== id) }
        : sem
    ));
  };

  const handleUpdateSubject = (id: string, field: keyof Subject, value: any) => {
    setSemesters(prev => prev.map(sem => 
      sem.id === activeSemesterId 
        ? { ...sem, subjects: sem.subjects.map(s => s.id === id ? { ...s, [field]: value } : s) }
        : sem
    ));
  };

  const handleDuplicateSubject = (id: string) => {
    setSemesters(prev => prev.map(sem => {
      if (sem.id === activeSemesterId) {
        const sub = sem.subjects.find(s => s.id === id);
        if (sub) {
          return { ...sem, subjects: [...sem.subjects, { ...sub, id: crypto.randomUUID(), name: sub.name ? `${sub.name} (Copy)` : '' }] };
        }
      }
      return sem;
    }));
  };

  const handleResetCalculator = () => {
    setIsResetSpinning(true);
    setTimeout(() => setIsResetSpinning(false), 600);
    
    const initialId = Date.now().toString();
    setSemesters([{ id: initialId, name: 'Semester 1', subjects: [] }]);
    setActiveSemesterId(initialId);
    setInfo({ name: '', university: '', department: '', semester: '', session: '' });
    localStorage.removeItem('cgpa_data');
    localStorage.removeItem('cgpa_chat_messages');
    clearCookieDb('cgpa_data');
    clearCookieDb('cgpa_chat_messages');
    setToastMessage("Calculator reset successfully");
  };

  const exportCSV = () => {
    const headers = ['Semester', 'Subject Name', 'Credit', 'Marks', 'Grade', 'Grade Point'];
    const rows: any[] = [];
    
    semesters.forEach(sem => {
      sem.subjects.forEach(s => {
        rows.push([
          `"${sem.name}"`,
          `"${s.name || ''}"`,
          s.credit,
          s.marks !== undefined ? s.marks : '',
          `"${s.grade || ''}"`,
          s.gradePoint !== undefined ? s.gradePoint : ''
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cgpa_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const rows = text.split('\n').map(row => {
         const matches = row.match(/(\\.|[^",\s]+|"(?:\\.|[^\\"])*")/g);
         return matches?.map(m => m.replace(/^"|"$/g, '').trim()) || [];
      }).filter(row => row.length >= 3); 

      if (rows.length === 0) return;

      const hasHeader = rows[0][0]?.toLowerCase().includes('semester');
      const dataRows = hasHeader ? rows.slice(1) : rows;
      
      if (dataRows.length === 0) return;

      const newSemesters: Record<string, Semester> = {};
      
      dataRows.forEach(row => {
         const semName = row[0] || 'Semester 1';
         const subName = row[1] || '';
         const credit = parseFloat(row[2]) || 3;
         const marks = row[3] ? parseFloat(row[3]) : undefined;
         const grade = row[4] || '';
         
         if (!newSemesters[semName]) {
            newSemesters[semName] = {
               id: crypto.randomUUID(),
               name: semName,
               subjects: []
            };
         }
         
         let finalGrade = grade;
         let finalPoint = 0;
         let finalMarks = isNaN(marks as number) ? undefined : marks;

         if (finalMarks !== undefined) {
            const gInfo = getGradeFromMarks(finalMarks);
            finalGrade = gInfo.letter;
            finalPoint = gInfo.point;
         } else if (grade) {
            const gInfo = getGradeFromLetter(grade);
            finalGrade = gInfo.letter;
            finalPoint = gInfo.point;
         }

         newSemesters[semName].subjects.push({
            id: crypto.randomUUID(),
            name: subName,
            credit: credit,
            marks: finalMarks,
            grade: finalGrade,
            gradePoint: finalPoint
         });
      });

      const semArray = Object.values(newSemesters);
      if (semArray.length > 0) {
         setSemesters(semArray);
         setActiveSemesterId(semArray[0].id);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className={`font-sans transition-colors selection:bg-blue-500/30 flex flex-col ${printTheme === 'professional' ? 'print-professional' : ''} ${currentNav === 'ai' ? 'h-[100dvh] p-0 overflow-hidden' : 'min-h-screen p-4 md:p-8'}`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[9999] bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-100 flex items-center gap-3 text-sm font-semibold"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none no-print">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className={`mx-auto w-full flex-1 flex flex-col ${currentNav === 'ai' ? 'max-w-none p-0 min-h-0 lg:flex-row lg:gap-6 lg:h-screen lg:overflow-hidden' : 'max-w-screen-2xl lg:flex-row lg:gap-8 lg:items-start'}`}>
        
        {/* Sticky Navigation Bar */}
        <nav className={`no-print print-hidden flex-none ${currentNav === 'ai' ? 'px-4 pt-4 mb-0 lg:p-0 lg:w-[200px] lg:h-full lg:sticky lg:top-0' : 'sticky top-4 z-50 mb-8 lg:mb-0 lg:top-8 lg:w-[200px] lg:h-[calc(100vh-4rem)] lg:shrink-0'}`}>
          <div className="glass px-2 lg:px-4 py-3 lg:py-6 rounded-2xl lg:rounded-3xl flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start lg:h-full shadow-sm lg:gap-6 w-[200px] lg:w-full">
            <div className="flex items-center gap-2 mr-3 lg:mr-0 flex-none lg:pb-4 lg:border-b lg:border-slate-200/50 dark:lg:border-slate-700/50 lg:w-full lg:justify-center">
              <BirdLogo className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="font-bold font-['Poppins'] tracking-tight text-slate-800 dark:text-white text-base hidden sm:inline-block lg:block">UniCap</span>
            </div>
            <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-2 overflow-x-auto lg:overflow-visible no-scrollbar mask-edges pr-4 lg:pr-0 flex-1 lg:w-full lg:gap-1.5">
              {[
                { id: 'home', label: '🏠 Home' },
                { id: 'calculator', label: '🧮 Calculator' },
                { id: 'ai', label: '🤖 AI' },
                { id: 'calendar', label: '📅 Calendar' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentNav(item.id)}
                  className={`relative px-4 py-2 lg:py-3 lg:px-4 rounded-xl text-sm font-semibold transition-colors text-left whitespace-nowrap lg:w-full ${currentNav === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'} active:scale-[0.98]`}
                >
                  {currentNav === item.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-blue-50/80 dark:bg-slate-800/80 shadow-sm rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className={`flex-1 min-w-0 w-full flex flex-col ${currentNav === 'ai' ? 'min-h-0 h-full lg:overflow-hidden' : 'space-y-8'}`}>
          <AnimatePresence mode="wait">
          {currentNav === 'calculator' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Header */}
              <header className="flex flex-col md:flex-row justify-between items-center gap-4 glass p-4 md:px-8 rounded-3xl no-print">
                <div className="flex items-center gap-3">
                  <BirdLogo className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h1 className="text-xl font-bold font-['Poppins']">UniCap</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Offline & Secure</p>
                  </div>
                </div>
                <div className="flex gap-2 relative z-10">
                  <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Import CSV"><Upload className="w-5 h-5" /></button>
                  <button type="button" onClick={exportCSV} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Export CSV"><Download className="w-5 h-5" /></button>
                  <button type="button" onClick={() => { try { window.print(); } catch(e) { setToastMessage("Please open in new tab to print"); } }} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Print to PDF"><Printer className="w-5 h-5" /></button>
                  <button type="button" onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Settings"><Settings2 className="w-5 h-5" /></button>
                  <button id="reset-calculator-btn" type="button" onClick={handleResetCalculator} className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100/80 text-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40 rounded-xl text-xs font-bold transition-all active:scale-[0.98]" title="Reset Calculator">
                    <motion.div
                      animate={{ rotate: isResetSpinning ? -360 : 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="flex items-center justify-center"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.div>
                    <span>Reset</span>
                  </button>
                </div>
              </header>

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-8 min-w-0">
                  
                  {/* Print Header */}
                  <div className="print-only hidden text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Academic Result</h1>
                    <p className="text-gray-500">Generated by UniCap</p>
                  </div>

                  <ResultCard 
                  info={info} 
                  onInfoChange={(f, v) => setInfo({...info, [f]: v})} 
                  cgpa={result.cgpa}
                  earnedCredits={result.passedCredits}
                  letterResult={result.letterResult}
                />

                {/* Navigation Tabs */}
                <div className="flex p-1 glass-panel rounded-2xl no-print gap-1 w-full md:w-max h-[85px] items-center">
                  <button 
                    onClick={() => setActiveTab('calculator')}
                    className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 ${activeTab === 'calculator' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {activeTab === 'calculator' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white dark:bg-slate-700 shadow rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Calculator className="relative z-10 w-4 h-4" /> <span className="relative z-10">Calculator</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('charts')}
                    className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 ${activeTab === 'charts' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {activeTab === 'charts' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white dark:bg-slate-700 shadow rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <BarChart3 className="relative z-10 w-4 h-4" /> <span className="relative z-10">Charts</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('info')}
                    className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 ${activeTab === 'info' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {activeTab === 'info' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white dark:bg-slate-700 shadow rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Info className="relative z-10 w-4 h-4" /> <span className="relative z-10">Grading Info</span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* Semester Management */}
                  {activeTab === 'calculator' && (
                    <motion.div
                      key="calc-tab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div className="glass p-5 rounded-3xl no-print flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-slate-700 dark:text-slate-300 font-['Poppins']">Manage Semesters</h3>
                          {/* SGPA display for active semester */}
                          <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-2 whitespace-nowrap shadow-inner">
                            <span className="text-xs font-medium text-slate-500">Current SGPA:</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                              <AnimatedNumber value={result.sgpa} decimals={2} />
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                          <AnimatePresence mode="popLayout">
                            {semesters.map(sem => (
                              <motion.div 
                                key={sem.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`flex items-center gap-2 px-4 py-3 sm:py-2 rounded-xl transition-all ${activeSemesterId === sem.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'} whitespace-nowrap`}
                              >
                                  <input
                                    type="text"
                                    value={sem.name}
                                    onChange={(e) => handleUpdateSemesterName(sem.id, e.target.value)}
                                    className={`bg-transparent border-none outline-none focus:ring-2 focus:ring-white/50 rounded px-1 w-24 text-sm font-medium transition-all ${activeSemesterId === sem.id ? 'text-white placeholder-white/70' : ''}`}
                                    onClick={() => setActiveSemesterId(sem.id)}
                                  />
                                  {semesters.length > 1 && (
                                    <button onClick={() => handleRemoveSemester(sem.id)} className={`p-2 rounded-full transition-colors ${activeSemesterId === sem.id ? 'hover:bg-white/20 text-blue-100 hover:text-white' : 'hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-400 hover:text-red-500'}`}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <button onClick={handleAddSemester} className="flex items-center gap-2 px-4 py-3 sm:py-2.5 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all font-medium text-sm border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95">
                            <Plus className="w-4 h-4" /> Add Semester
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                        <input
                          type="text"
                          placeholder="Search subjects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all"
                        />
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
                          <button 
                            onClick={() => setInputMode('marks')}
                            className={`relative px-4 py-1.5 text-sm rounded-lg transition-colors flex-1 md:flex-none ${inputMode === 'marks' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500'}`}
                          >
                            {inputMode === 'marks' && (
                              <motion.div
                                layoutId="inputMode"
                                className="absolute inset-0 bg-white dark:bg-slate-700 shadow rounded-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Marks Mode</span>
                          </button>
                          <button 
                            onClick={() => setInputMode('grade')}
                            className={`relative px-4 py-1.5 text-sm rounded-lg transition-colors flex-1 md:flex-none ${inputMode === 'grade' ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500'}`}
                          >
                            {inputMode === 'grade' && (
                              <motion.div
                                layoutId="inputMode"
                                className="absolute inset-0 bg-white dark:bg-slate-700 shadow rounded-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">Grade Mode</span>
                          </button>
                        </div>
                      </div>

                      <div className="print-only-block">
                        <SubjectTable 
                          subjects={activeSubjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                          inputMode={inputMode}
                          onAdd={handleAddSubject}
                          onRemove={handleRemoveSubject}
                          onUpdate={handleUpdateSubject}
                          onDuplicate={handleDuplicateSubject}
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'charts' && (
                    <motion.div
                      key="charts-tab"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Charts semesters={semesters} />
                    </motion.div>
                  )}

                  {activeTab === 'info' && (
                    <motion.div
                      key="info-tab"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GradeTable />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Print Table View */}
                <div className="hidden print-only print-break-inside-avoid">
                  {semesters.map((sem, semIdx) => (
                    <div key={sem.id} className="mb-8">
                      <h3 className="text-xl font-bold mb-4 border-b pb-2">{sem.name}</h3>
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-100">
                            <th className="py-2 px-4">Subject</th>
                            <th className="py-2 px-4">Credit</th>
                            <th className="py-2 px-4">Marks</th>
                            <th className="py-2 px-4">Grade</th>
                            <th className="py-2 px-4">Point</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.subjects.map((sub, i) => (
                            <tr key={i} className="border-b">
                              <td className="py-2 px-4">{sub.name || `Subject ${i+1}`}</td>
                              <td className="py-2 px-4">{sub.credit}</td>
                              <td className="py-2 px-4">{sub.marks !== undefined ? sub.marks : '-'}</td>
                              <td className="py-2 px-4 font-bold">{sub.grade || '-'}</td>
                              <td className="py-2 px-4">{sub.gradePoint !== undefined ? sub.gradePoint.toFixed(2) : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>

                <div className="w-full lg:w-[220px] shrink-0 space-y-6">
                {/* Statistics Sidebar */}
                <div className="glass p-6 rounded-3xl sticky top-8 print-break-inside-avoid w-full">
                  <h3 className="text-xl font-bold font-['Poppins'] mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Statistics
                  </h3>
                  
                  <div className="space-y-4">
                    <StatRow label="Total Subjects" value={result.totalSubjects.toString()} />
                    <div className="h-px bg-slate-200 dark:bg-slate-700/50 w-full" />
                    <StatRow label="Total Credits" value={result.totalCredits.toString()} />
                    <StatRow label="Passed Credits" value={result.passedCredits.toString()} color="text-green-500" />
                    <StatRow label="Failed Credits" value={result.failedCredits.toString()} color="text-red-500" />
                    <div className="h-px bg-slate-200 dark:bg-slate-700/50 w-full" />
                    <StatRow label="Highest Grade Pt" value={result.highestPoint.toFixed(2)} />
                    <StatRow label="Lowest Grade Pt" value={result.lowestPoint.toFixed(2)} />
                    {inputMode === 'marks' && (
                      <StatRow label="Average Marks" value={result.averageMarks} />
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

          {currentNav === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              <AIAssistant />
            </motion.div>
          )}

          {currentNav === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="relative overflow-hidden glass rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-12 shadow-xl border border-white/40 dark:border-slate-700/50">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-white/20 dark:from-slate-900/20 to-transparent pointer-events-none"></div>
                
                <div className="flex-1 space-y-6 z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                    <BirdLogo className="w-16 h-14 text-blue-600 dark:text-blue-400 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-800 shadow-lg shadow-blue-500/10 border border-slate-100 dark:border-slate-700" />
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase border border-blue-100 dark:border-blue-800/50 shadow-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      BD UGC Standard
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-['Poppins'] tracking-tight text-slate-800 dark:text-white leading-[1.1]">
                    Master Your <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">Academic Journey.</span>
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed">
                    Track your grades, analyze your performance, and predict your future results with our beautiful, offline-first CGPA analyzer.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <button onClick={() => setCurrentNav('ai')} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group">
                      <Sparkles className="w-5 h-5 text-white group-hover:animate-pulse" />
                      Try AI Assistant
                    </button>
                  </div>
                </div>
                
                {/* Quick Stats Card (Unique Element) */}
                <div className="w-full md:w-auto flex-none z-10 relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-8 md:p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-w-[280px]">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Overall CGPA</p>
                      <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600 mb-4 tracking-tighter">
                        <AnimatedNumber value={result.cgpa} decimals={2} />
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">
                        <Award className="w-4 h-4 text-amber-500" />
                        {result.letterResult} Grade
                      </div>
                      
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-6"></div>
                      
                      <div className="flex justify-between w-full text-center px-4">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Credits</p>
                            <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{result.passedCredits}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Semesters</p>
                            <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{semesters.length}</p>
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* Feature Grid */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <motion.button 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  onClick={() => setCurrentNav('calculator')} 
                  className="glass p-8 rounded-3xl text-left hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all hover:-translate-y-1 hover:shadow-xl group border border-white/40 dark:border-slate-700/50"
                >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                      <Calculator className="w-7 h-7 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 font-['Poppins']">Smart Calculator</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Enter marks or grades. Supports multiple semesters and provides real-time CGPA calculations.</p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      Try it now <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </motion.button>
                <motion.button 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  onClick={() => setCurrentNav('ai')} 
                  className="glass p-8 rounded-3xl text-left hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all hover:-translate-y-1 hover:shadow-xl group border border-white/40 dark:border-slate-700/50 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Sparkles className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner relative z-10">
                      <Sparkles className="w-7 h-7 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 font-['Poppins'] relative z-10">AI Assistant</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 relative z-10">Ask questions about grading policies, course planning, or get smart academic advice.</p>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-bold group-hover:translate-x-1 transition-transform relative z-10">
                      Ask AI <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </motion.button>
                <motion.button 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  onClick={() => setCurrentNav('calendar')} 
                  className="glass p-8 rounded-3xl text-left hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all hover:-translate-y-1 hover:shadow-xl group border border-white/40 dark:border-slate-700/50"
                >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                      <Calendar className="w-7 h-7 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 font-['Poppins']">Academic Calendar</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">View upcoming deadlines, holidays, and important academic dates all in one place.</p>
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      View Calendar <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {currentNav === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <AcademicCalendar />
            </motion.div>
          )}
          </AnimatePresence>

          {/* Footer */}
          {currentNav !== 'ai' && (
            <footer className="text-center py-12 text-sm text-slate-500 dark:text-slate-400 no-print flex-none">
              <p>&copy; 2026 OREV AFEL. All Rights Reserved.</p>
            </footer>
          )}
        </div>

      </div>

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        printTheme={printTheme} 
        setPrintTheme={setPrintTheme} 
      />
    </div>
  );
}

function SettingsDialog({ 
  isOpen, 
  onClose, 
  printTheme, 
  setPrintTheme
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  printTheme: string, 
  setPrintTheme: (t: any) => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-xl font-bold mb-4 font-['Poppins']">Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Print & Export Theme</label>
                <div className="flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={() => setPrintTheme('modern')}
                    className={`p-3 rounded-xl border text-left transition-all ${printTheme === 'modern' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className="font-semibold">Modern</div>
                    <div className="text-xs opacity-70">Colorful, contemporary design with rounded corners.</div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPrintTheme('professional')}
                    className={`p-3 rounded-xl border text-left transition-all ${printTheme === 'professional' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className="font-semibold">Professional</div>
                    <div className="text-xs opacity-70">Minimalist, black & white, formal serif typography for official use.</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={onClose} className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-xl hover:opacity-90 transition-opacity">
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatRow({ label, value, color = "" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 dark:text-slate-400 text-sm">{label}</span>
      <span className={`font-semibold font-mono ${color}`}>{value}</span>
    </div>
  )
}
