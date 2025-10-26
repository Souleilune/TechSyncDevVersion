// frontend/src/components/ChallengeFailureAlert.js
// Updated to display internal course recommendations

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, BookOpen, ChevronRight, Target, Lightbulb, Youtube, 
  Github, Star, TrendingUp, Clock, Save, Check, GraduationCap 
} from 'lucide-react';

const ChallengeFailureAlert = ({ 
  alertData, 
  onClose, 
  onContinue, 
  projectTitle,
  challengeId,
  userId,
  challengeLanguage = 'javascript',
  programmingLanguageId,
  difficultyLevel = 'beginner'
}) => {
  const navigate = useNavigate();
  const effectiveChallengeId = challengeId || alertData?.challengeId;
  const effectiveLanguageId = programmingLanguageId || alertData?.programmingLanguageId;
  const effectiveDifficulty = difficultyLevel || alertData?.difficultyLevel || 'beginner';

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [recommendationIds, setRecommendationIds] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [savedResources, setSavedResources] = useState({});
  const [savingStates, setSavingStates] = useState({});
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (alertData?.shouldShow && effectiveChallengeId && effectiveLanguageId) {
      fetchRecommendations();
    }
  }, [alertData?.shouldShow, effectiveChallengeId, effectiveLanguageId]);

  const fetchRecommendations = async () => {
    if (!effectiveChallengeId || !effectiveLanguageId || !alertData?.attemptCount) {
      console.error('❌ Missing required fields for recommendations');
      setLoadingRecs(false);
      return;
    }

    setLoadingRecs(true);
    setFetchError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_URL}/recommendations/challenge-failure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          challengeId: effectiveChallengeId,
          attemptCount: alertData.attemptCount,
          programmingLanguageId: effectiveLanguageId,
          difficultyLevel: effectiveDifficulty
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error' }));
        setFetchError(errorData.error || 'Failed to load recommendations');
        setRecommendations([]);
        setLoadingRecs(false);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        setRecommendationIds(data.metadata?.recommendationIds || []);
        setMetadata(data.metadata);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setFetchError('Request timed out. Please try again.');
      } else {
        console.error('❌ Error fetching recommendations:', error);
        setFetchError('Failed to load recommendations');
      }
      setRecommendations([]);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSaveResource = async (resource, index) => {
    setSavingStates(prev => ({ ...prev, [index]: 'saving' }));

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/recommendations/save-to-personal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recommendationId: recommendationIds[index],
          resource,
          languageId: effectiveLanguageId,
          difficulty: effectiveDifficulty
        })
      });

      if (response.ok) {
        setSavedResources(prev => ({ ...prev, [index]: true }));
        setSavingStates(prev => ({ ...prev, [index]: 'saved' }));
        setTimeout(() => {
          setSavingStates(prev => ({ ...prev, [index]: null }));
        }, 2000);
      } else {
        setSavingStates(prev => ({ ...prev, [index]: 'error' }));
        setTimeout(() => {
          setSavingStates(prev => ({ ...prev, [index]: null }));
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      setSavingStates(prev => ({ ...prev, [index]: 'error' }));
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [index]: null }));
      }, 2000);
    }
  };

  const handleCourseClick = (courseId) => {
    // Close alert and navigate to course
    onClose();
    navigate(`/courses/${courseId}/learn`);
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'youtube': return <Youtube size={16} />;
      case 'github': return <Github size={16} />;
      case 'freeCodeCamp': return <BookOpen size={16} />;
      case 'internal_course': return <GraduationCap size={16} />;
      default: return <Star size={16} />;
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'youtube': return '#FF0000';
      case 'github': return '#333';
      case 'freeCodeCamp': return '#0a0a23';
      case 'internal_course': return '#60a5fa';
      default: return '#6b7280';
    }
  };

  const renderResource = (resource, index) => {
    const isCourse = resource.provider === 'internal_course';
    const isSaved = savedResources[index];
    const savingState = savingStates[index];

    if (isCourse) {
      // Special rendering for internal courses
      return (
        <div
          key={index}
          onClick={() => handleCourseClick(resource.courseId)}
          style={{
            padding: '1rem',
            backgroundColor: '#1a1d24',
            border: '2px solid #60a5fa',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#93c5fd';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(96, 165, 250, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#60a5fa';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Course Icon */}
            <div style={{
              fontSize: '2.5rem',
              flexShrink: 0
            }}>
              {resource.icon}
            </div>

            <div style={{ flex: 1 }}>
              {/* Course Badge and Save Button Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#60a5fa20',
                  color: '#60a5fa',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  <GraduationCap size={12} />
                  COURSE
                </div>

                {/* Save Button for Courses */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveResource(resource, index);
                  }}
                  disabled={isSaved || savingState === 'saving'}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: isSaved ? '#10b981' : 'transparent',
                    color: isSaved ? '#fff' : '#60a5fa',
                    border: isSaved ? 'none' : '1px solid #60a5fa',
                    borderRadius: '4px',
                    cursor: isSaved ? 'default' : 'pointer',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.2s',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaved) {
                      e.currentTarget.style.backgroundColor = '#60a5fa15';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaved) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {isSaved ? <Check size={12} /> : <Save size={12} />}
                  {savingState === 'saving' ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </button>
              </div>

              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                marginBottom: '0.5rem',
                lineHeight: '1.4'
              }}>
                {resource.title}
              </h4>

              <p style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                marginBottom: '0.75rem',
                lineHeight: '1.5'
              }}>
                {resource.description}
              </p>

              {/* Course metadata */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} />
                  {resource.duration}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <BookOpen size={12} />
                  {resource.lessonCount} lessons
                </div>
                <div style={{
                  backgroundColor: '#10b98120',
                  color: '#10b981',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {resource.difficulty}
                </div>
              </div>
            </div>

            <ChevronRight 
              size={20} 
              style={{ 
                color: '#60a5fa',
                flexShrink: 0,
                marginTop: '0.5rem'
              }} 
            />
          </div>
        </div>
      );
    }

    // Regular resource rendering (YouTube, Dev.to, etc.)
    return (
      <div
        key={index}
        style={{
          padding: '1rem',
          backgroundColor: '#1a1d24',
          border: '1px solid #2d3748',
          borderRadius: '8px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#4b5563';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2d3748';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: getProviderColor(resource.provider),
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {getProviderIcon(resource.provider)}
            {resource.provider.toUpperCase()}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveResource(resource, index);
            }}
            disabled={isSaved || savingState === 'saving'}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: isSaved ? '#10b981' : 'transparent',
              color: isSaved ? '#fff' : '#9ca3af',
              border: isSaved ? 'none' : '1px solid #4b5563',
              borderRadius: '4px',
              cursor: isSaved ? 'default' : 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'all 0.2s'
            }}
          >
            {isSaved ? <Check size={12} /> : <Save size={12} />}
            {savingState === 'saving' ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        <h4 style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#fff',
          marginBottom: '0.5rem'
        }}>
          {resource.title}
        </h4>

        <p style={{
          fontSize: '0.75rem',
          color: '#9ca3af',
          marginBottom: '0.75rem',
          lineHeight: '1.4'
        }}>
          {resource.description || 'Learn more about this topic'}
        </p>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: '#60a5fa',
            fontSize: '0.75rem',
            textDecoration: 'none',
            fontWeight: '500'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          View Resource
          <ChevronRight size={14} />
        </a>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0F1116',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #2d3748',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #2d3748',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <Target size={24} style={{ color: '#f59e0b' }} />
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#fff',
                margin: 0
              }}>
                Let's Get You Back on Track
              </h3>
            </div>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              margin: 0
            }}>
              {alertData?.message || `We've curated resources to help you master ${challengeLanguage}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1d24';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Motivation Section */}
          <div style={{
            backgroundColor: '#1a1d24',
            border: '1px solid #2d3748',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'start'
          }}>
            <Lightbulb size={24} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                marginBottom: '0.5rem'
              }}>
                Keep Going! You're Learning
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#9ca3af',
                lineHeight: '1.6',
                margin: 0
              }}>
                Every failed attempt is progress in disguise. These resources are specifically chosen to help you understand {challengeLanguage} better and overcome this challenge.
              </p>
            </div>
          </div>

          {/* Metadata Stats */}
          {metadata && (
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                flex: 1,
                minWidth: '150px',
                backgroundColor: '#1a1d24',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #2d3748'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  Attempts
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>
                  {metadata.attemptCount}
                </div>
              </div>
              <div style={{
                flex: 1,
                minWidth: '150px',
                backgroundColor: '#1a1d24',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #2d3748'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  Recommended Level
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#60a5fa',
                  textTransform: 'capitalize'
                }}>
                  {metadata.recommendedDifficulty}
                </div>
              </div>
              <div style={{
                flex: 1,
                minWidth: '150px',
                backgroundColor: '#1a1d24',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #2d3748'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                  Resources Found
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                  {metadata.totalResources}
                  {metadata.courseCount > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', marginLeft: '0.5rem' }}>
                      ({metadata.courseCount} courses)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          <div>
            <h4 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <TrendingUp size={20} style={{ color: '#10b981' }} />
              Recommended Learning Resources
            </h4>

            {loadingRecs ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#9ca3af'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #2d3748',
                  borderTop: '3px solid #60a5fa',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }} />
                <p>Finding the best resources for you...</p>
                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </div>
            ) : fetchError ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                backgroundColor: '#7f1d1d20',
                border: '1px solid #7f1d1d',
                borderRadius: '8px',
                color: '#fca5a5'
              }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                  Failed to load recommendations
                </p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  {fetchError}
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                backgroundColor: '#1a1d24',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                color: '#9ca3af'
              }}>
                <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No recommendations available at the moment.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: '1fr'
              }}>
                {recommendations.map((resource, index) => renderResource(resource, index))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #2d3748',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1d24';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Close
            </button>
            <button
              onClick={onContinue}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#60a5fa',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#60a5fa';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeFailureAlert;