// frontend/src/contexts/ChatContext.js
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
      const socketInstance = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('Connected to chat server');
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Handle new messages
      socketInstance.on('new_message', (data) => {
        const { message, roomId } = data;
        setMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), message]
        }));
      });

      // Handle message edits
      socketInstance.on('message_edited', (data) => {
        const { message, roomId } = data;
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
        setOnlineUsers(data.users);
      });

      socketInstance.on('user_online', (data) => {
        setOnlineUsers(prev => {
          const exists = prev.some(u => u.id === data.user.id);
          return exists ? prev : [...prev, data.user];
        });
      });

      socketInstance.on('user_offline', (data) => {
        setOnlineUsers(prev => prev.filter(u => u.id !== data.userId));
      });

      // Handle errors
      socketInstance.on('error', (data) => {
        console.error('Chat error:', data.message);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user, token]);

  // Join project rooms (only for projects user is member of)
  const joinProjectRooms = useCallback((projectId) => {
    if (socket && connected) {
      socket.emit('join_project_rooms', projectId);
      socket.emit('user_online', { projectId });
      socket.emit('get_online_users', { projectId });
      setCurrentProject(projectId);
    }
  }, [socket, connected]);

  // Send message (only to project members)
  const sendMessage = useCallback((roomId, content, messageType = 'text', replyToMessageId = null) => {
    if (socket && connected && currentProject) {
      socket.emit('send_message', {
        roomId,
        projectId: currentProject,
        content,
        messageType,
        replyToMessageId
      });
    }
  }, [socket, connected, currentProject]);

  // Edit message
  const editMessage = useCallback((messageId, content) => {
    if (socket && connected) {
      socket.emit('edit_message', { messageId, content });
    }
  }, [socket, connected]);

  // Delete message
  const deleteMessage = useCallback((messageId) => {
    if (socket && connected) {
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
        setChatRooms(data.data);
        // Set first room as active if none selected
        if (data.data.length > 0 && !activeRoom) {
          setActiveRoom(data.data[0].id);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
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
        setMessages(prev => ({
          ...prev,
          [roomId]: page === 1 ? data.data.messages : [...data.data.messages, ...(prev[roomId] || [])]
        }));
        return data.data.pagination;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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
        setChatRooms(prev => [...prev, data.data]);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      return null;
    }
  }, [token]);

  // Clear messages when changing projects
  const clearMessages = useCallback(() => {
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