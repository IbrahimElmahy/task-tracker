import React, { useState } from 'react';
import { breakDownTask } from '../services/geminiService';
import { Priority } from '../types';
import { Loader2, Sparkles, X } from 'lucide-react';

interface AISchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: any[]) => void;
}

export const AISchedulerModal: React.FC<AISchedulerModalProps> = ({ isOpen, onClose, onAddTasks }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const subtasks = await breakDownTask(goal);
      onAddTasks(subtasks);
      onClose();
      setGoal('');
    } catch (err) {
      setError("Failed to generate tasks. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex justify-between items-center text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles size={20} />
              AI Task Breakdown
            </h2>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-indigo-100 mt-2 text-sm">
            Enter a complex goal (e.g., "Plan a 3-day trip to Paris" or "Learn Typescript") and let Gemini break it down into actionable steps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What is your main goal?
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] resize-none"
            placeholder="e.g., Create a marketing plan for Q4..."
            autoFocus
          />
          
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !goal.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg shadow-md transition-all flex items-center gap-2 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Quick Fix: Import AlertCircle since I used it but forgot to import it in the top block
import { AlertCircle } from 'lucide-react';
