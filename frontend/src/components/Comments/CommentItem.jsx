import React, { useState } from 'react';
import MentionInput from './MentionInput';

const CommentItem = ({ 
    comment, 
    projectMembers = [], 
    projectOwner = null, // ✅ NEW: Add project owner prop
    currentUser, 
    onCommentUpdated, 
    onCommentDeleted,
    isReply = false 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);

    const isAuthor = currentUser && comment.user_id === currentUser.id;
    const hasReplies = comment.reply_count > 0;

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = async (newContent, mentions) => {
        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content: newContent,
                    mentions
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update comment');
            }

            onCommentUpdated(data.comment);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating comment:', error);
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete comment');
            }

            onCommentDeleted(comment.id);
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getAuthorName = (userId) => {
        // Check if it's the project owner
        if (projectOwner && projectOwner.id === userId) {
            return projectOwner.full_name || projectOwner.username || 'Project Owner';
        }
        
        // Check in project members
        const member = projectMembers.find(m => m.users?.id === userId);
        if (member) {
            return member.users.full_name || member.users.username || 'Team Member';
        }
        
        return 'Unknown User';
    };

    const getAuthorRole = (userId) => {
        // Check if it's the project owner
        if (projectOwner && projectOwner.id === userId) {
            return 'owner';
        }
        
        // Check in project members
        const member = projectMembers.find(m => m.users?.id === userId);
        return member ? member.role : 'member';
    };

    if (isEditing) {
        return (
            <div className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
                <EditCommentForm
                    initialContent={comment.content}
                    projectMembers={projectMembers}
                    projectOwner={projectOwner} /* ✅ NEW: Pass project owner */
                    onSubmit={handleSaveEdit}
                    onCancel={handleCancelEdit}
                />
            </div>
        );
    }

    return (
        <div className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
            <div className="comment-header">
                <div className="comment-author">
                    <span className="author-name">
                        {getAuthorName(comment.user_id)}
                    </span>
                    <span className="author-role">
                        {getAuthorRole(comment.user_id)}
                    </span>
                    <span className="comment-date">
                        {formatDate(comment.created_at)}
                    </span>
                    {comment.is_edited && (
                        <span className="edited-indicator">(edited)</span>
                    )}
                </div>
                
                {isAuthor && (
                    <div className="comment-actions">
                        <button onClick={handleEdit} className="btn-text">
                            Edit
                        </button>
                        <button onClick={handleDelete} className="btn-text danger">
                            Delete
                        </button>
                    </div>
                )}
            </div>

            <div className="comment-content">
                {comment.content}
            </div>

            {!isReply && (
                <div className="comment-footer">
                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="btn-text"
                    >
                        Reply
                    </button>

                    {hasReplies && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="btn-text"
                        >
                            {showReplies ? 'Hide' : 'View'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>
            )}

            {showReplies && !isReply && (
                <CommentReplies
                    parentCommentId={comment.id}
                    taskId={comment.task_id}
                    projectMembers={projectMembers}
                    projectOwner={projectOwner} /* ✅ NEW: Pass project owner */
                    currentUser={currentUser}
                    onCommentUpdated={onCommentUpdated}
                    onCommentDeleted={onCommentDeleted}
                    showReplyForm={showReplyForm}
                    onReplyFormToggle={setShowReplyForm}
                />
            )}
        </div>
    );
};

// Edit Comment Form Component
const EditCommentForm = ({ 
    initialContent, 
    projectMembers, 
    projectOwner = null, // ✅ NEW: Add project owner prop
    onSubmit, 
    onCancel 
}) => {
    const [content, setContent] = useState(initialContent);
    const [mentions, setMentions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content, mentions);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="edit-comment-form">
            <MentionInput
                value={content}
                onChange={setContent}
                onMentionsChange={setMentions}
                projectMembers={projectMembers}
                projectOwner={projectOwner} /* ✅ NEW: Pass project owner */
                placeholder="Edit your comment..."
                disabled={isSubmitting}
            />
            <div className="edit-form-actions">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="btn-text"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="btn-primary"
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

// Comment Replies Component (placeholder - you'll need to implement this if you have nested comments)
const CommentReplies = ({ 
    parentCommentId, 
    taskId, 
    projectMembers, 
    projectOwner, // ✅ NEW: Add project owner prop
    currentUser, 
    onCommentUpdated, 
    onCommentDeleted, 
    showReplyForm, 
    onReplyFormToggle 
}) => {
    // Implementation would be similar to CommentsList but for replies
    // For now, just a placeholder
    return (
        <div className="comment-replies">
            {showReplyForm && (
                <div className="reply-form">
                    {/* Reply form would go here */}
                    <p>Reply form (to be implemented)</p>
                </div>
            )}
        </div>
    );
};

export default CommentItem;