// frontend/src/components/EditTopicsModal.js
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Target, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import ProfileUpdateAPI from '../services/profileUpdateAPI';

const EditTopicsModal = ({ isOpen, onClose, userTopics, onUpdate }) => {
  const [allTopics, setAllTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add topic states
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [interestLevel, setInterestLevel] = useState('medium');
  const [experienceLevel, setExperienceLevel] = useState('beginner');

  // Edit topic states
  const [editingTopic, setEditingTopic] = useState(null);
  const [editInterestLevel, setEditInterestLevel] = useState('');
  const [editExperienceLevel, setEditExperienceLevel] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAllTopics();
    }
  }, [isOpen]);

  const fetchAllTopics = async () => {
    try {
      setLoading(true);
      const response = await onboardingService.getTopics();
      if (response.success) {
        setAllTopics(response.data);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    if (!selectedTopic) {
      setError('Please select a topic');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await ProfileUpdateAPI.addTopic(
        parseInt(selectedTopic),
        interestLevel,
        experienceLevel
      );

      if (response.success) {
        setSuccess(response.message);
        onUpdate(); // Refresh parent component
        
        // Reset form
        setSelectedTopic('');
        setInterestLevel('medium');
        setExperienceLevel('beginner');
        setShowAddForm(false);

        setTimeout(() => {
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding topic:', err);
      setError(err.response?.data?.message || 'Failed to add topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to remove this topic from your profile?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await ProfileUpdateAPI.removeTopic(topicId);
      
      if (response.success) {
        setSuccess(response.message);
        onUpdate(); // Refresh parent component

        setTimeout(() => {
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error removing topic:', err);
      setError(err.response?.data?.message || 'Failed to remove topic');
    } finally {
      setLoading(false);
    }
  };

  const startEditTopic = (userTopic) => {
    setEditingTopic(userTopic);
    setEditInterestLevel(userTopic.interest_level);
    setEditExperienceLevel(userTopic.experience_level);
    setError('');
    setSuccess('');
  };

  const cancelEditTopic = () => {
    setEditingTopic(null);
    setEditInterestLevel('');
    setEditExperienceLevel('');
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await ProfileUpdateAPI.updateTopicInterest(
        editingTopic.topic_id || editingTopic.topics?.id,
        editInterestLevel,
        editExperienceLevel
      );

      if (response.success) {
        setSuccess('Topic updated successfully!');
        setEditingTopic(null);
        onUpdate(); // Refresh parent component

        setTimeout(() => {
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating topic:', err);
      setError(err.response?.data?.message || 'Failed to update topic');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTopics = () => {
    const userTopicIds = userTopics.map(ut => {
      return ut.topic_id || ut.topics?.id;
    }).filter(Boolean);
    
    return allTopics.filter(topic => !userTopicIds.includes(topic.id));
  };

  const getInterestLevelColor = (level) => {
    switch (level) {
      case 'high':
        return '#10b981';
      case 'medium':
        return '#fbbf24';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <Target size={24} style={{ color: '#10b981' }} />
            <h2 style={styles.title}>Edit Areas of Interest</h2>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={styles.errorMessage}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={styles.successMessage}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Content */}
        <div style={styles.content}>
          {/* Current Topics */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Your Areas of Interest</h3>
            {userTopics.length === 0 ? (
              <p style={styles.emptyText}>No topics added yet</p>
            ) : (
              <div style={styles.topicsList}>
                {userTopics.map((userTopic) => (
                  <div key={userTopic.id} style={styles.topicItem}>
                    {editingTopic && editingTopic.id === userTopic.id ? (
                      // Edit Form
                      <div style={styles.editForm}>
                        <div style={styles.editFormHeader}>
                          <span style={styles.topicName}>
                            {userTopic.topics?.name || 'Unknown'}
                          </span>
                        </div>
                        
                        <div style={styles.editFormFields}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Interest Level</label>
                            <select
                              style={styles.select}
                              value={editInterestLevel}
                              onChange={(e) => setEditInterestLevel(e.target.value)}
                              disabled={loading}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>

                          <div style={styles.formGroup}>
                            <label style={styles.label}>Experience Level</label>
                            <select
                              style={styles.select}
                              value={editExperienceLevel}
                              onChange={(e) => setEditExperienceLevel(e.target.value)}
                              disabled={loading}
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                        </div>

                        <div style={styles.editFormActions}>
                          <button
                            style={styles.cancelButton}
                            onClick={cancelEditTopic}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                          <button
                            style={styles.submitButton}
                            onClick={handleUpdateTopic}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader size={16} className="spinner" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div style={styles.topicInfo}>
                          <span style={styles.topicName}>
                            {userTopic.topics?.name || 'Unknown'}
                          </span>
                          <div style={styles.topicLevels}>
                            <span 
                              style={{
                                ...styles.topicLevel,
                                borderColor: getInterestLevelColor(userTopic.interest_level),
                                color: getInterestLevelColor(userTopic.interest_level)
                              }}
                            >
                              {userTopic.interest_level}
                            </span>
                            <span style={styles.topicExperience}>
                              {userTopic.experience_level}
                            </span>
                          </div>
                        </div>
                        <div style={styles.topicActions}>
                          <button
                            style={styles.editButton}
                            onClick={() => startEditTopic(userTopic)}
                            disabled={loading}
                            title="Edit topic"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            style={styles.deleteButton}
                            onClick={() => handleRemoveTopic(userTopic.topic_id || userTopic.topics?.id)}
                            disabled={loading}
                            title="Remove topic"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Topic */}
          <div style={styles.section}>
            {!showAddForm ? (
              <button
                style={styles.addButton}
                onClick={() => setShowAddForm(true)}
                disabled={loading || getAvailableTopics().length === 0}
              >
                <Plus size={16} />
                Add Topic
              </button>
            ) : (
              <div style={styles.addForm}>
                <h3 style={styles.sectionTitle}>Add New Topic</h3>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Topic</label>
                  <select
                    style={styles.select}
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select a topic</option>
                    {getAvailableTopics().map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name} {topic.category ? `(${topic.category})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Interest Level</label>
                  <select
                    style={styles.select}
                    value={interestLevel}
                    onChange={(e) => setInterestLevel(e.target.value)}
                    disabled={loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Experience Level</label>
                  <select
                    style={styles.select}
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    disabled={loading}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div style={styles.formActions}>
                  <button
                    style={styles.cancelButton}
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedTopic('');
                      setInterestLevel('medium');
                      setExperienceLevel('beginner');
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    style={styles.submitButton}
                    onClick={handleAddTopic}
                    disabled={loading || !selectedTopic}
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="spinner" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Add Topic
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#0d1117',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  content: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px'
  },
  topicsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  topicItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  topicInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  topicName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff'
  },
  topicLevels: {
    display: 'flex',
    gap: '8px'
  },
  topicLevel: {
    fontSize: '11px',
    fontWeight: '500',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid',
    textTransform: 'uppercase'
  },
  topicExperience: {
    fontSize: '11px',
    color: '#9ca3af',
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'capitalize'
  },
  topicActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  editButton: {
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  editForm: {
    width: '100%'
  },
  editFormHeader: {
    marginBottom: '16px'
  },
  editFormFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  editFormActions: {
    display: 'flex',
    gap: '12px'
  },
  addButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px dashed rgba(16, 185, 129, 0.4)',
    borderRadius: '8px',
    color: '#34d399',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  addForm: {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#d1d5db',
    marginBottom: '6px'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0f1116',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  submitButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  errorMessage: {
    margin: '16px 24px 0',
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  successMessage: {
    margin: '16px 24px 0',
    padding: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic',
    margin: 0
  }
};

export default EditTopicsModal;