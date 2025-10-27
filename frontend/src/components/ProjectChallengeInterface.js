// frontend/src/components/ProjectChallengeInterface.js - COMPLETE THEMED VERSION
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChallengeFailureAlert from './ChallengeFailureAlert';
import TestResultsPanel from './TestResultsPanel';
import ChallengeHints from './ChallengeHints';

const ProjectChallengeInterface = ({ projectId, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [submittedCode, setSubmittedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canAttempt, setCanAttempt] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [codeValidation, setCodeValidation] = useState(null);

  // Alert system state (for failure comfort messages)
  const [alertData, setAlertData] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Use ref to avoid stale closure issues
  const handleSubmitRef = useRef();

  // API Configuration - use proxy for development
  const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL || ''
    : '';

  // Helper function to get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }, []);

  // Helper function to handle API responses
  const handleApiResponse = useCallback(async (response, actionName) => {
  console.log(`${actionName} response status:`, response.status);
  console.log(`${actionName} response headers:`, [...response.headers.entries()]);

  const contentType = response.headers.get('content-type');
  console.log(`${actionName} Content-Type:`, contentType);

  if (!contentType || !contentType.includes('application/json')) {
    // Inline preview; no unused variable
    const preview = (await response.text()).slice(0, 500);
    console.error(`${actionName} - Expected JSON, got: ${preview}`);
    throw new Error(`Server returned HTML instead of JSON. Check if backend is running on port 5000.`);
  }

  const data = await response.json();

  if (!response.ok) {
    console.error(`${actionName} error:`, data);
    throw new Error(data.message || `${actionName} failed`);
  }

  return data;
}, []);

  // Real-time code validation
  const validateCodeRealTime = useCallback((code) => {
    const validation = {
      length: code.trim().length,
      hasFunction: /function\s+\w+|def\s+\w+|=>\s*{?|public\s+\w+\s+\w+\s*\(/i.test(code),
      hasLogic: /if\s*\(|for\s*\(|while\s*\(|switch\s*\(/i.test(code),
      hasReturn: /return\s+\w/i.test(code),
      hasComments: /\/\/[^\n]+|\/\*[\s\S]*?\*\/|#[^\n]+/i.test(code),
      isPlaceholder: /todo|placeholder|your code here|implement/i.test(code),
      estimatedScore: 0
    };

    let score = 0;
    if (validation.length > 20) score += 10;
    if (validation.hasFunction) score += 25;
    if (validation.hasLogic) score += 20;
    if (validation.hasReturn) score += 15;
    if (validation.hasComments) score += 10;
    if (validation.length > 100) score += 10;
    if (validation.isPlaceholder && validation.length < 100) score = Math.min(score, 20);

    validation.estimatedScore = Math.min(100, score);
    setCodeValidation(validation);
  }, []);

  // Check if user can attempt challenge (with alert detection)
  const checkCanAttempt = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/can-attempt?t=${Date.now()}`;
      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
      const data = await handleApiResponse(response, 'Can-attempt check');

      setCanAttempt(data);

      if (data.alertData && data.alertData.shouldShow) {
        setAlertData(data.alertData);
        setShowAlert(true);
      }

      if (!data.canAttempt) setLoading(false);
    } catch (err) {
      setError(`Error checking attempt eligibility: ${err.message}`);
      setLoading(false);
    }
  }, [projectId, API_BASE_URL, getAuthHeaders, handleApiResponse]);

  // Fetch challenge data
  const fetchChallenge = useCallback(async () => {
    if (!canAttempt?.canAttempt) return;

    try {
      setError(null);
      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/challenge?t=${Date.now()}`;
      const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
      const data = await handleApiResponse(response, 'Fetch challenge');

      setChallenge(data);

      // Set starter code if available
      if (data.challenge?.starter_code && !submittedCode) {
        setSubmittedCode(data.challenge.starter_code);
      }
      setLoading(false);
    } catch (err) {
      setError(`Error loading challenge: ${err.message}`);
      setLoading(false);
    }
  }, [projectId, canAttempt, API_BASE_URL, getAuthHeaders, handleApiResponse, submittedCode]);

  // Start challenge
  const handleStartChallenge = useCallback(() => {
    const now = new Date();
    setStartedAt(now.toISOString());
    if (challenge?.challenge?.time_limit_minutes) {
      setTimeRemaining(challenge.challenge.time_limit_minutes * 60);
    }
  }, [challenge]);

  // Submit solution (success alerts removed; no auto-close/navigation)
  const handleSubmit = useCallback(async () => {
    if (!submittedCode.trim()) {
      alert('Please write your solution before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        submittedCode: submittedCode.trim(),
        startedAt
      };
      if (challenge?.challenge?.id && !challenge.challenge.isTemporary) {
        payload.challengeId = challenge.challenge.id;
      }

      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/attempt`;
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await handleApiResponse(response, 'Submit attempt');
      setResult(data.data);

      // Failure-only alerts. Keep comfort alert if provided by server.
      if (!data.data.passed) {
        if (data.data.alertData?.shouldShow) {
          setAlertData(data.data.alertData);
          setShowAlert(true);
        } else {
          alert(`Challenge not passed. Score: ${data.data.score}%. Keep practicing!`);
        }
      }

      // Optional: signal for other tabs; no auto-close/navigation
      try {
        if (data.data.projectJoined) {
          localStorage.setItem('projectJoined', Date.now().toString());
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setError(`Error submitting challenge: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [submittedCode, startedAt, challenge, projectId, API_BASE_URL, getAuthHeaders, handleApiResponse]);

  // Keep ref updated
  handleSubmitRef.current = handleSubmit;

  // Timer countdown effect
  useEffect(() => {
    if (!startedAt || !challenge?.challenge?.time_limit_minutes || result) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          alert('Time is up! Your current code will be submitted automatically.');
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, challenge, result]);

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);
      await checkCanAttempt();
    };
    initialize();
  }, [projectId, checkCanAttempt, API_BASE_URL]);

  // Load challenge when allowed
  useEffect(() => {
    if (canAttempt?.canAttempt === true && !challenge) {
      fetchChallenge();
    }
  }, [canAttempt, challenge, fetchChallenge]);

  // Code change (only when started)
  const handleCodeChange = (e) => {
    if (!startedAt) return;
    const newCode = e.target.value;
    setSubmittedCode(newCode);
    validateCodeRealTime(newCode);
  };

  // Alert handlers
  const handleAlertClose = () => {
    setShowAlert(false);
    setAlertData(null);
  };

  const handleAlertContinue = () => {
    setShowAlert(false);
    setResult(null);
    setError(null);
    if (challenge?.challenge?.time_limit_minutes && !startedAt) {
      setTimeRemaining(challenge.challenge.time_limit_minutes * 60);
    }
  };

  // Time formatting
  const formatTime = (timeValue) => {
    if (timeValue === null || timeValue === undefined) return 'No limit';

    if (startedAt && timeValue < (challenge?.challenge?.time_limit_minutes || 0) * 60) {
      const totalSeconds = Math.max(0, Math.floor(timeValue));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    const hours = Math.floor(timeValue / 60);
    const mins = timeValue % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444',
      expert: '#8b5cf6'
    };
    return colors[difficulty?.toLowerCase()] || '#6b7280';
  };

  const getValidationScoreColor = () => {
    if (!codeValidation) return '#6b7280';
    if (codeValidation.estimatedScore >= 70) return '#10b981';
    if (codeValidation.estimatedScore >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto',
      overflowX: 'hidden',
      backdropFilter: 'blur(2px)'
    },
    modal: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.92))',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.2)',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)',
      boxSizing: 'border-box'
    },
    centerContent: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9ca3af'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px'
    },
    spinnerContainer: {
      position: 'relative',
      width: '80px',
      height: '80px',
      margin: '0 auto 30px'
    },
    spinner: {
      position: 'absolute',
      width: '60px',
      height: '60px',
      border: '4px solid rgba(59, 130, 246, 0.3)',
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      top: '10px',
      left: '10px'
    },
    spinnerOuter: {
      position: 'absolute',
      width: '80px',
      height: '80px',
      border: '3px solid rgba(16, 185, 129, 0.3)',
      borderBottom: '3px solid #10b981',
      borderRadius: '50%',
      top: '0',
      left: '0'
    },
    loadingDots: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px'
    },
    loadingDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6'
    },
    loadingText: {
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    loadingSubtext: {
      color: '#9ca3af',
      fontSize: '14px'
    },
    header: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95) 0%, rgba(15, 17, 22, 0.98) 50%, rgba(17, 24, 39, 0.95) 100%)',
      color: 'white',
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      flexShrink: 0,
      backdropFilter: 'blur(8px)'
    },
    headerContent: { flex: 1, minWidth: 0 },
    title: { 
      fontSize: '24px', 
      fontWeight: 'bold', 
      margin: '0 0 8px 0',
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    },
    subtitle: { 
      fontSize: '16px', 
      opacity: 0.9, 
      margin: 0,
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    },
    closeIcon: {
      background: 'rgba(255, 255, 255, 0.15)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      flexShrink: 0
    },
    content: { 
      flex: 1, 
      padding: '24px', 
      overflowY: 'auto',
      overflowX: 'hidden',
      backgroundColor: 'rgba(15, 17, 22, 0.6)',
      backdropFilter: 'blur(4px)',
      boxSizing: 'border-box'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
      width: '100%',
      boxSizing: 'border-box'
    },
    infoCard: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
      padding: '16px',
      borderRadius: '12px',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box',
      minWidth: 0
    },
    infoLabel: {
      color: '#9ca3af',
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '8px',
      textTransform: 'uppercase'
    },
    infoValue: { 
      fontSize: '16px', 
      fontWeight: 'bold', 
      textTransform: 'capitalize',
      color: 'white',
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    },
    timerContainer: {
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box'
    },
    timerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '8px'
    },
    timerLabel: { color: '#fbbf24', fontWeight: '500' },
    timerValue: { 
      fontSize: '20px', 
      fontWeight: '700', 
      fontFamily: 'monospace',
      color: 'white'
    },
    section: { marginBottom: '24px', width: '100%', boxSizing: 'border-box' },
    sectionTitle: { 
      fontSize: '18px', 
      fontWeight: 'bold', 
      color: 'white', 
      marginBottom: '12px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      flexWrap: 'wrap'
    },
    descriptionBox: { 
      background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.8), rgba(26, 28, 32, 0.6))',
      border: '1px solid rgba(255, 255, 255, 0.15)', 
      borderRadius: '12px', 
      padding: '16px',
      backdropFilter: 'blur(10px)',
      color: '#e2e8f0',
      boxSizing: 'border-box',
      width: '100%',
      overflowX: 'auto'
    },
    testCasesBox: { 
      background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.8), rgba(26, 28, 32, 0.6))',
      border: '1px solid rgba(255, 255, 255, 0.15)', 
      borderRadius: '12px', 
      padding: '16px', 
      overflow: 'auto',
      backdropFilter: 'blur(10px)',
      color: '#e2e8f0',
      boxSizing: 'border-box',
      width: '100%'
    },
    codeEditor: {
      width: '100%',
      minHeight: '300px',
      padding: '16px',
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      fontSize: '14px',
      border: '2px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '12px',
      resize: 'vertical',
      outline: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      color: '#e2e8f0',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    disabledOverlay: {
      position: 'absolute',
      top: '0', left: '0', right: '0', bottom: '0',
      background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.9))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: '12px', zIndex: 1, backdropFilter: 'blur(8px)'
    },
    disabledMessage: { 
      textAlign: 'center', 
      color: '#9ca3af', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      fontSize: '16px', 
      fontWeight: '500',
      padding: '20px',
      maxWidth: '300px'
    },
    validationPanel: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 16px', 
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
      borderRadius: '8px', 
      marginTop: '8px', 
      fontSize: '14px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      flexWrap: 'wrap',
      gap: '8px',
      boxSizing: 'border-box'
    },
    validationLeft: { 
      display: 'flex', 
      gap: '16px',
      flexWrap: 'wrap',
      minWidth: 0
    },
    validationItem: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '4px', 
      color: '#e2e8f0',
      fontSize: '12px',
      whiteSpace: 'nowrap'
    },
    validationScore: { 
      fontWeight: 'bold', 
      padding: '4px 8px', 
      borderRadius: '6px', 
      color: 'white',
      fontSize: '12px',
      whiteSpace: 'nowrap'
    },
    characterCount: { 
      fontSize: '12px', 
      color: '#9ca3af', 
      marginTop: '8px', 
      textAlign: 'right',
      wordWrap: 'break-word'
    },
    hintSection: { 
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
      border: '1px solid rgba(59, 130, 246, 0.3)', 
      borderRadius: '12px', 
      padding: '16px', 
      marginBottom: '24px',
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box'
    },
    hintToggle: { 
      background: 'none', 
      border: 'none', 
      color: '#60a5fa', 
      cursor: 'pointer', 
      fontSize: '14px', 
      fontWeight: 'bold', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      transition: 'color 0.3s ease',
      flexWrap: 'wrap'
    },
    hintContent: { 
      marginTop: '12px', 
      fontSize: '14px', 
      lineHeight: '1.5',
      color: '#cbd5e1'
    },
    errorBox: { 
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
      color: '#fca5a5', 
      padding: '16px', 
      borderRadius: '12px', 
      border: '1px solid rgba(239, 68, 68, 0.3)', 
      marginBottom: '20px',
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box',
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    },
    resultBox: { 
      padding: '20px', 
      borderRadius: '12px', 
      border: '2px solid', 
      marginBottom: '20px',
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box'
    },
    resultHeader: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '8px'
    },
    resultTitle: { fontSize: '18px', fontWeight: 'bold', minWidth: 0 },
    resultScore: { fontSize: '24px', fontWeight: 'bold', whiteSpace: 'nowrap' },
    resultFeedback: { 
      fontSize: '14px', 
      marginBottom: '12px',
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    },
    joinedNotice: { 
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
      padding: '16px', 
      borderRadius: '12px', 
      border: '1px solid rgba(16, 185, 129, 0.3)',
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box'
    },
    joinedText: { 
      color: '#6ee7b7', 
      fontWeight: 'bold', 
      margin: 0,
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    },
    actionButtons: { 
      display: 'flex', 
      gap: '12px', 
      justifyContent: 'flex-end', 
      paddingTop: '20px', 
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    button: { 
      padding: '12px 24px', 
      borderRadius: '10px', 
      border: 'none', 
      fontSize: '16px', 
      fontWeight: 'bold', 
      cursor: 'pointer', 
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      whiteSpace: 'nowrap',
      minWidth: 'fit-content'
    },
    primaryButton: { 
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
    },
    secondaryButton: { 
      background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.6))',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    retryButton: { 
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
    },
    disabledButton: { opacity: 0.6, cursor: 'not-allowed' }
  };

  // Loading state with proper animations
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinnerContainer}>
              <div 
                style={{
                  ...styles.spinner,
                  animation: 'spin 1.2s linear infinite'
                }}
              ></div>
              <div 
                style={{
                  ...styles.spinnerOuter,
                  animation: 'spinReverse 2s linear infinite'
                }}
              ></div>
            </div>
            <div style={styles.loadingDots}>
              <div style={{
                ...styles.loadingDot,
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
              <div style={{
                ...styles.loadingDot,
                animation: 'pulse 1.5s ease-in-out infinite 0.2s'
              }}></div>
              <div style={{
                ...styles.loadingDot,
                animation: 'pulse 1.5s ease-in-out infinite 0.4s'
              }}></div>
            </div>
            <h3 style={{
              ...styles.loadingText,
              animation: 'fadeInOut 2s ease-in-out infinite'
            }}>Loading Challenge</h3>
            <p style={{
              ...styles.loadingSubtext,
              animation: 'fadeInOut 2s ease-in-out infinite 0.5s'
            }}>Please wait while we prepare your coding challenge...</p>
          </div>
        </div>
        
        {/* Inline CSS animations */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes spinReverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.8);
              opacity: 0.4;
            }
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <div style={styles.centerContent}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>Error Loading Challenge</h3>
            <p style={{ color: '#e2e8f0', marginBottom: '20px' }}>{error}</p>
            <div style={{ marginBottom: '20px', fontSize: '12px', color: '#6b7280' }}>
              <p><strong>Project ID:</strong> {projectId}</p>
              <p><strong>API Base URL:</strong> {API_BASE_URL || 'Using proxy'}</p>
              <p><strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                checkCanAttempt();
              }}
              style={{ ...styles.button, ...styles.retryButton }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
              }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cannot attempt state
  if (canAttempt && !canAttempt.canAttempt) {
    return (
      <>
        <div style={styles.container}>
          <div style={styles.modal}>
            <div style={styles.centerContent}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ color: 'white', marginBottom: '16px' }}>Cannot Attempt Challenge</h3>
              <p style={{ color: '#e2e8f0', marginBottom: '20px' }}>{canAttempt.reason}</p>
              {canAttempt.nextAttemptAt && (
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Next attempt available: {new Date(canAttempt.nextAttemptAt).toLocaleString()}
                </p>
              )}
              {onClose && (
                <button 
                  onClick={onClose} 
                  style={{ ...styles.button, ...styles.secondaryButton }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>

        {showAlert && alertData && (
          <ChallengeFailureAlert
            alertData={alertData}
            onClose={handleAlertClose}
            onContinue={handleAlertContinue}
            projectTitle={challenge?.project?.title || 'this project'}
            // Required props
            userId={JSON.parse(localStorage.getItem('user') || '{}').id}
            challengeId={challenge?.challenge?.id}
            programmingLanguageId={challenge?.challenge?.programming_language_id}
            challengeLanguage={challenge?.challenge?.programming_languages?.name || 'javascript'}
            difficultyLevel={challenge?.challenge?.difficulty_level || 'beginner'}
          />
        )}
      </>
    );
  }

  // No challenge available
  if (!challenge) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <div style={styles.centerContent}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💻</div>
            <h3 style={{ color: 'white', marginBottom: '16px' }}>No Challenge Available</h3>
            <p style={{ color: '#e2e8f0' }}>This project doesn't have an active coding challenge.</p>
            {onClose && (
              <button 
                onClick={onClose} 
                style={{ ...styles.button, ...styles.secondaryButton, marginTop: '20px' }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main challenge interface
  return (
    <>
      <div style={styles.container}>
        <div style={styles.modal}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <h1 style={styles.title}>Join "{challenge.project?.title || 'Project'}"</h1>
              <p style={styles.subtitle}>Complete this coding challenge to join the project</p>
            </div>
            {onClose && (
              <button 
                onClick={onClose} 
                style={styles.closeIcon}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            )}
          </div>

          <div style={styles.content}>
            {/* Info cards */}
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Difficulty</div>
                <div style={{ ...styles.infoValue, color: getDifficultyColor(challenge.challenge?.difficulty_level) }}>
                  {challenge.challenge?.difficulty_level || 'Medium'}
                </div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Language</div>
                <div style={styles.infoValue}>
                  {challenge.challenge?.programming_languages?.name ||
                    challenge.project?.primaryLanguage || 'JavaScript'}
                </div>
              </div>

              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Time Limit</div>
                <div style={styles.infoValue}>
                  {formatTime(challenge.challenge?.time_limit_minutes)}
                </div>
              </div>
            </div>

            {/* Timer */}
            {startedAt && timeRemaining !== null && (
              <div style={styles.timerContainer}>
                <div style={styles.timerContent}>
                  <span style={styles.timerLabel}>Time Remaining:</span>
                  <span style={{ ...styles.timerValue, color: timeRemaining <= 300 ? '#ef4444' : '#10b981' }}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Challenge Description</h3>
              <div style={styles.descriptionBox}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {challenge.challenge?.description || 'No description available.'}
                </pre>
              </div>
            </div>

            <ChallengeHints
              rawTestCases={challenge.challenge?.test_cases}
              failedAttempts={canAttempt?.failedAttempts || 0}
            />

            {/* Test Cases */}
            {challenge.challenge?.test_cases && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🧪 Test Cases</h3>
                <div style={styles.testCasesBox}>
                  <pre style={{ margin: 0, fontSize: '13px', fontFamily: 'Monaco, Consolas, monospace' }}>
                    {typeof challenge.challenge.test_cases === 'string'
                      ? challenge.challenge.test_cases
                      : JSON.stringify(challenge.challenge.test_cases, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Hints */}
            <div style={styles.hintSection}>
              <button 
                onClick={() => setShowHints(!showHints)} 
                style={styles.hintToggle}
                onMouseEnter={(e) => {
                  e.target.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#60a5fa';
                }}
              >
                💡 {showHints ? 'Hide' : 'Show'} Hints
                <span>{showHints ? '▲' : '▼'}</span>
              </button>
              {showHints && (
                <div style={styles.hintContent}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Read the requirements carefully before starting</li>
                    <li>Make sure your solution handles all test cases</li>
                    <li>Include proper function definitions and logic</li>
                    <li>Add comments to explain your approach</li>
                    <li>Test your solution with the provided examples</li>
                    <li>Use appropriate variable names and code structure</li>
                    <li>Print exactly one JSON object to STDOUT (no extra logs). Whitespace/key order are ignored.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Code Editor */}
            <div style={{ ...styles.section, position: 'relative' }}>
              <h3 style={styles.sectionTitle}>💻 Your Solution</h3>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={submittedCode}
                  onChange={handleCodeChange}
                  style={{
                    ...styles.codeEditor,
                    ...((!startedAt || isSubmitting || (result && result.passed)) ? {
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      cursor: 'not-allowed',
                      color: '#6b7280'
                    } : {}),
                    ...(startedAt && !isSubmitting && !(result && result.passed) ? {
                      borderColor: 'rgba(59, 130, 246, 0.4)',
                    } : {})
                  }}
                  placeholder={!startedAt ? "Click 'Start Challenge' to begin coding..." : "Write your solution here..."}
                  disabled={!startedAt || isSubmitting || (result && result.passed)}
                  onFocus={(e) => {
                    if (startedAt && !isSubmitting && !(result && result.passed)) {
                      e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {!startedAt && (
                  <div style={styles.disabledOverlay}>
                    <div style={styles.disabledMessage}>
                      <span style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</span>
                      <p>Start the challenge to begin coding</p>
                    </div>
                  </div>
                )}
              </div>

              {startedAt && codeValidation && (
                <div style={styles.validationPanel}>
                  <div style={styles.validationLeft}>
                    <div style={styles.validationItem}>
                      <span>{codeValidation.hasFunction ? '✅' : '❌'}</span>
                      <span>Function</span>
                    </div>
                    <div style={styles.validationItem}>
                      <span>{codeValidation.hasLogic ? '✅' : '❌'}</span>
                      <span>Logic</span>
                    </div>
                    <div style={styles.validationItem}>
                      <span>{codeValidation.hasReturn ? '✅' : '❌'}</span>
                      <span>Return</span>
                    </div>
                    <div style={styles.validationItem}>
                      <span>{codeValidation.hasComments ? '✅' : '❌'}</span>
                      <span>Comments</span>
                    </div>
                    {codeValidation.isPlaceholder && (
                      <div style={styles.validationItem}>
                        <span>⚠️</span>
                        <span>Placeholder detected</span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    ...styles.validationScore,
                    backgroundColor: getValidationScoreColor()
                  }}>
                    ~{codeValidation.estimatedScore}%
                  </div>
                </div>
              )}

              <div style={styles.characterCount}>
                Characters: {submittedCode.length} | Lines: {submittedCode.split('\n').length}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div style={styles.errorBox}>
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div style={{
                ...styles.resultBox,
                backgroundColor: result.passed 
                  ? 'rgba(16, 185, 129, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)',
                borderColor: result.passed 
                  ? 'rgba(16, 185, 129, 0.4)' 
                  : 'rgba(239, 68, 68, 0.4)',
                color: result.passed ? '#6ee7b7' : '#fca5a5'
              }}>
                <div style={styles.resultHeader}>
                  <span style={styles.resultTitle}>
                    {result.passed ? '🎉 Challenge Passed!' : '❌ Challenge Not Passed'}
                  </span>
                  <span style={styles.resultScore}>
                    {result.score}%
                  </span>
                </div>

                {result.feedback && (
                  <p style={styles.resultFeedback}>{result.feedback}</p>
                )}

                {result.projectJoined && (
                  <div style={styles.joinedNotice}>
                    <p style={styles.joinedText}>
                      🎉 Congratulations! You have been added to the project as a member.
                      You can now access the project workspace and collaborate with the team.
                    </p>
                  </div>
                )}

                {result.evaluation && result.evaluation.details && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '16px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'white' }}>
                      📊 Evaluation Breakdown:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li style={{ fontSize: '14px', margin: '6px 0', color: '#e2e8f0' }}>
                        {result.evaluation.details.hasFunction ? '✅' : '❌'} Function Definition (25 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0', color: '#e2e8f0' }}>
                        {result.evaluation.details.hasLogic ? '✅' : '❌'} Control Structures & Logic (20 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0', color: '#e2e8f0' }}>
                        {result.evaluation.details.languageMatch ? '✅' : '❌'} Language Syntax Match (20 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0', color: '#e2e8f0' }}>
                        {result.evaluation.details.properStructure ? '✅' : '❌'} Code Structure (10 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0', color: '#e2e8f0' }}>
                        📈 Complexity Score: {result.evaluation.details.complexity * 3}/15 pts
                      </li>
                    </ul>
                  </div>
                )}
                 
                 {result.evaluation &&
                    Array.isArray(result.evaluation.testResults) &&
                    result.evaluation.testResults.length > 0 && (
                      <TestResultsPanel tests={result.evaluation.testResults} />
                  )}

                {!result.passed && (
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setResult(null);
                        setError(null);
                        if (challenge?.challenge?.time_limit_minutes && !startedAt) {
                          setTimeRemaining(challenge.challenge.time_limit_minutes * 60);
                        }
                      }}
                      style={{ ...styles.button, ...styles.retryButton }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      🔄 Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              {!startedAt && !result && (
                <>
                  <button
                    onClick={onClose}
                    style={{ ...styles.button, ...styles.secondaryButton }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.7))';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.6))';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartChallenge}
                    disabled={loading || isSubmitting}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      ...(loading || isSubmitting ? styles.disabledButton : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && !isSubmitting) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && !isSubmitting) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                  >
                    🚀 Start Challenge
                  </button>
                </>
              )}

              {startedAt && !result && (
                <>
                  <button
                    onClick={onClose}
                    style={{ ...styles.button, ...styles.secondaryButton }}
                    disabled={isSubmitting}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.7))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.background = 'linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.6))';
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !submittedCode.trim() || submittedCode.trim().length < 10}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      ...(isSubmitting || !submittedCode.trim() || submittedCode.trim().length < 10 ? styles.disabledButton : {})
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && submittedCode.trim() && submittedCode.trim().length >= 10) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting && submittedCode.trim() && submittedCode.trim().length >= 10) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginRight: '8px'
                        }}></span>
                        Submitting...
                      </>
                    ) : (
                      '📤 Submit Solution'
                    )}
                  </button>
                </>
              )}

              {result && (
                <button
                  onClick={() => {
                    if (result.projectJoined) {
                      // Navigate to project dashboard
                      navigate(`/projects/${projectId}`);
                    } else {
                      onClose();
                    }
                  }}
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {result.projectJoined ? '🎉 Go to Project' : 'Close'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAlert && alertData && challenge && (() => {
        console.log('🔍 ALERT RENDERING - Props being passed:', {
          showAlert,
          'alertData.shouldShow': alertData?.shouldShow,
          'alertData.attemptCount': alertData?.attemptCount,
          'alertData.message': alertData?.message,
          challengeId: challenge?.challenge?.id,
          programmingLanguageId: challenge?.challenge?.programming_language_id,
          userId: JSON.parse(localStorage.getItem('user') || '{}').id,
          'challenge structure': challenge
        });
        return true;
      })() && (
        <ChallengeFailureAlert
          alertData={alertData}
          onClose={handleAlertClose}
          onContinue={handleAlertContinue}
          projectTitle={challenge?.project?.title || 'this project'}
          // Required props for recommendations API
          userId={JSON.parse(localStorage.getItem('user') || '{}').id}
          challengeId={challenge?.challenge?.id}
          programmingLanguageId={challenge?.challenge?.programming_language_id}
          challengeLanguage={challenge?.challenge?.programming_languages?.name || 'javascript'}
          difficultyLevel={challenge?.challenge?.difficulty_level || 'beginner'}
        />
      )}
    </>
  );
};

export default ProjectChallengeInterface;