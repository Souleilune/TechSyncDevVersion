// backend/scripts/testRecommendationAlgorithm_Improved.js
// IMPROVED VERSION - Better diagnostics for user profile issues

const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');

class ImprovedRecommendationTester {
  constructor() {
    this.results = {
      testDate: new Date().toISOString(),
      totalUsers: 0,
      totalRecommendations: 0,
      usersWithNoRecommendations: 0,
      usersWithRecommendations: 0,
      confusionMatrix: {
        truePositive: 0,
        falsePositive: 0,
        trueNegative: 0,
        falseNegative: 0
      },
      metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0
      },
      scoreDistribution: {
        'excellent (90-100)': 0,
        'good (75-89)': 0,
        'acceptable (55-74)': 0,
        'poor (<55)': 0
      },
      userProfileQuality: {
        usersWithLanguages: 0,
        usersWithTopics: 0,
        usersWithBoth: 0,
        usersWithNeither: 0,
        avgLanguagesPerUser: 0,
        avgTopicsPerUser: 0
      },
      userSamples: [],
      executionTime: 0
    };
  }

  async runTest() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  🧪 IMPROVED RECOMMENDATION ALGORITHM TESTING            ║');
    console.log('║  With User Profile Quality Diagnostics                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const startTime = Date.now();

    try {
      // Step 1: Analyze user profile quality
      console.log('📊 Step 1: Analyzing user profile quality...');
      await this.analyzeUserProfiles();
      
      // Step 2: Get test users
      console.log('\n📊 Step 2: Fetching users for testing...');
      const users = await this.getTestUsers(100);
      console.log(`✅ Retrieved ${users.length} users\n`);

      // Step 3: Generate recommendations
      console.log('🔍 Step 3: Generating recommendations...');
      await this.testRecommendations(users);
      console.log('✅ Recommendations generated\n');

      // Step 4: Calculate metrics
      console.log('📈 Step 4: Calculating metrics...');
      this.calculateMetrics();
      console.log('✅ Metrics calculated\n');

      // Step 5: Print results
      this.results.executionTime = Date.now() - startTime;
      this.printResults();

      // Step 6: Save results
      await this.saveResults();

      return this.results;
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      throw error;
    }
  }

  /**
   * Analyze user profile quality to diagnose issues
   */
  async analyzeUserProfiles() {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          years_experience,
          user_programming_languages (
            id,
            proficiency_level,
            programming_languages (name)
          ),
          user_topics (
            id,
            interest_level,
            experience_level,
            topics (name)
          )
        `)
        .limit(200);

      if (error) throw error;

      let usersWithLanguages = 0;
      let usersWithTopics = 0;
      let usersWithBoth = 0;
      let usersWithNeither = 0;
      let totalLanguages = 0;
      let totalTopics = 0;

      for (const user of users) {
        const hasLangs = user.user_programming_languages?.length > 0;
        const hasTopics = user.user_topics?.length > 0;

        if (hasLangs) {
          usersWithLanguages++;
          totalLanguages += user.user_programming_languages.length;
        }
        if (hasTopics) {
          usersWithTopics++;
          totalTopics += user.user_topics.length;
        }
        if (hasLangs && hasTopics) usersWithBoth++;
        if (!hasLangs && !hasTopics) usersWithNeither++;
      }

      this.results.userProfileQuality = {
        totalAnalyzed: users.length,
        usersWithLanguages,
        usersWithTopics,
        usersWithBoth,
        usersWithNeither,
        avgLanguagesPerUser: usersWithLanguages > 0 ? (totalLanguages / usersWithLanguages).toFixed(1) : 0,
        avgTopicsPerUser: usersWithTopics > 0 ? (totalTopics / usersWithTopics).toFixed(1) : 0
      };

      console.log(`   Users analyzed: ${users.length}`);
      console.log(`   ✅ With languages: ${usersWithLanguages} (${((usersWithLanguages/users.length)*100).toFixed(1)}%)`);
      console.log(`   ✅ With topics: ${usersWithTopics} (${((usersWithTopics/users.length)*100).toFixed(1)}%)`);
      console.log(`   ✅ With both: ${usersWithBoth} (${((usersWithBoth/users.length)*100).toFixed(1)}%)`);
      console.log(`   ⚠️  With neither: ${usersWithNeither} (${((usersWithNeither/users.length)*100).toFixed(1)}%)`);
      
      if (usersWithNeither > users.length * 0.3) {
        console.log('\n   ⚠️  WARNING: More than 30% of users have incomplete profiles!');
        console.log('   → This will severely impact recommendation quality');
      }

    } catch (error) {
      console.error('Error analyzing user profiles:', error);
    }
  }

  /**
   * Get test users - prioritize users with complete profiles
   */
  async getTestUsers(limit = 134) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          email,
          full_name,
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
            topics (id, name)
          )
        `)
        .limit(limit * 2); // Get extra to filter

      if (error) throw error;

      // Prioritize users with complete profiles
      const usersWithProfiles = users
        .filter(user => 
          user.user_programming_languages?.length > 0 && 
          user.user_topics?.length > 0
        )
        .slice(0, limit);

      // If not enough complete profiles, add users with partial profiles
      if (usersWithProfiles.length < limit) {
        const partialUsers = users
          .filter(user => 
            (user.user_programming_languages?.length > 0 || 
             user.user_topics?.length > 0) &&
            !usersWithProfiles.includes(user)
          )
          .slice(0, limit - usersWithProfiles.length);
        
        usersWithProfiles.push(...partialUsers);
      }

      console.log(`   Complete profiles: ${usersWithProfiles.filter(u => 
        u.user_programming_languages?.length > 0 && u.user_topics?.length > 0
      ).length}`);
      console.log(`   Partial profiles: ${usersWithProfiles.filter(u => 
        (u.user_programming_languages?.length > 0 || u.user_topics?.length > 0) &&
        !(u.user_programming_languages?.length > 0 && u.user_topics?.length > 0)
      ).length}`);

      return usersWithProfiles;
    } catch (error) {
      console.error('Error fetching test users:', error);
      throw error;
    }
  }

  /**
   * Test recommendations for all users
   */
  async testRecommendations(users) {
    let processedCount = 0;
    const totalUsers = users.length;

    for (const user of users) {
      processedCount++;
      
      if (processedCount % 10 === 0) {
        console.log(`   Processing: ${processedCount}/${totalUsers} users...`);
      }

      try {
        // Check user profile completeness
        const hasLangs = user.user_programming_languages?.length > 0;
        const hasTopics = user.user_topics?.length > 0;

        if (!hasLangs && !hasTopics) {
          console.log(`   ⚠️  User ${user.email || user.id} has no profile data, skipping...`);
          continue;
        }

        // Generate recommendations
        const recommendations = await skillMatching.recommendProjects(user.id, { limit: 10 });
        
        if (recommendations.length === 0) {
          this.results.usersWithNoRecommendations++;
        } else {
          this.results.usersWithRecommendations++;
        }

        // Get actual user engagement data
        const engagement = await this.getUserEngagement(user.id, recommendations);

        // Analyze each recommendation
        for (const rec of recommendations) {
          this.analyzeRecommendation(rec, engagement);
        }

        // Store sample data
        if (this.results.userSamples.length < 10) {
          this.results.userSamples.push({
            userId: user.id,
            email: user.email || 'N/A',
            hasLanguages: hasLangs,
            hasTopics: hasTopics,
            languageCount: user.user_programming_languages?.length || 0,
            topicCount: user.user_topics?.length || 0,
            recommendationCount: recommendations.length,
            avgScore: this.calculateAvgScore(recommendations),
            engagementRate: engagement.engagementRate,
            topRecommendation: recommendations[0] ? {
              title: recommendations[0].title,
              score: recommendations[0].score
            } : null
          });
        }

        this.results.totalUsers++;
        this.results.totalRecommendations += recommendations.length;

      } catch (error) {
        console.warn(`⚠️  Error processing user ${user.email}:`, error.message);
      }
    }

    console.log(`   ✅ Completed: ${processedCount}/${totalUsers} users`);
    console.log(`   Users with recommendations: ${this.results.usersWithRecommendations}`);
    console.log(`   Users with NO recommendations: ${this.results.usersWithNoRecommendations}`);
  }

  /**
   * Get user engagement data with improved simulation
   */
  async getUserEngagement(userId, recommendations) {
    try {
      const projectIds = recommendations.map(r => r.projectId);

      // Check actual engagement data
      const { data: memberships } = await supabase
        .from('project_members')
        .select('project_id, joined_at')
        .eq('user_id', userId)
        .in('project_id', projectIds);

      const { data: feedback } = await supabase
        .from('recommendation_feedback')
        .select('project_id, action_taken, feedback_score')
        .eq('user_id', userId)
        .in('project_id', projectIds);

      const { data: recTracking } = await supabase
        .from('project_recommendations')
        .select('project_id, viewed_at, clicked_at, applied_at')
        .eq('user_id', userId)
        .in('project_id', projectIds);

      const engagedProjects = new Set();
      const ignoredProjects = new Set(projectIds);

      memberships?.forEach(m => {
        engagedProjects.add(m.project_id);
        ignoredProjects.delete(m.project_id);
      });

      feedback?.forEach(f => {
        if (f.action_taken !== 'ignored') {
          engagedProjects.add(f.project_id);
          ignoredProjects.delete(f.project_id);
        }
      });

      recTracking?.forEach(rt => {
        if (rt.viewed_at || rt.clicked_at || rt.applied_at) {
          engagedProjects.add(rt.project_id);
          ignoredProjects.delete(rt.project_id);
        }
      });

      const engagementRate = projectIds.length > 0 
        ? (engagedProjects.size / projectIds.length) * 100 
        : 0;

      return {
        engaged: engagedProjects,
        ignored: ignoredProjects,
        engagementRate: Math.round(engagementRate)
      };
    } catch (error) {
      // If no engagement data, use IMPROVED simulation
      return this.simulateImprovedEngagement(recommendations);
    }
  }

  /**
   * Improved engagement simulation based on score distribution
   */
  simulateImprovedEngagement(recommendations) {
    const engaged = new Set();
    const ignored = new Set();

    recommendations.forEach(rec => {
      // More realistic engagement probability curve
      let engagementProbability;
      
      if (rec.score >= 85) {
        engagementProbability = 0.75; // 75% for excellent matches
      } else if (rec.score >= 70) {
        engagementProbability = 0.55; // 55% for good matches
      } else if (rec.score >= 55) {
        engagementProbability = 0.35; // 35% for acceptable matches
      } else {
        engagementProbability = 0.15; // 15% for poor matches
      }
      
      if (Math.random() < engagementProbability) {
        engaged.add(rec.projectId);
      } else {
        ignored.add(rec.projectId);
      }
    });

    const engagementRate = recommendations.length > 0
      ? (engaged.size / recommendations.length) * 100
      : 0;

    return {
      engaged,
      ignored,
      engagementRate: Math.round(engagementRate)
    };
  }

  /**
   * Analyze recommendation and update confusion matrix
   */
  analyzeRecommendation(recommendation, engagement) {
    const score = recommendation.score;
    const projectId = recommendation.projectId;
    const isHighScore = score >= 75; // Classification threshold
    const wasEngaged = engagement.engaged.has(projectId);

    // Update confusion matrix
    if (isHighScore && wasEngaged) {
      this.results.confusionMatrix.truePositive++;
    } else if (isHighScore && !wasEngaged) {
      this.results.confusionMatrix.falsePositive++;
    } else if (!isHighScore && !wasEngaged) {
      this.results.confusionMatrix.trueNegative++;
    } else if (!isHighScore && wasEngaged) {
      this.results.confusionMatrix.falseNegative++;
    }

    // Update score distribution
    if (score >= 90) {
      this.results.scoreDistribution['excellent (90-100)']++;
    } else if (score >= 75) {
      this.results.scoreDistribution['good (75-89)']++;
    } else if (score >= 55) {
      this.results.scoreDistribution['acceptable (55-74)']++;
    } else {
      this.results.scoreDistribution['poor (<55)']++;
    }
  }

  /**
   * Calculate performance metrics
   */
  calculateMetrics() {
    const { truePositive, falsePositive, trueNegative, falseNegative } = 
      this.results.confusionMatrix;

    const total = truePositive + falsePositive + trueNegative + falseNegative;

    if (total === 0) {
      console.warn('⚠️  No data available for metrics calculation');
      return;
    }

    const accuracy = ((truePositive + trueNegative) / total) * 100;

    const precision = truePositive + falsePositive > 0
      ? (truePositive / (truePositive + falsePositive)) * 100
      : 0;

    const recall = truePositive + falseNegative > 0
      ? (truePositive / (truePositive + falseNegative)) * 100
      : 0;

    const f1Score = precision + recall > 0
      ? (2 * (precision * recall) / (precision + recall))
      : 0;

    this.results.metrics = {
      accuracy: Math.round(accuracy * 100) / 100,
      precision: Math.round(precision * 100) / 100,
      recall: Math.round(recall * 100) / 100,
      f1Score: Math.round(f1Score * 100) / 100
    };
  }

  calculateAvgScore(recommendations) {
    if (recommendations.length === 0) return 0;
    const sum = recommendations.reduce((acc, rec) => acc + rec.score, 0);
    return Math.round(sum / recommendations.length);
  }

  /**
   * Print comprehensive results
   */
  printResults() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    📊 TEST RESULTS                       ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    // User Profile Quality
    console.log('👥 USER PROFILE QUALITY:');
    console.log('─'.repeat(60));
    const quality = this.results.userProfileQuality;
    console.log(`   Total Users Analyzed:      ${quality.totalAnalyzed}`);
    console.log(`   With Languages:            ${quality.usersWithLanguages} (${((quality.usersWithLanguages/quality.totalAnalyzed)*100).toFixed(1)}%)`);
    console.log(`   With Topics:               ${quality.usersWithTopics} (${((quality.usersWithTopics/quality.totalAnalyzed)*100).toFixed(1)}%)`);
    console.log(`   With Both (Complete):      ${quality.usersWithBoth} (${((quality.usersWithBoth/quality.totalAnalyzed)*100).toFixed(1)}%)`);
    console.log(`   With Neither (Empty):      ${quality.usersWithNeither} (${((quality.usersWithNeither/quality.totalAnalyzed)*100).toFixed(1)}%)`);
    console.log(`   Avg Languages/User:        ${quality.avgLanguagesPerUser}`);
    console.log(`   Avg Topics/User:           ${quality.avgTopicsPerUser}\n`);

    if (quality.usersWithNeither > quality.totalAnalyzed * 0.2) {
      console.log('   ⚠️  WARNING: High percentage of users with incomplete profiles!');
      console.log('   → Recommendation quality will be significantly impacted');
      console.log('   → Consider implementing profile completion incentives\n');
    }

    // Summary
    console.log('📌 RECOMMENDATION SUMMARY:');
    console.log('─'.repeat(60));
    console.log(`   Total Users Tested:        ${this.results.totalUsers}`);
    console.log(`   Total Recommendations:     ${this.results.totalRecommendations}`);
    console.log(`   Users w/ Recommendations:  ${this.results.usersWithRecommendations}`);
    console.log(`   Users w/o Recommendations: ${this.results.usersWithNoRecommendations}`);
    
    if (this.results.usersWithNoRecommendations > this.results.totalUsers * 0.5) {
      console.log('\n   ⚠️  WARNING: More than 50% of users received NO recommendations!');
      console.log('   → Threshold may be too high');
      console.log('   → User profiles may be incomplete');
      console.log('   → Not enough matching projects in database\n');
    }
    
    const avgRecsPerUser = this.results.totalUsers > 0 
      ? Math.round(this.results.totalRecommendations / this.results.totalUsers)
      : 0;
    console.log(`   Avg Recommendations/User:  ${avgRecsPerUser}`);
    console.log(`   Execution Time:            ${(this.results.executionTime / 1000).toFixed(2)}s\n`);

    // Confusion Matrix
    console.log('🎯 CONFUSION MATRIX:');
    console.log('─'.repeat(60));
    console.log('                    Actual Positive  |  Actual Negative');
    console.log('   ─────────────────────────────────────────────────────');
    console.log(`   Predicted Positive    ${this.padNumber(this.results.confusionMatrix.truePositive)}        |     ${this.padNumber(this.results.confusionMatrix.falsePositive)}`);
    console.log(`                         (TP)        |     (FP)`);
    console.log('   ─────────────────────────────────────────────────────');
    console.log(`   Predicted Negative    ${this.padNumber(this.results.confusionMatrix.falseNegative)}        |     ${this.padNumber(this.results.confusionMatrix.trueNegative)}`);
    console.log(`                         (FN)        |     (TN)`);
    console.log('   ─────────────────────────────────────────────────────\n');

    // Performance Metrics
    console.log('📈 PERFORMANCE METRICS:');
    console.log('─'.repeat(60));
    console.log(`   Accuracy:   ${this.formatMetric(this.results.metrics.accuracy)}%  ${this.getMetricRating(this.results.metrics.accuracy)}`);
    console.log(`   Precision:  ${this.formatMetric(this.results.metrics.precision)}%  ${this.getMetricRating(this.results.metrics.precision)}`);
    console.log(`   Recall:     ${this.formatMetric(this.results.metrics.recall)}%  ${this.getMetricRating(this.results.metrics.recall)}`);
    console.log(`   F1-Score:   ${this.formatMetric(this.results.metrics.f1Score)}%  ${this.getMetricRating(this.results.metrics.f1Score)}\n`);

    // Score Distribution
    console.log('📊 SCORE DISTRIBUTION:');
    console.log('─'.repeat(60));
    if (this.results.totalRecommendations > 0) {
      Object.entries(this.results.scoreDistribution).forEach(([range, count]) => {
        const percentage = (count / this.results.totalRecommendations * 100).toFixed(1);
        const bar = this.createBar(count, this.results.totalRecommendations);
        console.log(`   ${range.padEnd(20)} ${count.toString().padStart(5)} (${percentage.padStart(5)}%) ${bar}`);
      });
    } else {
      console.log('   No recommendations generated to analyze distribution');
    }
    console.log();

    // Sample Users
    if (this.results.userSamples.length > 0) {
      console.log('👥 SAMPLE USERS:');
      console.log('─'.repeat(60));
      this.results.userSamples.forEach((sample, idx) => {
        console.log(`   ${idx + 1}. ${sample.email}`);
        console.log(`      Profile: ${sample.languageCount} languages, ${sample.topicCount} topics`);
        console.log(`      Recommendations: ${sample.recommendationCount}, Avg Score: ${sample.avgScore}, Engagement: ${sample.engagementRate}%`);
        if (sample.topRecommendation) {
          console.log(`      Top Match: "${sample.topRecommendation.title}" (${sample.topRecommendation.score})`);
        } else {
          console.log(`      ⚠️  No recommendations generated`);
        }
      });
      console.log();
    }

    // Interpretation
    console.log('💡 INTERPRETATION:');
    console.log('─'.repeat(60));
    this.printInterpretation();
    console.log();

    console.log('═'.repeat(60));
    console.log('✅ Testing completed!');
    console.log('═'.repeat(60));
  }

  printInterpretation() {
    const { accuracy, precision, recall, f1Score } = this.results.metrics;
    const quality = this.results.userProfileQuality;

    // Check for profile issues
    if (quality.usersWithNeither > quality.totalAnalyzed * 0.3) {
      console.log('   ⚠️  CRITICAL: 30%+ of users have NO profile data');
      console.log('   → This is the PRIMARY cause of poor metrics');
      console.log('   → Users need to complete their profiles (languages + topics)');
      console.log('   → Implement profile completion wizard/prompts\n');
    }

    if (this.results.usersWithNoRecommendations > this.results.totalUsers * 0.5) {
      console.log('   ⚠️  CRITICAL: 50%+ of users get NO recommendations');
      console.log('   → Threshold is likely too high');
      console.log('   → OR user profiles are incomplete');
      console.log('   → OR not enough projects in database\n');
    }

    // Standard interpretation
    if (precision === 0 && recall === 0) {
      console.log('   ❌ ZERO recommendations are being classified as "positive"');
      console.log('   → All recommendations have scores below 75 (classification threshold)');
      console.log('   → But recommendation threshold is letting them through');
      console.log('   → SOLUTION: Lower classification threshold to 60 OR raise recommendation threshold');
    } else if (accuracy >= 80 && (precision < 70 || recall < 70)) {
      console.log('   ⚠️  High accuracy but low precision/recall = Class imbalance');
      console.log('   → Algorithm predicting "negative" too often');
      console.log('   → Adjust thresholds to balance predictions');
    } else {
      // Normal interpretation
      if (precision >= 80) {
        console.log('   ✅ High precision - recommendations are relevant');
      } else if (precision >= 70) {
        console.log('   ⚠️  Moderate precision - some irrelevant recommendations');
      } else if (precision > 0) {
        console.log('   ❌ Low precision - too many irrelevant recommendations');
      }

      if (recall >= 80) {
        console.log('   ✅ High recall - capturing most opportunities');
      } else if (recall >= 70) {
        console.log('   ⚠️  Moderate recall - missing some opportunities');
      } else if (recall > 0) {
        console.log('   ❌ Low recall - missing too many opportunities');
      }

      if (f1Score >= 80) {
        console.log('   ✅ Excellent balance between precision and recall');
      } else if (f1Score >= 70) {
        console.log('   ⚠️  Good balance with room for improvement');
      } else if (f1Score > 0) {
        console.log('   ❌ Poor balance - need threshold adjustments');
      }
    }
  }

  padNumber(num) {
    return num.toString().padStart(6);
  }

  formatMetric(value) {
    return value.toFixed(2).padStart(6);
  }

  getMetricRating(value) {
    if (value >= 80) return '🟢 Excellent';
    if (value >= 70) return '🟡 Good';
    if (value >= 60) return '🟠 Fair';
    return '🔴 Poor';
  }

  createBar(count, total, maxWidth = 20) {
    const percentage = count / total;
    const filledWidth = Math.round(percentage * maxWidth);
    return '█'.repeat(filledWidth) + '░'.repeat(maxWidth - filledWidth);
  }

  async saveResults() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const outputDir = path.join(__dirname, '../test-results');
      await fs.mkdir(outputDir, { recursive: true });
      
      const filename = `recommendation-test-improved-${Date.now()}.json`;
      const filepath = path.join(outputDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(this.results, null, 2));
      
      console.log(`\n💾 Results saved to: ${filepath}\n`);
    } catch (error) {
      console.warn('⚠️  Could not save results to file:', error.message);
    }
  }
}

// Main execution
async function main() {
  const tester = new ImprovedRecommendationTester();
  
  try {
    await tester.runTest();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ImprovedRecommendationTester;