import React, { useState } from 'react';
import { Plus, Link as LinkIcon, Check, Copy, Trash2, Send } from 'lucide-react';
import { Priority } from '../types';

interface ManagerViewProps {
  onGoBack: () => void;
}

interface SimpleTask {
  id: string;
  title: string;
  priority: Priority;
  estimatedMinutes: number;
}

export const ManagerView: React.FC<ManagerViewProps> = ({ onGoBack }) => {
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [minutes, setMinutes] = useState(30);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: SimpleTask = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      priority,
      estimatedMinutes: minutes
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setGeneratedLink(''); // Reset link if new tasks added
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setGeneratedLink('');
  };

  const generateImportLink = () => {
    // 1. Minify data to save URL space
    const payload = tasks.map(t => ({
      t: t.title,
      p: t.priority,
      m: t.estimatedMinutes
    }));

    // 2. Encode to Base64 with UTF-8 support
    const jsonString = JSON.stringify(payload);
    const base64 = window.btoa(unescape(encodeURIComponent(jsonString)));
    
    // 3. Create full URL
    const url = `${window.location.origin}${window.location.pathname}?import=${base64}`;
    setGeneratedLink(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-900 p-6 text-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Send size={24} />
              Manager Task Assigner
            </h1>
            <button onClick={onGoBack} className="text-indigo-200 hover:text-white text-sm">
              Back to App
            </button>
          </div>
          <p className="text-indigo-200 mt-2">
            Add tasks below for your team member. When finished, generate a link and send it to them.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1">Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Review Q4 Report"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {Object.values(Priority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-24">
              <label className="block text-xs font-medium text-gray-500 mb-1">Mins</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button 
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add
            </button>
          </form>

          {/* Task List */}
          <div className="border rounded-xl overflow-hidden bg-gray-50 min-h-[200px]">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                <p>No tasks added yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {tasks.map((task, idx) => (
                  <li key={task.id} className="p-3 bg-white flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{task.title}</p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span className={`uppercase font-bold ${
                            task.priority === 'High' || task.priority === 'Urgent' ? 'text-red-600' : 'text-blue-600'
                          }`}>{task.priority}</span>
                          <span>•</span>
                          <span>{task.estimatedMinutes} min</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="text-gray-400 hover:text-red-500 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Generate Link Section */}
          <div className="border-t pt-6">
            {!generatedLink ? (
              <button
                onClick={generateImportLink}
                disabled={tasks.length === 0}
                className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 font-bold shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <LinkIcon size={20} />
                Generate Link for Employee
              </button>
            ) : (
              <div className="space-y-3 animate-fade-in-up">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
                  <strong className="block mb-1 text-green-900">Link Ready!</strong>
                  Send the link below to your employee. When they open it, these tasks will be added to their dashboard.
                </div>
                <div className="flex gap-2">
                  <input 
                    readOnly
                    value={generatedLink}
                    className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 select-all outline-none"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2 ${
                      isCopied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isCopied ? <Check size={20} /> : <Copy size={20} />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <button 
                  onClick={() => setGeneratedLink('')}
                  className="w-full py-2 text-gray-500 text-sm hover:text-gray-800"
                >
                  Edit tasks & Generate New Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};