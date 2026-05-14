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
  onUpdateStatus?: (id: string, status: TaskStatus) => void;
  onDelete?: (id: string) => void;
}

const priorityColor: Record<string, string> = {
  Low: 'bg-blue-100 text-blue-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

const statusColor: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-600',
  'In Progress': 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-600',
  'On Hold': 'bg-orange-100 text-orange-700',
};

export const TaskCard = ({ task, isAdmin, onUpdateStatus, onDelete }: TaskCardProps) => {
  const { user } = useAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const feedbackList = task.feedback ? Object.values(task.feedback) : [];

  const submitFeedback = async () => {
    if (!feedbackText.trim() || !user) return;
    setSubmitting(true);
    const feedbackRef = ref(db, `tasks/${task.id}/feedback`);
    await push(feedbackRef, {
      text: feedbackText.trim(),
      author: user.displayName || user.email || 'Member',
      createdAt: new Date().toISOString(),
    });
    setFeedbackText('');
    setSubmitting(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateStatus?.(task.id, e.target.value as TaskStatus);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[task.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {task.status}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="font-bold text-slate-900 mb-1">{task.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
      </div>

      {/* Assignee & Due Date */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">{task.assignee}</span>
        <span>{task.dueDate}</span>
      </div>

      {/* Member: update own status */}
      {!isAdmin && onUpdateStatus && (
        <div className="pt-3 border-t border-slate-100">
          <label className="text-xs text-slate-500 mb-1 block">Update Status</label>
          <select
            className="w-full text-sm p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-400"
            value={task.status}
            onChange={handleStatusChange}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      )}

      {/* Admin: update status + delete */}
      {isAdmin && (
        <div className="pt-3 border-t border-slate-100 flex gap-2 items-center">
          <select
            className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 flex-1 outline-none"
            value={task.status}
            onChange={handleStatusChange}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="On Hold">On Hold</option>
          </select>
          <button
            onClick={() => onDelete?.(task.id)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        </div>
      )}

      {/* Feedback Section */}
      <div className="pt-3 border-t border-slate-100">
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
        >
          💬 {feedbackList.length} Feedback {showFeedback ? '▲' : '▼'}
        </button>

        {showFeedback && (
          <div className="mt-3 space-y-2">
            {feedbackList.length === 0 && (
              <p className="text-xs text-slate-400 italic">No feedback yet.</p>
            )}
            {feedbackList.map((fb, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-700">{fb.text}</p>
                <p className="text-xs text-slate-400 mt-1">
                  — {fb.author} · {new Date(fb.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}

            {/* Add feedback input */}
            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 text-xs p-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Add feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitFeedback()}
              />
              <button
                onClick={submitFeedback}
                disabled={submitting || !feedbackText.trim()}
                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
