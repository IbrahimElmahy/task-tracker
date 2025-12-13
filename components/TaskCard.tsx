import React from 'react';
import { Task, Priority, TaskStatus } from '../types';
import { Clock, Calendar, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<Priority, string> = {
  [Priority.Low]: 'bg-blue-100 text-blue-800',
  [Priority.Medium]: 'bg-yellow-100 text-yellow-800',
  [Priority.High]: 'bg-orange-100 text-orange-800',
  [Priority.Urgent]: 'bg-red-100 text-red-800',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
  const isDone = task.status === TaskStatus.Done;

  return (
    <div className={`p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md ${isDone ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button 
            onClick={() => onStatusChange(task.id, isDone ? TaskStatus.Todo : TaskStatus.Done)}
            className={`mt-1 transition-colors ${isDone ? 'text-green-500' : 'text-gray-300 hover:text-green-500'}`}
          >
            {isDone ? <CheckCircle size={24} /> : <Circle size={24} />}
          </button>
          
          <div>
            <h3 className={`font-semibold text-gray-800 ${isDone ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              
              {task.estimatedMinutes && (
                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                  <Clock size={12} />
                  {task.estimatedMinutes} min
                </span>
              )}
              
              {task.dueDate && (
                 <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                 <Calendar size={12} />
                 {new Date(task.dueDate).toLocaleDateString()}
               </span>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          aria-label="Delete task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  );
};