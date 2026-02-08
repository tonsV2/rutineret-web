import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import type { Routine, Task, TaskRequest, PatchedTaskRequest, RecurrenceTypeEnum } from '../types';
import Layout from '../components/layout/Layout';

interface TaskFormData extends TaskRequest {
  id?: number;
}

const RoutineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routineId = parseInt(id || '0');

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    routine: routineId,
    title: '',
    description: '',
    order: 0,
    recurrence_type: 'daily' as RecurrenceTypeEnum,
    recurrence_metadata: {}
  });

  // Recurrence options for simplified form
  const recurrenceOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'workdays', label: 'Workdays (Mon-Fri)' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const fetchRoutine = async () => {
    if (!routineId) return;

    try {
      setLoading(true);
      setError(null);
      const [routineResponse, tasksResponse] = await Promise.all([
        apiService.getRoutine(routineId),
        apiService.getTasks(routineId)
      ]);
      
      setRoutine(routineResponse.data);
      setTasks(tasksResponse.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (err) {
      setError('Failed to load routine details. Please try again.');
      console.error('Error fetching routine:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetTaskForm = () => {
    setTaskFormData({
      routine: routineId,
      title: '',
      description: '',
      order: tasks.length,
      recurrence_type: 'daily' as RecurrenceTypeEnum,
      recurrence_metadata: {}
    });
    setEditingTask(null);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) return;

    try {
      setSavingTask(true);
      
      if (editingTask) {
        await apiService.updateTask(editingTask.id, {
          title: taskFormData.title,
          description: taskFormData.description,
          recurrence_type: taskFormData.recurrence_type,
          recurrence_metadata: taskFormData.recurrence_metadata,
          order: taskFormData.order
        } as PatchedTaskRequest);
      } else {
        await apiService.createTask(taskFormData);
      }
      
      setShowTaskForm(false);
      resetTaskForm();
      await fetchRoutine();
    } catch (err) {
      setError(`Failed to ${editingTask ? 'update' : 'create'} task. Please try again.`);
      console.error('Error saving task:', err);
    } finally {
      setSavingTask(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskFormData({
      id: task.id,
      routine: task.routine,
      title: task.title,
      description: task.description,
      order: task.order,
      recurrence_type: task.recurrence_type,
      recurrence_metadata: task.recurrence_metadata
    });
    setShowTaskForm(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setDeletingTaskId(taskId);
      await apiService.deleteTask(taskId);
      await fetchRoutine();
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await apiService.completeTask(taskId);
      await fetchRoutine();
    } catch (err) {
      setError('Failed to complete task. Please try again.');
      console.error('Error completing task:', err);
    }
  };

  const handleReorderTasks = async (draggedIndex: number, hoveredIndex: number) => {
    if (draggedIndex === hoveredIndex) return;

    const reorderedTasks = [...tasks];
    const [draggedTask] = reorderedTasks.splice(draggedIndex, 1);
    reorderedTasks.splice(hoveredIndex, 0, draggedTask);

    // Update order values
    const taskIds = reorderedTasks.map(task => task.id);
    
    try {
      await apiService.reorderTasks(routineId, taskIds);
      await fetchRoutine();
    } catch (err) {
      setError('Failed to reorder tasks. Please try again.');
      console.error('Error reordering tasks:', err);
    }
  };

  useEffect(() => {
    fetchRoutine();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!routine) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900">Routine not found</h3>
              <p className="mt-1 text-sm text-gray-500">
                The routine you're looking for doesn't exist or you don't have access to it.
              </p>
              <button
                onClick={() => navigate('/routines')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Routines
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate('/routines')}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium mb-2 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Routines
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{routine.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {routine.description || 'Manage tasks for this routine'}
            </p>
          </div>
          <button
            onClick={() => {
              resetTaskForm();
              setShowTaskForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Task Creation Form */}
          {showTaskForm && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <form onSubmit={handleCreateTask}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={taskFormData.title}
                        onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        placeholder="Enter task title"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={taskFormData.description}
                        onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                        rows={3}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        placeholder="Optional task description"
                      />
                    </div>

                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        id="order"
                        value={taskFormData.order}
                        onChange={(e) => setTaskFormData({ ...taskFormData, order: parseInt(e.target.value) || 0 })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        min="0"
                      />
                    </div>

                    <div>
                      <label htmlFor="recurrence_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Recurrence
                      </label>
                      <select
                        id="recurrence_type"
                        value={taskFormData.recurrence_type}
                        onChange={(e) => setTaskFormData({ 
                          ...taskFormData, 
                          recurrence_type: e.target.value as RecurrenceTypeEnum 
                        })}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      >
                        {recurrenceOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTaskForm(false);
                        resetTaskForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingTask || !taskFormData.title.trim()}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingTask ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <div className="flex justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first task for this routine.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        resetTaskForm();
                        setShowTaskForm(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Your First Task
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onComplete={() => handleCompleteTask(task.id)}
                  onReorder={handleReorderTasks}
                  isDeleting={deletingTaskId === task.id}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

// Simple TaskCard component for now (will enhance with drag-and-drop)
const TaskCard: React.FC<{
  task: Task;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  isDeleting: boolean;
}> = ({ task, index, onEdit, onDelete, onComplete, onReorder, isDeleting }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDragOverIndex(null);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
      className={`bg-white overflow-hidden shadow rounded-lg border-2 transition-all cursor-move ${
        isDragging ? 'opacity-50' : ''
      } ${dragOverIndex === index ? 'border-blue-400' : 'border-transparent'}`}
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-6 h-6 mr-3 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
                <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                  <span>Recurrence: {task.recurrence_type}</span>
                  {task.is_due_today && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Due Today
                    </span>
                  )}
                  {task.is_completed_today && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed Today
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {task.is_due_today && !task.is_completed_today && (
              <button
                onClick={onComplete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>
            )}
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineDetailPage;