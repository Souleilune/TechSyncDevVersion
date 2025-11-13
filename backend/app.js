// backend/app.js - OPTIMIZED VERSION WITH FIXED CORS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { createQueueMiddleware, queueStatsMiddleware, PRIORITY } = require('./middleware/requestQueue');

// Import routes
const authRoutes = require('./routes/auth');
const onboardingRoutes = require('./routes/onboarding');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const suggestionsRoutes = require('./routes/suggestions');
const skillMatchingRoutes = require('./routes/skillMatching'); 
const challengeRoutes = require('./routes/challenges');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const aiChatRoutes = require('./routes/aiChat');
const projectMemberRoutes = require('./routes/projectMembers');
const commentsRoutes = require('./routes/comments');
const notificationsRoutes = require('./routes/notifications');
const githubRoutes = require('./routes/github');
const friendsRoutes = require('./routes/friends');

const soloProjectRoutes = require('./routes/soloProjectRoutes');

const awardsRoutes = require('./routes/awards');
const userProfileUpdateRoutes = require('./routes/userProfileUpdate');
const collaborativeProjectCompletionRoutes = require('./routes/collaborativeProjectCompletion');
const usersRoutes = require('./routes/users');
const timelineRoutes = require('./routes/timeline');
const recommendationsRoutes = require('./routes/recommendations');
const coursesRoutes = require('./routes/courses');

const app = express();

// ============== SECURITY MIDDLEWARE ==============
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Trust proxy (important for Railway deployment)
app.set('trust proxy', 1);

// ============== CORS CONFIGURATION - FIXED ==============
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

// ✅ FIXED CORS - Allow requests with no origin (proxy requests)
app.use(cors({
  origin: function(origin, callback) {
    // ✅ Allow requests with no origin (proxy, Postman, mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow explicitly allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // ✅ In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Reject in production only
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Allow in development
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Additional CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// ============== REQUEST PARSING ==============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============== RATE LIMITING ==============
// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 100
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit for health checks
    return req.path === '/health' || req.path === '/';
  }
});

// Strict rate limiter for expensive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many requests for this endpoint, please slow down.'
  }
});

// Auth-specific rate limiter (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

// ============== REQUEST QUEUE MIDDLEWARE ==============
// Apply queue middleware to prevent server overload
app.use('/api/recommendations', createQueueMiddleware('recommendations', PRIORITY.LOW));
app.use('/api/skill-matching', createQueueMiddleware('recommendations', PRIORITY.LOW));
app.use('/api/chat', createQueueMiddleware('chat', PRIORITY.HIGH));
app.use('/api/ai-chat', createQueueMiddleware('ai-chat', PRIORITY.NORMAL));
app.use('/api/projects', createQueueMiddleware('projects', PRIORITY.NORMAL));

// Add queue stats to responses (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(queueStatsMiddleware);
}

// ============== PERFORMANCE MONITORING ==============
// Log slow requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (>2 seconds)
    if (duration > 2000) {
      console.warn(`⚠️  SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Log very slow requests (>5 seconds)
    if (duration > 5000) {
      console.error(`🔴 CRITICAL SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

// ============== MEMORY MONITORING ==============
// Monitor memory usage periodically
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const externalMB = Math.round(usage.external / 1024 / 1024);
    
    console.log(`[Memory] Heap: ${heapUsedMB}/${heapTotalMB}MB, External: ${externalMB}MB`);
    
    // Warn if memory usage is high
    if (heapUsedMB > 400) {
      console.warn(`⚠️  HIGH MEMORY USAGE: ${heapUsedMB}MB`);
    }
    
    // Critical memory warning
    if (heapUsedMB > 500) {
      console.error(`🔴 CRITICAL MEMORY USAGE: ${heapUsedMB}MB - Consider restarting`);
    }
  }, 60000); // Every minute
}

// ============== LOGGING MIDDLEWARE ==============
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });
}

// ============== API ROUTES ==============

// 1. Critical routes (with authentication rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// 2. User routes
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profile-update', userProfileUpdateRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/awards', awardsRoutes);

// 3. Project routes
app.use('/api/projects', collaborativeProjectCompletionRoutes);
app.use('/api/projects', taskRoutes);
app.use('/api/projects', projectMemberRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/solo-projects', soloProjectRoutes);

// 4. Interaction routes
app.use('/api/timeline', timelineRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/chat', chatRoutes);

// 5. AI and recommendation routes (with strict rate limiting)
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/skill-matching', strictLimiter, skillMatchingRoutes);
app.use('/api/recommendations', strictLimiter, recommendationsRoutes);
app.use('/api/courses', coursesRoutes);

// 6. Feature routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/github', githubRoutes);

// 7. Admin routes
app.use('/api/admin', adminRoutes);

// ============== HEALTH CHECK ==============
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    }
  });
});

// ============== ROOT ENDPOINT ==============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TechSync API Server',
    version: '2.0.0',
    documentation: {
      health: '/health',
      endpoints: '/api/*'
    }
  });
});

// ============== 404 HANDLER ==============
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ============== ERROR HANDLER ==============
app.use(errorHandler);

// ============== HTTP SERVER ==============
const server = createServer(app);

// ============== SOCKET.IO SETUP ==============
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  // Connection limits
  maxHttpBufferSize: 1e6, // 1MB
  perMessageDeflate: {
    threshold: 1024 // Only compress messages > 1KB
  }
});

// Setup optimized socket handlers
try {
  const setupSocketHandlers = require('./utils/socketHandler');
  if (typeof setupSocketHandlers === 'function') {
    setupSocketHandlers(io);
  } else {
    console.log('⚠️  Socket handler not properly exported');
  }
} catch (error) {
  console.error('❌ Failed to setup socket handlers:', error.message);
}

// ============== GRACEFUL SHUTDOWN ==============
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('✅ HTTP server closed');
  });

  // Close Socket.IO connections
  io.close(() => {
    console.log('✅ Socket.IO closed');
  });

  // Give existing requests 10 seconds to finish
  setTimeout(() => {
    console.log('⚠️  Forcing shutdown after timeout');
    process.exit(0);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============== ERROR HANDLERS ==============
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't crash on unhandled rejections, just log them
});

// ============== EXPORTS ==============
module.exports = { app, server, io };