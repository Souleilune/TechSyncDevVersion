// Save as: frontend/src/pages/ResetPassword.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, Home } from 'lucide-react';

// Background styles - these define how the animated background looks
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

// Isolated animated background component - displays floating code symbols
const IsolatedAnimatedBackground = React.memo(() => (
  <>
    {/* SVG Pattern for background waves */}
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

    {/* Animated Code Symbols */}
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

const ResetPassword = () => {
    // useSearchParams: React Router hook to access URL query parameters
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // token: The password reset token from the URL
    const token = searchParams.get('token');

    // STATE VARIABLES
    // formData: stores the new password and confirmation password
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    // showPassword: controls visibility of the new password field
    const [showPassword, setShowPassword] = useState(false);
    // showConfirmPassword: controls visibility of the confirm password field
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // loading: indicates whether the form is currently being submitted
    const [loading, setLoading] = useState(false);
    // error: stores any error message to display to the user
    const [error, setError] = useState('');
    // success: indicates whether the password was successfully reset
    const [success, setSuccess] = useState(false);

    // API_URL: the base URL for API requests, defaults to localhost if not set in environment
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    /**
     * useEffect: Validates that a reset token is present in the URL
     * If no token is found, displays an error message
     */
    useEffect(() => {
        if (!token) {
            setError('Invalid reset link');
        }
    }, [token]);

    /**
     * validatePassword: Validates password strength requirements
     * @param {string} password - The password to validate
     * @returns {string|null} - Error message if invalid, null if valid
     */
    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return 'Password must contain uppercase, lowercase, and number';
        }
        return null;
    };

    /**
     * handleSubmit: Handles the form submission for password reset
     * @param {Event} e - The form submit event
     * This function validates the passwords and sends a POST request to reset the password
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // STYLES OBJECT: Contains all inline styles for the component
    const styles = {
        // pageContainer: The outermost container that fills the entire viewport
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
        // container: The main form container with glassmorphism effect
        container: {
            position: 'relative',
            zIndex: 10,
            maxWidth: '380px',
            width: '100%',
            background: 'linear-gradient(135deg, rgba(42, 46, 57, 0.95) 0%, rgba(28, 31, 38, 0.98) 50%, rgba(20, 22, 28, 1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            padding: '1.5rem 2rem 2rem'
        },
        // logoSection: Container for the logo, brand name, and tagline
        logoSection: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: '12px',
            marginBottom: '1rem'
        },
        // logoIconWrapper: Wrapper for the logo icon with hover effects
        logoIconWrapper: {
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '0.5rem',
            borderRadius: '12px',
            marginBottom: '0.25rem'
        },
        // logoIcon: Container for the actual logo image
        logoIcon: {
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s ease',
            marginBottom: '0.25rem'
        },
        // logoImage: Styling for the logo image element
        logoImage: {
            width: '100%',
            height: '100%',
            objectFit: 'contain'
        },
        // logoText: Styling for the "TechSync" brand text
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
        // logoTagline: Styling for the tagline text below the brand name
        logoTagline: {
            fontSize: '8px',
            color: '#6b7280',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginTop: '0.25rem',
            fontWeight: '400'
        },
        // titleContainer: Container for the page title and icon
        titleContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '12px'
        },
        // successIcon: Container for the success checkmark icon
        successIcon: {
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center'
        },
        // title: Styling for the main heading text
        title: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
        },
        // subtitle: Styling for the descriptive text below the title
        subtitle: {
            fontSize: '14px',
            color: '#9ca3af',
            marginBottom: '20px',
            textAlign: 'center',
            lineHeight: '1.5'
        },
        // text: General text styling for body content
        text: {
            fontSize: '16px',
            color: '#9ca3af',
            marginBottom: '16px',
            lineHeight: '1.6',
            textAlign: 'center'
        },
        // textSmall: Styling for smaller secondary text
        textSmall: {
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '24px',
            textAlign: 'center'
        },
        // errorAlert: Styling for error message boxes
        errorAlert: {
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '10px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '13px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(8px)'
        },
        // form: Container styling for the form element
        form: {
            marginBottom: '16px'
        },
        // inputGroup: Container for each form field (label + input)
        inputGroup: {
            marginBottom: '14px',
            textAlign: 'left'
        },
        // label: Styling for form field labels
        label: {
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#e5e7eb',
            marginBottom: '6px'
        },
        // passwordContainer: Container for password input with eye toggle button
        passwordContainer: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        // input: Styling for password input fields
        input: {
            width: '100%',
            padding: '0.875rem 2.5rem 0.875rem 1rem',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '10px',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            background: 'rgba(55, 65, 81, 0.5)',
            color: 'white',
            backdropFilter: 'blur(8px)'
        },
        // eyeButton: Styling for the eye icon button to toggle password visibility
        eyeButton: {
            position: 'absolute',
            right: '12px',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.3s ease'
        },
        // requirements: Container for password requirements list
        requirements: {
            background: 'rgba(55, 65, 81, 0.3)',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '14px',
            textAlign: 'left',
            border: '1px solid rgba(75, 85, 99, 0.3)'
        },
        // requirementsTitle: Title for the requirements section
        requirementsTitle: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#9ca3af',
            marginBottom: '6px'
        },
        // requirementsList: Unordered list for password requirements
        requirementsList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        // button: Styling for the submit button
        button: {
            width: '100%',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(to right, #1f2937, #111827)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '0.025em'
        },
        // buttonDisabled: Styling for the button when it's disabled (during loading)
        buttonDisabled: {
            background: 'rgba(107, 114, 128, 0.5)',
            cursor: 'not-allowed',
            opacity: 0.6
        }
    };

    // hoverStyles: CSS animations and hover effects injected as a style tag
    const hoverStyles = `
        body {
            overflow: hidden !important;
            margin: 0;
            padding: 0;
        }

        @keyframes floatAround1 {
            0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
            25% { transform: translate(30px, -20px) rotate(-5deg); }
            50% { transform: translate(-15px, 25px) rotate(-15deg); }
            75% { transform: translate(20px, 10px) rotate(-8deg); }
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
            50% { transform: translate(15px, -25px) rotate(10deg); }
            75% { transform: translate(-15px, 10px) rotate(18deg); }
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

        .reset-input:focus {
            outline: none !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            background: rgba(55, 65, 81, 0.7) !important;
        }

        .reset-button:hover:not(:disabled) {
            background: linear-gradient(to right, #374151, #1f2937) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        }

        .eye-toggle:hover {
            color: #d1d5db !important;
        }

        .logo-section:hover {
            background: transparent !important;
            transform: none !important;
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

    // SUCCESS SCREEN: Displayed after password is successfully reset
    if (success) {
        return (
            <div style={styles.pageContainer}>
                <style>{hoverStyles}</style>
                
                {/* Home button in the top-left corner */}
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

                <div style={styles.container}>
                    <div style={styles.successIcon}>
                        <CheckCircle size={64} color="#10b981" />
                    </div>
                    <h1 style={styles.title}>Password Reset Successful!</h1>
                    <p style={styles.text}>
                        Your password has been successfully reset.
                    </p>
                    <p style={styles.textSmall}>
                        Redirecting to login page...
                    </p>
                </div>
            </div>
        );
    }

    // MAIN FORM SCREEN: The password reset form
    return (
        <div style={styles.pageContainer}>
            <style>{hoverStyles}</style>
            
            {/* Home button in the top-left corner */}
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

            <div style={styles.container}>
                {/* Logo section with TechSync branding */}
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
                
                {/* Page title with lock icon */}
                <div style={styles.titleContainer}>
                    <Lock size={24} color="#60a5fa" />
                    <h1 style={styles.title}>Reset Password</h1>
                </div>
                
                <p style={styles.subtitle}>
                    Enter your new password below
                </p>

                {/* Error message display */}
                {error && (
                    <div style={styles.errorAlert}>
                        {error}
                    </div>
                )}

                {/* Password reset form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* New password field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <div style={styles.passwordContainer}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    newPassword: e.target.value
                                })}
                                placeholder="Enter new password"
                                required
                                style={styles.input}
                                className="reset-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                                className="eye-toggle"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm password field */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <div style={styles.passwordContainer}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value
                                })}
                                placeholder="Confirm new password"
                                required
                                style={styles.input}
                                className="reset-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                                className="eye-toggle"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                            <div style={{
                                color: '#ef4444',
                                fontSize: '12px',
                                marginTop: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                ⚠️ Passwords do not match
                            </div>
                        )}
                    </div>

                    {/* Password requirements checklist */}
                    <div style={styles.requirements}>
                        <p style={styles.requirementsTitle}>Password must contain:</p>
                        <ul style={styles.requirementsList}>
                            <li style={{
                                color: formData.newPassword.length >= 8 ? '#10b981' : '#6b7280',
                                fontSize: '13px',
                                marginBottom: '3px'
                            }}>
                                ✓ At least 8 characters
                            </li>
                            <li style={{
                                color: /[A-Z]/.test(formData.newPassword) ? '#10b981' : '#6b7280',
                                fontSize: '13px',
                                marginBottom: '3px'
                            }}>
                                ✓ One uppercase letter
                            </li>
                            <li style={{
                                color: /[a-z]/.test(formData.newPassword) ? '#10b981' : '#6b7280',
                                fontSize: '13px',
                                marginBottom: '3px'
                            }}>
                                ✓ One lowercase letter
                            </li>
                            <li style={{
                                color: /\d/.test(formData.newPassword) ? '#10b981' : '#6b7280',
                                fontSize: '13px'
                            }}>
                                ✓ One number
                            </li>
                        </ul>
                    </div>

                    {/* Submit button */}
                    <button 
                        type="submit" 
                        disabled={loading || !token || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)}
                        className="reset-button"
                        style={{
                            ...styles.button,
                            ...((loading || !token || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword || formData.newPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) ? styles.buttonDisabled : {})
                        }}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;