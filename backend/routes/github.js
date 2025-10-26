// backend/routes/github.js
const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middleware/auth');

// Apply authentication to all routes
router.use(authMiddleware);

// GitHub OAuth routes
router.get('/oauth/url', githubController.getOAuthURL);
router.post('/oauth/callback', githubController.handleOAuthCallback);
router.delete('/oauth/disconnect', githubController.disconnectGitHub);

// GitHub API routes
router.get('/user', githubController.getGitHubUser);
router.get('/repositories', githubController.getUserRepositories);
router.get('/repository/:owner/:repo', githubController.getRepository);
router.get('/repository/:owner/:repo/contents', githubController.getRepositoryContents);
router.get('/repository/:owner/:repo/contents/*', githubController.getFileContent);
router.get('/repository/:owner/:repo/branches', githubController.getRepositoryBranches);
router.get('/repository/:owner/:repo/commits', githubController.getRepositoryCommits);

// Project-specific GitHub integration
router.post('/project/:projectId/connect', githubController.connectRepositoryToProject);
router.delete('/project/:projectId/disconnect', githubController.disconnectRepositoryFromProject);
router.get('/project/:projectId/repository', githubController.getProjectRepository);

module.exports = router;