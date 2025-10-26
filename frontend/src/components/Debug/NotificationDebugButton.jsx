import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';

const NotificationDebugButton = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const { unreadCount, fetchUnreadCount } = useNotifications();

    const handleClick = () => {
        console.log('Debug button clicked!');
        console.log('Current showDropdown state:', showDropdown);
        setShowDropdown(!showDropdown);
        console.log('New showDropdown state:', !showDropdown);
    };

    const handleTestFetch = async () => {
        try {
            console.log('Testing notification fetch...');
            await fetchUnreadCount();
            console.log('Fetch completed');
        } catch (error) {
            console.error('Fetch failed:', error);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            zIndex: 9999,
            background: 'white',
            border: '2px solid red',
            padding: '10px',
            borderRadius: '8px'
        }}>
            <div>DEBUG: Notification Test</div>
            <div>Unread Count: {unreadCount}</div>
            <div>Dropdown Shown: {showDropdown ? 'YES' : 'NO'}</div>
            
            <button 
                onClick={handleClick}
                style={{ 
                    background: 'blue', 
                    color: 'white', 
                    padding: '5px 10px', 
                    margin: '5px',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Toggle Dropdown
            </button>
            
            <button 
                onClick={handleTestFetch}
                style={{ 
                    background: 'green', 
                    color: 'white', 
                    padding: '5px 10px', 
                    margin: '5px',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Test Fetch
            </button>

            {showDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: 0, width: '300px' }}>
                    <NotificationDropdown onClose={() => setShowDropdown(false)} />
                </div>
            )}
        </div>
    );
};

export default NotificationDebugButton;
