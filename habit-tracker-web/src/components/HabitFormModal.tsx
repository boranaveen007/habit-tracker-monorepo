// src/components/HabitFormModal.tsx
import { useState, type FormEvent } from 'react';
import { api } from '../features/habits/habitsApi';
import { format } from 'date-fns';

type Props = {
  onClose: () => void;
  onCreated?: () => void;
};

const presetHabits = [
  { name: 'Drink 8 glasses of water', category: 'Health', frequency: 'daily' },
  { name: 'Read 10 minutes', category: 'Personal', frequency: 'weekdays' },
  { name: 'Walk 5,000 steps', category: 'Health', frequency: 'daily' },
  { name: 'Journal', category: 'Personal', frequency: 'daily' },
];

export default function HabitFormModal({ onClose, onCreated }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Health');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState<string>('');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'x-per-week'>('daily');
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetClick = (preset: (typeof presetHabits)[number]) => {
    setName(preset.name);
    setCategory(preset.category);
    if (preset.frequency === 'daily') setFrequency('daily');
    if (preset.frequency === 'weekdays') setFrequency('weekdays');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (endDate && endDate < startDate) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/habits', {
        name,
        description: description || undefined,
        category,
        startDate,
        endDate: endDate || undefined,
      });
      setSubmitting(false);
      if (onCreated) onCreated();
      onClose();
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.response?.data?.error || 'Failed to create habit');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">New Habit</h2>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Presets */}
          <div className="mb-6 flex flex-wrap gap-2">
            {presetHabits.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                onClick={() => handlePresetClick(preset as any)}
              >
                + {preset.name}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Name
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium placeholder:text-slate-400 transition-all"
                placeholder="e.g. Read for 30 mins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Category
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium transition-all appearance-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Health</option>
                <option>Work</option>
                <option>Personal</option>
                <option>Learning</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium transition-all"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  End Date <span className="normal-case font-normal opacity-50">(Optional)</span>
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium transition-all"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Goal Frequency
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'daily', label: 'Every Day' },
                  { id: 'weekdays', label: 'Weekdays' },
                  { id: 'x-per-week', label: 'X times / week' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFrequency(opt.id as any)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-semibold transition-all border
                      ${frequency === opt.id
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              
              {frequency === 'x-per-week' && (
                <div className="mt-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                  <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={7}
                      className="w-12 bg-transparent font-bold text-center text-slate-800 outline-none"
                      value={timesPerWeek}
                      onChange={(e) => setTimesPerWeek(Number(e.target.value))}
                    />
                    <span className="text-sm font-medium text-slate-500 pr-1">times</span>
                  </div>
                  <span className="text-sm font-medium text-slate-400">per week</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                Description <span className="normal-case font-normal opacity-50">(Optional)</span>
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-medium placeholder:text-slate-400 transition-all resize-none"
                rows={2}
                placeholder="Why do you want to build this habit?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-4 flex gap-3 border-t border-slate-50 mt-6">
              <button
                type="button"
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? 'Creating...' : 'Create Habit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
