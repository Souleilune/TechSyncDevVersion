// frontend/src/pages/Learns.js - WITH LOADING STATE AND ANIMATED BACKGROUND
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, BookMarked, ExternalLink, Clock, TrendingUp, 
  PlayCircle, CheckCircle, Lock, Award, Code, Globe, 
  BookOpen, Laptop, Users, Star, ChevronRight, PanelLeft
} from 'lucide-react';
import PersonalLearnings from '../pages/PersonalLearnings';
import { useAuth } from '../contexts/AuthContext';

// Background symbols component with animations - MATCHING PROJECTS
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

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}} />
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
        left: '52.81%', top: '48.12%', color: '#2E3344'
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
        left: '28.19%', top: '71.22%', color: '#292A2E'
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
        left: '95.09%', top: '48.12%', color: '#ABB5CE'
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
        left: '86.46%', top: '15.33%', color: '#2E3344'
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
        left: '7.11%', top: '80.91%', color: '#ABB5CE'
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
        left: '48.06%', top: '8.5%', color: '#ABB5CE'
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
        left: '72.84%', top: '4.42%', color: '#2E3344'
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
        left: '9.6%', top: '0%', color: '#1F232E'
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
        left: '31.54%', top: '54.31%', color: '#6C758E'
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
        left: '25.28%', top: '15.89%', color: '#1F232E'
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
        left: '48.55%', top: '82.45%', color: '#292A2E'
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
        left: '24.41%', top: '92.02%', color: '#2E3344'
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
        left: '0%', top: '12.8%', color: '#ABB5CE'
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
        left: '81.02%', top: '94.27%', color: '#6C758E'
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
        left: '96.02%', top: '0%', color: '#2E3344'
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
        left: '0.07%', top: '41.2%', color: '#6C758E'
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
        left: '15%', top: '35%', color: '#3A4158'
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
        left: '65%', top: '25%', color: '#5A6B8C'
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
        left: '85%', top: '65%', color: '#2B2F3E'
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
        left: '42%', top: '35%', color: '#4F5A7A'
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
        left: '12%', top: '60%', color: '#8A94B8'
      }}>&#60;/&#62;</div>
    </div>
  </>
);

