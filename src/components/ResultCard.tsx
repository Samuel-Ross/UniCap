import { Printer, Download, Share2, Copy, Check } from "lucide-react";
import type { StudentInfo } from "../lib/ugc";
import { AnimatedNumber } from "./AnimatedNumber";
import { useState } from "react";

interface ResultCardProps {
  info: StudentInfo;
  cgpa: string;
  earnedCredits: number;
  letterResult: string;
  onInfoChange: (field: keyof StudentInfo, value: string) => void;
}

export function ResultCard({ info, cgpa, earnedCredits, letterResult, onInfoChange }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  
  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error("Print failed:", e);
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(`My CGPA is ${cgpa} (${letterResult}) from ${info.university || 'University'}.`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <div className="glass p-5 sm:p-8 rounded-3xl relative overflow-hidden group">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-['Poppins'] text-gradient mb-1">Official Result</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Bangladesh UGC Grading System</p>
        </div>
        <div className="flex gap-2 no-print items-center">
          {copied && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium animate-fade-in bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-md">
              Copied!
            </span>
          )}
          <button 
            type="button" 
            onClick={handleCopy} 
            className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" 
            title="Copy Result"
          >
            {copied ? (
              <Check className="w-5 h-5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
            ) : (
              <Copy className="w-5 h-5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-4">
          <div className="no-print space-y-3">
            <input 
              type="text" 
              placeholder="Student Name (Optional)" 
              value={info.name} 
              onChange={e => onInfoChange('name', e.target.value)} 
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none px-4 py-3 sm:py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" 
            />
            <input 
              type="text" 
              placeholder="University" 
              value={info.university} 
              onChange={e => onInfoChange('university', e.target.value)} 
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none px-4 py-3 sm:py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" 
            />
            <input 
              type="text" 
              placeholder="Department" 
              value={info.department} 
              onChange={e => onInfoChange('department', e.target.value)} 
              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none px-4 py-3 sm:py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" 
            />
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Semester" 
                value={info.semester} 
                onChange={e => onInfoChange('semester', e.target.value)} 
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none px-4 py-3 sm:py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" 
              />
              <input 
                type="text" 
                placeholder="Session" 
                value={info.session} 
                onChange={e => onInfoChange('session', e.target.value)} 
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none px-4 py-3 sm:py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all" 
              />
            </div>
          </div>

          <div className="print-only hidden space-y-2">
            {info.name && <p><span className="font-semibold w-24 inline-block">Name:</span> {info.name}</p>}
            {info.university && <p><span className="font-semibold w-24 inline-block">University:</span> {info.university}</p>}
            {info.department && <p><span className="font-semibold w-24 inline-block">Department:</span> {info.department}</p>}
            {info.semester && <p><span className="font-semibold w-24 inline-block">Semester:</span> {info.semester}</p>}
            {info.session && <p><span className="font-semibold w-24 inline-block">Session:</span> {info.session}</p>}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
          <p className="text-blue-100 font-medium mb-2 uppercase tracking-wider text-sm">Final CGPA</p>
          <h1 className="text-6xl font-bold font-mono tracking-tighter mb-2">
            <AnimatedNumber value={cgpa} decimals={2} />
          </h1>
          <div className="flex gap-4 items-center mt-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
              Grade: {letterResult}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
              Earned Credits: {earnedCredits}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
