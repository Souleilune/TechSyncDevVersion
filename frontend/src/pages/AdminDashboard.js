// frontend/src/pages/AdminDashboard.js - WITH MANUAL SIDEBAR TOGGLE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminAPI from '../services/adminAPI';
import { Shield, Users, Folder, Puzzle, UserPlus, Settings, BarChart3, FileText, PanelLeft } from 'lucide-react';

// Floating animation styles
const floatingAnimationStyles = `
  @keyframes floatAround1 {
    0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
    25% { transform: translate(30px, -20px) rotate(-5deg); }
    50% { transform: translate(-15px, 25px) rotate(-15deg); }
    75% { transform: translate(20px, 10px) rotate(-8deg); }
  }

  @keyframes floatAround2 {
    0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
    33% { transform: translate(-25px, 15px) rotate(-30deg); }
    66% { transform: translate(35px, -10px) rotate(-45deg); }
  }

  @keyframes floatAround3 {
    0%, 100% { transform: translate(0, 0) rotate(34.77deg); }
    20% { transform: translate(-20px, -30px) rotate(40deg); }
    40% { transform: translate(25px, 20px) rotate(28deg); }
    60% { transform: translate(-10px, -15px) rotate(38deg); }
    80% { transform: translate(15px, 25px) rotate(30deg); }
  }

  @keyframes floatAround4 {
    0%, 100% { transform: translate(0, 0) rotate(28.16deg); }
    50% { transform: translate(-40px, 30px) rotate(35deg); }
  }

  @keyframes floatAround5 {
    0%, 100% { transform: translate(0, 0) rotate(24.5deg); }
    25% { transform: translate(20px, -25px) rotate(30deg); }
    50% { transform: translate(-30px, 20px) rotate(18deg); }
    75% { transform: translate(25px, 15px) rotate(28deg); }
  }

  @keyframes floatAround6 {
    0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
    33% { transform: translate(-15px, -20px) rotate(30deg); }
    66% { transform: translate(30px, 25px) rotate(20deg); }
  }

  @keyframes driftSlow {
    0%, 100% { transform: translate(0, 0) rotate(-19.68deg); }
    25% { transform: translate(-35px, 20px) rotate(-25deg); }
    50% { transform: translate(20px, -30px) rotate(-15deg); }
    75% { transform: translate(-10px, 35px) rotate(-22deg); }
  }

  @keyframes gentleDrift {
    0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
    50% { transform: translate(25px, -40px) rotate(-2deg); }
  }

  @keyframes spiralFloat {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(20px, -20px) rotate(5deg); }
    50% { transform: translate(0px, -40px) rotate(10deg); }
    75% { transform: translate(-20px, -20px) rotate(5deg); }
  }

  @keyframes waveMotion {
    0%, 100% { transform: translate(0, 0) rotate(15deg); }
    25% { transform: translate(30px, 10px) rotate(20deg); }
    50% { transform: translate(15px, -25px) rotate(10deg); }
    75% { transform: translate(-15px, 10px) rotate(18deg); }
  }

  @keyframes circularDrift {
    0%, 100% { transform: translate(0, 0) rotate(-45deg); }
    25% { transform: translate(25px, 0px) rotate(-40deg); }
    50% { transform: translate(25px, 25px) rotate(-50deg); }
    75% { transform: translate(0px, 25px) rotate(-42deg); }
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

  .floating-symbol:nth-child(1) { animation: floatAround1 15s infinite; }
  .floating-symbol:nth-child(2) { animation: floatAround2 18s infinite; animation-delay: -2s; }
  .floating-symbol:nth-child(3) { animation: floatAround3 12s infinite; animation-delay: -5s; }
  .floating-symbol:nth-child(4) { animation: floatAround4 20s infinite; animation-delay: -8s; }
  .floating-symbol:nth-child(5) { animation: floatAround5 16s infinite; animation-delay: -3s; }
  .floating-symbol:nth-child(6) { animation: floatAround6 14s infinite; animation-delay: -7s; }
  .floating-symbol:nth-child(7) { animation: driftSlow 22s infinite; animation-delay: -10s; }
  .floating-symbol:nth-child(8) { animation: gentleDrift 19s infinite; animation-delay: -1s; }
  .floating-symbol:nth-child(9) { animation: spiralFloat 17s infinite; animation-delay: -6s; }
  .floating-symbol:nth-child(10) { animation: waveMotion 13s infinite; animation-delay: -4s; }
  .floating-symbol:nth-child(11) { animation: circularDrift 21s infinite; animation-delay: -9s; }
  .floating-symbol:nth-child(12) { animation: floatAround1 16s infinite; animation-delay: -2s; }
  .floating-symbol:nth-child(13) { animation: floatAround2 18s infinite; animation-delay: -11s; }
  .floating-symbol:nth-child(14) { animation: floatAround3 14s infinite; animation-delay: -5s; }
  .floating-symbol:nth-child(15) { animation: floatAround4 19s infinite; animation-delay: -7s; }
  .floating-symbol:nth-child(16) { animation: floatAround5 23s infinite; animation-delay: -3s; }
  .floating-symbol:nth-child(17) { animation: driftSlow 15s infinite; animation-delay: -8s; }
  .floating-symbol:nth-child(18) { animation: gentleDrift 17s infinite; animation-delay: -1s; }
  .floating-symbol:nth-child(19) { animation: spiralFloat 20s infinite; animation-delay: -12s; }
  .floating-symbol:nth-child(20) { animation: waveMotion 18s infinite; animation-delay: -6s; }
  .floating-symbol:nth-child(21) { animation: circularDrift 16s infinite; animation-delay: -4s; }
`;

// Background symbols component
const BackgroundSymbols = () => {
  const symbolStyle = {
    position: 'absolute',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: '24px',
    lineHeight: '29px',
    userSelect: 'none',
    pointerEvents: 'none',
    opacity: 0.6
  };

  return (
    <>
      <style>{floatingAnimationStyles}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none'
      }}>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '52.81%', top: '48.12%', color: '#2E3344' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '28.19%', top: '71.22%', color: '#292A2E' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '95.09%', top: '48.12%', color: '#ABB5CE' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '86.46%', top: '15.33%', color: '#2E3344' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '7.11%', top: '80.91%', color: '#ABB5CE' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '48.06%', top: '8.5%', color: '#ABB5CE' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '72.84%', top: '4.42%', color: '#2E3344' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '9.6%', top: '0%', color: '#1F232E' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '31.54%', top: '54.31%', color: '#6C758E' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '25.28%', top: '15.89%', color: '#1F232E' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '48.55%', top: '82.45%', color: '#292A2E' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '24.41%', top: '92.02%', color: '#2E3344' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '0%', top: '12.8%', color: '#ABB5CE' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '81.02%', top: '94.27%', color: '#6C758E' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '96.02%', top: '0%', color: '#2E3344' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '0.07%', top: '41.2%', color: '#6C758E' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '15%', top: '35%', color: '#3A4158' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '65%', top: '25%', color: '#5A6B8C' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '85%', top: '65%', color: '#2B2F3E' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '42%', top: '35%', color: '#4F5A7A' }}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{ ...symbolStyle, left: '12%', top: '60%', color: '#8A94B8' }}>&#60;/&#62;</div>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sidebar state - initialize from localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'moderator') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Listen for sidebar state changes from Sidebar component
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('sidebarCollapsed', newCollapsedState.toString());
    
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await AdminAPI.getDashboardStats();
      
      if (response.success) {
        setStats(response.data.stats);
        setRecentActivity(response.data.recentActivity);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      if (error.response?.status === 403) {
        setError('Access denied. You need admin privileges to view this data.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError(error.response?.data?.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = '#3b82f6' }) => (
    <div 
      style={{ 
        ...styles.statCard, 
        borderLeft: `4px solid ${color}` 
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={styles.statHeader}>
        <span style={styles.statIcon}>{icon}</span>
        <h3 style={styles.statTitle}>{title}</h3>
      </div>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div style={styles.activityItem}>
      <div style={styles.activityHeader}>
        <span style={styles.activityUser}>
          {activity.users?.full_name || activity.users?.username || 'Unknown Admin'}
        </span>
        <span style={styles.activityTime}>
          {new Date(activity.created_at).toLocaleString()}
        </span>
      </div>
      <div style={styles.activityAction}>
        {activity.action.replace(/_/g, ' ').toLowerCase()}
      </div>
      {activity.resource_type && (
        <div style={styles.activityResource}>
          Resource: {activity.resource_type}
        </div>
      )}
    </div>
  );

  const styles = {
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
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 10px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#d1d5db',
      margin: 0
    },
    statsGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      backdropFilter: 'blur(20px)',
      padding: '24px',
      borderRadius: '16px',
      transition: 'all 0.3s ease'
    },
    statHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px'
    },
    statIcon: {
      fontSize: '24px',
      marginRight: '10px'
    },
    statTitle: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#d1d5db',
      margin: 0
    },
    statValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0
    },
    contentGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '30px'
    },
    section: {
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: 'white',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '30px'
    },
    actionButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    activityItem: {
      padding: '12px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '5px'
    },
    activityUser: {
      fontWeight: '600',
      color: 'white'
    },
    activityTime: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    activityAction: {
      fontSize: '14px',
      color: '#d1d5db'
    },
    activityResource: {
      color: '#9ca3af',
      fontSize: '12px'
    },
    loading: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      minHeight: '400px',
      fontSize: '16px',
      color: '#9ca3af'
    },
    errorContainer: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
      color: '#f87171',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      textAlign: 'center',
      backdropFilter: 'blur(20px)'
    },
    unauthorized: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      margin: '50px auto',
      maxWidth: '500px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)'
    },
    retryButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      marginTop: '15px',
      transition: 'all 0.3s ease'
    },
    systemStatus: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    statusItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    statusLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#d1d5db'
    },
    statusValue: {
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    statusOnline: {
      color: '#22c55e'
    },
    statusOffline: {
      color: '#6b7280'
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <>
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
          <div style={styles.unauthorized}>
            <h2>Unauthorized Access</h2>
            <p>You don't have permission to access this page.</p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
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
            <span>Loading admin dashboard...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
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

        <div style={styles.header}>
          <h1 style={styles.title}>
            <Shield size={28} style={{ color: '#3b82f6' }} />
            Admin Dashboard
          </h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.full_name || user?.username}! Here's what's happening on your platform.
          </p>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            {error}
            <br />
            <button 
              style={styles.retryButton}
              onClick={fetchDashboardData}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Retry
            </button>
          </div>
        )}

        {stats && (
          <div style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers?.toLocaleString() || '0'}
              icon={<Users size={20} />}
              color="#22c55e"
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects?.toLocaleString() || '0'}
              icon={<Folder size={20} />}
              color="#3b82f6"
            />
            <StatCard
              title="Total Challenges"
              value={stats.totalChallenges?.toLocaleString() || '0'}
              icon={<Puzzle size={20} />}
              color="#06b6d4"
            />
            <StatCard
              title="New Users (30d)"
              value={stats.recentRegistrations?.toLocaleString() || '0'}
              icon={<UserPlus size={20} />}
              color="#f59e0b"
            />
            <StatCard
              title="Suspended Users"
              value={stats.suspendedUsers?.toLocaleString() || '0'}
              icon={<Users size={20} />}
              color="#ef4444"
            />
            <StatCard
              title="Total Projects"
              value={stats.totalProjects?.toLocaleString() || '0'}
              icon={<BarChart3 size={20} />}
              color="#8b5cf6"
            />
          </div>
        )}

        <div style={styles.contentGrid}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <div style={styles.quickActions}>
              <button 
                style={styles.actionButton}
                onClick={() => navigate('/admin/users')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Users size={16} />
                Manage Users
              </button>
              <button 
                style={styles.actionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Folder size={16} />
                Manage Projects
              </button>
              <button 
                style={styles.actionButton}
                onClick={() => navigate('/challenges')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Puzzle size={16} />
                Manage Challenges
              </button>
              <button 
                style={styles.actionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Settings size={16} />
                System Settings
              </button>
              <button 
                style={styles.actionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <BarChart3 size={16} />
                View Reports
              </button>
              <button 
                style={styles.actionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <FileText size={16} />
                Activity Logs
              </button>
            </div>

            <h2 style={styles.sectionTitle}>Recent Admin Activity</h2>
            {recentActivity && recentActivity.length > 0 ? (
              <div>
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={`${activity.id}-${index}`} activity={activity} />
                ))}
              </div>
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                No recent admin activity
              </p>
            )}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>System Status</h2>
            <div style={styles.systemStatus}>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>System Status:</span>
                <span style={{...styles.statusValue, ...styles.statusOnline}}>
                  🟢 Online
                </span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Database:</span>
                <span style={{...styles.statusValue, ...styles.statusOnline}}>
                  🟢 Connected
                </span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>User Registration:</span>
                <span style={{...styles.statusValue, ...styles.statusOnline}}>
                  🟢 Enabled
                </span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Maintenance Mode:</span>
                <span style={{...styles.statusValue, ...styles.statusOffline}}>
                  ⚫ Disabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;