const supabase = require('../config/supabase');

class NotificationsController {
    // Get user's comment notifications - SIMPLIFIED VERSION
    async getCommentNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20, unread_only = false } = req.query;

            console.log('Fetching notifications for user:', userId);
            console.log('Query params:', { page, limit, unread_only });

            // STEP 1: First try a simple query to see if basic notifications exist
            let query = supabase
                .from('comment_notifications')
                .select('*')
                .eq('user_id', userId);

            if (unread_only === 'true') {
                query = query.eq('is_read', false);
            }

            const { data: basicNotifications, error: basicError } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);

            if (basicError) {
                console.error('Error fetching basic notifications:', basicError);
                return res.status(500).json({ error: 'Failed to fetch notifications: ' + basicError.message });
            }

            console.log('Basic notifications found:', basicNotifications?.length || 0);

            // If no notifications, return empty array
            if (!basicNotifications || basicNotifications.length === 0) {
                console.log('No notifications found, returning empty array');
                return res.json({ notifications: [] });
            }

            // STEP 2: Try to enrich with comment data (simplified)
            try {
                console.log('Attempting to enrich notifications with comment data...');
                
                const enrichedNotifications = await Promise.all(
                    basicNotifications.map(async (notification) => {
                        try {
                            // Get comment data
                            const { data: comment, error: commentError } = await supabase
                                .from('task_comments')
                                .select(`
                                    id,
                                    content,
                                    task_id,
                                    user_id,
                                    created_at
                                `)
                                .eq('id', notification.comment_id)
                                .single();

                            if (commentError || !comment) {
                                console.warn('Could not fetch comment for notification:', notification.id, commentError);
                                return {
                                    ...notification,
                                    comment: {
                                        id: notification.comment_id,
                                        content: 'Comment not found',
                                        author: { full_name: 'Unknown User' },
                                        task: { title: 'Unknown Task', project: { name: 'Unknown Project' } }
                                    }
                                };
                            }

                            // Get author data
                            const { data: author } = await supabase
                                .from('users')
                                .select('id, full_name, avatar_url')
                                .eq('id', comment.user_id)
                                .single();

                            // Get task data
                            const { data: task } = await supabase
                                .from('project_tasks')
                                .select('id, title, project_id')
                                .eq('id', comment.task_id)
                                .single();

                            // Get project data
                            let project = null;
                            if (task?.project_id) {
                                const { data: projectData } = await supabase
                                    .from('projects')
                                    .select('id, title')
                                    .eq('id', task.project_id)
                                    .single();
                                project = projectData;
                            }

                            return {
                                ...notification,
                                comment: {
                                    ...comment,
                                    author: author || { full_name: 'Unknown User' },
                                    task: {
                                        ...task,
                                        project: project || { name: 'Unknown Project' }
                                    }
                                }
                            };

                        } catch (enrichError) {
                            console.warn('Error enriching notification:', notification.id, enrichError);
                            return {
                                ...notification,
                                comment: {
                                    id: notification.comment_id,
                                    content: 'Error loading comment',
                                    author: { full_name: 'Unknown User' },
                                    task: { title: 'Unknown Task', project: { name: 'Unknown Project' } }
                                }
                            };
                        }
                    })
                );

                console.log('Successfully enriched', enrichedNotifications.length, 'notifications');
                res.json({ notifications: enrichedNotifications });

            } catch (enrichError) {
                console.error('Error enriching notifications, returning basic data:', enrichError);
                // Fallback: return basic notifications with minimal structure
                const fallbackNotifications = basicNotifications.map(notification => ({
                    ...notification,
                    comment: {
                        id: notification.comment_id,
                        content: 'Unable to load comment details',
                        author: { full_name: 'Unknown User' },
                        task: { title: 'Unknown Task', project: { name: 'Unknown Project' } }
                    }
                }));
                res.json({ notifications: fallbackNotifications });
            }

        } catch (error) {
            console.error('Error in getCommentNotifications:', error);
            res.status(500).json({ error: 'Internal server error: ' + error.message });
        }
    }

    // Mark notifications as read
    async markNotificationsRead(req, res) {
        try {
            const userId = req.user.id;
            const { notification_ids } = req.body;

            console.log('Marking notifications as read for user:', userId, 'IDs:', notification_ids);

            if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
                return res.status(400).json({ error: 'Invalid notification IDs' });
            }

            const { error } = await supabase
                .from('comment_notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .in('id', notification_ids);

            if (error) {
                console.error('Error marking notifications as read:', error);
                return res.status(500).json({ error: 'Failed to update notifications: ' + error.message });
            }

            console.log('Successfully marked', notification_ids.length, 'notifications as read');
            res.json({ success: true });

        } catch (error) {
            console.error('Error in markNotificationsRead:', error);
            res.status(500).json({ error: 'Internal server error: ' + error.message });
        }
    }

    // Get unread count - SIMPLE VERSION
    async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;

            console.log('Fetching unread count for user:', userId);

            const { data, error } = await supabase
                .from('comment_notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                console.error('Error fetching unread count:', error);
                return res.status(500).json({ error: 'Failed to fetch unread count: ' + error.message });
            }

            const unreadCount = data ? data.length : 0;
            console.log('Unread count for user', userId, ':', unreadCount);

            res.json({ unread_count: unreadCount });

        } catch (error) {
            console.error('Error in getUnreadCount:', error);
            res.status(500).json({ error: 'Internal server error: ' + error.message });
        }
    }

    // Delete notification
    async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const userId = req.user.id;

            console.log('Deleting notification:', notificationId, 'for user:', userId);

            const { error } = await supabase
                .from('comment_notifications')
                .delete()
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting notification:', error);
                return res.status(500).json({ error: 'Failed to delete notification: ' + error.message });
            }

            console.log('Successfully deleted notification:', notificationId);
            res.json({ success: true });

        } catch (error) {
            console.error('Error in deleteNotification:', error);
            res.status(500).json({ error: 'Internal server error: ' + error.message });
        }
    }

    // Test endpoint to check if table exists
    async testConnection(req, res) {
        try {
            console.log('Testing notification table connection...');
            
            const { data, error } = await supabase
                .from('comment_notifications')
                .select('count', { count: 'exact', head: true });

            if (error) {
                console.error('Table test failed:', error);
                return res.status(500).json({ 
                    error: 'Table connection failed', 
                    details: error.message 
                });
            }

            console.log('Table exists, total notifications:', data);
            res.json({ 
                success: true, 
                message: 'Notification table accessible',
                total_notifications: data
            });

        } catch (error) {
            console.error('Error in testConnection:', error);
            res.status(500).json({ error: 'Test connection failed: ' + error.message });
        }
    }
}

module.exports = new NotificationsController();
