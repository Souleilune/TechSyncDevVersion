import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Eye, EyeOff, Home, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

// Isolated background styles - never changes
const backgroundStyles = {
  backgroundLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 1
  },
  figmaBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  codeSymbol: {
    position: 'absolute',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontStyle: 'normal',
    fontWeight: 900,
    fontSize: '24px',
    lineHeight: '29px',
    userSelect: 'none',
    pointerEvents: 'none'
  },
  backgroundPattern: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    opacity: 0.1
  }
};

// Completely isolated background component - no dependencies on parent state
const IsolatedAnimatedBackground = React.memo(() => (
  <>
    {/* Background Pattern */}
    <svg 
      style={backgroundStyles.backgroundPattern}
      viewBox="0 0 1440 1024"
      preserveAspectRatio="none"
    >
      <path
        d="M0,400 Q200,300 400,350 T800,320 Q1000,280 1200,340 L1440,360 L1440,1024 L0,1024 Z"
        fill="rgba(255,255,255,0.02)"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
      <path
        d="M0,600 Q300,500 600,550 T1200,520 L1440,540 L1440,1024 L0,1024 Z"
        fill="rgba(255,255,255,0.02)"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
    </svg>

    {/* Animated Code Symbols Background */}
    <div style={backgroundStyles.backgroundLayer}>
      <div style={backgroundStyles.figmaBackground}>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '78%', top: '85%', color: '#3E4A6B', transform: 'rotate(-25deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '58%', top: '75%', color: '#6D798F', transform: 'rotate(10deg)'}}>&#60;/&#62;</div>
        <div className="floating-symbol" style={{...backgroundStyles.codeSymbol, left: '35%', top: '5%', color: '#454B68', transform: 'rotate(-35deg)'}}>&#60;/&#62;</div>
      </div>
    </div>
  </>
));

