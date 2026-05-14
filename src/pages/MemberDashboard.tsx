import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase';
import { TaskCard, TaskStatus } from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled', 'On Hold'];

const STATUS_TAB_STYLES: Record<string, string> = {
  'All':         'bg-indigo-600 text-white',
  'Pending':     'bg-slate-300 text-slate-800',
  'In Progress': 'bg-yellow-400 text-yellow-900',
  'Completed':   'bg-emerald-500 text-white',
  'Cancelled':   'bg-red-500 text-white',
  'On Hold':     'bg-orange-400 text-white',
};

export default function MemberDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'all' | 'mine'>('all');

  useEffect(() => {
    onValue(ref(db, 'tasks'), (snapshot) => {
      const data = snapshot.val();
      setTasks(data ? Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })) : []);
    });
  }, []);

  const updateStatus = (id: string, status: TaskStatus) => update(ref(db, `tasks/${id}`), { status });

  const myEmail = user?.email?.toLowerCase() || '';

  const viewedTasks = viewMode === 'mine'
    ? tasks.filter(t => t.assigneeEmail?.toLowerCase() === myEmail)
    : tasks;

  const filteredTasks = filterStatus === 'All'
    ? viewedTasks
    : viewedTasks.filter(t => t.status === filterStatus);

  const counts: Record<string, number> = viewedTasks.reduce((acc: any, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const myTasks = tasks.filter(t => t.assigneeEmail?.toLowerCase() === myEmail);
  const myCounts: Record<string, number> = myTasks.reduce((acc: any, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Task Board</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, <span className="font-semibold text-indigo-600">{user?.displayName || user?.email}</span>
        </p>
      </div>

      {/* My Task Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">My Task Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: myCounts['Pending'] || 0, color: 'bg-slate-100 text-slate-700', border: 'border-l-4 border-slate-400' },
            { label: 'In Progress', value: myCounts['In Progress'] || 0, color: 'bg-yellow-50 text-yellow-800', border: 'border-l-4 border-yellow-400' },
            { label: 'Completed', value: myCounts['Completed'] || 0, color: 'bg-emerald-50 text-emerald-800', border: 'border-l-4 border-emerald-500' },
            { label: 'Cancelled', value: myCounts['Cancelled'] || 0, color: 'bg-red-50 text-red-700', border: 'border-l-4 border-red-500' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} ${s.border} rounded-xl p-4`}>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs font-semibold mt-0.5 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex bg-white border-2 border-slate-200 p-1 rounded-xl gap-1 shadow-sm">
          <button onClick={() => setViewMode('all')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'
            }`}>
            🌐 All Tasks ({tasks.length})
          </button>
          <button onClick={() => setViewMode('mine')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'mine' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'
            }`}>
            👤 My Tasks ({myTasks.length})
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
              filterStatus === s ? STATUS_TAB_STYLES[s] : 'bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}>
            {s} {s === 'All' ? `(${viewedTasks.length})` : counts[s] ? `(${counts[s]})` : '(0)'}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserEmail={myEmail}
              onUpdateStatus={updateStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-3">{viewMode === 'mine' ? '📭' : '🔍'}</div>
          <p className="text-slate-500 font-medium">
            {viewMode === 'mine' ? 'No tasks assigned to you yet.' : 'No tasks found for this filter.'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {viewMode === 'mine' ? 'Check back later or contact your admin.' : 'Try a different status filter.'}
          </p>
        </div>
      )}
    </div>
  );
}
