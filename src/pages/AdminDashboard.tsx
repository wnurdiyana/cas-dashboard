import React, { useState, useEffect } from 'react';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { TaskCard, TaskStatus } from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

const EMAILJS_SERVICE_ID = 'service_nizdyli';
const EMAILJS_TEMPLATE_ID = 'template_abk69im';
const EMAILJS_PUBLIC_KEY = 'HgBP7Z25S0sVi9KF5';

async function sendAssignmentEmail(to_email: string, to_name: string, task: any) {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email,
          to_name: to_name || to_email,
          task_title: task.title,
          task_description: task.description || 'No description provided.',
          task_priority: task.priority,
          task_due_date: task.dueDate || 'No due date set',
          task_status: task.status,
          dashboard_url: window.location.origin,
        },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled', 'On Hold'];

const STATUS_TAB_STYLES: Record<string, string> = {
  'All':         'bg-indigo-600 text-white',
  'Pending':     'bg-slate-200 text-slate-700',
  'In Progress': 'bg-yellow-400 text-yellow-900',
  'Completed':   'bg-emerald-500 text-white',
  'Cancelled':   'bg-red-500 text-white',
  'On Hold':     'bg-orange-400 text-white',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'Medium',
    dueDate: '', assignee: '', assigneeEmail: '', status: 'Pending',
  });

  useEffect(() => {
    onValue(ref(db, 'tasks'), (snapshot) => {
      const data = snapshot.val();
      setTasks(data ? Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })) : []);
    });
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setEmailStatus('idle');

    const taskData = {
      ...newTask,
      assigneeEmail: newTask.assigneeEmail.toLowerCase().trim(),
      created_at: new Date().toISOString(),
    };

    await push(ref(db, 'tasks'), taskData);

    const ok = await sendAssignmentEmail(taskData.assigneeEmail, taskData.assignee, taskData);
    setEmailStatus(ok ? 'success' : 'error');

    setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', assignee: '', assigneeEmail: '', status: 'Pending' });
    setSending(false);
    setTimeout(() => setEmailStatus('idle'), 4000);
  };

  const updateStatus = (id: string, status: TaskStatus) => update(ref(db, `tasks/${id}`), { status });
  const deleteTask = (id: string) => { if (window.confirm('Delete this task?')) remove(ref(db, `tasks/${id}`)); };

  const filteredTasks = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);

  const counts: Record<string, number> = tasks.reduce((acc: any, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Panel</h1>
        <p className="text-slate-500 text-sm mt-1">Manage and assign tasks to team members</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total', value: tasks.length, color: 'bg-indigo-600', text: 'text-white' },
          { label: 'Pending', value: counts['Pending'] || 0, color: 'bg-slate-200', text: 'text-slate-700' },
          { label: 'In Progress', value: counts['In Progress'] || 0, color: 'bg-yellow-400', text: 'text-yellow-900' },
          { label: 'Completed', value: counts['Completed'] || 0, color: 'bg-emerald-500', text: 'text-white' },
          { label: 'Cancelled', value: counts['Cancelled'] || 0, color: 'bg-red-500', text: 'text-white' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center shadow-sm`}>
            <div className={`text-3xl font-extrabold ${s.text}`}>{s.value}</div>
            <div className={`text-xs font-semibold mt-1 ${s.text} opacity-80`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Task Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
          <h2 className="font-bold text-indigo-900 text-lg">➕ Assign New Task</h2>
        </div>
        <form onSubmit={addTask} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <input className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none transition-colors text-sm"
              placeholder="Task Title *" required value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            <textarea className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none transition-colors text-sm resize-none"
              placeholder="Description" rows={3} value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none transition-colors text-sm"
                placeholder="Assignee Name *" required value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} />
              <input type="email" className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none transition-colors text-sm"
                placeholder="Assignee Email *" required value={newTask.assigneeEmail}
                onChange={(e) => setNewTask({ ...newTask, assigneeEmail: e.target.value })} />
            </div>
          </div>

          <div className="space-y-4">
            <select className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none text-sm font-medium"
              value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
              <option value="Low">🔵 Low Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="High">🔴 High Priority</option>
            </select>
            <input type="date" className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none text-sm"
              value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
            <select className="w-full p-3 rounded-xl border-2 border-slate-200 outline-none text-sm font-medium"
              value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}>
              <option value="Pending">🕐 Pending</option>
              <option value="In Progress">⚡ In Progress</option>
              <option value="Completed">✅ Completed</option>
              <option value="Cancelled">❌ Cancelled</option>
              <option value="On Hold">⏸ On Hold</option>
            </select>
            <button type="submit" disabled={sending}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm shadow">
              {sending ? '📤 Sending...' : '📨 Assign & Notify'}
            </button>

            {emailStatus === 'success' && (
              <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center font-medium">
                ✅ Task assigned & email sent!
              </p>
            )}
            {emailStatus === 'error' && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl p-3 text-center font-medium">
                ⚠️ Task saved but email failed. Check EmailJS settings.
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
              filterStatus === s ? STATUS_TAB_STYLES[s] : 'bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}>
            {s} {s !== 'All' && counts[s] ? `(${counts[s]})` : s === 'All' ? `(${tasks.length})` : '(0)'}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} isAdmin
              onUpdateStatus={updateStatus} onDelete={deleteTask} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-slate-500 font-medium">No tasks found for this status.</p>
        </div>
      )}
    </div>
  );
}
