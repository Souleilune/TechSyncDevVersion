// frontend/src/pages/Sidebar.js - PORTAL APPROACH FOR MENU
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  FolderOpen, 
  Users, 
  BookOpen, 
  Puzzle, 
  UserCog, 
  Shield, 
  HelpCircle, 
  User, 
  LogOut,
  ChevronRight 
} from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const avatarRef = useRef(null);
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    const handleSidebarToggle = (event) => {
      const newState = event.detail.collapsed;
      setIsCollapsed(newState);
      localStorage.setItem('sidebarCollapsed', newState.toString());
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  // Calculate menu position based on avatar position
  useEffect(() => {
    if (showUserMenu && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top - 160, // Position above avatar
        left: 10
      });
    }
  }, [showUserMenu, isCollapsed]);

  const mainNavItems = [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'projects', label: 'Projects', path: '/projects', icon: FolderOpen },
    { id: 'friends', label: 'Friends', path: '/friends', icon: Users },
    { id: 'learns', label: 'Learns', path: '/learns', icon: BookOpen }
  ];

  const adminNavItems = user?.role === 'admin' || user?.role === 'moderator' ? [
    { id: 'challenges', label: 'Challenges', path: '/challenges', icon: Puzzle },
    ...(user?.role === 'admin' ? [
      { id: 'manage-users', label: 'Manage Users', path: '/admin/users', icon: UserCog }
    ] : []),
    { id: 'admin', label: 'Admin Panel', path: '/admin', icon: Shield }
  ] : [];

  const bottomNavItems = [
    { id: 'help', label: 'Help Center', path: '/help', icon: HelpCircle }
  ];

  const handleNavigation = (path) => {
    if (location.pathname === path || (path === '/' && location.pathname === '/dashboard')) {
      return;
    }
    navigate(path);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    
    if (path === '/admin' && location.pathname === '/admin/users') {
      return false;
    }
    
    if (path === '/admin/users') {
      return location.pathname === '/admin/users' || location.pathname.startsWith('/admin/users/');
    }
    
    if (path === '/admin') {
      return location.pathname === '/admin' || (location.pathname.startsWith('/admin') && !location.pathname.startsWith('/admin/users'));
    }
    
    return location.pathname.startsWith(path);
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

  const handleProfileMenuClick = (e) => {
    e.stopPropagation();
    navigate('/profile');
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
      pointerEvents: 'none',
      overflow: 'hidden'
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
    logo: {
      position: 'relative',
      zIndex: 10,
      padding: isCollapsed ? '24px 14px' : '24px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'padding 0.3s ease'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    logoImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      display: 'block'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0,
      letterSpacing: '-0.025em',
      whiteSpace: 'nowrap',
      display: isCollapsed ? 'none' : 'block',
      transition: 'opacity 0.3s ease'
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
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: '#60a5fa',
      borderRadius: '12px',
      transform: isCollapsed ? 'scale(1.1)' : 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    navItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      transform: isCollapsed ? 'scale(1.05)' : 'translateX(2px)'
    },
    adminNavItem: {
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
    adminNavItemActive: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#f87171',
      borderRadius: '12px',
      transform: isCollapsed ? 'scale(1.1)' : 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.3)'
    },
    adminNavItemHover: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '12px',
      transform: isCollapsed ? 'scale(1.05)' : 'translateX(2px)'
    },
    adminSeparator: {
      height: '1px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      margin: isCollapsed ? '16px 15px' : '16px 20px',
      borderRadius: '1px',
      transition: 'margin 0.3s ease'
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
    userItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'space-between',
      flexDirection: 'row',
      gap: '0'
    },
    userInfo: {
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
    userInfoHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      transform: 'translateY(-1px)'
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      flexShrink: 0,
      border: '2px solid rgba(96, 165, 250, 0.3)'
    },
    userDetails: {
      display: isCollapsed ? 'none' : 'block'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      lineHeight: 1.2
    },
    userRole: {
      fontSize: '12px',
      color: '#9ca3af',
      textTransform: 'capitalize',
      marginTop: '2px'
    },
    icon: {
      width: '20px',
      height: '20px',
      flexShrink: 0,
      marginRight: isCollapsed ? '0' : '12px',
      transition: 'margin 0.3s ease'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      display: isCollapsed ? 'none' : 'block'
    },
    threeDots: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '16px',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)',
      display: isCollapsed ? 'none' : 'block'
    },
    threeDotsHover: {
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
    menuItemIcon: {
      marginRight: '10px',
      width: '16px',
      height: '16px'
    },
    adminBadge: {
      marginLeft: 'auto',
      fontSize: '9px',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      color: '#f87171',
      padding: '2px 6px',
      borderRadius: '8px',
      fontWeight: 'bold',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      display: isCollapsed ? 'none' : 'inline-block'
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

  const NavItem = ({ item, isAdmin = false, isActiveItem, onNavigate }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipY, setTooltipY] = useState(0);
    const IconComponent = item.icon;
    const itemStyles = isAdmin ? styles.adminNavItem : styles.navItem;
    const activeStyles = isAdmin ? styles.adminNavItemActive : styles.navItemActive;
    const hoverStyles = isAdmin ? styles.adminNavItemHover : styles.navItemHover;

    const handleMouseEnter = (e) => {
      if (isCollapsed) {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipY(rect.top + rect.height / 2);
        setShowTooltip(true);
      }
      if (!isActiveItem) {
        Object.assign(e.currentTarget.style, hoverStyles);
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
            ...itemStyles,
            ...(isActiveItem ? activeStyles : {})
          }}
          onClick={() => onNavigate(item.path)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <IconComponent size={20} style={styles.icon} />
          <span style={styles.label}>{item.label}</span>
          {user?.role === 'admin' && item.id === 'admin' && (
            <span style={styles.adminBadge}>ADMIN</span>
          )}
        </div>
        
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

  return (
    <>
      <div style={styles.sidebar}>
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

        <div style={styles.logo}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <img 
                src="/images/logo/TechSyncLogo.png" 
                alt="TechSync Logo" 
                style={styles.logoImage}
              />
            </div>
            <h1 style={styles.logoText}>TechSync</h1>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navSection}>
            {mainNavItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActiveItem={isActive(item.path)}
                onNavigate={handleNavigation}
              />
            ))}

            {adminNavItems.length > 0 && (
              <>
                <div style={styles.adminSeparator}></div>
                {adminNavItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isAdmin={true}
                    isActiveItem={isActive(item.path)}
                    onNavigate={handleNavigation}
                  />
                ))}
              </>
            )}
          </div>

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

        <div style={styles.userSection}>
          <div style={styles.userItem}>
            <div
              ref={avatarRef}
              style={styles.userInfo}
              onClick={handleAvatarClick}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.userInfoHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.userAvatar}>
                {user?.full_name?.charAt(0)?.toUpperCase() || 
                 user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>
                  {user?.full_name || user?.username || 'User'}
                </div>
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <div style={styles.userRole}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                )}
              </div>
            </div>
            
            <button
              style={styles.threeDots}
              onClick={handleThreeDotsClick}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.threeDotsHover);
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

      {/* RENDER MENU OUTSIDE SIDEBAR USING PORTAL-LIKE APPROACH */}
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
            onClick={handleProfileMenuClick}
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
          {(user?.role === 'admin' || user?.role === 'moderator') && (
            <div
              style={styles.menuItem}
              onClick={() => {
                navigate('/admin');
                setShowUserMenu(false);
              }}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.menuItemHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#d1d5db';
              }}
            >
              <Shield size={16} style={styles.menuItemIcon} />
              Admin Dashboard
            </div>
          )}
          <div
            style={{ ...styles.menuItem, ...styles.menuItemLast }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              Object.assign(e.target.style, styles.menuItemHover);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#d1d5db';
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

export default Sidebar;