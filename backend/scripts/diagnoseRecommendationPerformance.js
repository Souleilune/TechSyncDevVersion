// backend/scripts/diagnoseRecommendationPerformance.js
// Quick diagnostic to find performance bottlenecks

const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');

async function diagnosePerformance() {
  console.log('\n🔍 RECOMMENDATION PERFORMANCE DIAGNOSTIC\n');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Database query speed
    console.log('\n📊 Test 1: Database Query Performance');
    console.log('─'.repeat(60));
    
    const dbStart = Date.now();
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, 
        email,
        years_experience,
        topics:user_topics(
          topics(name), 
          experience_level, 
          interest_level
        ),
        programming_languages:user_programming_languages(
          programming_languages(name), 
          proficiency_level, 
          years_experience
        )
      `)
      .limit(1);
    const dbTime = Date.now() - dbStart;
    
    if (error || !users || users.length === 0) {
      throw new Error('Failed to fetch user');
    }
    
    console.log(`✅ Database query: ${dbTime}ms`);
    console.log(`   User: ${users[0].email}`);
    console.log(`   Topics: ${users[0].topics?.length || 0}`);
    console.log(`   Languages: ${users[0].programming_languages?.length || 0}`);
    
    // Test 2: Get available projects
    console.log('\n📊 Test 2: Fetch Available Projects');
    console.log('─'.repeat(60));
    
    const projStart = Date.now();
    const { data: projects } = await supabase
      .from('projects')
      .select(`
        *,
        project_topics(topics(*)),
        project_languages(programming_languages(*), required_level, is_primary)
      `)
      .eq('status', 'recruiting');
    const projTime = Date.now() - projStart;
    
    console.log(`✅ Project fetch: ${projTime}ms`);
    console.log(`   Total projects: ${projects?.length || 0}`);
    
    // Test 3: Single recommendation
    console.log('\n📊 Test 3: Generate Recommendations for 1 User');
    console.log('─'.repeat(60));
    
    const recStart = Date.now();
    const recommendations = await skillMatching.recommendProjects(users[0].id, { limit: 10 });
    const recTime = Date.now() - recStart;
    
    console.log(`✅ Recommendation generation: ${recTime}ms`);
    console.log(`   Recommendations found: ${recommendations.length}`);
    
    if (recommendations.length > 0) {
      console.log(`   Score range: ${Math.min(...recommendations.map(r => r.score))} - ${Math.max(...recommendations.map(r => r.score))}`);
      console.log(`   Avg score: ${(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length).toFixed(2)}`);
    }
    
    // Test 4: Multiple users in sequence
    console.log('\n📊 Test 4: Process 5 Users in Sequence');
    console.log('─'.repeat(60));
    
    const { data: testUsers } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);
    
    const sequentialStart = Date.now();
    let totalRecs = 0;
    
    for (let i = 0; i < testUsers.length; i++) {
      const userStart = Date.now();
      const recs = await skillMatching.recommendProjects(testUsers[i].id, { limit: 10 });
      const userTime = Date.now() - userStart;
      
      totalRecs += recs.length;
      console.log(`   User ${i+1} (${testUsers[i].email}): ${userTime}ms → ${recs.length} recs`);
      
      if (userTime > 5000) {
        console.log(`   ⚠️  WARNING: Slow processing!`);
      }
    }
    
    const sequentialTime = Date.now() - sequentialStart;
    console.log(`\n✅ Total time: ${sequentialTime}ms`);
    console.log(`   Avg time per user: ${(sequentialTime / testUsers.length).toFixed(0)}ms`);
    console.log(`   Total recommendations: ${totalRecs}`);
    
    // Performance summary
    console.log('\n' + '═'.repeat(60));
    console.log('📋 PERFORMANCE SUMMARY');
    console.log('═'.repeat(60));
    
    const avgTimePerUser = sequentialTime / testUsers.length;
    const projected20Users = (avgTimePerUser * 20) / 1000;
    const projected100Users = (avgTimePerUser * 100) / 1000;
    
    console.log(`\nAverage processing time per user: ${avgTimePerUser.toFixed(0)}ms`);
    console.log(`\nProjected times:`);
    console.log(`  20 users:  ${projected20Users.toFixed(1)}s (${(projected20Users/60).toFixed(1)} min)`);
    console.log(`  50 users:  ${(avgTimePerUser * 50 / 1000).toFixed(1)}s (${(avgTimePerUser * 50 / 60000).toFixed(1)} min)`);
    console.log(`  100 users: ${projected100Users.toFixed(1)}s (${(projected100Users/60).toFixed(1)} min)`);
    
    // Performance analysis
    console.log('\n🎯 ANALYSIS:');
    
    if (avgTimePerUser < 1000) {
      console.log('✅ GOOD: Processing is fast (<1s per user)');
    } else if (avgTimePerUser < 3000) {
      console.log('⚠️  ACCEPTABLE: Processing is moderate (1-3s per user)');
      console.log('   Consider optimizing database queries or algorithm');
    } else {
      console.log('🔴 SLOW: Processing is very slow (>3s per user)');
      console.log('   ACTION REQUIRED: Investigate bottlenecks');
    }
    
    // Bottleneck identification
    console.log('\n🔍 POTENTIAL BOTTLENECKS:');
    
    if (dbTime > 500) {
      console.log('🔴 Database queries are slow (>500ms)');
      console.log('   → Add database indexes');
      console.log('   → Optimize query joins');
    }
    
    if (projTime > 1000) {
      console.log('🔴 Project fetching is slow (>1s)');
      console.log('   → Consider caching project data');
      console.log('   → Reduce number of joins');
    }
    
    const algorithmTime = recTime - dbTime - projTime;
    if (algorithmTime > 1000) {
      console.log('🔴 Algorithm computation is slow (>1s)');
      console.log('   → Optimize scoring calculations');
      console.log('   → Reduce iteration complexity');
    }
    
    console.log('\n' + '═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
    throw error;
  }
}

// Run diagnostic
if (require.main === module) {
  diagnosePerformance()
    .then(() => {
      console.log('\n✨ Diagnostic completed!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = diagnosePerformance;