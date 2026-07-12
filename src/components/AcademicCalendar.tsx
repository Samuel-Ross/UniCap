import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  Tag, 
  AlertCircle, 
  Check, 
  CalendarRange,
  Bell
} from 'lucide-react';

interface AcademicEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: 'exam' | 'assignment' | 'quiz' | 'holiday' | 'personal';
  time?: string;
  description?: string;
}

const CATEGORY_STYLES = {
  exam: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-100 dark:border-red-900/30',
    dot: 'bg-red-500',
    label: 'Exam / Class Test'
  },
  assignment: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/30',
    dot: 'bg-amber-500',
    label: 'Assignment / Project'
  },
  quiz: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/30',
    dot: 'bg-purple-500',
    label: 'Quiz / Presentation'
  },
  holiday: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    dot: 'bg-emerald-500',
    label: 'Academic Holiday'
  },
  personal: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/30',
    dot: 'bg-blue-500',
    label: 'Study Goal / Class'
  }
};

const BANGLADESH_EVENTS: AcademicEvent[] = [
  // National & Public Holidays of Bangladesh
  {
    id: 'bd-1',
    title: 'Language Martyrs Day (International Mother Language Day)',
    date: `${new Date().getFullYear()}-02-21`,
    category: 'holiday',
    description: 'National holiday paying tribute to the martyrs of the historic Language Movement of 1952.'
  },
  {
    id: 'bd-2',
    title: "Sheikh Mujibur Rahman's Birth Anniversary",
    date: `${new Date().getFullYear()}-03-17`,
    category: 'holiday',
    description: "National Children's Day & birth anniversary of the Father of the Nation Bangabandhu Sheikh Mujibur Rahman."
  },
  {
    id: 'bd-3',
    title: 'Independence Day of Bangladesh',
    date: `${new Date().getFullYear()}-03-26`,
    category: 'holiday',
    description: 'National holiday celebrating the declaration of independence of Bangladesh.'
  },
  {
    id: 'bd-4',
    title: 'Pohela Boishakh (Bengali New Year)',
    date: `${new Date().getFullYear()}-04-14`,
    category: 'holiday',
    description: 'National festival celebrating the first day of the Bengali calendar (1st of Boishakh).'
  },
  {
    id: 'bd-5',
    title: 'May Day (Workers Day)',
    date: `${new Date().getFullYear()}-05-01`,
    category: 'holiday',
    description: 'International Workers Day public holiday.'
  },
  {
    id: 'bd-6',
    title: 'National Mourning Day',
    date: `${new Date().getFullYear()}-08-15`,
    category: 'holiday',
    description: 'National mourning day paying tribute to Bangabandhu Sheikh Mujibur Rahman and his family members.'
  },
  {
    id: 'bd-7',
    title: 'Victory Day of Bangladesh',
    date: `${new Date().getFullYear()}-12-16`,
    category: 'holiday',
    description: 'National holiday celebrating our historical victory in the Liberation War of 1971.'
  },
  {
    id: 'bd-8',
    title: 'Christmas Day',
    date: `${new Date().getFullYear()}-12-25`,
    category: 'holiday',
    description: 'Celebration of the birth of Jesus Christ, a nationwide public holiday.'
  },
  
  // 2026 Specific / Muslim & Hindu Holidays in Bangladesh
  {
    id: 'bd-9',
    title: 'Shab-e-Barat',
    date: `${new Date().getFullYear()}-02-04`,
    category: 'holiday',
    description: 'National optional holiday celebrating Shab-e-Barat (approximate date).'
  },
  {
    id: 'bd-10',
    title: 'Laylat al-Qadr',
    date: `${new Date().getFullYear()}-03-17`,
    category: 'holiday',
    description: 'Holy night of Laylat al-Qadr (approximate holiday).'
  },
  {
    id: 'bd-11',
    title: 'Eid-ul-Fitr Holiday (Day 1)',
    date: `${new Date().getFullYear()}-03-19`,
    category: 'holiday',
    description: 'Official Eid-ul-Fitr festival vacation starts.'
  },
  {
    id: 'bd-12',
    title: 'Eid-ul-Fitr (Main Day)',
    date: `${new Date().getFullYear()}-03-20`,
    category: 'holiday',
    description: 'Eid-ul-Fitr national festival celebration.'
  },
  {
    id: 'bd-13',
    title: 'Eid-ul-Fitr Holiday (Day 3)',
    date: `${new Date().getFullYear()}-03-21`,
    category: 'holiday',
    description: 'Eid-ul-Fitr official public vacation.'
  },
  {
    id: 'bd-14',
    title: 'Buddha Purnima',
    date: `${new Date().getFullYear()}-05-01`,
    category: 'holiday',
    description: 'National holiday celebrating the birth, enlightenment, and death of Gautama Buddha.'
  },
  {
    id: 'bd-15',
    title: 'Eid-ul-Azha Holiday (Day 1)',
    date: `${new Date().getFullYear()}-05-26`,
    category: 'holiday',
    description: 'Eid-ul-Azha official university vacation starts.'
  },
  {
    id: 'bd-16',
    title: 'Eid-ul-Azha (Main Day)',
    date: `${new Date().getFullYear()}-05-27`,
    category: 'holiday',
    description: 'Eid-ul-Azha national festival celebration.'
  },
  {
    id: 'bd-17',
    title: 'Eid-ul-Azha Holiday (Day 3)',
    date: `${new Date().getFullYear()}-05-28`,
    category: 'holiday',
    description: 'Eid-ul-Azha official public vacation.'
  },
  {
    id: 'bd-18',
    title: 'Ashura Holiday',
    date: `${new Date().getFullYear()}-07-26`,
    category: 'holiday',
    description: 'Holy Day of Ashura national holiday (approximate date).'
  },
  {
    id: 'bd-19',
    title: 'Janmashtami Holiday',
    date: `${new Date().getFullYear()}-09-04`,
    category: 'holiday',
    description: 'Birth anniversary of Lord Sri Krishna, national public holiday.'
  },
  {
    id: 'bd-20',
    title: 'Eid-e-Miladunnabi',
    date: `${new Date().getFullYear()}-09-15`,
    category: 'holiday',
    description: 'Birth and demise anniversary of Prophet Muhammad (SM), national public holiday.'
  },
  {
    id: 'bd-21',
    title: 'Durga Puja (Bijoya Dashami)',
    date: `${new Date().getFullYear()}-10-21`,
    category: 'holiday',
    description: 'Largest Hindu festival celebration and national public holiday.'
  },

  // Academic Landmarks in Bangladesh
  {
    id: 'bd-acad-1',
    title: 'SSC Examination Commencement',
    date: `${new Date().getFullYear()}-02-15`,
    category: 'exam',
    description: 'Secondary School Certificate exams starting across all education boards.'
  },
  {
    id: 'bd-acad-2',
    title: 'HSC Examination Commencement',
    date: `${new Date().getFullYear()}-06-30`,
    category: 'exam',
    description: 'Higher Secondary Certificate board examinations begin.'
  },
  {
    id: 'bd-acad-3',
    title: 'University Admission Season Kickoff',
    date: `${new Date().getFullYear()}-11-01`,
    category: 'personal',
    description: 'Release of centralized and individual university admission applications.'
  }
];

const DEFAULT_EVENTS: AcademicEvent[] = [
  {
    id: 'def-1',
    title: 'Midterm Exams Week',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    category: 'exam',
    time: '10:00 AM',
    description: 'Central midsemester assessments for all core departments.'
  },
  {
    id: 'def-3',
    title: 'Course Registration Deadline',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
    category: 'personal',
    time: '04:30 PM',
    description: 'Complete registration and advisor approval on portal.'
  },
  {
    id: 'def-4',
    title: 'Assignment 1 Submission',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
    category: 'assignment',
    time: '11:59 PM',
    description: 'Submit PDF report and code repository links via LMS.'
  },
  {
    id: 'def-5',
    title: 'Class Presentation on AI',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 22).toISOString().split('T')[0],
    category: 'quiz',
    time: '11:30 AM',
    description: '10-minute slide deck presentation on Generative AI capabilities.'
  },
  ...BANGLADESH_EVENTS
];

export function AcademicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Form State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AcademicEvent['category']>('personal');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Load and save from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('academic_calendar_events');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        setEvents(DEFAULT_EVENTS);
      }
    } else {
      setEvents(DEFAULT_EVENTS);
      localStorage.setItem('academic_calendar_events', JSON.stringify(DEFAULT_EVENTS));
    }
  }, []);

  const saveEvents = (newEventsList: AcademicEvent[]) => {
    setEvents(newEventsList);
    localStorage.setItem('academic_calendar_events', JSON.stringify(newEventsList));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const newEvent: AcademicEvent = {
      id: Math.random().toString(36).substring(7),
      title: newTitle.trim(),
      date: newDate,
      category: newCategory,
      time: newTime || undefined,
      description: newDescription.trim() || undefined
    };

    const updated = [...events, newEvent];
    saveEvents(updated);

    // Reset Form
    setNewTitle('');
    setNewTime('');
    setNewDescription('');
    setIsAddFormOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    saveEvents(updated);
  };

  const importBangladeshEvents = () => {
    const newEvents = [...events];
    let addedCount = 0;
    BANGLADESH_EVENTS.forEach(bdEvent => {
      const exists = newEvents.some(e => e.id === bdEvent.id || (e.date === bdEvent.date && e.title.toLowerCase() === bdEvent.title.toLowerCase()));
      if (!exists) {
        newEvents.push(bdEvent);
        addedCount++;
      }
    });
    saveEvents(newEvents);
    setToastMessage(`Successfully imported ${addedCount} Bangladesh national events & holidays!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Month navigation helpers
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Generate date array for monthly grid
  const days = [];
  // Days from previous month for spacing
  const prevMonthDaysCount = firstDayIndex;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevMonthIndex = month === 0 ? 11 : month - 1;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  for (let i = prevMonthDaysCount - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const formattedDateStr = `${prevMonthYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, isCurrentMonth: false, dateString: formattedDateStr });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, isCurrentMonth: true, dateString: formattedDateStr });
  }

  // Next month filler days to align perfectly with a standard 7-column calendar
  const totalSlotsNeeded = Math.ceil(days.length / 7) * 7;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const nextMonthIndex = month === 11 ? 0 : month + 1;
  let fillerDay = 1;
  while (days.length < totalSlotsNeeded) {
    const formattedDateStr = `${nextMonthYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(fillerDay).padStart(2, '0')}`;
    days.push({ day: fillerDay, isCurrentMonth: false, dateString: formattedDateStr });
    fillerDay++;
  }

  // Helper to dynamically get events for a date, including weekly Friday holiday
  const getEventsForDate = (dateString: string) => {
    const dateEvents = events.filter(e => e.date === dateString);
    const dateObj = new Date(dateString + 'T00:00:00');
    const isFriday = dateObj.getDay() === 5;
    
    if (isFriday) {
      const hasFridayHoliday = dateEvents.some(e => e.category === 'holiday' && e.title.toLowerCase().includes('holiday'));
      if (!hasFridayHoliday) {
        dateEvents.unshift({
          id: `friday-holiday-${dateString}`,
          title: 'Weekly National Holiday',
          date: dateString,
          category: 'holiday',
          description: 'Official weekly national holiday.'
        });
      }
    }
    return dateEvents;
  };

  // Filtered Events
  const filteredEvents = events.filter(e => {
    if (selectedCategoryFilter !== 'all' && e.category !== selectedCategoryFilter) return false;
    return true;
  });

  // Events of Selected Date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Upcoming events sorting (Current date and onwards)
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-100 flex items-center gap-3 text-sm font-semibold animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Visual Header / Banner */}
      <div className="glass p-6 rounded-3xl relative overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 left-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
              <CalendarRange className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-['Poppins']">
                Academic Planner & Calendar
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track exam timetables, semester deadlines, class tests, and university holidays.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={importBangladeshEvents}
              className="flex items-center justify-center gap-2 bg-emerald-50 bg-opacity-80 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 font-semibold px-4 py-2.5 rounded-2xl shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-all text-sm w-full sm:w-auto"
              title="Import all Bangladesh national holidays and school landmarks"
            >
              🇧🇩 Import BD Holidays
            </button>

            <button
              onClick={() => {
                setNewDate(new Date().toISOString().split('T')[0]);
                setIsAddFormOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-50 dark:hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-2xl shadow-md shadow-blue-500/20 transition-all text-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar Month Grid */}
        <div className="lg:col-span-2 glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-['Poppins']">
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
                <button 
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-all"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-all"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none outline-none rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <option value="all">🗓️ All Categories</option>
              <option value="exam">🚨 Exam / Tests</option>
              <option value="assignment">📂 Assignments</option>
              <option value="quiz">🎯 Quizzes / Present</option>
              <option value="holiday">🌿 Holidays</option>
              <option value="personal">💡 Study Plans</option>
            </select>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div className="text-red-500 dark:text-red-400 font-extrabold" title="National Holiday">Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((slot, index) => {
              const dayEvents = getEventsForDate(slot.dateString).filter(e => {
                if (selectedCategoryFilter !== 'all' && e.category !== selectedCategoryFilter) return false;
                return true;
              });
              const dateObj = new Date(slot.dateString + 'T00:00:00');
              const isFriday = dateObj.getDay() === 5;
              const isToday = slot.dateString === todayStr;
              const isSelected = selectedDate === slot.dateString;

              return (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedDate(slot.dateString);
                    setNewDate(slot.dateString);
                  }}
                  className={`min-h-[85px] p-1.5 rounded-2xl flex flex-col justify-between border cursor-pointer transition-all relative select-none ${
                    slot.isCurrentMonth 
                      ? isFriday
                        ? 'bg-red-50/30 dark:bg-red-950/10 hover:bg-red-100/40 dark:hover:bg-red-950/20 border-red-100/30 dark:border-red-900/20'
                        : 'bg-slate-50/50 dark:bg-slate-800/10 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800' 
                      : 'bg-transparent text-slate-300 dark:text-slate-700 border-transparent'
                  } ${
                    isToday ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 ring-offset-solid' : ''
                  } ${
                    isSelected ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isToday 
                        ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm' 
                        : isSelected 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : isFriday && slot.isCurrentMonth
                            ? 'text-red-600 dark:text-red-400 font-extrabold'
                            : slot.isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-700'
                    }`}>
                      {slot.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-black bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-500 dark:text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Dot markers or visual events mini indicators */}
                  <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(e => (
                      <div 
                        key={e.id}
                        className={`text-[9px] font-medium leading-none px-1.5 py-0.5 rounded border truncate ${CATEGORY_STYLES[e.category].bg} ${CATEGORY_STYLES[e.category].text} ${CATEGORY_STYLES[e.category].border}`}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] font-bold text-slate-400 text-center">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar details & utilities */}
        <div className="space-y-6">
          {/* Selected Date Drawer or Add Event Dialog */}
          <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
            {isAddFormOpen ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm font-['Poppins']">
                    Add Academic Event
                  </h4>
                  <button 
                    onClick={() => setIsAddFormOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleAddEvent} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSE-101 Midterm Exam"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date *</label>
                      <input
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 AM"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(CATEGORY_STYLES) as AcademicEvent['category'][]).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewCategory(cat)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left transition-all text-xs font-semibold ${
                            newCategory === cat 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' 
                              : 'border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${CATEGORY_STYLES[cat].dot}`}></span>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      placeholder="Room number, syllabus details, exam instructions..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl text-sm transition-all shadow-sm"
                  >
                    Save Event
                  </button>
                </form>
              </div>
            ) : selectedDate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Events on</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </h4>
                  </div>
                  <button
                    onClick={() => setIsAddFormOpen(true)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                    title="Add Event"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">No events scheduled on this date.</p>
                      <button
                        onClick={() => {
                          setNewDate(selectedDate);
                          setIsAddFormOpen(true);
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto"
                      >
                        <Plus className="w-3 h-3" /> Click to add one
                      </button>
                    </div>
                  ) : (
                    selectedDateEvents.map(event => (
                      <div 
                        key={event.id}
                        className={`p-3 rounded-2xl border ${CATEGORY_STYLES[event.category].bg} ${CATEGORY_STYLES[event.category].border} relative group`}
                      >
                        <div className="flex items-start justify-between gap-2 pr-6">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                              {CATEGORY_STYLES[event.category].label}
                            </span>
                            <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                              {event.title}
                            </h5>
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                            title="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {event.time}
                          </div>
                        )}
                        {event.description && (
                          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 border-t border-slate-200/40 dark:border-slate-800/40 pt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Select a Day</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click on any calendar day to inspect scheduled events or register new academic milestones.
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Milestones Feed */}
          <div className="glass rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-['Poppins'] flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" /> Upcoming Deadlines
              </h3>
              <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {upcomingEvents.length}
              </span>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No upcoming events scheduled.</p>
              ) : (
                upcomingEvents.map(event => {
                  const eventDate = new Date(event.date);
                  const isToday = event.date === todayStr;

                  return (
                    <div 
                      key={event.id}
                      onClick={() => {
                        setSelectedDate(event.date);
                        setIsAddFormOpen(false);
                      }}
                      className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                    >
                      <div className="flex-none w-11 text-center py-1 rounded-xl bg-slate-100/70 dark:bg-slate-800 flex flex-col justify-center">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 font-mono">
                          {eventDate.getDate()}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={event.title}>
                            {event.title}
                          </h4>
                          {isToday && (
                            <span className="text-[8px] font-bold bg-rose-500 text-white px-1 rounded">TODAY</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {CATEGORY_STYLES[event.category].label} {event.time ? `• ${event.time}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
