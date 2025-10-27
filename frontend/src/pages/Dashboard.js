// frontend/src/pages/Dashboard.js - COMPLETE VERSION WITH CHALLENGE MODAL
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import SkillMatchingAPI from '../services/skillMatchingAPI';
import CreateProject from './CreateProject';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';
import AIChatInterface from '../components/AIChat/AIChatInterface';
import ProjectChallengeInterface from '../components/ProjectChallengeInterface'; // ADD THIS IMPORT
import { Plus, Bell, Rocket, Code, Users, BookOpen, HelpCircle, LockKeyhole, PanelLeft } from 'lucide-react';

const formatSkillsDescription = (user) => {
  if (!user) return 'Complete your profile to get personalized recommendations!';
  
  // Get programming languages
  const languages = user.programming_languages || [];
  const languageNames = languages
    .map(l => l.programming_languages?.name || l.name)
    .filter(Boolean)
    .slice(0, 3); // Show first 3 languages
  
  // Get topics
  const topics = user.topics || [];
  const topicNames = topics
    .map(t => t.topics?.name || t.name)
    .filter(Boolean)
    .slice(0, 3); // Show first 3 topics
  
  // Build the description
  let description = 'Based on your skills';
  
  if (languageNames.length > 0) {
    if (languageNames.length === 1) {
      description += ` in ${languageNames[0]}`;
    } else if (languageNames.length === 2) {
      description += ` in ${languageNames[0]} and ${languageNames[1]}`;
    } else {
      description += ` in ${languageNames.slice(0, -1).join(', ')}, and ${languageNames[languageNames.length - 1]}`;
    }
  }
  
  if (topicNames.length > 0) {
    description += ' and your interest in ';
    if (topicNames.length === 1) {
      description += topicNames[0];
    } else if (topicNames.length === 2) {
      description += `${topicNames[0]} and ${topicNames[1]}`;
    } else {
      description += `${topicNames.slice(0, -1).join(', ')}, and ${topicNames[topicNames.length - 1]}`;
    }
  }
  
  description += ', here are some projects you might like.';
  
  // If user has no languages or topics, show a different message
  if (languageNames.length === 0 && topicNames.length === 0) {
    return 'Complete your profile with programming languages and interests to get personalized project recommendations!';
  }
  
  return description;
};

// Enhanced Project Card Component with subtle themed colors
const EnhancedProjectCard = ({
  project,
  styles,
  getDifficultyStyle,
  handleProjectClick,
  handleJoinProject,
  colorVariant
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const LOCK_THRESHOLD = 70;
  const isLocked = Boolean(
    project?.matchFactors?.needsBoost ??
    (
      (project?.matchFactors?.suggestions?.length || 0) > 0 &&
      (project?.score || 0) < LOCK_THRESHOLD
    )
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowScoreModal(false);
    };
    if (showScoreModal) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [showScoreModal]);

  useEffect(() => {
    if (!showScoreModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showScoreModal]);

  const mf = project.matchFactors || {};
  const factors = [
    { key: 'languageFit', label: 'Language fit', score: mf.languageFit?.score ?? null, note: mf.languageFit ? `Coverage ${mf.languageFit.coverage || 0}%` : null },
    { key: 'topicCoverage', label: 'Topic coverage', score: mf.topicCoverage?.score ?? null, note: mf.topicCoverage?.matches ? `${mf.topicCoverage.matches.length} match(es)` : null },
    { key: 'difficultyAlignment', label: 'Difficulty alignment', score: mf.difficultyAlignment?.score ?? null, note: mf.difficultyAlignment ? `${mf.difficultyAlignment.userExperience || 'N/A'} vs ${mf.difficultyAlignment.requiredExperience || 'N/A'}` : null }
  ];

  const modalTitleId = `score-modal-title-${project.projectId || project.id || 'proj'}`;

  // Get color variant styles
  const cardColorStyles = styles.projectCardVariants[colorVariant] || styles.projectCardVariants.slate;

  return (
    <div
      style={{
        ...styles.projectCard,
        ...cardColorStyles.base,
        ...((isHovered && !showScoreModal) ? cardColorStyles.hover : {}),
        cursor: isLocked ? 'not-allowed' : 'pointer',
        opacity: isLocked ? 0.98 : 1
      }}
      onMouseEnter={() => { if (!showScoreModal) setIsHovered(true); }}
      onMouseLeave={() => { if (!showScoreModal) setIsHovered(false); }}
      onClick={() => {
        if (isLocked) return;
        handleProjectClick(project);
      }}
      aria-disabled={isLocked}
    >
      {isHovered && isLocked && !showScoreModal && (
        <div style={styles.lockOverlay}>
          <LockKeyhole size={56} color="#3b82f6" />
        </div>
      )}

      <div 
        style={{ ...styles.matchScore, ...cardColorStyles.matchScore, cursor: 'pointer' }}
        onMouseEnter={() => { if (!showScoreModal) setShowTooltip(true); }}
        onMouseLeave={() => setShowTooltip(false)}
        title="Click to see why this matches you"
        onClick={(e) => {
          e.stopPropagation();
          setShowScoreModal(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setShowScoreModal(true);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Open match details"
      >
        {Math.round(project.score || 0)}% match
        
        {showTooltip && (mf?.highlights?.length > 0 || mf?.suggestions?.length > 0) && (
          <div style={styles.tooltip}>
            {mf?.highlights?.length > 0 ? 
              mf.highlights.slice(0, 2).join(', ') :
              'Match details loading...'
            }
            <div style={styles.tooltipArrow} />
          </div>
        )}
      </div>
      
      {mf?.highlights && mf.highlights.length > 0 && (
        <div style={styles.highlightsContainer}>
          {mf.highlights.slice(0, 2).map((highlight, idx) => (
            <span key={idx} style={{...styles.highlightChip, ...cardColorStyles.highlightChip}}>
              ✨ {highlight}
            </span>
          ))}
        </div>
      )}
      
      <h4 style={styles.projectTitle}>{project.title}</h4>
      <p style={styles.projectDescription}>
        {project.description}
      </p>
      
      <div style={styles.cardFooter}>
        {mf?.suggestions && mf.suggestions.length > 0 && (
          <div style={styles.suggestionsContainer}>
            <div style={styles.suggestionsTitle}>
              💡 To boost your match:
            </div>
            {mf.suggestions.slice(0, 1).map((suggestion, idx) => (
              <div key={idx} style={styles.suggestionText}>
                {suggestion}
              </div>
            ))}
          </div>
        )}

        <div style={styles.projectMeta}>
          <span style={getDifficultyStyle(project.difficulty_level)}>
            {project.difficulty_level?.toUpperCase() || 'MEDIUM'}
          </span>
          <span style={styles.memberCount}>
            {project.current_members || 0}/{project.maximum_members || 10} members
          </span>
        </div>

        {project.technologies && project.technologies.length > 0 && (
          <div style={styles.tagsContainer}>
            {project.technologies.slice(0, 3).map((tech, techIndex) => (
              <span key={techIndex} style={styles.tag}>
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span style={styles.tag}>
                +{project.technologies.length - 3} more
              </span>
            )}
          </div>
        )}

        <button
          style={{
            ...styles.joinButton,
            ...cardColorStyles.joinButton,
            ...(isLocked ? styles.joinButtonDisabled : {})
          }}
          disabled={isLocked}
          onClick={(e) => {
            if (isLocked) {
              e.stopPropagation();
              return;
            }
            handleJoinProject(project, e);
          }}
        >
          {isLocked ? 'Locked' : 'Join Project'}
        </button>
      </div>

      {showScoreModal && createPortal(
        <div style={styles.modal} onClick={() => setShowScoreModal(false)}>
          <div
            style={{ ...styles.modalContent, ...styles.scoreModalContent }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
          >
            <div style={styles.scoreModalHeader}>
              <div>
                <div id={modalTitleId} style={styles.scoreModalTitle}>
                  Match details
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>{project.title}</div>
              </div>
              <div style={styles.scorePill}>{Math.round(project.score || 0)}%</div>
            </div>

            <div style={styles.scoreModalSection}>
              <div style={styles.modalSectionTitle}>
                Why this matches you
              </div>
              {mf?.highlights?.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {mf.highlights.slice(0, 6).map((h, i) => (
                    <span key={i} style={styles.chip}>✨ {h}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Match details loading...</div>
              )}
            </div>

            {!!mf?.suggestions?.length && (
              <div style={styles.scoreModalSection}>
                <div style={styles.modalSectionTitle}>
                  To boost your match
                </div>
                <ul style={styles.list}>
                  {mf.suggestions.slice(0, 5).map((s, i) => (
                    <li key={i} style={styles.listItem}>💡 {s}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.scoreModalSection}>
              <div style={styles.modalSectionTitle}>
                Breakdown
              </div>
              {factors.map((f) => (
                <div key={f.key} style={styles.factorRow}>
                  <div style={styles.factorLabel}>
                    <span>{f.label}</span>
                    <span style={styles.factorScore}>{f.score != null ? `${Math.round(f.score)}%` : '—'}</span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${Math.max(0, Math.min(100, Number(f.score) || 0))}%`
                      }}
                    />
                  </div>
                  {f.note && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: 4 }}>{f.note}</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button
                style={styles.closeButtonPrimary}
                onClick={() => setShowScoreModal(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Background symbols component - ENHANCED WITH FLOATING ANIMATIONS
const BackgroundSymbols = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1,
    pointerEvents: 'none'
  }}>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
    }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
    }}>&#60;/&#62;</div>
  </div>
);

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [sortBy, setSortBy] = useState('match');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // NEW STATE: For AI chat project preview modal at dashboard level
  const [showAIProjectPreview, setShowAIProjectPreview] = useState(false);
  const [aiPreviewProject, setAiPreviewProject] = useState(null);

  // ADD THESE NEW STATES FOR CHALLENGE MODAL
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedProjectForChallenge, setSelectedProjectForChallenge] = useState(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    console.log('🏠 DASHBOARD MOUNT - localStorage:', saved, 'state will be:', saved === 'true');
    return saved === 'true';
  });

  // Add debug log right after state declaration
  console.log('🏠 DASHBOARD RENDER - isSidebarCollapsed:', isSidebarCollapsed, 'paddingLeft:', isSidebarCollapsed ? '120px' : '310px');
 
  const { 
    unreadCount, 
    notifications, 
    fetchNotifications 
  } = useNotifications();

  // Subtle color variants for project cards - aligned with dark theme
  const colorVariants = ['slate', 'zinc', 'neutral', 'stone', 'gray', 'blue'];

  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('sidebarCollapsed', newCollapsedState.toString());
    
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  // Custom scrollbar styles for the project preview modal + dropdown styling + FLOATING ANIMATIONS
  const customScrollbarStyles = `
    /* Custom scrollbar for the project preview modal */
    .project-preview-modal {
      scrollbar-width: thin;
      scrollbar-color: rgba(59, 130, 246, 0.6) rgba(255, 255, 255, 0.05);
    }

    .project-preview-modal::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    .project-preview-modal::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      margin: 8px 0;
      border: 1px solid rgba(255, 255, 255, 0.02);
    }

    .project-preview-modal::-webkit-scrollbar-thumb {
      background: linear-gradient(
        135deg, 
        rgba(59, 130, 246, 0.8) 0%, 
        rgba(37, 99, 235, 0.9) 50%,
        rgba(29, 78, 216, 1) 100%
      );
      border-radius: 10px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 2px 8px rgba(59, 130, 246, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .project-preview-modal::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        135deg, 
        rgba(59, 130, 246, 1) 0%, 
        rgba(37, 99, 235, 1) 50%,
        rgba(29, 78, 216, 1) 100%
      );
      box-shadow: 
        0 4px 16px rgba(59, 130, 246, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      transform: scaleY(1.1);
    }

    .project-preview-modal::-webkit-scrollbar-thumb:active {
      background: linear-gradient(
        135deg, 
        rgba(37, 99, 235, 1) 0%, 
        rgba(29, 78, 216, 1) 50%,
        rgba(30, 64, 175, 1) 100%
      );
      box-shadow: 
        0 2px 8px rgba(59, 130, 246, 0.4),
        inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .project-preview-modal::-webkit-scrollbar-corner {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .project-preview-modal {
      scroll-behavior: smooth;
    }

    @supports (scrollbar-width: thin) {
      .project-preview-modal {
        scrollbar-width: thin;
        scrollbar-color: rgba(59, 130, 246, 0.8) rgba(255, 255, 255, 0.05);
      }
    }

    /* Dark theme dropdown styles - FIX FOR WHITE BACKGROUND ISSUE */
    select option {
      background-color: #1a1c20 !important;
      color: #e2e8f0 !important;
      padding: 8px 12px !important;
      border: none !important;
    }

    select option:hover {
      background-color: #2563eb !important;
      color: white !important;
    }

    select option:checked {
      background-color: #3b82f6 !important;
      color: white !important;
    }

    /* For Firefox */
    select {
      color-scheme: dark;
    }

    /* Additional styles for better dropdown appearance */
    select::-webkit-scrollbar {
      width: 8px;
    }

    select::-webkit-scrollbar-track {
      background: #1a1c20;
    }

    select::-webkit-scrollbar-thumb {
      background: #3b82f6;
      border-radius: 4px;
    }

    select::-webkit-scrollbar-thumb:hover {
      background: #2563eb;
    }

    /* FLOATING BACKGROUND SYMBOLS ANIMATIONS */
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

    /* ADD BLUR EFFECT FOR CHALLENGE MODAL BACKDROP */
    .dashboard-blur {
      filter: blur(3px);
      transition: filter 0.3s ease;
    }
  `;
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      console.log('🏠 DASHBOARD received toggle event:', event.detail.collapsed);
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  useEffect(() => {
  const fetchRecommendations = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingRecommendations(true);
      
      // Just fetch recommendations directly
      const response = await SkillMatchingAPI.getEnhancedRecommendations(user.id);
      const recommendations = response.data.recommendations;
      
      setRecommendedProjects(recommendations.slice(0, 12));
      setFilteredProjects(recommendations.slice(0, 12));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendedProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  fetchRecommendations();
}, [user?.id, user?.programming_languages, user?.topics]);

useEffect(() => {
  const handleProfileUpdate = () => {
    console.log('Profile updated, refreshing recommendations...');
    // Trigger a re-fetch of recommendations
    if (user?.id) {
      const fetchRecommendations = async () => {
        try {
          setLoadingRecommendations(true);
          const response = await SkillMatchingAPI.getEnhancedRecommendations(user.id);
          const recommendations = response.data.recommendations;
          
          setRecommendedProjects(recommendations.slice(0, 12));
          setFilteredProjects(recommendations.slice(0, 12));
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        } finally {
          setLoadingRecommendations(false);
        }
      };
      
      fetchRecommendations();
    }
  };

  // Listen for custom profile update event
  window.addEventListener('profileUpdated', handleProfileUpdate);
  
  return () => {
    window.removeEventListener('profileUpdated', handleProfileUpdate);
  };
}, [user?.id]);

  // NEW: Listen for AI chat project preview events
  useEffect(() => {
  const handleAIProjectPreview = (event) => {
    console.log('═══════════════════════════════════════════════');
    console.log('📨 DASHBOARD RECEIVED AI PREVIEW EVENT');
    console.log('═══════════════════════════════════════════════');
    
    const receivedProject = event.detail.project;
    
    console.log('📥 event.detail:', event.detail);
    console.log('📥 event.detail.project:', receivedProject);
    console.log('📥 event.detail.project.tasks:', receivedProject.tasks?.length || 0);
    
    if (receivedProject.tasks && receivedProject.tasks.length > 0) {
      console.log('📋 Received task titles:', receivedProject.tasks.map(t => t.title));
    } else {
      console.error('⚠️ DASHBOARD RECEIVED PROJECT WITH NO TASKS!');
      console.error('⚠️ Received project keys:', Object.keys(receivedProject));
    }
    
    // CRITICAL: Deep clone to prevent reference issues
    const projectCopy = {
      ...receivedProject,
      tasks: receivedProject.tasks ? [...receivedProject.tasks] : [],
      programming_languages: receivedProject.programming_languages ? [...receivedProject.programming_languages] : [],
      topics: receivedProject.topics ? [...receivedProject.topics] : []
    };
    
    console.log('📦 Created project copy with tasks:', projectCopy.tasks?.length || 0);
    console.log('═══════════════════════════════════════════════');
    console.log('📦 SET STATE aiPreviewProject');
    console.log('═══════════════════════════════════════════════');
    
    // Store the copy in state
    setAiPreviewProject(projectCopy);
    setShowAIProjectPreview(true);
  };

  window.addEventListener('aiProjectPreview', handleAIProjectPreview);
  return () => window.removeEventListener('aiProjectPreview', handleAIProjectPreview);
}, []);

  // ADD EFFECT TO MANAGE BODY SCROLL AND BLUR FOR CHALLENGE MODAL
  useEffect(() => {
    if (showChallengeModal) {
      document.body.style.overflow = 'hidden';
      document.querySelector('.dashboard-container')?.classList.add('dashboard-blur');
    } else {
      document.body.style.overflow = 'unset';
      document.querySelector('.dashboard-container')?.classList.remove('dashboard-blur');
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.querySelector('.dashboard-container')?.classList.remove('dashboard-blur');
    };
  }, [showChallengeModal]);

  useEffect(() => {
    let filtered = [...recommendedProjects];

    if (filterLanguage !== 'all') {
      filtered = filtered.filter(project => 
        project.technologies?.some(tech => 
          tech.toLowerCase().includes(filterLanguage.toLowerCase())
        )
      );
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(project => 
        project.difficulty_level?.toLowerCase() === filterDifficulty.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'match':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          aValue = difficultyOrder[a.difficulty_level?.toLowerCase()] || 2;
          bValue = difficultyOrder[b.difficulty_level?.toLowerCase()] || 2;
          break;
        case 'members':
          aValue = a.current_members || 0;
          bValue = b.current_members || 0;
          break;
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
  }, [recommendedProjects, sortBy, sortOrder, filterLanguage, filterDifficulty]);

  const getAvailableLanguages = () => {
    const languages = new Set();
    recommendedProjects.forEach(project => {
      project.technologies?.forEach(tech => languages.add(tech));
    });
    return Array.from(languages).sort();
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'title' ? 'asc' : 'desc');
    }
  };

  const resetFilters = () => {
    setSortBy('match');
    setSortOrder('desc');
    setFilterLanguage('all');
    setFilterDifficulty('all');
  };

  const getDifficultyStyle = (difficulty) => {
    const colors = {
      easy: '#22c55e',
      medium: '#f59e0b', 
      hard: '#ef4444'
    };
    
    return {
      backgroundColor: colors[difficulty?.toLowerCase()] || colors.medium,
      color: 'white',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '11px',
      fontWeight: 'bold'
    };
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications]);

  const handleCreateClick = () => {
    setShowCreateProject(true);
  };

  const handleCloseCreate = () => {
    setShowCreateProject(false);
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newState = !showNotifications;
    setShowNotifications(newState);
    
    if (newState && notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleProjectClick = async (project) => {
    try {
      await SkillMatchingAPI.updateRecommendationFeedback(
        project.recommendationId,
        'viewed',
        null,
        project.projectId
      );
      
      navigate(`/projects/${project.projectId}`);
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
      navigate(`/projects/${project.projectId}`);
    }
  };

  // MODIFY THE handleJoinProject FUNCTION TO SHOW MODAL INSTEAD OF NAVIGATE
  const handleJoinProject = async (project, event) => {
    event.stopPropagation();

    try {
      try {
        await SkillMatchingAPI.updateRecommendationFeedback(
          project.recommendationId,
          'applied',
          null,
          project.projectId
        );
      } catch (feedbackError) {
        console.warn('Failed to update recommendation feedback:', feedbackError);
      }
      
      // CHANGED: Show modal instead of navigate
      setSelectedProjectForChallenge(project);
      setShowChallengeModal(true);
      
    } catch (error) {
      console.error('Error joining project:', error);
    }
  };

  // ADD CHALLENGE MODAL CLOSE HANDLER
  const handleCloseChallengeModal = () => {
    setShowChallengeModal(false);
    setSelectedProjectForChallenge(null);
  };

  // ADD SUCCESS HANDLER FOR CHALLENGE COMPLETION
  const handleChallengeSuccess = () => {
    setShowChallengeModal(false);
    setSelectedProjectForChallenge(null);
    // Optionally refresh recommendations or navigate to project
    // navigate(`/projects/${selectedProjectForChallenge?.projectId}`);
  };

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
      paddingLeft: '120px',
      transition: 'padding-left 0.3s ease'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    createButton: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    notificationContainer: {
      position: 'relative'
    },
    notificationButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '10px 14px',
      cursor: 'pointer',
      fontSize: '16px',
      position: 'relative',
      transition: 'all 0.3s ease',
      color: 'white',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      width: '20px',
      height: '20px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: '#1a1c20',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '90%',
      maxHeight: '90%',
      overflow: 'auto',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    // ADD CHALLENGE MODAL STYLES
    challengeModalBackdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      animation: 'fadeIn 0.3s ease-out'
    },
    welcomeSection: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px'
    },
    welcomeTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    welcomeDescription: {
      color: '#d1d5db',
      fontSize: '16px',
      lineHeight: '1.6',
      margin: 0
    },
    tabNavigation: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '20px'
    },
    tabHeader: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px'
    },
    tabButton: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
      color: '#E8EDF9'
    },
    tabContent: {
      position: 'relative',
      zIndex: 10
    },
    sectionTitle: {
      color: 'white',
      marginBottom: '15px',
      fontSize: '24px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    sectionDescription: {
      color: '#d1d5db',
      marginBottom: '20px',
      fontSize: '14px',
      lineHeight: '1.6'
    },
    recommendationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
      marginTop: '20px'
    },
    projectCard: {
      borderRadius: '16px',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '420px'
    },
    projectCardVariants: {
      slate: {
        base: {
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.12), rgba(30, 41, 59, 0.08))',
          border: '1px solid rgba(51, 65, 85, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(51, 65, 85, 0.25)',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.18), rgba(30, 41, 59, 0.12))'
        },
        matchScore: {
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        highlightChip: {
          backgroundColor: 'rgba(51, 65, 85, 0.2)',
          color: '#94a3b8',
          border: '1px solid rgba(51, 65, 85, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      zinc: {
        base: {
          background: 'linear-gradient(135deg, rgba(63, 63, 70, 0.12), rgba(39, 39, 42, 0.08))',
          border: '1px solid rgba(63, 63, 70, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(63, 63, 70, 0.25)',
          border: '1px solid rgba(63, 63, 70, 0.4)',
          background: 'linear-gradient(135deg, rgba(63, 63, 70, 0.18), rgba(39, 39, 42, 0.12))'
        },
        matchScore: {
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        highlightChip: {
          backgroundColor: 'rgba(63, 63, 70, 0.2)',
          color: '#a1a1aa',
          border: '1px solid rgba(63, 63, 70, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      neutral: {
        base: {
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.12), rgba(38, 38, 38, 0.08))',
          border: '1px solid rgba(64, 64, 64, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(64, 64, 64, 0.25)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.18), rgba(38, 38, 38, 0.12))'
        },
        matchScore: {
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        highlightChip: {
          backgroundColor: 'rgba(64, 64, 64, 0.2)',
          color: '#a3a3a3',
          border: '1px solid rgba(64, 64, 64, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      stone: {
        base: {
          background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.12), rgba(41, 37, 36, 0.08))',
          border: '1px solid rgba(68, 64, 60, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(68, 64, 60, 0.25)',
          border: '1px solid rgba(68, 64, 60, 0.4)',
          background: 'linear-gradient(135deg, rgba(68, 64, 60, 0.18), rgba(41, 37, 36, 0.12))'
        },
        matchScore: {
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        highlightChip: {
          backgroundColor: 'rgba(68, 64, 60, 0.2)',
          color: '#a8a29e',
          border: '1px solid rgba(68, 64, 60, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      gray: {
        base: {
          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.12), rgba(31, 41, 55, 0.08))',
          border: '1px solid rgba(55, 65, 81, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(55, 65, 81, 0.25)',
          border: '1px solid rgba(55, 65, 81, 0.4)',
          background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.18), rgba(31, 41, 55, 0.12))'
        },
        matchScore: {
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        highlightChip: {
          backgroundColor: 'rgba(55, 65, 81, 0.2)',
          color: '#9ca3af',
          border: '1px solid rgba(55, 65, 81, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      },
      blue: {
        base: {
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.12), rgba(38, 38, 38, 0.08))',
          border: '1px solid rgba(64, 64, 64, 0.25)',
          backdropFilter: 'blur(20px)'
        },
        hover: {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 30px rgba(64, 64, 64, 0.25)',
          border: '1px solid rgba(64, 64, 64, 0.4)',
          background: 'linear-gradient(135deg, rgba(64, 64, 64, 0.18), rgba(38, 38, 38, 0.12))'
        },
        matchScore: {
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        highlightChip: {
          backgroundColor: 'rgba(64, 64, 64, 0.2)',
          color: '#a3a3a3',
          border: '1px solid rgba(64, 64, 64, 0.35)'
        },
        joinButton: {
          backgroundColor: '#3b82f6'
        },
        joinButtonHover: '#2563eb'
      }
    },
    matchScore: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    tooltip: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 8,
      backgroundColor: '#374151',
      color: 'white',
      padding: '8px 12px',
      borderRadius: 6,
      fontSize: 12,
      zIndex: 10,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      maxWidth: 220,
      whiteSpace: 'normal'
    },
    tooltipArrow: {
      position: 'absolute',
      top: -4,
      right: 8,
      width: 0,
      height: 0,
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderBottom: '4px solid #374151'
    },
    highlightsContainer: {
      marginBottom: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    highlightChip: {
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      minWidth: '140px',
      alignSelf: 'flex-start'
    },
    cardFooter: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    projectTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '8px',
      paddingRight: '80px',
      lineHeight: '1.3'
    },
    projectDescription: {
      color: '#d1d5db',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '16px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    suggestionsContainer: {
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      borderRadius: '8px',
      border: '1px solid rgba(251, 191, 36, 0.2)'
    },
    suggestionsTitle: {
      fontSize: '11px',
      fontWeight: 'bold',
      color: '#fbbf24',
      marginBottom: '4px'
    },
    suggestionText: {
      fontSize: '11px',
      color: '#fde68a',
      lineHeight: '1.4'
    },
    projectMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      fontSize: '12px'
    },
    memberCount: {
      color: '#9ca3af',
      fontSize: '12px'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '20px'
    },
    tag: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#d1d5db',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    joinButton: {
      width: '100%',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      marginTop: 'auto'
    },
    joinButtonDisabled: {
      background: 'rgba(107, 114, 128, 0.5)',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    loading: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      minHeight: '400px',
      fontSize: '16px',
      color: '#9ca3af'
    },
    emptyState: {
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '14px',
      padding: '60px 20px',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    filterSection: {
      position: 'relative',
      zIndex: 10,
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    },
    filterHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    filterToggle: {
      backgroundColor: 'transparent',
      border: '1px solid #3b82f6',
      color: '#3b82f6',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    filterControls: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px',
      alignItems: 'start'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      alignSelf: 'start'
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#d1d5db'
    },
    filterSelect: {
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: 'white',
      backdropFilter: 'blur(12px)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 12px center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '16px',
      paddingRight: '40px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      outline: 'none'
    },
    filterSelectHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      border: '1px solid rgba(59, 130, 246, 0.4)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.15)',
      transform: 'translateY(-1px)',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
    },
    filterSelectFocus: {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      border: '1px solid rgba(59, 130, 246, 0.6)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), 0 6px 20px rgba(59, 130, 246, 0.2)',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
    },
    sortButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    sortButton: {
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '10px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#d1d5db',
      fontWeight: '500'
    },
    sortButtonActive: {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    },
    resultsCount: {
      fontSize: '14px',
      color: '#9ca3af',
      textAlign: 'center',
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    resetButton: {
      padding: '8px 16px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    lockOverlay: {
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(26, 28, 32, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px',
      zIndex: 5,
      pointerEvents: 'none'
    },
    scoreModalContent: {
      maxWidth: '680px',
      width: '92%',
      padding: '24px',
      borderRadius: '12px',
      backgroundColor: '#1a1c20',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    scoreModalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '12px',
      marginBottom: '16px'
    },
    scoreModalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white'
    },
    scorePill: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      borderRadius: '20px',
      padding: '8px 16px',
      fontWeight: 'bold',
      minWidth: '70px',
      textAlign: 'center'
    },
    scoreModalSection: {
      margin: '16px 0'
    },
    modalSectionTitle: {
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      marginBottom: 10
    },
    chip: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: '#93c5fd',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    chipWarning: {
      backgroundColor: 'rgba(251, 191, 36, 0.15)',
      color: '#fbbf24',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      border: '1px solid rgba(251, 191, 36, 0.3)'
    },
    list: {
      margin: 0,
      paddingLeft: '16px'
    },
    listItem: {
      fontSize: '13px',
      color: '#d1d5db',
      marginBottom: '6px'
    },
    factorRow: {
      marginBottom: '12px'
    },
    factorLabel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#d1d5db',
      marginBottom: '6px'
    },
    factorScore: {
      fontWeight: 600,
      color: 'white'
    },
    progressTrack: {
      position: 'relative',
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      overflow: 'hidden'
    },
    progressFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      background: 'linear-gradient(to right, #3b82f6, #2563eb)'
    },
    closeButtonPrimary: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600'
    }
  };

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
      {/* Add custom scrollbar styles + floating animations */}
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />
      
      {/* ADD CLASS FOR BLUR EFFECT */}
      <div className="dashboard-container" style={styles.container}>
        {/* Background Code Symbols - Now with floating animations */}
        <BackgroundSymbols />

        {/* Header Section */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Dashboard</h1>
          </div>
          <div style={styles.headerActions}>
            <button
              style={styles.createButton}
              onClick={handleCreateClick}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              <Plus size={18} />
              Create Project
            </button>
            
            <div style={styles.notificationContainer}>
              <button 
                style={{
                  ...styles.notificationButton,
                  color: unreadCount > 0 ? '#60a5fa' : '#9ca3af'
                }} 
                onClick={handleNotificationClick}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={styles.notificationBadge}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div 
                  className="notification-dropdown"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '5px',
                    zIndex: 1000
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <NotificationDropdown onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Create Project Modal */}
        {showCreateProject && (
          <div style={styles.modal} onClick={handleCloseCreate}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <CreateProject onClose={handleCloseCreate} />
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>
            <Rocket size={28} style={{ color: '#3b82f6' }} />
            Welcome Back, {user?.username || 'User'}!
          </h2>
          <p style={styles.welcomeDescription}>
            Ready to start or continue working on your projects? Check out our personalized recommendations below.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabNavigation}>
          <div style={styles.tabHeader}>
            <button
              style={{
                ...styles.tabButton,
                backgroundColor: activeTab === 'recommended' ? '#1a1d24' : 'transparent',
                color: '#E8EDF9'
              }}
              onClick={() => setActiveTab('recommended')}
            >
              For You
            </button>

            <button
              style={{
                ...styles.tabButton,
                backgroundColor: activeTab === 'forYou' ? '#1a1d24' : 'transparent',
                color: '#E8EDF9'
              }}
              onClick={() => setActiveTab('forYou')}
            >
              Solo Projects
            </button>
          </div>

          <div style={styles.tabContent}>
            {/* RECOMMENDED PROJECTS TAB */}
            {activeTab === 'recommended' && (
              <div>
                <h3 style={styles.sectionTitle}>
                  <Code size={24} style={{ color: '#3b82f6' }} />
                  Recommended Projects
                </h3>
                <p style={styles.sectionDescription}>
                  {formatSkillsDescription(user)}
                </p>


                {/* Filter and Sort Section */}
                {!loadingRecommendations && recommendedProjects.length > 0 && (
                  <div style={styles.filterSection}>
                    <div style={styles.filterHeader}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                        Filter & Sort Projects
                      </h4>
                      <button
                        style={styles.filterToggle}
                        onClick={() => setShowFilters(!showFilters)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#3b82f6';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#3b82f6';
                        }}
                      >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                      </button>
                    </div>

                    {showFilters && (
                      <>
                        <div style={styles.filterControls}>
                          {/* Language Filter */}
                          <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Filter by Language</label>
                            <select
                              style={styles.filterSelect}
                              value={filterLanguage}
                              onChange={(e) => setFilterLanguage(e.target.value)}
                              onMouseEnter={(e) => {
                                Object.assign(e.target.style, styles.filterSelectHover);
                              }}
                              onMouseLeave={(e) => {
                                Object.assign(e.target.style, styles.filterSelect);
                              }}
                              onFocus={(e) => {
                                Object.assign(e.target.style, styles.filterSelectFocus);
                              }}
                              onBlur={(e) => {
                                Object.assign(e.target.style, styles.filterSelect);
                              }}
                            >
                              <option value="all">All Languages</option>
                              {getAvailableLanguages().map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                          </div>

                          {/* Difficulty Filter */}
                          <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Filter by Difficulty</label>
                            <select
                              style={styles.filterSelect}
                              value={filterDifficulty}
                              onChange={(e) => setFilterDifficulty(e.target.value)}
                              onMouseEnter={(e) => {
                                Object.assign(e.target.style, styles.filterSelectHover);
                              }}
                              onMouseLeave={(e) => {
                                Object.assign(e.target.style, styles.filterSelect);
                              }}
                              onFocus={(e) => {
                                Object.assign(e.target.style, styles.filterSelectFocus);
                              }}
                              onBlur={(e) => {
                                Object.assign(e.target.style, styles.filterSelect);
                              }}
                            >
                              <option value="all">All Difficulties</option>
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>

                          {/* Sort Options */}
                          <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Sort by</label>
                            <div style={styles.sortButtons}>
                              <button
                                style={{
                                  ...styles.sortButton,
                                  ...(sortBy === 'match' ? styles.sortButtonActive : {})
                                }}
                                onClick={() => handleSortChange('match')}
                              >
                                Match Rate {sortBy === 'match' && (sortOrder === 'desc' ? '↓' : '↑')}
                              </button>
                              <button
                                style={{
                                  ...styles.sortButton,
                                  ...(sortBy === 'difficulty' ? styles.sortButtonActive : {})
                                }}
                                onClick={() => handleSortChange('difficulty')}
                              >
                                Difficulty {sortBy === 'difficulty' && (sortOrder === 'desc' ? '↓' : '↑')}
                              </button>
                              <button
                                style={{
                                  ...styles.sortButton,
                                  ...(sortBy === 'members' ? styles.sortButtonActive : {})
                                }}
                                onClick={() => handleSortChange('members')}
                              >
                                Team Size {sortBy === 'members' && (sortOrder === 'desc' ? '↓' : '↑')}
                              </button>
                              <button
                                style={{
                                  ...styles.sortButton,
                                  ...(sortBy === 'title' ? styles.sortButtonActive : {})
                                }}
                                onClick={() => handleSortChange('title')}
                              >
                                Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Reset Button */}
                        <div style={{ textAlign: 'right' }}>
                          <button
                            style={styles.resetButton}
                            onClick={resetFilters}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#4b5563';
                              e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#6b7280';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            Reset Filters
                          </button>
                        </div>
                      </>
                    )}

                    {/* Results Count */}
                    <div style={styles.resultsCount}>
                      Showing {filteredProjects.length} of {recommendedProjects.length} projects
                      {(filterLanguage !== 'all' || filterDifficulty !== 'all') && (
                        <span style={{ color: '#60a5fa', fontWeight: '500' }}> (filtered)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Project Grid */}
                {loadingRecommendations ? (
                  <div style={styles.loading}>
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
                    <span>Loading personalized recommendation...</span>
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div style={styles.recommendationsGrid}>
                    {filteredProjects.map((project, index) => (
                      <EnhancedProjectCard
                        key={project.projectId || project.id || index}
                        project={project}
                        styles={styles}
                        getDifficultyStyle={getDifficultyStyle}
                        handleProjectClick={handleProjectClick}
                        handleJoinProject={handleJoinProject}
                        colorVariant={colorVariants[index % colorVariants.length]}
                      />
                    ))}
                  </div>
                ) : recommendedProjects.length > 0 ? (
                  <div style={styles.emptyState}>
                    No projects match your current filters.
                    <br />
                    <button
                      style={{
                        ...styles.resetButton,
                        marginTop: '12px'
                      }}
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    No project recommendations available yet.
                    Complete more of your profile to get personalized recommendations!
                  </div>
                )}
              </div>
            )}

            {/* FOR YOU TAB - SOLO PROJECT WITH AI CHAT */}
            {activeTab === 'forYou' && (
              <div>
                <h3 style={styles.sectionTitle}>
                  <BookOpen size={24} style={{ color: '#10b981' }} />
                  Solo Project
                </h3>
                <p style={styles.sectionDescription}>
                  Sync is your personal AI-powered workspace for generating and planning coding projects.
                </p>

                {/* AI Chat Interface */}
                <div style={{
                  position: 'relative',
                  zIndex: 10,
                  background: 'rgba(26, 28, 32, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <AIChatInterface />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Project Preview Modal at Dashboard Level with Custom Scrollbar */}
        {showAIProjectPreview && aiPreviewProject && createPortal(
          <div style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 2500, 
            backdropFilter: 'blur(2px)'
          }}>
            <div 
              className="project-preview-modal"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.96), rgba(15, 17, 22, 0.94))',
                borderRadius: '20px', 
                padding: '32px', 
                maxWidth: '800px', 
                width: '90%',
                maxHeight: '90vh', 
                overflowY: 'auto',
                boxShadow: '0 30px 100px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)', 
                color: 'white',
                backdropFilter: 'blur(15px)'
              }}
            >
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '28px', 
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h2 style={{
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: 'white', 
                  margin: 0,
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px'
                }}>
                  <Code size={26} style={{ color: '#3b82f6' }} />
                  Project Preview
                </h2>
                <button
                  style={{
                    padding: '12px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: 'none', 
                    fontSize: '24px', 
                    cursor: 'pointer',
                    color: '#94a3b8', 
                    borderRadius: '12px',
                    width: '48px', 
                    height: '48px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setShowAIProjectPreview(false);
                    setAiPreviewProject(null);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.color = '#ef4444';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.color = '#94a3b8';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h3 style={{
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: 'white',
                  margin: '0 0 20px 0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px'
                }}>
                  <Rocket size={20} style={{ color: '#10b981' }} />
                  {aiPreviewProject.title}
                </h3>
              </div>

              <div style={{ marginBottom: '28px' }}>
                <h4 style={{
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: 'white',
                  marginBottom: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px'
                }}>
                  📄 Description
                </h4>
                <p style={{ 
                  fontSize: '15px', 
                  lineHeight: '1.7', 
                  color: '#cbd5e1',
                  margin: 0 
                }}>
                  {aiPreviewProject.description}
                </p>
              </div>

              {aiPreviewProject.detailed_description && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: 'white',
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px'
                  }}>
                    📋 Project Details
                  </h4>
                  <div style={{
                    fontSize: '14px', 
                    lineHeight: '1.6', 
                    color: '#94a3b8',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    padding: '20px',
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    whiteSpace: 'pre-line', 
                    backdropFilter: 'blur(8px)'
                  }}>
                    {aiPreviewProject.detailed_description}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '28px' }}>
                <h4 style={{
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: 'white',
                  marginBottom: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px'
                }}>
                  ⚙️ Project Settings
                </h4>
                <div style={{
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '20px', 
                  marginBottom: '20px'
                }}>
                  <div style={{
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#64748b',
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px'
                    }}>
                      Difficulty Level
                    </span>
                    <span style={{
                      fontSize: '15px', 
                      fontWeight: '600', 
                      color: 'white',
                      padding: '6px 14px', 
                      borderRadius: '16px',
                      textTransform: 'capitalize',
                      backgroundColor: aiPreviewProject.difficulty_level === 'easy' ? '#10b981' : 
                                     aiPreviewProject.difficulty_level === 'medium' ? '#f59e0b' :
                                     aiPreviewProject.difficulty_level === 'hard' ? '#ef4444' : '#8b5cf6',
                      textAlign: 'center',
                      display: 'inline-block'
                    }}>
                      {aiPreviewProject.difficulty_level || 'Medium'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#64748b',
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px'
                    }}>
                      Experience Level
                    </span>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      color: 'white' 
                    }}>
                      {aiPreviewProject.required_experience_level || 'Intermediate'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#64748b',
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px'
                    }}>
                      Max Members
                    </span>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      color: 'white' 
                    }}>
                      {aiPreviewProject.maximum_members || 'Unlimited'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)', 
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: '#64748b',
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px'
                    }}>
                      Estimated Duration
                    </span>
                    <span style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      color: 'white' 
                    }}>
                      {aiPreviewProject.estimated_duration_weeks ? 
                        `${aiPreviewProject.estimated_duration_weeks} weeks` : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {aiPreviewProject.programming_languages && aiPreviewProject.programming_languages.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: 'white',
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px'
                  }}>
                    💻 Technologies
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px' 
                  }}>
                    {aiPreviewProject.programming_languages.map((lang, index) => (
                      <span key={index} style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                        color: '#93c5fd', 
                        fontSize: '13px', 
                        fontWeight: '500',
                        borderRadius: '20px', 
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiPreviewProject.topics && aiPreviewProject.topics.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <h4 style={{
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: 'white',
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px'
                  }}>
                    🏷️ Topics
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px' 
                  }}>
                    {aiPreviewProject.topics.map((topic, index) => (
                      <span key={index} style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(124, 58, 237, 0.1))',
                        color: '#c4b5fd', 
                        fontSize: '13px', 
                        fontWeight: '500',
                        borderRadius: '20px', 
                        border: '1px solid rgba(147, 51, 234, 0.3)'
                      }}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                display: 'flex', 
                gap: '16px', 
                justifyContent: 'flex-end',
                marginTop: '32px', 
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  style={{
                    padding: '12px 24px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setShowAIProjectPreview(false);
                    setAiPreviewProject(null);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: '12px 28px', 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    fontSize: '14px', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    console.log('═══════════════════════════════════════════════');
                    console.log('🚀 DASHBOARD CREATE BUTTON CLICKED');
                    console.log('═══════════════════════════════════════════════');
                    console.log('📦 aiPreviewProject:', aiPreviewProject);
                    console.log('📦 aiPreviewProject.tasks:', aiPreviewProject.tasks?.length || 0);
                    
                    if (!aiPreviewProject.tasks || aiPreviewProject.tasks.length === 0) {
                      console.error('⚠️ WARNING: No tasks in aiPreviewProject!');
                      console.error('⚠️ aiPreviewProject keys:', Object.keys(aiPreviewProject));
                    } else {
                      console.log('✅ Tasks present:', aiPreviewProject.tasks.length);
                      console.log('📋 Task titles:', aiPreviewProject.tasks.map(t => t.title));
                    }
                    
                    // CRITICAL: Deep clone to prevent mutation during dispatch
                    const projectToCreate = {
                      ...aiPreviewProject,
                      tasks: aiPreviewProject.tasks ? [...aiPreviewProject.tasks] : [],
                      programming_languages: aiPreviewProject.programming_languages ? [...aiPreviewProject.programming_languages] : [],
                      topics: aiPreviewProject.topics ? [...aiPreviewProject.topics] : []
                    };
                    
                    console.log('📤 Dispatching project:', projectToCreate);
                    console.log('📤 Dispatching with tasks:', projectToCreate.tasks?.length || 0);
                    console.log('═══════════════════════════════════════════════');
                    
                    window.dispatchEvent(new CustomEvent('createAIProject', { 
                      detail: { project: projectToCreate }
                    }));
                    
                    setShowAIProjectPreview(false);
                    setAiPreviewProject(null);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#059669';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#10b981';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <Rocket size={16} />
                  Create This Project
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* ADD CHALLENGE MODAL PORTAL */}
      {showChallengeModal && selectedProjectForChallenge && createPortal(
        <div style={styles.challengeModalBackdrop}>
          <ProjectChallengeInterface
            projectId={selectedProjectForChallenge.projectId}
            onClose={handleCloseChallengeModal}
            onSuccess={handleChallengeSuccess}
          />
        </div>,
        document.body
      )}

      {/* ADD FADE IN ANIMATION FOR CHALLENGE MODAL */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default Dashboard;