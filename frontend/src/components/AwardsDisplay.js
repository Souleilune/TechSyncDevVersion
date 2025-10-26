// frontend/src/components/AwardsDisplay.js
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Gem, Flame, Award, Calendar } from 'lucide-react';
import awardsService from '../services/awardsService';

const AwardsDisplay = ({ projectId = null, compact = false }) => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAwards();
  }, [projectId]);

  const loadAwards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = projectId 
        ? await awardsService.getProjectAwards(projectId)
        : await awardsService.getUserAwards();
      
      setAwards(response.data || []);
    } catch (err) {
      console.error('Error loading awards:', err);
      setError(err.response?.data?.message || 'Failed to load awards');
    } finally {
      setLoading(false);
    }
  };

  const getAwardIcon = (iconName) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      zap: Zap,
      gem: Gem,
      flame: Flame,
      award: Award
    };
    return icons[iconName] || Trophy;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <div style={styles.loadingText}>Loading awards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <Award size={24} style={{ color: '#ef4444', marginBottom: '8px' }} />
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  if (awards.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <Trophy size={48} style={{ color: '#6b7280', marginBottom: '16px', opacity: 0.5 }} />
        <div style={styles.emptyTitle}>No Awards Yet</div>
        <div style={styles.emptySubtitle}>
          {projectId 
            ? 'Complete your project goals and challenges to earn awards!'
            : 'Start working on solo projects to earn your first award!'}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div style={styles.compactContainer}>
        {awards.slice(0, 3).map((award) => {
          const IconComponent = getAwardIcon(award.award_icon);
          return (
            <div 
              key={award.id} 
              style={{
                ...styles.compactAward,
                borderColor: award.award_color
              }}
              title={award.award_description}
            >
              <IconComponent 
                size={20} 
                style={{ color: award.award_color }} 
              />
            </div>
          );
        })}
        {awards.length > 3 && (
          <div style={styles.moreAwards}>
            +{awards.length - 3}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Trophy size={24} style={{ color: '#FFD700' }} />
        <h3 style={styles.title}>Your Awards</h3>
        <div style={styles.badge}>{awards.length}</div>
      </div>

      <div style={styles.grid}>
        {awards.map((award) => {
          const IconComponent = getAwardIcon(award.award_icon);
          return (
            <div 
              key={award.id} 
              style={{
                ...styles.card,
                borderColor: award.award_color
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${award.award_color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${award.award_color}20`;
              }}
            >
              <div 
                style={{
                  ...styles.iconContainer,
                  backgroundColor: `${award.award_color}15`
                }}
              >
                <IconComponent 
                  size={32} 
                  style={{ color: award.award_color }} 
                />
              </div>

              <div style={styles.cardContent}>
                <h4 style={styles.awardTitle}>{award.award_title}</h4>
                <p style={styles.awardDescription}>{award.award_description}</p>
                
                {award.metadata && (
                  <div style={styles.metadata}>
                    {award.metadata.project_title && (
                      <div style={styles.metadataItem}>
                        <strong>Project:</strong> {award.metadata.project_title}
                      </div>
                    )}
                    {award.metadata.completion_percentage && (
                      <div style={styles.metadataItem}>
                        <strong>Completion:</strong> {award.metadata.completion_percentage}%
                      </div>
                    )}
                    {award.metadata.total_challenges && (
                      <div style={styles.metadataItem}>
                        <strong>Challenges:</strong> {award.metadata.completed_challenges}/{award.metadata.total_challenges}
                      </div>
                    )}
                  </div>
                )}

                <div style={styles.date}>
                  <Calendar size={14} style={{ marginRight: '4px' }} />
                  Earned on {formatDate(award.earned_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f3f4f6',
    margin: 0,
    flex: 1
  },
  badge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    color: '#FFD700',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '2px solid',
    borderRadius: '16px',
    padding: '24px',
    transition: 'all 0.3s ease',
    cursor: 'default'
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  awardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f3f4f6',
    margin: 0
  },
  awardDescription: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
    lineHeight: '1.5'
  },
  metadata: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '8px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px'
  },
  metadataItem: {
    fontSize: '13px',
    color: '#d1d5db',
    display: 'flex',
    gap: '8px'
  },
  date: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px'
  },
  compactContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  compactAward: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease'
  },
  moreAwards: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '600',
    padding: '0 8px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '12px'
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '14px',
    color: '#9ca3af'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  },
  errorText: {
    fontSize: '14px',
    color: '#f87171'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 255, 255, 0.1)'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: '8px'
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: '400px'
  }
};

export default AwardsDisplay;