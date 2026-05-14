import React from 'react';

type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignee: string;
  status: 'Pending' | 'In Progress' | 'Completed';
};

interface TaskCardProps {
  task: Task;
  isAdmin?: boolean;
  onUpdateStatus?: (id: string, status: Task['status']) => void;
  onDelete?: (id: string) => void;
}

export const TaskCard = ({ task, isAdmin, onUpdateStatus, onDelete }: TaskCardProps) => {
  const priorityColor = {
    Low: "bg-blue-100 text-blue-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  const statusColor = {
    Pending: "text-slate-500",
    "In Progress": "text-indigo-600 font-semibold",
    Completed: "text-emerald-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityColor[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`text-xs font-medium ${statusColor[task.status]}`}>
          {task.status}
        </span>
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{task.title}</h3>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <span className="font-medium text-slate-700">{task.assignee}</span>
        </div>
        <div>{task.dueDate}</div>
      </div>

      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
          <select
            className="text-xs p-1 rounded border border-slate-200 bg-slate-50"
            value={task.status}
            onChange={(e) => onUpdateStatus?.(task.id, e.target.value as Task['status'])}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button
            onClick={() => onDelete?.(task.id)}
            className="text-xs text-red-500 hover:text-red-700 ml-auto"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
