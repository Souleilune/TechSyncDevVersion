// frontend/src/pages/ProjectLayout.js - FIXED TO MATCH LAYOUT.JS PATTERN
import React, { useState, useEffect } from 'react';
import ProjectSidebar from './ProjectSidebar';

function ProjectLayout({ children }) {
  // Track sidebar collapsed state - using projectSidebarCollapsed key
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('projectSidebarCollapsed');
    return saved === 'true';
  });

  // Listen for sidebar toggle events - using projectSidebarToggle event
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('projectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('projectSidebarToggle', handleSidebarToggle);
  }, []);

  const styles = {
    layoutContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#0F1116' // Match dashboard dark background
    },
    mainContent: {
      flex: 1,
      marginLeft: isSidebarCollapsed ? '60px' : '250px', // Dynamic margin based on sidebar state
      backgroundColor: '#0F1116', // Dark background instead of white
      overflowY: 'auto',
      transition: 'margin-left 0.3s ease' // Smooth transition
    }
  };

  return (
    <div style={styles.layoutContainer}>
      <ProjectSidebar />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default ProjectLayout;