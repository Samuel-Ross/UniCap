import { Plus, Trash2, Copy, BookOpen, Calculator, Award } from "lucide-react";
import type { Subject, InputMode } from "../lib/ugc";
import { GRADES, getGradeFromMarks, getGradeFromLetter } from "../lib/ugc";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SubjectTableProps {
  subjects: Subject[];
  inputMode: InputMode;
  onUpdate: (id: string, field: keyof Subject, value: any) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAdd: () => void;
}

// Custom input component to handle decimal typing smoothly
function NumberInput({ value, onChange, min, max, placeholder, className }: any) {
  const [localVal, setLocalVal] = useState(value?.toString() ?? '');

  useEffect(() => {
    if (value !== parseFloat(localVal) && !(value === undefined && localVal === '')) {
      setLocalVal(value?.toString() ?? '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalVal(v);
    const parsed = parseFloat(v);
    if (v === '') {
      onChange(undefined);
    } else if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      step="any"
      value={localVal}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}

export function SubjectTable({ subjects, inputMode, onUpdate, onRemove, onDuplicate, onAdd }: SubjectTableProps) {
  
  const handleMarksChange = (id: string, value: number | undefined) => {
    if (value === undefined || isNaN(value)) {
      onUpdate(id, 'marks', undefined);
      onUpdate(id, 'grade', undefined);
      onUpdate(id, 'gradePoint', undefined);
      return;
    }
    // Clamp
    const marks = Math.max(0, Math.min(100, value));
    const gradeInfo = getGradeFromMarks(marks);
    onUpdate(id, 'marks', marks);
    onUpdate(id, 'grade', gradeInfo.letter);
    onUpdate(id, 'gradePoint', gradeInfo.point);
  };

  const handleGradeChange = (id: string, letter: string) => {
    if (!letter) {
      onUpdate(id, 'grade', undefined);
      onUpdate(id, 'gradePoint', undefined);
      onUpdate(id, 'marks', undefined);
      return;
    }
    const gradeInfo = getGradeFromLetter(letter);
    onUpdate(id, 'grade', letter);
    onUpdate(id, 'gradePoint', gradeInfo.point);
    onUpdate(id, 'marks', undefined); // Clear marks to prevent mismatch
  };

  return (
    <div className="glass p-4 md:p-6 rounded-[2rem] no-print border border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-200/20 dark:shadow-none">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-['Poppins']">Academic Subjects</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your course grades and credits</p>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap font-medium"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Mobile-optimized Card View (visible on small screens) */}
      <div className="block md:hidden space-y-4">
        {subjects.length === 0 && (
          <div className="flex flex-col items-center justify-center text-slate-400 py-10 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-medium">No subjects added yet.</p>
            <p className="text-xs text-slate-400 mt-1">Tap "Add Subject" to begin.</p>
          </div>
        )}
        <AnimatePresence>
          {subjects.map((sub, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              key={sub.id} 
              className="bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-4"
            >
              {/* Subject Name Input and Actions row */}
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(e) => onUpdate(sub.id, 'name', e.target.value)}
                    placeholder={`Subject ${idx + 1}`}
                    className="w-full bg-white dark:bg-slate-900/40 rounded-xl px-4 py-3 border border-slate-200/60 dark:border-slate-700/50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm font-medium"
                  />
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button 
                    type="button"
                    onClick={() => onDuplicate(sub.id)}
                    className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-xl transition-colors bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 active:scale-95"
                    title="Duplicate"
                  >
                    <Copy className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => onRemove(sub.id)}
                    className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-xl transition-colors bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 active:scale-95"
                    title="Remove"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Grid with Details */}
              <div className="grid grid-cols-12 gap-3">
                {/* Credit input block */}
                <div className="col-span-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 pl-1">
                    Credits
                  </label>
                  <div className="relative flex items-center">
                    <Award className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <NumberInput
                      min="0"
                      value={sub.credit}
                      onChange={(val: number | undefined) => onUpdate(sub.id, 'credit', val ?? 0)}
                      className="w-full bg-white dark:bg-slate-900/40 rounded-xl pl-9 pr-2 py-3 border border-slate-200/60 dark:border-slate-700/50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-100 text-sm"
                    />
                  </div>
                </div>

                {/* Marks or Grade block */}
                <div className="col-span-5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 pl-1">
                    {inputMode === 'marks' ? 'Marks' : 'Grade'}
                  </label>
                  {inputMode === 'marks' ? (
                    <div className="relative flex items-center">
                      <Calculator className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <NumberInput
                        min="0"
                        max="100"
                        value={sub.marks}
                        onChange={(val: number | undefined) => handleMarksChange(sub.id, val)}
                        className="w-full bg-white dark:bg-slate-900/40 rounded-xl pl-9 pr-2 py-3 border border-slate-200/60 dark:border-slate-700/50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-100 text-sm"
                      />
                    </div>
                  ) : (
                    <div className="relative h-[44px] w-full bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all flex items-center">
                      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                        {sub.grade && sub.grade !== 'N/A' ? (
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-black border ${
                            sub.grade === 'F' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/30' :
                            sub.grade?.startsWith('A') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200/60 dark:border-green-800/30' :
                            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/30'
                          }`}>
                            {sub.grade}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 font-medium text-xs">Select</span>
                        )}
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                      <select
                        value={sub.grade || ''}
                        onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                        className="w-full h-full opacity-0 cursor-pointer appearance-none absolute inset-0 z-10 text-black text-sm"
                        style={{ color: '#000000' }}
                      >
                        <option value="" disabled>Select Grade</option>
                        {GRADES.map(g => (
                          <option key={g.letter} value={g.letter}>
                            {g.letter} ({g.point.toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Grade Point readout */}
                <div className="col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 text-center">
                    Point
                  </label>
                  <div className="flex flex-col justify-center items-center py-1 bg-white dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-850/50 min-h-[44px]">
                    <span className={`text-sm font-['Arial'] font-bold ${
                      sub.grade === 'F' ? 'text-red-600 dark:text-red-400' : 
                      sub.grade?.startsWith('A') ? 'text-green-700 dark:text-green-400' :
                      sub.grade ? 'text-blue-700 dark:text-blue-400' :
                      'text-slate-400 dark:text-slate-500'
                    }`}>
                      {sub.gradePoint !== undefined ? sub.gradePoint.toFixed(2) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Standard Desktop Table View (visible on larger screens) */}
      <div className="hidden md:block overflow-x-auto no-scrollbar mask-edges-x pb-4">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-slate-100 dark:border-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <th className="pb-4 pl-2 font-semibold">Subject Name</th>
              <th className="pb-4 font-semibold w-28">Credits</th>
              {inputMode === 'marks' ? (
                <th className="pb-4 font-semibold w-36">Marks (0-100)</th>
              ) : (
                <th className="pb-4 font-semibold w-36">Grade</th>
              )}
              <th className="pb-4 font-semibold w-24">Result</th>
              <th className="pb-4 pr-2 font-semibold w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
            {subjects.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12">
                  <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700">
                      <BookOpen className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p>No subjects added yet. Click "Add Subject" to begin.</p>
                  </div>
                </td>
              </tr>
            )}
            <AnimatePresence>
              {subjects.map((sub, idx) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", bounce: 0.2 }}
                  key={sub.id} 
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                <td className="py-3 pl-2 pr-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => onUpdate(sub.id, 'name', e.target.value)}
                      placeholder={`Subject ${idx + 1}`}
                      className="w-full bg-white dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-200/60 dark:border-slate-700/50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600"
                    />
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="relative flex items-center">
                    <Award className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <NumberInput
                      min="0"
                      value={sub.credit}
                      onChange={(val: number | undefined) => onUpdate(sub.id, 'credit', val ?? 0)}
                      className="w-full bg-white dark:bg-slate-800/50 rounded-xl pl-9 pr-3 py-3 border border-slate-200/60 dark:border-slate-700/50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-600"
                    />
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {inputMode === 'marks' ? (
                    <div className="relative flex items-center">
                      <Calculator className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <NumberInput
                        min="0"
                        max="100"
                        value={sub.marks}
                        onChange={(val: number | undefined) => handleMarksChange(sub.id, val)}
                        className="w-full bg-white dark:bg-slate-800/50 rounded-xl pl-9 pr-3 py-3 border border-slate-200/60 dark:border-slate-700/50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white placeholder-slate-300 dark:placeholder-slate-600"
                      />
                    </div>
                  ) : (
                    <div className="relative h-[48px] w-full bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all flex items-center">
                      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                        {sub.grade && sub.grade !== 'N/A' ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black shadow-sm border ${
                              sub.grade === 'F' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/30' :
                              sub.grade?.startsWith('A') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200/60 dark:border-green-800/30' :
                              'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/30'
                            }`}>
                              {sub.grade}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 font-medium text-sm">Select Grade</span>
                        )}
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                      <select
                        value={sub.grade || ''}
                        onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                        className="w-full h-full opacity-0 cursor-pointer appearance-none absolute inset-0 z-10 text-black"
                        style={{ color: '#000000' }}
                      >
                        <option value="" disabled>Select Grade</option>
                        {GRADES.map(g => (
                          <option key={g.letter} value={g.letter}>
                            {g.letter} ({g.point.toFixed(2)}) {g.min}-{Math.ceil(g.max)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-col justify-center px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700/30 w-fit min-w-[70px]">
                     <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Point</span>
                     <span className={`text-[16px] font-['Arial'] font-bold ${
                       sub.grade === 'F' ? 'text-red-600 dark:text-red-400' : 
                       sub.grade?.startsWith('A') ? 'text-green-700 dark:text-green-400' :
                       sub.grade ? 'text-blue-700 dark:text-blue-400' :
                       'text-slate-500 dark:text-slate-400'
                     }`}>
                       {sub.gradePoint !== undefined ? sub.gradePoint.toFixed(2) : '-'}
                     </span>
                  </div>
                </td>
                <td className="py-3 pr-2 relative z-10">
                  <div className="flex justify-end gap-1.5 opacity-100 md:opacity-40 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={() => onDuplicate(sub.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 dark:hover:text-blue-400 rounded-lg transition-colors bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50"
                      title="Duplicate Subject"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => onRemove(sub.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 dark:hover:text-red-400 rounded-lg transition-colors bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50"
                      title="Remove Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
