// frontend/src/services/notificationService.js
class NotificationService {
    constructor() {
        this.baseURL = '/api/notifications';
    }

    async getCommentNotifications(params = {}) {
        try {
            console.log('🔔 NotificationService: Fetching notifications with params:', params);
            
            const queryParams = new URLSearchParams();
            
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.unread_only) queryParams.append('unread_only', params.unread_only);

            const url = `${this.baseURL}/comments?${queryParams}`;
            console.log('🔔 NotificationService: Request URL:', url);

            const token = localStorage.getItem('token');
            console.log('🔔 NotificationService: Token exists:', !!token);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('🔔 NotificationService: Response status:', response.status);
            console.log('🔔 NotificationService: Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔔 NotificationService: Error response:', errorText);
                throw new Error(`Failed to fetch notifications: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('🔔 NotificationService: Success data:', data);
            return data;
        } catch (error) {
            console.error('🔔 NotificationService: Error in getCommentNotifications:', error);
            throw error;
        }
    }

    async markNotificationsRead(notificationIds) {
        try {
            console.log('🔔 NotificationService: Marking notifications as read:', notificationIds);
            
            const response = await fetch(`${this.baseURL}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    notification_ids: notificationIds
                })
            });

            console.log('🔔 NotificationService: Mark read response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔔 NotificationService: Mark read error:', errorText);
                throw new Error(`Failed to mark notifications as read: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔔 NotificationService: Mark read success:', data);
            return data;
        } catch (error) {
            console.error('🔔 NotificationService: Error in markNotificationsRead:', error);
            throw error;
        }
    }

    async getUnreadCount() {
        try {
            console.log('🔔 NotificationService: Fetching unread count...');
            
            const response = await fetch(`${this.baseURL}/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('🔔 NotificationService: Unread count response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔔 NotificationService: Unread count error:', errorText);
                throw new Error(`Failed to fetch unread count: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔔 NotificationService: Unread count success:', data);
            return data;
        } catch (error) {
            console.error('🔔 NotificationService: Error in getUnreadCount:', error);
            throw error;
        }
    }
}

export const notificationService = new NotificationService();