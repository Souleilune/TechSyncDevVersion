// frontend/src/components/Header/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import './Header.css';

const Header = ({ title, actions = [] }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Debug logs
  console.log('Header render - unreadCount:', unreadCount);
  console.log('Header render - showNotifications:', showNotifications);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        console.log('Clicking outside notification area');
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Notification bell clicked!');
    console.log('Current showNotifications:', showNotifications);
    
    const newState = !showNotifications;
    setShowNotifications(newState);
    setShowUserMenu(false); // Close user menu if open
    
    console.log('Setting showNotifications to:', newState);
  };

  const handleUserMenuClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false); // Close notifications if open
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Left side - Title */}
        <div className="header-left">
          <h1 className="header-title">{title}</h1>
        </div>

        {/* Center - Custom Actions */}
        <div className="header-center">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`header-action-btn ${action.variant || 'secondary'}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <span className="action-icon">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>

        {/* Right side - Notifications and User */}
        <div className="header-right">
          {/* Notifications */}
          <div className="notification-bell-container" ref={notificationRef}>
            <button
              className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
              onClick={handleNotificationClick}
              aria-label="Notifications"
              type="button"
            >
              {/* Bell Icon SVG */}
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown - Positioned absolutely with backdrop */}
            {showNotifications && (
              <>
                {/* Backdrop overlay for better focus */}
                <div 
                  className="notification-backdrop"
                  onClick={() => setShowNotifications(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9998,
                    background: 'transparent'
                  }}
                />
                <div className="notification-dropdown-wrapper">
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="user-menu-container" ref={userMenuRef}>
            <button
              className="user-menu-trigger"
              onClick={handleUserMenuClick}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {user?.full_name?.charAt(0)?.toUpperCase() || 
                 user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="user-name">
                {user?.full_name || user?.username || 'User'}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-avatar-large">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 
                     user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <div className="user-full-name">{user?.full_name || 'User'}</div>
                    <div className="user-email">{user?.email || ''}</div>
                  </div>
                </div>

                <div className="user-dropdown-menu">
                  <button onClick={handleProfileClick} className="user-dropdown-item">
                    <span>👤</span> Profile
                  </button>
                  <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }} className="user-dropdown-item">
                    <span>⚙️</span> Settings
                  </button>
                  <div className="user-dropdown-divider"></div>
                  <button onClick={handleLogout} className="user-dropdown-item danger">
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;