const Learns = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resources');
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Sidebar state - initialize from localStorage with lazy initialization
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    const fetchArticles = async () => {
      if (activeTab === 'resources' && !initialLoading) {
        setLoadingArticles(true);
        try {
          const response = await fetch('https://dev.to/api/articles?per_page=12&top=7');
          const data = await response.json();
          setArticles(data);
        } catch (error) {
          console.error('Error fetching articles:', error);
        } finally {
          setLoadingArticles(false);
        }
      }
    };
    fetchArticles();
  }, [activeTab, initialLoading]);

   useEffect(() => {
    const fetchBookmarkedArticles = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        const response = await fetch(`${API_URL}/recommendations/bookmarked-articles/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.bookmarkedArticles) {
            setBookmarkedArticles(data.bookmarkedArticles);
          }
        }
      } catch (error) {
        console.error('Error fetching bookmarked articles:', error);
      }
    };

    fetchBookmarkedArticles();
  }, [isAuthenticated, user, API_URL]);

  const toggleBookmark = async (article) => {
    if (!isAuthenticated || !user?.id) {
      alert('Please log in to bookmark articles');
      return;
    }

    const isBookmarked = bookmarkedArticles.some(b => b.id === article.id);
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`${API_URL}/recommendations/bookmark-article`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ articleId: article.id })
        });

        if (response.ok) {
          setBookmarkedArticles(bookmarkedArticles.filter(b => b.id !== article.id));
        } else {
          throw new Error('Failed to remove bookmark');
        }
      } else {
        // Add bookmark
        const response = await fetch(`${API_URL}/recommendations/bookmark-article`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            article: {
              id: article.id,
              title: article.title,
              description: article.description,
              url: article.url,
              cover_image: article.cover_image,
              tag_list: article.tag_list,
              user: article.user,
              reading_time_minutes: article.reading_time_minutes,
              positive_reactions_count: article.positive_reactions_count,
              published_at: article.published_at
            }
          })
        });

        if (response.ok) {
          setBookmarkedArticles([...bookmarkedArticles, article]);
        } else {
          throw new Error('Failed to add bookmark');
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const styles = {
    // Sidebar toggle button style
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
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: '#fff',
      padding: '20px',
      paddingLeft: '120px',
      marginLeft: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      transition: 'padding-left 0.3s ease'
    },
    innerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 10
    },
    header: {
      marginBottom: '2rem',
      position: 'relative',
      zIndex: 10
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      color: '#9ca3af',
      fontSize: '1.1rem'
    },
    tabContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      borderBottom: '2px solid #2d3748',
      position: 'relative',
      zIndex: 10
    },
    tabButton: {
      padding: '1rem 1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      gap: '1rem',
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 10
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#fff',
      margin: 0
    },
    loading: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      minHeight: 'calc(100vh - 100px)',
      fontSize: '16px',
      color: '#9ca3af'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '3rem',
      position: 'relative',
      zIndex: 10
    },
    spinner: {
      display: 'inline-block',
      width: '50px',
      height: '50px',
      border: '4px solid #2d3748',
      borderTop: '4px solid #60a5fa',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    articlesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
      position: 'relative',
      zIndex: 10
    },
    articleCard: {
      backgroundColor: '#1a1d24',
      borderRadius: '12px',
      border: '1px solid #2d3748',
      overflow: 'hidden',
      transition: 'all 0.2s',
      cursor: 'pointer'
    },
    articleImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover'
    },
    articleContent: {
      padding: '1.5rem'
    },
    tagsContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    tag: {
      padding: '0.25rem 0.75rem',
      backgroundColor: '#60a5fa20',
      color: '#60a5fa',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    articleTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
      color: '#fff',
      lineHeight: '1.4'
    },
    articleDescription: {
      fontSize: '0.875rem',
      color: '#9ca3af',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    articleFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '1rem',
      borderTop: '1px solid #2d3748'
    },
    articleMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    actionButtons: {
      display: 'flex',
      gap: '0.5rem'
    },
    iconButton: {
      padding: '0.5rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#fff'
    },
    bookmarkButton: {
      backgroundColor: '#2d3748'
    },
    bookmarkButtonActive: {
      backgroundColor: '#8b5cf6'
    },
    externalLinkButton: {
      padding: '0.5rem',
      backgroundColor: '#60a5fa',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#fff',
      display: 'flex',
      textDecoration: 'none'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      backgroundColor: '#1a1d24',
      borderRadius: '12px',
      border: '1px solid #2d3748',
      position: 'relative',
      zIndex: 10
    },
    emptyStateText: {
      color: '#9ca3af',
      fontSize: '1rem'
    }
  };

  if (initialLoading) {
    return (
      <>
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
            <span>Loading learning hub...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
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
        
        <div style={styles.innerContainer}>
          
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>
              <BookOpen size={28} style={{ color: '#3b82f6' }} />
              Learning Hub
            </h1>
            <p style={styles.subtitle}>
              Master new skills with curated resources and personalized recommendations
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={styles.tabContainer}>
            {[
              { id: 'resources', label: 'External Resources', icon: ExternalLink },
              { id: 'my-learnings', label: 'My Learnings', icon: BookMarked }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...styles.tabButton,
                    color: activeTab === tab.id ? '#60a5fa' : '#9ca3af',
                    borderBottom: activeTab === tab.id ? '3px solid #60a5fa' : '3px solid transparent'
                  }}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* External Resources Tab */}
          {activeTab === 'resources' && (
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  Trending Developer Articles
                </h2>
              </div>

              {loadingArticles ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.spinner} />
                </div>
              ) : (
                <div style={styles.articlesGrid}>
                  {articles.map((article) => {
                    const isBookmarked = bookmarkedArticles.some(b => b.id === article.id);
                    
                    return (
                      <div
                        key={article.id}
                        style={styles.articleCard}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#60a5fa';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#2d3748';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {article.cover_image && (
                          <img
                            src={article.cover_image}
                            alt={article.title}
                            style={styles.articleImage}
                          />
                        )}
                        
                        <div style={styles.articleContent}>
                          <div style={styles.tagsContainer}>
                            {article.tag_list.slice(0, 3).map((tag, idx) => (
                              <span key={idx} style={styles.tag}>
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <h3 style={styles.articleTitle}>
                            {article.title}
                          </h3>

                          <p style={styles.articleDescription}>
                            {article.description}
                          </p>

                          <div style={styles.articleFooter}>
                            <div style={styles.articleMeta}>
                              <span style={styles.metaItem}>
                                <Clock size={14} />
                                {article.reading_time_minutes} min
                              </span>
                              <span style={styles.metaItem}>
                                <Star size={14} />
                                {article.positive_reactions_count}
                              </span>
                            </div>

                            <div style={styles.actionButtons}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(article);
                                }}
                                style={{
                                  ...styles.iconButton,
                                  backgroundColor: isBookmarked ? '#8b5cf6' : '#2d3748'
                                }}
                              >
                                <BookMarked size={16} fill={isBookmarked ? '#fff' : 'none'} />
                              </button>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.externalLinkButton}
                              >
                                <ExternalLink size={16} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* My Learnings Tab */}
          {activeTab === 'my-learnings' && (
            <>
              {isAuthenticated && user && user.id ? (
                <PersonalLearnings userId={user.id} />
              ) : (
                <div style={styles.emptyState}>
                  <p style={styles.emptyStateText}>
                    Please log in to view your personal learnings.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Learns;