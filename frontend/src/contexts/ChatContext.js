// frontend/src/contexts/ChatContext.js - MINIMAL FIX with Enhanced Debugging
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeRoom, setActiveRoom] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      // Socket URL - works with your current Vercel env
      const socketUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
      
      console.log('🔌 [SOCKET] Connecting to:', socketUrl);
      console.log('🔌 [SOCKET] User:', user.username);
      
      const socketInstance = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socketInstance.on('connect', () => {
        console.log('✅ [SOCKET] Connected! ID:', socketInstance.id);
        setConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('❌ [SOCKET] Disconnected. Reason:', reason);
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('❌ [SOCKET] Connection error:', error.message);
        setConnected(false);
      });

      // Handle new messages FROM OTHER USERS
      socketInstance.on('new_message', (data) => {
        const { message, roomId } = data;
        console.log('📩 [SOCKET] new_message (from other):', { roomId, messageId: message.id, from: message.user?.username });
        setMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), message]
        }));
      });

      // ✅ Handle message_sent confirmation FOR SENDER'S OWN MESSAGE
      socketInstance.on('message_sent', (data) => {
        const { message, roomId } = data;
        console.log('✅ [SOCKET] message_sent (own message):', { roomId, messageId: message.id });
        setMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), message]
        }));
      });

      // Handle message edits
      socketInstance.on('message_edited', (data) => {
        const { message, roomId } = data;
        console.log('✏️ [SOCKET] message_edited:', { roomId, messageId: message.id });
        setMessages(prev => ({
          ...prev,
          [roomId]: prev[roomId]?.map(msg => 
            msg.id === message.id ? message : msg
          ) || []
        }));
      });

      // Handle message deletions
      socketInstance.on('message_deleted', (data) => {
        const { messageId, roomId } = data;
        console.log('🗑️ [SOCKET] message_deleted:', { roomId, messageId });
        setMessages(prev => ({
          ...prev,
          [roomId]: prev[roomId]?.filter(msg => msg.id !== messageId) || []
        }));
      });

      // Handle typing indicators
      socketInstance.on('user_typing', (data) => {
        const { userId, username, roomId } = data;
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: {
            ...prev[roomId],
            [userId]: username
          }
        }));
      });

      socketInstance.on('user_stopped_typing', (data) => {
        const { userId, roomId } = data;
        setTypingUsers(prev => {
          const newState = { ...prev };
          if (newState[roomId]) {
            delete newState[roomId][userId];
            if (Object.keys(newState[roomId]).length === 0) {
              delete newState[roomId];
            }
          }
          return newState;
        });
      });

      // Handle online users
      socketInstance.on('online_users', (data) => {
        console.log('👥 [SOCKET] online_users:', data.users?.length || 0);
        setOnlineUsers(data.users);
      });

      socketInstance.on('user_online', (data) => {
        console.log('🟢 [SOCKET] user_online:', data.user?.username);
        setOnlineUsers(prev => {
          const exists = prev.some(u => u.id === data.user.id);
          return exists ? prev : [...prev, data.user];
        });
      });

      socketInstance.on('user_offline', (data) => {
        console.log('🔴 [SOCKET] user_offline:', data.userId);
        setOnlineUsers(prev => prev.filter(u => u.id !== data.userId));
      });

      // Handle errors
      socketInstance.on('error', (data) => {
        console.error('❌ [SOCKET] error event:', data.message);
      });

      // ✅ NEW: Listen for rooms_joined confirmation
      socketInstance.on('rooms_joined', (data) => {
        console.log('✅ [SOCKET] rooms_joined:', data);
      });

      setSocket(socketInstance);

      return () => {
        console.log('🔌 [SOCKET] Cleaning up connection');
        socketInstance.disconnect();
      };
    }
  }, [user, token]);

  // Join project rooms (only for projects user is member of)
  const joinProjectRooms = useCallback((projectId) => {
    if (socket && connected) {
      console.log('📍 [SOCKET] Joining project rooms for:', projectId);
      socket.emit('join_project_rooms', projectId);
      socket.emit('user_online', { projectId });
      socket.emit('get_online_users', { projectId });
      setCurrentProject(projectId);
    } else {
      console.error('❌ [SOCKET] Cannot join rooms. Socket:', !!socket, 'Connected:', connected);
    }
  }, [socket, connected]);

  // Send message (only to project members)
  const sendMessage = useCallback((roomId, content, messageType = 'text', replyToMessageId = null) => {
    if (!socket) {
      console.error('❌ [SEND_MESSAGE] No socket instance!');
      return;
    }
    if (!connected) {
      console.error('❌ [SEND_MESSAGE] Socket not connected!');
      return;
    }
    if (!currentProject) {
      console.error('❌ [SEND_MESSAGE] No current project set!');
      return;
    }

    const messageData = {
      roomId,
      projectId: currentProject,
      content,
      messageType,
      replyToMessageId
    };

    console.log('📤 [SEND_MESSAGE] Emitting:', {
      ...messageData,
      content: content.substring(0, 50) + '...',
      socketId: socket.id
    });

    // ✅ CRITICAL: Emit the event
    socket.emit('send_message', messageData);

    // Log to confirm emit was called
    console.log('✅ [SEND_MESSAGE] Event emitted successfully');

  }, [socket, connected, currentProject]);

  // Edit message
  const editMessage = useCallback((messageId, content) => {
    if (socket && connected) {
      console.log('✏️ [EDIT_MESSAGE] Emitting:', messageId);
      socket.emit('edit_message', { messageId, content });
    }
  }, [socket, connected]);

  // Delete message
  const deleteMessage = useCallback((messageId) => {
    if (socket && connected) {
      console.log('🗑️ [DELETE_MESSAGE] Emitting:', messageId);
      socket.emit('delete_message', { messageId });
    }
  }, [socket, connected]);

  // Typing indicators
  const startTyping = useCallback((roomId) => {
    if (socket && connected && currentProject) {
      socket.emit('typing_start', { roomId, projectId: currentProject });
    }
  }, [socket, connected, currentProject]);

  const stopTyping = useCallback((roomId) => {
    if (socket && connected && currentProject) {
      socket.emit('typing_stop', { roomId, projectId: currentProject });
    }
  }, [socket, connected, currentProject]);

  // Fetch chat rooms for project (only if user is member)
  const fetchChatRooms = useCallback(async (projectId) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/projects/${projectId}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('📋 [FETCH_ROOMS] Got rooms:', data.data.length);
        setChatRooms(data.data);
        // Set first room as active if none selected
        if (data.data.length > 0 && !activeRoom) {
          setActiveRoom(data.data[0].id);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ [FETCH_ROOMS] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [token, activeRoom]);

  // Fetch messages for a room (only if user is project member)
  const fetchMessages = useCallback(async (projectId, roomId, page = 1) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/chat/projects/${projectId}/rooms/${roomId}/messages?page=${page}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        console.log('📨 [FETCH_MESSAGES] Got messages:', data.data.messages.length);
        setMessages(prev => ({
          ...prev,
          [roomId]: page === 1 ? 
            data.data.messages : 
            [...data.data.messages, ...(prev[roomId] || [])]
        }));
        return data.data.pagination;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ [FETCH_MESSAGES] Error:', error);
      return null;
    }
  }, [token]);

  // Create new chat room (only for project members)
  const createChatRoom = useCallback(async (projectId, name, description, roomType = 'general') => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/projects/${projectId}/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          room_type: roomType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('➕ [CREATE_ROOM] Created:', data.data.name);
        setChatRooms(prev => [...prev, data.data]);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ [CREATE_ROOM] Error:', error);
      return null;
    }
  }, [token]);

  // Clear messages when changing projects
  const clearMessages = useCallback(() => {
    console.log('🧹 [CLEAR] Clearing all messages and state');
    setMessages({});
    setActiveRoom(null);
    setChatRooms([]);
    setOnlineUsers([]);
    setTypingUsers({});
    setCurrentProject(null);
  }, []);

  const value = {
    socket,
    connected,
    currentProject,
    chatRooms,
    messages,
    activeRoom,
    onlineUsers,
    typingUsers,
    loading,
    setActiveRoom,
    joinProjectRooms,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    fetchChatRooms,
    fetchMessages,
    createChatRoom,
    clearMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;