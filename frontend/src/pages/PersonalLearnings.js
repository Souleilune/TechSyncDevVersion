// frontend/src/pages/PersonalLearnings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Youtube, Github, ExternalLink, Trash2, Clock, Star, GraduationCap } from 'lucide-react';

const PersonalLearnings = ({ userId }) => {
  const navigate = useNavigate();
  const [learnings, setLearnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState(new Map());

  useEffect(() => {
    if (userId) {
      fetchLearnings();
      fetchEnrollments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchEnrollments = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/courses/my-courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success && data.enrollments) {
        // Create a Map with course_id as key and enrollment data as value
        const enrollmentMap = new Map(
          data.enrollments.map(enrollment => [
            enrollment.course_id,
            {
              id: enrollment.id,
              progress: enrollment.progress_percentage || 0,
              lastAccessed: enrollment.last_accessed_at
            }
          ])
        );
        setEnrollments(enrollmentMap);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  };

  const fetchLearnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/recommendations/personal-learnings/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setLearnings(data.learnings || []);
      } else {
        setError(data.error || 'Failed to load saved resources');
      }
    } catch (err) {
      console.error('Error fetching learnings:', err);
      setError('Failed to load saved resources');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (activityId) => {
    if (!window.confirm('Are you sure you want to remove this resource?'))
      return;

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/recommendations/personal-learnings/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setLearnings(learnings.filter(l => l.id !== activityId));
      }
    } catch (err) {
      console.error('Error removing learning:', err);
      alert('Failed to remove resource');
    }
  };

  const isInternalCourse = (resource) => {
    return resource?.provider?.toLowerCase() === 'internal_course';
  };

  const getCourseId = (resource) => {
    console.log('🔍 Getting course ID from resource:', resource);
    
    // Extract course ID from URL like "/course/abc-123/learn" or "/courses/abc-123/learn"
    if (resource?.url && isInternalCourse(resource)) {
      const match = resource.url.match(/\/courses?\/([^/]+)/);
      const courseId = match ? match[1] : null;
      console.log('📍 Extracted course ID from URL:', courseId);
      return courseId;
    }
    
    const courseId = resource?.courseId || null;
    console.log('📍 Course ID from resource.courseId:', courseId);
    return courseId;
  };

  const isEnrolled = (resource) => {
    const courseId = getCourseId(resource);
    return courseId && enrollments.has(courseId);
  };

  const getEnrollmentData = (resource) => {
    const courseId = getCourseId(resource);
    return courseId ? enrollments.get(courseId) : null;
  };

  const getButtonText = (resource) => {
    if (isInternalCourse(resource)) {
      return isEnrolled(resource) ? 'Go to Course' : 'Start Course';
    }
    return 'View Resource';
  };

  const handleCourseClick = async (resource) => {
    const courseId = getCourseId(resource);
    console.log('🎯 handleCourseClick - Course ID:', courseId);
    console.log('🎯 handleCourseClick - Resource:', resource);
    
    if (courseId && isInternalCourse(resource)) {
      const enrolled = isEnrolled(resource);
      console.log('📚 Is enrolled:', enrolled);
      
      // If not enrolled, enroll first
      if (!enrolled) {
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          console.log('📝 Enrolling in course:', courseId);
          const response = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          
          if (data.success) {
            console.log('✅ Successfully enrolled');
            // Update enrollments
            const enrollmentMap = new Map(enrollments);
            enrollmentMap.set(courseId, {
              id: data.enrollment?.id,
              progress: 0,
              lastAccessed: new Date()
            });
            setEnrollments(enrollmentMap);
          } else {
            console.error('❌ Enrollment failed:', data);
          }
        } catch (err) {
          console.error('❌ Error enrolling in course:', err);
          alert('Failed to enroll in course');
          return;
        }
      }
      
      // Navigate to course learn page using React Router
      const targetPath = `/course/${courseId}/learn`;
      console.log('🚀 Navigating to:', targetPath);
      navigate(targetPath);
    } else if (resource?.url) {
      // Open external resource in new tab
      console.log('🔗 Opening external URL:', resource.url);
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else {
      console.error('❌ No course ID or URL found');
    }
  };

  const getProviderIcon = (provider) => {
    switch(provider?.toLowerCase()) {
      case 'youtube': return <Youtube size={16} />;
      case 'github': return <Github size={16} />;
      case 'internal_course': return <GraduationCap size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const getProviderColor = (provider) => {
    const colors = {
      'youtube': '#ff0000',
      'github': '#333',
      'dev.to': '#0a0a23',
      'freecodecamp': '#0a0a23',
      'internal_course': '#3b82f6'
    };
    return colors[provider?.toLowerCase()] || '#3b82f6';
  };

  const getProviderBadgeStyle = (provider) => {
    if (provider?.toLowerCase() === 'internal_course') {
      return {
        backgroundColor: '#3b82f615',
        color: '#3b82f6',
        border: '1px solid #3b82f6'
      };
    }
    return {
      backgroundColor: `${getProviderColor(provider)}15`,
      color: getProviderColor(provider)
    };
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading your saved resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={fetchLearnings} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Personal Learnings</h1>
          <p style={styles.subtitle}>
            Resources you've saved to help improve your skills
          </p>
        </div>
        <div style={styles.statsContainer}>
          <div style={styles.statBox}>
            <BookOpen size={24} color="#3b82f6" />
            <div>
              <div style={styles.statNumber}>{learnings.length}</div>
              <div style={styles.statLabel}>Saved Resources</div>
            </div>
          </div>
        </div>
      </div>

      {learnings.length === 0 ? (
        <div style={styles.emptyState}>
          <BookOpen size={64} color="#6b7280" />
          <h2 style={styles.emptyTitle}>No saved resources yet</h2>
          <p style={styles.emptyText}>
            When you encounter challenge failures, you can save recommended resources to revisit later.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {learnings.map((learning) => {
            const resource = learning.resource || {};
            const provider = resource.provider || 'unknown';
            const isCourse = isInternalCourse(resource);
            const enrolled = isEnrolled(resource);
            const enrollmentData = getEnrollmentData(resource);
            const progress = enrollmentData?.progress || 0;
            
            return (
            <div
              key={learning.id}
              style={{
                ...styles.card,
                ...(isCourse ? styles.courseCard : {}),
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '380px', // keeps cards uniform
              }}
            >
              {/* ---- CARD CONTENT ---- */}
              <div style={{ flexGrow: 1 }}>
                <div
                  style={{
                    ...styles.providerBadge,
                    ...getProviderBadgeStyle(provider),
                  }}
                >
                  {getProviderIcon(provider)}
                  <span style={{ textTransform: 'uppercase' }}>
                    {isCourse ? 'COURSE' : provider}
                  </span>
                </div>

                {learning.difficulty && (
                  <div style={styles.difficultyBadge}>{learning.difficulty}</div>
                )}

                {isCourse && resource.icon && (
                  <div style={styles.courseIcon}>{resource.icon}</div>
                )}

                <h3 style={styles.resourceTitle}>
                  {resource.title || 'Untitled Resource'}
                </h3>

                {resource.description && (
                  <p style={styles.resourceDescription}>
                    {resource.description.length > 150
                      ? resource.description.substring(0, 150) + '...'
                      : resource.description}
                  </p>
                )}

                {isCourse && (
                  <div style={styles.courseMeta}>
                    {resource.duration && (
                      <span style={styles.metaItem}>
                        <Clock size={14} />
                        {resource.duration}
                      </span>
                    )}
                    {resource.lessonCount && (
                      <span style={styles.metaItem}>
                        <BookOpen size={14} />
                        {resource.lessonCount} lessons
                      </span>
                    )}
                  </div>
                )}

                {!isCourse && (
                  <div style={styles.resourceMeta}>
                    {resource.author && (
                      <span style={styles.metaItem}>By {resource.author}</span>
                    )}
                    {resource.readTime && (
                      <span style={styles.metaItem}>
                        <Clock size={14} />
                        {resource.readTime} min
                      </span>
                    )}
                    {resource.reactions && (
                      <span style={styles.metaItem}>
                        <Star size={14} />
                        {resource.reactions}
                      </span>
                    )}
                  </div>
                )}

                {isCourse && enrolled && (
                  <div style={styles.progressContainer}>
                    <div style={styles.progressHeader}>
                      <span style={styles.progressLabel}>Progress</span>
                      <span style={styles.progressPercent}>{Math.round(progress)}%</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ---- FOOTER (DATE + BUTTONS) ---- */}
              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingTop: '12px',
                }}
              >
                {/* Saved date in consistent format */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    textAlign: 'left',
                  }}
                >
                  Saved{' '}
                  {new Date(learning.savedAt).toLocaleDateString('en-US', {
                    month: 'numeric',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isCourse ? (
                    <button
                      onClick={() => handleCourseClick(resource)}
                      style={{
                        ...styles.viewButton,
                        ...(enrolled ? styles.enrolledButton : {}),
                        flex: 1,
                      }}
                    >
                      {enrolled ? (
                        <GraduationCap size={16} />
                      ) : (
                        <ExternalLink size={16} />
                      )}
                      {getButtonText(resource)}
                    </button>
                  ) : (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...styles.viewButton, flex: 1 }}
                    >
                      <ExternalLink size={16} />
                      View Resource
                    </a>
                  )}

                  <button
                    onClick={() => handleRemove(learning.id)}
                    style={styles.removeButton}
                    title="Remove from saved resources"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#9ca3af',
    margin: 0
  },
  statsContainer: {
    display: 'flex',
    gap: '1rem'
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#1a1d24',
    borderRadius: '12px',
    border: '1px solid #2d3748'
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#9ca3af'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #2d3748',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '1rem',
    color: '#9ca3af'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#1a1d24',
    borderRadius: '12px',
    border: '1px solid #dc2626'
  },
  errorText: {
    color: '#dc2626',
    marginBottom: '1rem'
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#1a1d24',
    borderRadius: '12px',
    border: '1px solid #2d3748'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    color: 'white',
    margin: '1rem 0'
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: '1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    backgroundColor: '#1a1d24',
    borderRadius: '12px',
    border: '1px solid #2d3748',
    padding: '1.5rem',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '420px'
  },
  courseCard: {
    backgroundColor: '#1a1d24'
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  cardFooter: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '360px',
  },
  providerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  difficultyBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#3b82f615',
    color: '#3b82f6',
    textTransform: 'capitalize',
    marginLeft: '0.5rem',
    marginBottom: '1rem'
  },
  courseIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  resourceTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'white',
    margin: '0 0 0.75rem 0',
    lineHeight: '1.4'
  },
  resourceDescription: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    lineHeight: '1.5',
    marginBottom: '1rem'
  },
  courseMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #334155'
  },
  resourceMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #334155'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  savedInfo: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginBottom: '1rem'
  },
  progressContainer: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#0F1116',
    borderRadius: '8px',
    border: '1px solid #2d3748'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  progressLabel: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    fontWeight: '500'
  },
  progressPercent: {
    fontSize: '0.875rem',
    color: '#60a5fa',
    fontWeight: '600'
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: '#1a1d24',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  cardActions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  viewButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  continueButton: {
    backgroundColor: '#10b981'
  },
  startButton: {
    backgroundColor: '#3b82f6',
    width: '100%'
  },
  removeButton: {
    padding: '0.75rem',
    backgroundColor: '#dc262615',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default PersonalLearnings;