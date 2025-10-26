import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    console.log('🔔 NotificationContext: Provider initialized with user:', user?.id);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) {
            console.log('🔔 NotificationContext: No user for unread count fetch');
            return;
        }
        
        try {
            console.log('🔔 NotificationContext: Fetching unread count...');
            const response = await notificationService.getUnreadCount();
            const count = response.unread_count || 0;
            console.log('🔔 NotificationContext: Unread count fetched:', count);
            setUnreadCount(count);
            setError(null);
        } catch (error) {
            console.error('🔔 NotificationContext: Error fetching unread count:', error);
            
            // Handle specific error types
            if (error.message.includes('429') || error.message.includes('Too many requests')) {
                console.warn('🔔 Rate limited, skipping unread count update');
                return; // Don't set error for rate limits, just skip silently
            }
            
            setError('Failed to fetch unread count');
        }
    }, [user]);

    const fetchNotifications = useCallback(async (params = {}) => {
        if (!user) {
            console.log('🔔 NotificationContext: No user for notifications fetch');
            return;
        }

        try {
            console.log('🔔 NotificationContext: Fetching notifications with params:', params);
            setLoading(true);
            setError(null);
            const response = await notificationService.getCommentNotifications(params);
            const notificationsList = response.notifications || [];
            console.log('🔔 NotificationContext: Notifications fetched:', notificationsList.length);
            setNotifications(notificationsList);
            return response;
        } catch (error) {
            console.error('🔔 NotificationContext: Error fetching notifications:', error);
            
            // Handle specific error types
            if (error.message.includes('429') || error.message.includes('Too many requests')) {
                setError('Rate limited - please wait a moment before refreshing');
            } else {
                setError('Failed to fetch notifications');
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = useCallback(async (notificationIds) => {
        try {
            console.log('🔔 NotificationContext: Marking as read:', notificationIds);
            await notificationService.markNotificationsRead(notificationIds);
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notificationIds.includes(notif.id) 
                        ? { ...notif, is_read: true }
                        : notif
                )
            );
            
            // Update unread count
            setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
            setError(null);
            
        } catch (error) {
            console.error('🔔 NotificationContext: Error marking as read:', error);
            
            if (error.message.includes('429') || error.message.includes('Too many requests')) {
                setError('Rate limited - please wait before trying again');
            } else {
                setError('Failed to mark notifications as read');
            }
            throw error;
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const unreadIds = notifications
                .filter(notif => !notif.is_read)
                .map(notif => notif.id);
            
            if (unreadIds.length > 0) {
                await markAsRead(unreadIds);
            }
        } catch (error) {
            console.error('🔔 NotificationContext: Error marking all as read:', error);
            setError('Failed to mark all notifications as read');
            throw error;
        }
    }, [notifications, markAsRead]);

    const clearError = useCallback(() => {
        console.log('🔔 NotificationContext: Clearing error');
        setError(null);
    }, []);

    // Fetch unread count on mount and set up polling (less frequent)
    useEffect(() => {
        if (user) {
            console.log('🔔 NotificationContext: User found, fetching unread count');
            fetchUnreadCount();
            
            // Poll for unread count every 2 minutes (reduced frequency)
            const interval = setInterval(fetchUnreadCount, 2 * 60 * 1000);
            return () => clearInterval(interval);
        } else {
            console.log('🔔 NotificationContext: No user, clearing state');
            // Clear state when user logs out
            setNotifications([]);
            setUnreadCount(0);
            setError(null);
        }
    }, [user, fetchUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        fetchUnreadCount,
        clearError
    };

    console.log('🔔 NotificationContext: Current state:', {
        notificationsCount: notifications.length,
        unreadCount,
        loading,
        error: !!error
    });

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};