// frontend/src/components/TimelineFeed.js
import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Zap, 
  MessageCircle, 
  Users, 
  Calendar, 
  Code, 
  Clock,
  ExternalLink,
  Github,
  MoreVertical,
  Send,
  Edit2,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TimelineFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [replyTo, setReplyTo] = useState({});

  useEffect(() => {
    fetchTimelineFeed();
  }, [filter]);

  const fetchTimelineFeed = async (pageNum = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/timeline/feed`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pageNum,
          limit: 10,
          filter: filter
        }
      });

      if (response.data.success) {
        if (pageNum === 1) {
          setPosts(response.data.data.posts);
        } else {
          setPosts(prev => [...prev, ...response.data.data.posts]);
        }
        setHasMore(response.data.data.pagination.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching timeline feed:', err);
      setError('Failed to load timeline feed');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/timeline/posts/${postId}/react`,
        { reactionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update posts with new reaction state
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            const { action, reactionType: newReaction } = response.data.data;
            const reactions = { ...post.engagement.reactions };
            
            // Remove old reaction count if changing
            if (reactions.userReaction && reactions.userReaction !== newReaction) {
              reactions[reactions.userReaction]--;
              reactions.total--;
            }
            
            if (action === 'removed') {
              reactions[reactions.userReaction]--;
              reactions.total--;
              reactions.userReaction = null;
            } else if (action === 'added') {
              reactions[newReaction]++;
              reactions.total++;
              reactions.userReaction = newReaction;
            } else if (action === 'updated') {
              reactions[newReaction]++;
              reactions.total++;
              reactions.userReaction = newReaction;
            }

            return {
              ...post,
              engagement: {
                ...post.engagement,
                reactions
              }
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Error reacting to post:', err);
    }
  };

  const toggleComments = async (postId) => {
    if (expandedComments[postId]) {
      setExpandedComments(prev => ({ ...prev, [postId]: null }));
    } else {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/timeline/posts/${postId}/comments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setExpandedComments(prev => ({
            ...prev,
            [postId]: response.data.data.comments
          }));
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    }
  };

  const handleAddComment = async (postId, parentCommentId = null) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/timeline/posts/${postId}/comments`,
        { content, parentCommentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Clear input
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        setReplyTo(prev => ({ ...prev, [postId]: null }));
        
        // Refresh comments
        toggleComments(postId);
        toggleComments(postId);
        
        // Update comment count
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              engagement: {
                ...post.engagement,
                commentsCount: post.engagement.commentsCount + 1
              }
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment, postId, isReply = false) => (
    <div
      key={comment.id}
      style={{
        marginLeft: isReply ? '40px' : '0',
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#1a1d24',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <img
          src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.full_name || 'User'}&background=3b82f6&color=fff`}
          alt={comment.author?.full_name}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>
              {comment.author?.full_name || comment.author?.username}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {formatTimeAgo(comment.created_at)}
            </span>
            {comment.is_edited && (
              <span style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
                (edited)
              </span>
            )}
          </div>
          <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.5', margin: '4px 0 8px 0' }}>
            {comment.content}
          </p>
          <button
            onClick={() => setReplyTo(prev => ({ ...prev, [postId]: comment.id }))}
            style={{
              fontSize: '12px',
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              fontWeight: '500'
            }}
          >
            Reply
          </button>
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          {comment.replies.map(reply => renderComment(reply, postId, true))}
        </div>
      )}
    </div>
  );

  const renderPost = (post) => (
    <div
      key={post.id}
      style={{
        backgroundColor: '#1a1d24',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Post Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <img
          src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name || 'User'}&background=3b82f6&color=fff`}
          alt={post.author?.full_name}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '600', margin: 0 }}>
              {post.author?.full_name || post.author?.username}
            </h3>
            <span style={{
              padding: '2px 8px',
              backgroundColor: post.project_type === 'solo' ? '#8b5cf6' : '#3b82f6',
              color: 'white',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {post.project_type === 'solo' ? 'SOLO' : 'GROUP'}
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '2px 0 0 0' }}>
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
          {post.title}
        </h2>
        {post.description && (
          <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            {post.description.length > 200 
              ? post.description.substring(0, 200) + '...' 
              : post.description}
          </p>
        )}

        {/* Project Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#0f1116',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#3b82f6" />
            <div>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Duration</p>
              <p style={{ fontSize: '14px', color: 'white', fontWeight: '600', margin: 0 }}>
                {post.duration_days} days
              </p>
            </div>
          </div>

          {post.project_type === 'group' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#10b981" />
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Team Size</p>
                <p style={{ fontSize: '14px', color: 'white', fontWeight: '600', margin: 0 }}>
                  {post.team_size} members
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={16} color="#f59e0b" />
            <div>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Completion</p>
              <p style={{ fontSize: '14px', color: 'white', fontWeight: '600', margin: 0 }}>
                {post.completion_percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        {post.tech_stack && post.tech_stack.length > 0 && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
              Technologies:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {post.tech_stack.map((tech, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#1e293b',
                    color: '#3b82f6',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Engagement Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Sync Reaction */}
        <button
          onClick={() => handleReaction(post.id, 'sync')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: post.engagement.reactions.userReaction === 'sync' 
              ? 'rgba(59, 130, 246, 0.2)' 
              : 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: post.engagement.reactions.userReaction === 'sync' ? '#3b82f6' : '#d1d5db',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (post.engagement.reactions.userReaction !== 'sync') {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (post.engagement.reactions.userReaction !== 'sync') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Zap size={18} fill={post.engagement.reactions.userReaction === 'sync' ? '#3b82f6' : 'none'} />
          <span>I sync with this!</span>
          {post.engagement.reactions.sync > 0 && (
            <span style={{ fontWeight: 'bold' }}>({post.engagement.reactions.sync})</span>
          )}
        </button>

        {/* Love Reaction */}
        <button
          onClick={() => handleReaction(post.id, 'love')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: post.engagement.reactions.userReaction === 'love' 
              ? 'rgba(239, 68, 68, 0.2)' 
              : 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: post.engagement.reactions.userReaction === 'love' ? '#ef4444' : '#d1d5db',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (post.engagement.reactions.userReaction !== 'love') {
              e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (post.engagement.reactions.userReaction !== 'love') {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Heart size={18} fill={post.engagement.reactions.userReaction === 'love' ? '#ef4444' : 'none'} />
          <span>I love this!</span>
          {post.engagement.reactions.love > 0 && (
            <span style={{ fontWeight: 'bold' }}>({post.engagement.reactions.love})</span>
          )}
        </button>

        {/* Comments */}
        <button
          onClick={() => toggleComments(post.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: expandedComments[post.id] ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#d1d5db',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          <MessageCircle size={18} />
          <span>Comments</span>
          {post.engagement.commentsCount > 0 && (
            <span style={{ fontWeight: 'bold' }}>({post.engagement.commentsCount})</span>
          )}
        </button>
      </div>

      {/* Comments Section */}
      {expandedComments[post.id] && (
        <div style={{ marginTop: '16px' }}>
          {/* Add Comment Input */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=3b82f6&color=fff`}
              alt="You"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder={replyTo[post.id] ? "Write a reply..." : "Write a comment..."}
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment(post.id, replyTo[post.id]);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  backgroundColor: '#0f1116',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleAddComment(post.id, replyTo[post.id])}
                disabled={!commentInputs[post.id]?.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: commentInputs[post.id]?.trim() ? '#3b82f6' : '#1e293b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: commentInputs[post.id]?.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Display Comments */}
          {expandedComments[post.id]?.length > 0 ? (
            expandedComments[post.id].map(comment => renderComment(comment, post.id))
          ) : (
            <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (loading && page === 1) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px',
        color: '#6b7280'
      }}>
        <div>Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        backgroundColor: '#1a1d24',
        borderRadius: '12px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#ef4444'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        padding: '8px',
        backgroundColor: '#1a1d24',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {[
          { value: 'all', label: 'All Projects' },
          { value: 'friends', label: 'Friends' },
          { value: 'solo', label: 'Solo' },
          { value: 'group', label: 'Group' }
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: filter === value ? '#3b82f6' : 'transparent',
              color: filter === value ? 'white' : '#d1d5db',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          backgroundColor: '#1a1d24',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <Calendar size={48} color="#6b7280" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>
            No posts yet
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Complete projects to see them appear here!
          </p>
        </div>
      ) : (
        <>
          {posts.map(renderPost)}

          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => fetchTimelineFeed(page + 1)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimelineFeed;