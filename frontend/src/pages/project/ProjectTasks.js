// frontend/src/pages/project/ProjectTasks.js - WITH SIDEBAR TOGGLE
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { PanelLeft } from 'lucide-react';

// Background symbols component - WITH FLOATING ANIMATIONS
const BackgroundSymbols = () => (
  <>
    <style>
      {`
        @keyframes floatAround1 {
          0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
          25% { transform: translate(20px, -15px) rotate(-5deg); }
          50% { transform: translate(-10px, 20px) rotate(-15deg); }
          75% { transform: translate(15px, 5px) rotate(-8deg); }
        }
        @keyframes floatAround2 {
          0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
          33% { transform: translate(-20px, 10px) rotate(-33deg); }
          66% { transform: translate(25px, -8px) rotate(-42deg); }
        }
        @keyframes floatAround3 {
          0%, 100% { transform: translate(0, 0) rotate(34.77deg); }
          50% { transform: translate(-15px, 25px) rotate(39deg); }
        }
        @keyframes floatAround4 {
          0%, 100% { transform: translate(0, 0) rotate(28.16deg); }
          40% { transform: translate(18px, -20px) rotate(33deg); }
          80% { transform: translate(-12px, 15px) rotate(23deg); }
        }
        @keyframes floatAround5 {
          0%, 100% { transform: translate(0, 0) rotate(24.5deg); }
          50% { transform: translate(22px, 20px) rotate(29deg); }
        }
        @keyframes floatAround6 {
          0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
          33% { transform: translate(-18px, -15px) rotate(30deg); }
          66% { transform: translate(20px, 18px) rotate(20deg); }
        }
        @keyframes floatAround7 {
          0%, 100% { transform: translate(0, 0) rotate(-19.68deg); }
          25% { transform: translate(15px, 20px) rotate(-14deg); }
          75% { transform: translate(-20px, -10px) rotate(-24deg); }
        }
        @keyframes floatAround8 {
          0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
          50% { transform: translate(-25px, 25px) rotate(-2deg); }
        }
        @keyframes floatAround9 {
          0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
          35% { transform: translate(20px, -18px) rotate(30deg); }
          70% { transform: translate(-15px, 20px) rotate(20deg); }
        }
        @keyframes floatAround10 {
          0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
          50% { transform: translate(18px, -22px) rotate(-11deg); }
        }
        @keyframes floatAround11 {
          0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
          33% { transform: translate(-22px, 15px) rotate(-5deg); }
          66% { transform: translate(20px, -18px) rotate(-15deg); }
        }
        @keyframes floatAround12 {
          0%, 100% { transform: translate(0, 0) rotate(18.2deg); }
          50% { transform: translate(-20px, 28px) rotate(23deg); }
        }
        @keyframes floatAround13 {
          0%, 100% { transform: translate(0, 0) rotate(37.85deg); }
          40% { transform: translate(25px, -15px) rotate(42deg); }
          80% { transform: translate(-18px, 20px) rotate(32deg); }
        }
        @keyframes floatAround14 {
          0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
          50% { transform: translate(20px, 25px) rotate(-32deg); }
        }
        @keyframes floatAround15 {
          0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
          25% { transform: translate(-15px, -20px) rotate(-42deg); }
          75% { transform: translate(22px, 18px) rotate(-32deg); }
        }
        @keyframes floatAround16 {
          0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
          50% { transform: translate(-28px, 22px) rotate(-5deg); }
        }
        @keyframes floatAround17 {
          0%, 100% { transform: translate(0, 0) rotate(15deg); }
          33% { transform: translate(18px, -25px) rotate(20deg); }
          66% { transform: translate(-20px, 20px) rotate(10deg); }
        }
        @keyframes floatAround18 {
          0%, 100% { transform: translate(0, 0) rotate(-45deg); }
          50% { transform: translate(25px, -20px) rotate(-40deg); }
        }
        @keyframes floatAround19 {
          0%, 100% { transform: translate(0, 0) rotate(30deg); }
          40% { transform: translate(-22px, 18px) rotate(35deg); }
          80% { transform: translate(20px, -15px) rotate(25deg); }
        }
        @keyframes floatAround20 {
          0%, 100% { transform: translate(0, 0) rotate(-20deg); }
          50% { transform: translate(-18px, 28px) rotate(-15deg); }
        }
        @keyframes floatAround21 {
          0%, 100% { transform: translate(0, 0) rotate(40deg); }
          33% { transform: translate(20px, -22px) rotate(45deg); }
          66% { transform: translate(-25px, 18px) rotate(35deg); }
        }
        
        @keyframes globalLogoRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .floating-symbol {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        .global-loading-spinner {
          animation: globalLogoRotate 2s linear infinite;
        }
        
        .floating-symbol:nth-child(1) { animation: floatAround1 12s infinite; }
        .floating-symbol:nth-child(2) { animation: floatAround2 15s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(3) { animation: floatAround3 18s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(4) { animation: floatAround4 14s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(5) { animation: floatAround5 16s infinite; animation-delay: -1s; }
        .floating-symbol:nth-child(6) { animation: floatAround6 13s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(7) { animation: floatAround7 17s infinite; animation-delay: -8s; }
        .floating-symbol:nth-child(8) { animation: floatAround8 19s infinite; animation-delay: -3s; }
        .floating-symbol:nth-child(9) { animation: floatAround9 11s infinite; animation-delay: -7s; }
        .floating-symbol:nth-child(10) { animation: floatAround10 20s infinite; animation-delay: -9s; }
        .floating-symbol:nth-child(11) { animation: floatAround11 14s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(12) { animation: floatAround12 16s infinite; animation-delay: -10s; }
        .floating-symbol:nth-child(13) { animation: floatAround13 12s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(14) { animation: floatAround14 15s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(15) { animation: floatAround15 18s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(16) { animation: floatAround16 13s infinite; animation-delay: -8s; }
        .floating-symbol:nth-child(17) { animation: floatAround17 17s infinite; animation-delay: -3s; }
        .floating-symbol:nth-child(18) { animation: floatAround18 14s infinite; animation-delay: -7s; }
        .floating-symbol:nth-child(19) { animation: floatAround19 16s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(20) { animation: floatAround20 19s infinite; animation-delay: -9s; }
        .floating-symbol:nth-child(21) { animation: floatAround21 15s infinite; animation-delay: -6s; }
      `}
    </style>
    
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      pointerEvents: 'none'
    }}>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '52.81%', top: '48.12%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '28.19%', top: '71.22%', color: '#292A2E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '95.09%', top: '48.12%', color: '#ABB5CE'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '86.46%', top: '15.33%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '7.11%', top: '80.91%', color: '#ABB5CE'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '48.06%', top: '8.5%', color: '#ABB5CE'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '72.84%', top: '4.42%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '9.6%', top: '0%', color: '#1F232E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '31.54%', top: '54.31%', color: '#6C758E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '25.28%', top: '15.89%', color: '#1F232E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '48.55%', top: '82.45%', color: '#292A2E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '24.41%', top: '92.02%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '0%', top: '12.8%', color: '#ABB5CE'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '81.02%', top: '94.27%', color: '#6C758E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '96.02%', top: '0%', color: '#2E3344'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '0.07%', top: '41.2%', color: '#6C758E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '15%', top: '35%', color: '#3A4158'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '65%', top: '25%', color: '#5A6B8C'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '85%', top: '65%', color: '#2B2F3E'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '42%', top: '35%', color: '#4F5A7A'
      }}>&#60;/&#62;</div>
      <div className="floating-symbol" style={{
        position: 'absolute',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontStyle: 'normal',
        fontWeight: 900,
        fontSize: '24px',
        lineHeight: '29px',
        userSelect: 'none',
        pointerEvents: 'none',
        left: '12%', top: '60%', color: '#8A94B8'
      }}>&#60;/&#62;</div>
    </div>
  </>
);

