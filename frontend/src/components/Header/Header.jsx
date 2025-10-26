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
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown-wrapper">
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              </div>
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
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 
                       user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                      <div className="user-display-name">
                        {user?.full_name || user?.username || 'User'}
                      </div>
                      <div className="user-email">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="user-dropdown-content">
                  <button
                    className="dropdown-item"
                    onClick={handleProfileClick}
                  >
                    👤 Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/');
                      setShowUserMenu(false);
                    }}
                  >
                    🏠 Dashboard
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/projects');
                      setShowUserMenu(false);
                    }}
                  >
                    📁 Projects
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    🚪 Logout
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