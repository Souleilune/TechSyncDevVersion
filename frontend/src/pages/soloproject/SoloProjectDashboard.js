// frontend/src/pages/soloproject/SoloProjectDashboard.js - WITH SIDEBAR TOGGLE
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SoloProjectService from '../../services/soloProjectService';
import { taskService } from '../../services/taskService';
import { BarChart3, Target, Clock, TrendingUp, Plus, StickyNote, FileText, Award, Trophy, RefreshCw, PanelLeft } from 'lucide-react';
import AwardsDisplay from '../../components/AwardsDisplay';

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
        .floating-symbol:nth-child(15) { animation: floatAround1 13s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(16) { animation: floatAround2 16s infinite; animation-delay: -8s; }
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
      {[
        { left: '52.81%', top: '48.12%', color: '#2E3344', rotate: '-10.79deg' },
        { left: '28.19%', top: '71.22%', color: '#292A2E', rotate: '-37.99deg' },
        { left: '95.09%', top: '48.12%', color: '#ABB5CE', rotate: '34.77deg' },
        { left: '86.46%', top: '15.33%', color: '#2E3344', rotate: '28.16deg' },
        { left: '7.11%', top: '80.91%', color: '#ABB5CE', rotate: '24.5deg' },
        { left: '48.06%', top: '8.5%', color: '#ABB5CE', rotate: '25.29deg' },
        { left: '72.84%', top: '4.42%', color: '#2E3344', rotate: '-19.68deg' },
        { left: '9.6%', top: '0%', color: '#1F232E', rotate: '-6.83deg' },
        { left: '31.54%', top: '54.31%', color: '#6C758E', rotate: '25.29deg' },
        { left: '25.28%', top: '15.89%', color: '#1F232E', rotate: '-6.83deg' },
        { left: '48.55%', top: '82.45%', color: '#292A2E', rotate: '-10.79deg' },
        { left: '24.41%', top: '92.02%', color: '#2E3344', rotate: '18.2deg' },
        { left: '0%', top: '12.8%', color: '#ABB5CE', rotate: '37.85deg' },
        { left: '81.02%', top: '94.27%', color: '#6C758E', rotate: '-37.99deg' },
        { left: '96.02%', top: '0%', color: '#2E3344', rotate: '-37.99deg' },
        { left: '0.07%', top: '41.2%', color: '#6C758E', rotate: '-10.79deg' }
      ].map((pos, i) => (
        <div key={i} className="floating-symbol" style={{
          position: 'absolute',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontStyle: 'normal',
          fontWeight: 900,
          fontSize: '24px',
          lineHeight: '29px',
          userSelect: 'none',
          pointerEvents: 'none',
          left: pos.left,
          top: pos.top,
          color: pos.color,
          transform: `rotate(${pos.rotate})`
        }}>&#60;/&#62;</div>
      ))}
    </div>
  </>
);

function SoloProjectDashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [project, setProject] = useState(null);
  const [projectStats, setProjectStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    timeSpentToday: 0,
    streakDays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState('');
  const [showAwardNotification, setShowAwardNotification] = useState(false);
  const [newAward, setNewAward] = useState(null);

  // NEW STATE: Track sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('soloProjectSidebarCollapsed');
    return saved === 'true';
  });

  // NEW: Function to toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('soloProjectSidebarCollapsed', newCollapsedState.toString());
    
    window.dispatchEvent(new CustomEvent('soloProjectSidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  // NEW: Sync with sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('soloProjectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('soloProjectSidebarToggle', handleSidebarToggle);
  }, []);

  // Check for awards
  const checkForAwards = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };

      // Check project completion award
      const completionResponse = await fetch(`${apiUrl}/awards/check/completion/${projectId}`, {
        method: 'POST',
        headers
      });
      const completionData = await completionResponse.json();
      
      if (completionData.awarded) {
        setNewAward(completionData.award);
        setShowAwardNotification(true);
        setTimeout(() => setShowAwardNotification(false), 5000);
        return;
      }

      // Check weekly challenge award
      const challengeResponse = await fetch(`${apiUrl}/awards/check/challenges/${projectId}`, {
        method: 'POST',
        headers
      });
      const challengeData = await challengeResponse.json();
      
      if (challengeData.awarded) {
        setNewAward(challengeData.award);
        setShowAwardNotification(true);
        setTimeout(() => setShowAwardNotification(false), 5000);
      }
    } catch (error) {
      console.error('Error checking for awards:', error);
    }
  };

  // Fetch dashboard data with proper syncing from solo_project_goals table
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await SoloProjectService.getDashboardData(projectId);
      
      if (response.success) {
        const { project: projectData, stats, tasks: recentTasks, goals: recentGoals } = response.data;
        
        setProject(projectData);
        
        // Use the stats directly from backend - calculated from solo_project_goals table
        setProjectStats({
          totalTasks: stats.totalTasks || 0,
          completedTasks: stats.completedTasks || 0,
          inProgressTasks: stats.inProgressTasks || 0,
          completionRate: stats.completionRate || 0,
          totalGoals: stats.totalGoals || 0,
          completedGoals: stats.completedGoals || 0,
          activeGoals: stats.activeGoals || 0,
          timeSpentToday: stats.timeSpentToday || 0,
          streakDays: stats.streakDays || 0
        });
        
        // Set recent tasks for display
        if (recentTasks && recentTasks.length > 0) {
          setTasks(recentTasks);
        }
        
        console.log('Dashboard synced with latest data:', {
          totalItems: (stats.totalTasks || 0) + (stats.totalGoals || 0),
          completedItems: (stats.completedTasks || 0) + (stats.completedGoals || 0),
          completionRate: stats.completionRate
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch recent activity using backend API
  const fetchRecentActivity = useCallback(async () => {
    try {
      setLoadingActivity(true);
      const response = await SoloProjectService.getRecentActivity(projectId, 10);
      
      if (response.success) {
        setRecentActivity(response.data.activities || []);
      }
    } catch (error) {
      console.warn('Could not fetch recent activity:', error);
      setRecentActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
  }, [fetchDashboardData, fetchRecentActivity]);

  // Check awards when completion rate changes
  useEffect(() => {
    if (projectStats?.completionRate > 0) {
      checkForAwards();
    }
  }, [projectStats?.completionRate]);

  // Auto-refresh dashboard every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing dashboard...');
      fetchDashboardData();
      fetchRecentActivity();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData, fetchRecentActivity]);

  // Helper function to log activity
  const logActivity = useCallback(async (action, target, type) => {
    try {
      await SoloProjectService.logActivity(projectId, {
        action,
        target,
        type
      });
      fetchRecentActivity();
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [projectId, fetchRecentActivity]);

  // Quick actions
  const handleQuickTaskCreate = async () => {
    try {
      navigate(`/soloproject/${projectId}/goals?intent=task`);
      await logActivity('navigated to', 'Tasks page', 'project_updated');
    } catch (error) {
      console.error('Failed to navigate to tasks:', error);
    }
  };

  const handleQuickGoalCreate = async () => {
    try {
      navigate(`/soloproject/${projectId}/goals?intent=goal`);
      await logActivity('navigated to', 'Goals page', 'project_updated');
    } catch (error) {
      console.error('Failed to navigate to goals:', error);
    }
  };

  const handleQuickNoteCreate = async () => {
    try {
      navigate(`/soloproject/${projectId}/notes`);
      await logActivity('navigated to', 'Notes page', 'project_updated');
    } catch (error) {
      console.error('Failed to navigate to notes:', error);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered...');
    await fetchDashboardData();
    await fetchRecentActivity();
  };

  // Helper functions for display
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in_progress': return '#3b82f6';
      case 'todo': return '#f59e0b';
      default: return '#a855f7';
    }
  };

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'task_completed': return '✅';
      case 'task_created': return '📝';
      case 'task_started': return '🚀';
      case 'goal_created': return '🎯';
      case 'note_created': return '📄';
      default: return '📋';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Styles object
  const styles = {
    // NEW: Toggle button styles
    toggleButton: {
      position: 'fixed',
      top: '20px',
      left: isSidebarCollapsed ? '100px' : '290px',
      zIndex: 999,  // Changed from 1100 to 999 (modal is at 1000)
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
      minHeight: '100vh',
      backgroundColor: '#0f1116',
      padding: '40px',
      position: 'relative',
      paddingLeft: '120px',
      overflow: 'hidden'
    },
    loadingState: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      minHeight: '60vh',
      fontSize: '18px',
      color: '#9ca3af',
      zIndex: 10,
      position: 'relative'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: 'white',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '16px',
      color: '#9ca3af',
      margin: 0
    },
    createButton: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#a855f7',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
    },
    errorMessage: {
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      border: '1px solid rgba(220, 38, 38, 0.3)',
      color: '#fca5a5',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px',
      position: 'relative',
      zIndex: 10
    },
    awardNotification: {
      position: 'fixed',
      top: '24px',
      right: '24px',
      backgroundColor: 'rgba(26, 28, 32, 0.98)',
      border: '2px solid rgba(255, 215, 0, 0.3)',
      padding: '20px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      animation: 'slideInRight 0.3s ease',
      color: 'white',
      minWidth: '320px'
    },
    welcomeSection: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    welcomeTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'white',
      margin: '0 0 8px 0'
    },
    welcomeMessage: {
      fontSize: '16px',
      color: '#9ca3af',
      margin: '0 0 24px 0'
    },
    progressContainer: {
      marginTop: '24px'
    },
    progressBar: {
      height: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '5px',
      overflow: 'hidden',
      marginBottom: '12px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
      borderRadius: '5px',
      transition: 'width 0.3s ease'
    },
    progressText: {
      fontSize: '14px',
      color: '#9ca3af',
      margin: 0
    },
    analyticsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '32px',
      position: 'relative',
      zIndex: 10
    },
    analyticsCard: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'transform 0.2s ease'
    },
    analyticsHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    analyticsTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#9ca3af',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    analyticsIcon: {
      color: '#a855f7'
    },
    analyticsValue: {
      fontSize: '36px',
      fontWeight: '700',
      color: 'white',
      margin: '0 0 8px 0'
    },
    analyticsSubtext: {
      fontSize: '14px',
      color: '#9ca3af',
      margin: 0
    },
    quickActionsSection: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '32px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: 'white',
      margin: '0 0 16px 0',
      display: 'flex',
      alignItems: 'center'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    quickActionButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      border: '2px solid rgba(168, 85, 247, 0.2)',
      color: '#a855f7',
      padding: '16px 24px',
      borderRadius: '12px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
    },
    quickActionIcon: {
      flexShrink: 0
    },
    awardsSection: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '32px'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
      position: 'relative',
      zIndex: 10
    },
    contentCard: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 24px 16px 24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'white',
      margin: 0
    },
    viewAllButton: {
      color: '#a855f7',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'color 0.2s ease'
    },
    activityCount: {
      fontSize: '14px',
      color: '#9ca3af'
    },
    cardContent: {
      padding: '24px'
    },
    taskItem: {
      padding: '16px',
      backgroundColor: 'rgba(26, 28, 32, 0.5)',
      borderRadius: '12px',
      marginBottom: '12px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'all 0.2s ease'
    },
    taskInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    taskStatus: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      color: 'white',
      textTransform: 'capitalize',
      width: 'fit-content'
    },
    taskTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      margin: 0
    },
    taskMeta: {
      fontSize: '14px',
      color: '#9ca3af',
      margin: 0,
      textTransform: 'capitalize'
    },
    activityItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      backgroundColor: 'rgba(26, 28, 32, 0.5)',
      borderRadius: '12px',
      marginBottom: '12px',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    activityIcon: {
      fontSize: '20px',
      flexShrink: 0
    },
    activityInfo: {
      flex: 1
    },
    activityText: {
      fontSize: '14px',
      color: 'white',
      margin: '0 0 4px 0',
      lineHeight: '1.5'
    },
    activityAction: {
      fontWeight: '600'
    },
    activityTarget: {
      color: '#9ca3af'
    },
    activityTime: {
      fontSize: '12px',
      color: '#9ca3af',
      margin: 0
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px'
    },
    emptyStateIcon: {
      marginBottom: '16px',
      color: '#9ca3af'
    },
    emptyStateText: {
      fontSize: '14px',
      color: '#9ca3af',
      margin: 0
    }
  };

  // Render loading state
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
          <div style={styles.loadingState}>
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
            <span>Loading solo project dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  const recentTasks = tasks.slice(0, 5);

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

        {/* Award Notification */}
        {showAwardNotification && newAward && (
          <div style={styles.awardNotification}>
            <Trophy size={32} style={{ color: newAward.award_color }} />
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                🎉 New Award Earned!
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                {newAward.award_title}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>{project?.title || 'Solo Project'}</h1>
            <p style={styles.subtitle}>Solo Workspace Dashboard</p>
          </div>
          
          {/* Manual refresh button */}
          <button 
            style={{
              ...styles.createButton,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              marginLeft: '12px',
              border: '2px solid rgba(59, 130, 246, 0.2)'
            }}
            onClick={handleManualRefresh}
            title="Refresh dashboard data"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <RefreshCw size={16} style={{ marginRight: '8px' }} />
            Refresh
          </button>
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}

        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>
            Welcome back, {user?.full_name || user?.username || 'Developer'}!
          </h2>
          <p style={styles.welcomeMessage}>
            {project?.title || 'Your Solo Project'} • Keep up the great work!
          </p>
          
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${projectStats.completionRate}%` }} />
            </div>
            <p style={styles.progressText}>
              {projectStats.completionRate}% Complete • {projectStats.completedTasks} of {projectStats.totalTasks} tasks done
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div style={styles.analyticsGrid}>
          <div style={styles.analyticsCard}>
            <div style={styles.analyticsHeader}>
              <h3 style={styles.analyticsTitle}>Total Tasks</h3>
              <BarChart3 size={24} style={styles.analyticsIcon} />
            </div>
            <div style={styles.analyticsValue}>{projectStats.totalTasks}</div>
            <div style={styles.analyticsSubtext}>{projectStats.inProgressTasks} in progress</div>
          </div>

          <div style={styles.analyticsCard}>
            <div style={styles.analyticsHeader}>
              <h3 style={styles.analyticsTitle}>Goals Set</h3>
              <Target size={24} style={styles.analyticsIcon} />
            </div>
            <div style={styles.analyticsValue}>{projectStats.totalGoals}</div>
            <div style={styles.analyticsSubtext}>{projectStats.activeGoals} active goals</div>
          </div>

          <div style={styles.analyticsCard}>
            <div style={styles.analyticsHeader}>
              <h3 style={styles.analyticsTitle}>Time Today</h3>
              <Clock size={24} style={styles.analyticsIcon} />
            </div>
            <div style={styles.analyticsValue}>{projectStats.timeSpentToday}h</div>
            <div style={styles.analyticsSubtext}>{projectStats.streakDays} day streak</div>
          </div>

          <div style={styles.analyticsCard}>
            <div style={styles.analyticsHeader}>
              <h3 style={styles.analyticsTitle}>Completion Rate</h3>
              <TrendingUp size={24} style={styles.analyticsIcon} />
            </div>
            <div style={styles.analyticsValue}>{projectStats.completionRate}%</div>
            <div style={styles.analyticsSubtext}>{projectStats.completedTasks} completed</div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${projectStats.completionRate}%` }} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActionsSection}>
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={styles.quickActions}>
            <button 
              style={styles.quickActionButton}
              onClick={handleQuickTaskCreate}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(147, 51, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.3)';
              }}
            >
              <Plus size={16} style={styles.quickActionIcon} />
              <span>Create Task</span>
            </button>
            <button 
              style={styles.quickActionButton}
              onClick={handleQuickGoalCreate}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(147, 51, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.3)';
              }}
            >
              <Target size={16} style={styles.quickActionIcon} />
              <span>Set Goal</span>
            </button>
            <button 
              style={styles.quickActionButton}
              onClick={handleQuickNoteCreate}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(147, 51, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.3)';
              }}
            >
              <StickyNote size={16} style={styles.quickActionIcon} />
              <span>Take Note</span>
            </button>
          </div>
        </div>

        {/* Awards Section */}
        <div style={styles.awardsSection}>
          <h3 style={styles.sectionTitle}>
            <Award size={20} style={{ color: '#FFD700', marginRight: '8px' }} />
            Your Awards
          </h3>
          <AwardsDisplay projectId={projectId} compact={false} />
        </div>

        {/* Main Content Grid */}
        <div style={styles.contentGrid}>
          {/* Recent Tasks */}
          <div style={styles.contentCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Recent Tasks</h3>
              <button 
                style={styles.viewAllButton}
                onClick={() => navigate(`/soloproject/${projectId}/goals`)}
              >
                View All →
              </button>
            </div>
            <div style={styles.cardContent}>
              {recentTasks.length > 0 ? (
                recentTasks.map(task => (
                  <div key={task.id} style={styles.taskItem}>
                    <div style={styles.taskInfo}>
                      <span 
                        style={{
                          ...styles.taskStatus,
                          backgroundColor: getStatusColor(task.status)
                        }}
                      >
                        {task.status?.replace('_', ' ') || 'active'}
                      </span>
                      <h4 style={styles.taskTitle}>{task.title}</h4>
                      <p style={styles.taskMeta}>{task.priority || 'medium'} priority</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyStateIcon}>
                    <FileText size={48} style={{ opacity: 0.5 }} />
                  </div>
                  <p style={styles.emptyStateText}>No tasks yet. Create your first task!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={styles.contentCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Recent Activity</h3>
              <span style={styles.activityCount}>
                {loadingActivity ? 'Loading...' : `${recentActivity.length} activities`}
              </span>
            </div>
            <div style={styles.cardContent}>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} style={styles.activityItem}>
                    <div style={styles.activityIcon}>
                      {getActivityTypeIcon(activity.activity_type)}
                    </div>
                    <div style={styles.activityInfo}>
                      <p style={styles.activityText}>
                        <span style={styles.activityAction}>
                          {activity.activity_data?.action || 'performed action'}
                        </span>
                        {' '}
                        <span style={styles.activityTarget}>
                          {activity.activity_data?.target || 'unknown target'}
                        </span>
                      </p>
                      <p style={styles.activityTime}>
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyStateIcon}>
                    <BarChart3 size={48} style={{ opacity: 0.5 }} />
                  </div>
                  <p style={styles.emptyStateText}>
                    {loadingActivity ? 'Loading activities...' : 'No recent activity'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SoloProjectDashboard;