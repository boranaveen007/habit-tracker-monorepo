// src/pages/AppShell.tsx
import { useState, useEffect } from "react";
import TodayView from "../features/today/TodayView";
import WeekView from "../features/week/WeekView";
import MonthlyView from "../features/month/MonthView";
import AnalyticsView from "../features/analytics/AnalyticsView";
import SettingsModal from "../components/SettingsModal";
import { useAuth } from "../context/AuthContext";
import HabitFormModal from "../components/HabitFormModal";
import Logo from "../components/Logo";

export default function AppShell() {
  const { user, logout } = useAuth();
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New State

  // Initialize view from user settings if available, else 'today'
  // Note: user.settings might be loaded asynchronously, so we might need a useEffect to update it
  // if the user object updates after initial render.
  const initialView = user?.settings?.defaultView || "today";
  const [view, setView] = useState<"today" | "week" | "month" | "analytics">(
    initialView as any
  );

  // Sync view if user settings load late
  useEffect(() => {
    if (user?.settings?.defaultView) {
      setView(user.settings.defaultView as any);
    }
  }, [user]);

  const NavItem = ({ label, value }: { label: string; value: typeof view }) => (
    <button
      onClick={() => setView(value)}
      className={`
        px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
        ${
          view === value
            ? "bg-slate-900 text-white shadow-lg shadow-slate-200 transform scale-105"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Logo size="sm" />
            
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">
                Habit Tick
              </h1>
              {/* Tagline under the title */}
              <p className="text-slate-500 text-[10px] sm:text-xs font-medium mt-1">
                Build better habits, one tick at a time
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white border border-slate-100 p-1 rounded-full shadow-sm">
            <NavItem label="Today" value="today" />
            <NavItem label="Week" value="week" />
            <NavItem label="Month" value="month" />
            <NavItem label="Analytics" value="analytics" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHabitModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md shadow-emerald-100 transition-all hover:-translate-y-0.5"
            >
              + New
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 flex items-center justify-center transition-all shadow-sm"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            <button
              onClick={logout}
              className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
              title="Logout"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav (Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-30 pb-safe">
        <NavItem label="Today" value="today" />
        <NavItem label="Week" value="week" />
        <NavItem label="Month" value="month" />
        <NavItem label="Stats" value="analytics" />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in duration-500 slide-in-from-bottom-4 mb-20 md:mb-0">
        {view === "today" && <TodayView />}
        {view === "week" && <WeekView />}
        {view === "month" && <MonthlyView />}
        {view === "analytics" && <AnalyticsView />}
      </main>

      {showHabitModal && (
        <HabitFormModal
          onClose={() => setShowHabitModal(false)}
          onCreated={() => window.location.reload()}
        />
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
