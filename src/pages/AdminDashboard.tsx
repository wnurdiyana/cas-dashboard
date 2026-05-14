import React, { useState, useEffect } from 'react';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { TaskCard, TaskStatus } from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
    assigneeEmail: '',
    status: 'Pending',
  });

  useEffect(() => {
    const tasksRef = ref(db, 'tasks');
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const taskList = Object.entries(data).map(([id, value]: [string, any]) => ({ id, ...value }));
        setTasks(taskList);
      } else {
        setTasks([]);
      }
    });
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    push(ref(db, 'tasks'), {
      ...newTask,
      assigneeEmail: newTask.assigneeEmail.toLowerCase().trim(),
      created_at: new Date().toISOString(),
    });
    setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', assignee: '', assigneeEmail: '', status: 'Pending' });
  };

  const updateStatus = (id: string, status: TaskStatus) => {
    update(ref(db, `tasks/${id}`), { status });
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Delete this task?')) remove(ref(db, `tasks/${id}`));
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Logged in as {user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Admin</span>
          <button
            onClick={() => signOut(auth)}
            className="text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
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

      {/* Add Task Form */}
      <form
        onSubmit={addTask}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="md:col-span-2 space-y-4">
          <input
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Task Title"
            required
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <textarea
            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Description"
            rows={2}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Assignee Name"
              required
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
            />
            <input
              type="email"
              className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Assignee Email"
              required
              value={newTask.assigneeEmail}
              onChange={(e) => setNewTask({ ...newTask, assigneeEmail: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <select
            className="w-full p-3 rounded-lg border border-slate-200 outline-none"
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          <input
            type="date"
            className="w-full p-3 rounded-lg border border-slate-200 outline-none"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />

          <select
            className="w-full p-3 rounded-lg border border-slate-200 outline-none"
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="On Hold">On Hold</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            Assign Task
          </button>
        </div>
      </form>

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
            {s} {s !== 'All' && statusCounts[s] ? `(${statusCounts[s]})` : ''}
          </button>
        ))}
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isAdmin
            onUpdateStatus={updateStatus}
            onDelete={deleteTask}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-20 text-slate-400">No tasks found.</div>
      )}
    </div>
  );
}
