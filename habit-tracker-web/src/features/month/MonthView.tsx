// src/features/month/MonthView.tsx
import { useState, useEffect } from 'react';
import { api } from '../habits/habitsApi';
import { useAuth } from '../../hooks/useAuth';

interface Habit { id: string; name: string; category?: string; startDate: string; endDate?: string | null; }
interface MonthlyStats { daysInMonth: number; logs: Array<{ habitId: string; date: string; completed: boolean; }>; }

export default function MonthView() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const monthStartStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const monthEndStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const [habitsRes, statsRes] = await Promise.all([
          api.get<Habit[]>('/habits'),
          api.get<MonthlyStats>('/logs/monthly', { params: { year, month } })
        ]);
        setHabits(habitsRes.data);
        setStats(statsRes.data);
      } finally { setLoading(false); }
    }
    fetchData();
  }, [year, month, user]);

  const activeHabits = habits.filter(h => h.startDate <= monthEndStr && (!h.endDate || h.endDate >= monthStartStr));

  const isCompleted = (habitId: string, day: number) => {
    const targetDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return stats?.logs.some(log => log.habitId === habitId && log.date.startsWith(targetDate) && log.completed) ?? false;
  };

  const toggleHabit = async (habitId: string, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      await api.post('/logs/toggle', { habitId, date: dateStr, completed: !isCompleted(habitId, day) });
      const statsRes = await api.get<MonthlyStats>('/logs/monthly', { params: { year, month } });
      setStats(statsRes.data);
    } catch (err) { console.error("Toggle failed", err); }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Loading calendar...</div>;

  const daysInMonth = stats?.daysInMonth || new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
        <button onClick={() => setCurrentDate(new Date(year, month - 2, 1))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">◀</button>
        <h2 className="text-base font-bold text-slate-800 tracking-tight">{monthName}</h2>
        <button onClick={() => setCurrentDate(new Date(year, month, 1))} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">▶</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto pb-4">
          <table className="border-collapse w-full min-w-max">
            <thead>
              <tr>
                {/* Wider sticky column to allow full text */}
                <th className="p-4 text-left min-w-[200px] max-w-[300px] sticky left-0 bg-white z-20 border-b border-r border-slate-100 font-bold text-slate-400 text-xs uppercase tracking-wider">Habit</th>
                {daysArray.map(day => (
                  <th key={day} className="p-1 min-w-[32px] text-center border-b border-slate-50 text-[10px] font-bold text-slate-400">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeHabits.map(habit => (
                <tr key={habit.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 bg-white sticky left-0 z-10 group-hover:bg-slate-50/50 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors">
                    <div className="font-semibold text-slate-700 text-sm break-words leading-tight">{habit.name}</div>
                    {habit.category && (
                      <div className="text-[10px] font-medium text-slate-400 mt-1">{habit.category}</div>
                    )}
                  </td>
                  {daysArray.map(day => {
                    const active = isCompleted(habit.id, day);
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isDisabled = dateStr < habit.startDate || (habit.endDate && dateStr > habit.endDate);

                    return (
                      <td key={day} className="p-1 text-center">
                        <button
                          onClick={() => !isDisabled && toggleHabit(habit.id, day)}
                          disabled={isDisabled}
                          className={`
                            w-6 h-6 rounded-md transition-all duration-200 ease-out flex items-center justify-center mx-auto
                            ${isDisabled 
                               ? 'opacity-0 cursor-default' 
                               : active 
                                 ? 'bg-emerald-500 shadow-sm shadow-emerald-200 scale-100' 
                                 : 'bg-slate-100 hover:bg-slate-200 scale-90 hover:scale-100'
                            }
                          `}
                          title={`${habit.name}: ${dateStr}`}
                        >
                          {active && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
