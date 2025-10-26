import React from 'react';
import CommentItem from './CommentItem';

const CommentsList = ({ 
    comments = [], 
    projectMembers = [], 
    projectOwner = null, // ✅ NEW: Add project owner prop
    currentUser, 
    onCommentUpdated, 
    onCommentDeleted 
}) => {
    if (comments.length === 0) {
        return (
            <div className="comments-list">
                <div className="comments-empty">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="comments-list">
            {comments.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    projectMembers={projectMembers}
                    projectOwner={projectOwner} /* ✅ NEW: Pass project owner */
                    currentUser={currentUser}
                    onCommentUpdated={onCommentUpdated}
                    onCommentDeleted={onCommentDeleted}
                />
            ))}
        </div>
    );
};

export default CommentsList;