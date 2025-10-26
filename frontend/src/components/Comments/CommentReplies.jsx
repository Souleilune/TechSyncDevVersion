import React, { useState, useEffect, useCallback } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import LoadingSpinner from '../UI/LoadingSpinner';

const CommentReplies = ({ 
    parentCommentId, 
    taskId,
    projectMembers, 
    currentUser, 
    onCommentUpdated, 
    onCommentDeleted,
    showReplyForm,
    onReplyFormToggle
}) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use useCallback to fix dependency warning
    const fetchReplies = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/comments/${parentCommentId}/replies`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch replies');
            }

            setReplies(data.replies);

        } catch (error) {
            console.error('Error fetching replies:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [parentCommentId]);

    useEffect(() => {
        fetchReplies();
    }, [fetchReplies]);

    const handleReplyCreated = (newReply) => {
        setReplies(prev => [...prev, newReply]);
        onReplyFormToggle(false);
    };

    const handleReplyUpdated = (updatedReply) => {
        setReplies(prev => prev.map(reply => 
            reply.id === updatedReply.id ? updatedReply : reply
        ));
        onCommentUpdated(updatedReply);
    };

    const handleReplyDeleted = (replyId) => {
        setReplies(prev => prev.filter(reply => reply.id !== replyId));
        onCommentDeleted(replyId);
    };

    if (loading) {
        return (
            <div className="replies-container">
                <div className="loading-container">
                    <LoadingSpinner size="small" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="replies-container">
                <div className="error-message">
                    <p>Failed to load replies: {error}</p>
                    <button onClick={fetchReplies}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="replies-container">
            {replies.map((reply) => (
                <CommentItem
                    key={reply.id}
                    comment={reply}
                    projectMembers={projectMembers}
                    currentUser={currentUser}
                    onCommentUpdated={handleReplyUpdated}
                    onCommentDeleted={handleReplyDeleted}
                    isReply={true}
                />
            ))}

            {showReplyForm && (
                <CommentForm
                    taskId={taskId}
                    parentCommentId={parentCommentId}
                    projectMembers={projectMembers}
                    onCommentCreated={handleReplyCreated}
                    onCancel={() => onReplyFormToggle(false)}
                    placeholder="Write a reply..."
                    submitButtonText="Reply"
                />
            )}
        </div>
    );
};

export default CommentReplies;
