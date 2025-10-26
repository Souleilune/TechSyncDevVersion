// controllers/commentsController.js
const supabase = require('../config/supabase');
const { validateUUID, sanitizeInput } = require('../utils/validation');

class CommentsController {
    // Get comments for a task
    async getTaskComments(req, res) {
    try {
        const { taskId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.id;

        console.log('🔍 Getting comments for task:', taskId, 'by user:', userId);

        if (!validateUUID(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }

        // First, get the task and check if it exists
        const { data: task, error: taskError } = await supabase
            .from('project_tasks')
            .select('id, project_id')
            .eq('id', taskId)
            .single();

        if (taskError || !task) {
            console.error('Task not found:', taskError);
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check if user has access to the project
        const { data: membership, error: memberError } = await supabase
            .from('project_members')
            .select('user_id')
            .eq('project_id', task.project_id)
            .eq('user_id', userId)
            .single();

        if (memberError || !membership) {
            console.error('Access denied - user not a project member:', memberError);
            return res.status(403).json({ error: 'Access denied' });
        }

        console.log('✅ User has access to project');

        // Get comments with author info - simplified query
        const { data: comments, error } = await supabase
            .from('task_comments')
            .select(`
                *,
                author:users!user_id(
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .eq('task_id', taskId)
            .is('parent_comment_id', null) // Only top-level comments
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Error fetching comments:', error);
            return res.status(500).json({ error: 'Failed to fetch comments: ' + error.message });
        }

        // Get total count for pagination
        const { count, error: countError } = await supabase
            .from('task_comments')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', taskId)
            .is('parent_comment_id', null);

        if (countError) {
            console.error('Error counting comments:', countError);
            // Don't fail the request for count errors, just use 0
        }

        // Add reply count manually (since the complex query might be failing)
        const commentsWithReplyCounts = await Promise.all(
            comments.map(async (comment) => {
                const { count: replyCount } = await supabase
                    .from('task_comments')
                    .select('*', { count: 'exact', head: true })
                    .eq('parent_comment_id', comment.id);
                
                return {
                    ...comment,
                    reply_count: replyCount || 0
                };
            })
        );

        console.log('✅ Successfully fetched', commentsWithReplyCounts.length, 'comments');

        res.json({
            comments: commentsWithReplyCounts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count || 0,
                pages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error('💥 Error in getTaskComments:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
}

    // Get replies to a comment
    async getCommentReplies(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;

            if (!validateUUID(commentId)) {
                return res.status(400).json({ error: 'Invalid comment ID' });
            }

            // Check if user has access to the parent comment
            const { data: parentComment, error: parentError } = await supabase
                .from('task_comments')
                .select(`
                    id, task_id,
                    project_tasks!inner(
                        project_id,
                        projects!inner(
                            project_members!inner(user_id)
                        )
                    )
                `)
                .eq('id', commentId)
                .eq('project_tasks.projects.project_members.user_id', userId)
                .single();

            if (parentError || !parentComment) {
                return res.status(404).json({ error: 'Comment not found or access denied' });
            }

            // Get replies
            const { data: replies, error } = await supabase
                .from('task_comments')
                .select(`
                    *,
                    author:users!user_id(
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('parent_comment_id', commentId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching replies:', error);
                return res.status(500).json({ error: 'Failed to fetch replies' });
            }

            res.json({ replies });

        } catch (error) {
            console.error('Error in getCommentReplies:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Create a new comment
    async createComment(req, res) {
        try {
            const { taskId } = req.params;
            const { content, parentCommentId, mentions = [] } = req.body;
            const userId = req.user.id;

            console.log('🚀 Creating comment:', { taskId, userId, content, parentCommentId, mentions });

            if (!validateUUID(taskId)) {
                return res.status(400).json({ error: 'Invalid task ID' });
            }

            if (!content || content.trim().length === 0) {
                return res.status(400).json({ error: 'Comment content is required' });
            }

            if (content.length > 2000) {
                return res.status(400).json({ error: 'Comment content too long (max 2000 characters)' });
            }

            const sanitizedContent = sanitizeInput(content);
            console.log('✅ Content sanitized:', sanitizedContent);

            // Validate parentCommentId if provided
            if (parentCommentId && !validateUUID(parentCommentId)) {
                return res.status(400).json({ error: 'Invalid parent comment ID' });
            }

            // Validate mentions
            const validMentions = [];
            if (mentions.length > 0) {
                for (const mentionUserId of mentions) {
                    if (validateUUID(mentionUserId)) {
                        validMentions.push(mentionUserId);
                    }
                }
            }
            console.log('✅ Valid mentions:', validMentions);

            // Check if user has access to the task - SIMPLIFIED
            console.log('🔍 Checking task access...');
            const { data: task, error: taskError } = await supabase
                .from('project_tasks')
                .select('id, project_id')
                .eq('id', taskId)
                .single();

            if (taskError || !task) {
                console.error('❌ Task not found:', taskError);
                return res.status(404).json({ error: 'Task not found' });
            }

            console.log('✅ Task found:', task);

            // Check project membership
            const { data: membership, error: memberError } = await supabase
                .from('project_members')
                .select('user_id')
                .eq('project_id', task.project_id)
                .eq('user_id', userId)
                .single();

            if (memberError || !membership) {
                console.error('❌ Access denied:', memberError);
                return res.status(403).json({ error: 'Access denied - not a project member' });
            }

            console.log('✅ User has project access');

            // Create the comment - TRY WITHOUT MENTIONS FIRST
            console.log('🔄 Inserting comment...');
            
            const commentData = {
                task_id: taskId,
                user_id: userId,
                content: sanitizedContent,
                parent_comment_id: parentCommentId || null
            };

            // Only add mentions if the column exists
            if (validMentions.length > 0) {
                commentData.mentions = validMentions;
            }

            console.log('📝 Comment data to insert:', commentData);

            const { data: comment, error: insertError } = await supabase
                .from('task_comments')
                .insert(commentData)
                .select(`
                    *,
                    author:users!user_id(
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .single();

            if (insertError) {
                console.error('💥 Insert error:', insertError);
                return res.status(500).json({ 
                    error: 'Failed to create comment: ' + insertError.message,
                    details: insertError
                });
            }

            console.log('✅ Comment created successfully:', comment);

            // Try to create notifications (but don't fail if this fails)
            try {
                await this.createCommentNotifications(comment, task.project_id);
                console.log('✅ Notifications created');
            } catch (notifError) {
                console.error('⚠️ Notification error (non-fatal):', notifError);
            }

            res.status(201).json({ comment });

        } catch (error) {
            console.error('💥 Error in createComment:', error);
            res.status(500).json({ 
                error: 'Internal server error: ' + error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    // Update a comment
    async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { content, mentions = [] } = req.body;
            const userId = req.user.id;

            if (!validateUUID(commentId)) {
                return res.status(400).json({ error: 'Invalid comment ID' });
            }

            if (!content || content.trim().length === 0) {
                return res.status(400).json({ error: 'Comment content is required' });
            }

            if (content.length > 2000) {
                return res.status(400).json({ error: 'Comment content too long (max 2000 characters)' });
            }

            const sanitizedContent = sanitizeInput(content);

            // Validate mentions
            const validMentions = [];
            if (mentions.length > 0) {
                for (const userId of mentions) {
                    if (validateUUID(userId)) {
                        validMentions.push(userId);
                    }
                }
            }

            // Check if user owns the comment
            const { data: existingComment, error: fetchError } = await supabase
                .from('task_comments')
                .select('id, user_id, task_id')
                .eq('id', commentId)
                .eq('user_id', userId)
                .single();

            if (fetchError || !existingComment) {
                return res.status(404).json({ error: 'Comment not found or access denied' });
            }

            // Update the comment
            const { data: comment, error } = await supabase
                .from('task_comments')
                .update({
                    content: sanitizedContent,
                    mentions: validMentions,
                    is_edited: true
                })
                .eq('id', commentId)
                .select(`
                    *,
                    author:users!user_id(
                        id,
                        full_name,
                        avatar_url
                    )
                `)
                .single();

            if (error) {
                console.error('Error updating comment:', error);
                return res.status(500).json({ error: 'Failed to update comment' });
            }

            res.json({ comment });

        } catch (error) {
            console.error('Error in updateComment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Delete a comment
    async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;

            if (!validateUUID(commentId)) {
                return res.status(400).json({ error: 'Invalid comment ID' });
            }

            // Check permissions (owner or project lead/owner)
            const { data: comment, error: fetchError } = await supabase
                .from('task_comments')
                .select(`
                    id, user_id, task_id,
                    project_tasks!inner(
                        project_id,
                        projects!inner(
                            project_members!inner(user_id, role)
                        )
                    )
                `)
                .eq('id', commentId)
                .single();

            if (fetchError || !comment) {
                return res.status(404).json({ error: 'Comment not found' });
            }

            const isOwner = comment.user_id === userId;
            const hasPermissions = comment.project_tasks.projects.project_members.some(
                member => member.user_id === userId && ['lead', 'owner'].includes(member.role)
            );

            if (!isOwner && !hasPermissions) {
                return res.status(403).json({ error: 'Insufficient permissions to delete this comment' });
            }

            // Delete the comment (cascade will handle replies and notifications)
            const { error } = await supabase
                .from('task_comments')
                .delete()
                .eq('id', commentId);

            if (error) {
                console.error('Error deleting comment:', error);
                return res.status(500).json({ error: 'Failed to delete comment' });
            }

            res.status(204).send();

        } catch (error) {
            console.error('Error in deleteComment:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Helper method to create notifications
    async createCommentNotifications(comment, projectId) {
        try {
            const notifications = [];

            // Create notifications for mentions
            if (comment.mentions && comment.mentions.length > 0) {
                for (const mentionedUserId of comment.mentions) {
                    if (mentionedUserId !== comment.user_id) {
                        notifications.push({
                            comment_id: comment.id,
                            user_id: mentionedUserId,
                            notification_type: 'mention'
                        });
                    }
                }
            }

            // Create notifications for task assignee (if not author or already mentioned)
            const { data: task } = await supabase
                .from('project_tasks')
                .select('assigned_to')
                .eq('id', comment.task_id)
                .single();

            if (task && task.assigned_to && 
                task.assigned_to !== comment.user_id && 
                !comment.mentions.includes(task.assigned_to)) {
                notifications.push({
                    comment_id: comment.id,
                    user_id: task.assigned_to,
                    notification_type: 'task_comment'
                });
            }

            // Create notifications for parent comment author (for replies)
            if (comment.parent_comment_id) {
                const { data: parentComment } = await supabase
                    .from('task_comments')
                    .select('user_id')
                    .eq('id', comment.parent_comment_id)
                    .single();

                if (parentComment && 
                    parentComment.user_id !== comment.user_id &&
                    !comment.mentions.includes(parentComment.user_id)) {
                    notifications.push({
                        comment_id: comment.id,
                        user_id: parentComment.user_id,
                        notification_type: 'reply'
                    });
                }
            }

            // Insert notifications
            if (notifications.length > 0) {
                await supabase
                    .from('comment_notifications')
                    .insert(notifications);
            }

        } catch (error) {
            console.error('Error creating notifications:', error);
        }
    }
}

module.exports = new CommentsController();