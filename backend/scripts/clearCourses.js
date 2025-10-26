// backend/scripts/clearCourses.js
// Quick script to delete all course data
require('dotenv').config();
const supabase = require('../config/supabase');

async function clearAllCourses() {
    try {
        console.log('🧹 Clearing all course data...\n');

        // Delete in reverse order of dependencies to avoid foreign key issues
        
        console.log('Deleting user_lesson_progress...');
        const { error: progressError } = await supabase
            .from('user_lesson_progress')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (progressError && progressError.code !== 'PGRST116') {
            console.error('Error deleting progress:', progressError);
        } else {
            console.log('✅ user_lesson_progress cleared');
        }

        console.log('Deleting user_course_enrollments...');
        const { error: enrollError } = await supabase
            .from('user_course_enrollments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (enrollError && enrollError.code !== 'PGRST116') {
            console.error('Error deleting enrollments:', enrollError);
        } else {
            console.log('✅ user_course_enrollments cleared');
        }

        console.log('Deleting course_reviews...');
        const { error: reviewError } = await supabase
            .from('course_reviews')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (reviewError && reviewError.code !== 'PGRST116') {
            console.error('Error deleting reviews:', reviewError);
        } else {
            console.log('✅ course_reviews cleared');
        }

        console.log('Deleting course_lessons...');
        const { error: lessonError } = await supabase
            .from('course_lessons')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (lessonError && lessonError.code !== 'PGRST116') {
            console.error('Error deleting lessons:', lessonError);
        } else {
            console.log('✅ course_lessons cleared');
        }

        console.log('Deleting course_modules...');
        const { error: moduleError } = await supabase
            .from('course_modules')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (moduleError && moduleError.code !== 'PGRST116') {
            console.error('Error deleting modules:', moduleError);
        } else {
            console.log('✅ course_modules cleared');
        }

        console.log('Deleting courses...');
        const { error: courseError } = await supabase
            .from('courses')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (courseError && courseError.code !== 'PGRST116') {
            console.error('Error deleting courses:', courseError);
        } else {
            console.log('✅ courses cleared');
        }

        console.log('\n🎉 All course data cleared successfully!');
        console.log('You can now run: node scripts/seedCourseContent.js');

    } catch (error) {
        console.error('❌ Error clearing courses:', error.message);
    }
}

// Run the script
clearAllCourses()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });