// backend/controllers/chatController.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Get all chat rooms for a project
const getProjectChatRooms = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify user is a project member
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    // Get all chat rooms for the project
    const { data: chatRooms, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        created_by_user:users!created_by (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat rooms:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch chat rooms',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: chatRooms || []
    });

  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a new chat room
const createChatRoom = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, room_type = 'general' } = req.body;
    const userId = req.user.id;

    // Verify user is a project member with appropriate permissions
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

    // Only project owner and members can create rooms
    if (!['owner', 'member'].includes(membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to create chat rooms'
      });
    }

    // Create the chat room
    const { data: chatRoom, error } = await supabase
      .from('chat_rooms')
      .insert({
        project_id: projectId,
        name: name.trim(),
        description: description?.trim(),
        room_type,
        created_by: userId
      })
      .select(`
        *,
        created_by_user:users!created_by (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating chat room:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create chat room',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Chat room created successfully',
      data: chatRoom
    });

  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get messages for a specific chat room - FIXED VERSION
const getRoomMessages = async (req, res) => {
  try {
    const { projectId, roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Verify user is a project member
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    // Verify the room belongs to the project
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('project_id', projectId)
      .single();

    if (roomError || !room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    const offset = (page - 1) * limit;

    // Get messages with user info first
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:users!user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
        error: error.message
      });
    }

    // Now get reply data for messages that have replies
    const processedMessages = [];
    
    for (const message of messages || []) {
      let processedMessage = { ...message };
      
      // If message has a reply_to_message_id, fetch the reply data
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
      
      processedMessages.push(processedMessage);
    }

    // Reverse to show oldest first
    const sortedMessages = processedMessages.reverse();

    res.json({
      success: true,
      data: {
        messages: sortedMessages,
        room: room,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: messages?.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get room messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send a message to a chat room - FIXED VERSION
const sendMessage = async (req, res) => {
  try {
    const { projectId, roomId } = req.params;
    const { content, message_type = 'text', reply_to_message_id } = req.body;
    const userId = req.user.id;

    // Verify user is a project member
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    // Verify the room belongs to the project
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('project_id', projectId)
      .eq('is_archived', false)
      .single();

    if (roomError || !room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found or archived'
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }

    // Create the message first
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content: content.trim(),
        message_type,
        reply_to_message_id: reply_to_message_id || null
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

    if (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }

    // If this message is a reply, fetch the reply data
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

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: processedMessage
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Edit a message - FIXED VERSION
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty'
      });
    }

    // Check if user owns the message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();

    if (messageError || !message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to edit it'
      });
    }

    // Update the message
    const { data: updatedMessage, error } = await supabase
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
        ),
        reply_to:chat_messages!reply_to_message_id (
          id,
          content,
          user:users!user_id (
            id,
            username,
            full_name
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update message',
        error: error.message
      });
    }

    // Process the message to clean up reply_to data
    let processedMessage = updatedMessage;
    if (!updatedMessage.reply_to || !updatedMessage.reply_to.id || !updatedMessage.reply_to.content) {
      const { reply_to, ...messageWithoutReply } = updatedMessage;
      processedMessage = messageWithoutReply;
    }

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: processedMessage
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Check if user owns the message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .eq('user_id', userId)
      .single();

    if (messageError || !message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to delete it'
      });
    }

    // Delete the message
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete message',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getProjectChatRooms,
  createChatRoom,
  getRoomMessages,
  sendMessage,
  editMessage,
  deleteMessage
};