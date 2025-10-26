// backend/routes/courses.js - FIXED
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // FIXED: Changed from database to supabase
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/courses
 * Get all published courses with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { category, level, search, featured } = req.query;

    let query = supabase
      .from('courses')
      .select(`
        *,
        course_reviews(rating)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (level) {
      query = query.eq('level', level);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: courses, error } = await query;

    if (error) throw error;

    // Calculate average rating and enrollment count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Get enrollment count
        const { count: enrollmentCount } = await supabase
          .from('user_course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        // Calculate average rating
        const ratings = course.course_reviews || [];
        const avgRating = ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
          : 0;

        return {
          ...course,
          enrollment_count: enrollmentCount || 0,
          average_rating: parseFloat(avgRating),
          review_count: ratings.length
        };
      })
    );

    res.json({
      success: true,
      courses: coursesWithStats
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
});

/**
 * GET /api/courses/my-courses
 * Get user's enrolled courses
 */
router.get('/my-courses', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: enrollments, error } = await supabase
      .from('user_course_enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      enrollments
    });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enrolled courses'
    });
  }
});

/**
 * GET /api/courses/:courseId
 * Get a single course with full details
 */
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_modules (
          *,
          course_lessons (*)
        ),
        course_reviews (
          *,
          users (username, avatar_url)
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) throw error;

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get enrollment count
    const { count: enrollmentCount } = await supabase
      .from('user_course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    // Calculate average rating
    const ratings = course.course_reviews || [];
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    res.json({
      success: true,
      course: {
        ...course,
        enrollment_count: enrollmentCount || 0,
        average_rating: parseFloat(avgRating),
        review_count: ratings.length
      }
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course details'
    });
  }
});

/**
 * POST /api/courses/:courseId/enroll
 * Enroll in a course
 */
router.post('/:courseId/enroll', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('user_course_enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return res.json({
        success: true,
        message: 'Already enrolled',
        enrollment: existingEnrollment
      });
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from('user_course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enroll in course'
    });
  }
});

/**
 * GET /api/courses/:courseId/progress
 * Get user's progress in a course
 */
router.get('/:courseId/progress', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('user_course_enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (enrollmentError || !enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Not enrolled in this course'
      });
    }

    const { data: lessons } = await supabase
      .from('course_lessons')
      .select(`
        *,
        course_modules!inner(course_id),
        user_lesson_progress!left(status, completed_at)
      `)
      .eq('course_modules.course_id', courseId)
      .eq('user_lesson_progress.user_id', userId);

    res.json({
      success: true,
      enrollment,
      lessons
    });

  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
});

/**
 * PUT /api/courses/lessons/:lessonId/progress
 * Update lesson progress
 */
router.put('/lessons/:lessonId/progress', authMiddleware, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { status, enrollmentId } = req.body;
    const userId = req.user.id;

    const progressData = {
      user_id: userId,
      lesson_id: lessonId,
      enrollment_id: enrollmentId,
      status
    };

    if (status === 'in_progress' && !progressData.started_at) {
      progressData.started_at = new Date().toISOString();
    }
    
    if (status === 'completed') {
      progressData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert(progressData, {
        onConflict: 'user_id,lesson_id'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      progress: data
    });

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update progress'
    });
  }
});

/**
 * PUT /api/courses/:courseId/enrollment/progress
 * Update enrollment progress percentage
 */
router.put('/:courseId/enrollment/progress', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress_percentage } = req.body;
    const userId = req.user.id;

    // Validate progress percentage
    if (typeof progress_percentage !== 'number' || progress_percentage < 0 || progress_percentage > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid progress percentage'
      });
    }

    // Update enrollment progress
    const { data: enrollment, error } = await supabase
      .from('user_course_enrollments')
      .update({
        progress_percentage,
        last_accessed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      enrollment
    });

  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update enrollment progress'
    });
  }
});


module.exports = router;