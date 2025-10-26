import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Notifications.css';

const NotificationDropdown = ({ onClose }) => {
    const { 
        notifications, 
        loading, 
        error,
        fetchNotifications, 
        markAllAsRead, 
        unreadCount,
        clearError
    } = useNotifications();
    const [localError, setLocalError] = useState(null);

    // Use useCallback to fix dependency warning
    const loadNotifications = useCallback(async () => {
        try {
            setLocalError(null);
            if (clearError) clearError();
            await fetchNotifications({ limit: 20 });
        } catch (error) {
            setLocalError('Failed to load notifications');
        }
    }, [fetchNotifications, clearError]);

    // Now loadNotifications is stable and can be used in useEffect
    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const handleMarkAllRead = async () => {
        try {
            setLocalError(null);
            if (clearError) clearError();
            await markAllAsRead();
        } catch (error) {
            setLocalError('Failed to mark notifications as read');
        }
    };

    const displayError = localError || error;

    return (
        <div className="notification-dropdown">
            {/* Header */}
            <div className="notification-dropdown-header">
                <h3>Notifications</h3>
                <div className="notification-actions">
                    {unreadCount > 0 && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="mark-all-read-btn"
                            disabled={loading}
                        >
                            Mark all read
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="close-dropdown-btn"
                        aria-label="Close notifications"
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="notification-dropdown-content">
                {loading && notifications.length === 0 ? (
                    <div className="notification-loading">
                        <LoadingSpinner size="small" />
                        <span>Loading notifications...</span>
                    </div>
                ) : displayError ? (
                    <div className="notification-error">
                        <p>{displayError}</p>
                        <button onClick={loadNotifications}>Try again</button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                        <svg 
                            width="48" 
                            height="48" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5"
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p>No notifications yet</p>
                        <span>You'll see notifications for comments and mentions here</span>
                    </div>
                ) : (
                    <div className="notification-list">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClose={onClose}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="notification-dropdown-footer">
                    <button 
                        onClick={() => {
                            // Navigate to a full notifications page if you have one
                            console.log('Navigate to all notifications');
                            onClose();
                        }}
                        className="view-all-btn"
                    >
                        View all notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;