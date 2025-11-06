// backend/controllers/timelineController.js
const supabase = require('../config/supabase');

/**
 * GET /api/timeline/feed
 * Get timeline feed for the "For You" tab
 * Returns posts from completed projects with reactions and comments
 */
const getTimelineFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      filter = 'all' // 'all', 'friends', 'solo', 'group'
    } = req.query;

    const offset = (page - 1) * limit;

    console.log('📰 Fetching timeline feed for user:', userId);

    // Build query based on filter
    let query = supabase
      .from('timeline_posts')
      .select(`
        *,
        author:users!user_id (
          id,
          username,
          full_name,
          avatar_url,
          bio
        ),
        project:projects (
          id,
          title,
          status
        )
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filter === 'solo') {
      query = query.eq('project_type', 'solo');
    } else if (filter === 'group') {
      query = query.eq('project_type', 'group');
    } else if (filter === 'friends') {
      // Get user's friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      const friendIds = friendships?.map(f => 
        f.user_id === userId ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length > 0) {
        query = query.in('user_id', friendIds);
      } else {
        // No friends, return empty
        return res.json({
          success: true,
          data: {
            posts: [],
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 0,
              hasMore: false
            }
          }
        });
      }
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      console.error('Error fetching timeline posts:', postsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline feed'
      });
    }

    // Fetch reactions and comments for each post
    const postsWithEngagement = await Promise.all(
      posts.map(async (post) => {
        // Get reactions
        const { data: reactions } = await supabase
          .from('timeline_post_reactions')
          .select('id, user_id, reaction_type')
          .eq('post_id', post.id);

        // Get user's reaction
        const userReaction = reactions?.find(r => r.user_id === userId);

        // Count reactions by type
        const syncCount = reactions?.filter(r => r.reaction_type === 'sync').length || 0;
        const loveCount = reactions?.filter(r => r.reaction_type === 'love').length || 0;

        // Get comments count (not full comments, just count)
        const { count: commentsCount } = await supabase
          .from('timeline_post_comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);

        return {
          ...post,
          engagement: {
            reactions: {
              sync: syncCount,
              love: loveCount,
              total: syncCount + loveCount,
              userReaction: userReaction?.reaction_type || null
            },
            commentsCount: commentsCount || 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        posts: postsWithEngagement,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: posts.length,
          hasMore: posts.length === limit
        }
      }
    });

  } catch (error) {
    console.error('Error in getTimelineFeed:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * POST /api/timeline/posts/:postId/react
 * Add or update reaction to a timeline post
 * Body: { reactionType: 'sync' | 'love' }
 */
const reactToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user.id;

    // Validate reaction type
    if (!['sync', 'love'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type. Must be "sync" or "love"'
      });
    }

    console.log(`👍 User ${userId} reacting to post ${postId} with ${reactionType}`);

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('timeline_posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already reacted
    const { data: existingReaction } = await supabase
      .from('timeline_post_reactions')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingReaction) {
      // If same reaction, remove it (toggle off)
      if (existingReaction.reaction_type === reactionType) {
        const { error: deleteError } = await supabase
          .from('timeline_post_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) {
          throw deleteError;
        }

        return res.json({
          success: true,
          message: 'Reaction removed',
          data: {
            action: 'removed',
            reactionType: null
          }
        });
      } else {
        // Update to new reaction type
        const { error: updateError } = await supabase
          .from('timeline_post_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);

        if (updateError) {
          throw updateError;
        }

        return res.json({
          success: true,
          message: 'Reaction updated',
          data: {
            action: 'updated',
            reactionType
          }
        });
      }
    } else {
      // Create new reaction
      const { data: newReaction, error: insertError } = await supabase
        .from('timeline_post_reactions')
        .insert({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return res.status(201).json({
        success: true,
        message: 'Reaction added',
        data: {
          action: 'added',
          reactionType,
          reaction: newReaction
        }
      });
    }

  } catch (error) {
    console.error('Error in reactToPost:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to react to post',
      error: error.message
    });
  }
};

/**
 * GET /api/timeline/posts/:postId/comments
 * Get comments for a timeline post
 */
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    console.log(`💬 Fetching comments for post ${postId}`);

    // Fetch top-level comments (no parent)
    const { data: comments, error: commentsError } = await supabase
      .from('timeline_post_comments')
      .select(`
        *,
        author:users!user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (commentsError) {
      throw commentsError;
    }

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const { data: replies } = await supabase
          .from('timeline_post_comments')
          .select(`
            *,
            author:users!user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('parent_comment_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || []
        };
      })
    );

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: comments.length,
          hasMore: comments.length === limit
        }
      }
    });

  } catch (error) {
    console.error('Error in getPostComments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

/**
 * POST /api/timeline/posts/:postId/comments
 * Add a comment to a timeline post
 * Body: { content: string, parentCommentId?: uuid }
 */
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content too long (max 2000 characters)'
      });
    }

    console.log(`💬 User ${userId} commenting on post ${postId}`);

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('timeline_posts')
      .select('id, user_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // If replying, verify parent comment exists
    if (parentCommentId) {
      const { data: parentComment, error: parentError } = await supabase
        .from('timeline_post_comments')
        .select('id, post_id')
        .eq('id', parentCommentId)
        .eq('post_id', postId)
        .single();

      if (parentError || !parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Create comment
    const { data: comment, error: insertError } = await supabase
      .from('timeline_post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        parent_comment_id: parentCommentId || null
      })
      .select(`
        *,
        author:users!user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      throw insertError;
    }

    // TODO: Create notification for post author (if not commenting on own post)
    if (post.user_id !== userId) {
      // Create notification logic here
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment
      }
    });

  } catch (error) {
    console.error('Error in addComment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

/**
 * PUT /api/timeline/comments/:commentId
 * Update a comment
 * Body: { content: string }
 */
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content too long (max 2000 characters)'
      });
    }

    // Check if user owns the comment
    const { data: comment, error: fetchError } = await supabase
      .from('timeline_post_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or access denied'
      });
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('timeline_post_comments')
      .update({
        content: content.trim(),
        is_edited: true
      })
      .eq('id', commentId)
      .select(`
        *,
        author:users!user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment: updatedComment
      }
    });

  } catch (error) {
    console.error('Error in updateComment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message
    });
  }
};

/**
 * DELETE /api/timeline/comments/:commentId
 * Delete a comment
 */
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Check if user owns the comment
    const { data: comment, error: fetchError } = await supabase
      .from('timeline_post_comments')
      .select('id, user_id, post_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment author or post author
    const { data: post } = await supabase
      .from('timeline_posts')
      .select('user_id')
      .eq('id', comment.post_id)
      .single();

    const isCommentAuthor = comment.user_id === userId;
    const isPostAuthor = post?.user_id === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to delete this comment'
      });
    }

    // Delete comment (cascade will handle replies)
    const { error: deleteError } = await supabase
      .from('timeline_post_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      throw deleteError;
    }

    res.status(204).send();

  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

/**
 * GET /api/timeline/posts/:postId
 * Get a single timeline post with full details
 */
const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { data: post, error: postError } = await supabase
      .from('timeline_posts')
      .select(`
        *,
        author:users!user_id (
          id,
          username,
          full_name,
          avatar_url,
          bio
        ),
        project:projects (
          id,
          title,
          status,
          description
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get reactions
    const { data: reactions } = await supabase
      .from('timeline_post_reactions')
      .select('id, user_id, reaction_type')
      .eq('post_id', postId);

    const userReaction = reactions?.find(r => r.user_id === userId);
    const syncCount = reactions?.filter(r => r.reaction_type === 'sync').length || 0;
    const loveCount = reactions?.filter(r => r.reaction_type === 'love').length || 0;

    // Get comments count
    const { count: commentsCount } = await supabase
      .from('timeline_post_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);

    const postWithEngagement = {
      ...post,
      engagement: {
        reactions: {
          sync: syncCount,
          love: loveCount,
          total: syncCount + loveCount,
          userReaction: userReaction?.reaction_type || null
        },
        commentsCount: commentsCount || 0
      }
    };

    res.json({
      success: true,
      data: {
        post: postWithEngagement
      }
    });

  } catch (error) {
    console.error('Error in getPost:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

module.exports = {
  getTimelineFeed,
  reactToPost,
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
  getPost
};