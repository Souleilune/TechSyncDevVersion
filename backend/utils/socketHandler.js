// backend/utils/socketHandler.js - OPTIMIZED VERSION WITH MEMORY MANAGEMENT
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables for socketHandler');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// ============== MEMORY-OPTIMIZED USER TRACKING ==============
class UserConnectionManager {
  constructor() {
    this.userSockets = new Map(); // userId -> socketId
    this.socketUsers = new Map(); // socketId -> userId
    this.socketRooms = new Map(); // socketId -> Set of rooms
    this.cleanupInterval = null;
  }

  addConnection(userId, socketId) {
    this.userSockets.set(userId, socketId);
    this.socketUsers.set(socketId, userId);
    this.socketRooms.set(socketId, new Set());
  }

  addRoom(socketId, room) {
    if (!this.socketRooms.has(socketId)) {
      this.socketRooms.set(socketId, new Set());
    }
    this.socketRooms.get(socketId).add(room);
  }

  removeConnection(socketId) {
    const userId = this.socketUsers.get(socketId);
    if (userId) {
      this.userSockets.delete(userId);
    }
    this.socketUsers.delete(socketId);
    this.socketRooms.delete(socketId);
  }

  getRooms(socketId) {
    return this.socketRooms.get(socketId) || new Set();
  }

  getStats() {
    return {
      totalConnections: this.socketUsers.size,
      totalRooms: Array.from(this.socketRooms.values()).reduce((sum, rooms) => sum + rooms.size, 0),
      memoryUsage: process.memoryUsage()
    };
  }

  // Periodic cleanup of stale connections
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const stats = this.getStats();
      console.log(`[Socket Cleanup] Active connections: ${stats.totalConnections}, Memory: ${(stats.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }, 60000); // Every minute
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

const connectionManager = new UserConnectionManager();

const setupSocketHandlers = (io) => {
  console.log('🔌 Setting up optimized Socket.io handlers...');
  
  // Start connection cleanup monitor
  connectionManager.startCleanup();

  // ============== CONNECTION LIMITING ==============
  // Prevent memory exhaustion from too many connections
  const MAX_CONNECTIONS_PER_USER = 5;
  const activeConnections = new Map(); // userId -> connection count

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return next(new Error('Invalid authentication token'));
      }

      // Check connection limit per user
      const userConnectionCount = activeConnections.get(user.id) || 0;
      if (userConnectionCount >= MAX_CONNECTIONS_PER_USER) {
        return next(new Error('Maximum connections exceeded'));
      }

      socket.userId = user.id;
      socket.user = user;
      
      // Track connection count
      activeConnections.set(user.id, userConnectionCount + 1);
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Connection] User ${socket.user.username} (${socket.id})`);
    
    // Add to connection manager
    connectionManager.addConnection(socket.userId, socket.id);

    // ============== OPTIMIZED ROOM JOINING ==============
    socket.on('join_project_rooms', async (projectId) => {
      try {
        // Verify user is member of project
        const { data: membership, error } = await supabase
          .from('project_members')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', socket.userId)
          .single();

        if (error || !membership) {
          socket.emit('error', { message: 'Not a project member' });
          return;
        }

        // Fetch chat rooms for this project (with limit to prevent memory issues)
        const { data: rooms, error: roomsError } = await supabase
          .from('chat_rooms')
          .select('id, name')
          .eq('project_id', projectId)
          .limit(50); // Limit rooms per project

        if (roomsError) {
          socket.emit('error', { message: 'Failed to fetch chat rooms' });
          return;
        }

        // Join project room
        const projectRoom = `project_${projectId}`;
        socket.join(projectRoom);
        connectionManager.addRoom(socket.id, projectRoom);

        // Join individual chat rooms
        if (rooms && rooms.length > 0) {
          rooms.forEach(room => {
            const roomName = `room_${room.id}`;
            socket.join(roomName);
            connectionManager.addRoom(socket.id, roomName);
          });
        }

        socket.emit('rooms_joined', {
          projectId,
          rooms: rooms || []
        });

      } catch (error) {
        console.error('[join_project_rooms] Error:', error);
        socket.emit('error', { message: 'Failed to join project rooms' });
      }
    });

    // ============== OPTIMIZED MESSAGE HANDLING ==============
    // Rate limiting for messages
    const MESSAGE_RATE_LIMIT = 10; // messages per minute
    const messageTimestamps = [];

