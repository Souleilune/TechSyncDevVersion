// backend/utils/socketHandler.js - COMPLETE FIXED VERSION
require('dotenv').config(); // Load environment variables first
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables for socketHandler:');
  if (!process.env.SUPABASE_URL) console.error('  - SUPABASE_URL is missing');
  if (!process.env.SUPABASE_SERVICE_KEY) console.error('  - SUPABASE_SERVICE_KEY is missing');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Store user socket mappings
const userSockets = new Map();
const socketUsers = new Map();

const setupSocketHandlers = (io) => {
  console.log('🔌 Setting up Socket.io handlers for chat...');
  
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user details from database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return next(new Error('Invalid authentication token'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected with socket ${socket.id}`);
    
    // Store user-socket mapping
    userSockets.set(socket.userId, socket.id);
    socketUsers.set(socket.id, socket.userId);

    // Join user to their project rooms (ONLY projects they're members of)
    socket.on('join_project_rooms', async (projectId) => {
      try {
        // CRITICAL: Verify user is a member of the project
        const { data: membership, error } = await supabase
          .from('project_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', socket.userId)
          .single();

        if (error || !membership) {
          socket.emit('error', { message: 'Not authorized to join project rooms - you must be a project member' });
          return;
        }

        // Get all chat rooms for the project
        const { data: chatRooms, error: roomsError } = await supabase
          .from('chat_rooms')
          .select('id, name')
          .eq('project_id', projectId)
          .eq('is_archived', false);

        if (!roomsError && chatRooms) {
          // Join all project chat rooms
          chatRooms.forEach(room => {
            socket.join(`room_${room.id}`);
          });

          // Join project-specific room for announcements
          socket.join(`project_${projectId}`);

          socket.emit('joined_project_rooms', {
            projectId,
            rooms: chatRooms
          });

          console.log(`User ${socket.user.username} joined project ${projectId} rooms`);
        }
      } catch (error) {
        console.error('Error joining project rooms:', error);
        socket.emit('error', { message: 'Failed to join project rooms' });
      }
    });

    // Handle sending messages (ONLY to project members) - FIXED VERSION
    socket.on('send_message', async (data) => {
      try {
        const { roomId, projectId, content, messageType = 'text', replyToMessageId } = data;

        // CRITICAL: Verify user can send messages to this room
        const { data: membership, error: memberError } = await supabase
          .from('project_members')
          .select('*')
          .eq('project_id', projectId)
          .eq('user_id', socket.userId)
          .single();

        if (memberError || !membership) {
          socket.emit('error', { message: 'Not authorized to send messages - project members only' });
          return;
        }

        // Verify room belongs to project
        const { data: room, error: roomError } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('id', roomId)
          .eq('project_id', projectId)
          .eq('is_archived', false)
          .single();

        if (roomError || !room) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Save message to database first
        const { data: message, error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            room_id: roomId,
            user_id: socket.userId,
            content: content.trim(),
            message_type: messageType,
            reply_to_message_id: replyToMessageId || null
          })
          .select(`
            *,
            user:users!user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .single();

        if (messageError) {
          console.error('Error saving message:', messageError);
          socket.emit('error', { message: 'Failed to send message' });
          return;
        }

        // If this message is a reply, fetch the reply data separately (same as API fix)
        let processedMessage = { ...message };
        
        if (message.reply_to_message_id) {
          const { data: replyToMessage, error: replyError } = await supabase
            .from('chat_messages')
            .select(`
              id,
              content,
              user:users!user_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', message.reply_to_message_id)
            .single();

          if (!replyError && replyToMessage) {
            processedMessage.reply_to = replyToMessage;
          }
        }

        // Broadcast message to all users in the room (ONLY project members)
        io.to(`room_${roomId}`).emit('new_message', {
          message: processedMessage,
          roomId,
          projectId
        });

        // Send acknowledgment back to sender
        socket.emit('message_sent', { messageId: message.id });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message editing (only message owner) - FIXED VERSION
    socket.on('edit_message', async (data) => {
      try {
        const { messageId, content } = data;

        // Check if user owns the message
        const { data: message, error: messageError } = await supabase
          .from('chat_messages')
          .select('*, chat_rooms!inner(project_id)')
          .eq('id', messageId)
          .eq('user_id', socket.userId)
          .single();

        if (messageError || !message) {
          socket.emit('error', { message: 'Message not found or permission denied' });
          return;
        }

        // Update message
        const { data: updatedMessage, error: updateError } = await supabase
          .from('chat_messages')
          .update({
            content: content.trim(),
            is_edited: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', messageId)
          .select(`
            *,
            user:users!user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .single();

        if (updateError) {
          socket.emit('error', { message: 'Failed to edit message' });
          return;
        }

        // If this message is a reply, fetch the reply data separately (same as API fix)
        let processedMessage = { ...updatedMessage };
        
        if (updatedMessage.reply_to_message_id) {
          const { data: replyToMessage, error: replyError } = await supabase
            .from('chat_messages')
            .select(`
              id,
              content,
              user:users!user_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('id', updatedMessage.reply_to_message_id)
            .single();

          if (!replyError && replyToMessage) {
            processedMessage.reply_to = replyToMessage;
          }
        }

        // Broadcast updated message to room
        io.to(`room_${message.room_id}`).emit('message_edited', {
          message: processedMessage,
          roomId: message.room_id,
          projectId: message.chat_rooms.project_id
        });

      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message deletion (only message owner)
    socket.on('delete_message', async (data) => {
      try {
        const { messageId } = data;

        // Check if user owns the message
        const { data: message, error: messageError } = await supabase
          .from('chat_messages')
          .select('*, chat_rooms!inner(project_id)')
          .eq('id', messageId)
          .eq('user_id', socket.userId)
          .single();

        if (messageError || !message) {
          socket.emit('error', { message: 'Message not found or permission denied' });
          return;
        }

        // Delete message
        const { error: deleteError } = await supabase
          .from('chat_messages')
          .delete()
          .eq('id', messageId);

        if (deleteError) {
          socket.emit('error', { message: 'Failed to delete message' });
          return;
        }

        // Broadcast deletion to room
        io.to(`room_${message.room_id}`).emit('message_deleted', {
          messageId,
          roomId: message.room_id,
          projectId: message.chat_rooms.project_id
        });

      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle user typing indicators
    socket.on('typing_start', (data) => {
      const { roomId, projectId } = data;
      socket.to(`room_${roomId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        roomId,
        projectId
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId, projectId } = data;
      socket.to(`room_${roomId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        roomId,
        projectId
      });
    });

    // Handle user online status (only within projects)
    socket.on('get_online_users', (data) => {
      const { projectId } = data;
      // Get all connected users for this project
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

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      // Clean up mappings
      userSockets.delete(socket.userId);
      socketUsers.delete(socket.id);

      // Notify rooms about user going offline
      socket.rooms.forEach(roomName => {
        if (roomName.startsWith('project_')) {
          const projectId = roomName.replace('project_', '');
          socket.to(roomName).emit('user_offline', {
            userId: socket.userId,
            projectId
          });
        }
      });
    });

    // Send user online status to project members
    socket.on('user_online', (data) => {
      const { projectId } = data;
      socket.to(`project_${projectId}`).emit('user_online', {
        user: {
          id: socket.userId,
          username: socket.user.username,
          full_name: socket.user.full_name,
          avatar_url: socket.user.avatar_url
        },
        projectId
      });
    });
  });
  
  console.log('✅ Socket.io handlers setup complete');
};

module.exports = setupSocketHandlers;