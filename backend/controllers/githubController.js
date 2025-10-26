// backend/controllers/githubController.js
const axios = require('axios');
const supabase = require('../config/supabase');
const crypto = require('crypto');

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback';

// Generate OAuth URL
const getOAuthURL = async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString('hex');
    const scope = 'repo,read:user,user:email';
    
    // Store state in user session or cache for later verification
    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=${scope}&state=${state}`;
    
    res.json({
      success: true,
      data: {
        url: oauthUrl,
        state: state
      }
    });
  } catch (error) {
    console.error('GitHub OAuth URL generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate GitHub OAuth URL',
      error: error.message
    });
  }
};

// Handle OAuth callback
const handleOAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: GITHUB_REDIRECT_URI
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Failed to obtain access token from GitHub'
      });
    }

    // Get user information from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const githubUser = userResponse.data;

    // Store GitHub OAuth data in database
    const { data, error } = await supabase
      .from('github_oauth_tokens')
      .upsert({
        user_id: userId,
        access_token: accessToken,
        github_user_id: githubUser.id,
        github_username: githubUser.login,
        github_email: githubUser.email,
        github_name: githubUser.name,
        github_avatar_url: githubUser.avatar_url,
        scope: tokenResponse.data.scope || 'repo,read:user,user:email',
        token_type: tokenResponse.data.token_type || 'bearer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error storing GitHub token:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to store GitHub authorization',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'GitHub account connected successfully',
      data: {
        github_username: githubUser.login,
        github_name: githubUser.name,
        github_avatar_url: githubUser.avatar_url
      }
    });
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process GitHub authorization',
      error: error.message
    });
  }
};

// Disconnect GitHub account
const disconnectGitHub = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('github_oauth_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Database error disconnecting GitHub:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to disconnect GitHub account',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'GitHub account disconnected successfully'
    });
  } catch (error) {
    console.error('GitHub disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect GitHub account',
      error: error.message
    });
  }
};

// Get GitHub user info
const getGitHubUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: tokenData, error } = await supabase
      .from('github_oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !tokenData) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    res.json({
      success: true,
      data: {
        github_username: tokenData.github_username,
        github_name: tokenData.github_name,
        github_email: tokenData.github_email,
        github_avatar_url: tokenData.github_avatar_url,
        connected_at: tokenData.created_at
      }
    });
  } catch (error) {
    console.error('Get GitHub user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get GitHub user information',
      error: error.message
    });
  }
};

// Get user repositories
const getUserRepositories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, per_page = 30, sort = 'updated', type = 'all' } = req.query;

    const { data: tokenData, error: tokenError } = await supabase
      .from('github_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        page,
        per_page,
        sort,
        type
      }
    });

    const repositories = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      default_branch: repo.default_branch,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url
      }
    }));

    res.json({
      success: true,
      data: repositories,
      pagination: {
        page: parseInt(page),
        per_page: parseInt(per_page),
        total: response.headers['x-ratelimit-remaining'] ? repositories.length : null
      }
    });
  } catch (error) {
    console.error('Get repositories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repositories',
      error: error.message
    });
  }
};

// Get repository details
const getRepository = async (req, res) => {
  try {
    const userId = req.user.id;
    const { owner, repo } = req.params;

    const { data: tokenData, error: tokenError } = await supabase
      .from('github_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const repository = {
      id: response.data.id,
      name: response.data.name,
      full_name: response.data.full_name,
      description: response.data.description,
      private: response.data.private,
      html_url: response.data.html_url,
      clone_url: response.data.clone_url,
      ssh_url: response.data.ssh_url,
      language: response.data.language,
      languages_url: response.data.languages_url,
      stargazers_count: response.data.stargazers_count,
      forks_count: response.data.forks_count,
      open_issues_count: response.data.open_issues_count,
      default_branch: response.data.default_branch,
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
      pushed_at: response.data.pushed_at,
      size: response.data.size,
      owner: {
        login: response.data.owner.login,
        avatar_url: response.data.owner.avatar_url
      }
    };

    res.json({
      success: true,
      data: repository
    });
  } catch (error) {
    console.error('Get repository error:', error);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Repository not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository',
      error: error.message
    });
  }
};

// Get repository contents
const getRepositoryContents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { owner, repo } = req.params;
    const { path = '', ref } = req.query;

    const { data: tokenData, error: tokenError } = await supabase
      .from('github_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const params = ref ? { ref } : {};

    const response = await axios.get(url, {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });

    const contents = Array.isArray(response.data) 
      ? response.data.map(item => ({
          name: item.name,
          path: item.path,
          sha: item.sha,
          size: item.size,
          type: item.type,
          download_url: item.download_url,
          html_url: item.html_url
        }))
      : {
          name: response.data.name,
          path: response.data.path,
          sha: response.data.sha,
          size: response.data.size,
          type: response.data.type,
          content: response.data.content,
          encoding: response.data.encoding,
          download_url: response.data.download_url,
          html_url: response.data.html_url
        };

    res.json({
      success: true,
      data: contents
    });
  } catch (error) {
    console.error('Get repository contents error:', error);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Path not found in repository'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository contents',
      error: error.message
    });
  }
};

// Get file content
const getFileContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { owner, repo } = req.params;
    const filePath = req.params[0]; // Captures the wildcard path
    const { ref } = req.query;

    const { data: tokenData, error: tokenError } = await supabase
      .from('github_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const params = ref ? { ref } : {};

    const response = await axios.get(url, {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });

    if (response.data.type !== 'file') {
      return res.status(400).json({
        success: false,
        message: 'Requested path is not a file'
      });
    }

    // Decode base64 content
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

    res.json({
      success: true,
      data: {
        name: response.data.name,
        path: response.data.path,
        sha: response.data.sha,
        size: response.data.size,
        content: content,
        encoding: response.data.encoding,
        download_url: response.data.download_url,
        html_url: response.data.html_url
      }
    });
  } catch (error) {
    console.error('Get file content error:', error);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch file content',
      error: error.message
    });
  }
};

// Get repository branches
const getRepositoryBranches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { owner, repo } = req.params;

    const { data: tokenData, error: tokenError } = await supabase
      .from('github_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const branches = response.data.map(branch => ({
      name: branch.name,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url
      },
      protected: branch.protected
    }));

    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error('Get repository branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository branches',
      error: error.message
    });
  }
};

// Get repository commits
const getRepositoryCommits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { owner, repo } = req.params;
    const { sha, path, page = 1, per_page = 30 } = req.query;

    const { data: tokenData, error: tokenError } = await supabase
      .from('github_oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    const params = { page, per_page };
    if (sha) params.sha = sha;
    if (path) params.path = path;

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params
    });

    const commits = response.data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date
      },
      committer: {
        name: commit.commit.committer.name,
        email: commit.commit.committer.email,
        date: commit.commit.committer.date
      },
      html_url: commit.html_url
    }));

    res.json({
      success: true,
      data: commits
    });
  } catch (error) {
    console.error('Get repository commits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repository commits',
      error: error.message
    });
  }
};

// Connect repository to project
const connectRepositoryToProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;
    const { repository_full_name, branch = 'main' } = req.body;

    if (!repository_full_name) {
      return res.status(400).json({
        success: false,
        message: 'Repository full name is required'
      });
    }

    // Check if user is a member of the project
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    // Check if user has GitHub connected
    const { data: tokenData, error: tokenError } = await supabase
      .from('github_oauth_tokens')
      .select('access_token, github_username')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({
        success: false,
        message: 'GitHub account not connected'
      });
    }

    // Verify repository access
    const [owner, repo] = repository_full_name.split('/');
    try {
      await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Repository not found or access denied'
        });
      }
      throw error;
    }

    // Connect repository to project
    const { data, error } = await supabase
      .from('project_github_repos')
      .upsert({
        project_id: projectId,
        repository_full_name: repository_full_name,
        branch: branch,
        connected_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'project_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error connecting repository:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to connect repository to project',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Repository connected to project successfully',
      data: data
    });
  } catch (error) {
    console.error('Connect repository to project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect repository to project',
      error: error.message
    });
  }
};

// Disconnect repository from project
const disconnectRepositoryFromProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    // Check if user is a member of the project
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    const { error } = await supabase
      .from('project_github_repos')
      .delete()
      .eq('project_id', projectId);

    if (error) {
      console.error('Database error disconnecting repository:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to disconnect repository from project',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Repository disconnected from project successfully'
    });
  } catch (error) {
    console.error('Disconnect repository from project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect repository from project',
      error: error.message
    });
  }
};

// Get project repository
const getProjectRepository = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    // Check if user is a member of the project
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    const { data: repoData, error: repoError } = await supabase
      .from('project_github_repos')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (repoError || !repoData) {
      return res.status(404).json({
        success: false,
        message: 'No repository connected to this project'
      });
    }

    res.json({
      success: true,
      data: repoData
    });
  } catch (error) {
    console.error('Get project repository error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project repository',
      error: error.message
    });
  }
};

module.exports = {
  getOAuthURL,
  handleOAuthCallback,
  disconnectGitHub,
  getGitHubUser,
  getUserRepositories,
  getRepository,
  getRepositoryContents,
  getFileContent,
  getRepositoryBranches,
  getRepositoryCommits,
  connectRepositoryToProject,
  disconnectRepositoryFromProject,
  getProjectRepository
};