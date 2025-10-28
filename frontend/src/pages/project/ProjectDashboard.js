// frontend/src/pages/project/ProjectDashboard.js - WITH SIDEBAR TOGGLE
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import ProjectCompletionButton from '../../components/ProjectCompletion/ProjectCompletionButton';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { PanelLeft } from 'lucide-react';

// Background symbols component - WITH FLOATING ANIMATIONS
const BackgroundSymbols = () => (
  <>
    {/* Floating Animation CSS */}
    <style>
      {`
        @keyframes floatAround1 {
          0%, 100% { transform: translate(0, 0) rotate(-15deg); }
          25% { transform: translate(20px, -15px) rotate(-10deg); }
          50% { transform: translate(-10px, 20px) rotate(-20deg); }
          75% { transform: translate(15px, 5px) rotate(-12deg); }
        }
        @keyframes floatAround2 {
          0%, 100% { transform: translate(0, 0) rotate(20deg); }
          33% { transform: translate(-20px, 10px) rotate(25deg); }
          66% { transform: translate(25px, -8px) rotate(15deg); }
        }
        @keyframes floatAround3 {
          0%, 100% { transform: translate(0, 0) rotate(-25deg); }
          20% { transform: translate(-15px, -20px) rotate(-20deg); }
          40% { transform: translate(20px, 15px) rotate(-30deg); }
          60% { transform: translate(-8px, -10px) rotate(-22deg); }
          80% { transform: translate(12px, 18px) rotate(-28deg); }
        }
        @keyframes floatAround4 {
          0%, 100% { transform: translate(0, 0) rotate(30deg); }
          50% { transform: translate(-30px, 25px) rotate(35deg); }
        }
        @keyframes floatAround5 {
          0%, 100% { transform: translate(0, 0) rotate(-10deg); }
          25% { transform: translate(15px, -20px) rotate(-5deg); }
          50% { transform: translate(-25px, 15px) rotate(-15deg); }
          75% { transform: translate(20px, 10px) rotate(-8deg); }
        }
        @keyframes floatAround6 {
          0%, 100% { transform: translate(0, 0) rotate(15deg); }
          33% { transform: translate(-12px, -15px) rotate(20deg); }
          66% { transform: translate(25px, 20px) rotate(10deg); }
        }
        @keyframes driftSlow {
          0%, 100% { transform: translate(0, 0) rotate(35deg); }
          25% { transform: translate(-25px, 15px) rotate(40deg); }
          50% { transform: translate(15px, -25px) rotate(30deg); }
          75% { transform: translate(-8px, 30px) rotate(38deg); }
        }
        @keyframes gentleDrift {
          0%, 100% { transform: translate(0, 0) rotate(-20deg); }
          50% { transform: translate(20px, -30px) rotate(-15deg); }
        }
        @keyframes floatExtra1 {
          0%, 100% { transform: translate(0, 0) rotate(18deg); }
          33% { transform: translate(-18px, 20px) rotate(23deg); }
          66% { transform: translate(22px, -15px) rotate(13deg); }
        }
        @keyframes floatExtra2 {
          0%, 100% { transform: translate(0, 0) rotate(-37deg); }
          25% { transform: translate(25px, 18px) rotate(-32deg); }
          50% { transform: translate(-20px, -22px) rotate(-42deg); }
          75% { transform: translate(15px, -10px) rotate(-35deg); }
        }
        @keyframes floatExtra3 {
          0%, 100% { transform: translate(0, 0) rotate(28deg); }
          50% { transform: translate(-28px, 30px) rotate(33deg); }
        }
        @keyframes floatExtra4 {
          0%, 100% { transform: translate(0, 0) rotate(24deg); }
          40% { transform: translate(20px, -25px) rotate(29deg); }
          80% { transform: translate(-15px, 20px) rotate(19deg); }
        }
        @keyframes floatExtra5 {
          0%, 100% { transform: translate(0, 0) rotate(25deg); }
          35% { transform: translate(-22px, -18px) rotate(30deg); }
          70% { transform: translate(18px, 25px) rotate(20deg); }
        }
        @keyframes floatExtra6 {
          0%, 100% { transform: translate(0, 0) rotate(-19deg); }
          50% { transform: translate(25px, -20px) rotate(-14deg); }
        }
        @keyframes floatExtra7 {
          0%, 100% { transform: translate(0, 0) rotate(-6deg); }
          25% { transform: translate(-15px, 22px) rotate(-1deg); }
          50% { transform: translate(20px, -18px) rotate(-11deg); }
          75% { transform: translate(-10px, 15px) rotate(-4deg); }
        }
        @keyframes floatExtra8 {
          0%, 100% { transform: translate(0, 0) rotate(25deg); }
          33% { transform: translate(18px, 20px) rotate(30deg); }
          66% { transform: translate(-20px, -15px) rotate(20deg); }
        }
        @keyframes floatExtra9 {
          0%, 100% { transform: translate(0, 0) rotate(-10deg); }
          50% { transform: translate(-25px, 28px) rotate(-5deg); }
        }
        @keyframes floatExtra10 {
          0%, 100% { transform: translate(0, 0) rotate(37deg); }
          40% { transform: translate(22px, -20px) rotate(42deg); }
          80% { transform: translate(-18px, 25px) rotate(32deg); }
        }
        @keyframes floatExtra11 {
          0%, 100% { transform: translate(0, 0) rotate(-10deg); }
          30% { transform: translate(-20px, 15px) rotate(-5deg); }
          60% { transform: translate(25px, -20px) rotate(-15deg); }
          90% { transform: translate(-12px, 20px) rotate(-8deg); }
        }
        @keyframes floatExtra12 {
          0%, 100% { transform: translate(0, 0) rotate(18deg); }
          50% { transform: translate(20px, -25px) rotate(23deg); }
        }
        @keyframes floatExtra13 {
          0%, 100% { transform: translate(0, 0) rotate(15deg); }
          25% { transform: translate(-18px, -20px) rotate(20deg); }
          50% { transform: translate(22px, 18px) rotate(10deg); }
          75% { transform: translate(-15px, 22px) rotate(17deg); }
        }
        @keyframes floatExtra14 {
          0%, 100% { transform: translate(0, 0) rotate(30deg); }
          50% { transform: translate(-25px, 22px) rotate(35deg); }
        }
        @keyframes floatExtra15 {
          0%, 100% { transform: translate(0, 0) rotate(-20deg); }
          33% { transform: translate(20px, 18px) rotate(-15deg); }
          66% { transform: translate(-22px, -20px) rotate(-25deg); }
        }
        @keyframes globalLogoRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .global-loading-spinner {
          animation: globalLogoRotate 2s linear infinite;
        }
        .floating-symbol {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        .floating-symbol:nth-child(1) { animation: floatAround1 12s infinite; }
        .floating-symbol:nth-child(2) { animation: floatAround2 15s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(3) { animation: floatAround3 10s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(4) { animation: floatAround4 18s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(5) { animation: floatAround5 14s infinite; animation-delay: -1s; }
        .floating-symbol:nth-child(6) { animation: floatAround6 11s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(7) { animation: driftSlow 20s infinite; animation-delay: -8s; }
        .floating-symbol:nth-child(8) { animation: gentleDrift 16s infinite; animation-delay: -3s; }
        .floating-symbol:nth-child(9) { animation: floatExtra1 13s infinite; animation-delay: -7s; }
        .floating-symbol:nth-child(10) { animation: floatExtra2 17s infinite; animation-delay: -9s; }
        .floating-symbol:nth-child(11) { animation: floatExtra3 14s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(12) { animation: floatExtra4 19s infinite; animation-delay: -10s; }
        .floating-symbol:nth-child(13) { animation: floatExtra5 11s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(14) { animation: floatExtra6 15s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(15) { animation: floatExtra7 13s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(16) { animation: floatExtra8 16s infinite; animation-delay: -8s; }
        .floating-symbol:nth-child(17) { animation: floatExtra9 12s infinite; animation-delay: -3s; }
        .floating-symbol:nth-child(18) { animation: floatExtra10 18s infinite; animation-delay: -7s; }
        .floating-symbol:nth-child(19) { animation: floatExtra11 14s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(20) { animation: floatExtra12 17s infinite; animation-delay: -9s; }
        .floating-symbol:nth-child(21) { animation: floatExtra13 15s infinite; animation-delay: -6s; }
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
        left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
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
        left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
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
        left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
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
        left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
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
        left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
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
        left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
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
        left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
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
        left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
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
        left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
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
        left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
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
        left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
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
        left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
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
        left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
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
        left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
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
        left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
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
        left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
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
        left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
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
        left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
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
        left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
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
        left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
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
        left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
      }}>&#60;/&#62;</div>
    </div>
  </>
);

function ProjectDashboard() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const isOwnerOrLead = project && (
    project.owner_id === user?.id || 
    project.members?.some(m => m.user_id === user?.id && m.role === 'lead')
  );
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    overdueTasksCount: 0,
    completionRate: 0
  });
  const [dueTasks, setDueTasks] = useState([]);
  const [memberActivity, setMemberActivity] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // NEW STATE: Track sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('projectSidebarCollapsed');
    return saved === 'true';
  });

  // NEW: Function to toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('projectSidebarCollapsed', newCollapsedState.toString());
    
    window.dispatchEvent(new CustomEvent('projectSidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  // NEW: Sync with sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('projectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('projectSidebarToggle', handleSidebarToggle);
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch project details
      const projectResponse = await projectService.getProjectById(projectId);
      const projectData = projectResponse.data.project;
      setProject(projectData);

      // Fetch project members
      try {
        const membersResponse = await projectService.getProjectMembers(projectId);
        setMembers([membersResponse.data.owner, ...membersResponse.data.members]);
      } catch (error) {
        console.log('Could not fetch members:', error);
        setMembers([]);
      }

      // Fetch project tasks for analytics
      try {
        const tasksResponse = await taskService.getProjectTasks(projectId);
        const tasks = tasksResponse.data.tasks || [];
        
        // Calculate analytics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const activeTasks = tasks.filter(t => ['todo', 'in_progress', 'in_review'].includes(t.status)).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Find overdue and due soon tasks
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const dueSoonTasks = tasks.filter(task => {
          if (!task.due_date || task.status === 'completed') return false;
          const dueDate = new Date(task.due_date);
          return dueDate <= nextWeek && dueDate >= now;
        }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

        const overdueTasksCount = tasks.filter(task => {
          if (!task.due_date || task.status === 'completed') return false;
          return new Date(task.due_date) < now;
        }).length;

        setAnalytics({
          totalTasks,
          completedTasks,
          activeTasks,
          overdueTasksCount,
          completionRate
        });
        
        setDueTasks(dueSoonTasks.slice(0, 5)); // Show max 5 upcoming tasks
      } catch (error) {
        console.log('Could not fetch tasks:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Handle project completion - refresh data when project is marked complete
  const handleProjectCompleted = useCallback(async () => {
    console.log('Project completed! Refreshing data...');
    
    try {
      // Refresh project data to update status
      await fetchDashboardData();
      
      // Optionally, you can also add a success notification here
      // For example, if you have a notification context:
      // showNotification('success', 'Project has been marked as complete!');
    } catch (error) {
      console.error('Error refreshing project data:', error);
    }
  }, [fetchDashboardData]);

  // Mock member activity (in real app, this would come from activity logs)
  const fetchMemberActivity = useCallback(async () => {
    try {
      setLoadingActivity(true);
      
      // Simulate recent activity data
      const mockActivity = [
        {
          id: 1,
          user: members.find(m => m.id === user?.id) || { full_name: 'You', username: 'you' },
          action: 'completed task',
          target: 'Setup project structure',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'task_completed'
        },
        {
          id: 2,
          user: members[1] || { full_name: 'Team Member', username: 'member' },
          action: 'created task',
          target: 'Implement authentication',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          type: 'task_created'
        },
        {
          id: 3,
          user: members[0] || { full_name: 'Project Owner', username: 'owner' },
          action: 'updated project',
          target: 'Project description',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          type: 'project_updated'
        },
        {
          id: 4,
          user: members[1] || { full_name: 'Team Member', username: 'member' },
          action: 'joined project',
          target: '',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          type: 'member_joined'
        }
      ].filter(activity => activity.user);

      setMemberActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching member activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  }, [members, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (members.length > 0) {
      fetchMemberActivity();
    }
  }, [fetchMemberActivity, members.length]);

  // Helper functions
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays > 1) return `Due in ${diffDays} days`;
    return 'Overdue';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed': return '✅';
      case 'task_created': return '📝';
      case 'project_updated': return '📊';
      case 'member_joined': return '👋';
      default: return '📄';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const styles = {
    // NEW: Completion section - inside container, between analytics and announcements
    completionSection: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px'
    },
    // NEW: Toggle button styles
    toggleButton: {
      position: 'fixed',
      top: '20px',
      left: isSidebarCollapsed ? '100px' : '290px',
      zIndex: 1100,
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
      transition: 'all 0.3s ease',
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
      paddingLeft: '120px',
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
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0
    },
    subtitle: {
      color: '#d1d5db',
      fontSize: '16px',
      margin: '8px 0 0 0'
    },
    analyticsGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    analyticsCard: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '25px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease'
    },
    analyticsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    analyticsTitle: {
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      margin: 0
    },
    analyticsIcon: {
      fontSize: '24px'
    },
    analyticsValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#3b82f6',
      margin: '10px 0'
    },
    analyticsSubtext: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '10px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981, #059669)',
      transition: 'width 0.3s ease'
    },
    contentGrid: {
      position: 'relative',
      zIndex: 1,
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px',
      marginBottom: '30px'
    },
    announcementsSection: {
      position: 'relative',
      zIndex: 1,
      marginBottom: '30px'
    },
    card: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '25px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    },
    cardTitle: {
      color: 'white',
      fontSize: '20px',
      marginBottom: '20px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    taskItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 15px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      marginBottom: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      transition: 'all 0.2s ease'
    },
    taskInfo: {
      flex: 1
    },
    taskTitle: {
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px'
    },
    taskMeta: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    priorityBadge: {
      padding: '2px 6px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: '500',
      color: 'white'
    },
    dueBadge: {
      padding: '4px 8px',
      backgroundColor: 'rgba(251, 191, 36, 0.15)',
      color: '#fbbf24',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      display: 'flex',
      alignItems: 'center'
    },
    activityItem: {
      display: 'flex',
      gap: '12px',
      padding: '15px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    activityIcon: {
      fontSize: '20px',
      marginTop: '2px'
    },
    activityContent: {
      flex: 1
    },
    activityText: {
      color: 'white',
      fontSize: '14px',
      marginBottom: '4px'
    },
    activityTime: {
      color: '#9ca3af',
      fontSize: '12px'
    },
    activityTarget: {
      fontWeight: '500',
      color: '#3b82f6'
    },
    stat: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px'
    },
    statLabel: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    statValue: {
      color: 'white',
      fontSize: '14px',
      fontWeight: '500'
    },
    description: {
      color: '#d1d5db',
      lineHeight: '1.6',
      fontSize: '14px'
    },
    tag: {
      display: 'inline-block',
      padding: '6px 12px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
      color: '#93c5fd',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      marginRight: '8px',
      marginBottom: '8px',
      border: '1px solid rgba(59, 130, 246, 0.3)'
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
    emptyState: {
      textAlign: 'center',
      color: '#9ca3af',
      padding: '40px 20px',
      fontStyle: 'italic',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
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
            <span>Loading project dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        {/* Sidebar Toggle Button */}
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
          <div style={styles.loading}>Project not found</div>
        </div>
      </>
    );
  }

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

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{project.title}</h1>
            <p style={styles.subtitle}>Project Dashboard & Analytics</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div style={styles.analyticsGrid}>
          <div style={styles.analyticsCard}>
            <div style={styles.analyticsHeader}>
              <h3 style={styles.analyticsTitle}>Project Progress</h3>
              <span style={styles.analyticsIcon}>📈</span>
            </div>
            <div style={styles.analyticsValue}>{analytics.completionRate}%</div>
            <div style={styles.analyticsSubtext}>
              {analytics.completedTasks} of {analytics.totalTasks} tasks completed
            </div>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${analytics.completionRate}%`
                }}
              />
            </div>
          </div>

          <div style={styles.analyticsCard}>
            <div style={styles.analyticsHeader}>
              <h3 style={styles.analyticsTitle}>Active Tasks</h3>
              <span style={styles.analyticsIcon}>⚡</span>
            </div>
            <div style={styles.analyticsValue}>{analytics.activeTasks}</div>
            <div style={styles.analyticsSubtext}>
              Tasks in progress or pending review
            </div>
          </div>

          <div style={styles.analyticsCard}>
            <div style={styles.analyticsHeader}>
              <h3 style={styles.analyticsTitle}>Overdue Tasks</h3>
              <span style={styles.analyticsIcon}>⚠️</span>
            </div>
            <div style={{
              ...styles.analyticsValue,
              color: analytics.overdueTasksCount > 0 ? '#ef4444' : '#10b981'
            }}>
              {analytics.overdueTasksCount}
            </div>
            <div style={styles.analyticsSubtext}>
              {analytics.overdueTasksCount > 0 ? 'Need immediate attention' : 'All tasks on track'}
            </div>
          </div>
        </div>

        {/* Project Completion Section - INSIDE CONTAINER */}
        {project && project.maximum_members > 1 && project.status !== 'completed' && (
          <div style={styles.completionSection}>
            <ProjectCompletionButton
              projectId={project.id}
              currentUserId={user?.id}
              isOwnerOrLead={isOwnerOrLead}
              onProjectCompleted={handleProjectCompleted}
            />
          </div>
        )}

        {/* Announcements */}
        <div style={styles.announcementsSection}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              📢 Announcements
            </h3>
            {dueTasks.length > 0 ? (
              <div>
                <p style={styles.description}>Tasks approaching their due dates:</p>
                {dueTasks.map((task) => (
                  <div key={task.id} style={styles.taskItem}>
                    <div style={styles.taskInfo}>
                      <div style={styles.taskTitle}>{task.title}</div>
                      <div style={styles.taskMeta}>
                        <span 
                          style={{
                            ...styles.priorityBadge,
                            backgroundColor: getPriorityColor(task.priority)
                          }}
                        >
                          {task.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                        <span style={styles.dueBadge}>
                          {formatDueDate(task.due_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                No upcoming due dates. Great job staying on track! 🎉
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Left Column */}
          <div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                🕒 Recent Activity
              </h3>
              {loadingActivity ? (
                <div style={styles.emptyState}>Loading activity...</div>
              ) : memberActivity.length > 0 ? (
                <div>
                  {memberActivity.map((activity) => (
                    <div key={activity.id} style={styles.activityItem}>
                      <span style={styles.activityIcon}>
                        {getActivityIcon(activity.type)}
                      </span>
                      <div style={styles.activityContent}>
                        <div style={styles.activityText}>
                          <strong>{activity.user.full_name || activity.user.username}</strong> {activity.action}
                          {activity.target && (
                            <span style={styles.activityTarget}> "{activity.target}"</span>
                          )}
                        </div>
                        <div style={styles.activityTime}>
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  No recent activity. Get started by creating tasks or updating the project!
                </div>
              )}
            </div>
          </div>
          

          {/* Right Column */}
          <div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 Project Overview</h3>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Status:</span>
                <span style={styles.statValue}>{project.status?.toUpperCase()}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Difficulty:</span>
                <span style={styles.statValue}>{project.difficulty_level?.toUpperCase()}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Duration:</span>
                <span style={styles.statValue}>{project.estimated_duration_weeks} weeks</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Team Size:</span>
                <span style={styles.statValue}>
                  {project.current_members || 0}/{project.maximum_members} members
                </span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📝 Description</h3>
              <p style={styles.description}>{project.description}</p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💻 Technologies</h3>
              {project.project_languages && project.project_languages.length > 0 ? (
                project.project_languages.map((lang, index) => (
                  <span key={index} style={styles.tag}>
                    {lang.programming_languages?.name || lang.name}
                  </span>
                ))
              ) : (
                <p style={styles.description}>No technologies specified</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectDashboard;