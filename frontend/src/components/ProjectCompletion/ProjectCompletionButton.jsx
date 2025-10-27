// frontend/src/components/ProjectCompletion/ProjectCompletionButton.jsx
import React, { useState, useEffect } from 'react';
import collaborativeProjectCompletionService from '../../services/collaborativeProjectCompletionService';

/**
 * ProjectCompletionButton Component
 * Shows completion status, voting interface, and allows owners/leads to mark project complete
 * 
 * Props:
 * - projectId: UUID of the project
 * - currentUserId: UUID of current user
 * - isOwnerOrLead: Boolean indicating if user can mark complete
 * - onProjectCompleted: Callback when project is completed
 */
const ProjectCompletionButton = ({ 
  projectId, 
  currentUserId, 
  isOwnerOrLead = false,
  onProjectCompleted 
}) => {
  const [completionStatus, setCompletionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [votes, setVotes] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch completion status
  const fetchCompletionStatus = async () => {
    try {
      setLoading(true);
      const response = await collaborativeProjectCompletionService.getCompletionStatus(projectId);
      setCompletionStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching completion status:', err);
      setError(err.response?.data?.message || 'Failed to load completion status');
    } finally {
      setLoading(false);
    }
  };

  // Fetch votes
  const fetchVotes = async () => {
    try {
      const response = await collaborativeProjectCompletionService.getCompletionVotes(projectId);
      setVotes(response.data.votes || []);
    } catch (err) {
      console.error('Error fetching votes:', err);
    }
  };

  useEffect(() => {
    fetchCompletionStatus();
  }, [projectId]);

  // Handle mark complete
  const handleMarkComplete = async (skipValidation = false) => {
    try {
      setActionLoading(true);
      setError(null);
      
      const response = await collaborativeProjectCompletionService.markProjectComplete(
        projectId, 
        skipValidation
      );
      
      setSuccessMessage(response.message || 'Project marked as complete!');
      setShowModal(false);
      
      // Refresh status
      await fetchCompletionStatus();
      
      // Notify parent component
      if (onProjectCompleted) {
        onProjectCompleted();
      }

      // Show success for 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error marking complete:', err);
      setError(err.response?.data?.message || 'Failed to mark project complete');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle vote
  const handleVote = async (vote) => {
    try {
      setActionLoading(true);
      setError(null);
      
      const response = await collaborativeProjectCompletionService.voteOnCompletion(
        projectId, 
        vote
      );
      
      setSuccessMessage(
        response.data.auto_completed 
          ? '🎉 Project completed by team vote!' 
          : `Vote recorded: ${vote === 'approve' ? '✅ Approved' : '❌ Rejected'}`
      );
      
      // Refresh data
      await fetchCompletionStatus();
      await fetchVotes();
      
      // Notify parent if auto-completed
      if (response.data.auto_completed && onProjectCompleted) {
        onProjectCompleted();
      }

      // Show success for 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error voting:', err);
      setError(err.response?.data?.message || 'Failed to record vote');
    } finally {
      setActionLoading(false);
    }
  };

  // Show voting modal
  const openVotingModal = async () => {
    setShowVotingModal(true);
    await fetchVotes();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <span style={styles.loadingText}>Loading completion status...</span>
      </div>
    );
  }

  if (!completionStatus) return null;

  // Don't show if already completed
  if (completionStatus.current_status === 'completed') {
    return (
      <div style={styles.completedBadge}>
        <span style={styles.completedIcon}>✅</span>
        <span style={styles.completedText}>Project Completed</span>
      </div>
    );
  }

  const { completion_percentage, is_eligible_for_completion, can_mark_complete, voting } = completionStatus;

  return (
    <div style={styles.container}>
      {/* Success Message */}
      {successMessage && (
        <div style={styles.successMessage}>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Project Completion</span>
          <span style={styles.progressPercentage}>{completion_percentage}%</span>
        </div>
        <div style={styles.progressBarContainer}>
          <div 
            style={{
              ...styles.progressBar,
              width: `${completion_percentage}%`,
              backgroundColor: completion_percentage >= 100 ? '#10b981' : 
                               completion_percentage >= 80 ? '#3b82f6' : '#fbbf24'
            }}
          />
        </div>
        {completion_percentage < 80 && (
          <div style={styles.progressHint}>
            Complete at least 80% of tasks to mark project as complete
          </div>
        )}
      </div>

      {/* Voting Status (if active) */}
      {voting.voting_active && (
        <div style={styles.votingStatus}>
          <div style={styles.votingHeader}>
            <span style={styles.votingIcon}>🗳️</span>
            <span style={styles.votingTitle}>Team Voting Active</span>
          </div>
          <div style={styles.votingStats}>
            <div style={styles.voteStat}>
              <span style={styles.voteCount}>{voting.votes_for}</span>
              <span style={styles.voteLabel}>Approve</span>
            </div>
            <div style={styles.voteStat}>
              <span style={styles.voteCount}>{voting.votes_against}</span>
              <span style={styles.voteLabel}>Reject</span>
            </div>
            <div style={styles.voteStat}>
              <span style={styles.voteCount}>
                {voting.votes_for}/{voting.votes_needed}
              </span>
              <span style={styles.voteLabel}>Needed to Complete</span>
            </div>
          </div>
          {!voting.user_voted && (
            <div style={styles.votePrompt}>
              You haven't voted yet. Cast your vote below!
            </div>
          )}
          {voting.user_voted && (
            <div style={styles.voteStatus}>
              Your vote: <strong>{voting.user_vote === 'approve' ? '✅ Approved' : '❌ Rejected'}</strong>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionsContainer}>
        {/* Mark Complete Button (Owner/Lead only) */}
        {can_mark_complete && (
          <button
            style={styles.completeButton}
            onClick={() => setShowModal(true)}
            disabled={actionLoading}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#059669';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#10b981';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {actionLoading ? (
              <span style={styles.buttonSpinner}>⏳</span>
            ) : (
              <>
                <span style={styles.buttonIcon}>✓</span>
                <span>Mark as Complete</span>
              </>
            )}
          </button>
        )}

        {/* Voting Buttons (All members) */}
        <div style={styles.votingButtons}>
          <button
            style={styles.voteButton}
            onClick={openVotingModal}
            disabled={actionLoading}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }}
          >
            <span style={styles.buttonIcon}>🗳️</span>
            <span>Vote on Completion</span>
          </button>
        </div>
      </div>

      {/* Mark Complete Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Mark Project as Complete?</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.modalInfo}>
                <span style={styles.infoIcon}>📊</span>
                <div>
                  <div style={styles.infoLabel}>Current Progress</div>
                  <div style={styles.infoValue}>{completion_percentage}%</div>
                </div>
              </div>

              {!is_eligible_for_completion && (
                <div style={styles.warningBox}>
                  <span style={styles.warningIcon}>⚠️</span>
                  <div>
                    <div style={styles.warningTitle}>Below 80% Completion</div>
                    <div style={styles.warningText}>
                      The project is currently at {completion_percentage}%. It's recommended 
                      to complete at least 80% of tasks before marking as complete.
                    </div>
                  </div>
                </div>
              )}

              <div style={styles.infoText}>
                Marking this project as complete will:
                <ul style={styles.infoList}>
                  <li>Award achievements to all team members</li>
                  <li>Notify all team members</li>
                  <li>Change project status to "Completed"</li>
                  <li>Lock the project from further editing</li>
                </ul>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              
              {is_eligible_for_completion ? (
                <button
                  style={styles.confirmButton}
                  onClick={() => handleMarkComplete(false)}
                  disabled={actionLoading}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#10b981';
                  }}
                >
                  {actionLoading ? 'Completing...' : 'Mark Complete'}
                </button>
              ) : (
                <button
                  style={styles.forceCompleteButton}
                  onClick={() => handleMarkComplete(true)}
                  disabled={actionLoading}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#c2410c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ea580c';
                  }}
                >
                  {actionLoading ? 'Completing...' : 'Force Complete Anyway'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Voting Modal */}
      {showVotingModal && (
        <div style={styles.modalOverlay} onClick={() => setShowVotingModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Vote on Project Completion</h3>
              <button 
                style={styles.closeButton}
                onClick={() => setShowVotingModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.votingInfo}>
                <p style={styles.votingDescription}>
                  Cast your vote on whether this project should be marked as complete. 
                  The project will automatically complete when {voting.votes_needed} or more 
                  members vote to approve ({Math.round((voting.votes_needed / voting.total_members) * 100)}% consensus).
                </p>
              </div>

              <div style={styles.voteStats}>
                <div style={styles.voteStatBox}>
                  <span style={styles.voteStatNumber}>{voting.votes_for}</span>
                  <span style={styles.voteStatLabel}>Approve Votes</span>
                </div>
                <div style={styles.voteStatBox}>
                  <span style={styles.voteStatNumber}>{voting.votes_against}</span>
                  <span style={styles.voteStatLabel}>Reject Votes</span>
                </div>
                <div style={styles.voteStatBox}>
                  <span style={styles.voteStatNumber}>{voting.total_members}</span>
                  <span style={styles.voteStatLabel}>Total Members</span>
                </div>
              </div>

              {/* Vote List */}
              {votes.length > 0 && (
                <div style={styles.votesList}>
                  <h4 style={styles.votesListTitle}>Votes Cast</h4>
                  {votes.map((vote) => (
                    <div key={vote.id} style={styles.voteItem}>
                      <div style={styles.voteUser}>
                        {vote.users?.avatar_url && (
                          <img 
                            src={vote.users.avatar_url} 
                            alt={vote.users.username}
                            style={styles.voteAvatar}
                          />
                        )}
                        <span style={styles.voteUsername}>
                          {vote.users?.full_name || vote.users?.username}
                          {vote.user_id === currentUserId && ' (You)'}
                        </span>
                      </div>
                      <span style={{
                        ...styles.voteValue,
                        color: vote.vote === 'approve' ? '#10b981' : '#ef4444'
                      }}>
                        {vote.vote === 'approve' ? '✅ Approved' : '❌ Rejected'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {voting.user_voted && (
                <div style={styles.changeVoteNotice}>
                  You've already voted. Click a button below to change your vote.
                </div>
              )}
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.rejectVoteButton}
                onClick={() => handleVote('reject')}
                disabled={actionLoading}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                }}
              >
                {actionLoading ? 'Voting...' : '❌ Reject Completion'}
              </button>
              
              <button
                style={styles.approveVoteButton}
                onClick={() => handleVote('approve')}
                disabled={actionLoading}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                }}
              >
                {actionLoading ? 'Voting...' : '✅ Approve Completion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: '100%',
    marginTop: '24px',
    marginBottom: '24px'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(59, 130, 246, 0.3)',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#d1d5db',
    fontSize: '14px'
  },
  completedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '12px',
    border: '2px solid rgba(16, 185, 129, 0.3)'
  },
  completedIcon: {
    fontSize: '20px'
  },
  completedText: {
    color: '#10b981',
    fontSize: '16px',
    fontWeight: '600'
  },
  successMessage: {
    padding: '12px 16px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorMessage: {
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '16px'
  },
  progressSection: {
    marginBottom: '20px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  progressLabel: {
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500'
  },
  progressPercentage: {
    color: '#3b82f6',
    fontSize: '16px',
    fontWeight: '600'
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
    borderRadius: '4px'
  },
  progressHint: {
    marginTop: '8px',
    color: '#9ca3af',
    fontSize: '12px',
    fontStyle: 'italic'
  },
  votingStatus: {
    padding: '16px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '12px',
    marginBottom: '16px'
  },
  votingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  votingIcon: {
    fontSize: '20px'
  },
  votingTitle: {
    color: '#d1d5db',
    fontSize: '16px',
    fontWeight: '600'
  },
  votingStats: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px'
  },
  voteStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  voteCount: {
    color: '#3b82f6',
    fontSize: '24px',
    fontWeight: '700'
  },
  voteLabel: {
    color: '#9ca3af',
    fontSize: '12px'
  },
  votePrompt: {
    color: '#fbbf24',
    fontSize: '14px',
    fontWeight: '500'
  },
  voteStatus: {
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '500'
  },
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  completeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  votingButtons: {
    display: 'flex',
    gap: '12px'
  },
  voteButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    color: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  buttonIcon: {
    fontSize: '18px'
  },
  buttonSpinner: {
    fontSize: '18px',
    animation: 'spin 1s linear infinite'
  },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#1a1c20',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  modalTitle: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'all 0.2s ease'
  },
  modalContent: {
    padding: '24px'
  },
  modalInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '12px',
    marginBottom: '16px'
  },
  infoIcon: {
    fontSize: '32px'
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: '12px',
    marginBottom: '4px'
  },
  infoValue: {
    color: '#3b82f6',
    fontSize: '24px',
    fontWeight: '700'
  },
  warningBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '12px',
    marginBottom: '16px'
  },
  warningIcon: {
    fontSize: '24px'
  },
  warningTitle: {
    color: '#fbbf24',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '4px'
  },
  warningText: {
    color: '#d1d5db',
    fontSize: '13px',
    lineHeight: '1.5'
  },
  infoText: {
    color: '#d1d5db',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  infoList: {
    marginTop: '8px',
    marginBottom: '0',
    paddingLeft: '20px',
    color: '#9ca3af'
  },
  votingInfo: {
    marginBottom: '20px'
  },
  votingDescription: {
    color: '#d1d5db',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0
  },
  voteStats: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  voteStatBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },
  voteStatNumber: {
    color: '#3b82f6',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  voteStatLabel: {
    color: '#9ca3af',
    fontSize: '12px',
    textAlign: 'center'
  },
  votesList: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px'
  },
  votesListTitle: {
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '12px',
    margin: 0
  },
  voteItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  voteUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  voteAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  voteUsername: {
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500'
  },
  voteValue: {
    fontSize: '14px',
    fontWeight: '600'
  },
  changeVoteNotice: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '8px',
    color: '#3b82f6',
    fontSize: '13px',
    textAlign: 'center'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  cancelButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#d1d5db',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  confirmButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  forceCompleteButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#ea580c',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  rejectVoteButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  approveVoteButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default ProjectCompletionButton;