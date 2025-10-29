// backend/scripts/validateUserProfiles.js
// Script to validate user profile completeness and data quality

const supabase = require('../config/supabase');

class UserProfileValidator {
  constructor() {
    this.results = {
      totalUsers: 0,
      issues: [],
      profileCompleteness: {
        complete: 0,          // Has languages AND topics
        partialLanguages: 0,  // Has languages only
        partialTopics: 0,     // Has topics only
        empty: 0             // Has neither
      },
      dataQuality: {
        usersWithExperience: 0,
        usersWithoutExperience: 0,
        avgLanguagesPerUser: 0,
        avgTopicsPerUser: 0,
        languageDistribution: {},
        topicDistribution: {},
        proficiencyDistribution: {}
      },
      recommendations: []
    };
  }

  async validate() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  🔍 USER PROFILE VALIDATION & DIAGNOSIS                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    try {
      await this.analyzeProfiles();
      await this.checkLanguages();
      await this.checkTopics();
      await this.generateRecommendations();
      this.printReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }

  async analyzeProfiles() {
    console.log('📊 Step 1: Analyzing user profiles...\n');

    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        years_experience,
        user_programming_languages (
          id,
          proficiency_level,
          years_experience,
          programming_languages (id, name)
        ),
        user_topics (
          id,
          interest_level,
          experience_level,
          topics (id, name, category)
        )
      `);

    if (error) throw error;

    this.results.totalUsers = users.length;
    let totalLanguages = 0;
    let totalTopics = 0;
    let usersWithExperience = 0;

    for (const user of users) {
      const hasLangs = user.user_programming_languages?.length > 0;
      const hasTopics = user.user_topics?.length > 0;
      const hasExperience = user.years_experience != null && user.years_experience !== '';

      if (hasExperience) usersWithExperience++;

      // Categorize profile completeness
      if (hasLangs && hasTopics) {
        this.results.profileCompleteness.complete++;
      } else if (hasLangs && !hasTopics) {
        this.results.profileCompleteness.partialLanguages++;
        this.results.issues.push({
          userId: user.id,
          email: user.email,
          issue: 'Missing topics',
          severity: 'HIGH',
          impact: 'Cannot recommend projects without topic preferences'
        });
      } else if (!hasLangs && hasTopics) {
        this.results.profileCompleteness.partialTopics++;
        this.results.issues.push({
          userId: user.id,
          email: user.email,
          issue: 'Missing programming languages',
          severity: 'HIGH',
          impact: 'Cannot recommend projects without language skills'
        });
      } else {
        this.results.profileCompleteness.empty++;
        this.results.issues.push({
          userId: user.id,
          email: user.email,
          issue: 'Empty profile - no languages or topics',
          severity: 'CRITICAL',
          impact: 'Will receive ZERO recommendations'
        });
      }

      if (!hasExperience) {
        this.results.issues.push({
          userId: user.id,
          email: user.email,
          issue: 'Missing experience level',
          severity: 'MEDIUM',
          impact: 'Difficulty matching may be inaccurate'
        });
      }

      // Count languages and topics
      if (hasLangs) {
        totalLanguages += user.user_programming_languages.length;
        
        // Track language distribution
        user.user_programming_languages.forEach(upl => {
          const langName = upl.programming_languages?.name || 'Unknown';
          this.results.dataQuality.languageDistribution[langName] = 
            (this.results.dataQuality.languageDistribution[langName] || 0) + 1;
          
          // Track proficiency
          const prof = String(upl.proficiency_level || 'Unknown').toLowerCase();
          this.results.dataQuality.proficiencyDistribution[prof] = 
            (this.results.dataQuality.proficiencyDistribution[prof] || 0) + 1;
        });
      }

      if (hasTopics) {
        totalTopics += user.user_topics.length;
        
        // Track topic distribution
        user.user_topics.forEach(ut => {
          const topicName = ut.topics?.name || 'Unknown';
          this.results.dataQuality.topicDistribution[topicName] = 
            (this.results.dataQuality.topicDistribution[topicName] || 0) + 1;
        });
      }
    }

    this.results.dataQuality.usersWithExperience = usersWithExperience;
    this.results.dataQuality.usersWithoutExperience = users.length - usersWithExperience;
    this.results.dataQuality.avgLanguagesPerUser = 
      this.results.profileCompleteness.complete + this.results.profileCompleteness.partialLanguages > 0
        ? (totalLanguages / (this.results.profileCompleteness.complete + this.results.profileCompleteness.partialLanguages)).toFixed(2)
        : 0;
    this.results.dataQuality.avgTopicsPerUser = 
      this.results.profileCompleteness.complete + this.results.profileCompleteness.partialTopics > 0
        ? (totalTopics / (this.results.profileCompleteness.complete + this.results.profileCompleteness.partialTopics)).toFixed(2)
        : 0;

    console.log(`✅ Analyzed ${users.length} users\n`);
  }

  async checkLanguages() {
    console.log('🔤 Step 2: Checking programming languages...\n');

    const { data: languages, error } = await supabase
      .from('programming_languages')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    console.log(`   Total active languages in database: ${languages.length}`);
    console.log(`   Languages used by users: ${Object.keys(this.results.dataQuality.languageDistribution).length}\n`);
  }

  async checkTopics() {
    console.log('📚 Step 3: Checking topics...\n');

    const { data: topics, error } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    console.log(`   Total active topics in database: ${topics.length}`);
    console.log(`   Topics used by users: ${Object.keys(this.results.dataQuality.topicDistribution).length}\n`);
  }

  generateRecommendations() {
    console.log('💡 Step 4: Generating recommendations...\n');

    const emptyRate = (this.results.profileCompleteness.empty / this.results.totalUsers) * 100;
    const partialRate = ((this.results.profileCompleteness.partialLanguages + 
                          this.results.profileCompleteness.partialTopics) / 
                          this.results.totalUsers) * 100;
    const completeRate = (this.results.profileCompleteness.complete / this.results.totalUsers) * 100;

    // Critical issues
    if (emptyRate > 20) {
      this.results.recommendations.push({
        priority: 'CRITICAL',
        issue: `${emptyRate.toFixed(1)}% of users have completely empty profiles`,
        action: 'Implement mandatory profile completion on signup',
        impact: 'HIGH - These users get ZERO recommendations'
      });
    }

    if (partialRate > 30) {
      this.results.recommendations.push({
        priority: 'HIGH',
        issue: `${partialRate.toFixed(1)}% of users have incomplete profiles`,
        action: 'Add profile completion prompts/reminders',
        impact: 'MEDIUM - These users get limited recommendations'
      });
    }

    if (completeRate < 50) {
      this.results.recommendations.push({
        priority: 'HIGH',
        issue: `Only ${completeRate.toFixed(1)}% of users have complete profiles`,
        action: 'Incentivize profile completion (badges, better matches, etc.)',
        impact: 'HIGH - Limits overall platform effectiveness'
      });
    }

    // Data quality issues
    const avgLangs = parseFloat(this.results.dataQuality.avgLanguagesPerUser);
    if (avgLangs < 2) {
      this.results.recommendations.push({
        priority: 'MEDIUM',
        issue: `Users average only ${avgLangs} programming languages`,
        action: 'Prompt users to add more languages (suggest popular ones)',
        impact: 'MEDIUM - Limits matching opportunities'
      });
    }

    const avgTopics = parseFloat(this.results.dataQuality.avgTopicsPerUser);
    if (avgTopics < 3) {
      this.results.recommendations.push({
        priority: 'MEDIUM',
        issue: `Users average only ${avgTopics} topics`,
        action: 'Suggest related topics based on languages/persona',
        impact: 'MEDIUM - Limits matching opportunities'
      });
    }

    console.log(`✅ Generated ${this.results.recommendations.length} recommendations\n`);
  }

  printReport() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    📋 VALIDATION REPORT                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // Profile Completeness
    console.log('📊 PROFILE COMPLETENESS:');
    console.log('─'.repeat(60));
    console.log(`   Total Users:          ${this.results.totalUsers}`);
    console.log(`   ✅ Complete Profiles:  ${this.results.profileCompleteness.complete} (${((this.results.profileCompleteness.complete/this.results.totalUsers)*100).toFixed(1)}%)`);
    console.log(`   ⚠️  Partial (Langs):   ${this.results.profileCompleteness.partialLanguages} (${((this.results.profileCompleteness.partialLanguages/this.results.totalUsers)*100).toFixed(1)}%)`);
    console.log(`   ⚠️  Partial (Topics):  ${this.results.profileCompleteness.partialTopics} (${((this.results.profileCompleteness.partialTopics/this.results.totalUsers)*100).toFixed(1)}%)`);
    console.log(`   ❌ Empty Profiles:     ${this.results.profileCompleteness.empty} (${((this.results.profileCompleteness.empty/this.results.totalUsers)*100).toFixed(1)}%)\n`);

    // Data Quality
    console.log('📈 DATA QUALITY METRICS:');
    console.log('─'.repeat(60));
    console.log(`   Users with Experience:     ${this.results.dataQuality.usersWithExperience}`);
    console.log(`   Users without Experience:  ${this.results.dataQuality.usersWithoutExperience}`);
    console.log(`   Avg Languages per User:    ${this.results.dataQuality.avgLanguagesPerUser}`);
    console.log(`   Avg Topics per User:       ${this.results.dataQuality.avgTopicsPerUser}\n`);

    // Top Languages
    console.log('🔝 TOP 10 PROGRAMMING LANGUAGES:');
    console.log('─'.repeat(60));
    const topLangs = Object.entries(this.results.dataQuality.languageDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    topLangs.forEach(([lang, count], idx) => {
      console.log(`   ${(idx + 1).toString().padStart(2)}. ${lang.padEnd(25)} ${count} users`);
    });
    console.log();

    // Top Topics
    console.log('🔝 TOP 10 TOPICS:');
    console.log('─'.repeat(60));
    const topTopics = Object.entries(this.results.dataQuality.topicDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    topTopics.forEach(([topic, count], idx) => {
      console.log(`   ${(idx + 1).toString().padStart(2)}. ${topic.padEnd(35)} ${count} users`);
    });
    console.log();

    // Proficiency Distribution
    console.log('📊 PROFICIENCY LEVEL DISTRIBUTION:');
    console.log('─'.repeat(60));
    Object.entries(this.results.dataQuality.proficiencyDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([level, count]) => {
        console.log(`   ${level.padEnd(15)} ${count} entries`);
      });
    console.log();

    // Critical Issues
    const criticalIssues = this.results.issues.filter(i => i.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      console.log('─'.repeat(60));
      console.log(`   ${criticalIssues.length} users with critical profile issues`);
      criticalIssues.slice(0, 5).forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue.email || issue.userId}`);
        console.log(`      Issue: ${issue.issue}`);
        console.log(`      Impact: ${issue.impact}`);
      });
      if (criticalIssues.length > 5) {
        console.log(`   ... and ${criticalIssues.length - 5} more`);
      }
      console.log();
    }

    // Recommendations
    console.log('💡 ACTIONABLE RECOMMENDATIONS:');
    console.log('─'.repeat(60));
    this.results.recommendations.forEach((rec, idx) => {
      console.log(`\n   ${idx + 1}. [${rec.priority}] ${rec.issue}`);
      console.log(`      Action: ${rec.action}`);
      console.log(`      Impact: ${rec.impact}`);
    });
    console.log();

    // Summary
    console.log('═'.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('═'.repeat(60));
    
    const completeRate = (this.results.profileCompleteness.complete / this.results.totalUsers) * 100;
    
    if (completeRate >= 70) {
      console.log('✅ Good profile completion rate - recommendation system should work well');
    } else if (completeRate >= 50) {
      console.log('⚠️  Moderate profile completion rate - recommendations will be limited');
      console.log('   → Focus on encouraging users to complete profiles');
    } else {
      console.log('❌ Low profile completion rate - this is your PRIMARY issue!');
      console.log('   → Implement mandatory profile completion');
      console.log('   → Add profile completion wizard');
      console.log('   → Show benefits of complete profile');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Address CRITICAL issues first (empty profiles)');
    console.log('   2. Implement profile completion prompts');
    console.log('   3. Run the improved test script: testRecommendationAlgorithm_Improved.js');
    console.log('   4. Monitor recommendation quality after profile improvements');
    console.log('═'.repeat(60));
  }
}

// Main execution
async function main() {
  const validator = new UserProfileValidator();
  
  try {
    await validator.validate();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = UserProfileValidator;