function Login() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    bio: '',
    github_username: '',
    linkedin_url: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheckTimer, setUsernameCheckTimer] = useState(null);

  const { login, register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'signup') {
      setIsRegistering(true);
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
    setValidationErrors({});
    setPasswordError('');
  }, [isRegistering, clearError]);

  useEffect(() => {
    if (error && !isRegistering) {
      if (error.toLowerCase().includes('password') ||
          error.toLowerCase().includes('incorrect') ||
          error.toLowerCase().includes('invalid credentials') ||
          error.toLowerCase().includes('authentication failed') ||
          error.toLowerCase().includes('unauthorized') ||
          error.toLowerCase().includes('login failed')) {
        setPasswordError('Incorrect username or password. Please try again.');
        clearError();
      }
    }
  }, [error, isRegistering, clearError]);

  const validateUsername = (username) => {
    if (!username || username.length < 3 || username.length > 50) {
      return 'Username must be between 3-50 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const checkUsernameAvailability = useCallback(async (username) => {
  if (!username || username.length < 3) {
    return;
  }

  // Client-side validation first
  const usernameError = validateUsername(username);
  if (usernameError) {
    return;
  }

  try {
    setCheckingUsername(true);
    const result = await authService.checkUsername(username);
    
    if (result.success && !result.available) {
      setValidationErrors(prev => ({
        ...prev,
        username: 'Username already in used'
      }));
    } else if (result.success && result.available) {
      setValidationErrors(prev => {
        const { username, ...rest } = prev;
        return rest;
      });
    }
  } catch (error) {
    console.error('Username check error:', error);
  } finally {
    setCheckingUsername(false);
  }
}, []);

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return null;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const validateFullName = (fullName) => {
    if (!fullName) return 'Full name is required';
    if (fullName.length < 2) return 'Full name must be at least 2 characters';
    return null;
  };

  const validateLinkedInUrl = (url) => {
    if (!url) return null;
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/;
    if (!linkedinRegex.test(url)) {
      return 'Please enter a valid LinkedIn profile URL';
    }
    return null;
  };

  const validateGitHubUsername = (username) => {
    if (!username) return null;
    if (!/^[a-zA-Z0-9-_]+$/.test(username)) {
      return 'GitHub username can only contain letters, numbers, hyphens, and underscores';
    }
    return null;
  };

  const validateRegistrationForm = useCallback((data) => {
    const errors = {};
    
    const usernameError = validateUsername(data.username);
    if (usernameError) errors.username = usernameError;

    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    const fullNameError = validateFullName(data.full_name);
    if (fullNameError) errors.full_name = fullNameError;

    if (data.github_username && data.github_username.trim()) {
      const githubError = validateGitHubUsername(data.github_username);
      if (githubError) errors.github_username = githubError;
    }

    if (data.linkedin_url && data.linkedin_url.trim()) {
      const linkedinError = validateLinkedInUrl(data.linkedin_url);
      if (linkedinError) errors.linkedin_url = linkedinError;
    }

    return errors;
  }, []);

  useEffect(() => {
    if (isRegistering) {
      const touchedFields = {};
      Object.keys(registerData).forEach(key => {
        if (registerData[key] && registerData[key].trim()) {
          touchedFields[key] = registerData[key];
        }
      });

      const errors = validateRegistrationForm(touchedFields);
      
      const filteredErrors = {};
      Object.keys(errors).forEach(key => {
        if (registerData[key] && registerData[key].trim()) {
          filteredErrors[key] = errors[key];
        }
      });
      
      setValidationErrors(filteredErrors);
      
      const requiredFieldsFilled = registerData.username.trim() && 
                                  registerData.email.trim() && 
                                  registerData.password.trim() && 
                                  registerData.confirmPassword.trim() && 
                                  registerData.full_name.trim();
      
      const hasNoErrors = Object.keys(filteredErrors).length === 0;
      
      setIsFormValid(requiredFieldsFilled && hasNoErrors);
    }
  }, [registerData, isRegistering, validateRegistrationForm]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    
    if (!formData.identifier || !formData.password) {
      setValidationErrors({
        form: 'Please fill in all required fields'
      });
      return;
    }
    
    const result = await login(formData);
    if (result && result.success) {
      if (result.data?.user?.needsOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateRegistrationForm(registerData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!registerData.username.trim() || !registerData.email.trim() || 
        !registerData.password.trim() || !registerData.confirmPassword.trim() || !registerData.full_name.trim()) {
      setValidationErrors({
        form: 'Please fill in all required fields'
      });
      return;
    }

    setValidationErrors({});
    
    try {
      const result = await register(registerData);
      
      if (result && result.success) {
        navigate('/onboarding');
      } else {
        if (result?.errors && Array.isArray(result.errors)) {
          const fieldErrors = {};
          result.errors.forEach(err => {
            if (err.path) {
              fieldErrors[err.path] = err.msg;
            }
          });
          setValidationErrors(fieldErrors);
        } else {
          setValidationErrors({
            form: result?.message || 'Registration failed. Please try again.'
          });
        }
      }
    } catch (err) {
      setValidationErrors({
        form: err?.response?.data?.message || 'Registration failed. Please try again.'
      });
    }
  };

  const handleLoginChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (validationErrors.form) {
      setValidationErrors({});
    }
    if (passwordError && e.target.name === 'password') {
      setPasswordError('');
    }
  };

  const handleRegisterChange = (e) => {
  const { name, value } = e.target;
  setRegisterData(prev => ({
    ...prev,
    [name]: value
  }));

  // Real-time username availability check with debounce
  if (name === 'username') {
    // Clear previous timer
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer);
    }

    // Set new timer for 500ms delay
    const timer = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);

    setUsernameCheckTimer(timer);
  }
};

