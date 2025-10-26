import React, { useState, useRef, useEffect } from 'react';
import MentionInput from './MentionInput';

const CommentForm = ({ 
    taskId, 
    parentCommentId = null,
    projectMembers = [],
    projectOwner = null, // ✅ NEW: Add project owner prop
    onCommentCreated,
    onCancel,
    initialContent = '',
    placeholder = 'Write a comment...',
    submitButtonText = 'Comment'
}) => {
    const [content, setContent] = useState(initialContent);
    const [mentions, setMentions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/comments/task/${taskId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content: content.trim(),
                    parentCommentId,
                    mentions
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create comment');
            }

            setContent('');
            setMentions([]);
            onCommentCreated(data.comment);

            if (onCancel) {
                onCancel();
            }

        } catch (error) {
            console.error('Error creating comment:', error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setContent('');
        setMentions([]);
        setError(null);
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            <MentionInput
                ref={textareaRef}
                value={content}
                onChange={setContent}
                onMentionsChange={setMentions}
                projectMembers={projectMembers}
                projectOwner={projectOwner} /* ✅ NEW: Pass project owner */
                placeholder={placeholder}
                disabled={isSubmitting}
            />
            
            <div className="comment-form-actions">
                <div className="character-count">
                    <span className={
                        content.length > 1800 ? 'error' : 
                        content.length > 1500 ? 'warning' : ''
                    }>
                        {content.length}/2000
                    </span>
                </div>
                <div className="button-group">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="btn-text"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!content.trim() || isSubmitting || content.length > 2000}
                        className="btn-primary"
                    >
                        {isSubmitting ? 'Posting...' : submitButtonText}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default CommentForm;