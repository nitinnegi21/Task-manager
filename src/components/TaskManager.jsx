import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Check, X, Filter, BarChart3, Calendar, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { ServiceCall } from '../utility/servicecall';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
    high_priority_tasks: 0,
    medium_priority_tasks: 0,
    low_priority_tasks: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  // Auto-hide messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await ServiceCall.getv2('/tasks');
      
      // Handle the wrapped response structure
      const tasksData = response.data.data.tasks || [];
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError(error.response?.data?.error || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await ServiceCall.getv2('/tasks/stats');
      
      // Handle the wrapped response structure
      const statsData = response.data.data || {};
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError(error.response?.data?.error || 'Failed to fetch statistics');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'completed': return task.completed;
      case 'pending': return !task.completed;
      case 'high': return task.priority === 'high';
      default: return true;
    }
  });

  // Create task
  const createTask = async (taskData) => {
    try {
      setLoading(true);
      const response = await ServiceCall.postv2('/tasks', '', taskData);
      
      // Handle the wrapped response structure
      const newTask = response.data.data;
      
      setTasks([newTask, ...tasks]);
      resetForm();
      setError('');
      setSuccessMessage('Task created successfully');
      fetchStats();
    } catch (error) {
      console.error('Failed to create task:', error);
      setError(error.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  // Update task
  const updateTask = async (taskId, taskData) => {
    try {
      setLoading(true);
      const response = await ServiceCall.putv2('/tasks/', taskId, taskData);
      
      // Handle the wrapped response structure
      const updatedTask = response.data.data;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      setEditingTask(null);
      resetForm();
      setError('');
      setSuccessMessage('Task updated successfully');
      fetchStats();
    } catch (error) {
      console.error('Failed to update task:', error);
      setError(error.response?.data?.error || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      setLoading(true);
      await ServiceCall.deletev2('/tasks/', taskId);
      
      setTasks(tasks.filter(task => task.id !== taskId));
      setError('');
      setSuccessMessage('Task deleted successfully');
      fetchStats();
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError(error.response?.data?.error || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId) => {
    try {
      setLoading(true);
      const response = await ServiceCall.patchv2('/tasks/', `${taskId}/toggle`, {});
      
      // Handle the wrapped response structure
      const updatedTask = response.data.data;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      setSuccessMessage(updatedTask.completed ? 'Task completed' : 'Task marked as pending');
      fetchStats();
    } catch (error) {
      console.error('Failed to toggle task:', error);
      setError(error.response?.data?.error || 'Failed to toggle task');
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: ''
    });
    setShowAddForm(false);
    setEditingTask(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    // Prepare data for API
    const taskData = {
      ...formData,
      due_date: formData.due_date ? formData.due_date + 'T00:00:00Z' : null
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      createTask(taskData);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setShowAddForm(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400/20 bg-red-400/10';
      case 'medium': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
      case 'low': return 'text-green-400 border-green-400/20 bg-green-400/10';
      default: return 'text-gray-400 border-gray-400/20 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-3">
            <Loader className="animate-spin text-blue-400" size={24} />
            <span className="text-gray-100 font-medium">Loading...</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg border border-green-500">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                Task Manager
              </h1>
              <p className="text-gray-400">Organize and manage your tasks efficiently</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {setShowStats(!showStats); fetchStats();}}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg border border-gray-600 transition-colors font-medium"
              >
                <BarChart3 size={20} />
                Statistics
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-400" size={20} />
                <p className="text-red-200 font-medium">{error}</p>
              </div>
              <button 
                onClick={() => setError('')} 
                className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Statistics Panel */}
        {showStats && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-400" size={24} />
              Task Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total', value: stats.total_tasks, color: 'text-gray-400' },
                { label: 'Completed', value: stats.completed_tasks, color: 'text-green-400' },
                { label: 'Pending', value: stats.pending_tasks, color: 'text-yellow-400' },
                { label: 'High Priority', value: stats.high_priority_tasks, color: 'text-red-400' },
                { label: 'Medium Priority', value: stats.medium_priority_tasks, color: 'text-yellow-400' },
                { label: 'Low Priority', value: stats.low_priority_tasks, color: 'text-green-400' }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-blue-400" size={20} />
            <h3 className="text-lg font-semibold text-gray-100">Filter Tasks</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Tasks' },
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Completed' },
              { key: 'high', label: 'High Priority' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white border border-blue-500'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Add/Edit Task Form */}
        {showAddForm && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center gap-2">
              {editingTask ? <Edit className="text-blue-400" size={24} /> : <Plus className="text-green-400" size={24} />}
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-100 placeholder-gray-400"
                  rows="3"
                  placeholder="Add task description..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={20} />
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg font-medium border border-gray-600 transition-colors"
                >
                  <X size={20} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              Your Tasks
              <span className="text-sm bg-gray-700 text-gray-300 px-2 py-1 rounded-lg font-medium">
                {filteredTasks.length}
              </span>
            </h2>
          </div>
          
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-6">Create your first task to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Create First Task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-6 hover:bg-gray-750 transition-colors ${
                    task.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-500 hover:border-green-500 text-transparent hover:text-green-500'
                      }`}
                    >
                      {task.completed && <Check size={14} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3
                              className={`text-lg font-medium transition-all ${
                                task.completed
                                  ? 'line-through text-gray-500'
                                  : 'text-gray-100'
                              }`}
                            >
                              {task.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-400 mb-3 text-sm">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-gray-500 text-sm">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(task)}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit task"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;