// frontend/src/components/ChallengeAttemptModal.js
import React, { useState } from 'react';
import { X, Code, Send, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import ChallengeAPI from '../services/challengeAPI';

const ChallengeAttemptModal = ({ isOpen, onClose, challenge, onComplete }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter your solution code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const response = await ChallengeAPI.attemptChallenge(challenge.id, {
        solution_code: code,
        programming_language_id: challenge.programming_language_id
      });

      if (response.success) {
        setResult(response.data);
        
        // Notify parent component
        if (onComplete) {
          onComplete(response.data.attempt.id, response.data.attempt.status);
        }

        // Auto-close on success after 2 seconds
        if (response.data.attempt.status === 'passed') {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setError(err.response?.data?.message || 'Failed to submit solution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <Code size={24} style={{ color: '#3b82f6' }} />
            <div>
              <h2 style={styles.title}>{challenge.title}</h2>
              <p style={styles.subtitle}>
                {challenge.difficulty_level} • Verify your proficiency
              </p>
            </div>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Challenge Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Challenge</h3>
            <p style={styles.description}>{challenge.description}</p>
          </div>

          {/* Test Cases (if available) */}
          {challenge.test_cases && challenge.test_cases.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Test Cases</h3>
              <div style={styles.testCases}>
                {challenge.test_cases.slice(0, 2).map((testCase, index) => (
                  <div key={index} style={styles.testCase}>
                    <div style={styles.testCaseLabel}>Test Case {index + 1}</div>
                    <div style={styles.testCaseContent}>
                      <div>
                        <strong>Input:</strong> {JSON.stringify(testCase.input)}
                      </div>
                      <div>
                        <strong>Expected:</strong> {JSON.stringify(testCase.expected_output)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Your Solution</h3>
            <textarea
              style={styles.codeEditor}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your solution here..."
              disabled={loading || result?.attempt?.status === 'passed'}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={result.attempt.status === 'passed' ? styles.successResult : styles.failedResult}>
              {result.attempt.status === 'passed' ? (
                <>
                  <CheckCircle size={20} />
                  <div>
                    <strong>Success!</strong> You've verified your proficiency.
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={20} />
                  <div>
                    <strong>Try Again!</strong> Your solution didn't pass all test cases.
                    {result.feedback && <div style={styles.feedback}>{result.feedback}</div>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              style={styles.submitButton}
              onClick={handleSubmit}
              disabled={loading || !code.trim() || result?.attempt?.status === 'passed'}
            >
              {loading ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Submitting...
                </>
              ) : result?.attempt?.status === 'passed' ? (
                <>
                  <CheckCircle size={16} />
                  Verified
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Solution
                </>
              )}
            </button>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#1a1d29',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#9ca3af',
    textTransform: 'capitalize'
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
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  description: {
    fontSize: '14px',
    color: '#d1d5db',
    lineHeight: '1.6',
    margin: 0
  },
  testCases: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  testCase: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '12px'
  },
  testCaseLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: '6px'
  },
  testCaseContent: {
    fontSize: '13px',
    color: '#d1d5db',
    fontFamily: 'monospace',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  codeEditor: {
    width: '100%',
    minHeight: '200px',
    padding: '16px',
    backgroundColor: '#0f1116',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    outline: 'none',
    resize: 'vertical',
    transition: 'all 0.2s'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
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
  submitButton: {
    flex: 2,
    padding: '12px',
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
    padding: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px'
  },
  successResult: {
    padding: '16px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px'
  },
  failedResult: {
    padding: '16px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: '16px'
  },
  feedback: {
    marginTop: '8px',
    fontSize: '13px',
    opacity: 0.9
  }
};

export default ChallengeAttemptModal;