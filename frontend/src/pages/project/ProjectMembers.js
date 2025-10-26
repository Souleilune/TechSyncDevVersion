// frontend/src/pages/project/ProjectMembers.js - WITH FLOATING ANIMATIONS AND SPINNING LOGO
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
import { friendsService } from '../../services/friendsService';
import { PanelLeft } from 'lucide-react';

// Background symbols component - WITH FLOATING ANIMATIONS
const BackgroundSymbols = () => (
  <>
    <style>
      {`
        @keyframes floatAround1 {
          0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
          25% { transform: translate(20px, -15px) rotate(-5deg); }
          50% { transform: translate(-10px, 20px) rotate(-15deg); }
          75% { transform: translate(15px, 5px) rotate(-8deg); }
        }
        @keyframes floatAround2 {
          0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
          33% { transform: translate(-20px, 10px) rotate(-33deg); }
          66% { transform: translate(25px, -8px) rotate(-42deg); }
        }
        @keyframes floatAround3 {
          0%, 100% { transform: translate(0, 0) rotate(34.77deg); }
          50% { transform: translate(-15px, 25px) rotate(39deg); }
        }
        @keyframes floatAround4 {
          0%, 100% { transform: translate(0, 0) rotate(28.16deg); }
          40% { transform: translate(18px, -20px) rotate(33deg); }
          80% { transform: translate(-12px, 15px) rotate(23deg); }
        }
        @keyframes floatAround5 {
          0%, 100% { transform: translate(0, 0) rotate(24.5deg); }
          50% { transform: translate(22px, 20px) rotate(29deg); }
        }
        @keyframes floatAround6 {
          0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
          33% { transform: translate(-18px, -15px) rotate(30deg); }
          66% { transform: translate(20px, 18px) rotate(20deg); }
        }
        @keyframes floatAround7 {
          0%, 100% { transform: translate(0, 0) rotate(-19.68deg); }
          25% { transform: translate(15px, 20px) rotate(-14deg); }
          75% { transform: translate(-20px, -10px) rotate(-24deg); }
        }
        @keyframes floatAround8 {
          0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
          50% { transform: translate(-25px, 25px) rotate(-2deg); }
        }
        @keyframes floatAround9 {
          0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
          35% { transform: translate(20px, -18px) rotate(30deg); }
          70% { transform: translate(-15px, 20px) rotate(20deg); }
        }
        @keyframes floatAround10 {
          0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
          50% { transform: translate(18px, -22px) rotate(-11deg); }
        }
        @keyframes floatAround11 {
          0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
          33% { transform: translate(-22px, 15px) rotate(-5deg); }
          66% { transform: translate(20px, -18px) rotate(-15deg); }
        }
        @keyframes floatAround12 {
          0%, 100% { transform: translate(0, 0) rotate(18.2deg); }
          50% { transform: translate(-20px, 28px) rotate(23deg); }
        }
        @keyframes floatAround13 {
          0%, 100% { transform: translate(0, 0) rotate(37.85deg); }
          40% { transform: translate(25px, -15px) rotate(42deg); }
          80% { transform: translate(-18px, 20px) rotate(32deg); }
        }
        @keyframes floatAround14 {
          0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
          50% { transform: translate(20px, 25px) rotate(-32deg); }
        }
        @keyframes floatAround15 {
          0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
          25% { transform: translate(-15px, -20px) rotate(-42deg); }
          75% { transform: translate(22px, 18px) rotate(-32deg); }
        }
        @keyframes floatAround16 {
          0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
          50% { transform: translate(-28px, 22px) rotate(-5deg); }
        }
        @keyframes floatAround17 {
          0%, 100% { transform: translate(0, 0) rotate(15deg); }
          33% { transform: translate(18px, -25px) rotate(20deg); }
          66% { transform: translate(-20px, 20px) rotate(10deg); }
        }
        @keyframes floatAround18 {
          0%, 100% { transform: translate(0, 0) rotate(-45deg); }
          50% { transform: translate(25px, -20px) rotate(-40deg); }
        }
        @keyframes floatAround19 {
          0%, 100% { transform: translate(0, 0) rotate(30deg); }
          40% { transform: translate(-22px, 18px) rotate(35deg); }
          80% { transform: translate(20px, -15px) rotate(25deg); }
        }
        @keyframes floatAround20 {
          0%, 100% { transform: translate(0, 0) rotate(-20deg); }
          50% { transform: translate(-18px, 28px) rotate(-15deg); }
        }
        @keyframes floatAround21 {
          0%, 100% { transform: translate(0, 0) rotate(40deg); }
          33% { transform: translate(20px, -22px) rotate(45deg); }
          66% { transform: translate(-25px, 18px) rotate(35deg); }
        }
        
        @keyframes globalLogoRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .floating-symbol {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        .global-loading-spinner {
          animation: globalLogoRotate 2s linear infinite;
        }
        
        .floating-symbol:nth-child(1) { animation: floatAround1 12s infinite; }
        .floating-symbol:nth-child(2) { animation: floatAround2 15s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(3) { animation: floatAround3 18s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(4) { animation: floatAround4 14s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(5) { animation: floatAround5 16s infinite; animation-delay: -1s; }
        .floating-symbol:nth-child(6) { animation: floatAround6 13s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(7) { animation: floatAround7 17s infinite; animation-delay: -8s; }
        .floating-symbol:nth-child(8) { animation: floatAround8 19s infinite; animation-delay: -3s; }
        .floating-symbol:nth-child(9) { animation: floatAround9 11s infinite; animation-delay: -7s; }
        .floating-symbol:nth-child(10) { animation: floatAround10 20s infinite; animation-delay: -9s; }
        .floating-symbol:nth-child(11) { animation: floatAround11 14s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(12) { animation: floatAround12 16s infinite; animation-delay: -10s; }
        .floating-symbol:nth-child(13) { animation: floatAround13 12s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(14) { animation: floatAround14 15s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(15) { animation: floatAround15 18s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(16) { animation: floatAround16 13s infinite; animation-delay: -8s; }
        .floating-symbol:nth-child(17) { animation: floatAround17 17s infinite; animation-delay: -3s; }
        .floating-symbol:nth-child(18) { animation: floatAround18 14s infinite; animation-delay: -7s; }
        .floating-symbol:nth-child(19) { animation: floatAround19 16s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(20) { animation: floatAround20 19s infinite; animation-delay: -9s; }
        .floating-symbol:nth-child(21) { animation: floatAround21 15s infinite; animation-delay: -6s; }
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

function ProjectMembers() {
  const { projectId } = useParams();
  const { user } = useAuth();

  // NEW STATE: Track sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('projectSidebarCollapsed');
    return saved === 'true';
  });

  // NEW: Function to toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('projectSidebarCollapsed', newCollapsedState.toString());
    
    window.dispatchEvent(new CustomEvent('projectSidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  // NEW: Sync with sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('projectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('projectSidebarToggle', handleSidebarToggle);
  }, []);

  const [project, setProject] = useState(null);
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const isOwner = project?.owner_id === user?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectResponse, membersResponse] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getProjectMembers(projectId)
        ]);

        setProject(projectResponse.data.project);
        setMemberData(membersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load project members');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.member-menu')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (memberId) => {
    setOpenMenuId(openMenuId === memberId ? null : memberId);
  };

  const handleAddFriend = async (userId, userName) => {
    setOpenMenuId(null);
    
    try {
      const response = await friendsService.sendFriendRequest(userId);
      
      if (response.success) {
        alert(`Friend request sent to ${userName}!`);
      } else {
        alert(response.message || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send friend request';
      alert(errorMessage);
    }
  };

  const handleReportUser = (userId, userName) => {
    setOpenMenuId(null);
    console.log('Report user:', userId, userName);
    alert(`Report submitted for ${userName}`);
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await projectService.updateMemberRole(projectId, memberId, newRole);
      
      const membersResponse = await projectService.getProjectMembers(projectId);
      setMemberData(membersResponse.data);
      
      setError(null);
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error.response?.data?.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return;
    }

    try {
      await projectService.removeMember(projectId, memberId);
      
      const membersResponse = await projectService.getProjectMembers(projectId);
      setMemberData(membersResponse.data);
      
      setError(null);
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project?')) {
      return;
    }

    try {
      await projectService.leaveProject(projectId);
      window.location.href = '/projects';
    } catch (error) {
      console.error('Error leaving project:', error);
      setError(error.response?.data?.message || 'Failed to leave project');
    }
  };

  const members = memberData?.members || [];
  const owner = memberData?.owner || null;
  const total_members = members.length + (owner ? 1 : 0);
  
  const leadCount = members.filter(member => member.role === 'lead').length;
  const moderatorCount = members.filter(member => member.role === 'moderator').length;
  const memberCount = members.filter(member => member.role === 'member' || !member.role).length;

  const styles = {
    // NEW: Toggle button styles
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
    loading: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      minHeight: '400px',
      fontSize: '18px',
      color: '#9ca3af'
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
    headerLeft: { flex: 1 },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      margin: '0 0 8px 0',
      color: 'white'
    },
    subtitle: {
      color: '#d1d5db',
      margin: 0,
      fontSize: '16px'
    },
    errorMessage: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.1))',
      color: '#fca5a5',
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      backdropFilter: 'blur(10px)'
    },
    stats: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px',
      borderRadius: '16px',
      textAlign: 'center',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    },
    statNumber: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#3b82f6',
      marginBottom: '8px'
    },
    statLabel: {
      fontSize: '14px',
      color: '#9ca3af',
      fontWeight: '500'
    },
    membersGrid: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '24px',
      marginBottom: '30px'
    },
    memberCard: {
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease'
    },
    ownerCard: {
      border: '2px solid #3b82f6',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))'
    },
    memberHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px'
    },
    memberAvatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '20px',
      marginRight: '16px',
      overflow: 'hidden',
      border: '2px solid rgba(255, 255, 255, 0.1)'
    },
    memberInfo: { flex: 1 },
    memberName: {
      margin: '0 0 6px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: 'white'
    },
    memberRole: { marginBottom: '6px' },
    roleBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
      color: 'white',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    ownerBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    memberEmail: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    memberMeta: {
      fontSize: '13px',
      color: '#d1d5db',
      lineHeight: '1.6',
      marginBottom: '16px',
      background: 'rgba(255, 255, 255, 0.02)',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    },
    memberMetaItem: { marginBottom: '4px' },
    memberActions: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    roleSelect: {
      padding: '6px 10px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      fontSize: '12px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none'
    },
    dangerButton: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    emptyState: {
      position: 'relative',
      zIndex: 10,
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '60px 20px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)'
    },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '12px'
    },
    emptyText: {
      color: '#9ca3af',
      fontSize: '16px'
    },
    userActions: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      paddingTop: '24px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    leaveButton: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    menuContainer: {
      position: 'relative',
      marginLeft: 'auto'
    },
    menuButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '18px',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '6px 10px',
      borderRadius: '6px',
      transition: 'all 0.2s ease'
    },
    menuDropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.98), rgba(15, 17, 22, 0.95))',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      minWidth: '140px',
      backdropFilter: 'blur(20px)'
    },
    menuItem: {
      display: 'block',
      width: '100%',
      padding: '10px 14px',
      backgroundColor: 'transparent',
      border: 'none',
      textAlign: 'left',
      fontSize: '13px',
      color: '#d1d5db',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    }
  };

  if (loading) {
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
            <span>Loading project members...</span>
          </div>
        </div>
      </>
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

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Project Members</h1>
          <p style={styles.subtitle}>
            {total_members} member{total_members !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{total_members}</div>
          <div style={styles.statLabel}>Total Members</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{leadCount}</div>
          <div style={styles.statLabel}>Team Leads</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{moderatorCount}</div>
          <div style={styles.statLabel}>Moderators</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{memberCount}</div>
          <div style={styles.statLabel}>Members</div>
        </div>
      </div>

      <div style={styles.membersGrid}>
        {owner && (
          <div 
            style={{ ...styles.memberCard, ...styles.ownerCard }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
            }}
          >
            <div style={styles.memberHeader}>
              <div style={styles.memberAvatar}>
                {owner.avatar_url ? (
                  <img src={owner.avatar_url} alt={owner.full_name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                ) : (
                  (owner.full_name || owner.username || 'O').charAt(0).toUpperCase()
                )}
              </div>
              <div style={styles.memberInfo}>
                <h3 style={styles.memberName}>{owner.full_name || owner.username}</h3>
                <div style={styles.memberRole}>
                  <span style={styles.ownerBadge}>Owner</span>
                </div>
                <div style={styles.memberEmail}>{owner.email}</div>
              </div>
              {user?.id !== owner.id && (
                <div className="member-menu" style={styles.menuContainer}>
                  <button
                    style={styles.menuButton}
                    onClick={() => toggleMenu(`owner-${owner.id}`)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    ⋮
                  </button>
                  {openMenuId === `owner-${owner.id}` && (
                    <div style={styles.menuDropdown}>
                      <button
                        style={styles.menuItem}
                        onClick={() => handleAddFriend(owner.id, owner.full_name || owner.username)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Add Friend
                      </button>
                      <button
                        style={styles.menuItem}
                        onClick={() => handleReportUser(owner.id, owner.full_name || owner.username)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Report User
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={styles.memberMeta}>
              <div style={styles.memberMetaItem}>GitHub: {owner.github_username || 'Not provided'}</div>
              <div style={styles.memberMetaItem}>Experience: {owner.years_experience ? `${owner.years_experience} years` : 'Not specified'}</div>
            </div>
          </div>
        )}

        {members.map((member) => (
          <div 
            key={member.id} 
            style={styles.memberCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
            }}
          >
            <div style={styles.memberHeader}>
              <div style={styles.memberAvatar}>
                {member.users?.avatar_url ? (
                  <img src={member.users.avatar_url} alt={member.users.full_name} style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                ) : (
                  (member.users?.full_name || member.users?.username || 'M').charAt(0).toUpperCase()
                )}
              </div>
              <div style={styles.memberInfo}>
                <h3 style={styles.memberName}>{member.users?.full_name || member.users?.username}</h3>
                <div style={styles.memberRole}>
                  <span style={styles.roleBadge}>{member.role || 'member'}</span>
                </div>
                <div style={styles.memberEmail}>{member.users?.email}</div>
              </div>
              {user?.id !== member.user_id && (
                <div className="member-menu" style={styles.menuContainer}>
                  <button
                    style={styles.menuButton}
                    onClick={() => toggleMenu(member.id)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    ⋮
                  </button>
                  {openMenuId === member.id && (
                    <div style={styles.menuDropdown}>
                      <button
                        style={styles.menuItem}
                        onClick={() => handleAddFriend(member.user_id, member.users?.full_name || member.users?.username)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Add Friend
                      </button>
                      <button
                        style={styles.menuItem}
                        onClick={() => handleReportUser(member.user_id, member.users?.full_name || member.users?.username)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Report User
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={styles.memberMeta}>
              <div style={styles.memberMetaItem}>GitHub: {member.users?.github_username || 'Not provided'}</div>
              <div style={styles.memberMetaItem}>Experience: {member.users?.years_experience ? `${member.users.years_experience} years` : 'Not specified'}</div>
              <div style={styles.memberMetaItem}>Joined: {new Date(member.joined_at).toLocaleDateString()}</div>
              <div style={styles.memberMetaItem}>Contribution Score: {member.contribution_score || 0}</div>
            </div>

            {(isOwner || (user?.id === member.user_id)) && (
              <div style={styles.memberActions}>
                {isOwner && member.user_id !== user?.id && (
                  <select
                    style={styles.roleSelect}
                    value={member.role || 'member'}
                    onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="moderator">Moderator</option>
                    <option value="lead">Lead</option>
                  </select>
                )}

                {(isOwner || user?.id === member.user_id) && (
                  <button
                    style={styles.dangerButton}
                    onClick={() => handleRemoveMember(member.id, member.users?.full_name || member.users?.username)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {user?.id === member.user_id ? 'Leave Project' : 'Remove'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {!owner && members.length === 0 && (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No members found</h3>
            <p style={styles.emptyText}>This project doesn't have any members yet.</p>
          </div>
        )}
      </div>

      {!isOwner && members.some(member => member.user_id === user?.id) && (
        <div style={styles.userActions}>
          <button 
            style={styles.leaveButton} 
            onClick={handleLeaveProject}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Leave Project
          </button>
        </div>
      )}
    </div>
    </>
  );
}

export default ProjectMembers;