// backend/controllers/timelineController_OPTIMIZED.js
// PERFORMANCE-OPTIMIZED VERSION
// Fixes N+1 queries that caused 10658ms response time
// Expected improvement: 10658ms → 200-300ms (97% faster!)

const supabase = require('../config/supabase');

/**
 * GET /api/timeline/feed
 * OPTIMIZED: Uses batch queries instead of N+1 pattern
 * Get timeline feed for the "For You" tab
 */
const getTimelineFeed = async (req, res) => {
  try {
    const startTime = Date.now();
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      filter = 'all' // 'all', 'friends', 'solo', 'group'
    } = req.query;

    const offset = (page - 1) * limit;

    console.log(`📰 Fetching timeline feed for user: ${userId}, filter: ${filter}`);

    // Build query based on filter
    let query = supabase
      .from('timeline_posts')
      .select(`
        *,
        author:users!timeline_posts_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          bio
        ),
        project:projects!timeline_posts_project_id_fkey (
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

    console.log(`✅ Fetched ${posts?.length || 0} posts in ${Date.now() - startTime}ms`);

    if (!posts || posts.length === 0) {
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

    // ✅ OPTIMIZATION: Batch fetch all reactions for all posts at once
    const engagementStart = Date.now();
    const postIds = posts.map(p => p.id);

    const [reactionsResult, commentsCountResult] = await Promise.all([
      // Fetch ALL reactions for ALL posts in ONE query
      supabase
        .from('timeline_post_reactions')
        .select('id, post_id, user_id, reaction_type')
        .in('post_id', postIds),
      
      // Fetch comment counts for ALL posts in ONE query
      supabase
        .from('timeline_post_comments')
        .select('post_id')
        .in('post_id', postIds)
    ]);

    console.log(`✅ Fetched engagement data in ${Date.now() - engagementStart}ms`);

    // Group reactions by post_id
    const reactionsByPost = {};
    (reactionsResult.data || []).forEach(reaction => {
      if (!reactionsByPost[reaction.post_id]) {
        reactionsByPost[reaction.post_id] = [];
      }
      reactionsByPost[reaction.post_id].push(reaction);
    });

    // Count comments by post_id
    const commentCountsByPost = {};
    (commentsCountResult.data || []).forEach(comment => {
      commentCountsByPost[comment.post_id] = (commentCountsByPost[comment.post_id] || 0) + 1;
    });

    // ✅ OPTIMIZATION: Process engagement data in memory (much faster than N queries)
    const postsWithEngagement = posts.map(post => {
      const reactions = reactionsByPost[post.id] || [];
      const userReaction = reactions.find(r => r.user_id === userId);
      
      const syncCount = reactions.filter(r => r.reaction_type === 'sync').length;
      const loveCount = reactions.filter(r => r.reaction_type === 'love').length;
      
      return {
        ...post,
        engagement: {
          reactions: {
            sync: syncCount,
            love: loveCount,
            total: syncCount + loveCount,
            userReaction: userReaction?.reaction_type || null
          },
          commentsCount: commentCountsByPost[post.id] || 0
        }
      };
    });

    console.log(`✅ Total feed request time: ${Date.now() - startTime}ms`);

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

    // Check if user already reacted
    const { data: existingReaction } = await supabase
      .from('timeline_post_reactions')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    let action, finalReactionType;

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Same reaction - remove it
        await supabase
          .from('timeline_post_reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        action = 'removed';
        finalReactionType = null;
      } else {
        // Different reaction - update it
        await supabase
          .from('timeline_post_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);
        
        action = 'updated';
        finalReactionType = reactionType;
      }
    } else {
      // New reaction - add it
      await supabase
        .from('timeline_post_reactions')
        .insert([{
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType
        }]);
      
      action = 'added';
      finalReactionType = reactionType;
    }

    res.json({
      success: true,
      message: `Reaction ${action}`,
      data: {
        action,
        reactionType: finalReactionType
      }
    });

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
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Fetch comments with author info
    const { data: comments, error } = await supabase
      .from('timeline_post_comments')
      .select(`
        *,
        author:users!timeline_post_comments_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch comments'
      });
    }

    // Organize comments into tree structure (parent comments with replies)
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(commentMap.get(comment.id));
        }
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    res.json({
      success: true,
      data: {
        comments: rootComments,
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
        message: 'Comment content cannot be empty'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content must not exceed 2000 characters'
      });
    }

    // If replying, verify parent comment exists
    if (parentCommentId) {
      const { data: parentComment } = await supabase
        .from('timeline_post_comments')
        .select('id')
        .eq('id', parentCommentId)
        .eq('post_id', postId)
        .single();

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    // Insert comment
    const { data: comment, error } = await supabase
      .from('timeline_post_comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content: content.trim(),
        parent_comment_id: parentCommentId || null
      }])
      .select(`
        *,
        author:users!timeline_post_comments_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add comment'
      });
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
 */
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: comment, error: fetchError } = await supabase
      .from('timeline_post_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update this comment'
      });
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('timeline_post_comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        *,
        author:users!timeline_post_comments_user_id_fkey (
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

    const { data: post, error } = await supabase
      .from('timeline_posts')
      .select(`
        *,
        author:users!timeline_posts_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          bio
        ),
        project:projects!timeline_posts_project_id_fkey (
          id,
          title,
          status
        )
      `)
      .eq('id', postId)
      .single();

    if (error || !post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Fetch engagement data
    const [reactions, commentsCount, userReaction] = await Promise.all([
      supabase
        .from('timeline_post_reactions')
        .select('reaction_type')
        .eq('post_id', postId),
      
      supabase
        .from('timeline_post_comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId),
      
      supabase
        .from('timeline_post_reactions')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()
    ]);

    const syncCount = reactions.data?.filter(r => r.reaction_type === 'sync').length || 0;
    const loveCount = reactions.data?.filter(r => r.reaction_type === 'love').length || 0;

    res.json({
      success: true,
      data: {
        post: {
          ...post,
          engagement: {
            reactions: {
              sync: syncCount,
              love: loveCount,
              total: syncCount + loveCount,
              userReaction: userReaction.data?.reaction_type || null
            },
            commentsCount: commentsCount.count || 0
          }
        }
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