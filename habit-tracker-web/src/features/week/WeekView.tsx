// src/features/week/WeekView.tsx
import { useEffect, useState } from "react";
import { api } from "../habits/habitsApi";
import { startOfWeek, addDays, format } from "date-fns";

type Habit = { id: string; name: string; category?: string; startDate: string; endDate?: string | null; };
type HabitLog = { id: string; habitId: string; date: string; completed: boolean; };
type DayCell = { date: string; label: string; };

function getWeekDays(base: Date = new Date()): DayCell[] {
  const start = startOfWeek(base, { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(start, i);
    return { date: format(d, "yyyy-MM-dd"), label: format(d, "EEE") };
  });
}

export default function WeekView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logsByHabitDate, setLogsByHabitDate] = useState<Record<string, HabitLog>>({});
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = addDays(new Date(), weekOffset * 7);
  const weekDays = getWeekDays(baseDate);
  const startDate = weekDays[0].date;
  const endDate = weekDays[6].date;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [habitsRes, logsRes] = await Promise.all([
          api.get<Habit[]>("/habits"),
          api.get<HabitLog[]>("/logs/range", { params: { startDate, endDate } }),
        ]);
        setHabits(habitsRes.data);
        const map: Record<string, HabitLog> = {};
        logsRes.data.forEach((log) => { map[`${log.habitId}-${log.date}`] = log; });
        setLogsByHabitDate(map);
      } finally { setLoading(false); }
    }
    fetchData();
  }, [startDate, endDate]);

  const handleToggle = async (habit: Habit, date: string) => {
    const key = `${habit.id}-${date}`;
    const nextCompleted = !(logsByHabitDate[key]?.completed ?? false);
    try {
      const res = await api.post<HabitLog>("/logs/toggle", { habitId: habit.id, date, completed: nextCompleted });
      setLogsByHabitDate((prev) => ({ ...prev, [key]: res.data }));
    } catch (e) { console.error("Toggle failed", e); }
  };

  const weekHabits = habits.filter((habit) => {
    const hStart = habit.startDate;
    const hEnd = habit.endDate || "9999-12-31";
    return hStart <= endDate && hEnd >= startDate;
  });

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">Loading schedule...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
        <button onClick={() => setWeekOffset((o) => o - 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">◀</button>
        <div className="text-base font-bold text-slate-800 tracking-tight">
          {format(new Date(startDate), "MMMM d")} – {format(new Date(endDate), "d, yyyy")}
        </div>
        <button onClick={() => setWeekOffset((o) => o + 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">▶</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-50">
                {/* Wider column for Habit Name, removed truncation */}
                <th className="p-4 text-left min-w-[200px] max-w-[300px] text-xs font-bold text-slate-400 uppercase tracking-wider bg-white sticky left-0 z-10">Habit</th>
                {weekDays.map((day) => (
                  <th key={day.date} className="p-3 min-w-[60px] text-center">
                    <div className="text-xs font-bold text-slate-700">{day.label}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{day.date.slice(8)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {weekHabits.map((habit) => (
                <tr key={habit.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 bg-white sticky left-0 z-10 group-hover:bg-slate-50/50 transition-colors">
                    {/* Allow text wrapping */}
                    <div className="font-semibold text-slate-700 text-sm break-words leading-tight">{habit.name}</div>
                    {habit.category && <div className="text-[10px] font-medium text-slate-400 mt-1">{habit.category}</div>}
                  </td>
                  {weekDays.map((day) => {
                    const key = `${habit.id}-${day.date}`;
                    const completed = logsByHabitDate[key]?.completed ?? false;
                    const disabled = day.date < habit.startDate || (habit.endDate && day.date > habit.endDate);

                    return (
                      <td key={day.date} className="p-2 text-center">
                        <button
                          onClick={() => !disabled && handleToggle(habit, day.date)}
                          disabled={disabled}
                          className={`
                            w-7 h-7 rounded-lg mx-auto flex items-center justify-center transition-all duration-300 ease-out
                            ${disabled 
                               ? 'opacity-0 cursor-default' 
                               : completed 
                                 ? 'bg-emerald-500 shadow-md shadow-emerald-200 scale-100 rotate-0' 
                                 : 'bg-slate-100 hover:bg-slate-200 scale-90 hover:scale-100'
                            }
                          `}
                        >
                          {completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>}
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
