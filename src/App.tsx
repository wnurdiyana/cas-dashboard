import React, { useState } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';

export default function App() {
  const [view, setView] = useState<'member' | 'admin'>('member');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold text-lg tracking-tight">
            CAS Dashboard
          </span>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setView('member')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === 'member'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Member View
          </button>

          <button
            onClick={() => setView('admin')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              view === 'admin'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Admin View
          </button>
        </div>
      </nav>

      <main className="py-8">
        {view === 'admin' ? <AdminDashboard /> : <MemberDashboard />}
      </main>
    </div>
  );
}
