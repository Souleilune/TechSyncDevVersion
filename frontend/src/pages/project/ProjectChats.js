// frontend/src/pages/project/ProjectChats.js - ALIGNED WITH DASHBOARD THEME
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatInterface from '../../components/chat/ChatInterface';
import { useChat } from '../../contexts/ChatContext';
import { MessageCircle } from 'lucide-react';

const ProjectChats = () => {
  const { projectId } = useParams();
  const { clearMessages } = useChat();

  // Clear messages when component unmounts (leaving project or navigating away)
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  const styles = {
    container: {
      height: '100vh',
      maxHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    },
    backgroundSymbols: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      pointerEvents: 'none'
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
    },
    // Removed header background - just text styling now
    headerText: {
      position: 'relative',
      zIndex: 10,
      padding: '20px 20px 16px 20px',
      textAlign: 'center'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 8px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#9ca3af',
      margin: 0
    },
    chatContainer: {
      position: 'relative',
      zIndex: 10,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0, // Important for proper flex behavior
      height: 'calc(100vh - 140px)' // Adjusted height to account for header text
    },
    chatWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Code Symbols */}
      <div style={styles.backgroundSymbols}>
        <div style={{
          ...styles.codeSymbol,
          left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
        }}>&#60;/&#62;</div>
        <div style={{
          ...styles.codeSymbol,
          left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
        }}>&#60;/&#62;</div>
      </div>

      {/* Chat Container */}
      <div style={styles.chatContainer}>
        <div style={styles.chatWrapper}>
          <ChatInterface projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

export default ProjectChats;