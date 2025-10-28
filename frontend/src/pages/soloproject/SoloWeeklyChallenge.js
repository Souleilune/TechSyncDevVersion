// frontend/src/pages/soloproject/SoloWeeklyChallenge.js - ALIGNED WITH PROJECT INFO THEME
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Target, 
  Calendar, 
  Clock, 
  Zap, 
  Trophy, 
  Code2, 
  Play, 
  CheckCircle, 
  XCircle,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  FileCode,
  Monitor,
  Award,
  History,
  PanelLeft
} from 'lucide-react';
import ChallengeAPI from '../../services/challengeAPI';
import SoloProjectService from '../../services/soloProjectService';

// Background symbols component - WITH FLOATING ANIMATIONS
const BackgroundSymbols = () => (
  <>
    {/* Floating Animation CSS */}
    <style>
       {`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 12px 32px rgba(16, 185, 129, 0.6);
      }
    }
  `}
      {`
        @keyframes floatAround1 {
          0%, 100% { transform: translate(0, 0) rotate(-15deg); }
          25% { transform: translate(20px, -15px) rotate(-10deg); }
          50% { transform: translate(-10px, 20px) rotate(-20deg); }
          75% { transform: translate(15px, 5px) rotate(-12deg); }
        }
        @keyframes floatAround2 {
          0%, 100% { transform: translate(0, 0) rotate(20deg); }
          33% { transform: translate(-20px, 10px) rotate(25deg); }
          66% { transform: translate(25px, -8px) rotate(15deg); }
        }
        @keyframes floatAround3 {
          0%, 100% { transform: translate(0, 0) rotate(-25deg); }
          20% { transform: translate(-15px, -20px) rotate(-20deg); }
          40% { transform: translate(20px, 15px) rotate(-30deg); }
          60% { transform: translate(-8px, -10px) rotate(-22deg); }
          80% { transform: translate(12px, 18px) rotate(-28deg); }
        }
        @keyframes floatAround4 {
          0%, 100% { transform: translate(0, 0) rotate(30deg); }
          50% { transform: translate(-30px, 25px) rotate(35deg); }
        }
        @keyframes floatAround5 {
          0%, 100% { transform: translate(0, 0) rotate(-10deg); }
          25% { transform: translate(15px, -20px) rotate(-5deg); }
          50% { transform: translate(-25px, 15px) rotate(-15deg); }
          75% { transform: translate(20px, 10px) rotate(-8deg); }
        }
        @keyframes floatAround6 {
          0%, 100% { transform: translate(0, 0) rotate(15deg); }
          33% { transform: translate(-12px, -15px) rotate(20deg); }
          66% { transform: translate(25px, 20px) rotate(10deg); }
        }
        @keyframes driftSlow {
          0%, 100% { transform: translate(0, 0) rotate(35deg); }
          25% { transform: translate(-25px, 15px) rotate(40deg); }
          50% { transform: translate(15px, -25px) rotate(30deg); }
          75% { transform: translate(-8px, 30px) rotate(38deg); }
        }
        @keyframes gentleDrift {
          0%, 100% { transform: translate(0, 0) rotate(-20deg); }
          50% { transform: translate(20px, -30px) rotate(-15deg); }
        }
        @keyframes floatExtra1 {
          0%, 100% { transform: translate(0, 0) rotate(18deg); }
          33% { transform: translate(-18px, 20px) rotate(23deg); }
          66% { transform: translate(22px, -15px) rotate(13deg); }
        }
        @keyframes floatExtra2 {
          0%, 100% { transform: translate(0, 0) rotate(-37deg); }
          25% { transform: translate(25px, 18px) rotate(-32deg); }
          50% { transform: translate(-20px, -22px) rotate(-42deg); }
          75% { transform: translate(15px, -10px) rotate(-35deg); }
        }
        @keyframes floatExtra3 {
          0%, 100% { transform: translate(0, 0) rotate(28deg); }
          50% { transform: translate(-28px, 30px) rotate(33deg); }
        }
        @keyframes floatExtra4 {
          0%, 100% { transform: translate(0, 0) rotate(24deg); }
          40% { transform: translate(20px, -25px) rotate(29deg); }
          80% { transform: translate(-15px, 20px) rotate(19deg); }
        }
        @keyframes floatExtra5 {
          0%, 100% { transform: translate(0, 0) rotate(25deg); }
          35% { transform: translate(-22px, -18px) rotate(30deg); }
          70% { transform: translate(18px, 25px) rotate(20deg); }
        }
        @keyframes floatExtra6 {
          0%, 100% { transform: translate(0, 0) rotate(-19deg); }
          50% { transform: translate(25px, -20px) rotate(-14deg); }
        }
        @keyframes globalLogoRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .global-loading-spinner {
          animation: globalLogoRotate 2s linear infinite;
        }
        .floating-symbol {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        .floating-symbol:nth-child(1) { animation: floatAround1 12s infinite; }
        .floating-symbol:nth-child(2) { animation: floatAround2 15s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(3) { animation: floatAround3 10s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(4) { animation: floatAround4 18s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(5) { animation: floatAround5 14s infinite; animation-delay: -1s; }
        .floating-symbol:nth-child(6) { animation: floatAround6 11s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(7) { animation: driftSlow 20s infinite; animation-delay: -8s; }
        .floating-symbol:nth-child(8) { animation: gentleDrift 16s infinite; animation-delay: -3s; }
        .floating-symbol:nth-child(9) { animation: floatExtra1 13s infinite; animation-delay: -7s; }
        .floating-symbol:nth-child(10) { animation: floatExtra2 17s infinite; animation-delay: -9s; }
        .floating-symbol:nth-child(11) { animation: floatExtra3 14s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(12) { animation: floatExtra4 19s infinite; animation-delay: -10s; }
        .floating-symbol:nth-child(13) { animation: floatExtra5 11s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(14) { animation: floatExtra6 15s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(15) { animation: floatAround1 13s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(16) { animation: floatAround2 16s infinite; animation-delay: -8s; }
      `}
    </style>
    
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      pointerEvents: 'none'
    }}>
      {[
        { left: '52.81%', top: '48.12%', color: '#2E3344', rotate: '-10.79deg' },
        { left: '28.19%', top: '71.22%', color: '#292A2E', rotate: '-37.99deg' },
        { left: '95.09%', top: '48.12%', color: '#ABB5CE', rotate: '34.77deg' },
        { left: '86.46%', top: '15.33%', color: '#2E3344', rotate: '28.16deg' },
        { left: '7.11%', top: '80.91%', color: '#ABB5CE', rotate: '24.5deg' },
        { left: '48.06%', top: '8.5%', color: '#ABB5CE', rotate: '25.29deg' },
        { left: '72.84%', top: '4.42%', color: '#2E3344', rotate: '-19.68deg' },
        { left: '9.6%', top: '0%', color: '#1F232E', rotate: '-6.83deg' },
        { left: '31.54%', top: '54.31%', color: '#6C758E', rotate: '25.29deg' },
        { left: '25.28%', top: '15.89%', color: '#1F232E', rotate: '-6.83deg' },
        { left: '48.55%', top: '82.45%', color: '#292A2E', rotate: '-10.79deg' },
        { left: '24.41%', top: '92.02%', color: '#2E3344', rotate: '18.2deg' },
        { left: '0%', top: '12.8%', color: '#ABB5CE', rotate: '37.85deg' },
        { left: '81.02%', top: '94.27%', color: '#6C758E', rotate: '-37.99deg' },
        { left: '96.02%', top: '0%', color: '#2E3344', rotate: '-37.99deg' },
        { left: '0.07%', top: '41.2%', color: '#6C758E', rotate: '-10.79deg' }
      ].map((pos, i) => (
        <div key={i} className="floating-symbol" style={{
          position: 'absolute',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontStyle: 'normal',
          fontWeight: 900,
          fontSize: '24px',
          lineHeight: '29px',
          userSelect: 'none',
          pointerEvents: 'none',
          left: pos.left,
          top: pos.top,
          color: pos.color,
          transform: `rotate(${pos.rotate})`
        }}>&#60;/&#62;</div>
      ))}
    </div>
  </>
);

function SoloWeeklyChallenge() {
  const { projectId } = useParams();

  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmission, setShowSubmission] = useState(false);
  const [submission, setSubmission] = useState({
    code: '',
    description: '',
    language: 'javascript'
  });
  const [submitting, setSubmitting] = useState(false);
  const [pastChallenges, setPastChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [error, setError] = useState(null);

  const [languageId, setLanguageId] = useState(null);
  const [languageName, setLanguageName] = useState('');

// NEW STATE: Track sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('soloProjectSidebarCollapsed');
    return saved === 'true';
  });

  // NEW: Function to toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('soloProjectSidebarCollapsed', newCollapsedState.toString());
    
    window.dispatchEvent(new CustomEvent('soloProjectSidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  // NEW: Sync with sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('soloProjectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('soloProjectSidebarToggle', handleSidebarToggle);
  }, []);

  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };
  
  // Helpers
  const mapDifficultyToPoints = (level) => {
    const lv = String(level || '').toLowerCase();
    if (lv === 'easy') return 100;
    if (lv === 'medium') return 150;
    if (lv === 'hard') return 250;
    if (lv === 'expert') return 350;
    return 150;
  };

  const examplesFromTestCases = (testCases) => {
    if (!Array.isArray(testCases)) return [];
    return testCases.slice(0, 3).map((tc, idx) => ({
      input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
      output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
      explanation: tc.explanation || `Example ${idx + 1}`
    }));
  };

  const formatChallengeForUI = (ch) => {
    const examples = examplesFromTestCases(ch?.test_cases);
    const category = 'algorithms';

    return {
      id: ch.id,
      title: ch.title,
      description: ch.description,
      difficulty: ch.difficulty_level || 'medium',
      points: mapDifficultyToPoints(ch.difficulty_level),
      timeLimit: ch.time_limit_minutes ? `${ch.time_limit_minutes} minutes` : '30 minutes',
      category,
      requirements: [
        'Write clean, readable code with comments',
        'Pass all provided test cases',
        ch.time_limit_minutes ? `Complete within ${ch.time_limit_minutes} minutes` : 'Manage time efficiently'
      ],
      examples: examples.length
        ? examples
        : [
            {
              input: 'Input will be provided',
              output: 'Expected output format',
              explanation: 'Example will be provided when you start'
            }
          ],
      startedAt: new Date(),
      endsAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
    };
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Loading weekly challenge for project:', projectId);

        // 1) Get project language information
        const dashboardRes = await SoloProjectService.getDashboardData(projectId);
        const dashboardData = dashboardRes?.data || {};
        
        const langId = dashboardData.project?.programming_language_id;
        const langName = dashboardData.project?.programming_language?.name;

        console.log('Project language info:', { langId, langName });

        if (!langId) {
          if (isMounted) {
            setError('Project programming language not found. Please set up your project language first.');
            setLoading(false);
          }
          return;
        }

        if (!isMounted) return;
        setLanguageId(langId);
        setLanguageName(langName || '');

        // 2) Use the BETTER approach: Get challenges by language specifically
        const challengesRes = await ChallengeAPI.getChallengesByLanguage(langId, {
          project_id: projectId,
          page: 1,
          limit: 20
        });

        const allChallenges = challengesRes?.data?.challenges || [];
        console.log('Found challenges for language:', allChallenges.length);

        // 3) Get user attempts - FIXED: Filter by project_id
        const attemptsRes = await ChallengeAPI.getUserAttempts({ page: 1, limit: 50 });
        const allAttempts = attemptsRes?.data?.data?.attempts || attemptsRes?.data?.attempts || [];
        
        // ✅ CRITICAL FIX: Filter attempts to only include those for THIS project
        const attempts = allAttempts.filter(a => a.project_id === projectId);
        
        console.log('Total attempts:', allAttempts.length, 'Attempts for this project:', attempts.length);

        // Filter out challenges attempted in the last 14 days FOR THIS PROJECT
        // ✅ CRITICAL FIX: Check if user already attempted ANY challenge THIS WEEK
        const startOfWeek = getStartOfWeek();
        console.log('Start of current week:', startOfWeek.toISOString());

        const attemptsThisWeek = attempts.filter(a => {
          const attemptDate = new Date(a.submitted_at || a.started_at || 0);
          return attemptDate >= startOfWeek;
        });

        console.log('Attempts this week:', attemptsThisWeek.length);

        // ✅ If user already attempted a challenge this week, show message
        if (attemptsThisWeek.length > 0 && isMounted) {
          const lastAttempt = attemptsThisWeek[0];
          const challengeDetail = allChallenges.find(ch => ch.id === lastAttempt.challenge_id);
          
          // Calculate days until next Monday
          const now = new Date();
          const nextMonday = new Date(startOfWeek);
          nextMonday.setDate(nextMonday.getDate() + 7);
          const daysUntilNextWeek = Math.ceil((nextMonday - now) / (24 * 60 * 60 * 1000));

          setCurrentChallenge({
            alreadyCompleted: true,
            completedChallenge: {
              title: challengeDetail?.title || 'Weekly Challenge',
              completedAt: lastAttempt.submitted_at || lastAttempt.started_at,
              score: lastAttempt.score || 0,
              status: lastAttempt.status,
              feedback: lastAttempt.feedback
            },
            daysUntilNext: daysUntilNextWeek
          });
          
          // Still show past challenges
          const pastAttempts = attempts
            .filter(a => {
              const challengeInList = allChallenges.find(ch => ch.id === a.challenge_id);
              return challengeInList && 
                    challengeInList.programming_language_id === langId &&
                    a.project_id === projectId;
            })
            .map(a => {
              const challengeDetail = allChallenges.find(ch => ch.id === a.challenge_id);
              return {
                id: a.challenge_id,
                title: challengeDetail?.title || 'Challenge',
                difficulty: challengeDetail?.difficulty_level || 'medium',
                points: mapDifficultyToPoints(challengeDetail?.difficulty_level),
                category: 'algorithms',
                completedAt: a.submitted_at || a.reviewed_at || a.started_at,
                score: a.score || 0,
                timeSpent: a.solve_time_minutes
                  ? `${a.solve_time_minutes} minutes`
                  : a.execution_time_ms
                  ? `${Math.round(a.execution_time_ms / 1000)}s`
                  : '—',
                status: a.status === 'passed' ? 'completed' : 'missed'
              };
            })
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

          if (isMounted) setPastChallenges(pastAttempts);
          if (isMounted) setLoading(false);
          return; // ← STOP HERE - Don't show new challenge
        }

        // ✅ If no attempts this week, proceed to show a new challenge
        // Filter out challenges attempted in the last 7 days (to avoid immediate repeats)
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Changed from 14 to 7
        const recentAttemptIds = new Set(
          attempts
            .filter(a => new Date(a.started_at || a.submitted_at || 0) > since)
            .map(a => a.challenge_id)
        );

        const availableChallenges = allChallenges.filter(ch => !recentAttemptIds.has(ch.id));

        console.log('Available challenges after filtering:', availableChallenges.length);
        console.log('Recent attempt IDs (last 7 days):', Array.from(recentAttemptIds));

        // 4) Pick the next challenge (prefer project-specific, then general)
        let nextChallenge = null;

        if (availableChallenges.length > 0) {
          const projectSpecific = availableChallenges.filter(ch => ch.project_id === projectId);
          const general = availableChallenges.filter(ch => !ch.project_id);
          
          if (projectSpecific.length > 0) {
            nextChallenge = projectSpecific[Math.floor(Math.random() * projectSpecific.length)];
            console.log('Selected project-specific challenge:', nextChallenge.title);
          } else if (general.length > 0) {
            nextChallenge = general[Math.floor(Math.random() * general.length)];
            console.log('Selected general challenge:', nextChallenge.title);
          }
        }

        if (nextChallenge && isMounted) {
          const formatted = formatChallengeForUI(nextChallenge);
          
          // Set submission language default
          if (langName) {
            setSubmission(prev => ({ ...prev, language: langName.toLowerCase() }));
          }
          
          setCurrentChallenge(formatted);
        } else if (isMounted) {
          setCurrentChallenge(null);
          setError(`No ${langName || 'programming'} challenges available. You've completed all available challenges! Check back next week for new ones.`);
        }

        // 5) Set up past challenges - ✅ CRITICAL FIX: Only from this language AND this project
        const pastAttempts = attempts
          .filter(a => {
            const challengeInList = allChallenges.find(ch => ch.id === a.challenge_id);
            // ✅ CRITICAL: Only include attempts for THIS project that match the language
            return challengeInList && 
                   challengeInList.programming_language_id === langId &&
                   a.project_id === projectId;
          })
          .map(a => {
            const challengeDetail = allChallenges.find(ch => ch.id === a.challenge_id);
            return {
              id: a.challenge_id,
              title: challengeDetail?.title || 'Challenge',
              difficulty: challengeDetail?.difficulty_level || 'medium',
              points: mapDifficultyToPoints(challengeDetail?.difficulty_level),
              category: 'algorithms',
              completedAt: a.submitted_at || a.reviewed_at || a.started_at,
              score: a.score || 0,
              timeSpent: a.solve_time_minutes
                ? `${a.solve_time_minutes} minutes`
                : a.execution_time_ms
                ? `${Math.round(a.execution_time_ms / 1000)}s`
                : '—',
              status: a.status === 'passed' ? 'completed' : 'missed'
            };
          })
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        if (isMounted) setPastChallenges(pastAttempts);

      } catch (err) {
        console.error('Error loading weekly challenge:', err);
        if (isMounted) {
          setError(err?.response?.data?.message || err.message || 'Failed to load weekly challenge');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [projectId]);


  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    if (!currentChallenge || !submission.code.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      console.log('Submitting solo weekly challenge attempt...');

      const attemptData = {
        challenge_id: currentChallenge.id,
        submitted_code: submission.code,
        notes: submission.description,
        language: submission.language,
        project_id: projectId,
        attempt_type: 'solo_weekly'
      };

      const response = await ChallengeAPI.submitSimpleChallenge(attemptData);
      const attempt = response?.data?.attempt || response?.data || null;

      setCurrentChallenge(prev =>
        prev
          ? {
              ...prev,
              submitted: true,
              userSubmission: {
                submittedAt: attempt?.submitted_at || new Date(),
                score: attempt?.score ?? 0,
                language: submission.language,
                feedback: attempt?.feedback || 'Your submission has been received and is being evaluated.'
              }
            }
          : prev
      );

      setShowSubmission(false);
      setSubmission({ code: '', description: '', language: submission.language });

      console.log('Solo weekly challenge submitted successfully');

    } catch (err) {
      console.error('Submission error:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to submit challenge');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function for difficulty colors
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#f97316';
      case 'expert': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return <Target size={16} />;
      case 'medium': return <BarChart3 size={16} />;
      case 'hard': return <TrendingUp size={16} />;
      case 'expert': return <Zap size={16} />;
      default: return <Target size={16} />;
    }
  };

