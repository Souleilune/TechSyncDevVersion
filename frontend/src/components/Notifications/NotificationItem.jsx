import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationItem = ({ notification, onClose }) => {
    const navigate = useNavigate();
    const { markAsRead, deleteNotification } = useNotifications();
    const [isDeleting, setIsDeleting] = useState(false);

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
                return '@';
            case 'reply':
                return '💬';
            case 'task_comment':
                return '📝';
            default:
                return '🔔';
        }
    };

    const getNotificationMessage = () => {
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

    const handleClick = async () => {
        try {
            // Mark as read if unread
            if (!notification.is_read) {
                await markAsRead([notification.id]);
            }

            // Navigate to the task
            const { comment } = notification;
            const projectId = comment.task.project.id;
            const taskId = comment.task.id;
            
            navigate(`/project/${projectId}/tasks/${taskId}`);
            onClose();
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent triggering handleClick
        try {
            setIsDeleting(true);
            await deleteNotification(notification.id);
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div 
            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
            onClick={handleClick}
        >
            <div className="notification-icon">
                {getNotificationIcon(notification.notification_type)}
            </div>
            
            <div className="notification-content">
                <p className="notification-message">
                    {getNotificationMessage()}
                </p>
                
                {notification.comment.content && (
                    <div className="notification-preview">
                        "{notification.comment.content.length > 100 
                            ? notification.comment.content.substring(0, 100) + '...'
                            : notification.comment.content}"
                    </div>
                )}
                
                <span className="notification-time">
                    {formatTimeAgo(notification.created_at)}
                </span>
            </div>

            {!notification.is_read && (
                <div className="notification-unread-dot"></div>
            )}

            {/* Delete button */}
            <button
                className="notification-delete-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Delete notification"
            >
                {isDeleting ? '...' : '×'}
            </button>
        </div>
    );
};

export default NotificationItem;