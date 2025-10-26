// frontend/src/services/taskService.js
import api from './api';

export const taskService = {
  // Get all tasks for a project
  getProjectTasks: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      console.log('🔄 TaskService: Fetching tasks for project:', projectId);
      const response = await api.get(`/projects/${projectId}/tasks?${params.toString()}`);
      console.log('✅ TaskService: Tasks fetched successfully');
      return response.data;
    } catch (error) {
      console.error('💥 TaskService: Get project tasks error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new task
  createTask: async (projectId, taskData) => {
    try {
      console.log('🔄 TaskService: Creating task for project:', projectId);
      console.log('📝 TaskService: Task data:', taskData);
      
      const response = await api.post(`/projects/${projectId}/tasks`, taskData);
      console.log('✅ TaskService: Task created successfully');
      return response.data;
    } catch (error) {
      console.error('💥 TaskService: Create task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a specific task
  getTask: async (projectId, taskId) => {
    try {
      console.log('🔄 TaskService: Fetching task:', taskId);
      const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
      console.log('✅ TaskService: Task fetched successfully');
      return response.data;
    } catch (error) {
      console.error('💥 TaskService: Get task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update a task - IMPROVED ERROR HANDLING AND LOGGING
  updateTask: async (projectId, taskId, updateData) => {
    try {
      console.log('🔄 TaskService: Updating task', { projectId, taskId, updateData });
      
      // Sanitize the update data before sending
      const sanitizedData = {};
      
      Object.keys(updateData).forEach(key => {
        const value = updateData[key];
        
        // Handle different data types appropriately
        if (key === 'title') {
          // Title is required, never send empty
          if (value && value.trim()) {
            sanitizedData[key] = value.trim();
          }
        } else if (key === 'description') {
          // Description can be empty/null
          sanitizedData[key] = value && value.trim() ? value.trim() : null;
        } else if (key === 'assigned_to') {
          // Assigned user can be null/empty for unassigned
          sanitizedData[key] = value && value.trim() ? value.trim() : null;
        } else if (key === 'estimated_hours' || key === 'actual_hours') {
          // Numeric fields
          if (value === null || value === undefined || value === '') {
            sanitizedData[key] = null;
          } else {
            const numValue = parseInt(value);
            sanitizedData[key] = isNaN(numValue) ? null : numValue;
          }
        } else if (key === 'due_date') {
          // Date field
          if (value === null || value === undefined || value === '') {
            sanitizedData[key] = null;
          } else {
            try {
              // Ensure it's a valid ISO date string
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                sanitizedData[key] = date.toISOString();
              }
            } catch (dateError) {
              console.warn('⚠️ TaskService: Invalid date provided:', value);
              // Don't include invalid dates
            }
          }
        } else {
          // Other fields (status, priority, task_type)
          sanitizedData[key] = value;
        }
      });
      
      console.log('📝 TaskService: Sanitized update data:', sanitizedData);
      
      // Make sure we have something to update
      if (Object.keys(sanitizedData).length === 0) {
        throw new Error('No valid fields provided for update');
      }
      
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, sanitizedData);
      
      console.log('✅ TaskService: Update response', response.data);
      return response.data;
      
    } catch (error) {
      console.error('💥 TaskService: Update error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        projectId,
        taskId,
        updateData
      });
      
      // Enhance error message for better user feedback
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      } else if (error.response?.status === 404) {
        error.message = 'Task or project not found';
      } else if (error.response?.status === 403) {
        error.message = 'You do not have permission to update this task';
      } else if (error.response?.status === 400) {
        error.message = error.response.data?.message || 'Invalid task data provided';
      } else if (!error.message) {
        error.message = 'Failed to update task';
      }
      
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (projectId, taskId) => {
    try {
      console.log('🔄 TaskService: Deleting task:', taskId);
      const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      console.log('✅ TaskService: Task deleted successfully');
      return response.data;
    } catch (error) {
      console.error('💥 TaskService: Delete task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get task statistics
  getTaskStats: async (projectId) => {
    try {
      console.log('🔄 TaskService: Fetching task stats for project:', projectId);
      const response = await api.get(`/projects/${projectId}/tasks/stats`);
      console.log('✅ TaskService: Task stats fetched successfully');
      return response.data;
    } catch (error) {
      console.error('💥 TaskService: Get task stats error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update task status (quick action)
  updateTaskStatus: async (projectId, taskId, status) => {
    try {
      console.log('🔄 TaskService: Updating task status to:', status);
      const response = await taskService.updateTask(projectId, taskId, { status });
      console.log('✅ TaskService: Task status updated successfully');
      return response;
    } catch (error) {
      console.error('💥 TaskService: Update task status error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Assign task to user (quick action)
  assignTask: async (projectId, taskId, userId) => {
    try {
      console.log('🔄 TaskService: Assigning task to user:', userId);
      const response = await taskService.updateTask(projectId, taskId, { assigned_to: userId });
      console.log('✅ TaskService: Task assigned successfully');
      return response;
    } catch (error) {
      console.error('💥 TaskService: Assign task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Unassign task (quick action)
  unassignTask: async (projectId, taskId) => {
    try {
      console.log('🔄 TaskService: Unassigning task');
      const response = await taskService.updateTask(projectId, taskId, { assigned_to: null });
      console.log('✅ TaskService: Task unassigned successfully');
      return response;
    } catch (error) {
      console.error('💥 TaskService: Unassign task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update task priority (quick action)
  updateTaskPriority: async (projectId, taskId, priority) => {
    try {
      console.log('🔄 TaskService: Updating task priority to:', priority);
      const response = await taskService.updateTask(projectId, taskId, { priority });
      console.log('✅ TaskService: Task priority updated successfully');
      return response;
    } catch (error) {
      console.error('💥 TaskService: Update task priority error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark task as completed
  completeTask: async (projectId, taskId) => {
    try {
      console.log('🔄 TaskService: Marking task as completed');
      const response = await taskService.updateTask(projectId, taskId, { status: 'completed' });
      console.log('✅ TaskService: Task completed successfully');
      return response;
    } catch (error) {
      console.error('💥 TaskService: Complete task error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Start working on task
  startTask: async (projectId, taskId) => {
    try {
      console.log('🔄 TaskService: Starting task');
      const response = await taskService.updateTask(projectId, taskId, { status: 'in_progress' });
      console.log('✅ TaskService: Task started successfully');
      return response;
    } catch (error) {
      console.error('💥 TaskService: Start task error:', error.response?.data || error.message);
      throw error;
    }
  }
};