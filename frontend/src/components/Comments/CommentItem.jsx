import React, { useState } from 'react';
import MentionInput from './MentionInput';
import CommentReplies from './CommentReplies'; // ✅ Import the real CommentReplies component

const CommentItem = ({ 
    comment, 
    projectMembers = [], 
    projectOwner = null,
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

    // ✅ FIXED: Handle reply button click - show both replies AND reply form
    const handleReplyClick = () => {
        setShowReplyForm(!showReplyForm);
        // Also show the replies section so the reply form is visible
        if (!showReplyForm) {
            setShowReplies(true);
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
                    projectOwner={projectOwner}
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
                        onClick={handleReplyClick} 
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

            {/* ✅ FIXED: Show CommentReplies when either showReplies OR showReplyForm is true */}
            {(showReplies || showReplyForm) && !isReply && (
                <CommentReplies
                    parentCommentId={comment.id}
                    taskId={comment.task_id}
                    projectMembers={projectMembers}
                    projectOwner={projectOwner}
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
    projectOwner = null,
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
                projectOwner={projectOwner}
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

export default CommentItem;