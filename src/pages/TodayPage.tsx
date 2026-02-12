import React, { useState, useEffect } from 'react';

import apiService from '../services/api';
import type { Task } from '../types';
import Layout from '../components/layout/Layout';
import { Link } from 'react-router-dom';

interface TaskGroup {
  routineName: string;
  tasks: Task[];
}

const TodayPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [togglingTaskIds, setTogglingTaskIds] = useState<Set<number>>(new Set());

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const fetchTodayTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const dateStr = formatDateForAPI(selectedDate);
      const response = await apiService.getTodayTasks(dateStr);
      setTasks(response.data.tasks);
    } catch (err) {
      setError('Failed to load today\'s tasks. Please try again.');
      console.error('Error fetching today\'s tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskCompletion = async (taskId: number) => {
    try {
      setTogglingTaskIds(prev => new Set(prev).add(taskId));
      const task = tasks.find(t => t.id === taskId);

      if (task?.is_completed_today) {
        await apiService.uncompleteTask(taskId);
      } else {
        await apiService.completeTask(taskId, {});
      }

      await fetchTodayTasks();
    } catch (err) {
      console.error('Error toggling task completion:', err);
      const error = err as any;
      if (error.response?.data?.error?.includes('today')) {
        setError('You can only uncomplete tasks that were completed today.');
      } else {
        setError('Failed to update task. Please try again.');
      }
    } finally {
      setTogglingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const canToggleTask = (task: Task): boolean => {
    if (!task.is_completed_today) return true;
    return isToday(selectedDate);
  };

  // Group tasks by routine
  const groupTasksByRoutine = (): TaskGroup[] => {
    const groups: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (!groups[task.routine_name]) {
        groups[task.routine_name] = [];
      }
      groups[task.routine_name].push(task);
    });

    // Sort tasks within each routine by order, then sort groups alphabetically
    return Object.entries(groups)
      .map(([routineName, routineTasks]) => ({
        routineName,
        tasks: routineTasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      }))
      .sort((a, b) => a.routineName.localeCompare(b.routineName));
  };

  const taskGroups = groupTasksByRoutine();
  const completedCount = tasks.filter(task => task.is_completed_today).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    fetchTodayTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <Layout>
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Today's Tasks</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-0 sm:px-6 lg:px-8">
        <div className="px-4 py-0 sm:px-0">
          {/* Date Navigation */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => changeDate(-1)}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {formatDateForDisplay(selectedDate)}
                    </h2>
                    {isToday(selectedDate) && (
                      <span className="text-sm text-blue-600 font-medium">Today</span>
                    )}
                  </div>
                  <button
                    onClick={() => changeDate(1)}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Progress Overview
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {completedCount} of {totalCount} tasks completed
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

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

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Tasks by Routine */}
          {!loading && taskGroups.length > 0 && (
            <div className="space-y-6">
              {taskGroups.map((group, index) => (
                <div key={`${group.routineName}-${index}`} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {group.routineName}
                    </h3>
                    <div className="space-y-3">
                      {group.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={`flex items-center justify-between p-4 border rounded-lg ${
                            task.is_completed_today 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              task.is_completed_today ? 'text-green-800 line-through' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className={`text-sm mt-1 ${
                                task.is_completed_today ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center mt-2 space-x-4">
                              <span className="text-xs text-gray-500">
                                Order: {task.order}
                              </span>
                              <span className="text-xs text-gray-500">
                                Recurrence: {task.recurrence_type}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {!task.is_completed_today ? (
                              <button
                                onClick={() => handleToggleTaskCompletion(task.id)}
                                disabled={togglingTaskIds.has(task.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {togglingTaskIds.has(task.id) ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Completing...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Complete
                                  </>
                                )}
                              </button>
                            ) : canToggleTask(task) ? (
                              <button
                                onClick={() => handleToggleTaskCompletion(task.id)}
                                disabled={togglingTaskIds.has(task.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                {togglingTaskIds.has(task.id) ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="sr-only">Uncompleting...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Completed
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && taskGroups.length === 0 && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="flex justify-center">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks scheduled</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isToday(selectedDate) 
                    ? "You don't have any tasks scheduled for today." 
                    : `You don't have any tasks scheduled for ${formatDateForDisplay(selectedDate)}.`
                  }
                </p>
                <div className="mt-6">
                  <Link
                    to="/routines"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Manage Routines
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default TodayPage;