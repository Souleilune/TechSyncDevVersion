import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationDebug = () => {
    const { 
        notifications, 
        unreadCount, 
        loading, 
        fetchNotifications,
        fetchUnreadCount 
    } = useNotifications();

    const handleTestFetch = async () => {
        try {
            console.log('Testing notification fetch...');
            await fetchNotifications();
            console.log('Notifications fetched successfully');
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleTestUnreadCount = async () => {
        try {
            console.log('Testing unread count fetch...');
            await fetchUnreadCount();
            console.log('Unread count fetched successfully');
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            background: 'white', 
            border: '1px solid #ccc', 
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 9999,
            minWidth: '250px'
        }}>
            <h4>Notification Debug</h4>
            <p>Unread Count: {unreadCount}</p>
            <p>Notifications: {notifications.length}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            
            <div style={{ marginTop: '10px' }}>
                <button 
                    onClick={handleTestFetch}
                    style={{ marginRight: '10px', padding: '5px 10px' }}
                >
                    Test Fetch
                </button>
                <button 
                    onClick={handleTestUnreadCount}
                    style={{ padding: '5px 10px' }}
                >
                    Test Count
                </button>
            </div>

            <div style={{ marginTop: '10px', fontSize: '12px' }}>
                Check browser console for detailed logs
            </div>
        </div>
    );
};

export default NotificationDebug;