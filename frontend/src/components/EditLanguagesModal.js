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

  // Edit language states
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [editProficiencyLevel, setEditProficiencyLevel] = useState('');
  const [editYearsExperience, setEditYearsExperience] = useState(0);

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

    console.log('🔍 Adding language:', {
      selectedLanguage,
      proficiencyLevel,
      yearsExperience
    });

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Request a challenge for this language
      const response = await ProfileUpdateAPI.requestAddLanguage(
        parseInt(selectedLanguage),
        proficiencyLevel
      );

      console.log('✅ Challenge response:', response);

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
      console.error('❌ Error requesting language challenge:', err);
      console.error('Error details:', err.response?.data);
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
    console.log('handleRemoveLanguage called with:', languageId);
    
    if (!languageId) {
      setError('Invalid language ID');
      console.error('Language ID is undefined or null');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this programming language from your profile?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('Calling removeLanguage API with ID:', languageId);
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

  const startEditLanguage = (userLang) => {
    setEditingLanguage(userLang);
    setEditProficiencyLevel(userLang.proficiency_level);
    setEditYearsExperience(userLang.years_experience || 0);
    setError('');
    setSuccess('');
  };

  const cancelEditLanguage = () => {
    setEditingLanguage(null);
    setEditProficiencyLevel('');
    setEditYearsExperience(0);
  };

  const handleUpdateLanguage = async () => {
    if (!editingLanguage) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await ProfileUpdateAPI.updateLanguageProficiency(
        editingLanguage.language_id || editingLanguage.programming_languages?.id,
        editProficiencyLevel,
        editYearsExperience
      );

      if (response.success) {
        setSuccess('Language updated successfully!');
        setEditingLanguage(null);
        onUpdate(); // Refresh parent component

        setTimeout(() => {
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Error updating language:', err);
      setError(err.response?.data?.message || 'Failed to update language');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableLanguages = () => {
    // Get the language IDs that the user already has
    const userLanguageIds = userLanguages.map(ul => {
      // The language_id field contains the reference to programming_languages table
      return ul.language_id || ul.programming_languages?.id;
    }).filter(Boolean); // Remove any undefined values
    
    // Filter out languages that the user already has
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
                      {editingLanguage && editingLanguage.id === userLang.id ? (
                        // Edit Form
                        <div style={styles.editForm}>
                          <div style={styles.editFormHeader}>
                            <span style={styles.languageName}>
                              {userLang.programming_languages?.name || 'Unknown'}
                            </span>
                          </div>
                          
                          <div style={styles.editFormFields}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Proficiency Level</label>
                              <select
                                style={styles.select}
                                value={editProficiencyLevel}
                                onChange={(e) => setEditProficiencyLevel(e.target.value)}
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
                                value={editYearsExperience}
                                onChange={(e) => setEditYearsExperience(Math.max(0, parseInt(e.target.value) || 0))}
                                min="0"
                                disabled={loading}
                              />
                            </div>
                          </div>

                          <div style={styles.editFormActions}>
                            <button
                              style={styles.cancelButton}
                              onClick={cancelEditLanguage}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                            <button
                              style={styles.submitButton}
                              onClick={handleUpdateLanguage}
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
                          <div style={styles.languageInfo}>
                            <span style={styles.languageName}>
                              {userLang.programming_languages?.name || 'Unknown'}
                            </span>
                            <span style={styles.languageLevel}>
                              {userLang.proficiency_level}
                            </span>
                          </div>
                          <div style={styles.languageActions}>
                            <button
                              style={styles.editButton}
                              onClick={() => startEditLanguage(userLang)}
                              disabled={loading}
                              title="Edit language"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              style={styles.deleteButton}
                              onClick={() => handleRemoveLanguage(userLang.language_id || userLang.programming_languages?.id)}
                              disabled={loading}
                              title="Remove language"
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
                          <Loader size={16} className="spinner" />
                          Loading Challenge...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Start Challenge
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
          challenge={currentChallenge}
          onClose={() => {
            setShowChallengeModal(false);
            setCurrentChallenge(null);
            setPendingLanguageData(null);
            setShowAddForm(true); // Show the add form again when closing challenge modal
          }}
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
  languageActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  editButton: {
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    color: '#60a5fa',
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '16px'
  },
  challengeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '16px',
    padding: '10px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '6px',
    border: '1px solid rgba(59, 130, 246, 0.2)'
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