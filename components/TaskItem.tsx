"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Calendar, CheckSquare, Square } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Task {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  completed: boolean;
  dueDate?: string;
}

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export default function TaskItem({ task, onDelete, onToggleComplete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!task.dueDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const due = new Date(task.dueDate!).getTime();
      const distance = due - now;

      if (distance < 0) {
        setTimeLeft('Overdue');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [task.dueDate]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start p-4 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${task.completed ? 'opacity-70' : ''}`}
    >
      <div {...attributes} {...listeners} className="mt-1 cursor-move mr-3 text-gray-400 hover:text-gray-600">
        <GripVertical size={20} />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleComplete(task._id, !task.completed)}
              className="text-gray-500 hover:text-green-500 transition-colors"
            >
              {task.completed ? <CheckSquare size={20} className="text-green-500" /> : <Square size={20} />}
            </button>
            <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
              {task.title}
            </h3>
          </div>
          <button onClick={() => onDelete(task._id)} className="text-red-400 hover:text-red-600">
            <Trash2 size={18} />
          </button>
        </div>

        {task.description && <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">{task.description}</p>}

        {task.imageUrl && (
          <div className="mt-2 relative w-full h-40 max-w-md">
             <Image src={task.imageUrl} alt={task.title} fill className="object-cover rounded-md" />
          </div>
        )}

        {task.dueDate && (
          <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
            <Calendar size={14} className="mr-1" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            <span className="ml-2 font-mono text-xs bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
              {timeLeft}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
