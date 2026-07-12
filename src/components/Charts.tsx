import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, AreaChart, Area, CartesianGrid } from 'recharts';
import type { Subject, Semester } from '../lib/ugc';

interface ChartsProps {
  semesters: Semester[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#64748b'];

export function Charts({ semesters }: ChartsProps) {
  if (semesters.length === 0) return null;

  // Flatten all subjects for global stats, or use for current views
  let allSubjects: Subject[] = [];
  semesters.forEach(s => allSubjects.push(...s.subjects));

  if (allSubjects.length === 0) return null;

  // Prepare Grade Distribution Data
  const gradeCount: Record<string, number> = {};
  allSubjects.forEach(s => {
    if (s.grade && s.grade !== 'N/A') {
      gradeCount[s.grade] = (gradeCount[s.grade] || 0) + 1;
    }
  });
  const pieData = Object.entries(gradeCount).map(([name, value]) => ({ name, value }));

  // Prepare Marks Data
  const marksData = allSubjects.filter(s => s.marks !== undefined).map(s => ({
    name: s.name ? (s.name.substring(0, 10) + (s.name.length > 10 ? '...' : '')) : 'Subject',
    Marks: s.marks
  }));

  // Prepare Credit vs Grade Point Data
  const creditPointData = allSubjects.filter(s => s.gradePoint !== undefined).map((s, idx) => ({
    name: s.name ? (s.name.substring(0, 10) + (s.name.length > 10 ? '...' : '')) : `Sub ${idx + 1}`,
    'Grade Point': s.gradePoint,
    'Credit': s.credit,
  }));

  // Prepare CGPA/SGPA Progression Data
  let cumulativeCredits = 0;
  let cumulativePoints = 0;
  
  const progressionData = semesters.filter(sem => sem.subjects.length > 0 && sem.subjects.some(s => s.gradePoint !== undefined)).map(sem => {
    let semCredits = 0;
    let semPoints = 0;
    
    sem.subjects.forEach(s => {
      if (s.credit > 0 && s.gradePoint !== undefined) {
        semCredits += s.credit;
        semPoints += s.credit * s.gradePoint;
        
        cumulativeCredits += s.credit;
        cumulativePoints += s.credit * s.gradePoint;
      }
    });
    
    const sgpa = semCredits > 0 ? (semPoints / semCredits) : 0;
    const cgpa = cumulativeCredits > 0 ? (cumulativePoints / cumulativeCredits) : 0;
    
    return {
      name: sem.name.length > 15 ? sem.name.substring(0, 12) + '...' : sem.name,
      'SGPA': parseFloat(sgpa.toFixed(2)),
      'CGPA': parseFloat(cgpa.toFixed(2))
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
      
      {progressionData.length > 1 && (
        <div className="glass p-6 rounded-2xl md:col-span-2">
          <h3 className="text-xl font-bold font-['Poppins'] mb-4 text-center">CGPA Progression Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCGPA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 4]} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Area type="monotone" dataKey="CGPA" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCGPA)" activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="SGPA" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass p-6 rounded-2xl">
        <h3 className="text-xl font-bold font-['Poppins'] mb-4 text-center">Grade Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {marksData.length > 0 && (
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-bold font-['Poppins'] mb-4 text-center">Marks Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="Marks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {creditPointData.length > 0 && (
        <div className="glass p-6 rounded-2xl md:col-span-2">
          <h3 className="text-xl font-bold font-['Poppins'] mb-4 text-center">Credit vs Grade Point Performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={creditPointData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis yAxisId="left" domain={[0, 4]} orientation="left" stroke="#3b82f6" label={{ value: 'Grade Point', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Credit', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar yAxisId="left" dataKey="Grade Point" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="Credit" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
