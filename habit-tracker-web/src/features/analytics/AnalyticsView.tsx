// src/features/analytics/AnalyticsView.tsx
import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Tooltip as ChartTooltip 
} from 'recharts';
import { api } from '../habits/habitsApi';
import { useAuth } from "../../context/AuthContext";

const COLORS = ['#10b981', '#f1f5f9']; 

type RangeOption = '7' | '30' | '90' | 'custom';

export default function AnalyticsView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [range, setRange] = useState<RangeOption>('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const [appliedRange, setAppliedRange] = useState<{ start: string, end: string } | null>(null);

  const [rawHabits, setRawHabits] = useState<any[]>([]);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [selectedHabitIds, setSelectedHabitIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    const s = start.toISOString().split('T')[0];
    const e = end.toISOString().split('T')[0];
    setCustomStart(s);
    setCustomEnd(e);
    setAppliedRange({ start: s, end: e });
  }, []);

  useEffect(() => {
    if (range === 'custom') return;
    const days = parseInt(range);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const s = start.toISOString().split('T')[0];
    const e = end.toISOString().split('T')[0];
    setCustomStart(s);
    setCustomEnd(e);
    setAppliedRange({ start: s, end: e });
  }, [range]);

  useEffect(() => {
    async function fetchData() {
      if (!user || !appliedRange) return;
      setLoading(true);
      try {
        const [habitsRes, logsRes] = await Promise.all([
          api.get('/habits'),
          api.get('/logs/range', { params: { startDate: appliedRange.start, endDate: appliedRange.end } })
        ]);
        setRawHabits(habitsRes.data);
        setRawLogs(logsRes.data);
        const allIds = new Set(habitsRes.data.map((h: any) => h.id));
        setSelectedHabitIds(allIds as Set<string>);
      } catch (err) { console.error("Analytics fetch failed", err); } 
      finally { setLoading(false); }
    }
    fetchData();
  }, [user, appliedRange]);

  const computed = useMemo(() => {
    if (!appliedRange) return null;
    const startDateObj = new Date(appliedRange.start + 'T00:00:00'); // Force midnight
    const endDateObj = new Date(appliedRange.end + 'T00:00:00');
    
    const relevantHabits = rawHabits.filter(h => {
        const hStart = h.startDate;
        const hEnd = h.endDate || "9999-12-31";
        return hStart <= appliedRange.end && hEnd >= appliedRange.start;
    });
    
    const activeHabits = relevantHabits.filter(h => selectedHabitIds.has(h.id));
    const filteredLogs = rawLogs.filter(l => selectedHabitIds.has(l.habitId));

    // Trend Logic
    const dayMap: Record<string, number> = {};
    let loopDate = new Date(startDateObj);
    while (loopDate <= endDateObj) {
        // Use manual formatting to avoid timezone shift on the keys
        const y = loopDate.getFullYear();
        const m = String(loopDate.getMonth() + 1).padStart(2, '0');
        const d = String(loopDate.getDate()).padStart(2, '0');
        dayMap[`${y}-${m}-${d}`] = 0;
        
        loopDate.setDate(loopDate.getDate() + 1);
    }
    
    filteredLogs.forEach(log => {
        if (log.completed) {
            const date = log.date.split('T')[0];
            if (dayMap[date] !== undefined) dayMap[date]++;
        }
    });

    const trendData = Object.entries(dayMap)
        .map(([date, count]) => {
            // FIX: Manually parse YYYY-MM-DD to create a local date object
            const [y, m, d] = date.split('-').map(Number);
            const localDate = new Date(y, m - 1, d);
            
            return {
                dateStr: date,
                displayDate: localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count
            };
        })
        .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

    // Strict Math
    let totalPossible = 0;
    loopDate = new Date(startDateObj);
    while (loopDate <= endDateObj) {
        const y = loopDate.getFullYear();
        const m = String(loopDate.getMonth() + 1).padStart(2, '0');
        const d = String(loopDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        activeHabits.forEach(h => {
            const hStart = h.startDate;
            const hEnd = h.endDate || "9999-12-31";
            if (dateStr >= hStart && dateStr <= hEnd) totalPossible++;
        });
        loopDate.setDate(loopDate.getDate() + 1);
    }
    const totalCompleted = filteredLogs.filter(l => l.completed).length;
    const overallRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const habitStats = activeHabits.map(h => {
        const count = filteredLogs.filter(l => l.habitId === h.id && l.completed).length;
        return { name: h.name, count };
    }).sort((a, b) => b.count - a.count);

    return { trendData, overallRate, habitStats, relevantHabits };
  }, [rawHabits, rawLogs, selectedHabitIds, appliedRange]);

  const handleApplyCustom = () => {
    if (customStart && customEnd && customStart <= customEnd) {
        setAppliedRange({ start: customStart, end: customEnd });
    } else { alert("Please select a valid date range."); }
  };

  const toggleHabitFilter = (id: string) => {
      const newSet = new Set(selectedHabitIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedHabitIds(newSet);
  };

  const toggleAll = () => {
      const relevantIds = computed?.relevantHabits.map(h => h.id) || [];
      const allChecked = relevantIds.every(id => selectedHabitIds.has(id));
      if (allChecked) setSelectedHabitIds(new Set()); 
      else setSelectedHabitIds(new Set(relevantIds));
  };

  const pieData = [
    { name: 'Completed', value: computed?.overallRate || 0 },
    { name: 'Missed', value: 100 - (computed?.overallRate || 0) }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Analytics Dashboard</h2>
        <div className="flex flex-wrap items-center gap-3">
          {range === 'custom' && (
             <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="text-xs bg-transparent border-none focus:ring-0 text-slate-600 font-medium w-28"/>
                <span className="text-slate-400 font-medium">-</span>
                <input type="date" value={customEnd} min={customStart} onChange={(e) => setCustomEnd(e.target.value)} className="text-xs bg-transparent border-none focus:ring-0 text-slate-600 font-medium w-28"/>
                <button onClick={handleApplyCustom} className="ml-2 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 shadow-sm shadow-emerald-200 transition-all">Apply</button>
             </div>
          )}
          <select value={range} onChange={(e) => setRange(e.target.value as RangeOption)} className="bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 block px-4 py-2.5 shadow-sm outline-none cursor-pointer transition-all hover:bg-slate-50">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 font-medium">Loading data...</div>
      ) : (
        <>
           {/* Filters */}
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Filter Habits</h3>
                   <button onClick={toggleAll} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors">
                       Toggle All
                   </button>
               </div>
               <div className="flex flex-wrap gap-2">
                   {computed?.relevantHabits.map(habit => (
                       <button
                           key={habit.id}
                           onClick={() => toggleHabitFilter(habit.id)}
                           className={`
                               px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                               ${selectedHabitIds.has(habit.id) 
                                   ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                                   : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                               }
                           `}
                       >
                           {habit.name}
                       </button>
                   ))}
                   {computed?.relevantHabits.length === 0 && <span className="text-xs text-slate-400">No habits found for this period.</span>}
               </div>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-6">Daily Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed?.trendData || []}>
                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#94a3b8'}} tickMargin={10} minTickGap={30} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} fontSize={10} tick={{fill: '#94a3b8'}} />
                    <ChartTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 4, 4]} barSize={range === '90' ? 6 : 16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center relative">
              <h3 className="text-base font-bold text-slate-800 w-full text-left mb-2">Consistency Score</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', color: '#64748b'}} />
                    <ChartTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-6 pointer-events-none">
                <div className="text-4xl font-extrabold text-slate-800">{computed?.overallRate}%</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">Completion</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Habit Performance</h3>
            <div className="space-y-3">
              {computed?.habitStats.map((habit, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl group hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-bold text-slate-400 shadow-sm border border-slate-100">{idx + 1}</span>
                    <span className="font-semibold text-slate-700">{habit.name}</span>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-100 shadow-sm group-hover:border-emerald-100 group-hover:text-emerald-600 transition-colors">
                    {habit.count} done
                  </span>
                </div>
              ))}
              {computed?.habitStats.length === 0 && <div className="text-slate-400 text-sm font-medium py-4">No active habits found for this period.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
