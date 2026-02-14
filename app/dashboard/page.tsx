"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskBoard from '@/components/TaskBoard';
import AddTaskModal from '@/components/AddTaskModal';
import ThemeToggle from '@/components/ThemeToggle';
import { LogOut, Plus } from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = (newTask: any) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    // Optimistic update
    setTasks((prev: any[]) => prev.filter((t) => t._id !== id));

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting task:', error);
      fetchTasks(); // Revert on error
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
     // Optimistic update
    setTasks((prev) => 
      prev.map((t) => (t._id === id ? { ...t, completed } : t))
    );

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
    } catch (error) {
      console.error('Error updating task:', error);
      fetchTasks();
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">My Tasks</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400"
            >
              <LogOut size={20} className="mr-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">To-Do List</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <Plus size={20} className="mr-1" />
            Add Task
          </button>
        </div>

        <TaskBoard
          tasks={tasks}
          setTasks={setTasks}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleComplete}
        />
      </main>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
}