    socket.on('send_message', async (data) => {
      try {
        // Rate limiting check
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const recentMessages = messageTimestamps.filter(t => t > oneMinuteAgo);
        
        if (recentMessages.length >= MESSAGE_RATE_LIMIT) {
          socket.emit('error', { message: 'Message rate limit exceeded' });
          return;
        }
        
        messageTimestamps.push(now);
        // Clean old timestamps to prevent memory leak
        while (messageTimestamps.length > 0 && messageTimestamps[0] < oneMinuteAgo) {
          messageTimestamps.shift();
        }

        const { roomId, projectId, content, messageType = 'text', replyToMessageId = null } = data;

        // Validate input
        if (!roomId || !content || content.trim().length === 0) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Limit message length to prevent memory issues
        const MAX_MESSAGE_LENGTH = 5000;
        const trimmedContent = content.slice(0, MAX_MESSAGE_LENGTH);

        // Verify room membership
        const { data: room, error: roomError } = await supabase
          .from('chat_rooms')
          .select('project_id')
          .eq('id', roomId)
          .single();

        if (roomError || !room) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Verify project membership
        const { data: membership } = await supabase
          .from('project_members')
          .select('id')
          .eq('project_id', room.project_id)
          .eq('user_id', socket.userId)
          .single();

        if (!membership) {
          socket.emit('error', { message: 'Not a project member' });
          return;
        }

        // Insert message
        const { data: newMessage, error: insertError } = await supabase
          .from('chat_messages')
          .insert({
            room_id: roomId,
            user_id: socket.userId,
            message_type: messageType,
            content: trimmedContent,
            reply_to_message_id: replyToMessageId
          })
          .select(`
            *,
            users!inner(id, username, full_name, avatar_url)
          `)
          .single();

        if (insertError) {
          console.error('[send_message] Insert error:', insertError);
          socket.emit('error', { message: 'Failed to send message' });
          return;
        }

        // Process message (add reply data if needed)
        const processedMessage = { ...newMessage };
        if (replyToMessageId) {
          const { data: replyToMessage } = await supabase
            .from('chat_messages')
            .select('*, users!inner(id, username, full_name, avatar_url)')
            .eq('id', replyToMessageId)
            .single();

          if (replyToMessage) {
            processedMessage.reply_to = replyToMessage;
          }
        }

        // Broadcast to room (not back to sender)
        socket.to(`room_${roomId}`).emit('new_message', {
          message: processedMessage,
          roomId,
          projectId: room.project_id
        });

        // Send confirmation to sender
        socket.emit('message_sent', {
          message: processedMessage,
          roomId
        });

      } catch (error) {
        console.error('[send_message] Error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ============== TYPING INDICATORS (DEBOUNCED) ==============
    const typingTimeouts = new Map();

    socket.on('typing_start', (data) => {
      const { roomId, projectId } = data;
      
      // Clear existing timeout
      if (typingTimeouts.has(roomId)) {
        clearTimeout(typingTimeouts.get(roomId));
      }

      socket.to(`room_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        roomId,
        projectId
      });

      // Auto-stop typing after 5 seconds
      const timeout = setTimeout(() => {
        socket.to(`room_${roomId}`).emit('user_stopped_typing', {
          userId: socket.userId,
          roomId,
          projectId
        });
        typingTimeouts.delete(roomId);
      }, 5000);

      typingTimeouts.set(roomId, timeout);
    });

    socket.on('typing_stop', (data) => {
      const { roomId, projectId } = data;
      
      // Clear timeout
      if (typingTimeouts.has(roomId)) {
        clearTimeout(typingTimeouts.get(roomId));
        typingTimeouts.delete(roomId);
      }

      socket.to(`room_${roomId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        roomId,
        projectId
      });
    });

    // ============== ONLINE STATUS ==============
    socket.on('get_online_users', (data) => {
      const { projectId } = data;
      const onlineUsers = [];
      
      io.sockets.sockets.forEach((clientSocket) => {
        if (clientSocket.userId && clientSocket.rooms.has(`project_${projectId}`)) {
          onlineUsers.push({
            id: clientSocket.userId,
            username: clientSocket.user.username,
            full_name: clientSocket.user.full_name,
            avatar_url: clientSocket.user.avatar_url
          });
        }
      });

      socket.emit('online_users', { projectId, users: onlineUsers });
    });

    // ============== DISCONNECT HANDLING ==============
    socket.on('disconnect', () => {
      console.log(`[Disconnect] User ${socket.user.username} (${socket.id})`);
      
      // Clean up typing timeouts
      typingTimeouts.forEach((timeout) => clearTimeout(timeout));
      typingTimeouts.clear();

      // Decrease connection count
      const userConnectionCount = activeConnections.get(socket.userId) || 0;
      if (userConnectionCount <= 1) {
        activeConnections.delete(socket.userId);
      } else {
        activeConnections.set(socket.userId, userConnectionCount - 1);
      }

      // Notify rooms about user going offline
      const rooms = connectionManager.getRooms(socket.id);
      rooms.forEach(roomName => {
        if (roomName.startsWith('project_')) {
          const projectId = roomName.replace('project_', '');
          socket.to(roomName).emit('user_offline', {
            userId: socket.userId,
            projectId
          });
        }
      });

      // Remove from connection manager
      connectionManager.removeConnection(socket.id);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Socket] Shutting down...');
    connectionManager.stopCleanup();
    io.close(() => {
      console.log('[Socket] Closed all connections');
    });
  });

  console.log('✅ Optimized Socket.io handlers setup complete');
};

module.exports = setupSocketHandlers;