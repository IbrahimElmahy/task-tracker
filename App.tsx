import React, { useState, useEffect, useMemo } from 'react';
import { Task, Priority, TaskStatus } from './types';
import { TaskCard } from './components/TaskCard';
import { Stats } from './components/Stats';
import { AISchedulerModal } from './components/AISchedulerModal';
import { suggestPrioritization } from './services/geminiService';
import { Plus, Layout, List, BrainCircuit, Sparkles, Search } from 'lucide-react';

const App = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  
  // Local input state for simple add
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Persist tasks
  useEffect(() => {
    const saved = localStorage.getItem('taskflow-tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load tasks");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // AI Suggestion on mount or task change (debounced in reality, but simple effect here)
  useEffect(() => {
    if (tasks.length > 0 && tasks.some(t => t.status !== TaskStatus.Done)) {
      const todoTitles = tasks.filter(t => t.status === TaskStatus.Todo).map(t => t.title);
      // We don't want to call API on every render, so let's just do it once when tasks length changes significantly or on user request.
      // For this demo, we'll leave it manual or triggered by a button to save API calls.
    }
  }, [tasks.length]);

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      priority: Priority.Medium,
      status: TaskStatus.Todo,
      tags: [],
      createdAt: Date.now(),
      estimatedMinutes: 30
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const handleAddAITasks = (generatedTasks: any[]) => {
    const newTasks = generatedTasks.map(t => ({
      id: crypto.randomUUID(),
      title: t.title,
      description: t.description,
      priority: t.priority as Priority,
      status: TaskStatus.Todo,
      estimatedMinutes: t.estimatedMinutes,
      tags: ['AI-Generated'],
      createdAt: Date.now()
    }));
    setTasks(prev => [...newTasks, ...prev]);
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const triggerAdvice = async () => {
     setAiSuggestion("Thinking...");
     const todos = tasks.filter(t => t.status !== TaskStatus.Done).map(t => t.title);
     if (todos.length === 0) {
         setAiSuggestion("You're all caught up! Great job.");
         return;
     }
     const advice = await suggestPrioritization(todos);
     setAiSuggestion(advice);
  }

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    if (filter === 'done') return tasks.filter(t => t.status === TaskStatus.Done);
    return tasks.filter(t => t.status !== TaskStatus.Done);
  }, [tasks, filter]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Layout size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">TaskFlow AI</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsAIModalOpen(true)}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
              >
                <BrainCircuit size={18} />
                AI Planner
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('todo')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'todo' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('done')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'done' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Done
            </button>
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600 mt-1 sm:mt-0">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-indigo-900">AI Daily Insight</h3>
                    <p className="text-indigo-700 text-sm mt-0.5">
                        {aiSuggestion || "Need guidance? Click 'Get Advice' to analyze your workload."}
                    </p>
                </div>
            </div>
            <button 
                onClick={triggerAdvice}
                className="shrink-0 text-sm font-medium bg-white text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
            >
                Get Advice
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Task List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Add */}
            <form onSubmit={handleAddTask} className="relative">
              <input 
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-xl shadow-sm border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Plus size={24} />
              </div>
              <button 
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </form>

            {/* Task List */}
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                   <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                      <List size={32} />
                   </div>
                   <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
                   <p className="text-gray-500">Add a task manually or use the AI Planner to get started.</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Stats tasks={tasks} />
            
            <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit size={100} />
                </div>
                <h3 className="text-lg font-bold mb-2 relative z-10">Smart Scheduling</h3>
                <p className="text-indigo-200 text-sm mb-4 relative z-10">
                    Use Gemini to break down complex projects into small steps automatically.
                </p>
                <button 
                    onClick={() => setIsAIModalOpen(true)}
                    className="w-full bg-white text-indigo-900 font-semibold py-2 rounded-lg hover:bg-indigo-50 transition-colors relative z-10"
                >
                    Open AI Planner
                </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => setIsAIModalOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-30"
      >
        <Sparkles size={24} />
      </button>

      <AISchedulerModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onAddTasks={handleAddAITasks}
      />
    </div>
  );
};

export default App;