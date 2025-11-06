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
  Trash2,
  PartyPopper,
  X,
  Trophy,
  Award
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  const handleUserClick = async (userId) => {
    if (userId === user?.id) {
      // Don't open modal for current user
      return;
    }

    try {
      setProfileLoading(true);
      setShowProfileModal(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/friends/${userId}/public-profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedUser(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setShowProfileModal(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
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
    if (!content) {
      console.log('❌ No content to submit');
      return;
    }

    console.log('📤 Submitting comment:', { postId, content, parentCommentId });

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ No auth token found');
        alert('Please log in to comment');
        return;
      }

      console.log('🔄 Making API request to:', `${API_URL}/timeline/posts/${postId}/comments`);
      
      const response = await axios.post(
        `${API_URL}/timeline/posts/${postId}/comments`,
        { content, parentCommentId },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('✅ Comment API response:', response.data);

      if (response.data.success) {
        // Clear input immediately
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        setReplyTo(prev => ({ ...prev, [postId]: null }));
        
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

        // Refresh comments to show the new one
        try {
          const commentsResponse = await axios.get(
            `${API_URL}/timeline/posts/${postId}/comments`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (commentsResponse.data.success) {
            setExpandedComments(prev => ({
              ...prev,
              [postId]: commentsResponse.data.data.comments
            }));
          }
        } catch (refreshErr) {
          console.error('Error refreshing comments:', refreshErr);
        }

        console.log('✅ Comment submitted successfully');
      }
    } catch (err) {
      console.error('❌ Error adding comment:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
      } else if (err.response?.status === 404) {
        alert('Post not found.');
      } else {
        alert('Failed to post comment. Please try again.');
      }
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
        <div
          onClick={() => handleUserClick(comment.author?.id)}
          style={{
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            overflow: 'hidden'
          }}
        >
          <img
            src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.full_name || 'User'}&background=3b82f6&color=fff`}
            alt={comment.author?.full_name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span 
              onClick={() => handleUserClick(comment.author?.id)}
              style={{ 
                fontWeight: '600', 
                color: 'white', 
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
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
        <div
          onClick={() => handleUserClick(post.author?.id)}
          style={{
            cursor: 'pointer',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            overflow: 'hidden'
          }}
        >
          <img
            src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${post.author?.full_name || 'User'}&background=3b82f6&color=fff`}
            alt={post.author?.full_name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 
              onClick={() => handleUserClick(post.author?.id)}
              style={{ 
                color: 'white', 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: 0,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
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
        <h2 style={{ 
          color: 'white', 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <PartyPopper size={22} color="#f59e0b" />
          {post.title.replace(/🎉|🎊|[\u{1F389}\u{1F38A}]/gu, '').trim()}
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
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '12px',
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

        {/* Links */}
        {(post.github_repo_url || post.live_demo_url) && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            {post.github_repo_url && (
              <a
                href={post.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#0f1116',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1a1d24'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#0f1116'}
              >
                <Github size={16} />
                GitHub
              </a>
            )}
            {post.live_demo_url && (
              <a
                href={post.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                <ExternalLink size={16} />
                Live Demo
              </a>
            )}
          </div>
        )}
      </div>

      {/* Engagement Actions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <button
          onClick={() => handleReaction(post.id, 'sync')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: post.engagement.reactions.userReaction === 'sync' ? '#3b82f6' : 'transparent',
            color: post.engagement.reactions.userReaction === 'sync' ? 'white' : '#d1d5db',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          <Zap size={16} />
          {post.engagement.reactions.sync}
        </button>

        <button
          onClick={() => handleReaction(post.id, 'love')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: post.engagement.reactions.userReaction === 'love' ? '#ef4444' : 'transparent',
            color: post.engagement.reactions.userReaction === 'love' ? 'white' : '#d1d5db',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          <Heart size={16} />
          {post.engagement.reactions.love}
        </button>

        <button
          onClick={() => toggleComments(post.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            color: '#d1d5db',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          <MessageCircle size={16} />
          {post.engagement.commentsCount}
        </button>
      </div>

      {/* Comments Section */}
      {expandedComments[post.id] && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {/* Add Comment Input */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              value={commentInputs[post.id] || ''}
              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddComment(post.id, replyTo[post.id]);
                }
              }}
              placeholder={replyTo[post.id] ? 'Write a reply...' : 'Write a comment...'}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: '#0f1116',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px'
              }}
            />
            <button
              onClick={() => handleAddComment(post.id, replyTo[post.id])}
              style={{
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={16} />
            </button>
          </div>

          {/* Comments List */}
          {expandedComments[post.id] && expandedComments[post.id].length > 0 ? (
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
    <div style={{ maxWidth: '100%', paddingRight: '40px' }}>
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
          { value: 'group', label: 'Group' },
          { value: 'solo', label: 'Solo' }
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

      {/* User Profile Modal */}
      {showProfileModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={closeProfileModal}
        >
          <div 
            style={{
              backgroundColor: '#1a1c20',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 24px 0 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>
                User Profile
              </h2>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
                }}
                onClick={closeProfileModal}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#9ca3af';
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              {profileLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                  Loading profile...
                </div>
              ) : selectedUser ? (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontWeight: '600',
                      overflow: 'hidden'
                    }}>
                      {selectedUser.user.avatar_url ? (
                        <img
                          src={selectedUser.user.avatar_url}
                          alt={selectedUser.user.full_name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        selectedUser.user.full_name?.charAt(0).toUpperCase() || 
                        selectedUser.user.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '22px',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '4px'
                      }}>
                        {selectedUser.user.full_name || selectedUser.user.username}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#9ca3af',
                        marginBottom: '4px'
                      }}>
                        @{selectedUser.user.username}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        marginTop: '8px'
                      }}>
                        {selectedUser.user.years_experience || 0} year{selectedUser.user.years_experience !== 1 ? 's' : ''} of experience
                      </p>
                    </div>
                  </div>

                  {selectedUser.user.bio && (
                    <div style={{ marginBottom: '30px' }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#d1d5db',
                        lineHeight: '1.6'
                      }}>
                        {selectedUser.user.bio}
                      </p>
                    </div>
                  )}

                  {/* Achievements Section */}
                  <div style={{ marginBottom: '30px' }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#fbbf24',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Trophy size={20} />
                      Achievements
                    </h4>
                    {selectedUser.achievements && selectedUser.achievements.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedUser.achievements.map((achievement, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '16px',
                              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
                              borderRadius: '12px',
                              border: '1px solid rgba(251, 191, 36, 0.2)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#1e293b',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                flexShrink: 0
                              }}>
                                <Trophy size={24} color="#fbbf24" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h5 style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: 'white',
                                  marginBottom: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  <Trophy size={16} color="#fbbf24" />
                                  {achievement.title}
                                </h5>
                                <p style={{
                                  fontSize: '13px',
                                  color: '#d1d5db',
                                  marginBottom: '0'
                                }}>
                                  {achievement.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '20px 0'
                      }}>
                        No achievements yet
                      </p>
                    )}
                  </div>

                  {/* Awards Section */}
                  <div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#60a5fa',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Award size={20} />
                      Awards
                      {selectedUser.awards && selectedUser.awards.length > 0 && (
                        <span style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {selectedUser.awards.length}
                        </span>
                      )}
                    </h4>
                    {selectedUser.awards && selectedUser.awards.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {selectedUser.awards.map((award, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '16px',
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                              borderRadius: '12px',
                              border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#1e293b',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                flexShrink: 0
                              }}>
                                {award.icon === 'trophy' && <Trophy size={24} color="#fbbf24" />}
                                {award.icon === 'crown' && <Award size={24} color="#f59e0b" />}
                                {!award.icon && <Award size={24} color="#60a5fa" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <h5 style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: 'white',
                                  marginBottom: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  {award.icon === 'trophy' && <Trophy size={16} color="#fbbf24" />}
                                  {award.icon === 'crown' && <Award size={16} color="#f59e0b" />}
                                  {award.title?.replace(/🏆|👑|🌟|⚡|[\u{1F3C6}\u{1F451}\u{1F31F}\u{26A1}]/gu, '').trim()}
                                </h5>
                                <p style={{
                                  fontSize: '13px',
                                  color: '#d1d5db',
                                  marginBottom: '8px'
                                }}>
                                  {award.description}
                                </p>
                                {award.project_title && (
                                  <p style={{
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                    fontStyle: 'italic'
                                  }}>
                                    Project: {award.project_title}
                                  </p>
                                )}
                                {award.earned_at && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '8px',
                                    fontSize: '11px',
                                    color: '#6b7280'
                                  }}>
                                    <Calendar size={12} />
                                    Earned on {new Date(award.earned_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '20px 0'
                      }}>
                        No awards yet
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444' }}>
                  Failed to load profile
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineFeed;