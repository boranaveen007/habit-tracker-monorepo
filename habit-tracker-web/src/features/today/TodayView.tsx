// src/features/today/TodayView.tsx
import { useEffect, useState } from "react";
import { api } from "../habits/habitsApi";
import { format } from "date-fns";

type Habit = { id: string; name: string; category?: string; startDate: string; endDate?: string | null; };

export default function TodayView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "EEEE, MMMM do");

  useEffect(() => {
    async function fetchData() {
      try {
        const [habitsRes, logsRes] = await Promise.all([
          api.get<Habit[]>("/habits"),
          api.get("/logs/range", { params: { startDate: todayDate, endDate: todayDate } }),
        ]);
        setHabits(habitsRes.data);
        const done = new Set<string>();
        logsRes.data.forEach((l: any) => { if (l.completed) done.add(l.habitId); });
        setCompletedIds(done);
      } finally { setLoading(false); }
    }
    fetchData();
  }, [todayDate]);

  const toggle = async (habitId: string) => {
    const isDone = completedIds.has(habitId);
    try {
      await api.post("/logs/toggle", { habitId, date: todayDate, completed: !isDone });
      setCompletedIds(prev => { const next = new Set(prev); isDone ? next.delete(habitId) : next.add(habitId); return next; });
    } catch (e) { console.error("Toggle failed", e); }
  };

  const activeHabits = habits.filter(h => h.startDate <= todayDate && (!h.endDate || h.endDate >= todayDate));
  const progress = activeHabits.length > 0 ? Math.round((completedIds.size / activeHabits.length) * 100) : 0;

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Loading today...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Today's Focus</h2>
        <p className="text-slate-500 font-medium">{displayDate}</p>
        
        {/* Progress Bar */}
        <div className="w-full max-w-xs mt-4">
           <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
             <span>{progress}% Complete</span>
             <span>{completedIds.size}/{activeHabits.length}</span>
           </div>
           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
           </div>
        </div>
      </div>

      {/* Habits List */}
      <div className="grid gap-3">
        {activeHabits.map(habit => {
          const isDone = completedIds.has(habit.id);
          return (
            <div 
              key={habit.id} 
              onClick={() => toggle(habit.id)}
              className={`
                group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none
                ${isDone 
                   ? 'bg-slate-50/50 border-slate-100' 
                   : 'bg-white border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-emerald-50 hover:-translate-y-0.5'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Check Button (Left Side) */}
                <button
                  className={`
                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ease-spring
                    ${isDone 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-100 rotate-0' 
                      : 'bg-slate-100 text-slate-300 group-hover:bg-slate-200 scale-95'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                
                <div className="flex flex-col">
                  <span className={`font-semibold text-base transition-colors duration-200 ${isDone ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}>
                    {habit.name}
                  </span>
                  {habit.category && (
                    <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{habit.category}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {activeHabits.length === 0 && (
          <div className="py-16 text-center">
            <div className="inline-block p-4 rounded-full bg-slate-50 text-slate-300 mb-3">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            </div>
            <p className="text-slate-500 font-medium">No habits scheduled for today.</p>
          </div>
        )}
      </div>
    </div>
  );
}
