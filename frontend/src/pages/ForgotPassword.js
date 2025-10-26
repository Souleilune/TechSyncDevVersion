// frontend/src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Home } from 'lucide-react';

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

const ForgotPassword = () => {
    const navigate = useNavigate();
    
    // STATE VARIABLES
    // email: stores the email address entered by the user
    const [email, setEmail] = useState('');
    // loading: indicates whether the form is currently being submitted
    const [loading, setLoading] = useState(false);
    // error: stores any error message to display to the user
    const [error, setError] = useState('');
    // success: indicates whether the password reset email was sent successfully
    const [success, setSuccess] = useState(false);

    // API_URL: the base URL for API requests, defaults to localhost if not set in environment
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    /**
     * handleSubmit: Handles the form submission for password reset request
     * @param {Event} e - The form submit event
     * This function sends a POST request to the backend to initiate password reset
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || 'Failed to send reset email');
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
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
        },
        // subtitle: Styling for the descriptive text below the title
        subtitle: {
            fontSize: '16px',
            color: '#9ca3af',
            marginBottom: '30px',
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
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(8px)'
        },
        // form: Container styling for the form element
        form: {
            marginBottom: '24px'
        },
        // inputGroup: Container for each form field (label + input)
        inputGroup: {
            marginBottom: '20px',
            textAlign: 'left'
        },
        // label: Styling for form field labels
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#e5e7eb',
            marginBottom: '8px'
        },
        // input: Styling for text input fields
        input: {
            width: '100%',
            padding: '0.875rem 1rem',
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
        // button: Styling for the submit button
        button: {
            width: '100%',
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(to right, #1f2937, #111827)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
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
        },
        // backLink: Styling for the "Back to Login" link
        backLink: {
            display: 'inline-flex',
            alignItems: 'center',
            color: '#60a5fa',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            marginTop: '1rem',
            justifyContent: 'center',
            width: '100%'
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

        .forgot-input:focus {
            outline: none !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
            background: rgba(55, 65, 81, 0.7) !important;
        }

        .forgot-button:hover:not(:disabled) {
            background: linear-gradient(to right, #374151, #1f2937) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        }

        .back-link:hover {
            color: #93c5fd !important;
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

    // SUCCESS SCREEN: Displayed after email is successfully sent
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
                    <h1 style={styles.title}>Check Your Email</h1>
                    <p style={styles.text}>
                        If an account exists with <strong>{email}</strong>, 
                        you'll receive password reset instructions shortly.
                    </p>
                    <p style={styles.textSmall}>
                        Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <Link to="/login" style={styles.backLink} className="back-link">
                        <ArrowLeft size={16} />
                        <span style={{ marginLeft: '8px' }}>Back to Login</span>
                    </Link>
                </div>
            </div>
        );
    }

    // MAIN FORM SCREEN: The initial forgot password form
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
                
                {/* Page title with mail icon */}
                <div style={styles.titleContainer}>
                    <Mail size={24} color="#60a5fa" />
                    <h1 style={styles.title}>Forgot Password?</h1>
                </div>
                
                <p style={styles.subtitle}>
                    No worries! Enter your email and we'll send you reset instructions.
                </p>

                {/* Error message display */}
                {error && (
                    <div style={styles.errorAlert}>
                        {error}
                    </div>
                )}

                {/* Password reset request form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            style={styles.input}
                            className="forgot-input"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="forgot-button"
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {})
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {/* Back to login link */}
                <Link to="/login" style={styles.backLink} className="back-link">
                    <ArrowLeft size={16} />
                    <span style={{ marginLeft: '8px' }}>Back to Login</span>
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;