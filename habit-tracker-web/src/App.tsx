// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";
import AppShell from './pages/AppShell'; // Ensure this path is correct
import LoginPage from './pages/LoginPage'; // Ensure this path is correct

export default function App() {
  const { user, loading } = useAuth();

  // 1. Wait for auth check to finish (prevents flickering)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 2. Public Route: Login */}
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />

      {/* 3. Protected Routes */}
      <Route 
        path="/" 
        element={user ? <AppShell /> : <Navigate to="/login" replace />} 
      >
         {/* If AppShell renders views internally based on state, 
             we just point everything to AppShell for now. 
             Ideally, AppShell should use <Outlet /> and these should be sub-routes, 
             but for your current setup, this wrapper works. */}
         <Route path="dashboard" element={null} /> 
      </Route>

      {/* 4. Catch-all */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}
