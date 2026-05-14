import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db, auth } from '../firebase';
import { TaskCard, TaskStatus } from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const tasksRef = ref(db, 'tasks');
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const taskList = Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value }));
        // Only show tasks assigned to the logged-in user's email
        const myTasks = taskList.filter(
          (t) => t.assigneeEmail?.toLowerCase() === user?.email?.toLowerCase()
        );
        setTasks(myTasks);
      } else {
        setTasks([]);
      }
    });
  }, [user]);

  const updateStatus = (id: string, status: TaskStatus) => {
    update(ref(db, `tasks/${id}`), { status });
  };

  const filteredTasks = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);

  const statusCounts = tasks.reduce((acc: any, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome, {user?.displayName || user?.email}
          </p>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="text-sm text-slate-500 hover:text-red-500 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {['Pending', 'In Progress', 'Completed', 'Cancelled'].map((s) => (
          <div key={s} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <div className="text-2xl font-extrabold text-slate-900">{statusCounts[s] || 0}</div>
            <div className="text-xs text-slate-500 mt-1">{s}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['All', 'Pending', 'In Progress', 'Completed', 'Cancelled', 'On Hold'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateStatus={updateStatus}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-slate-500 font-medium">No tasks assigned to you yet.</p>
          <p className="text-slate-400 text-sm mt-1">Check back later or contact your admin.</p>
        </div>
      )}
    </div>
  );
}
