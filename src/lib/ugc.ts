export interface Subject {
  id: string;
  name: string;
  credit: number;
  marks?: number;
  grade?: string;
  gradePoint?: number;
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface StudentInfo {
  name: string;
  university: string;
  department: string;
  semester: string;
  session: string;
}

export type InputMode = 'marks' | 'grade';

export const GRADES = [
  { letter: 'A+', min: 80, max: 100, point: 4.00 },
  { letter: 'A', min: 75, max: 79.99, point: 3.75 },
  { letter: 'A-', min: 70, max: 74.99, point: 3.50 },
  { letter: 'B+', min: 65, max: 69.99, point: 3.25 },
  { letter: 'B', min: 60, max: 64.99, point: 3.00 },
  { letter: 'B-', min: 55, max: 59.99, point: 2.75 },
  { letter: 'C+', min: 50, max: 54.99, point: 2.50 },
  { letter: 'C', min: 45, max: 49.99, point: 2.25 },
  { letter: 'D', min: 40, max: 44.99, point: 2.00 },
  { letter: 'F', min: 0, max: 39.99, point: 0.00 },
];

export function getGradeFromMarks(marks: number): { letter: string; point: number } {
  if (marks < 0 || marks > 100) return { letter: 'N/A', point: 0 };
  const sortedGrades = [...GRADES].sort((a, b) => b.min - a.min);
  const grade = sortedGrades.find(g => marks >= g.min);
  return grade ? { letter: grade.letter, point: grade.point } : { letter: 'F', point: 0 };
}

export function getGradeFromLetter(letter: string): { letter: string; point: number } {
  const grade = GRADES.find(g => g.letter === letter);
  return grade ? { letter: grade.letter, point: grade.point } : { letter: 'N/A', point: 0 };
}
