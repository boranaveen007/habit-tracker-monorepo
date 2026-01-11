// src/components/SettingsModal.tsx
import { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { api } from '../features/habits/habitsApi';

interface Props { onClose: () => void; }

export default function SettingsModal({ onClose }: Props) {
  const { user } = useAuth();
  
  // Safe parsing of settings
  const initialSettings = user?.settings || {}; 
  const [theme, setTheme] = useState(initialSettings.theme || 'light');
  const [defaultView, setDefaultView] = useState(initialSettings.defaultView || 'today');
  
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Call the real backend endpoint (now bypassing auth locally)
      await api.patch('/auth/profile', { 
        settings: { theme, defaultView } 
      });
      
      // Force reload to apply changes
      window.location.reload(); 
    } catch (err) {
      console.error("Failed to save settings", err);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Settings</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all">✕</button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Light Theme Button */}
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200
                  ${theme === 'light' 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100 ring-2 ring-emerald-100' // Active: Green & White
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300' // Inactive: White & Gray
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span className="text-sm font-bold">Light</span>
              </button>

              {/* Dark Theme Button */}
              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200
                  ${theme === 'dark' 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100 ring-2 ring-emerald-100' // Active: Green & White
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300' // Inactive: White & Gray
                  }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                <span className="text-sm font-bold">Dark</span>
              </button>
            </div>
          </div>

          {/* Default View Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Default View</label>
            <div className="relative">
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-slate-800 font-medium cursor-pointer appearance-none transition-all"
              >
                <option value="today">Today (Daily Focus)</option>
                <option value="week">Week (Schedule)</option>
                <option value="month">Month (Calendar)</option>
                <option value="analytics">Analytics (Dashboard)</option>
              </select>
              {/* Custom Dropdown Arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all disabled:opacity-70 active:scale-95"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
