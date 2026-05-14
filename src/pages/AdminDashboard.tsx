import React, { useState, useEffect } from 'react';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { db } from '../firebase';
import { TaskCard } from '../components/TaskCard';

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignee: '',
    status: 'Pending'
  });

  useEffect(() => {
    const tasksRef = ref(db, 'tasks');
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const taskList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setTasks(taskList);
      } else {
        setTasks([]);
      }
    });
  }, []);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const tasksRef = ref(db, 'tasks');
    push(tasksRef, { ...newTask, created_at: new Date().toISOString() });
    setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', assignee: '', status: 'Pending' });
  };

  const updateStatus = (id: string, status: string) => {
    update(ref(db, `tasks/${id}`), { status });
  };

  const deleteTask = (id: string) => {
    if (window.confirm("Delete this task?")) {
      remove(ref(db, `tasks/${id}`));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Panel</h1>
        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Management Mode</div>
      </div>

      <form onSubmit={addTask} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div >
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
          <input
            className="w-full p-3 rounded-lg border border-slate-200 outline-none"
            placeholder="Assignee Name"
            required
            value={newTask.assignee}
            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
          />
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Add Task
          </button>
        </div >
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} isAdmin onUpdateStatus={updateStatus} onDelete={deleteTask} />
        ))}
      </div >
    </div>
  );
}
