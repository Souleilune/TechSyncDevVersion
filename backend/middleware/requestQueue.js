// backend/middleware/requestQueue.js
// Request queue middleware to prevent server overload from concurrent requests

const Queue = require('bull');
const Redis = require('ioredis');

class RequestQueueManager {
  constructor() {
    // In-memory queue if Redis not available
    this.queues = new Map();
    this.processing = new Map();
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 10;
    this.useRedis = false;

    // Try to initialize Redis if available
    this.initializeRedis();
  }

  initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          retryStrategy: () => null
        });

        this.redis.on('connect', () => {
          console.log('✅ Redis connected for request queue');
          this.useRedis = true;
        });

        this.redis.on('error', (err) => {
          console.log('⚠️  Redis not available, using in-memory queue');
          this.useRedis = false;
        });
      } else {
        console.log('ℹ️  No REDIS_URL found, using in-memory request queue');
      }
    } catch (error) {
      console.log('ℹ️  Redis initialization failed, using in-memory queue');
    }
  }

  // Get or create queue for a specific endpoint type
  getQueue(queueName) {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.processing.set(queueName, 0);
    }
    return this.queues.get(queueName);
  }

  // Add request to queue
  async enqueue(queueName, requestHandler, priority = 5) {
    return new Promise((resolve, reject) => {
      const queue = this.getQueue(queueName);
      
      queue.push({
        handler: requestHandler,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Sort by priority (lower number = higher priority)
      queue.sort((a, b) => a.priority - b.priority);

      // Try to process immediately
      this.processQueue(queueName);
    });
  }

  // Process queued requests
  async processQueue(queueName) {
    const queue = this.getQueue(queueName);
    const currentProcessing = this.processing.get(queueName) || 0;

    // Check if we can process more requests
    while (queue.length > 0 && currentProcessing < this.maxConcurrent) {
      const request = queue.shift();
      this.processing.set(queueName, currentProcessing + 1);

      // Process request
      this.executeRequest(queueName, request);
    }
  }

  // Execute a single request
  async executeRequest(queueName, request) {
    try {
      const result = await request.handler();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      // Decrease processing count
      const current = this.processing.get(queueName) || 0;
      this.processing.set(queueName, Math.max(0, current - 1));

      // Process next request in queue
      this.processQueue(queueName);
    }
  }

  // Get queue stats
  getStats(queueName) {
    const queue = this.getQueue(queueName);
    return {
      queued: queue.length,
      processing: this.processing.get(queueName) || 0,
      maxConcurrent: this.maxConcurrent
    };
  }
}

// Singleton instance
const queueManager = new RequestQueueManager();

// ============== MIDDLEWARE FACTORY ==============

/**
 * Create queue middleware for specific endpoint types
 * @param {string} queueName - Name of the queue (e.g., 'recommendations', 'chat', 'projects')
 * @param {number} priority - Priority level (1=highest, 10=lowest)
 */
function createQueueMiddleware(queueName, priority = 5) {
  return async (req, res, next) => {
    // Skip queue for health checks
    if (req.path === '/health' || req.path === '/') {
      return next();
    }

    try {
      // Wrap the request in a promise that resolves when next() is called
      await queueManager.enqueue(queueName, async () => {
        return new Promise((resolve) => {
          // Store resolve function to call after response is sent
          res.on('finish', () => resolve());
          next();
        });
      }, priority);
    } catch (error) {
      console.error(`Queue error for ${queueName}:`, error);
      res.status(503).json({
        success: false,
        message: 'Server is busy, please try again later'
      });
    }
  };
}

// ============== PRIORITY CONSTANTS ==============
const PRIORITY = {
  CRITICAL: 1,    // Authentication, health checks
  HIGH: 3,        // User actions, message sending
  NORMAL: 5,      // General API requests
  LOW: 7,         // Background tasks
  BACKGROUND: 10  // Non-urgent operations
};

// ============== MONITORING MIDDLEWARE ==============
function queueStatsMiddleware(req, res, next) {
  // Attach queue stats to response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (process.env.NODE_ENV === 'development') {
      data._queueStats = {
        recommendations: queueManager.getStats('recommendations'),
        chat: queueManager.getStats('chat'),
        projects: queueManager.getStats('projects')
      };
    }
    return originalJson(data);
  };
  next();
}

// ============== CLEANUP ==============
process.on('SIGTERM', () => {
  console.log('Shutting down request queue...');
  if (queueManager.redis) {
    queueManager.redis.quit();
  }
});

module.exports = {
  queueManager,
  createQueueMiddleware,
  queueStatsMiddleware,
  PRIORITY
};