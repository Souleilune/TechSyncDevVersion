// frontend/src/components/chat/ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Reply, Edit3, Trash2, X } from 'lucide-react';

const ChatInterface = ({ projectId }) => {
  const { user } = useAuth();
  const {
    connected,
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
    createChatRoom
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState('general');
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingTimer, setTypingTimer] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Helper function to safely get user display name
  const getUserDisplayName = (userObj) => {
    if (!userObj) return 'Unknown User';
    return userObj.full_name || userObj.username || 'Unknown User';
  };

  // Helper function to safely get user initial
  const getUserInitial = (userObj) => {
    if (!userObj) return '?';
    const displayName = getUserDisplayName(userObj);
    return displayName.charAt(0).toUpperCase();
  };

  const getSafeUser = (message) => {
    // If user object exists, use it
    if (message.user && message.user.id) {
      return message.user;
    }
    
    // FALLBACK: Create a minimal user object from user_id
    console.warn('⚠️ Message missing user object, using fallback:', message.id);
    return {
      id: message.user_id || 'unknown',
      username: 'User',
      full_name: 'Unknown User',
      avatar_url: null
    };
  };

  // Initialize chat when component mounts
  useEffect(() => {
    if (projectId && connected) {
      joinProjectRooms(projectId);
      fetchChatRooms(projectId);
    }
  }, [projectId, connected, joinProjectRooms, fetchChatRooms]);

  // Load messages when active room changes
  useEffect(() => {
    if (activeRoom && projectId) {
      fetchMessages(projectId, activeRoom);
    }
  }, [activeRoom, projectId, fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {  // ✅ Make it async
  if (!messageInput.trim() || !activeRoom) return;

  if (editingMessage) {
    editMessage(editingMessage.id, messageInput);
    setEditingMessage(null);
  } else {
    // Send the message
    sendMessage(activeRoom, messageInput, 'text', replyingTo?.id);
    setReplyingTo(null);
    
    // ✅ LOG ACTIVITY - Add this block
    try {
      const { projectService } = await import('../../services/projectService');
      await projectService.logActivity(projectId, {
        action: 'sent message',
        target: messageInput.length > 50 
          ? messageInput.substring(0, 50) + '...' 
          : messageInput,
        type: 'message_sent',
        metadata: { 
          roomId: activeRoom,
          roomName: activeRoomData?.name || 'Unknown Room'
        }
      });
      console.log('✅ Activity logged for message send');
    } catch (activityError) {
      console.error('Failed to log activity:', activityError);
      // Don't block message sending if activity logging fails
    }
  }

  setMessageInput('');
  if (typingTimer) {
    clearTimeout(typingTimer);
    stopTyping(activeRoom);
  }
};
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (activeRoom) {
      startTyping(activeRoom);
      
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
      
      setTypingTimer(setTimeout(() => {
        stopTyping(activeRoom);
      }, 1000));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('Room name is required');
      return;
    }

    const room = await createChatRoom(projectId, newRoomName, newRoomDescription, newRoomType);
    if (room) {
      setShowCreateRoom(false);
      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomType('general');
      setActiveRoom(room.id);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const oneDay = 24 * 60 * 60 * 1000;

      if (diff < oneDay && date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diff < 7 * oneDay) {
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid date';
    }
  };

  const activeRoomData = chatRooms.find(room => room.id === activeRoom);
  const currentMessages = activeRoom ? (messages[activeRoom] || []) : [];
  const currentTypingUsers = activeRoom ? (typingUsers[activeRoom] || {}) : {};

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes globalLogoRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .global-loading-spinner {
            animation: globalLogoRotate 2s linear infinite;
          }
        `}</style>
        
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          minHeight: '400px',
          fontSize: '18px',
          color: '#9ca3af'}}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px' 
          }}>
            <div className="global-loading-spinner" style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/images/logo/TechSyncLogo.png" 
                alt="TechSync Logo" 
                style={{
                  width: '125%',
                  height: '125%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <span style={{ color: '#9ca3af', fontSize: '18px' }}>Loading chat...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      backgroundColor: '#0F1116', 
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar - Chat Rooms */}
      <div style={{ 
        width: '320px', 
        borderRight: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        background: 'rgba(26, 28, 32, 0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>Project Chat</h2>
            <button
              onClick={() => setShowCreateRoom(true)}
              style={{ 
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              +
            </button>
          </div>
          
          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: connected ? '#10b981' : '#ef4444'
            }}></div>
            <span style={{ color: connected ? '#10b981' : '#ef4444' }}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Room List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              style={{
                width: '100%',
                padding: '16px 20px',
                textAlign: 'left',
                backgroundColor: activeRoom === room.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: 'none',
                borderLeft: activeRoom === room.id ? '4px solid #3b82f6' : '4px solid transparent',
                cursor: 'pointer',
                color: activeRoom === room.id ? '#60a5fa' : '#d1d5db',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>#</span>
                <span style={{ fontWeight: '500' }}>{room.name}</span>
              </div>
              {room.description && (
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, paddingLeft: '20px' }}>
                  {room.description}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Online Users */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
            Online ({onlineUsers.length})
          </div>
          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981'
                }}></div>
                <span>{getUserDisplayName(onlineUser)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        {activeRoomData ? (
          <>
            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '16px',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              {/* Messages Container */}
              <div style={{ flex: 1, paddingBottom: '16px' }}>
                {currentMessages.map((message) => {
                  // ✅ CRITICAL FIX: Don't filter out messages, use fallback instead
                  if (!message) {
                    console.warn('⚠️ Null message detected, skipping');
                    return null;
                  }

                  const messageUser = getSafeUser(message);  // ✅ Use safe getter with fallback
                  const isOwnMessage = user && messageUser && messageUser.id === user.id;

                  return (
                    <div 
                      key={message.id} 
                      style={{ 
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOwnMessage ? 'flex-end' : 'flex-start', // This properly aligns the entire message
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        const actions = e.currentTarget.querySelector('.message-actions');
                        if (actions) actions.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        const actions = e.currentTarget.querySelector('.message-actions');
                        if (actions) actions.style.opacity = '0';
                      }}
                    >
                      {/* Reply indicator - now properly handles backend data */}
                      {message.reply_to && (
                        <div style={{ 
                          marginBottom: '8px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          maxWidth: '300px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          color: '#93c5fd',
                          alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
                          width: 'fit-content'
                        }}>
                          <div style={{ 
                            marginBottom: '4px', 
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6M3 10l6-6"/>
                            </svg>
                            {isOwnMessage ? 'You replied to' : 'Replying to'} {
                              message.reply_to.user 
                                ? getUserDisplayName(message.reply_to.user) 
                                : (message.reply_to.username || message.reply_to.full_name || 'someone')
                            }
                          </div>
                          {(message.reply_to.content || message.reply_to.message) && (
                            <div style={{ 
                              fontStyle: 'italic',
                              opacity: 0.8,
                              borderLeft: '2px solid rgba(59, 130, 246, 0.4)',
                              paddingLeft: '8px',
                              marginLeft: '2px',
                              fontSize: '11px',
                              maxHeight: '60px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              "{message.reply_to.content || message.reply_to.message}"
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        maxWidth: '70%' // Limit message width for better readability
                      }}>
                        {/* Avatar */}
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: '#3b82f6', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          flexShrink: 0,
                          alignSelf: 'flex-end'
                        }}>
                          {getUserInitial(message.user)}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            marginBottom: '4px',
                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                          }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#d1d5db' }}>
                              {isOwnMessage ? 'You' : getUserDisplayName(message.user)}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {formatTime(message.created_at)}
                            </span>
                            {message.is_edited && (
                              <span style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>(edited)</span>
                            )}
                          </div>
                          
                          <div style={{ position: 'relative', display: 'flex', justifyContent: isOwnMessage ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              padding: '10px 14px',
                              borderRadius: '16px',
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-wrap',
                              backgroundColor: isOwnMessage ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                              color: 'white',
                              borderBottomRightRadius: isOwnMessage ? '6px' : '16px',
                              borderBottomLeftRadius: isOwnMessage ? '16px' : '6px',
                              width: 'fit-content',
                              maxWidth: '100%'
                            }}>
                              {message.content || 'Message content unavailable'}
                            </div>
                            
                            {/* Message Actions */}
                            <div 
                              className="message-actions" 
                              style={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                [isOwnMessage ? 'left' : 'right']: '-80px',
                                display: 'flex',
                                gap: '4px',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                                background: 'rgba(26, 28, 32, 0.95)',
                                borderRadius: '8px',
                                padding: '4px',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}
                            >
                              <button
                                onClick={() => setReplyingTo(message)}
                                title="Reply"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#9ca3af',
                                  cursor: 'pointer',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#9ca3af';
                                }}
                              >
                                <Reply size={14} />
                              </button>
                              
                              {isOwnMessage && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingMessage(message);
                                      setMessageInput(message.content || '');
                                      messageInputRef.current?.focus();
                                    }}
                                    title="Edit"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#9ca3af',
                                      cursor: 'pointer',
                                      padding: '6px',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                      e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = 'transparent';
                                      e.target.style.color = '#9ca3af';
                                    }}
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    title="Delete"
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#9ca3af',
                                      cursor: 'pointer',
                                      padding: '6px',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                      e.target.style.color = '#ef4444';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = 'transparent';
                                      e.target.style.color = '#9ca3af';
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicators */}
                {Object.keys(currentTypingUsers).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#9ca3af' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        backgroundColor: '#9ca3af', 
                        borderRadius: '50%', 
                        animation: 'bounce 1.4s infinite ease-in-out'
                      }}></div>
                      <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        backgroundColor: '#9ca3af', 
                        borderRadius: '50%', 
                        animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                      }}></div>
                      <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        backgroundColor: '#9ca3af', 
                        borderRadius: '50%', 
                        animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                      }}></div>
                    </div>
                    <span>
                      {Object.values(currentTypingUsers).join(', ')} {Object.keys(currentTypingUsers).length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                )}
              </div>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Banner */}
            {replyingTo && replyingTo.user && (
              <div style={{ 
                padding: '12px 20px', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: '#60a5fa', fontWeight: '600', marginBottom: '6px' }}>
                    Replying to {getUserDisplayName(replyingTo.user)}
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    borderLeft: '3px solid #3b82f6',
                    fontSize: '13px',
                    color: '#d1d5db',
                    fontStyle: 'italic',
                    lineHeight: '1.4',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    "{replyingTo.content || 'Message content unavailable'}"
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#9ca3af',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Edit Banner */}
            {editingMessage && (
              <div style={{ 
                padding: '12px 20px',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderTop: '1px solid rgba(251, 191, 36, 0.2)',
                borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '14px', color: '#fbbf24' }}>
                  Editing message
                </div>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setMessageInput('');
                  }}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#9ca3af',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Message Input */}
            <div style={{ 
              padding: '20px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
              background: 'rgba(26, 28, 32, 0.95)',
              backdropFilter: 'blur(20px)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    ref={messageInputRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      editingMessage 
                        ? 'Edit your message...' 
                        : `Message #${activeRoomData.name}`
                    }
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      resize: 'none',
                      minHeight: '44px',
                      maxHeight: '120px',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      backdropFilter: 'blur(8px)'
                    }}
                    rows="1"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                    backgroundColor: messageInput.trim() ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                    color: messageInput.trim() ? 'white' : '#9ca3af',
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (messageInput.trim()) {
                      e.target.style.backgroundColor = '#2563eb';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (messageInput.trim()) {
                      e.target.style.backgroundColor = '#3b82f6';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Room Selected */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F1116' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', color: '#3b82f6' }}>#</div>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'white', marginBottom: '8px' }}>Welcome to Project Chat</h3>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
                {chatRooms.length > 0 
                  ? 'Select a chat room to start messaging with your project team'
                  : 'Create your first chat room to get started'
                }
              </p>
              {chatRooms.length === 0 && (
                <button
                  onClick={() => setShowCreateRoom(true)}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    borderRadius: '8px', 
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Create Chat Room
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: '#1a1c20', 
            borderRadius: '12px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '448px',
            margin: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', margin: '0 0 16px 0', color: 'white' }}>
              Create New Chat Room
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '4px' }}>
                  Room Name *
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white'
                  }}
                  placeholder="e.g., General Discussion"
                  maxLength="50"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '80px',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white'
                  }}
                  placeholder="Optional description for the room..."
                  maxLength="200"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '4px' }}>
                  Room Type
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white'
                  }}
                >
                  <option value="general">General</option>
                  <option value="development">Development</option>
                  <option value="announcements">Announcements</option>
                  <option value="random">Random</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowCreateRoom(false);
                  setNewRoomName('');
                  setNewRoomDescription('');
                  setNewRoomType('general');
                }}
                style={{ 
                  flex: 1, 
                  padding: '10px 16px', 
                  color: '#d1d5db', 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
                style={{ 
                  flex: 1, 
                  padding: '10px 16px', 
                  borderRadius: '8px',
                  border: 'none',
                  cursor: newRoomName.trim() ? 'pointer' : 'not-allowed',
                  backgroundColor: newRoomName.trim() ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                  color: newRoomName.trim() ? 'white' : '#9ca3af',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS animations */}
      <style>{`
        @keyframes globalLogoRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .global-loading-spinner {
          animation: globalLogoRotate 2s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;