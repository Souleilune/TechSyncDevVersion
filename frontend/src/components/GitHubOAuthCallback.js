// frontend/src/components/GitHubOAuthCallback.js
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { githubService } from '../services/githubService';

function GitHubOAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing GitHub authorization...');

  // Memoize the callback handler to fix the useEffect dependency warning
  const handleOAuthCallback = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`GitHub authorization failed: ${error}`);
        setTimeout(() => navigate('/projects'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from GitHub');
        setTimeout(() => navigate('/projects'), 3000);
        return;
      }

      // Send the code to backend for processing
      const response = await githubService.handleOAuthCallback(code, state);
      
      if (response.success) {
        setStatus('success');
        setMessage('GitHub account connected successfully! Redirecting...');
        setTimeout(() => {
          // Redirect back to the page that initiated the OAuth flow
          const returnUrl = sessionStorage.getItem('github_oauth_return_url') || '/projects';
          sessionStorage.removeItem('github_oauth_return_url');
          navigate(returnUrl);
        }, 2000);
      } else {
        setStatus('error');
        setMessage(response.message || 'Failed to connect GitHub account');
        setTimeout(() => navigate('/projects'), 3000);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage('An error occurred while connecting your GitHub account');
      setTimeout(() => navigate('/projects'), 3000);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    handleOAuthCallback();
  }, [handleOAuthCallback]);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      textAlign: 'center'
    },
    icon: {
      fontSize: '64px',
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      marginBottom: '15px',
      color: '#333'
    },
    message: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '20px'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '20px auto'
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#28a745';
      case 'error':
        return '#dc3545';
      default:
        return '#007bff';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>{getStatusIcon()}</div>
      <h1 style={{ ...styles.title, color: getStatusColor() }}>
        {status === 'processing' && 'Connecting GitHub Account'}
        {status === 'success' && 'GitHub Connected!'}
        {status === 'error' && 'Connection Failed'}
      </h1>
      <p style={styles.message}>{message}</p>
      {status === 'processing' && (
        <div style={styles.spinner}></div>
      )}
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

export default GitHubOAuthCallback;