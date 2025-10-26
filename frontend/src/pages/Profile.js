// frontend/src/pages/Profile.js - COMPLETE WITH AWARDS INTEGRATION AND SIDEBAR TOGGLE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import AwardsDisplay from '../components/AwardsDisplay';
import { User, Settings, Shield, Calendar, Target, Users, Eye, EyeOff, SquarePen, Award, PanelLeft } from 'lucide-react';

// Background symbols component with animations
const BackgroundSymbols = () => (
  <>
    <style dangerouslySetInnerHTML={{ __html: `
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
      .floating-symbol {
        animation-duration: 20s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
      }
      .floating-symbol:nth-child(1) { animation-name: floatAround1; }
      .floating-symbol:nth-child(2) { animation-name: floatAround2; animation-duration: 25s; }
      .floating-symbol:nth-child(3) { animation-name: floatAround3; animation-duration: 18s; }
      .floating-symbol:nth-child(4) { animation-name: floatAround1; animation-duration: 22s; animation-delay: -5s; }
      .floating-symbol:nth-child(5) { animation-name: floatAround2; animation-duration: 28s; animation-delay: -8s; }
      .floating-symbol:nth-child(6) { animation-name: floatAround3; animation-duration: 24s; animation-delay: -3s; }
      .floating-symbol:nth-child(7) { animation-name: floatAround1; animation-duration: 26s; animation-delay: -10s; }
      .floating-symbol:nth-child(8) { animation-name: floatAround2; animation-duration: 30s; animation-delay: -12s; }
    `}} />
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      {[
        { left: '81.02%', top: '94.27%', color: '#6C758E' },
        { left: '96.02%', top: '0%', color: '#2E3344' },
        { left: '0.07%', top: '41.2%', color: '#6C758E' },
        { left: '15%', top: '35%', color: '#3A4158' },
        { left: '65%', top: '25%', color: '#5A6B8C' },
        { left: '85%', top: '65%', color: '#2B2F3E' },
        { left: '42%', top: '35%', color: '#4F5A7A' },
        { left: '12%', top: '60%', color: '#8A94B8' }
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
          ...pos
        }}>&#60;/&#62;</div>
      ))}
    </div>
  </>
);

