export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent'
}

export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'In Progress',
  Done = 'Done'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string; // ISO Date string
  estimatedMinutes?: number;
  tags: string[];
  createdAt: number;
}

export interface AIAnalysisResult {
  tasks: Array<{
    title: string;
    description: string;
    priority: Priority;
    estimatedMinutes: number;
  }>;
}