// frontend/src/components/EditLanguagesModal.js
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Code, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import ProfileUpdateAPI from '../services/profileUpdateAPI';
import ChallengeAttemptModal from './ChallengeAttemptModal';

const EditLanguagesModal = ({ isOpen, onClose, userLanguages, onUpdate }) => {
  const [allLanguages, setAllLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add language states
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('intermediate');
  const [yearsExperience, setYearsExperience] = useState(0);

  // Challenge modal states
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [pendingLanguageData, setPendingLanguageData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllLanguages();
    }
  }, [isOpen]);

  const fetchAllLanguages = async () => {
    try {
      setLoading(true);
      const response = await onboardingService.getProgrammingLanguages();
      if (response.success) {
        setAllLanguages(response.data);
      }
    } catch (err) {
      console.error('Error fetching languages:', err);
      setError('Failed to load programming languages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = async () => {
    if (!selectedLanguage) {
      setError('Please select a programming language');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Request a challenge for this language
      const response = await ProfileUpdateAPI.requestAddLanguage(
        parseInt(selectedLanguage),
        proficiencyLevel
      );

      if (response.success) {
        // Store the pending data and show challenge modal
        setPendingLanguageData({
          language_id: parseInt(selectedLanguage),
          proficiency_level: proficiencyLevel,
          years_experience: yearsExperience
        });
        setCurrentChallenge(response.data.challenge);
        setShowChallengeModal(true);
        setShowAddForm(false);
      }
    } catch (err) {
      console.error('Error requesting language challenge:', err);
      setError(err.response?.data?.message || 'Failed to load challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeComplete = async (attemptId, status) => {
    if (status === 'passed' && pendingLanguageData) {
      try {
        setLoading(true);
        setError('');

        // Verify and add the language
        const response = await ProfileUpdateAPI.verifyAndAddLanguage(
          pendingLanguageData.language_id,
          pendingLanguageData.proficiency_level,
          currentChallenge.id,
          attemptId,
          pendingLanguageData.years_experience
        );

        if (response.success) {
          setSuccess(response.message);
          setPendingLanguageData(null);
          setCurrentChallenge(null);
          onUpdate(); // Refresh parent component
          
          // Reset form
          setSelectedLanguage('');
          setProficiencyLevel('intermediate');
          setYearsExperience(0);

          setTimeout(() => {
            setSuccess('');
          }, 3000);
        }
      } catch (err) {
        console.error('Error adding language after challenge:', err);
        setError(err.response?.data?.message || 'Failed to add language. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (status === 'failed') {
      setError('Challenge failed. Please try again or select a different proficiency level.');
      setPendingLanguageData(null);
      setCurrentChallenge(null);
    }
  };

  const handleRemoveLanguage = async (languageId) => {
    if (!window.confirm('Are you sure you want to remove this programming language from your profile?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await ProfileUpdateAPI.removeLanguage(languageId);
      
      if (response.success) {
        setSuccess(response.message);
        onUpdate(); // Refresh parent component

        setTimeout(() => {
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error removing language:', err);
      setError(err.response?.data?.message || 'Failed to remove language');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableLanguages = () => {
    const userLanguageIds = userLanguages.map(ul => ul.programming_languages?.id || ul.language_id);
    return allLanguages.filter(lang => !userLanguageIds.includes(lang.id));
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <Code size={24} style={{ color: '#3b82f6' }} />
              <h2 style={styles.title}>Edit Programming Languages</h2>
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
            {/* Current Languages */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Your Programming Languages</h3>
              {userLanguages.length === 0 ? (
                <p style={styles.emptyText}>No programming languages added yet</p>
              ) : (
                <div style={styles.languagesList}>
                  {userLanguages.map((userLang) => (
                    <div key={userLang.id} style={styles.languageItem}>
                      <div style={styles.languageInfo}>
                        <span style={styles.languageName}>
                          {userLang.programming_languages?.name || 'Unknown'}
                        </span>
                        <span style={styles.languageLevel}>
                          {userLang.proficiency_level}
                        </span>
                      </div>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleRemoveLanguage(userLang.language_id)}
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Language */}
            <div style={styles.section}>
              {!showAddForm ? (
                <button
                  style={styles.addButton}
                  onClick={() => setShowAddForm(true)}
                  disabled={loading || getAvailableLanguages().length === 0}
                >
                  <Plus size={16} />
                  Add Programming Language
                </button>
              ) : (
                <div style={styles.addForm}>
                  <h3 style={styles.sectionTitle}>Add New Language</h3>
                  <p style={styles.challengeInfo}>
                    <AlertCircle size={14} />
                    You'll need to complete a coding challenge to verify your proficiency
                  </p>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Programming Language</label>
                    <select
                      style={styles.select}
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select a language</option>
                      {getAvailableLanguages().map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Proficiency Level</label>
                    <select
                      style={styles.select}
                      value={proficiencyLevel}
                      onChange={(e) => setProficiencyLevel(e.target.value)}
                      disabled={loading}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Years of Experience</label>
                    <input
                      type="number"
                      style={styles.input}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div style={styles.formActions}>
                    <button
                      style={styles.cancelButton}
                      onClick={() => {
                        setShowAddForm(false);
                        setSelectedLanguage('');
                        setProficiencyLevel('intermediate');
                        setYearsExperience(0);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.submitButton}
                      onClick={handleAddLanguage}
                      disabled={loading || !selectedLanguage}
                    >
                      {loading ? (
                        <>
                          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          Loading Challenge...
                        </>
                      ) : (
                        <>
                          <Code size={16} />
                          Get Challenge
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

      {/* Challenge Modal */}
      {showChallengeModal && currentChallenge && (
        <ChallengeAttemptModal
          isOpen={showChallengeModal}
          onClose={() => {
            setShowChallengeModal(false);
            setCurrentChallenge(null);
            setPendingLanguageData(null);
          }}
          challenge={currentChallenge}
          onComplete={handleChallengeComplete}
        />
      )}
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#1a1d29',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
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
  languagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  languageItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  languageInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  languageName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff'
  },
  languageLevel: {
    fontSize: '12px',
    color: '#60a5fa',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  deleteButton: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  addButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    border: '1px dashed rgba(59, 130, 246, 0.4)',
    borderRadius: '8px',
    color: '#60a5fa',
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
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  challengeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#fbbf24',
    marginBottom: '16px',
    padding: '8px 12px',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: '6px',
    border: '1px solid rgba(251, 191, 36, 0.2)'
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
  input: {
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
    backgroundColor: '#3b82f6',
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

export default EditLanguagesModal;