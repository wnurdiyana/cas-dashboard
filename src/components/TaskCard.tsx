import React, { useState } from 'react';
import { ref, update, push } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignee: string;
  assigneeEmail: string;
  status: TaskStatus;
  feedback?: Record<string, { text: string; author: string; createdAt: string }>;
};

interface TaskCardProps {
  task: Task;
  isAdmin?: boolean;
  currentUserEmail?: string;
  onUpdateStatus?: (id: string, status: TaskStatus) => void;
  onDelete?: (id: string) => void;
}

const STATUS_STYLES: Record<string, { card: string; badge: string; label: string }> = {
  'Pending':     { card: 'border-l-4 border-l-slate-400 bg-white',   badge: 'bg-slate-100 text-slate-600',   label: '🕐 Pending' },
  'In Progress': { card: 'border-l-4 border-l-yellow-400 bg-white',  badge: 'bg-yellow-100 text-yellow-700', label: '⚡ In Progress' },
  'Completed':   { card: 'border-l-4 border-l-emerald-500 bg-white', badge: 'bg-emerald-100 text-emerald-700', label: '✅ Completed' },
  'Cancelled':   { card: 'border-l-4 border-l-red-500 bg-white',     badge: 'bg-red-100 text-red-600',       label: '❌ Cancelled' },
  'On Hold':     { card: 'border-l-4 border-l-orange-400 bg-white',  badge: 'bg-orange-100 text-orange-700', label: '⏸ On Hold' },
};

const PRIORITY_STYLES: Record<string, string> = {
  Low:    'bg-blue-50 text-blue-600 border border-blue-200',
  Medium: 'bg-amber-50 text-amber-600 border border-amber-200',
  High:   'bg-red-50 text-red-600 border border-red-200',
};

export const TaskCard = ({ task, isAdmin, currentUserEmail, onUpdateStatus, onDelete }: TaskCardProps) => {
  const { user } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const style = STATUS_STYLES[task.status] ?? STATUS_STYLES['Pending'];
  const feedbackList = task.feedback ? Object.values(task.feedback) : [];
  const isOwner = currentUserEmail?.toLowerCase() === task.assigneeEmail?.toLowerCase();

  const submitFeedback = async () => {
    if (!feedbackText.trim() || !user) return;
    setSubmitting(true);
    await push(ref(db, `tasks/${task.id}/feedback`), {
      text: feedbackText.trim(),
      author: user.displayName || user.email || 'Member',
      createdAt: new Date().toISOString(),
    });
    setFeedbackText('');
    setSubmitting(false);
  };

  return (
    <div className={`rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col gap-0 overflow-hidden border border-slate-200 ${style.card}`}>
      {/* Status bar header */}
      <div className={`px-5 py-2 flex justify-between items-center ${
        task.status === 'Pending' ? 'bg-slate-50' :
        task.status === 'In Progress' ? 'bg-yellow-50' :
        task.status === 'Completed' ? 'bg-emerald-50' :
        task.status === 'Cancelled' ? 'bg-red-50' : 'bg-orange-50'
      }`}>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge}`}>{style.label}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority} Priority
        </span>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base mb-1">{task.title}</h3>
          <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
              {(task.assignee || 'M').charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-slate-700">{task.assignee}</span>
          </div>
          {task.dueDate && (
            <span className="text-slate-400">📅 {task.dueDate}</span>
          )}
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="pt-3 border-t border-slate-100 flex gap-2 items-center">
            <select
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 flex-1 outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
              value={task.status}
              onChange={(e) => onUpdateStatus?.(task.id, e.target.value as TaskStatus)}
            >
              <option value="Pending">🕐 Pending</option>
              <option value="In Progress">⚡ In Progress</option>
              <option value="Completed">✅ Completed</option>
              <option value="Cancelled">❌ Cancelled</option>
              <option value="On Hold">⏸ On Hold</option>
            </select>
            <button onClick={() => onDelete?.(task.id)}
              className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-2 hover:bg-red-50 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        )}

        {/* Member status update — only for assigned member */}
        {!isAdmin && isOwner && onUpdateStatus && (
          <div className="pt-3 border-t border-slate-100">
            <label className="text-xs text-slate-400 font-medium mb-1.5 block">Update your status</label>
            <select
              className="w-full text-sm p-2.5 rounded-lg border-2 border-slate-200 bg-slate-50 outline-none focus:border-indigo-400 font-medium transition-colors"
              value={task.status}
              onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
            >
              <option value="Pending">🕐 Pending</option>
              <option value="In Progress">⚡ In Progress</option>
              <option value="Completed">✅ Completed</option>
              <option value="Cancelled">❌ Cancelled</option>
              <option value="On Hold">⏸ On Hold</option>
            </select>
          </div>
        )}

        {/* Feedback Section */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="text-xs text-indigo-500 font-semibold hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
          >
            💬 {feedbackList.length} Comment{feedbackList.length !== 1 ? 's' : ''} {showFeedback ? '▲' : '▼'}
          </button>

          {showFeedback && (
            <div className="mt-3 space-y-2">
              {feedbackList.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">No comments yet. Be the first!</p>
              )}
              {feedbackList.map((fb, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-xs text-slate-700 leading-relaxed">{fb.text}</p>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">
                    {fb.author} · {new Date(fb.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  className="flex-1 text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  placeholder="Write a comment..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitFeedback()}
                />
                <button
                  onClick={submitFeedback}
                  disabled={submitting || !feedbackText.trim()}
                  className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors font-semibold"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