useEffect(() => {
  return () => {
    if (usernameCheckTimer) {
      clearTimeout(usernameCheckTimer);
    }
  };
}, [usernameCheckTimer]);

  // Memoize styles WITHOUT any dynamic values
  const styles = useMemo(() => ({
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    },
    container: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '380px',
      width: '100%',
      background: 'linear-gradient(135deg, rgba(42, 46, 57, 0.95) 0%, rgba(28, 31, 38, 0.98) 50%, rgba(20, 22, 28, 1) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    },
    logoSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem',
      borderRadius: '12px',
      marginBottom: '1rem'
    },
    logoIconWrapper: {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      padding: '0.5rem',
      borderRadius: '12px',
      marginBottom: '0.25rem'
    },
    logoIcon: {
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease',
      marginBottom: '0.25rem'
    },
    logoImage: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    },
    logoText: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #4b5563, #6b7280, #9ca3af, #eef0f4ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.5px',
      lineHeight: '1',
      marginTop: '0.25rem'
    },
    logoTagline: {
      fontSize: '8px',
      color: '#6b7280',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      marginTop: '0.25rem',
      fontWeight: '400'
    },
    title: {
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      letterSpacing: '-0.025em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    formGroup: {
      // No marginBottom here
    },
    label: {
      display: 'block',
      marginBottom: '0.4rem',
      color: '#e5e7eb',
      fontSize: '13px',
      fontWeight: '500',
      letterSpacing: '0.025em'
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem',
      fontSize: '15px',
      background: 'rgba(55, 65, 81, 0.5)',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      borderRadius: '10px',
      color: 'white',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    inputError: {
      width: '100%',
      padding: '0.875rem 1rem',
      fontSize: '15px',
      background: 'rgba(185, 28, 28, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.5)',
      borderRadius: '10px',
      color: 'white',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    },
    button: {
      width: '100%',
      padding: '0.875rem 1.5rem',
      background: 'linear-gradient(to right, #1f2937, #111827)',
      color: 'white',
      border: 'none',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      borderRadius: '10px',
      marginBottom: '1rem',
      transition: 'all 0.3s ease',
      letterSpacing: '0.025em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    buttonDisabled: {
      background: 'rgba(107, 114, 128, 0.5)',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    error: {
      color: '#ef4444',
      textAlign: 'center',
      marginBottom: '1.25rem',
      padding: '0.75rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '10px',
      fontSize: '13px',
      backdropFilter: 'blur(8px)'
    },
    passwordError: {
      color: '#ef4444',
      textAlign: 'left',
      marginTop: '0.5rem',
      padding: '0.5rem 0.75rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '8px',
      fontSize: '12px',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    fieldError: {
      color: '#f87171',
      fontSize: '11px',
      marginTop: '0.4rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    switchText: {
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '14px'
    },
    link: {
      color: '#60a5fa',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.3s ease'
    },
    helpText: {
      fontSize: '11px',
      color: '#9ca3af',
      marginTop: '0.4rem',
      lineHeight: '1.3'
    },
    successText: {
      fontSize: '11px',
      color: '#34d399',
      marginTop: '0.4rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    passwordContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    passwordInput: {
      width: '100%',
      padding: '0.875rem 2.5rem 0.875rem 1rem',
      fontSize: '15px',
      background: 'rgba(55, 65, 81, 0.5)',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      borderRadius: '10px',
      color: 'white',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    passwordInputError: {
      width: '100%',
      padding: '0.875rem 2.5rem 0.875rem 1rem',
      fontSize: '15px',
      background: 'rgba(185, 28, 28, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.5)',
      borderRadius: '10px',
      color: 'white',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    },
    eyeToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.3s ease',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }), []); // Empty dependency - no dynamic values

  const hoverStyles = `
    /* FLOATING BACKGROUND SYMBOLS */
    @keyframes floatAround1 {
      0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
      25% { transform: translate(30px, -20px) rotate(-5deg); }
      50% { transform: translate(15px, -25px) rotate(10deg); }
      75% { transform: translate(-15px, 10px) rotate(18deg); }
    }

    @keyframes floatAround2 {
      0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
      33% { transform: translate(-25px, 15px) rotate(-30deg); }
      66% { transform: translate(35px, -10px) rotate(-45deg); }
    }

    @keyframes floatAround3 {
      0%, 100% { transform: translate(0, 0) rotate(34.77deg); }
      20% { transform: translate(-20px, -30px) rotate(40deg); }
      40% { transform: translate(25px, 20px) rotate(28deg); }
      60% { transform: translate(-10px, -15px) rotate(38deg); }
      80% { transform: translate(15px, 25px) rotate(30deg); }
    }

    @keyframes floatAround4 {
      0%, 100% { transform: translate(0, 0) rotate(28.16deg); }
      50% { transform: translate(-40px, 30px) rotate(35deg); }
    }

    @keyframes floatAround5 {
      0%, 100% { transform: translate(0, 0) rotate(24.5deg); }
      25% { transform: translate(20px, -25px) rotate(30deg); }
      50% { transform: translate(-30px, 20px) rotate(18deg); }
      75% { transform: translate(25px, 15px) rotate(28deg); }
    }

    @keyframes floatAround6 {
      0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
      33% { transform: translate(-15px, -20px) rotate(30deg); }
      66% { transform: translate(30px, 25px) rotate(20deg); }
    }

    @keyframes driftSlow {
      0%, 100% { transform: translate(0, 0) rotate(-19.68deg); }
      25% { transform: translate(-35px, 20px) rotate(-25deg); }
      50% { transform: translate(20px, -30px) rotate(-15deg); }
      75% { transform: translate(-10px, 35px) rotate(-22deg); }
    }

    @keyframes gentleDrift {
      0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
      50% { transform: translate(25px, -40px) rotate(-2deg); }
    }

    @keyframes spiralFloat {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(20px, -20px) rotate(5deg); }
      50% { transform: translate(0px, -40px) rotate(10deg); }
      75% { transform: translate(-20px, -20px) rotate(5deg); }
    }

    @keyframes waveMotion {
      0%, 100% { transform: translate(0, 0) rotate(15deg); }
      25% { transform: translate(30px, 10px) rotate(20deg); }
      50% { transform translate(-15px, 25px) rotate(-15deg); }
      75% { transform: translate(20px, 10px) rotate(-8deg); }
    }

    @keyframes circularDrift {
      0%, 100% { transform: translate(0, 0) rotate(-45deg); }
      25% { transform: translate(25px, 0px) rotate(-40deg); }
      50% { transform: translate(25px, 25px) rotate(-50deg); }
      75% { transform: translate(0px, 25px) rotate(-42deg); }
    }

    .floating-symbol {
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }

    .floating-symbol:nth-child(1) { animation: floatAround1 15s infinite; }
    .floating-symbol:nth-child(2) { animation: floatAround2 18s infinite; animation-delay: -2s; }
    .floating-symbol:nth-child(3) { animation: floatAround3 12s infinite; animation-delay: -5s; }
    .floating-symbol:nth-child(4) { animation: floatAround4 20s infinite; animation-delay: -8s; }
    .floating-symbol:nth-child(5) { animation: floatAround5 16s infinite; animation-delay: -3s; }
    .floating-symbol:nth-child(6) { animation: floatAround6 14s infinite; animation-delay: -7s; }
    .floating-symbol:nth-child(7) { animation: driftSlow 22s infinite; animation-delay: -10s; }
    .floating-symbol:nth-child(8) { animation: gentleDrift 19s infinite; animation-delay: -1s; }
    .floating-symbol:nth-child(9) { animation: spiralFloat 17s infinite; animation-delay: -6s; }
    .floating-symbol:nth-child(10) { animation: waveMotion 13s infinite; animation-delay: -4s; }
    .floating-symbol:nth-child(11) { animation: circularDrift 21s infinite; animation-delay: -9s; }
    .floating-symbol:nth-child(12) { animation: floatAround1 16s infinite; animation-delay: -2s; }
    .floating-symbol:nth-child(13) { animation: floatAround2 18s infinite; animation-delay: -11s; }
    .floating-symbol:nth-child(14) { animation: floatAround3 14s infinite; animation-delay: -5s; }
    .floating-symbol:nth-child(15) { animation: floatAround4 19s infinite; animation-delay: -7s; }
    .floating-symbol:nth-child(16) { animation: floatAround5 23s infinite; animation-delay: -3s; }
    .floating-symbol:nth-child(17) { animation: driftSlow 15s infinite; animation-delay: -8s; }
    .floating-symbol:nth-child(18) { animation: gentleDrift 17s infinite; animation-delay: -1s; }
    .floating-symbol:nth-child(19) { animation: spiralFloat 20s infinite; animation-delay: -12s; }
    .floating-symbol:nth-child(20) { animation: waveMotion 18s infinite; animation-delay: -6s; }
    .floating-symbol:nth-child(21) { animation: circularDrift 16s infinite; animation-delay: -4s; }
    .floating-symbol:nth-child(22) { animation: floatAround1 14s infinite; animation-delay: -9s; }
    .floating-symbol:nth-child(23) { animation: floatAround2 16s infinite; animation-delay: -3s; }
    .floating-symbol:nth-child(24) { animation: driftSlow 18s infinite; animation-delay: -7s; }

    body {
      overflow: ${isRegistering ? 'auto' : 'hidden'} !important;
      margin: 0;
      padding: 0;
    }

    .login-input:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      background: rgba(55, 65, 81, 0.7) !important;
    }
    
    .password-input:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      background: rgba(55, 65, 81, 0.7) !important;
    }
    
    .login-button:hover:not(:disabled) {
      background: linear-gradient(to right, #374151, #1f2937) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
    }
    
    .switch-link:hover {
      color: #93c5fd !important;
    }
    
    .eye-toggle:hover {
      color: #d1d5db !important;
    }
    
    .logo-section:hover {
      background: transparent !important;
      transform: none !important;
    }

    .logo-section:hover .logo-icon {
      transform: rotate(45deg) scale(1.1) !important;
    }

    .logo-icon-wrapper:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      transform: translateY(-2px) !important;
    }

    .logo-icon-wrapper:hover .logo-icon {
      transform: rotate(45deg) scale(1.1) !important;
    }
    .enhanced-home-button:hover {
      background: linear-gradient(135deg, rgba(31, 35, 40, 0.98), rgba(20, 22, 26, 1)) !important;
      border-color: rgba(59, 130, 246, 0.4) !important;
      transform: translateY(-4px) scale(1.02) !important;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2) !important;
    }
    
    .enhanced-home-button:hover .button-glow {
      opacity: 1 !important;
    }
    
    .enhanced-home-button:hover .icon-container {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.15)) !important;
      transform: scale(1.1) rotate(5deg) !important;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
    }
    
    .enhanced-home-button:hover .button-text {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) brightness(1.1) !important;
    }
    
    .enhanced-home-button:active {
      transform: translateY(-2px) scale(1.01) !important;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    
    input::placeholder {
      color: #9ca3af;
    }
  `;

  if (!isRegistering) {
    // LOGIN FORM
    return (
      <>
        <style>
          {hoverStyles}
        </style>
        <div style={styles.pageContainer}>
        
        <div style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
          zIndex: 50
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.875rem 1.75rem',
              background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.98))',
              backdropFilter: 'blur(24px)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              fontSize: '0.925rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(59, 130, 246, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.02em',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="enhanced-home-button"
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(147, 51, 234, 0.02))',
              borderRadius: '19px',
              opacity: 0,
              transition: 'opacity 0.4s ease',
              zIndex: 1
            }} className="button-glow" />
            
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.08))',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} className="icon-container">
              <Home size={16} strokeWidth={2.5} style={{
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>
            
            <span style={{
              position: 'relative',
              zIndex: 2,
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} className="button-text">
              Home
            </span>
          </button>
        </div>
        
        <IsolatedAnimatedBackground />

        <div style={{
          ...styles.container,
          padding: '1.5rem 2rem 2rem',
          minHeight: '500px'
        }}>
          <div style={styles.logoSection} className="logo-section">
            <div 
              style={styles.logoIconWrapper}
              className="logo-icon-wrapper"
              onClick={() => navigate('/')}
              title="Go back to TechSync homepage"
            >
              <div style={styles.logoIcon} className="logo-icon">
                <img 
                  src="/images/logo/TechSyncLogo.png" 
                  alt="TechSync Logo" 
                  style={styles.logoImage}
                />
              </div>
            </div>
            <div style={styles.logoText}>TechSync</div>
            <div style={styles.logoTagline}>Code with PURPOSE, Learn with PRECISION</div>
          </div>
          
          <h2 style={{
            ...styles.title,
            marginBottom: '1rem'
          }}>
            <LogIn size={24} color="#60a5fa" />
            Sign In with TechSync
          </h2>
          
          {error && <div style={styles.error}>{error}</div>}
          {validationErrors.form && <div style={styles.error}>{validationErrors.form}</div>}
          
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={styles.label}>Username or Email</label>
              <input
                type="text"
                name="identifier"
                placeholder="Enter your username or email"
                value={formData.identifier}
                onChange={handleLoginChange}
                style={styles.input}
                className="login-input"
                required
              />
              <div style={styles.helpText}>
                You can use either your username or email to login
              </div>
            </div>
            
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  style={styles.passwordInput}
                  className="password-input"
                  required
                />
                <button
                  type="button"
                  style={styles.eyeToggle}
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
              {passwordError && (
                <div style={styles.passwordError}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {passwordError}
                </div>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="login-button"
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '-10px',
            marginBottom: '20px'
          }}>
            <Link 
              to="/forgot-password" 
              style={{
                fontSize: '14px',
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#764ba2'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              Forgot Password?
            </Link>
          </div>
          
          <div style={{
            ...styles.switchText,
            marginTop: '2rem'
          }}>
            Don't have an account?{' '}
            <span 
              style={styles.link}
              className="switch-link"
              onClick={() => setIsRegistering(true)}
            >
              Create one here
            </span>
          </div>
        </div>
      </div>
      </>
    );
  }

  // REGISTRATION FORM
  return (
    <div style={styles.pageContainer}>
      <style>{hoverStyles}</style>
      
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 50
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.875rem 1.75rem',
            background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.98))',
            backdropFilter: 'blur(24px)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            fontSize: '0.925rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(59, 130, 246, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            letterSpacing: '0.02em',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="enhanced-home-button"
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(147, 51, 234, 0.02))',
            borderRadius: '19px',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            zIndex: 1
          }} className="button-glow" />
          
          <div style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.08))',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} className="icon-container">
            <Home size={16} strokeWidth={2.5} style={{
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
          
          <span style={{
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }} className="button-text">
            Home
          </span>
        </button>
      </div>
      
      <IsolatedAnimatedBackground />

      <div style={{
        ...styles.container,
        padding: '1.5rem 1.75rem'
      }}>
        <div style={styles.logoSection} className="logo-section">
          <div 
            style={styles.logoIconWrapper}
            className="logo-icon-wrapper"
            onClick={() => navigate('/')}
            title="Go back to TechSync homepage"
          >
            <div style={styles.logoIcon} className="logo-icon">
              <img 
                src="/images/logo/TechSyncLogo.png" 
                alt="TechSync Logo" 
                style={styles.logoImage}
              />
            </div>
          </div>
          <div style={styles.logoText}>TechSync</div>
          <div style={styles.logoTagline}>Code with PURPOSE, Learn with PRECISION</div>
        </div>
        
        <h2 style={{
          ...styles.title,
          marginBottom: '1rem'
        }}>
          <UserPlus size={24} color="#60a5fa"/>
          Sign Up with TechSync
        </h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {validationErrors.form && <div style={styles.error}>{validationErrors.form}</div>}
        
        <form onSubmit={handleRegisterSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={registerData.username}
              onChange={handleRegisterChange}
              style={validationErrors.username ? styles.inputError : styles.input}
              className="login-input"
              required
            />
            {validationErrors.username && (
              <div style={styles.fieldError}>⚠️ {validationErrors.username}</div>
            )}
            {!validationErrors.username && registerData.username && (
              <div style={styles.successText}>✓ Username looks good</div>
            )}
            <div style={styles.helpText}>
              3-50 characters, letters, numbers, and underscores only
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="Enter Full Name"
              value={registerData.full_name}
              onChange={handleRegisterChange}
              style={validationErrors.full_name ? styles.inputError : styles.input}
              className="login-input"
              required
            />
            {validationErrors.full_name && (
              <div style={styles.fieldError}>⚠️ {validationErrors.full_name}</div>
            )}
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={registerData.email}
              onChange={handleRegisterChange}
              style={validationErrors.email ? styles.inputError : styles.input}
              className="login-input"
              required
            />
            {validationErrors.email && (
              <div style={styles.fieldError}>⚠️ {validationErrors.email}</div>
            )}
            {!validationErrors.email && registerData.email && (
              <div style={styles.successText}>✓ Email format is valid</div>
            )}
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showRegisterPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={registerData.password}
                onChange={handleRegisterChange}
                style={validationErrors.password ? styles.passwordInputError : styles.passwordInput}
                className="password-input"
                required
                minLength="8"
              />
              <button
                type="button"
                style={styles.eyeToggle}
                className="eye-toggle"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
              >
                {showRegisterPassword ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <div style={styles.fieldError}>⚠️ {validationErrors.password}</div>
            )}
            {!validationErrors.password && registerData.password && (
              <div style={styles.successText}>✓ Password meets requirements</div>
            )}
            <div style={styles.helpText}>
              At least 8 characters with uppercase, lowercase, and number
            </div>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={styles.label}>Re-enter Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showRegisterPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                style={validationErrors.confirmPassword ? styles.passwordInputError : styles.passwordInput}
                className="password-input"
                required
              />
              <button
                type="button"
                style={styles.eyeToggle}
                className="eye-toggle"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
              >
                {showRegisterPassword ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <div style={styles.fieldError}>⚠️ {validationErrors.confirmPassword}</div>
            )}
            {!validationErrors.confirmPassword && registerData.confirmPassword && registerData.password === registerData.confirmPassword && (
              <div style={styles.successText}>✓ Passwords match</div>
            )}
            <div style={styles.helpText}>
              Please re-enter your password to confirm
            </div>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={styles.label}>Short Bio (Optional)</label>
            <input
              type="text"
              name="bio"
              placeholder="Tell us a bit about yourself"
              value={registerData.bio}
              onChange={handleRegisterChange}
              style={styles.input}
              className="login-input"
            />
            <div style={styles.helpText}>
              Tell us a bit about yourself (optional)
            </div>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={styles.label}>GitHub Username (Optional)</label>
            <input
              type="text"
              name="github_username"
              placeholder="Your GitHub username"
              value={registerData.github_username}
              onChange={handleRegisterChange}
              style={validationErrors.github_username ? styles.inputError : styles.input}
              className="login-input"
            />
            {validationErrors.github_username && (
              <div style={styles.fieldError}>⚠️ {validationErrors.github_username}</div>
            )}
            {!validationErrors.github_username && registerData.github_username && registerData.github_username.trim() && (
              <div style={styles.successText}>✓ GitHub username looks good</div>
            )}
            <div style={styles.helpText}>
              Your GitHub username (optional)
            </div>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={styles.label}>LinkedIn URL (Optional)</label>
            <input
              type="url"
              name="linkedin_url"
              placeholder="https://linkedin.com/in/your-profile"
              value={registerData.linkedin_url}
              onChange={handleRegisterChange}
              style={validationErrors.linkedin_url ? styles.inputError : styles.input}
              className="login-input"
            />
            {validationErrors.linkedin_url && (
              <div style={styles.fieldError}>⚠️ {validationErrors.linkedin_url}</div>
            )}
            {!validationErrors.linkedin_url && registerData.linkedin_url && registerData.linkedin_url.trim() && (
              <div style={styles.successText}>✓ LinkedIn URL is valid</div>
            )}
            <div style={styles.helpText}>
              e.g., https://linkedin.com/in/your-profile (optional)
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading || !isFormValid}
            className="login-button"
            style={{
              ...styles.button,
              ...(loading || !isFormValid ? styles.buttonDisabled : {}),
              opacity: loading || !isFormValid ? 0.6 : 1
            }}
          >
            <UserPlus size={24}/>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div style={{
          ...styles.switchText,
          marginTop: '1.5rem'
        }}>
          Already have an account?{' '}
          <span 
            style={styles.link}
            className="switch-link"
            onClick={() => setIsRegistering(false)}
          >
            Login here
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;