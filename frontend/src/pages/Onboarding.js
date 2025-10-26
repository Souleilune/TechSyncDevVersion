// frontend/src/pages/Onboarding.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { onboardingService } from '../services/onboardingService';
import { ArrowLeft } from 'lucide-react';

// Isolated background styles - never changes
const backgroundStyles = {
  backgroundLayer: {
    position: 'fixed',
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
  }
};

// Completely isolated background component
const IsolatedAnimatedBackground = React.memo(() => (
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
));

function Onboarding() {
  const { user, token, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [programmingLanguages, setProgrammingLanguages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [yearsExperience, setYearsExperience] = useState(0);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        setError('');

        const [languagesResponse, topicsResponse] = await Promise.all([
          onboardingService.getProgrammingLanguages(),
          onboardingService.getTopics()
        ]);

        if (languagesResponse.success) {
          setProgrammingLanguages(languagesResponse.data);
        } else {
          throw new Error('Failed to load programming languages');
        }

        if (topicsResponse.success) {
          setTopics(topicsResponse.data);
        } else {
          throw new Error('Failed to load topics');
        }

      } catch (error) {
        console.error('Error loading onboarding data:', error);
        setError('Failed to load onboarding data. Please refresh the page.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleLanguageToggle = (language) => {
    const isSelected = selectedLanguages.find(l => l.language_id === language.id);
    
    if (isSelected) {
      setSelectedLanguages(selectedLanguages.filter(l => l.language_id !== language.id));
    } else {
      setSelectedLanguages([...selectedLanguages, {
        language_id: language.id,
        name: language.name,
        proficiency_level: 'intermediate'
      }]);
    }
  };

  const handleProficiencyChange = (languageId, level) => {
    setSelectedLanguages(selectedLanguages.map(lang => 
      lang.language_id === languageId 
        ? { ...lang, proficiency_level: level }
        : lang
    ));
  };

  const handleTopicToggle = (topic) => {
    const isSelected = selectedTopics.find(t => t.topic_id === topic.id);
    
    if (isSelected) {
      setSelectedTopics(selectedTopics.filter(t => t.topic_id !== topic.id));
    } else {
      setSelectedTopics([...selectedTopics, {
        topic_id: topic.id,
        name: topic.name,
        interest_level: 'high',
        experience_level: 'intermediate'
      }]);
    }
  };

  const handleInterestChange = (topicId, level) => {
    setSelectedTopics(selectedTopics.map(topic => 
      topic.topic_id === topicId 
        ? { ...topic, interest_level: level }
        : topic
    ));
  };

  const handleTopicExperienceChange = (topicId, level) => {
    setSelectedTopics(selectedTopics.map(topic => 
      topic.topic_id === topicId 
        ? { ...topic, experience_level: level }
        : topic
    ));
  };

  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      if (selectedLanguages.length === 0) {
        setError('Please select at least one programming language.');
        return;
      }

      if (selectedTopics.length === 0) {
        setError('Please select at least one topic of interest.');
        return;
      }

      const result = await onboardingService.completeOnboarding({
        languages: selectedLanguages,
        topics: selectedTopics,
        years_experience: yearsExperience
      }, token);

      if (result.success) {
        setSuccessMessage('Onboarding completed successfully!');
        
        if (result.data?.user) {
          await updateUser(result.data.user, true);
        } else {
          await refreshUser();
        }
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        const errorMsg = result.message || 'Failed to complete onboarding. Please try again.';
        setError(errorMsg);
      }

    } catch (error) {
      const errorMessage = error.message || 'Failed to complete onboarding. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      justifyContent: 'center'
    },
    container: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '800px',
      width: '100%',
      padding: '0.5rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.75rem',
      letterSpacing: '-0.025em'
    },
    subtitle: {
      fontSize: '1.125rem',
      color: '#9ca3af',
      marginBottom: '1.5rem',
      fontWeight: '400'
    },
    stepContainer: {
      marginBottom: '2rem',
      textAlign: 'center'
    },
    stepTitle: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      lineHeight: '1.2'
    },
    stepSubtitle: {
      fontSize: '1rem',
      color: '#9ca3af',
      marginBottom: '2rem'
    },
    buttonGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '0.6rem',
      marginBottom: '1.5rem',
      width: '100%',
      margin: '0 auto 1.5rem auto'
    },
    pillButton: {
      padding: '0.7rem 1.2rem',
      border: 'none',
      borderRadius: '50px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.85rem',
      fontWeight: '600',
      textAlign: 'center',
      flex: '0 0 auto',
      whiteSpace: 'nowrap'
    },
    selectedPillButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      transform: 'scale(1.05)'
    },
    proficiencyContainer: {
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      maxWidth: '600px',
      margin: '2rem auto 0 auto'
    },
    proficiencyTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    languageItem: {
      marginBottom: '1.25rem',
      padding: '1.25rem',
      backgroundColor: 'rgba(55, 65, 81, 0.3)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    languageName: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.75rem'
    },
    radioGroup: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      color: '#e5e7eb',
      fontSize: '0.95rem',
      fontWeight: '500'
    },
    radioInput: {
      width: '18px',
      height: '18px',
      accentColor: '#3b82f6'
    },
    topicSectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#e5e7eb',
      marginBottom: '0.75rem'
    },
    experienceTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem',
      lineHeight: '1.1'
    },
    experienceSubtitle: {
      fontSize: '0.95rem',
      color: '#9ca3af',
      marginBottom: '1rem'
    },
    experienceInputContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    },
    experienceInput: {
      fontSize: '1.25rem',
      padding: '0.75rem 1.25rem',
      background: 'rgba(26, 28, 32, 0.8)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      textAlign: 'center',
      width: '200px',
      color: 'white',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
    },
    experienceText: {
      fontSize: '0.9rem',
      color: '#9ca3af',
      fontWeight: '500'
    },
    navigationButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginTop: '1.5rem'
    },
    navButton: {
      padding: '1rem 3rem',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      fontSize: '1.125rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      minWidth: '150px'
    },
    primaryButton: {
      backgroundColor: '#22c55e',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    buttonDisabled: {
      backgroundColor: 'rgba(107, 114, 128, 0.5)',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    error: {
      color: '#ef4444',
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '1rem 2rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '20px',
      fontSize: '1rem',
      fontWeight: '500',
      maxWidth: '600px',
      margin: '0 auto 2rem auto'
    },
    success: {
      color: '#22c55e',
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '1rem 2rem',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      borderRadius: '20px',
      fontSize: '1rem',
      fontWeight: '500',
      maxWidth: '600px',
      margin: '0 auto 2rem auto'
    },
    reviewSection: {
      maxWidth: '600px',
      margin: '0 auto'
    },
    reviewContainer: {
      padding: '2rem',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.9), rgba(55, 65, 81, 0.3))'
    },
    reviewItem: {
      marginBottom: '2rem',
      position: 'relative'
    },
    reviewTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      paddingBottom: '0.75rem',
      borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    reviewIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white'
    },
    reviewList: {
      color: '#e5e7eb',
      display: 'grid',
      gap: '0.75rem'
    },
    reviewListItem: {
      fontSize: '0.95rem',
      padding: '0.75rem 1rem',
      background: 'rgba(55, 65, 81, 0.3)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    reviewListItemIcon: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: '#60a5fa',
      flexShrink: 0
    }
  }), []);

  const hoverStyles = `
    /* GLOBAL SYNCHRONIZED LOGO ROTATION */
    @keyframes globalLogoRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .global-loading-spinner {
      animation: globalLogoRotate 2s linear infinite;
    }

    /* FLOATING BACKGROUND SYMBOLS */
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

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes slideProgress {
      0% { transform: translateX(-100px); }
      50% { transform: translateX(140px); }
      100% { transform: translateX(-100px); }
    }
    
    .loading-text {
      animation: pulse 1.5s ease-in-out infinite;
    }

    .pill-button:hover:not(.selected) {
      background-color: rgba(255, 255, 255, 0.8) !important;
      transform: translateY(-2px) !important;
    }
    
    .pill-button.selected:hover {
      background-color: #2563eb !important;
      transform: scale(1.05) translateY(-2px) !important;
    }
    
    .nav-button:hover:not(:disabled) {
      transform: translateY(-2px) !important;
    }
    
    .primary-button:hover:not(:disabled) {
      background-color: #16a34a !important;
    }
    
    .secondary-button:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.2) !important;
    }
    
    .back-button:hover {
      background: rgba(15, 17, 22, 1) !important;
      border-color: rgba(59, 130, 246, 0.6) !important;
      color: #ffffff !important;
      transform: translateY(-3px) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.3) !important;
    }
    
    .experience-input:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
  `;

  if (initialLoading) {
    return (
      <div style={styles.pageContainer}>
        <style>{hoverStyles}</style>
        <IsolatedAnimatedBackground />
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} className="global-loading-spinner">
              <img 
                src="/images/logo/TechSyncLogo.png" 
                alt="TechSync Logo" 
                style={{
                  width: '125%',
                  height: '125%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <span style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              letterSpacing: '-0.025em'
            }}>TechSync</span>
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            color: '#d1d5db',
            margin: '0 0 1rem 0'
          }} className="loading-text">
            Loading onboarding...
          </h2>

          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '60px',
              height: '100%',
              backgroundColor: '#60a5fa',
              borderRadius: '2px',
              animation: 'slideProgress 1.5s ease-in-out infinite',
              background: 'linear-gradient(to right, #60a5fa, #3b82f6)'
            }} />
          </div>
        </div>
      </div>
    );
  }

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
          onClick={() => {
            if (window.confirm('This will log you out. Are you sure you want to go back to login?')) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
          }}
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(15, 17, 22, 0.95)',
            backdropFilter: 'blur(24px)',
            color: '#e5e7eb',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            letterSpacing: '0.025em'
          }}
          className="back-button"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Back to Login
        </button>
      </div>
      
      <IsolatedAnimatedBackground />

      <div style={styles.container}>
        {currentStep === 1 && (
          <div style={styles.header}>
            <h1 style={styles.title}>Welcome to TechSync, {user?.full_name}!</h1>
            <p style={styles.subtitle}>Let's get to know you better to provide the best experience</p>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        {currentStep === 1 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>What Programming Languages are you most skilled at?</h2>
            <p style={styles.stepSubtitle}>Choose three or more</p>
            
            <div style={styles.buttonGrid}>
              {programmingLanguages.map(language => {
                const isSelected = selectedLanguages.find(l => l.language_id === language.id);
                return (
                  <button
                    key={language.id}
                    onClick={() => handleLanguageToggle(language)}
                    className={`pill-button ${isSelected ? 'selected' : ''}`}
                    style={{
                      ...styles.pillButton,
                      ...(isSelected ? styles.selectedPillButton : {})
                    }}
                  >
                    {language.name}
                  </button>
                );
              })}
            </div>

            {selectedLanguages.length > 0 && (
              <div style={styles.proficiencyContainer}>
                <h3 style={styles.proficiencyTitle}>Set your proficiency level</h3>
                {selectedLanguages.map(lang => (
                  <div key={lang.language_id} style={styles.languageItem}>
                    <div style={styles.languageName}>{lang.name}</div>
                    <div style={styles.radioGroup}>
                      {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
                        <label key={level} style={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`proficiency-${lang.language_id}`}
                            value={level}
                            checked={lang.proficiency_level === level}
                            onChange={() => handleProficiencyChange(lang.language_id, level)}
                            style={styles.radioInput}
                          />
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>What topics are you most interested in?</h2>
            <p style={styles.stepSubtitle}>Choose three or more</p>
            
            <div style={styles.buttonGrid}>
              {topics.map(topic => {
                const isSelected = selectedTopics.find(t => t.topic_id === topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic)}
                    className={`pill-button ${isSelected ? 'selected' : ''}`}
                    style={{
                      ...styles.pillButton,
                      ...(isSelected ? styles.selectedPillButton : {})
                    }}
                  >
                    {topic.name}
                  </button>
                );
              })}
            </div>

            {selectedTopics.length > 0 && (
              <div style={styles.proficiencyContainer}>
                <h3 style={styles.proficiencyTitle}>Customize your selections</h3>
                {selectedTopics.map(topic => (
                  <div key={topic.topic_id} style={styles.languageItem}>
                    <div style={styles.languageName}>{topic.name}</div>
                    
                    <div style={{marginBottom: '1rem'}}>
                      <div style={{...styles.topicSectionTitle, textAlign: 'center', marginBottom: '0.5rem'}}>Interest Level:</div>
                      <div style={styles.radioGroup}>
                        {['low', 'medium', 'high'].map(level => (
                          <label key={level} style={styles.radioLabel}>
                            <input
                              type="radio"
                              name={`interest-${topic.topic_id}`}
                              value={level}
                              checked={topic.interest_level === level}
                              onChange={() => handleInterestChange(topic.topic_id, level)}
                              style={styles.radioInput}
                            />
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{...styles.topicSectionTitle, textAlign: 'center', marginBottom: '0.5rem'}}>Experience:</div>
                      <div style={styles.radioGroup}>
                        {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
                          <label key={level} style={styles.radioLabel}>
                            <input
                              type="radio"
                              name={`experience-${topic.topic_id}`}
                              value={level}
                              checked={topic.experience_level === level}
                              onChange={() => handleTopicExperienceChange(topic.topic_id, level)}
                              style={styles.radioInput}
                            />
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.experienceTitle}>Enter your years of programming experience.</h2>
            <p style={styles.experienceSubtitle}>We need a little more information to find suitable projects for you.</p>
            
            <div style={styles.experienceInputContainer}>
              <input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                style={styles.experienceInput}
                className="experience-input"
              />
              <p style={styles.experienceText}>
                {yearsExperience === 0 ? 'Just getting started' : 
                 yearsExperience === 1 ? '1 year of experience' : 
                 `${yearsExperience} years of experience`}
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>Review Your Information</h2>
            
            <div style={styles.reviewSection}>
              <div style={styles.reviewContainer}>
                <div style={styles.reviewItem}>
                  <div style={styles.reviewTitle}>
                    <div style={styles.reviewIcon}>💻</div>
                    Programming Languages ({selectedLanguages.length})
                  </div>
                  <div style={styles.reviewList}>
                    {selectedLanguages.map(lang => (
                      <div key={lang.language_id} style={styles.reviewListItem}>
                        <div style={styles.reviewListItemIcon}></div>
                        <strong>{lang.name}</strong> - {lang.proficiency_level.charAt(0).toUpperCase() + lang.proficiency_level.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.reviewItem}>
                  <div style={styles.reviewTitle}>
                    <div style={styles.reviewIcon}>🎯</div>
                    Topics of Interest ({selectedTopics.length})
                  </div>
                  <div style={styles.reviewList}>
                    {selectedTopics.map(topic => (
                      <div key={topic.topic_id} style={styles.reviewListItem}>
                        <div style={styles.reviewListItemIcon}></div>
                        <strong>{topic.name}</strong> - Interest: {topic.interest_level.charAt(0).toUpperCase() + topic.interest_level.slice(1)}, Experience: {topic.experience_level.charAt(0).toUpperCase() + topic.experience_level.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.reviewItem}>
                  <div style={styles.reviewTitle}>
                    <div style={styles.reviewIcon}>⏱️</div>
                    Years of Experience
                  </div>
                  <div style={styles.reviewList}>
                    <div style={styles.reviewListItem}>
                      <div style={styles.reviewListItemIcon}></div>
                      {yearsExperience} {yearsExperience === 1 ? 'year' : 'years'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.navigationButtons}>
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="nav-button secondary-button"
              style={{
                ...styles.navButton,
                ...styles.secondaryButton
              }}
            >
              Previous
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={() => {
                if (currentStep === 1 && selectedLanguages.length < 3) {
                  setError('Please select at least 3 programming languages.');
                  return;
                }
                if (currentStep === 2 && selectedTopics.length === 0) {
                  setError('Please select at least one topic.');
                  return;
                }
                setError('');
                setCurrentStep(currentStep + 1);
              }}
              className="nav-button primary-button"
              style={{
                ...styles.navButton,
                ...styles.primaryButton
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleCompleteOnboarding}
              disabled={loading}
              className="nav-button primary-button"
              style={{
                ...styles.navButton,
                ...styles.primaryButton,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Completing...' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;