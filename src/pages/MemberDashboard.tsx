import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { TaskCard } from '../components/TaskCard';

export default function MemberDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filterName, setFilterName] = useState('');

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

  const filteredTasks = tasks.filter(t =>
    t.assignee.toLowerCase().includes(filterName.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Tasks</h1>
        <div className="relative w-full md:w-64">
          <input
            className="w-full p-3 pl-10 rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Filter by your name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
          <svg className="absolute left-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div >
      </div >

      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div >
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-500">No tasks found for this name.</p>
        </div >
      )}
    </div>
  );
}
