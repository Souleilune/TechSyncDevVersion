import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CommentsList from './CommentsList';
import CommentForm from './CommentForm';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Comments.css';

const CommentsContainer = ({ taskId, projectMembers = [], projectOwner = null }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const commentsEndRef = useRef(null);

    // Use useCallback to fix dependency warnings
    const fetchComments = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/comments/task/${taskId}?page=${page}&limit=${pagination.limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch comments');
            }

            if (page === 1) {
                setComments(data.comments);
            } else {
                setComments(prev => [...prev, ...data.comments]);
            }
            
            setPagination(data.pagination);

        } catch (error) {
            console.error('Error fetching comments:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [taskId, pagination.limit]);

    useEffect(() => {
        if (taskId) {
            fetchComments();
        }
    }, [taskId, fetchComments]);

    const handleCommentCreated = (newComment) => {
        setComments(prev => [newComment, ...prev]);
        setPagination(prev => ({
            ...prev,
            total: prev.total + 1
        }));
        
        // Scroll to top to show new comment
        scrollToTop();
    };

    const handleCommentUpdated = (updatedComment) => {
        setComments(prev => prev.map(comment => 
            comment.id === updatedComment.id ? updatedComment : comment
        ));
    };

    const handleCommentDeleted = (commentId) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        setPagination(prev => ({
            ...prev,
            total: prev.total - 1
        }));
    };

    const loadMoreComments = () => {
        if (pagination.page < pagination.pages) {
            fetchComments(pagination.page + 1);
        }
    };

    const scrollToTop = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading && comments.length === 0) {
        return (
            <div className="comments-container">
                <div className="comments-header">
                    <h3>Comments</h3>
                </div>
                <div className="loading-container">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="comments-container">
            <div className="comments-header">
                <h3>Comments ({pagination.total})</h3>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => fetchComments()}>Try Again</button>
                </div>
            )}

            <CommentForm
                taskId={taskId}
                projectMembers={projectMembers}
                projectOwner={projectOwner} /* ✅ NEW: Pass project owner */
                onCommentCreated={handleCommentCreated}
                placeholder="Add a comment..."
            />

            <div ref={commentsEndRef} />

            <CommentsList
                comments={comments}
                projectMembers={projectMembers}
                projectOwner={projectOwner} /* ✅ NEW: Pass project owner to replies */
                currentUser={user}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
            />

            {pagination.page < pagination.pages && (
                <div className="load-more-container">
                    <button
                        onClick={loadMoreComments}
                        disabled={loading}
                        className="btn-secondary"
                    >
                        {loading ? 'Loading...' : 'Load More Comments'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentsContainer;