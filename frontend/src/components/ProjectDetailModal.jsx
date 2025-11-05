import React, { useState, useEffect } from 'react';
import { X, Users, Clock, TrendingUp, Code, Target, Calendar, Lock, Sparkles, User } from 'lucide-react';
import api from '../services/api';

const ProjectDetailModal = ({ project, isOpen, onClose, onJoin, isLocked }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(false);

  // Fetch owner information when modal opens
  useEffect(() => {
    const fetchOwnerInfo = async () => {
      // Check multiple possible locations for owner_id
      const ownerId = project?.owner_id || 
                      project?.project?.owner_id || 
                      project?.ownerId;
      
      if (!ownerId && !project?.owner) {
        console.log('No owner_id found in project data');
        return;
      }
      
      // If we already have owner data, use it
      if (project.owner?.username || project.owner?.email) {
        setOwnerInfo(project.owner);
        return;
      }

      // Also check if project has users property (from SQL join)
      if (project.users?.username || project.users?.email) {
        setOwnerInfo(project.users);
        return;
      }

      // Otherwise fetch from API using the correct endpoint
      if (ownerId) {
        setLoadingOwner(true);
        try {
          console.log('Fetching owner info for ID:', ownerId);
          const response = await api.get(`/users/${ownerId}`);
          
          if (response.data.success) {
            setOwnerInfo(response.data.user);
            console.log('✅ Owner info fetched:', response.data.user);
          }
        } catch (error) {
          console.error('Error fetching owner info:', error);
          // Store the owner_id as fallback
          setOwnerInfo({ id: ownerId });
        } finally {
          setLoadingOwner(false);
        }
      }
    };

    if (isOpen) {
      fetchOwnerInfo();
    }
  }, [isOpen, project]);

  // Debug: Log project data to see available fields
  console.log('ProjectDetailModal - Project data:', project);
  console.log('ProjectDetailModal - All project keys:', Object.keys(project));
  console.log('ProjectDetailModal - Owner data:', project?.owner);
  console.log('ProjectDetailModal - Users data:', project?.users);
  console.log('ProjectDetailModal - Owner ID:', project?.owner_id);
  console.log('ProjectDetailModal - Nested project:', project?.project);
  console.log('ProjectDetailModal - Nested owner_id:', project?.project?.owner_id);
  console.log('ProjectDetailModal - Project ID:', project?.projectId || project?.id);
  console.log('ProjectDetailModal - Fetched owner info:', ownerInfo);

  if (!isOpen || !project) return null;

  const handleJoinClick = async () => {
    setIsJoining(true);
    try {
      await onJoin(project);
    } finally {
      setIsJoining(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444',
      beginner: '#10b981',
      intermediate: '#f59e0b',
      advanced: '#ef4444'
    };
    return colors[difficulty?.toLowerCase()] || '#6b7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const mf = project.matchFactors || {};
  const score = project.score || 0;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.titleSection}>
              <h2 style={styles.title}>{project.title}</h2>
              <div style={styles.badges}>
                <span style={{
                  ...styles.badge,
                  backgroundColor: `${getDifficultyColor(project.difficulty_level)}20`,
                  color: getDifficultyColor(project.difficulty_level),
                  border: `1px solid ${getDifficultyColor(project.difficulty_level)}40`
                }}>
                  {project.difficulty_level?.toUpperCase()}
                </span>
                <span style={styles.badge}>
                  {project.status?.toUpperCase()}
                </span>
              </div>
            </div>
            <button style={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          
          {/* Match Score Banner */}
          <div style={styles.matchBanner}>
            <div style={styles.matchScore}>
              <Sparkles size={20} />
              <span style={styles.matchScoreText}>{score}% Match</span>
            </div>
            <div style={styles.matchDetails}>
              {mf.languageFit?.coverage && (
                <span style={styles.matchDetail}>
                  {mf.languageFit.coverage}% Language Fit
                </span>
              )}
              {mf.topicCoverage?.matches?.length > 0 && (
                <span style={styles.matchDetail}>
                  {mf.topicCoverage.matches.length} Topic Matches
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Description Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Target size={18} />
              Project Description
            </h3>
            <p style={styles.description}>{project.description}</p>
          </div>

          {/* Full Description if available */}
          {project.full_description && project.full_description !== project.description && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Target size={18} />
                Detailed Overview
              </h3>
              <div style={styles.fullDescription}>
                {project.full_description.split('\n').map((paragraph, idx) => (
                  <p key={idx} style={styles.paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {/* Project Stats Grid */}
          <div style={styles.statsGrid}>
            {/* Owner card - shows if we have owner data or owner_id */}
            {(ownerInfo || project.owner_id || project.project?.owner_id) && (
              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <User size={20} style={{ color: '#8b5cf6' }} />
                </div>
                <div style={styles.statContent}>
                  <div style={styles.statLabel}>Project Owner</div>
                  <div style={styles.statValue}>
                    {loadingOwner ? (
                      <span style={{ color: '#9ca3af', fontSize: '13px' }}>Loading...</span>
                    ) : ownerInfo?.username ? (
                      ownerInfo.username
                    ) : ownerInfo?.full_name ? (
                      ownerInfo.full_name
                    ) : ownerInfo?.email ? (
                      ownerInfo.email.split('@')[0]
                    ) : project.owner?.username ? (
                      project.owner.username
                    ) : project.owner?.full_name ? (
                      project.owner.full_name
                    ) : project.owner?.email ? (
                      project.owner.email.split('@')[0]
                    ) : project.users?.username ? (
                      project.users.username
                    ) : project.users?.full_name ? (
                      project.users.full_name
                    ) : project.users?.email ? (
                      project.users.email.split('@')[0]
                    ) : ownerInfo?.id ? (
                      `User ${ownerInfo.id.slice(0, 8)}...`
                    ) : (
                      'Owner Info Unavailable'
                    )}
                  </div>
                </div>
              </div>
            )}

            

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <Users size={20} style={{ color: '#10b981' }} />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Team Size</div>
                <div style={styles.statValue}>
                  {project.current_members || 0}/{project.maximum_members}
                </div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <TrendingUp size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statLabel}>Difficulty</div>
                <div style={styles.statValue}>
                  {project.difficulty_level}
                </div>
              </div>
            </div>

            {project.deadline && (
              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <Calendar size={20} style={{ color: '#ef4444' }} />
                </div>
                <div style={styles.statContent}>
                  <div style={styles.statLabel}>Deadline</div>
                  <div style={styles.statValue}>
                    {formatDate(project.deadline)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Technologies Section */}
          {project.project_languages && project.project_languages.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Code size={18} />
                Technologies & Languages
              </h3>
              <div style={styles.techGrid}>
                {project.project_languages.map((lang, index) => (
                  <div key={index} style={styles.techTag}>
                    {lang.programming_languages?.name || lang.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topics Section */}
          {project.project_topics && project.project_topics.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Target size={18} />
                Project Topics
              </h3>
              <div style={styles.techGrid}>
                {project.project_topics.map((topic, index) => (
                  <div key={index} style={styles.topicTag}>
                    {topic.topics?.name || topic.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match Insights */}
          {(mf.suggestions?.length > 0 || mf.languageFit || mf.topicCoverage) && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Sparkles size={18} />
                Why This Project?
              </h3>
              <div style={styles.insightsGrid}>
                {mf.languageFit && (
                  <div style={styles.insightCard}>
                    <div style={styles.insightHeader}>
                      <Code size={16} />
                      <span>Language Match</span>
                    </div>
                    <div style={styles.insightValue}>
                      {mf.languageFit.coverage}% Match
                    </div>
                    {mf.languageFit.matchedLanguages?.length > 0 && (
                      <div style={styles.insightDetail}>
                        Matches: {mf.languageFit.matchedLanguages.join(', ')}
                      </div>
                    )}
                  </div>
                )}
                
                {mf.topicCoverage?.matches && mf.topicCoverage.matches.length > 0 && (
                  <div style={styles.insightCard}>
                    <div style={styles.insightHeader}>
                      <Target size={16} />
                      <span>Topic Alignment</span>
                    </div>
                    <div style={styles.insightValue}>
                      {mf.topicCoverage.matches.length} matching interests
                    </div>
                    <div style={styles.insightDetail}>
                      Your interests: {mf.topicCoverage.matches.slice(0, 3).map(topic => 
                        typeof topic === 'string' ? topic : topic?.name || topic?.topics?.name || 'Unknown'
                      ).join(', ')}
                    </div>
                  </div>
                )}

                {mf.difficultyAlignment && (
                  <div style={styles.insightCard}>
                    <div style={styles.insightHeader}>
                      <TrendingUp size={16} />
                      <span>Skill Level</span>
                    </div>
                    <div style={styles.insightValue}>
                      Good fit for your experience
                    </div>
                    <div style={styles.insightDetail}>
                      Your programming experience: {mf.difficultyAlignment.userExperience || 'Not set'} years
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {mf.suggestions?.length > 0 && (
                <div style={styles.suggestionsBox}>
                  <div style={styles.suggestionsTitle}>
                    💡 To boost your match score:
                  </div>
                  <ul style={styles.suggestionsList}>
                    {mf.suggestions.map((suggestion, idx) => (
                      <li key={idx} style={styles.suggestionItem}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={onClose}>
            Close
          </button>
          <button
            style={{
              ...styles.joinButton,
              ...(isLocked ? styles.joinButtonLocked : {}),
              ...(isJoining ? styles.joinButtonDisabled : {})
            }}
            onClick={handleJoinClick}
            disabled={isLocked || isJoining}
          >
            {isLocked ? (
              <>
                <Lock size={18} />
                Locked - Improve Match Score
              </>
            ) : isJoining ? (
              <>
                <div className="spinner" style={styles.spinner} />
                Joining...
              </>
            ) : (
              <>
                <Users size={18} />
                Join Project
              </>
            )}
          </button>
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
    zIndex: 10000,
    padding: '20px',
    overflowY: 'auto'
  },
  modal: {
    backgroundColor: '#1a1c20',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden'
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  titleSection: {
    flex: 1
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: '1.3'
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#d1d5db',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  matchBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: '10px',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },
  matchScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#3b82f6'
  },
  matchScoreText: {
    fontSize: '18px',
    fontWeight: '700'
  },
  matchDetails: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  matchDetail: {
    fontSize: '13px',
    color: '#9ca3af'
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px'
  },
  description: {
    color: '#d1d5db',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0
  },
  fullDescription: {
    color: '#d1d5db',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  paragraph: {
    marginBottom: '12px',
    margin: '0 0 12px 0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  statIcon: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '8px'
  },
  statContent: {
    flex: 1
  },
  statLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff'
  },
  techGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  techTag: {
    padding: '6px 14px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },
  topicTag: {
    padding: '6px 14px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  insightCard: {
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  insightHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#9ca3af',
    fontSize: '13px',
    marginBottom: '8px'
  },
  insightValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '4px'
  },
  insightDetail: {
    fontSize: '12px',
    color: '#6b7280'
  },
  suggestionsBox: {
    padding: '16px',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(251, 191, 36, 0.3)'
  },
  suggestionsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: '12px'
  },
  suggestionsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#d1d5db'
  },
  suggestionItem: {
    fontSize: '13px',
    marginBottom: '8px',
    lineHeight: '1.5'
  },
  footer: {
    padding: '20px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  joinButton: {
    flex: 2,
    padding: '12px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  joinButtonLocked: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  joinButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};

export default ProjectDetailModal;