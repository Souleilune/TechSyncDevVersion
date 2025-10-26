// frontend/src/pages/soloproject/SoloProjectLayout.js - FIXED TO MATCH PROJECTLAYOUT.JS PATTERN
import React, { useState, useEffect } from 'react';
import SoloProjectSidebar from './SoloProjectSidebar';

function SoloProjectLayout({ children }) {
  // Track sidebar collapsed state - using soloProjectSidebarCollapsed key
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('soloProjectSidebarCollapsed');
    return saved === 'true';
  });

  // Listen for sidebar toggle events - using soloProjectSidebarToggle event
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('soloProjectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('soloProjectSidebarToggle', handleSidebarToggle);
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
      <SoloProjectSidebar />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default SoloProjectLayout;