import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Task, TaskStatus } from '../types';

interface StatsProps {
  tasks: Task[];
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6']; // Green, Yellow, Blue

export const Stats: React.FC<StatsProps> = ({ tasks }) => {
  const done = tasks.filter(t => t.status === TaskStatus.Done).length;
  const inProgress = tasks.filter(t => t.status === TaskStatus.InProgress).length;
  const todo = tasks.filter(t => t.status === TaskStatus.Todo).length;

  const data = [
    { name: 'Done', value: done },
    { name: 'In Progress', value: inProgress },
    { name: 'To Do', value: todo },
  ].filter(d => d.value > 0);

  if (tasks.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm italic">
        No tasks yet to visualize.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Progress Overview</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <span className="text-3xl font-bold text-gray-800">{Math.round((done / tasks.length) * 100) || 0}%</span>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Completion Rate</p>
      </div>
    </div>
  );
};