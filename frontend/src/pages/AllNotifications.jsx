// frontend/src/pages/AllNotifications.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Check, CheckCheck, AtSign, MessageCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './AllNotifications.css';

const AllNotifications = () => {
    const navigate = useNavigate();
    const {
        notifications,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearError
    } = useNotifications();

    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const [localError, setLocalError] = useState(null);
    const [deletingIds, setDeletingIds] = useState(new Set());

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLocalError(null);
            if (clearError) clearError();
            await fetchNotifications({ limit: 100 }); // Load more notifications on full page
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setLocalError('Failed to load notifications');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            setLocalError(null);
            if (clearError) clearError();
            await markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            setLocalError('Failed to mark all as read');
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            setDeletingIds(prev => new Set(prev).add(notificationId));
            await deleteNotification(notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
            setLocalError('Failed to delete notification');
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(notificationId);
                return newSet;
            });
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.is_read) {
                await markAsRead([notification.id]);
            }

            const { comment } = notification;
            const projectId = comment.task.project.id;
            const taskId = comment.task.id;

            navigate(`/project/${projectId}/tasks/${taskId}`);
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const notificationDate = new Date(dateString);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return notificationDate.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'mention':
                return <AtSign size={18} />;
            case 'reply':
                return <MessageCircle size={18} />;
            case 'task_comment':
                return <FileText size={18} />;
            default:
                return <Bell size={18} />;
        }
    };

    const getNotificationMessage = (notification) => {
        const { comment } = notification;
        const authorName = comment.author.full_name;
        const taskTitle = comment.task.title;
        const projectName = comment.task.project.name;

        switch (notification.notification_type) {
            case 'mention':
                return `${authorName} mentioned you in a comment on "${taskTitle}"`;
            case 'reply':
                return `${authorName} replied to your comment on "${taskTitle}"`;
            case 'task_comment':
                return `${authorName} commented on "${taskTitle}" in ${projectName}`;
            default:
                return `${authorName} left a comment`;
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.is_read;
        if (filter === 'read') return notification.is_read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const displayError = localError || error;

    return (
        <div className="all-notifications-page">
            {/* Header */}
            <div className="all-notifications-header">
                <div className="header-title-section">
                    <Bell size={28} className="header-icon" />
                    <h1>Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>

                <div className="header-actions">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="mark-all-read-button"
                            disabled={loading}
                        >
                            <CheckCheck size={18} />
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="notification-filters">
                <button
                    className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                    <span className="filter-count">{notifications.length}</span>
                </button>
                <button
                    className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread
                    <span className="filter-count">{unreadCount}</span>
                </button>
                <button
                    className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
                    onClick={() => setFilter('read')}
                >
                    Read
                    <span className="filter-count">{notifications.length - unreadCount}</span>
                </button>
            </div>

            {/* Content */}
            <div className="all-notifications-content">
                {loading && notifications.length === 0 ? (
                    <div className="notifications-loading">
                        <LoadingSpinner size="large" />
                        <p>Loading notifications...</p>
                    </div>
                ) : displayError ? (
                    <div className="notifications-error">
                        <p>{displayError}</p>
                        <button onClick={loadNotifications} className="retry-button">
                            Try again
                        </button>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="notifications-empty">
                        <Bell size={64} className="empty-icon" />
                        <h2>
                            {filter === 'unread' ? 'No unread notifications' : 
                             filter === 'read' ? 'No read notifications' : 
                             'No notifications yet'}
                        </h2>
                        <p>
                            {filter === 'all' 
                                ? "You'll see notifications for comments and mentions here"
                                : `You don't have any ${filter} notifications`}
                        </p>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="notification-card-icon">
                                    {getNotificationIcon(notification.notification_type)}
                                </div>

                                <div className="notification-card-content">
                                    <p className="notification-card-message">
                                        {getNotificationMessage(notification)}
                                    </p>

                                    {notification.comment.content && (
                                        <div className="notification-card-preview">
                                            "{notification.comment.content.length > 150
                                                ? notification.comment.content.substring(0, 150) + '...'
                                                : notification.comment.content}"
                                        </div>
                                    )}

                                    <div className="notification-card-meta">
                                        <span className="notification-time">
                                            {formatTimeAgo(notification.created_at)}
                                        </span>
                                        {!notification.is_read && (
                                            <span className="unread-indicator">
                                                <Check size={14} />
                                                New
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="notification-delete-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(notification.id);
                                    }}
                                    disabled={deletingIds.has(notification.id)}
                                    aria-label="Delete notification"
                                >
                                    {deletingIds.has(notification.id) ? (
                                        <LoadingSpinner size="small" />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllNotifications;