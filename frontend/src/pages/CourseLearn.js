// frontend/src/pages/CourseLearn.js - Enhanced with proper content rendering
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, PlayCircle, CheckCircle, Lock, BookOpen, 
  Clock, ChevronRight, ChevronDown, Code, FileText, Video
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [allLessons, setAllLessons] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    if (selectedLesson && enrollment) {
      markLessonAsStarted(selectedLesson.id);
    }
  }, [selectedLesson]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCourse(data.course);
        
        // Create flat array of all lessons for navigation
        const lessons = [];
        data.course.course_modules?.forEach(module => {
          module.course_lessons?.forEach(lesson => {
            lessons.push({ ...lesson, moduleId: module.id });
          });
        });
        setAllLessons(lessons);
        
        // Expand first module and select first lesson by default
        if (data.course.course_modules && data.course.course_modules.length > 0) {
          const firstModule = data.course.course_modules[0];
          setExpandedModules({ [firstModule.id]: true });
          
          if (firstModule.course_lessons && firstModule.course_lessons.length > 0) {
            setSelectedLesson({ ...firstModule.course_lessons[0], moduleId: firstModule.id });
          }
        }
      }

      // Fetch enrollment/progress
      const progressResponse = await fetch(`${API_URL}/courses/${courseId}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const progressData = await progressResponse.json();
      
      if (progressData.success) {
        setEnrollment(progressData.enrollment);
        
        // Build lesson progress map
        const progressMap = {};
        progressData.lessons?.forEach(lesson => {
          if (lesson.user_lesson_progress && lesson.user_lesson_progress.length > 0) {
            progressMap[lesson.id] = lesson.user_lesson_progress[0];
          }
        });
        setLessonProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!allLessons.length) return 0;
    const completedCount = allLessons.filter(lesson => 
      lessonProgress[lesson.id]?.status === 'completed'
    ).length;
    return Math.round((completedCount / allLessons.length) * 100);
  };

  const markLessonAsStarted = async (lessonId) => {
    if (lessonProgress[lessonId]?.status === 'completed') return;
    if (lessonProgress[lessonId]?.status === 'in_progress') return;

    try {
      await fetch(`${API_URL}/courses/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'in_progress',
          enrollmentId: enrollment.id
        })
      });

      setLessonProgress(prev => ({
        ...prev,
        [lessonId]: { status: 'in_progress' }
      }));
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const updateEnrollmentProgress = async (updatedProgress) => {
    const completedCount = Object.values(updatedProgress).filter(
      p => p?.status === 'completed'
    ).length;
    const progressPercentage = Math.round((completedCount / allLessons.length) * 100);

    try {
      await fetch(`${API_URL}/courses/${courseId}/enrollment/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          progress_percentage: progressPercentage
        })
      });
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
    }
  };

  const markLessonAsCompleted = async () => {
    if (!selectedLesson) return;

    try {
      const response = await fetch(`${API_URL}/courses/lessons/${selectedLesson.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'completed',
          enrollmentId: enrollment.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const updatedProgress = {
          ...lessonProgress,
          [selectedLesson.id]: { status: 'completed', completed_at: new Date().toISOString() }
        };
        
        setLessonProgress(updatedProgress);
        await updateEnrollmentProgress(updatedProgress);
        navigateToNextLesson();
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  };

  const navigateToNextLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson?.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setSelectedLesson(nextLesson);
      
      setExpandedModules(prev => ({
        ...prev,
        [nextLesson.moduleId]: true
      }));
    }
  };

  const navigateToPreviousLesson = () => {
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson?.id);
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      setSelectedLesson(prevLesson);
      
      setExpandedModules(prev => ({
        ...prev,
        [prevLesson.moduleId]: true
      }));
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const getLessonIcon = (lesson) => {
    const progress = lessonProgress[lesson.id];
    
    if (progress?.status === 'completed') {
      return <CheckCircle size={16} style={{ color: '#10b981' }} />;
    } else if (progress?.status === 'in_progress') {
      return <PlayCircle size={16} style={{ color: '#60a5fa' }} />;
    } else {
      // Icon based on lesson type
      switch(lesson.lesson_type) {
        case 'video':
          return <Video size={16} style={{ color: '#6b7280' }} />;
        case 'coding':
        case 'project':
          return <Code size={16} style={{ color: '#6b7280' }} />;
        default:
          return <FileText size={16} style={{ color: '#6b7280' }} />;
      }
    }
  };

  const isFirstLesson = () => {
    return allLessons.findIndex(l => l.id === selectedLesson?.id) === 0;
  };

  const isLastLesson = () => {
    return allLessons.findIndex(l => l.id === selectedLesson?.id) === allLessons.length - 1;
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Render lesson content based on type
  const renderLessonContent = () => {
    if (!selectedLesson) return null;

    const { lesson_type, video_url, content, code_template } = selectedLesson;

    // VIDEO LESSON
    if (lesson_type === 'video' && video_url) {
      const videoId = getYouTubeVideoId(video_url);
      
      return (
        <>
          {/* YouTube Video Embed */}
          {videoId && (
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden',
              marginBottom: '2rem',
              borderRadius: '12px'
            }}>
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px'
                }}
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedLesson.title}
              />
            </div>
          )}
          
          {/* Video description/notes */}
          {content && (
            <div style={{
              backgroundColor: '#1a1d24',
              borderRadius: '12px',
              padding: '2rem',
              lineHeight: '1.8',
              color: '#e5e7eb'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#fff'
              }}>
                Lesson Notes
              </h3>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {content}
              </div>
            </div>
          )}
        </>
      );
    }

    // CODING/PROJECT LESSON
    if ((lesson_type === 'coding' || lesson_type === 'project') && code_template) {
      return (
        <>
          {/* Instructions */}
          {content && (
            <div style={{
              backgroundColor: '#1a1d24',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              lineHeight: '1.8',
              color: '#e5e7eb'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#fff'
              }}>
                📝 Instructions
              </h3>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {content}
              </div>
            </div>
          )}

          {/* Code Template */}
          <div style={{
            backgroundColor: '#1a1d24',
            borderRadius: '12px',
            padding: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: '#fff'
              }}>
                💻 Code Template
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code_template);
                  alert('Code copied to clipboard!');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2d3748',
                  color: '#60a5fa',
                  border: '1px solid #60a5fa',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Copy Code
              </button>
            </div>
            <pre style={{
              backgroundColor: '#0d1117',
              padding: '1.5rem',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              border: '1px solid #2d3748'
            }}>
              <code style={{ color: '#e5e7eb' }}>
                {code_template}
              </code>
            </pre>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#60a5fa15',
              border: '1px solid #60a5fa',
              borderRadius: '8px',
              color: '#60a5fa',
              fontSize: '0.875rem'
            }}>
              <strong>💡 Tip:</strong> Copy this code to your local editor (VS Code, CodePen, etc.) and complete the TODOs to finish the exercise!
            </div>
          </div>
        </>
      );
    }

    // TEXT LESSON (default)
    return (
      <div style={{
        backgroundColor: '#1a1d24',
        borderRadius: '12px',
        padding: '2rem'
      }}>
        {content ? (
          <div style={{ 
            lineHeight: '1.8', 
            color: '#e5e7eb',
            whiteSpace: 'pre-wrap'
          }}>
            {content.split('\n').map((line, index) => {
              // Basic markdown-like parsing
              if (line.startsWith('# ')) {
                return (
                  <h2 key={index} style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 'bold', 
                    marginTop: '2rem',
                    marginBottom: '1rem',
                    color: '#fff'
                  }}>
                    {line.substring(2)}
                  </h2>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h3 key={index} style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600', 
                    marginTop: '1.5rem',
                    marginBottom: '0.75rem',
                    color: '#fff'
                  }}>
                    {line.substring(3)}
                  </h3>
                );
              }
              if (line.startsWith('```')) {
                // Skip code fence markers
                return null;
              }
              if (line.trim() === '') {
                return <br key={index} />;
              }
              return <p key={index} style={{ marginBottom: '0.5rem' }}>{line}</p>;
            })}
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '1rem' }}>
              Lesson content will be available here. Stay tuned!
            </p>
            <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              Full lesson content coming soon.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F1116',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #2d3748',
          borderTop: '4px solid #60a5fa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F1116',
        padding: '2rem',
        color: '#fff'
      }}>
        <p>Course not found</p>
      </div>
    );
  }

  const currentProgress = calculateProgress();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1a1d24',
        borderBottom: '1px solid #2d3748',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/learns')}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                color: '#9ca3af',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ height: '24px', width: '1px', backgroundColor: '#2d3748' }} />
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#fff',
              margin: 0
            }}>
              {course.title}
            </h1>
          </div>
          <div>
            {enrollment && (
              <p style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                margin: '0.25rem 0 0 0'
              }}>
                Progress: {currentProgress}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - Course Modules */}
        <div style={{
          width: '350px',
          backgroundColor: '#1a1d24',
          borderRight: '1px solid #2d3748',
          overflow: 'auto'
        }}>
          <div style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#fff'
            }}>
              Course Content
            </h3>

            {course.course_modules?.map((module, moduleIndex) => (
              <div key={module.id} style={{ marginBottom: '0.5rem' }}>
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#2d3748',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    marginBottom: '0.5rem'
                  }}
                >
                  <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                    {moduleIndex + 1}. {module.title}
                  </span>
                  {expandedModules[module.id] ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                {/* Lessons List */}
                {expandedModules[module.id] && (
                  <div style={{ paddingLeft: '1rem' }}>
                    {module.course_lessons?.map((lesson, lessonIndex) => {
                      const isSelected = selectedLesson?.id === lesson.id;
                      const progress = lessonProgress[lesson.id];
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson({ ...lesson, moduleId: module.id })}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: isSelected ? '#60a5fa15' : 'transparent',
                            color: isSelected ? '#60a5fa' : '#9ca3af',
                            border: isSelected ? '1px solid #60a5fa' : '1px solid transparent',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textAlign: 'left',
                            marginBottom: '0.25rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          {getLessonIcon(lesson)}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                              {lessonIndex + 1}. {lesson.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.125rem' }}>
                              {lesson.estimated_duration_minutes} min
                            </div>
                          </div>
                          {progress?.status === 'completed' && (
                            <CheckCircle size={14} style={{ color: '#10b981' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Lesson Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '2rem',
          color: '#fff'
        }}>
          {selectedLesson ? (
            <>
              {/* Lesson Header */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#60a5fa20',
                  color: '#60a5fa',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  textTransform: 'capitalize'
                }}>
                  {selectedLesson.lesson_type || 'Text'}
                </div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {selectedLesson.title}
                </h2>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}>
                  {selectedLesson.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color: '#6b7280',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} />
                    {selectedLesson.estimated_duration_minutes} minutes
                  </div>
                  {lessonProgress[selectedLesson.id]?.status === 'completed' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: '#10b981'
                    }}>
                      <CheckCircle size={14} />
                      Completed
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Lesson Content */}
              {renderLessonContent()}

              {/* Lesson Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #2d3748'
              }}>
                <button
                  onClick={navigateToPreviousLesson}
                  disabled={isFirstLesson()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isFirstLesson() ? '#1a1d24' : '#2d3748',
                    color: isFirstLesson() ? '#6b7280' : '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isFirstLesson() ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    opacity: isFirstLesson() ? 0.5 : 1
                  }}
                >
                  ← Previous Lesson
                </button>
                <button
                  onClick={markLessonAsCompleted}
                  disabled={isLastLesson() && lessonProgress[selectedLesson.id]?.status === 'completed'}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#60a5fa',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    opacity: (isLastLesson() && lessonProgress[selectedLesson.id]?.status === 'completed') ? 0.5 : 1
                  }}
                >
                  {isLastLesson() ? 'Complete Course' : 'Mark as Complete & Next →'}
                </button>
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: '#6b7280'
            }}>
              <BookOpen size={64} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '1.125rem' }}>
                Select a lesson from the sidebar to begin learning
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseLearn;