// frontend/src/pages/soloproject/SoloProjectSidebar.js - WITH COLLAPSIBLE & ANIMATED SYMBOLS
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
import { 
  ArrowLeft, 
  BarChart3, 
  Target, 
  FileText, 
  Trophy, 
  StickyNote, 
  HelpCircle, 
  User, 
  LogOut,
  ExternalLink 
} from 'lucide-react';

function SoloProjectSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const avatarRef = React.useRef(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW STATE: Track sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('soloProjectSidebarCollapsed');
    return saved === 'true';
  });

  // NEW: Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      const newState = event.detail.collapsed;
      setIsCollapsed(newState);
      localStorage.setItem('soloProjectSidebarCollapsed', newState.toString());
    };

    window.addEventListener('soloProjectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('soloProjectSidebarToggle', handleSidebarToggle);
  }, []);

  // Calculate menu position based on avatar position
  useEffect(() => {
    if (showUserMenu && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top - 160,
        left: isCollapsed ? 70 : 20
      });
    }
  }, [showUserMenu, isCollapsed]);

  // Solo Project navigation items
  const soloProjectNavItems = [
    { id: 'dashboard', label: 'Dashboard', path: `/soloproject/${projectId}/dashboard`, icon: BarChart3 },
    { id: 'goals', label: 'Tasks & Goals', path: `/soloproject/${projectId}/goals`, icon: Target },
    { id: 'info', label: 'Project Info', path: `/soloproject/${projectId}/info`, icon: FileText },
    { id: 'challenge', label: 'Weekly Challenge', path: `/soloproject/${projectId}/challenge`, icon: Trophy },
    { id: 'notes', label: 'Notes', path: `/soloproject/${projectId}/notes`, icon: StickyNote }
  ];

  const bottomNavItems = [
    { id: 'help', label: 'Help Center', path: `/soloproject/${projectId}/help`, icon: HelpCircle }
  ];

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjectById(projectId);
        setProject(response.data.project);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleThreeDotsClick = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    if (isCollapsed) {
      setShowUserMenu(!showUserMenu);
    } else {
      navigate('/profile');
      setShowUserMenu(false);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleExitProject = () => {
    navigate('/projects');
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setShowUserMenu(false);
      navigate('/', { replace: true });
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const styles = {
    sidebar: {
      width: isCollapsed ? '60px' : '250px',
      height: '100vh',
      background: 'linear-gradient(180deg, #1a1d24 0%, #141720 50%, #0d0f14 100%)',
      borderRight: '1px solid rgba(59, 130, 246, 0.15)',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4), inset -1px 0 0 rgba(59, 130, 246, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      overflow: 'hidden',
      transition: 'width 0.3s ease'
    },
    backgroundSymbols: {
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      pointerEvents: 'none'
    },
    codeSymbol: {
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '20px',
      lineHeight: '24px',
      userSelect: 'none',
      pointerEvents: 'none'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      padding: isCollapsed ? '24px 10px' : '24px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      transition: 'padding 0.3s ease'
    },
    projectInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      justifyContent: isCollapsed ? 'center' : 'flex-start'
    },
    backButton: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      flexShrink: 0
    },
    backButtonHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      transform: 'translateY(-1px)'
    },
    projectDetails: {
      flex: 1,
      minWidth: 0,
      textAlign: 'center',
      marginRight: isCollapsed ? '0' : '44px',
      display: isCollapsed ? 'none' : 'block'
    },
    projectTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'white',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      lineHeight: 1.2
    },
    soloIndicator: {
      backgroundColor: 'rgba(147, 51, 234, 0.15)',
      color: '#a855f7',
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '8px',
      textAlign: 'center',
      display: 'inline-block',
      border: '1px solid rgba(147, 51, 234, 0.3)'
    },
    projectBadge: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: '#60a5fa',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginTop: '8px',
      display: 'inline-block',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    nav: {
      position: 'relative',
      zIndex: 10,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 0',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    navSection: {
      display: 'flex',
      flexDirection: 'column'
    },
    navItem: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      padding: isCollapsed ? '14px 0' : '12px 20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      color: '#d1d5db',
      margin: isCollapsed ? '2px 0' : '0 12px',
      marginBottom: '4px',
      backdropFilter: 'blur(8px)',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      borderRadius: isCollapsed ? '0' : '12px'
    },
    navItemActive: {
      backgroundColor: 'rgba(168, 85, 247, 0.15)',
      color: '#a855f7',
      borderRadius: '12px',
      transform: isCollapsed ? 'scale(1.1)' : 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)',
      border: '1px solid rgba(168, 85, 247, 0.3)'
    },
    navItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      transform: isCollapsed ? 'scale(1.05)' : 'translateX(2px)'
    },
    navIcon: {
      marginRight: isCollapsed ? '0' : '12px',
      width: '20px',
      height: '20px',
      flexShrink: 0,
      transition: 'margin 0.3s ease'
    },
    navLabel: {
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      display: isCollapsed ? 'none' : 'block'
    },
    bottomNav: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '20px'
    },
    userSection: {
      position: 'relative',
      zIndex: 10,
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: isCollapsed ? '20px 0' : '20px 16px',
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      transition: 'padding 0.3s ease'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'space-between',
      flexDirection: 'row',
      gap: '0'
    },
    userDetails: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      flex: isCollapsed ? 'none' : 1,
      padding: isCollapsed ? '8px' : '10px 12px',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)',
      gap: isCollapsed ? '0' : '12px'
    },
    userDetailsHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateY(-1px)'
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      color: 'white',
      flexShrink: 0,
      border: '2px solid rgba(168, 85, 247, 0.3)'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      lineHeight: 1.2,
      display: isCollapsed ? 'none' : 'block'
    },
    userRole: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '2px',
      display: isCollapsed ? 'none' : 'block'
    },
    threeDotsButton: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#9ca3af',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)',
      display: isCollapsed ? 'none' : 'block'
    },
    threeDotsButtonHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      transform: 'translateY(-1px)'
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      color: '#d1d5db',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
    },
    menuItemLast: {
      borderBottom: 'none'
    },
    menuItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white'
    },
    exitMenuItem: {
      color: '#60a5fa'
    },
    exitMenuItemHover: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },
    logoutMenuItem: {
      color: '#f87171'
    },
    logoutMenuItemHover: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)'
    },
    menuItemIcon: {
      marginRight: '10px',
      width: '16px',
      height: '16px'
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      fontSize: '14px'
    },
    tooltip: {
      position: 'fixed',
      left: '70px',
      backgroundColor: '#374151',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      zIndex: 10000,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'none'
    },
    tooltipArrow: {
      position: 'absolute',
      left: '-4px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 0,
      height: 0,
      borderTop: '5px solid transparent',
      borderBottom: '5px solid transparent',
      borderRight: '5px solid #374151'
    }
  };

  // Component for navigation items with tooltips
  const NavItem = ({ item, isActiveItem, onNavigate }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipY, setTooltipY] = useState(0);
    const IconComponent = item.icon;

    const handleMouseEnter = (e) => {
      if (isCollapsed) {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipY(rect.top + rect.height / 2);
        setShowTooltip(true);
      }
      if (!isActiveItem) {
        Object.assign(e.currentTarget.style, styles.navItemHover);
      }
    };

    const handleMouseLeave = (e) => {
      if (isCollapsed) {
        setShowTooltip(false);
      }
      if (!isActiveItem) {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderRadius = isCollapsed ? '0' : '12px';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.border = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }
    };

    return (
      <>
        <div
          style={{
            ...styles.navItem,
            ...(isActiveItem ? styles.navItemActive : {})
          }}
          onClick={() => onNavigate(item.path)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <IconComponent size={20} style={styles.navIcon} />
          <span style={styles.navLabel}>{item.label}</span>
        </div>
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && showTooltip && (
          <div 
            style={{
              ...styles.tooltip,
              top: `${tooltipY}px`,
              transform: 'translateY(-50%)'
            }}
          >
            <div style={styles.tooltipArrow} />
            {item.label}
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div style={styles.sidebar}>
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
          `}
        </style>
        
        {/* Background Code Symbols */}
        <div style={styles.backgroundSymbols}>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '25%', top: '15%', color: '#2E3344'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '75%', top: '30%', color: '#ABB5CE'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '15%', top: '45%', color: '#6C758E'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '85%', top: '60%', color: '#292A2E'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '35%', top: '75%', color: '#3A4158'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '65%', top: '85%', color: '#5A6B8C'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '10%', top: '25%', color: '#4F5A7A'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '90%', top: '40%', color: '#8A94B8'
          }}>&#60;/&#62;</div>
        </div>
        <div style={styles.header}>
          <div style={styles.loading}>Loading project...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.sidebar}>
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

            /* Custom scrollbar for nav */
            nav::-webkit-scrollbar {
              width: 4px;
            }

            nav::-webkit-scrollbar-track {
              background: transparent;
            }

            nav::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 2px;
            }

            nav::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}
        </style>
        
        {/* Background Code Symbols */}
        <div style={styles.backgroundSymbols}>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '25%', top: '15%', color: '#2E3344'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '75%', top: '30%', color: '#ABB5CE'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '15%', top: '45%', color: '#6C758E'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '85%', top: '60%', color: '#292A2E'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '35%', top: '75%', color: '#3A4158'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '65%', top: '85%', color: '#5A6B8C'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '10%', top: '25%', color: '#4F5A7A'
          }}>&#60;/&#62;</div>
          <div className="floating-symbol" style={{
            ...styles.codeSymbol,
            left: '90%', top: '40%', color: '#8A94B8'
          }}>&#60;/&#62;</div>
        </div>

        {/* Project Header */}
        <div style={styles.header}>
          <div style={styles.projectInfo}>
            <button
              style={styles.backButton}
              onClick={() => navigate('/projects')}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.backButtonHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = '#9ca3af';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <div style={styles.projectDetails}>
              <h1 style={styles.projectTitle}>
                {project?.title || 'Solo Project'}
              </h1>
              <div style={styles.soloIndicator}>
                Solo Workspace
              </div>
              {project?.status && (
                <div style={{
                  ...styles.projectBadge,
                  backgroundColor: project.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 
                                 project.status === 'completed' ? 'rgba(147, 51, 234, 0.15)' : 
                                 'rgba(107, 114, 128, 0.15)',
                  color: project.status === 'active' ? '#22c55e' : 
                         project.status === 'completed' ? '#a855f7' : '#9ca3af',
                  borderColor: project.status === 'active' ? 'rgba(34, 197, 94, 0.3)' : 
                              project.status === 'completed' ? 'rgba(147, 51, 234, 0.3)' : 
                              'rgba(107, 114, 128, 0.3)',
                  marginTop: '8px'
                }}>
                  {project.status}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navSection}>
            {soloProjectNavItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActiveItem={isActive(item.path)}
                onNavigate={handleNavigation}
              />
            ))}
          </div>

          {/* Bottom Navigation - Help Center */}
          <div style={{ ...styles.navSection, ...styles.bottomNav }}>
            {bottomNavItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActiveItem={isActive(item.path)}
                onNavigate={handleNavigation}
              />
            ))}
          </div>
        </nav>

        {/* User Section with Clickable Profile */}
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div
              ref={avatarRef}
              style={styles.userDetails}
              onClick={handleAvatarClick}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.userDetailsHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.userAvatar}>
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="User Avatar" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                  />
                ) : (
                  user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div>
                <div style={styles.userName}>
                  {user?.full_name || user?.username || 'User'}
                </div>
                <div style={styles.userRole}>Solo Developer</div>
              </div>
            </div>
            <button
              style={styles.threeDotsButton}
              onClick={handleThreeDotsClick}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.threeDotsButtonHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = '#9ca3af';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ⋮
            </button>
          </div>
        </div>
      </div>

      {/* RENDER MENU OUTSIDE SIDEBAR */}
      {showUserMenu && (
        <div 
          className="user-menu-container"
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: '200px',
            backgroundColor: '#1a1c20',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: 10002,
            overflow: 'hidden',
            backdropFilter: 'blur(20px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={styles.menuItem}
            onClick={handleProfileClick}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.menuItemHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#d1d5db';
            }}
          >
            <User size={16} style={styles.menuItemIcon} />
            Profile Settings
          </div>
          <div
            style={{
              ...styles.menuItem,
              ...styles.exitMenuItem
            }}
            onClick={handleExitProject}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.exitMenuItemHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#60a5fa';
            }}
          >
            <ExternalLink size={16} style={styles.menuItemIcon} />
            Exit Solo Workspace
          </div>
          <div
            style={{
              ...styles.menuItem,
              ...styles.logoutMenuItem,
              ...styles.menuItemLast
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.logoutMenuItemHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#f87171';
            }}
          >
            <LogOut size={16} style={styles.menuItemIcon} />
            Logout
          </div>
        </div>
      )}
    </>
  );
}

export default SoloProjectSidebar;