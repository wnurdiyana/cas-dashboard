import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';

function AppContent() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">Loading MyCAS...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <nav className="bg-indigo-700 px-6 flex justify-between items-center sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3 py-4">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-extrabold text-indigo-700 text-lg shadow">
            M
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">MyCAS Dashboard</span>
        </div>

        <div className="flex items-center self-stretch">
          <div className={`h-full flex items-center px-6 text-sm font-bold border-b-4 ${
            isAdmin ? 'border-yellow-400 text-yellow-300' : 'border-emerald-400 text-emerald-300'
          }`}>
            {isAdmin ? '🛡️ Admin Panel' : '📋 Task Board'}
          </div>
        </div>

        <div className="flex items-center gap-3 py-4">
          {user.photoURL && (
            <img src={user.photoURL} className="w-9 h-9 rounded-full border-2 border-white/30" alt="avatar" />
          )}
          <div className="hidden sm:block text-right">
            <p className="text-white text-sm font-semibold leading-tight">{user.displayName || user.email}</p>
            <p className="text-indigo-200 text-xs">{isAdmin ? 'Administrator' : 'Member'}</p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="ml-2 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="py-8">
        {isAdmin ? <AdminDashboard /> : <MemberDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