// COMPLETE STYLES ALIGNED WITH PROJECT INFO THEME
const styles = {
  toggleButton: {
    position: 'fixed',
    top: '20px',
    left: isSidebarCollapsed ? '100px' : '290px',
    zIndex: 1100,
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  },
  container: {
    minHeight: 'calc(100vh - 40px)',
    backgroundColor: '#0F1116',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
    paddingLeft: '120px',  // Adjusted for toggle button
    marginLeft: '0'
  },
  header: {
    position: 'relative',
    zIndex: 10,
    marginBottom: '32px',
    padding: '0 0 20px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: '16px',
    margin: '8px 0 0 0'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    minHeight: '60vh',
    fontSize: '18px',
    color: '#9ca3af',
    zIndex: 10,
    position: 'relative'
  },
  loadingIcon: {
    marginBottom: '20px'
  },
  loadingText: {
    fontSize: '18px',
    color: 'white',
    marginBottom: '8px'
  },
  loadingSubtext: {
    fontSize: '16px',
    color: '#9ca3af'
  },
  errorState: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    textAlign: 'center'
  },
  errorText: {
    fontSize: '18px',
    color: '#f87171',
    marginBottom: '24px',
    maxWidth: '500px'
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  tabContainer: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    marginBottom: '24px',
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '4px',
    backdropFilter: 'blur(20px)'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    justifyContent: 'center'
  },
  activeTab: {
    background: 'linear-gradient(to right, #a855f7, #7c3aed)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
  },
  content: {
    position: 'relative',
    zIndex: 10
  },
  challengeCard: {
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    marginBottom: '24px'
  },
  challengeHeader: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))'
  },
  challengeInfo: {
    flex: 1
  },
  challengeTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 16px 0'
  },
  challengeMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center'
  },
  difficultyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    color: '#d1d5db',
    fontSize: '14px'
  },
  challengeSection: {
    padding: '24px'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '16px'
  },
  descriptionBox: {
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    color: '#d1d5db',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },
  exampleBox: {
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px'
  },
  exampleItem: {
    marginBottom: '16px'
  },
  exampleLabel: {
    color: 'white',
    fontSize: '14px',
    display: 'block',
    marginBottom: '8px'
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'Monaco, Consolas, monospace',
    color: '#e5e7eb',
    overflow: 'auto'
  },
  explanationText: {
    color: '#9ca3af',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  actionSection: {
    padding: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))'
  },
  startButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 32px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  submissionForm: {
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(20px)'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px'
  },
  codeTextarea: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    fontSize: '14px',
    fontFamily: 'Monaco, Consolas, monospace',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#e5e7eb',
    lineHeight: '1.5'
  },
  descriptionTextarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: 'white'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
    background: '#6b7280'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '16px',
    borderRadius: '12px',
    marginTop: '16px',
    backdropFilter: 'blur(8px)'
  },
  completedSection: {
    padding: '24px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '16px',
    backdropFilter: 'blur(8px)'
  },
  completedHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  completedTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#10b981',
    margin: 0
  },
  completedStats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    color: '#d1d5db',
    fontSize: '14px'
  },
  feedbackBox: {
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '16px'
  },
  feedbackText: {
    color: '#d1d5db',
    fontStyle: 'italic',
    lineHeight: '1.5'
  },
  noChallengeState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '60px 20px',
    backdropFilter: 'blur(20px)'
  },
  noChallengeIcon: {
    marginBottom: '24px'
  },
  noChallengeTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 16px 0'
  },
  noChallengeText: {
    color: '#9ca3af',
    fontSize: '16px',
    lineHeight: '1.6',
    maxWidth: '500px',
    marginBottom: '32px'
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  pastHeader: {
    marginBottom: '24px'
  },
  pastTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 8px 0'
  },
  pastSubtitle: {
    color: '#9ca3af',
    fontSize: '16px',
    margin: 0
  },
  challengeGrid: {
    display: 'grid',
    gap: '16px'
  },
  pastChallengeCard: {
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
  },
  pastChallengeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  pastChallengeInfo: {
    flex: 1
  },
  pastChallengeTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 12px 0'
  },
  pastChallengeMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center'
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white'
  },
  pastChallengeStats: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px'
  },
  statText: {
    color: '#9ca3af'
  },
  noPastState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '60px 20px',
    backdropFilter: 'blur(20px)'
  },
  noPastIcon: {
    marginBottom: '24px'
  },
  noPastTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 16px 0'
  },
  noPastText: {
    color: '#9ca3af',
    fontSize: '16px',
    lineHeight: '1.6',
    maxWidth: '500px'
  },
  weeklyCompletedCard: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
    border: '2px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '20px',
    padding: '48px 32px',
    textAlign: 'center',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  weeklyCompletedIcon: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto',
    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  weeklyCompletedTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#10b981',
    margin: '0 0 16px 0',
    letterSpacing: '-0.5px'
  },
  weeklyCompletedSubtitle: {
    fontSize: '18px',
    color: '#d1d5db',
    margin: '0 0 32px 0',
    lineHeight: '1.6'
  },
  completedChallengeInfo: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '32px'
  },
  completedChallengeName: {
    fontSize: '16px',
    color: '#9ca3af',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '12px',
    fontWeight: '600'
  },
  completedChallengeTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '16px'
  },
  completedChallengeStats: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  completedStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#d1d5db',
    fontSize: '14px'
  },
  countdownSection: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  countdownTitle: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600'
  },
  countdownValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  },
  countdownLabel: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  viewPastButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

if (loading) {
  return (
    <>
      {/* Sidebar Toggle Button - OUTSIDE CONTAINER */}
      <button
        style={styles.toggleButton}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.color = '#3b82f6';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
          e.currentTarget.style.color = '#9ca3af';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeft size={20} />
      </button>
      
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.loadingState}>
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
          <span>Loading Weekly Challenge...</span>
        </div>
      </div>
    </>
  );
}

  if (error && !currentChallenge) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.errorState}>
          <AlertTriangle size={32} style={{ color: '#f87171', marginBottom: '16px' }} />
          <div style={styles.errorText}>{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={styles.retryButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <RefreshCw size={16} style={{ marginRight: '8px' }} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar Toggle Button - OUTSIDE CONTAINER */}
      <button
        style={styles.toggleButton}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.color = '#3b82f6';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
          e.currentTarget.style.color = '#9ca3af';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeft size={20} />
      </button>
    <div style={styles.container}>
      <BackgroundSymbols />
      
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Weekly {languageName || 'Programming'} Challenge</h1>
          <p style={styles.subtitle}>
            Challenge yourself with weekly {languageName || 'programming'} problems to improve your skills!
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('current')}
          style={{
            ...styles.tab,
            ...(activeTab === 'current' ? styles.activeTab : {})
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'current') {
              e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
              e.target.style.color = '#a855f7';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'current') {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#9ca3af';
            }
          }}
        >
          <Target size={16} style={{ marginRight: '8px' }} />
          Current Challenge
        </button>
        <button
          onClick={() => setActiveTab('past')}
          style={{
            ...styles.tab,
            ...(activeTab === 'past' ? styles.activeTab : {})
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'past') {
              e.target.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
              e.target.style.color = '#a855f7';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'past') {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#9ca3af';
            }
          }}
        >
          <History size={16} style={{ marginRight: '8px' }} />
          Past Challenges ({pastChallenges.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'current' && (
  <div style={styles.content}>
    {!currentChallenge ? (
      <div style={styles.noChallengeState}>
        <div style={styles.noChallengeIcon}>
          <Target size={64} style={{ color: '#a855f7' }} />
        </div>
        <h2 style={styles.noChallengeTitle}>No Current Challenge</h2>
        <p style={styles.noChallengeText}>
          {languageName 
            ? `No new ${languageName} challenges available right now. New challenges are added weekly!`
            : 'No challenges available. Set up your project programming language first.'
          }
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={styles.refreshButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <RefreshCw size={16} style={{ marginRight: '8px' }} />
          Check Again
        </button>
      </div>
    ) : currentChallenge.alreadyCompleted ? (
      <div style={styles.weeklyCompletedCard}>
        <div style={styles.weeklyCompletedIcon}>
          <CheckCircle size={40} color="white" />
        </div>
        
        <h2 style={styles.weeklyCompletedTitle}>
          Weekly Challenge Complete! 🎉
        </h2>
        
        <p style={styles.weeklyCompletedSubtitle}>
          Great job! You've already completed your challenge for this week.
          Come back soon for your next challenge!
        </p>
        
        <div style={styles.completedChallengeInfo}>
          <div style={styles.completedChallengeName}>
            This Week's Challenge
          </div>
          <div style={styles.completedChallengeTitle}>
            {currentChallenge.completedChallenge.title}
          </div>
          <div style={styles.completedChallengeStats}>
            <div style={styles.completedStatItem}>
              <Award size={18} color="#10b981" />
              <span>Score: {currentChallenge.completedChallenge.score}/100</span>
            </div>
            <div style={styles.completedStatItem}>
              <Calendar size={18} color="#6b7280" />
              <span>
                {new Date(currentChallenge.completedChallenge.completedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div style={styles.completedStatItem}>
              <CheckCircle size={18} color="#10b981" />
              <span>{currentChallenge.completedChallenge.status === 'passed' ? 'Passed' : 'Completed'}</span>
            </div>
          </div>
        </div>
        
        <div style={styles.countdownSection}>
          <div style={styles.countdownTitle}>Next Challenge Available In</div>
          <div style={styles.countdownValue}>
            {currentChallenge.daysUntilNext}
          </div>
          <div style={styles.countdownLabel}>
            {currentChallenge.daysUntilNext === 1 ? 'day' : 'days'}
          </div>
        </div>
        
        <button
          style={styles.viewPastButton}
          onClick={() => setActiveTab('past')}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Calendar size={16} />
          View Past Challenges
        </button>
      </div>
    ) : (
      <div>
        {/* Challenge Card */}
        <div style={styles.challengeCard}>
          <div style={styles.challengeHeader}>
            <div style={styles.challengeInfo}>
              <h2 style={styles.challengeTitle}>{currentChallenge.title}</h2>
              <div style={styles.challengeMeta}>
                <span
                  style={{
                    ...styles.difficultyBadge,
                    backgroundColor: getDifficultyColor(currentChallenge.difficulty)
                  }}
                >
                  {getDifficultyIcon(currentChallenge.difficulty)}
                  <span style={{ marginLeft: '6px' }}>
                    {currentChallenge.difficulty?.toUpperCase()}
                  </span>
                </span>
                <span style={styles.metaItem}>
                  <Trophy size={16} style={{ marginRight: '6px', color: '#f59e0b' }} />
                  {currentChallenge.points} points
                </span>
                <span style={styles.metaItem}>
                  <Clock size={16} style={{ marginRight: '6px', color: '#6b7280' }} />
                  {currentChallenge.timeLimit}
                </span>
                <span style={styles.metaItem}>
                  <Monitor size={16} style={{ marginRight: '6px', color: '#6b7280' }} />
                  {languageName}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={styles.challengeSection}>
            <h3 style={styles.sectionTitle}>
              <FileCode size={20} style={{ marginRight: '8px', color: '#a855f7' }} />
              Description
            </h3>
            <div style={styles.descriptionBox}>
              {currentChallenge.description}
            </div>
          </div>

          {/* Examples */}
          {currentChallenge.examples && currentChallenge.examples.length > 0 && (
            <div style={styles.challengeSection}>
              <h3 style={styles.sectionTitle}>
                <Code2 size={20} style={{ marginRight: '8px', color: '#a855f7' }} />
                Examples
              </h3>
              {currentChallenge.examples.map((example, idx) => (
                <div key={idx} style={styles.exampleBox}>
                  <div style={styles.exampleItem}>
                    <strong style={styles.exampleLabel}>Input:</strong>
                    <pre style={styles.codeBlock}>
                      {example.input}
                    </pre>
                  </div>
                  <div style={styles.exampleItem}>
                    <strong style={styles.exampleLabel}>Output:</strong>
                    <pre style={styles.codeBlock}>
                      {example.output}
                    </pre>
                  </div>
                  {example.explanation && (
                    <div style={styles.explanationText}>
                      <strong>Explanation:</strong> {example.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Section */}
        {!currentChallenge.submitted ? (
          <div style={styles.actionSection}>
            {!showSubmission ? (
              <button
                onClick={() => setShowSubmission(true)}
                style={styles.startButton}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                <Play size={20} style={{ marginRight: '8px' }} />
                Start Challenge
              </button>
            ) : (
              <div style={styles.submissionForm}>
                <form onSubmit={handleSubmitChallenge}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      <Code2 size={16} style={{ marginRight: '8px' }} />
                      Your Solution ({languageName})
                    </label>
                    <textarea
                      value={submission.code}
                      onChange={(e) => setSubmission(prev => ({ ...prev, code: e.target.value }))}
                      placeholder={`Write your ${languageName} solution here...`}
                      rows={15}
                      style={styles.codeTextarea}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#a855f7';
                        e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>
                      Description (Optional)
                    </label>
                    <textarea
                      value={submission.description}
                      onChange={(e) => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your approach or any notes about your solution..."
                      rows={3}
                      style={styles.descriptionTextarea}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#a855f7';
                        e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div style={styles.buttonGroup}>
                    <button
                      type="submit"
                      disabled={submitting || !submission.code.trim()}
                      style={{
                        ...styles.submitButton,
                        ...(submitting || !submission.code.trim() ? styles.disabledButton : {})
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting && submission.code.trim()) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      {submitting ? (
                        <>
                          <RefreshCw size={16} style={{ marginRight: '8px' }} />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} style={{ marginRight: '8px' }} />
                          Submit Solution
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSubmission(false)}
                      style={styles.cancelButton}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(15, 17, 22, 0.95)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <XCircle size={16} style={{ marginRight: '8px' }} />
                      Cancel
                    </button>
                  </div>

                  {error && (
                    <div style={styles.errorMessage}>
                      <AlertTriangle size={16} style={{ marginRight: '8px' }} />
                      {error}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.completedSection}>
            <div style={styles.completedHeader}>
              <CheckCircle size={24} style={{ color: '#10b981', marginRight: '12px' }} />
              <h3 style={styles.completedTitle}>Challenge Completed!</h3>
            </div>
            <div style={styles.completedStats}>
              <div style={styles.statItem}>
                <Award size={20} style={{ color: '#f59e0b', marginRight: '8px' }} />
                <span><strong>Score:</strong> {currentChallenge.userSubmission?.score}/100</span>
              </div>
              <div style={styles.statItem}>
                <Calendar size={20} style={{ color: '#6b7280', marginRight: '8px' }} />
                <span><strong>Submitted:</strong> {new Date(currentChallenge.userSubmission?.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
            {currentChallenge.userSubmission?.feedback && (
              <div style={styles.feedbackBox}>
                <div style={styles.feedbackText}>
                  {currentChallenge.userSubmission.feedback}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>
)}

      {activeTab === 'past' && (
        <div style={styles.content}>
          {pastChallenges.length > 0 ? (
            <div>
              <div style={styles.pastHeader}>
                <h2 style={styles.pastTitle}>Past {languageName} Challenges</h2>
                <p style={styles.pastSubtitle}>Review your challenge history and progress</p>
              </div>
              <div style={styles.challengeGrid}>
                {pastChallenges.map(challenge => (
                  <div key={challenge.id} style={styles.pastChallengeCard}>
                    <div style={styles.pastChallengeHeader}>
                      <div style={styles.pastChallengeInfo}>
                        <h3 style={styles.pastChallengeTitle}>{challenge.title}</h3>
                        <div style={styles.pastChallengeMeta}>
                          <span
                            style={{
                              ...styles.difficultyBadge,
                              backgroundColor: getDifficultyColor(challenge.difficulty)
                            }}
                          >
                            {getDifficultyIcon(challenge.difficulty)}
                            <span style={{ marginLeft: '6px' }}>
                              {challenge.difficulty?.toUpperCase()}
                            </span>
                          </span>
                          <span style={styles.metaItem}>
                            <Trophy size={16} style={{ marginRight: '6px', color: '#f59e0b' }} />
                            {challenge.points} points
                          </span>
                          <span style={styles.metaItem}>
                            <Clock size={16} style={{ marginRight: '6px', color: '#6b7280' }} />
                            {challenge.timeSpent}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: challenge.status === 'completed' ? '#10b981' : '#f97316'
                        }}
                      >
                        {challenge.status === 'completed' ? (
                          <CheckCircle size={16} style={{ marginRight: '6px' }} />
                        ) : (
                          <XCircle size={16} style={{ marginRight: '6px' }} />
                        )}
                        {challenge.status === 'completed' ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                    <div style={styles.pastChallengeStats}>
                      <span style={styles.statText}>
                        Completed: {new Date(challenge.completedAt).toLocaleDateString()}
                      </span>
                      <span style={styles.statText}>
                        Score: {challenge.score}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.noPastState}>
              <div style={styles.noPastIcon}>
                <History size={64} style={{ color: '#a855f7' }} />
              </div>
              <h2 style={styles.noPastTitle}>No Past Challenges</h2>
              <p style={styles.noPastText}>
                You haven't attempted any {languageName || 'programming'} challenges yet. 
                Start with the current challenge to build your history!
              </p>
            </div>
          )}
        </div>
        )}
      </div>
    </>
  );
}

export default SoloWeeklyChallenge;