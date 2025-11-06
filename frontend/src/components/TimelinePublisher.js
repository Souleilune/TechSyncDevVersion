// frontend/src/components/TimelinePublisher.js
import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Github, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Users,
  Lock
} from 'lucide-react';
import TimelinePublishingService from '../services/timelinePublishingService';

const TimelinePublisher = ({ projectId, projectTitle, projectDescription }) => {
  const [isPublished, setIsPublished] = useState(false);
  const [timelinePost, setTimelinePost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('publish'); // 'publish' or 'edit'
  
  // Form state
  const [formData, setFormData] = useState({
    githubUrl: '',
    liveDemoUrl: '',
    visibility: 'public',
    customMessage: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch timeline status on mount
  useEffect(() => {
    fetchTimelineStatus();
  }, [projectId]);

  const fetchTimelineStatus = async () => {
    try {
      setLoading(true);
      const response = await TimelinePublishingService.getTimelineStatus(projectId);
      
      setIsPublished(response.data.isPublished);
      setTimelinePost(response.data.timelinePost);
      
      // Pre-fill form if already published
      if (response.data.timelinePost) {
        setFormData({
          githubUrl: response.data.timelinePost.github_url || '',
          liveDemoUrl: response.data.timelinePost.live_demo_url || '',
          visibility: response.data.timelinePost.visibility || 'public',
          customMessage: response.data.timelinePost.custom_message || ''
        });
      }
    } catch (err) {
      console.error('Error fetching timeline status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      await TimelinePublishingService.publishToTimeline(projectId, formData);
      
      setSuccess(' Published to timeline successfully!');
      setShowModal(false);
      await fetchTimelineStatus();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish to timeline');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      await TimelinePublishingService.updateTimelinePost(projectId, formData);
      
      setSuccess('✨ Timeline post updated successfully!');
      setShowModal(false);
      await fetchTimelineStatus();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update timeline post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to unpublish this project from your timeline?')) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      await TimelinePublishingService.deleteTimelinePost(projectId);
      
      setSuccess('Timeline post removed successfully');
      await fetchTimelineStatus();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete timeline post');
    } finally {
      setSubmitting(false);
    }
  };

  const openPublishModal = () => {
    setModalMode('publish');
    setShowModal(true);
  };

  const openEditModal = () => {
    setModalMode('edit');
    setShowModal(true);
  };

  const getVisibilityIcon = (visibility) => {
    switch(visibility) {
      case 'public': return <Eye size={16} />;
      case 'friends': return <Users size={16} />;
      case 'private': return <Lock size={16} />;
      default: return <Eye size={16} />;
    }
  };

  const styles = {
    container: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      border: '1px solid #334155'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white'
    },
    badge: {
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    publishedBadge: {
      backgroundColor: '#10b98120',
      color: '#10b981'
    },
    unpublishedBadge: {
      backgroundColor: '#64748b20',
      color: '#94a3b8'
    },
    description: {
      color: '#94a3b8',
      fontSize: '14px',
      marginBottom: '16px',
      lineHeight: '1.5'
    },
    buttonGroup: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#334155',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#ef444420',
      color: '#ef4444'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: '#1e293b',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid #334155'
    },
    modalHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      color: '#cbd5e1',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      outline: 'none'
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer'
    },
    alert: {
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    errorAlert: {
      backgroundColor: '#ef444420',
      color: '#ef4444',
      border: '1px solid #ef4444'
    },
    successAlert: {
      backgroundColor: '#10b98120',
      color: '#10b981',
      border: '1px solid #10b981'
    },
    hint: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px'
    },
    visibilityOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      color: '#cbd5e1'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <Loader size={16} className="animate-spin" />
          Loading timeline status...
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>
            <Share2 size={20} style={{ color: '#3b82f6' }} />
            Timeline Publishing
          </div>
          <div style={{
            ...styles.badge,
            ...(isPublished ? styles.publishedBadge : styles.unpublishedBadge)
          }}>
            {isPublished ? (
              <>
                <CheckCircle size={14} />
                Published
              </>
            ) : (
              <>
                <AlertCircle size={14} />
                Not Published
              </>
            )}
          </div>
        </div>

        <p style={styles.description}>
          {isPublished 
            ? 'Your project is visible on your timeline. Others can see and react to it!'
            : 'Share your completed project with the community on your timeline.'
          }
        </p>

        {success && (
          <div style={{ ...styles.alert, ...styles.successAlert }}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {error && (
          <div style={{ ...styles.alert, ...styles.errorAlert }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div style={styles.buttonGroup}>
          {!isPublished ? (
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={openPublishModal}
              disabled={submitting}
            >
              {submitting ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Share2 size={16} />
              )}
              Publish to Timeline
            </button>
          ) : (
            <>
              <button
                style={{ ...styles.button, ...styles.secondaryButton }}
                onClick={openEditModal}
                disabled={submitting}
              >
                <Edit2 size={16} />
                Edit Post
              </button>
              {timelinePost?.github_url && (
                <a
                  href={timelinePost.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.button, ...styles.secondaryButton, textDecoration: 'none' }}
                >
                  <Github size={16} />
                  View Repo
                </a>
              )}
              {timelinePost?.live_demo_url && (
                <a
                  href={timelinePost.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.button, ...styles.secondaryButton, textDecoration: 'none' }}
                >
                  <ExternalLink size={16} />
                  Live Demo
                </a>
              )}
              <button
                style={{ ...styles.button, ...styles.dangerButton }}
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Unpublish
              </button>
            </>
          )}
        </div>
      </div>

      {/* Publish/Edit Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              {modalMode === 'publish' ? (
                <>
                  <Share2 size={20} style={{ color: '#3b82f6' }} />
                  Publish to Timeline
                </>
              ) : (
                <>
                  <Edit2 size={20} style={{ color: '#3b82f6' }} />
                  Edit Timeline Post
                </>
              )}
            </div>

            {error && (
              <div style={{ ...styles.alert, ...styles.errorAlert }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              modalMode === 'publish' ? handlePublish() : handleUpdate();
            }}>
              
              

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Visibility
                </label>
                <select
                  style={styles.select}
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                >
                  <option value="public">🌍 Public - Everyone can see</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="private">🔒 Private - Only you</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Custom Message (Optional)
                </label>
                <textarea
                  style={styles.textarea}
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                  placeholder="Share your thoughts about this project..."
                  maxLength={500}
                />
                <p style={styles.hint}>
                  {formData.customMessage.length}/500 characters
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  style={{ ...styles.button, ...styles.secondaryButton }}
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...styles.button, ...styles.primaryButton }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      {modalMode === 'publish' ? 'Publishing...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      {modalMode === 'publish' ? (
                        <>
                          <Share2 size={16} />
                          Publish
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Update
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TimelinePublisher;