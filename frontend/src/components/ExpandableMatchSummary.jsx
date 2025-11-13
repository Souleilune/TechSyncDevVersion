// ============================================================
// EXPANDABLE MATCH SUMMARY COMPONENT
// Add to ProjectDetailModal.jsx - Replaces matchBanner section
// ============================================================

import React, { useState, useMemo } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Lightbulb, Target, TrendingUp } from 'lucide-react';

const ExpandableMatchSummary = ({ score, matchFactors, project, userProfile }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const mf = matchFactors || {};
  
  // Generate summary data
  const summaryData = useMemo(() => {
    return generateProjectSummary(project, mf, userProfile, score);
  }, [project, mf, userProfile, score]);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={styles.container}>
      {/* Collapsed View - Match Banner */}
      <div 
        style={styles.matchBanner}
        onClick={toggleExpand}
      >
        <div style={styles.matchBannerLeft}>
          <div style={styles.matchScore}>
            <Sparkles size={20} />
            <span style={styles.matchScoreText}>{score}% Match</span>
          </div>
          <div style={styles.matchDetails}>
            {mf.languageFit?.coverage && (
              <span style={styles.matchDetail}>
                {mf.languageFit.coverage}% Language Fit
              </span>
            )}
            {mf.topicCoverage?.matches?.length > 0 && (
              <span style={styles.matchDetail}>
                {mf.topicCoverage.matches.length} Topic Matches
              </span>
            )}
          </div>
        </div>
        
        <button 
          style={styles.expandButton}
          onClick={toggleExpand}
        >
          <span style={styles.expandButtonText}>
            {isExpanded ? 'Hide' : 'Summary'}
          </span>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded View - AI Summary */}
      {isExpanded && (
        <div style={styles.expandedContent}>
          {/* Headline */}
          <div style={styles.summarySection}>
            <div style={styles.headlineBox}>
              <Lightbulb size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
              <p style={styles.headline}>{summaryData.headline}</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={styles.columnsContainer}>
            {/* Left Column: What You'll Work On */}
            <div style={styles.column}>
              <div style={styles.columnHeader}>
                <Target size={16} style={{ color: '#3b82f6' }} />
                <span style={styles.columnTitle}>What You'll Work On</span>
              </div>
              <p style={styles.columnText}>{summaryData.whatYouWillDo}</p>
            </div>

            {/* Right Column: Why You're A Great Fit */}
            <div style={styles.column}>
              <div style={styles.columnHeader}>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
                <span style={styles.columnTitle}>Why You're A Great Fit</span>
              </div>
              <ul style={styles.reasonsList}>
                {summaryData.matchReasons.slice(0, 4).map((reason, idx) => (
                  <li key={idx} style={styles.reasonItem}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Expectations Footer */}
          {summaryData.expectations && (
            <div style={styles.expectationsBar}>
              <span style={styles.expectationsLabel}>Expected Commitment:</span>
              <span style={styles.expectationsValue}>{summaryData.expectations}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// SUMMARY GENERATION LOGIC (Same as before)
// ============================================================

function generateProjectSummary(project, matchFactors, userProfile, score) {
  if (!project) return getDefaultSummary();

  const headline = generateHeadline(score, project);
  const whatYouWillDo = generateWhatYouWillDo(project);
  const matchReasons = generateMatchReasons(matchFactors, project, userProfile);
  const expectations = generateExpectations(project);

  return { headline, whatYouWillDo, matchReasons, expectations };
}

function getDefaultSummary() {
  return {
    headline: 'This project matches your profile.',
    whatYouWillDo: 'Collaborate with the team to build and deliver this project.',
    matchReasons: ['Your skills align with project requirements'],
    expectations: '10-15 hours per week'
  };
}

function generateHeadline(score, project) {
  const difficulty = project.difficulty_level?.toLowerCase() || 'medium';
  
  if (score >= 80) {
    return `This ${difficulty} project is an excellent match for your skills and experience. You have all the foundations needed to make a strong contribution.`;
  } else if (score >= 70) {
    return `This ${difficulty} project aligns well with your current skill set. You'll be able to contribute effectively while learning new techniques.`;
  } else if (score >= 60) {
    return `This ${difficulty} project offers a good balance of familiar and new challenges, helping you grow your skills through practical application.`;
  } else {
    return `This ${difficulty} project will stretch your abilities and help you build new skills in areas you're developing.`;
  }
}

function generateWhatYouWillDo(project) {
  const difficulty = project.difficulty_level?.toLowerCase() || 'medium';
  const teamSize = project.maximum_members || 4;
  const technologies = project.technologies || [];
  const techStr = technologies.length > 0 
    ? `${technologies.slice(0, 2).join(' and ')}` 
    : 'various technologies';

  const templates = {
    easy: [
      `You'll collaborate with ${teamSize - 1} other team members to build ${project.title}. This project focuses on implementing core features using ${techStr}, giving you hands-on experience with fundamental development patterns.`,
      `As part of a ${teamSize}-person team, you'll help create ${project.title}. You'll work on foundational features, learn best practices, and gain practical experience with ${techStr}.`
    ],
    medium: [
      `You'll work with ${teamSize - 1} developers to architect and implement ${project.title}. This involves designing solutions, writing production-quality code in ${techStr}, and collaborating on technical decisions.`,
      `Join a ${teamSize}-person team building ${project.title}. You'll tackle moderate complexity challenges, implement key features using ${techStr}, and contribute to both design and development.`
    ],
    hard: [
      `You'll collaborate with ${teamSize - 1} experienced developers on ${project.title}. This advanced project involves complex problem-solving, system design decisions, and sophisticated implementations using ${techStr}.`,
      `Be part of a ${teamSize}-person team tackling ${project.title}. You'll work on challenging technical problems, make architectural decisions, and push your ${techStr} skills to the next level.`
    ]
  };

  const options = templates[difficulty] || templates.medium;
  return options[Math.floor(Math.random() * options.length)];
}

function generateMatchReasons(matchFactors, project, userProfile) {
  const reasons = [];
  const mf = matchFactors;

  // Language Match
  if (mf.languageMatch && mf.languageMatch.score > 0) {
    const matched = mf.languageMatch.matched || [];
    const primary = mf.languageMatch.primary || [];
    
    if (primary.length > 0) {
      reasons.push(`You're proficient in ${primary.join(', ')}, which ${primary.length === 1 ? 'is' : 'are'} the primary ${primary.length === 1 ? 'language' : 'languages'} for this project`);
    } else if (matched.length > 0) {
      reasons.push(`Your experience with ${matched.slice(0, 2).join(' and ')} matches the technology stack`);
    }
  }

  // Topic Match
  if (mf.topicMatch && mf.topicMatch.score > 0) {
    const matchedTopics = mf.topicMatch.matched || [];
    if (matchedTopics.length > 0) {
      const topicStr = matchedTopics.length === 1 
        ? matchedTopics[0]
        : `${matchedTopics.slice(0, 2).join(' and ')}`;
      reasons.push(`This project aligns with your interest in ${topicStr}`);
    }
  }

  // Experience Level Match
  if (mf.experienceMatch && mf.experienceMatch.score > 0) {
    const difficulty = project.difficulty_level?.toLowerCase();
    const userExp = userProfile?.years_experience || 0;
    
    if (difficulty === 'easy' || difficulty === 'beginner') {
      if (userExp <= 2) {
        reasons.push('The beginner-friendly difficulty level matches your current experience');
      } else {
        reasons.push('This is a great opportunity to mentor others and solidify fundamentals');
      }
    } else if (difficulty === 'medium' || difficulty === 'intermediate') {
      if (userExp >= 1 && userExp <= 4) {
        reasons.push('The intermediate difficulty is perfect for your experience level');
      } else if (userExp < 1) {
        reasons.push('While challenging, you have the foundation to succeed with team support');
      } else {
        reasons.push('Your experience will be valuable for guiding the team through challenges');
      }
    } else if (difficulty === 'hard' || difficulty === 'advanced') {
      if (userExp >= 3) {
        reasons.push('The advanced difficulty matches your extensive experience');
      } else {
        reasons.push('This challenging project will accelerate your skill development');
      }
    }
  }

  // Team Size Fit
  const current = project.current_members || 0;
  const max = project.maximum_members || 4;
  const spotsLeft = max - current;
  
  if (spotsLeft <= 2 && spotsLeft > 0) {
    reasons.push(`Only ${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left - join a nearly complete team`);
  } else if (current === 0) {
    reasons.push('Be a founding team member and help shape the project direction');
  }

  // Deadline proximity
  if (project.deadline) {
    const deadline = new Date(project.deadline);
    const now = new Date();
    const daysUntil = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil > 60) {
      reasons.push('Ample time to contribute meaningfully with a comfortable deadline');
    } else if (daysUntil > 30) {
      reasons.push('Well-paced timeline that balances learning and delivery');
    } else if (daysUntil > 0) {
      reasons.push('Fast-paced project that will sharpen your rapid development skills');
    }
  }

  // Fallback reasons
  if (reasons.length < 2) {
    reasons.push('Your skill profile indicates strong compatibility with the project requirements');
    if (project.status === 'recruiting') {
      reasons.push('The team is actively recruiting and ready to onboard new members');
    }
  }

  return reasons.slice(0, 4);
}

function generateExpectations(project) {
  const duration = calculateProjectDuration(project);
  const difficulty = project.difficulty_level?.toLowerCase() || 'medium';
  
  const commitmentMap = {
    easy: {
      short: '5-10 hours per week for 2-4 weeks',
      medium: '5-10 hours per week for 1-2 months',
      long: '5-10 hours per week for 2-3 months'
    },
    medium: {
      short: '10-15 hours per week for 4-6 weeks',
      medium: '10-15 hours per week for 2-3 months',
      long: '10-15 hours per week for 3-4 months'
    },
    hard: {
      short: '15-20 hours per week for 6-8 weeks',
      medium: '15-20 hours per week for 2-4 months',
      long: '15-20 hours per week for 4-6 months'
    }
  };

  const difficultyCommitments = commitmentMap[difficulty] || commitmentMap.medium;
  return difficultyCommitments[duration] || difficultyCommitments.medium;
}

function calculateProjectDuration(project) {
  if (!project.deadline) return 'medium';
  
  const deadline = new Date(project.deadline);
  const now = new Date();
  const daysUntil = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 45) return 'short';
  if (daysUntil > 90) return 'long';
  return 'medium';
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  container: {
    width: '100%'
  },
  matchBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: '12px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.2)'
    }
  },
  matchBannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1
  },
  matchScore: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#60a5fa'
  },
  matchScoreText: {
    fontSize: '18px',
    fontWeight: '700'
  },
  matchDetails: {
    display: 'flex',
    gap: '12px',
    fontSize: '13px'
  },
  matchDetail: {
    color: '#93c5fd',
    fontWeight: '500'
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    borderRadius: '8px',
    color: '#60a5fa',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.3)',
      borderColor: 'rgba(59, 130, 246, 0.6)'
    }
  },
  expandButtonText: {
    fontSize: '13px'
  },
  expandedContent: {
    marginTop: '12px',
    padding: '20px',
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    animation: 'slideDown 0.3s ease-out'
  },
  summarySection: {
    marginBottom: '16px'
  },
  headlineBox: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  headline: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#e5e7eb',
    fontWeight: '500'
  },
  columnsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  columnTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#d1d5db'
  },
  columnText: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#9ca3af'
  },
  reasonsList: {
    margin: 0,
    paddingLeft: '20px',
    listStyleType: 'disc'
  },
  reasonItem: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#9ca3af',
    marginBottom: '6px'
  },
  expectationsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },
  expectationsLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#93c5fd'
  },
  expectationsValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#60a5fa'
  }
};

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default ExpandableMatchSummary;