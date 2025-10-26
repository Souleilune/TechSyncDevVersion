// frontend/src/services/githubService.js
import api from './api';

// OAuth methods
const getOAuthURL = async () => {
  try {
    const response = await api.get('/github/oauth/url');
    return response.data;
  } catch (error) {
    console.error('Get GitHub OAuth URL error:', error.response?.data || error.message);
    throw error;
  }
};

const handleOAuthCallback = async (code, state) => {
  try {
    const response = await api.post('/github/oauth/callback', { code, state });
    return response.data;
  } catch (error) {
    console.error('GitHub OAuth callback error:', error.response?.data || error.message);
    throw error;
  }
};

const disconnectGitHub = async () => {
  try {
    const response = await api.delete('/github/oauth/disconnect');
    return response.data;
  } catch (error) {
    console.error('Disconnect GitHub error:', error.response?.data || error.message);
    throw error;
  }
};

// User and repository methods
const getGitHubUser = async () => {
  try {
    const response = await api.get('/github/user');
    return response.data;
  } catch (error) {
    console.error('Get GitHub user error:', error.response?.data || error.message);
    throw error;
  }
};

const getUserRepositories = async (params = {}) => {
  try {
    const response = await api.get('/github/repositories', { params });
    return response.data;
  } catch (error) {
    console.error('Get user repositories error:', error.response?.data || error.message);
    throw error;
  }
};

const getRepository = async (owner, repo) => {
  try {
    const response = await api.get(`/github/repository/${owner}/${repo}`);
    return response.data;
  } catch (error) {
    console.error('Get repository error:', error.response?.data || error.message);
    throw error;
  }
};

const getRepositoryContents = async (owner, repo, path = '', ref = null) => {
  try {
    const params = {};
    if (ref) params.ref = ref;
    if (path) params.path = path;
    
    const response = await api.get(`/github/repository/${owner}/${repo}/contents`, { params });
    return response.data;
  } catch (error) {
    console.error('Get repository contents error:', error.response?.data || error.message);
    throw error;
  }
};

const getFileContent = async (owner, repo, filePath, ref = null) => {
  try {
    const params = {};
    if (ref) params.ref = ref;
    
    const response = await api.get(`/github/repository/${owner}/${repo}/contents/${filePath}`, { params });
    return response.data;
  } catch (error) {
    console.error('Get file content error:', error.response?.data || error.message);
    throw error;
  }
};

const getRepositoryBranches = async (owner, repo) => {
  try {
    const response = await api.get(`/github/repository/${owner}/${repo}/branches`);
    return response.data;
  } catch (error) {
    console.error('Get repository branches error:', error.response?.data || error.message);
    throw error;
  }
};

const getRepositoryCommits = async (owner, repo, params = {}) => {
  try {
    const response = await api.get(`/github/repository/${owner}/${repo}/commits`, { params });
    return response.data;
  } catch (error) {
    console.error('Get repository commits error:', error.response?.data || error.message);
    throw error;
  }
};

// Project integration methods
const connectRepositoryToProject = async (projectId, repositoryFullName, branch = 'main') => {
  try {
    const response = await api.post(`/github/project/${projectId}/connect`, {
      repository_full_name: repositoryFullName,
      branch: branch
    });
    return response.data;
  } catch (error) {
    console.error('Connect repository to project error:', error.response?.data || error.message);
    throw error;
  }
};

const disconnectRepositoryFromProject = async (projectId) => {
  try {
    const response = await api.delete(`/github/project/${projectId}/disconnect`);
    return response.data;
  } catch (error) {
    console.error('Disconnect repository from project error:', error.response?.data || error.message);
    throw error;
  }
};

const getProjectRepository = async (projectId) => {
  try {
    const response = await api.get(`/github/project/${projectId}/repository`);
    return response.data;
  } catch (error) {
    console.error('Get project repository error:', error.response?.data || error.message);
    throw error;
  }
};

// Utility methods
const isConnected = async () => {
  try {
    const response = await getGitHubUser();
    return response.success;
  } catch (error) {
    return false;
  }
};

const navigateToPath = async (owner, repo, path, ref = null) => {
  try {
    return await getRepositoryContents(owner, repo, path, ref);
  } catch (error) {
    console.error('Navigate to path error:', error);
    throw error;
  }
};

const getFileType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const fileTypes = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'dart': 'dart',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'txt': 'text',
    'sql': 'sql',
    'sh': 'shell',
    'bash': 'shell',
    'ps1': 'powershell',
    'dockerfile': 'dockerfile'
  };
  return fileTypes[extension] || 'text';
};

const isBinaryFile = (filename) => {
  const binaryExtensions = [
    'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'svg',
    'pdf', 'zip', 'rar', '7z', 'tar', 'gz',
    'exe', 'dll', 'so', 'dylib',
    'mp3', 'mp4', 'avi', 'mkv', 'wav',
    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'
  ];
  const extension = filename.split('.').pop().toLowerCase();
  return binaryExtensions.includes(extension);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Export the service object
export const githubService = {
  // OAuth methods
  getOAuthURL,
  handleOAuthCallback,
  disconnectGitHub,
  
  // User and repository methods
  getGitHubUser,
  getUserRepositories,
  getRepository,
  getRepositoryContents,
  getFileContent,
  getRepositoryBranches,
  getRepositoryCommits,
  
  // Project integration methods
  connectRepositoryToProject,
  disconnectRepositoryFromProject,
  getProjectRepository,
  
  // Utility methods
  isConnected,
  navigateToPath,
  getFileType,
  isBinaryFile,
  formatFileSize
};