// frontend/src/pages/project/ProjectFiles.js - WITH SIDEBAR TOGGLE
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { githubService } from '../../services/githubService';
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

        .global-loading-spinner {
          animation: globalLogoRotate 2s linear infinite;
        }
        .floating-symbol {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
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

function ProjectFiles() {
  const { projectId } = useParams();
  
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

  // State management
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [githubUser, setGitHubUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [projectRepository, setProjectRepository] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [branches, setBranches] = useState([]);
  const [fileContents, setFileContents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRepositorySelector, setShowRepositorySelector] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingContents, setLoadingContents] = useState(false);

  // Check GitHub connection status
  const checkGitHubConnection = useCallback(async () => {
    try {
      setLoading(true);
      const userResponse = await githubService.getGitHubUser();
      if (userResponse.success) {
        setIsGitHubConnected(true);
        setGitHubUser(userResponse.data);
      }
    } catch (error) {
      setIsGitHubConnected(false);
      setGitHubUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkProjectRepository = useCallback(async () => {
    try {
      const response = await githubService.getProjectRepository(projectId);
      if (response.success) {
        setProjectRepository(response.data);
        try {
          await loadRepositoryContents(response.data.repository_full_name, response.data.branch || 'main');
          setCurrentBranch(response.data.branch || 'main');
        } catch (contentError) {
          console.log('Repository access error:', contentError);
          setError('access_denied');
        }
      }
    } catch (error) {
      setProjectRepository(null);
    }
  }, [projectId]);

  useEffect(() => {
    checkGitHubConnection();
    checkProjectRepository();
  }, [checkGitHubConnection, checkProjectRepository]);

  const handleGitHubConnect = async () => {
    try {
      const response = await githubService.getOAuthURL();
      if (response.success) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      setError('Failed to initiate GitHub connection');
    }
  };

  const handleDisconnectGitHub = async () => {
    try {
      await githubService.disconnectGitHub();
      setIsGitHubConnected(false);
      setGitHubUser(null);
      setRepositories([]);
      setProjectRepository(null);
      setFileContents([]);
      setSelectedFile(null);
      setFileContent('');
    } catch (error) {
      setError('Failed to disconnect GitHub account');
    }
  };

  const loadUserRepositories = async () => {
    try {
      setLoadingRepositories(true);
      const response = await githubService.getUserRepositories({ per_page: 50, sort: 'updated' });
      if (response.success) {
        setRepositories(response.data);
        setShowRepositorySelector(true);
      }
    } catch (error) {
      setError('Failed to load repositories');
    } finally {
      setLoadingRepositories(false);
    }
  };

  const connectRepositoryToProject = async (repository) => {
    try {
      const response = await githubService.connectRepositoryToProject(
        projectId, 
        repository.full_name,
        repository.default_branch || 'main'
      );
      if (response.success) {
        setProjectRepository(response.data);
        setShowRepositorySelector(false);
        await loadRepositoryContents(repository.full_name, repository.default_branch || 'main');
        setCurrentBranch(repository.default_branch || 'main');
        await loadBranches(repository.full_name);
      }
    } catch (error) {
      setError('Failed to connect repository to project');
    }
  };

  const disconnectRepositoryFromProject = async () => {
    try {
      await githubService.disconnectRepositoryFromProject(projectId);
      setProjectRepository(null);
      setFileContents([]);
      setSelectedFile(null);
      setFileContent('');
      setBranches([]);
    } catch (error) {
      setError('Failed to disconnect repository from project');
    }
  };

  const loadRepositoryContents = async (repositoryFullName, branch = 'main', path = '') => {
    try {
      setLoadingContents(true);
      const [owner, repo] = repositoryFullName.split('/');
      const response = await githubService.getRepositoryContents(owner, repo, path, branch);
      if (response.success) {
        const contents = Array.isArray(response.data) ? response.data : [response.data];
        setFileContents(contents);
        setCurrentPath(path);
        setError('');
      }
    } catch (error) {
      console.error('Repository access error:', error);
      if (error.response?.status === 404) {
        setError('access_denied');
      } else {
        setError('Failed to load repository contents');
      }
      setFileContents([]);
    } finally {
      setLoadingContents(false);
    }
  };

  const loadBranches = async (repositoryFullName) => {
    try {
      const [owner, repo] = repositoryFullName.split('/');
      const response = await githubService.getRepositoryBranches(owner, repo);
      if (response.success) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const handleFileClick = async (file) => {
    if (file.type === 'dir') {
      await loadRepositoryContents(projectRepository.repository_full_name, currentBranch, file.path);
    } else if (file.type === 'file') {
      await loadFileContent(file);
    }
  };

  const loadFileContent = async (file) => {
    try {
      if (githubService.isBinaryFile(file.name)) {
        setSelectedFile(file);
        setFileContent('This is a binary file and cannot be displayed as text.');
        return;
      }

      const [owner, repo] = projectRepository.repository_full_name.split('/');
      const response = await githubService.getFileContent(owner, repo, file.path, currentBranch);
      if (response.success) {
        setSelectedFile(file);
        setFileContent(response.data.content);
      }
    } catch (error) {
      setError('Failed to load file content');
    }
  };

  const handleBranchChange = async (branch) => {
    setCurrentBranch(branch);
    await loadRepositoryContents(projectRepository.repository_full_name, branch, currentPath);
  };

  const navigateToParent = () => {
    const pathParts = currentPath.split('/').filter(part => part);
    pathParts.pop();
    const parentPath = pathParts.join('/');
    loadRepositoryContents(projectRepository.repository_full_name, currentBranch, parentPath);
  };

  const breadcrumbParts = currentPath ? currentPath.split('/').filter(part => part) : [];

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
      paddingLeft: '120px',  // Changed from 270px to 120px
      transition: 'padding-left 0.3s ease'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: '0 0 8px 0'
    },
    subtitle: {
      color: '#d1d5db',
      fontSize: '16px',
      margin: 0
    },
    connectSection: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '60px 20px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      backdropFilter: 'blur(20px)',
      marginBottom: '30px'
    },
    connectTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '16px'
    },
    connectText: {
      color: '#d1d5db',
      fontSize: '16px',
      marginBottom: '24px',
      lineHeight: '1.6'
    },
    connectButton: {
      background: 'linear-gradient(135deg, #24292e, #1b1f23)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '16px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 16px rgba(36, 41, 46, 0.3)'
    },
    connectedInfo: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backdropFilter: 'blur(10px)'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.2)'
    },
    userName: {
      color: 'white',
      fontWeight: '600',
      fontSize: '16px'
    },
    userHandle: {
      color: '#d1d5db',
      fontSize: '14px'
    },
    repositorySection: {
      position: 'relative',
      zIndex: 10,
      marginBottom: '30px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '16px'
    },
    sectionText: {
      color: '#d1d5db',
      fontSize: '14px',
      marginBottom: '20px'
    },
    repositoryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(20px)'
    },
    repositoryInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    repositoryName: {
      color: 'white',
      fontWeight: '600',
      fontSize: '16px'
    },
    branchSelector: {
      padding: '6px 12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      color: 'white',
      outline: 'none'
    },
    breadcrumb: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
      fontSize: '14px',
      color: '#9ca3af',
      padding: '12px 16px',
      background: 'rgba(26, 28, 32, 0.6)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    breadcrumbLink: {
      color: '#3b82f6',
      cursor: 'pointer',
      textDecoration: 'none',
      transition: 'color 0.2s ease'
    },
    fileList: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: 'white'
    },
    parentDirectory: {
      backgroundColor: 'rgba(255, 255, 255, 0.02)'
    },
    fileIcon: {
      marginRight: '12px',
      fontSize: '18px',
      width: '20px'
    },
    fileName: {
      flex: 1,
      fontSize: '14px',
      fontWeight: '500'
    },
    fileSize: {
      fontSize: '12px',
      color: '#9ca3af'
    },
    fileViewer: {
      position: 'relative',
      zIndex: 10,
      marginTop: '24px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)'
    },
    fileViewerHeader: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '14px',
      fontWeight: '600',
      color: 'white'
    },
    fileViewerContent: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: '20px',
      fontSize: '14px',
      fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
      lineHeight: '1.6',
      maxHeight: '600px',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      color: '#e5e7eb'
    },
    repositorySelector: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '30px',
      backdropFilter: 'blur(20px)'
    },
    repositoryItem: {
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      marginBottom: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: 'rgba(255, 255, 255, 0.02)'
    },
    repositoryItemName: {
      fontWeight: '600',
      marginBottom: '8px',
      color: 'white',
      fontSize: '16px'
    },
    repositoryDescription: {
      fontSize: '14px',
      color: '#d1d5db',
      marginBottom: '8px',
      lineHeight: '1.4'
    },
    repositoryMeta: {
      fontSize: '12px',
      color: '#9ca3af',
      display: 'flex',
      gap: '16px',
      alignItems: 'center'
    },
    button: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    dangerButton: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.3s ease'
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
    errorState: {
      position: 'relative',
      zIndex: 10,
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(185, 28, 28, 0.1))',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#fca5a5',
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)'
    },
    accessDeniedSection: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      borderRadius: '16px',
      marginBottom: '24px',
      backdropFilter: 'blur(10px)'
    },
    accessDeniedTitle: {
      color: '#fbbf24',
      fontSize: '20px',
      marginBottom: '16px',
      fontWeight: '600'
    },
    accessDeniedText: {
      color: '#fcd34d',
      fontSize: '16px',
      lineHeight: '1.6',
      marginBottom: '20px'
    },
    accessDeniedSteps: {
      textAlign: 'left',
      maxWidth: '500px',
      margin: '0 auto',
      background: 'rgba(251, 191, 36, 0.1)',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid rgba(251, 191, 36, 0.2)'
    },
    stepsList: {
      margin: '10px 0',
      paddingLeft: '20px'
    },
    stepItem: {
      marginBottom: '8px',
      color: '#fcd34d'
    },
    repoFullName: {
      fontWeight: '600',
      color: '#3b82f6'
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
            <span>Loading GitHub integration...</span>
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
          <h1 style={styles.title}>Files</h1>
          <p style={styles.subtitle}>Project files and GitHub repository integration</p>
        </div>

        {error && error !== 'access_denied' && (
          <div style={styles.errorState}>
            {error}
          </div>
        )}

        {error === 'access_denied' && projectRepository && (
          <div style={styles.accessDeniedSection}>
            <h3 style={styles.accessDeniedTitle}>🔒 Repository Access Required</h3>
            <p style={styles.accessDeniedText}>
              A repository is connected to this project, but you don't have access to view its contents.
            </p>
            <div style={styles.accessDeniedSteps}>
              <strong>To gain access:</strong>
              <ol style={styles.stepsList}>
                <li style={styles.stepItem}>
                  Contact the project owner or repository owner
                </li>
                <li style={styles.stepItem}>
                  Ask them to add you as a collaborator to the repository: 
                  <br />
                  <span style={styles.repoFullName}>{projectRepository.repository_full_name}</span>
                </li>
                <li style={styles.stepItem}>
                  Once added, refresh this page to view the files
                </li>
              </ol>
            </div>
            <p style={styles.accessDeniedText}>
              <small>
                💡 Repository collaborators can be managed in GitHub under Settings → Manage access
              </small>
            </p>
          </div>
        )}

        {!isGitHubConnected ? (
          <div style={styles.connectSection}>
            <h2 style={styles.connectTitle}>Connect Your GitHub Account</h2>
            <p style={styles.connectText}>Connect your GitHub account to browse and manage repository files directly in your project workspace.</p>
            <button 
              style={styles.connectButton} 
              onClick={handleGitHubConnect}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(36, 41, 46, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(36, 41, 46, 0.3)';
              }}
            >
              <span>📚</span>
              Connect GitHub
            </button>
          </div>
        ) : (
          <>
            <div style={styles.connectedInfo}>
              <div style={styles.userInfo}>
                <img 
                  src={githubUser?.github_avatar_url} 
                  alt={githubUser?.github_name} 
                  style={styles.avatar}
                />
                <div>
                  <div style={styles.userName}>{githubUser?.github_name || githubUser?.github_username}</div>
                  <div style={styles.userHandle}>@{githubUser?.github_username}</div>
                </div>
              </div>
              <button 
                style={styles.dangerButton} 
                onClick={handleDisconnectGitHub}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Disconnect
              </button>
            </div>

            {!projectRepository ? (
              <div style={styles.repositorySection}>
                <h3 style={styles.sectionTitle}>Connect Repository to Project</h3>
                <p style={styles.sectionText}>Select a repository to connect to this project for file management.</p>
                
                {!showRepositorySelector ? (
                  <button 
                    style={styles.button} 
                    onClick={loadUserRepositories}
                    disabled={loadingRepositories}
                    onMouseEnter={(e) => {
                      if (!e.target.disabled) {
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {loadingRepositories ? 'Loading...' : 'Select Repository'}
                  </button>
                ) : (
                  <div style={styles.repositorySelector}>
                    <h4 style={styles.sectionTitle}>Your Repositories</h4>
                    {repositories.map(repo => (
                      <div 
                        key={repo.id} 
                        style={styles.repositoryItem}
                        onClick={() => connectRepositoryToProject(repo)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={styles.repositoryItemName}>{repo.full_name}</div>
                        {repo.description && (
                          <div style={styles.repositoryDescription}>{repo.description}</div>
                        )}
                        <div style={styles.repositoryMeta}>
                          {repo.language && <span>🔧 {repo.language}</span>}
                          <span>⭐ {repo.stargazers_count}</span>
                          <span>🍴 {repo.forks_count}</span>
                          <span>{repo.private ? '🔒 Private' : '🌐 Public'}</span>
                        </div>
                      </div>
                    ))}
                    <button 
                      style={styles.button} 
                      onClick={() => setShowRepositorySelector(false)}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.repositorySection}>
                <div style={styles.repositoryHeader}>
                  <div style={styles.repositoryInfo}>
                    <span style={styles.repositoryName}>📚 {projectRepository.repository_full_name}</span>
                    {branches.length > 0 && error !== 'access_denied' && (
                      <select 
                        style={styles.branchSelector}
                        value={currentBranch}
                        onChange={(e) => handleBranchChange(e.target.value)}
                      >
                        {branches.map(branch => (
                          <option key={branch.name} value={branch.name}>
                            🌿 {branch.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <button 
                    style={styles.dangerButton} 
                    onClick={disconnectRepositoryFromProject}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Disconnect Repository
                  </button>
                </div>

                {error !== 'access_denied' && (
                  <>
                    {currentPath && (
                      <div style={styles.breadcrumb}>
                        <span 
                          style={styles.breadcrumbLink}
                          onClick={() => loadRepositoryContents(projectRepository.repository_full_name, currentBranch, '')}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#60a5fa';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#3b82f6';
                          }}
                        >
                          {projectRepository.repository_full_name.split('/')[1]}
                        </span>
                        {breadcrumbParts.map((part, index) => (
                          <React.Fragment key={index}>
                            <span> / </span>
                            <span 
                              style={styles.breadcrumbLink}
                              onClick={() => {
                                const path = breadcrumbParts.slice(0, index + 1).join('/');
                                loadRepositoryContents(projectRepository.repository_full_name, currentBranch, path);
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = '#60a5fa';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = '#3b82f6';
                              }}
                            >
                              {part}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {loadingContents ? (
                      <div style={styles.loadingState}>Loading files...</div>
                    ) : (
                      <div style={styles.fileList}>
                        {currentPath && (
                          <div 
                            style={{...styles.fileItem, ...styles.parentDirectory}}
                            onClick={navigateToParent}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                            }}
                          >
                            <span style={styles.fileIcon}>📁</span>
                            <span style={styles.fileName}>..</span>
                          </div>
                        )}
                        
                        {fileContents.map((file, index) => (
                          <div 
                            key={index}
                            style={styles.fileItem}
                            onClick={() => handleFileClick(file)}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span style={styles.fileIcon}>
                              {file.type === 'dir' ? '📁' : '📄'}
                            </span>
                            <span style={styles.fileName}>{file.name}</span>
                            {file.size && (
                              <span style={styles.fileSize}>
                                {githubService.formatFileSize(file.size)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedFile && (
                      <div style={styles.fileViewer}>
                        <div style={styles.fileViewerHeader}>
                          📄 {selectedFile.name} ({githubService.formatFileSize(selectedFile.size)})
                        </div>
                        <div style={styles.fileViewerContent}>
                          {fileContent}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default ProjectFiles;