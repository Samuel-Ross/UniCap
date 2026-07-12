import { GRADES } from "../lib/ugc";

export function GradeTable() {
  return (
    <div className="glass p-6 rounded-2xl print-break-inside-avoid">
      <h3 className="text-xl font-bold font-['Poppins'] mb-4">UGC Grading System</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 rounded-t-lg">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Numerical Grade</th>
              <th className="px-4 py-3">Letter Grade</th>
              <th className="px-4 py-3 rounded-tr-lg">Grade Point</th>
            </tr>
          </thead>
          <tbody>
            {GRADES.map((g, i) => (
              <tr key={g.letter} className={`border-b dark:border-slate-700 ${i === GRADES.length - 1 ? 'border-none' : ''}`}>
                <td className="px-4 py-2 font-mono">
                  {g.max === 100 ? `${g.min}% and above` : g.min === 0 ? `Less than 40%` : `${g.min}% to less than ${g.max + 0.01}%`}
                </td>
                <td className="px-4 py-2 font-bold">{g.letter}</td>
                <td className="px-4 py-2 font-mono">{g.point.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
