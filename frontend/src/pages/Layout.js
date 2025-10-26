// frontend/src/pages/Layout.js
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  // Track sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
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
      <Sidebar />
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default Layout;