function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectOwner, setProjectOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSuccess, setShowSuccess] = useState(null);

  // NEW STATE: Track sidebar collapsed state
  // This stores whether the sidebar is currently collapsed (true) or expanded (false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load the saved sidebar state from localStorage when the component first loads
    const saved = localStorage.getItem('projectSidebarCollapsed');
    return saved === 'true';
  });

  // NEW: Function to toggle sidebar
  // When clicked, this flips the sidebar between collapsed and expanded states
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    // Save the new state to localStorage so it persists across page reloads
    localStorage.setItem('projectSidebarCollapsed', newCollapsedState.toString());
    
    // Dispatch a custom event so other components (like the actual sidebar) can react to this change
    window.dispatchEvent(new CustomEvent('projectSidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  // NEW: Sync with sidebar toggle events
  // Listen for toggle events from other components (like if the sidebar itself has a toggle button)
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('projectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('projectSidebarToggle', handleSidebarToggle);
  }, []);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    task_type: 'development',
    priority: 'medium',
    status: 'todo',
    assigned_to: '',
    estimated_hours: '',
    due_date: ''
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await projectService.getProjectById(projectId);
        setProject(projectResponse.data.project);
        
        try {
          const membersResponse = await projectService.getProjectMembers(projectId);
          const { owner, members } = membersResponse.data;
          
          setProjectOwner(owner);
          setProjectMembers(members || []);
        } catch (memberError) {
          setProjectMembers([]);
          setProjectOwner(null);
        }
      } catch (error) {
        setError('Failed to load project data');
      }
    };

    fetchProjectData();
  }, [projectId]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskService.getProjectTasks(projectId, {
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      setTasks(response.data.tasks || []);
    } catch (error) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, sortBy, sortOrder]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const showSuccessMessage = (message) => {
    setShowSuccess(message);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const createTask = async () => {
  try {
    const taskData = {
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || undefined,
      task_type: taskForm.task_type || 'development',
      priority: taskForm.priority || 'medium',
      status: taskForm.status || 'todo',
      assigned_to: taskForm.assigned_to && taskForm.assigned_to.trim() ? taskForm.assigned_to.trim() : undefined,
      estimated_hours: taskForm.estimated_hours && taskForm.estimated_hours.trim() ? parseInt(taskForm.estimated_hours) : undefined,
      due_date: taskForm.due_date && taskForm.due_date.trim() ? new Date(taskForm.due_date).toISOString() : undefined
    };

    const response = await taskService.createTask(projectId, taskData);
    setTasks(prevTasks => [response.data.task, ...prevTasks]);
    
    // ✅ LOG ACTIVITY FOR TASK CREATION
    try {
      await projectService.logActivity(projectId, {
        action: 'created task',
        target: response.data.task.title,
        type: 'task_created',
        metadata: { 
          taskId: response.data.task.id,
          priority: response.data.task.priority
        }
      });
      console.log('✅ Activity logged: task created');
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
    }
    
    setShowCreateModal(false);
    resetForm();
    setError(null);
    showSuccessMessage('Task created successfully');
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create task';
    setError(errorMessage);
  }
};

  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      task_type: task.task_type || 'development',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      assigned_to: task.assigned_to || '',
      estimated_hours: task.estimated_hours || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
    });
    setError(null);
    setShowCreateModal(true);
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
        // Get task title before deletion
        const taskToDelete = tasks.find(t => t.id === taskId);
        const taskTitle = taskToDelete?.title || 'Unknown Task';
        
        await taskService.deleteTask(projectId, taskId);
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        
        // ⭐ LOG ACTIVITY FOR TASK DELETION ⭐
        try {
            await projectService.logActivity(projectId, {
                action: 'deleted task',
                target: taskTitle,
                type: 'project_updated',
                metadata: { taskId: taskId }
            });
            console.log('✅ Activity logged for task deletion');
        } catch (activityError) {
            console.error('Failed to log activity:', activityError);
        }
        
        showSuccessMessage('Task deleted successfully');
    } catch (error) {
        setError('Failed to delete task');
    }
};

  const viewTaskDetail = (taskId) => {
    navigate(`/project/${projectId}/tasks/${taskId}`);
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      task_type: 'development',
      priority: 'medium',
      status: 'todo',
      assigned_to: '',
      estimated_hours: '',
      due_date: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setError(null);
      
      if (editingTask) {
        const taskData = {};
        
        if (taskForm.title.trim() !== editingTask.title) taskData.title = taskForm.title.trim();
        if (taskForm.description !== editingTask.description) taskData.description = taskForm.description.trim() || null;
        if (taskForm.task_type !== editingTask.task_type) taskData.task_type = taskForm.task_type || 'development';
        if (taskForm.priority !== editingTask.priority) taskData.priority = taskForm.priority || 'medium';
        if (taskForm.status !== editingTask.status) taskData.status = taskForm.status || 'todo';
        
        const currentAssignedTo = editingTask.assigned_to || '';
        const newAssignedTo = taskForm.assigned_to?.trim() || '';
        if (currentAssignedTo !== newAssignedTo) taskData.assigned_to = newAssignedTo || null;
        
        const currentEstimatedHours = editingTask.estimated_hours || '';
        const newEstimatedHours = taskForm.estimated_hours?.toString().trim() || '';
        if (currentEstimatedHours.toString() !== newEstimatedHours) {
          taskData.estimated_hours = newEstimatedHours ? parseInt(newEstimatedHours) : null;
        }
        
        const currentDueDate = editingTask.due_date ? new Date(editingTask.due_date).toISOString().split('T')[0] : '';
        const newDueDate = taskForm.due_date?.trim() || '';
        if (currentDueDate !== newDueDate) {
          taskData.due_date = newDueDate ? new Date(newDueDate).toISOString() : null;
        }
        
        if (Object.keys(taskData).length === 0) {
          setShowCreateModal(false);
          setEditingTask(null);
          resetForm();
          return;
        }
        
        const response = await taskService.updateTask(projectId, editingTask.id, taskData);
        
        if (response.success && response.data?.task) {
          setTasks(prevTasks => 
              prevTasks.map(task => 
                  task.id === editingTask.id ? { ...task, ...response.data.task } : task
              )
          );
          
          // ⭐ LOG ACTIVITY FOR TASK UPDATE ⭐
          try {
              await projectService.logActivity(projectId, {
                  action: 'updated task',
                  target: response.data.task.title,
                  type: 'project_updated',
                  metadata: { 
                      taskId: editingTask.id,
                      updatedFields: Object.keys(taskData)
                  }
              });
              console.log('✅ Activity logged for task update');
          } catch (activityError) {
              console.error('Failed to log activity:', activityError);
          }
          
          showSuccessMessage('Task updated successfully');
          setShowCreateModal(false);
          setEditingTask(null);
          resetForm();
        } else {
          throw new Error(response.message || 'Update failed');
        }
      } else {
        await createTask();
      }
    } catch (error) {
      let errorMessage = 'Failed to save task';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.response?.status === 400 && error.response.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        errorMessage = `Validation failed: ${validationErrors}`;
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this task';
      } else if (error.response?.status === 404) {
        errorMessage = 'Task or project not found';
      }
      
      setError(errorMessage);
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'my_tasks': return task.assigned_to === user.id;
      case 'todo': return task.status === 'todo';
      case 'in_progress': return task.status === 'in_progress';
      case 'in_review': return task.status === 'in_review';
      case 'completed': return task.status === 'completed';
      case 'blocked': return task.status === 'blocked';
      default: return true;
    }
  });

  const canCreateTasks = project && (project.owner_id === user.id);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getMemberName = (userId) => {
    if (!userId) return 'Unassigned';
    
    if (projectOwner && projectOwner.id === userId) {
      return `${projectOwner.full_name || projectOwner.username} (Owner)`;
    }
    
    const member = projectMembers.find(m => m.users?.id === userId);
    if (member && member.users) {
      return member.users.full_name || member.users.username;
    }
    
    return 'Unknown';
  };

  const getAllAssignableMembers = () => {
    const assignableMembers = [];
    
    if (projectOwner) {
      assignableMembers.push({
        id: projectOwner.id,
        name: projectOwner.full_name || projectOwner.username,
        role: 'Owner',
        email: projectOwner.email
      });
    }
    
    projectMembers.forEach(member => {
      if (member.users) {
        assignableMembers.push({
          id: member.users.id,
          name: member.users.full_name || member.users.username,
          role: member.role,
          email: member.users.email
        });
      }
    });
    
    return assignableMembers;
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': '#6c757d',
      'in_progress': '#3b82f6',
      'in_review': '#f59e0b',
      'completed': '#10b981',
      'blocked': '#ef4444'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusTextColor = (status) => {
    return ['in_review'].includes(status) ? '#000' : '#fff';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#10b981',
      'medium': '#f59e0b',
      'high': '#f97316',
      'urgent': '#ef4444'
    };
    return colors[priority] || '#6c757d';
  };

  const renderSuccessMessage = () => {
    if (!showSuccess) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '12px 24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
        color: 'white',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✓</span>
          <span>{showSuccess}</span>
        </div>
      </div>
    );
  };

  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.1))',
        color: '#fca5a5',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ef4444', fontSize: '16px' }}>⚠</span>
          <span>{error}</span>
        </div>
      </div>
    );
  };

  const styles = {
    // NEW: Toggle button styles
    // This is the button that floats on the page and toggles the sidebar
    toggleButton: {
      position: 'fixed',
      top: '20px',
      left: isSidebarCollapsed ? '100px' : '290px', // Moves left/right based on sidebar state
      zIndex: 1100, // High z-index so it stays on top
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: 'rgba(26, 28, 32, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#9ca3af',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease', // Smooth animation when sidebar toggles
      backdropFilter: 'blur(20px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    container: {
      minHeight: 'calc(100vh - 40px)',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingLeft: '120px',  // Fixed value for both states
      transition: 'padding-left 0.3s ease'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    headerLeft: { flex: 1 },
    headerRight: { display: 'flex', gap: '12px' },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 8px 0'
    },
    subtitle: {
      color: '#d1d5db',
      fontSize: '16px',
      margin: 0
    },
    createButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
    },
    controls: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      backdropFilter: 'blur(20px)'
    },
    filterGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    filterLabel: {
      color: '#d1d5db',
      fontSize: '14px',
      fontWeight: '500'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none'
    },
    sortControls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    actionButton: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    refreshButton: {
      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    tasksGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '24px',
      marginBottom: '30px'
    },
    taskCard: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    taskHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    taskTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'white',
      margin: '0 0 8px 0',
      flex: 1,
      lineHeight: '1.4'
    },
    taskMeta: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
      flexWrap: 'wrap'
    },
    statusBadge: {
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    priorityBadge: {
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: 'white'
    },
    taskDescription: {
      color: '#d1d5db',
      fontSize: '14px',
      marginBottom: '16px',
      lineHeight: '1.5',
      opacity: 0.8
    },
    taskFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    taskInfo: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    taskActions: {
      display: 'flex',
      gap: '8px'
    },
    viewButton: {
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    editButton: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    deleteButton: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    emptyState: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px 20px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      backdropFilter: 'blur(20px)'
    },
    emptyTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '12px'
    },
    emptyText: {
      color: '#9ca3af',
      fontSize: '16px',
      marginBottom: '24px'
    },
    loading: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      minHeight: '400px',
      fontSize: '18px',
      color: '#9ca3af'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(8px)'
    },
    modalContent: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.98), rgba(15, 17, 22, 0.95))',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '32px',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    modalHeader: {
      marginBottom: '24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '16px'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
      color: 'white'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#d1d5db',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none',
      transition: 'border-color 0.3s ease'
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none',
      resize: 'vertical',
      transition: 'border-color 0.3s ease'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none',
      transition: 'border-color 0.3s ease'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px',
      paddingTop: '20px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    saveButton: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    cancelButton: {
      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8))',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    memberNote: {
      color: '#9ca3af',
      fontSize: '12px',
      marginTop: '4px',
      fontStyle: 'italic'
    }
  };

  if (loading) {
    return (
      <>
        {/* Sidebar Toggle Button - OUTSIDE CONTAINER */}
        <button
          style={styles.toggleButton}
          onClick={toggleSidebar}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
            e.currentTarget.style.color = '#3b82f6';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft size={20} />
        </button>

        <div style={styles.container}>
          <BackgroundSymbols />
          <div style={styles.loading}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} className="global-loading-spinner">
              <img 
              src="/images/logo/TechSyncLogo.png" 
              alt="TechSync Logo" 
              style={{
                width: '125%',
                height: '125%',
                objectFit: 'contain'
              }}
            />
            </div>
            <span>Loading project tasks...</span>
          </div>
        </div>
      </>
    );
  }

  const assignableMembers = getAllAssignableMembers();

  return (
    <>
      {/* Sidebar Toggle Button - OUTSIDE CONTAINER */}
      <button
        style={styles.toggleButton}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.color = '#3b82f6';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
          e.currentTarget.style.color = '#9ca3af';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeft size={20} />
      </button>

      <div style={styles.container}>
        <BackgroundSymbols />
        {renderSuccessMessage()}

        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Project Tasks</h1>
            <p style={styles.subtitle}>
              {project ? `${project.title} - Task Management` : 'Manage and track project tasks'}
            </p>
          </div>
          <div style={styles.headerRight}>
            {canCreateTasks && (
              <button
                style={styles.createButton}
                onClick={() => {
                  setEditingTask(null);
                  resetForm();
                  setError(null);
                  setShowCreateModal(true);
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
                }}
              >
                + Create Task
              </button>
            )}
          </div>
        </div>

        <div style={styles.controls}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filter:</label>
            <select
              style={styles.filterSelect}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="my_tasks">My Tasks</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div style={styles.sortControls}>
            <label style={styles.filterLabel}>Sort by:</label>
            <select
              style={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Created Date</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
            
            <button
              style={styles.actionButton}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <button
            style={styles.refreshButton}
            onClick={fetchTasks}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Refresh
          </button>
        </div>

        {renderErrorMessage()}

        {filteredTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <h2 style={styles.emptyTitle}>No tasks found</h2>
            <p style={styles.emptyText}>
              {filter === 'all' 
                ? 'No tasks have been created yet.' 
                : `No tasks match the current filter: ${filter.replace('_', ' ')}`
              }
            </p>
            {canCreateTasks && filter === 'all' && (
              <button
                style={styles.createButton}
                onClick={() => {
                  setEditingTask(null);
                  resetForm();
                  setError(null);
                  setShowCreateModal(true);
                }}
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tasksGrid}>
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                style={styles.taskCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
                }}
              >
                <div style={styles.taskHeader}>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                </div>

                <div style={styles.taskMeta}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(task.status),
                      color: getStatusTextColor(task.status)
                    }}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                  <span
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(task.priority)
                    }}
                  >
                    {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p style={styles.taskDescription}>
                    {task.description.length > 150
                      ? task.description.substring(0, 150) + '...'
                      : task.description
                    }
                  </p>
                )}

                <div style={styles.taskFooter}>
                  <div style={styles.taskInfo}>
                    <div>Due: {formatDate(task.due_date)}</div>
                    <div>Assigned: {getMemberName(task.assigned_to)}</div>
                  </div>
                  
                  <div style={styles.taskActions}>
                    <button
                      style={styles.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewTaskDetail(task.id);
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      View
                    </button>
                    
                    {canCreateTasks && (
                      <>
                        <button
                          style={styles.editButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            editTask(task);
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div style={styles.modal} onClick={() => {
            setShowCreateModal(false);
            setEditingTask(null);
            resetForm();
            setError(null);
          }}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
              </div>

              {renderErrorMessage()}

              <form onSubmit={handleSaveTask}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="title">Title *</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={taskForm.title}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    placeholder="Enter task title"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={taskForm.description}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="Enter task description"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="task_type">Task Type</label>
                  <select
                    id="task_type"
                    name="task_type"
                    value={taskForm.task_type}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                    <option value="testing">Testing</option>
                    <option value="documentation">Documentation</option>
                    <option value="research">Research</option>
                    <option value="meeting">Meeting</option>
                    <option value="review">Review</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={taskForm.status}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="assigned_to">Assigned To</label>
                  <select
                    id="assigned_to"
                    name="assigned_to"
                    value={taskForm.assigned_to}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Unassigned</option>
                    {assignableMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} {member.role !== 'member' ? `(${member.role})` : ''}
                      </option>
                    ))}
                  </select>
                  {assignableMembers.length === 0 && (
                    <small style={styles.memberNote}>
                      No members found. Only project owner and members can be assigned tasks.
                    </small>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="estimated_hours">Estimated Hours</label>
                  <input
                    id="estimated_hours"
                    type="number"
                    name="estimated_hours"
                    value={taskForm.estimated_hours}
                    onChange={handleInputChange}
                    style={styles.input}
                    min="0"
                    step="0.5"
                    placeholder="0"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="due_date">Due Date</label>
                  <input
                    id="due_date"
                    type="date"
                    name="due_date"
                    value={taskForm.due_date}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTask(null);
                      resetForm();
                      setError(null);
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.saveButton}
                    disabled={!taskForm.title.trim()}
                    onMouseEnter={(e) => {
                      if (!e.target.disabled) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProjectTasks;