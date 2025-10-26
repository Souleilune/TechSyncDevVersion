// backend/server.js
const { app, server } = require('./app');

const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log('🚀 =================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 =================================');
  console.log('📋 Available endpoints:');
  console.log(`   🔗 Health: http://localhost:${PORT}/health`);
  console.log(`   🔗 API: http://localhost:${PORT}/api`);
  console.log(`   🔗 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   🔗 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`   🔗 Tasks: http://localhost:${PORT}/api/tasks`);
  console.log(`   🔗 GitHub: http://localhost:${PORT}/api/github`);
  console.log('🚀 =================================');
});