function Profile() {
  const { user, updateUser } = useAuth();
  const [editingSections, setEditingSections] = useState({
    personal: false,
    social: false
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    github_username: '',
    linkedin_url: '',
    years_experience: 0
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [projectStats, setProjectStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    friends: 0,
    learningModules: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Awards state
  const [awardStats, setAwardStats] = useState(null);
  const [loadingAwards, setLoadingAwards] = useState(false);

  // Sidebar state - initialize from localStorage with lazy initialization
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        github_username: user.github_username || '',
        linkedin_url: user.linkedin_url || '',
        years_experience: user.years_experience || 0
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingStats(true);
        const response = await projectService.getUserProjects();
        const projects = response.data.projects || [];
        
        const stats = {
          activeProjects: projects.filter(p => 
            p.status === 'active' || p.status === 'recruiting'
          ).length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          friends: 0,
          learningModules: 0
        };
        
        setProjectStats(stats);
      } catch (error) {
        console.error('Error fetching project stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProjectStats();
  }, [user?.id]);

  // Fetch award statistics
  useEffect(() => {
    const fetchAwardStats = async () => {
      try {
        setLoadingAwards(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/awards/statistics`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setAwardStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching award stats:', error);
      } finally {
        setLoadingAwards(false);
      }
    };

    if (user) {
      fetchAwardStats();
    }
  }, [user]);

  // Listen for sidebar state changes from Sidebar component
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('sidebarCollapsed', newCollapsedState.toString());
    
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  const toggleSectionEdit = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSaveProfile = async (section) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const cleanedData = {
        full_name: formData.full_name || '',
        bio: formData.bio || '',
        github_username: formData.github_username || '',
        linkedin_url: formData.linkedin_url || '',
        years_experience: formData.years_experience || 0
      };
      
      const response = await authService.updateProfile(cleanedData, token);
      
      if (response.success && response.data && response.data.user) {
        await updateUser(response.data.user, true);
        
        setEditingSections(prev => ({
          ...prev,
          [section]: false
        }));
        showNotification('Profile updated successfully!', 'success');
      } else {
        throw new Error('Unexpected response format');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.response?.data?.message || error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, token);
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      setShowPasswords({ current: false, new: false, confirm: false });
      showNotification('Password changed successfully!', 'success');
      
    } catch (error) {
      console.error('Error changing password:', error);
      showNotification(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompletionPercentage = () => {
    if (!user) return 0;
    
    let completed = 0;
    const total = 7;
    
    if (user.full_name) completed++;
    if (user.bio) completed++;
    if (user.github_username) completed++;
    if (user.linkedin_url) completed++;
    if (user.years_experience > 0) completed++;
    if (user.programming_languages && user.programming_languages.length > 0) completed++;
    if (user.topics && user.topics.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        style={{
          ...styles.toggleButton,
          left: isSidebarCollapsed ? '100px' : '290px'
        }}
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

        {notification.message && (
          <div style={{
            ...styles.notification,
            ...(notification.type === 'success' ? styles.notificationSuccess : styles.notificationError)
          }}>
            {notification.message}
          </div>
        )}

        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h1 style={styles.title}>
              <User size={28} style={{ color: '#3b82f6' }} />
              Profile
            </h1>
          </div>

          <div style={styles.profileHeader}>
            <div style={styles.avatarLarge}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 
               user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={styles.userDetails}>
              <h2 style={styles.userName}>
                {user?.full_name || user?.username || 'User'}
              </h2>
              <p style={styles.userMeta}>
                @{user?.username} • Joined {new Date(user?.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div style={styles.progressContainer}>
                <div style={styles.progressLabel}>
                  Profile Completion: {getProfileCompletionPercentage()}%
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${getProfileCompletionPercentage()}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.overviewSection}>
          <h3 style={styles.overviewTitle}>
            <Target size={20} style={{ color: '#3b82f6' }} />
            Dashboard Overview
          </h3>
          
          <div style={styles.userInfoContainer}>
            <div style={styles.userInfoSection}>
              <h4 style={styles.userInfoTitle}>
                <User size={16} style={{ color: '#3b82f6', marginRight: '8px' }} />
                Profile Info
              </h4>
              <div style={styles.userInfoGrid}>
                <div style={styles.userInfoItem}>
                  <span style={styles.userInfoLabel}>Experience:</span>
                  <span style={styles.userInfoValue}>{user?.years_experience || 0} years</span>
                </div>
                <div style={styles.userInfoItem}>
                  <span style={styles.userInfoLabel}>Username:</span>
                  <span style={styles.userInfoValue}>@{user?.username}</span>
                </div>
                <div style={styles.userInfoItem}>
                  <span style={styles.userInfoLabel}>Email:</span>
                  <span style={styles.userInfoValue}>{user?.email}</span>
                </div>
                {user?.github_username && (
                  <div style={styles.userInfoItem}>
                    <span style={styles.userInfoLabel}>GitHub:</span>
                    <span style={styles.userInfoValue}>@{user.github_username}</span>
                  </div>
                )}
              </div>
              
              {user?.bio && (
                <div style={styles.bioSection}>
                  <span style={styles.userInfoLabel}>Bio:</span>
                  <p style={styles.bioText}>{user.bio}</p>
                </div>
              )}
            </div>

            <div style={styles.userInfoSection}>
              <h4 style={styles.userInfoTitle}>Programming Languages</h4>
              {user?.programming_languages && user.programming_languages.length > 0 ? (
                <div style={styles.skillsContainer}>
                  {user.programming_languages.map(lang => (
                    <span key={lang.id} style={styles.languageTag}>
                      {lang.programming_languages?.name || lang.name}
                      <span style={styles.skillLevel}>({lang.proficiency_level})</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={styles.emptySkills}>No programming languages added yet</p>
              )}
            </div>

            <div style={styles.userInfoSection}>
              <h4 style={styles.userInfoTitle}>Areas of Interest</h4>
              {user?.topics && user.topics.length > 0 ? (
                <div style={styles.skillsContainer}>
                  {user.topics.map(topic => (
                    <span key={topic.id} style={styles.topicTag}>
                      {topic.topics?.name || topic.name}
                      <span style={styles.skillLevel}>({topic.interest_level})</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={styles.emptySkills}>No topics selected yet</p>
              )}
            </div>
          </div>

          <div style={styles.statsContainer}>
            <div style={styles.dashboardStatCard}>
              <div style={styles.statValue}>
                {loadingStats ? '...' : projectStats.activeProjects}
              </div>
              <div style={styles.statLabelDashboard}>Active Projects</div>
            </div>
            <div style={styles.dashboardStatCard}>
              <div style={styles.statValue}>
                {loadingStats ? '...' : projectStats.completedProjects}
              </div>
              <div style={styles.statLabelDashboard}>Completed Projects</div>
            </div>
            <div style={styles.dashboardStatCard}>
              <div style={styles.statValue}>
                {loadingStats ? '...' : projectStats.friends}
              </div>
              <div style={styles.statLabelDashboard}>Friends</div>
            </div>
            <div style={styles.dashboardStatCard}>
              <div style={styles.statValue}>
                {loadingStats ? '...' : projectStats.learningModules}
              </div>
              <div style={styles.statLabelDashboard}>Learning Modules</div>
            </div>
            <div style={styles.dashboardStatCard}>
              <div style={styles.statValue}>
                {loadingAwards ? '...' : awardStats?.total_awards || 0}
              </div>
              <div style={styles.statLabelDashboard}>Total Awards</div>
            </div>
          </div>

          {/* Awards Section */}
          <div style={styles.awardsSection}>
            <h3 style={styles.sectionTitle}>
              <Award size={18} style={{ color: '#FFD700' }} />
              Your Achievements
            </h3>
            <AwardsDisplay compact={false} />
          </div>

          <div style={styles.activitySection}>
            <h3 style={styles.sectionTitle}>
              <Target size={18} style={{ color: '#10b981' }} />
              Recent Activity
            </h3>
            <div style={styles.emptyState}>
              No recent activity yet. Start by joining a project or connecting with other developers!
            </div>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.mainContent}>
            <div style={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{...styles.sectionTitle, margin: 0}}>
                  <User size={18} style={{ color: '#3b82f6' }} />
                  Personal Information
                </h3>
                <button
                  onClick={() => toggleSectionEdit('personal')}
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#3b82f6',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(59, 130, 246, 0.25)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(59, 130, 246, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <SquarePen size={16} />
                </button>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                {editingSections.personal ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p style={styles.value}>{formData.full_name || 'Not provided'}</p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Bio</label>
                {editingSections.personal ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    style={{...styles.input, minHeight: '100px'}}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p style={styles.value}>{formData.bio || 'No bio provided'}</p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Years of Experience</label>
                {editingSections.personal ? (
                  <input
                    type="number"
                    name="years_experience"
                    value={formData.years_experience}
                    onChange={handleInputChange}
                    style={styles.input}
                    min="0"
                    max="50"
                  />
                ) : (
                  <p style={styles.value}>{formData.years_experience || 0} years</p>
                )}
              </div>

              {editingSections.personal && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    onClick={() => handleSaveProfile('personal')}
                    disabled={loading}
                    style={styles.saveButton}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => toggleSectionEdit('personal')}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div style={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{...styles.sectionTitle, margin: 0}}>
                  <Users size={18} style={{ color: '#10b981' }} />
                  Social Links
                </h3>
                <button
                  onClick={() => toggleSectionEdit('social')}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    color: '#10b981',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(16, 185, 129, 0.25)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(16, 185, 129, 0.15)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <SquarePen size={16} />
                </button>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>GitHub Username</label>
                {editingSections.social ? (
                  <input
                    type="text"
                    name="github_username"
                    value={formData.github_username}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="your-github-username"
                  />
                ) : (
                  <p style={styles.value}>{formData.github_username || 'Not provided'}</p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>LinkedIn URL</label>
                {editingSections.social ? (
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                ) : (
                  <p style={styles.value}>{formData.linkedin_url || 'Not provided'}</p>
                )}
              </div>

              {editingSections.social && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    onClick={() => handleSaveProfile('social')}
                    disabled={loading}
                    style={styles.saveButton}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => toggleSectionEdit('social')}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Shield size={18} style={{ color: '#f59e0b' }} />
                Security Settings
              </h3>

              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  style={styles.changePasswordButton}
                >
                  Change Password
                </button>
              ) : (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        style={styles.input}
                        placeholder="Enter current password"
                      />
                      <button
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        style={styles.eyeButton}
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        style={styles.input}
                        placeholder="Enter new password"
                      />
                      <button
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        style={styles.eyeButton}
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        style={styles.input}
                        placeholder="Confirm new password"
                      />
                      <button
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        style={styles.eyeButton}
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      style={styles.saveButton}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setShowPasswords({ current: false, new: false, confirm: false });
                      }}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={styles.sidebar}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <Calendar size={18} style={{ color: '#8b5cf6' }} />
                Account Details
              </h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>User ID</label>
                <p style={{ ...styles.value, fontFamily: 'monospace' }}>
                  {user?.id}
                </p>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Profile Tips</h3>
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.08))',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(20px)'
              }}>
                <p style={{ margin: '0 0 12px 0', fontWeight: '500', color: '#d1d5db' }}>
                  Complete your profile to:
                </p>
                <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.6', color: '#9ca3af' }}>
                  <li>Get better project recommendations</li>
                  <li>Connect with like-minded collaborators</li>
                  <li>Showcase your skills and experience</li>
                  <li>Build your professional network</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          input:focus, textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
          }

          button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .content {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </>
  );
}

const styles = {
  toggleButton: {
    position: 'fixed',
    top: '20px',
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
    minHeight: '100vh',
    backgroundColor: '#0F1116',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    paddingLeft: '270px',
    marginLeft: '-150px'
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    zIndex: 9999,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease-out'
  },
  notificationSuccess: {
    backgroundColor: '#10b981',
    border: '1px solid #059669'
  },
  notificationError: {
    backgroundColor: '#ef4444',
    border: '1px solid #dc2626'
  },
  header: {
    position: 'relative',
    zIndex: 10,
    marginBottom: '20px'
  },
  headerTop: {
    marginBottom: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  profileHeader: {
    background: 'rgba(26, 28, 32, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '30px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    flexShrink: 0,
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 8px 0'
  },
  userMeta: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: '0 0 16px 0'
  },
  progressContainer: {
    marginTop: '12px'
  },
  progressLabel: {
    fontSize: '14px',
    color: '#d1d5db',
    marginBottom: '6px'
  },
  progressBar: {
    width: '200px',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(to right, #3b82f6, #2563eb)',
    transition: 'width 0.3s ease'
  },
  content: {
    position: 'relative',
    zIndex: 10,
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
    alignItems: 'start'
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  section: {
    background: 'rgba(26, 28, 32, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  },
  value: {
    color: '#9ca3af',
    fontSize: '14px',
    margin: 0
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#d1d5db',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  changePasswordButton: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  overviewSection: {
    background: 'rgba(26, 28, 32, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
  },
  overviewTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 20px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  userInfoContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  userInfoSection: {
    background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.12), rgba(30, 41, 59, 0.08))',
    border: '1px solid rgba(51, 65, 85, 0.25)',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(20px)'
  },
  userInfoTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    display: 'flex',
    alignItems: 'center'
  },
  userInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  userInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  userInfoLabel: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  userInfoValue: {
    fontSize: '14px',
    color: '#d1d5db'
  },
  bioSection: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  bioText: {
    fontSize: '14px',
    color: '#d1d5db',
    margin: '8px 0 0 0',
    lineHeight: '1.5'
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  languageTag: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15))',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    color: '#60a5fa',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500'
  },
  topicTag: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#34d399',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500'
  },
  skillLevel: {
    opacity: 0.7,
    fontSize: '12px',
    marginLeft: '4px'
  },
  emptySkills: {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic',
    margin: 0
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  dashboardStatCard: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    backdropFilter: 'blur(20px)'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#3b82f6',
    margin: '0 0 4px 0'
  },
  statLabelDashboard: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0
  },
  awardsSection: {
    marginTop: '32px',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  activitySection: {
    marginTop: '20px'
  },
  emptyState: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px 20px',
    fontSize: '14px',
    fontStyle: 'italic'
  }
};

export default Profile;