// backend/scripts/testRecommendationScalability_FIXED.js
const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');
const fs = require('fs');

/**
 * FIXED VERSION - Test recommendation algorithm with better error handling and progress tracking
 */
class RecommendationScalabilityTest {
  constructor() {
    this.testSizes = [20, 50, 100]; // Different sample sizes
    this.results = {
      tests: [],
      summary: null,
      timestamp: new Date().toISOString()
    };
    this.timeout = 30000; // 30 second timeout per user
  }

  /**
   * Main test runner
   */
  async runScalabilityTests() {
    console.log('\n📊 RECOMMENDATION ALGORITHM SCALABILITY TEST (FIXED VERSION)');
    console.log('=' .repeat(70));
    console.log('Testing with different user sample sizes: 20, 50, 100 users');
    console.log('With improved error handling and progress tracking');
    console.log('=' .repeat(70));

    try {
      // Get all available users
      const { data: allUsers, error } = await supabase
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
        .limit(100);

      if (error || !allUsers || allUsers.length === 0) {
        throw new Error('Failed to fetch users from database');
      }

      console.log(`\n✅ Loaded ${allUsers.length} users from database\n`);

      // Run tests for each sample size
      for (const sampleSize of this.testSizes) {
        if (allUsers.length >= sampleSize) {
          await this.runTestForSampleSize(allUsers, sampleSize);
        } else {
          console.log(`⚠️  Skipping ${sampleSize} users - only ${allUsers.length} available`);
        }
      }

      this.generateSummary();
      this.printResults();
      this.exportResults();

      console.log('\n✅ Scalability tests completed!\n');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  /**
   * Run test for specific sample size with timeout protection
   */
  async runTestForSampleSize(allUsers, sampleSize) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`🧪 TESTING WITH ${sampleSize} USERS`);
    console.log('─'.repeat(70));

    // Randomly select users for this test
    const selectedUsers = this.selectRandomUsers(allUsers, sampleSize);
    console.log(`Selected ${selectedUsers.length} random users for testing`);

    const testResult = {
      sampleSize,
      usersTested: selectedUsers.length,
      totalRecommendations: 0,
      successfulRecommendations: 0,
      averageScore: 0,
      averageRecommendationsPerUser: 0,
      minScore: Infinity,
      maxScore: 0,
      executionTime: 0,
      timeouts: 0,
      errors: 0,
      scoreDistribution: {
        'excellent (90-100)': 0,
        'good (75-89)': 0,
        'acceptable (55-74)': 0,
        'below_threshold (<55)': 0
      },
      matchQualityMetrics: {
        perfectMatches: 0,
        goodMatches: 0,
        acceptableMatches: 0,
        noMatches: 0
      },
      userDetails: []
    };

    const startTime = Date.now();
    let processedCount = 0;

    // Test each user with progress tracking
    for (const user of selectedUsers) {
      processedCount++;
      const userStartTime = Date.now();
      
      // Progress indicator
      process.stdout.write(`\r  Processing user ${processedCount}/${selectedUsers.length} (${user.email})...`);
      
      try {
        // Add timeout protection
        const recommendations = await this.getRecommendationsWithTimeout(user.id);
        
        const userTime = Date.now() - userStartTime;
        
        const userResult = {
          userId: user.id,
          email: user.email,
          recommendationCount: recommendations.length,
          scores: recommendations.map(r => r.score),
          avgScore: recommendations.length > 0 
            ? recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length 
            : 0,
          processingTime: userTime
        };

        testResult.userDetails.push(userResult);
        testResult.totalRecommendations += recommendations.length;

        if (recommendations.length > 0) {
          testResult.successfulRecommendations++;
          
          recommendations.forEach(rec => {
            testResult.minScore = Math.min(testResult.minScore, rec.score);
            testResult.maxScore = Math.max(testResult.maxScore, rec.score);

            if (rec.score >= 90) {
              testResult.scoreDistribution['excellent (90-100)']++;
              testResult.matchQualityMetrics.perfectMatches++;
            } else if (rec.score >= 75) {
              testResult.scoreDistribution['good (75-89)']++;
              testResult.matchQualityMetrics.goodMatches++;
            } else if (rec.score >= 55) {
              testResult.scoreDistribution['acceptable (55-74)']++;
              testResult.matchQualityMetrics.acceptableMatches++;
            } else {
              testResult.scoreDistribution['below_threshold (<55)']++;
            }
          });
        } else {
          testResult.matchQualityMetrics.noMatches++;
        }

        // Log slow users
        if (userTime > 5000) {
          console.log(`\n  ⚠️  Slow processing for ${user.email}: ${(userTime/1000).toFixed(2)}s`);
        }

      } catch (error) {
        if (error.message === 'TIMEOUT') {
          console.log(`\n  ⏱️  Timeout for user ${user.email}`);
          testResult.timeouts++;
        } else {
          console.log(`\n  ⚠️  Error for user ${user.email}: ${error.message}`);
          testResult.errors++;
        }
        
        testResult.matchQualityMetrics.noMatches++;
      }
    }

    console.log(''); // New line after progress

    const endTime = Date.now();
    testResult.executionTime = (endTime - startTime) / 1000;

    // Calculate averages
    testResult.averageRecommendationsPerUser = 
      testResult.totalRecommendations / testResult.usersTested;
    
    const allScores = testResult.userDetails
      .flatMap(u => u.scores);
    
    testResult.averageScore = allScores.length > 0
      ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
      : 0;

    if (testResult.minScore === Infinity) {
      testResult.minScore = 0;
    }

    // Store result
    this.results.tests.push(testResult);

    // Print immediate results
    this.printTestResult(testResult);
  }

  /**
   * Get recommendations with timeout protection
   */
  async getRecommendationsWithTimeout(userId) {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, this.timeout);

      try {
        const recommendations = await skillMatching.recommendProjects(userId, { limit: 10 });
        clearTimeout(timeoutId);
        resolve(recommendations);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Select random users from the pool
   */
  selectRandomUsers(users, count) {
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Print results for a single test
   */
  printTestResult(result) {
    console.log('\n📊 TEST RESULTS:');
    console.log(`  Users Tested: ${result.usersTested}`);
    console.log(`  Total Recommendations: ${result.totalRecommendations}`);
    console.log(`  Users with Recommendations: ${result.successfulRecommendations} (${((result.successfulRecommendations / result.usersTested) * 100).toFixed(1)}%)`);
    console.log(`  Avg Recommendations/User: ${result.averageRecommendationsPerUser.toFixed(2)}`);
    console.log(`  Average Score: ${result.averageScore.toFixed(2)}`);
    console.log(`  Score Range: ${result.minScore.toFixed(0)} - ${result.maxScore.toFixed(0)}`);
    console.log(`  Execution Time: ${result.executionTime.toFixed(2)}s`);
    console.log(`  Avg Time per User: ${(result.executionTime / result.usersTested).toFixed(2)}s`);
    
    if (result.timeouts > 0 || result.errors > 0) {
      console.log(`\n  ⚠️  Issues:`);
      if (result.timeouts > 0) console.log(`    Timeouts: ${result.timeouts}`);
      if (result.errors > 0) console.log(`    Errors: ${result.errors}`);
    }
    
    console.log('\n  Score Distribution:');
    Object.entries(result.scoreDistribution).forEach(([range, count]) => {
      const percentage = result.totalRecommendations > 0 
        ? ((count / result.totalRecommendations) * 100).toFixed(1)
        : '0.0';
      console.log(`    ${range}: ${count} (${percentage}%)`);
    });

    console.log('\n  Match Quality:');
    console.log(`    Perfect Matches (≥90): ${result.matchQualityMetrics.perfectMatches} users`);
    console.log(`    Good Matches (≥75): ${result.matchQualityMetrics.goodMatches} users`);
    console.log(`    Acceptable Matches (≥55): ${result.matchQualityMetrics.acceptableMatches} users`);
    console.log(`    No Matches: ${result.matchQualityMetrics.noMatches} users`);

    // Show slowest users
    const sortedByTime = [...result.userDetails].sort((a, b) => b.processingTime - a.processingTime);
    const slowest = sortedByTime.slice(0, 3);
    
    if (slowest.length > 0 && slowest[0].processingTime > 1000) {
      console.log('\n  ⏱️  Slowest Users:');
      slowest.forEach((user, i) => {
        if (user.processingTime > 1000) {
          console.log(`    ${i+1}. ${user.email}: ${(user.processingTime/1000).toFixed(2)}s (${user.recommendationCount} recs)`);
        }
      });
    }
  }

  /**
   * Generate summary comparison
   */
  generateSummary() {
    console.log('\n\n' + '═'.repeat(70));
    console.log('📋 SCALABILITY SUMMARY');
    console.log('═'.repeat(70));

    const summary = {
      totalTests: this.results.tests.length,
      comparison: {}
    };

    console.log('\nSample Size Comparison:\n');
    console.log('Metric                          | 20 Users    | 50 Users    | 100 Users');
    console.log('─'.repeat(75));

    const metrics = [
      { key: 'totalRecommendations', label: 'Total Recommendations' },
      { key: 'averageRecommendationsPerUser', label: 'Avg Recs/User', format: '.2f' },
      { key: 'averageScore', label: 'Average Score', format: '.2f' },
      { key: 'minScore', label: 'Min Score', format: '.0f' },
      { key: 'maxScore', label: 'Max Score', format: '.0f' },
      { key: 'executionTime', label: 'Execution Time (s)', format: '.2f' },
      { key: 'successfulRecommendations', label: 'Users w/ Recommendations' }
    ];

    metrics.forEach(metric => {
      const values = this.results.tests.map(test => {
        const value = test[metric.key];
        if (metric.format === '.2f') return value.toFixed(2);
        if (metric.format === '.0f') return value.toFixed(0);
        return value;
      });

      const row = `${metric.label.padEnd(30)} | ${values[0]?.toString().padEnd(11) || 'N/A'.padEnd(11)} | ${values[1]?.toString().padEnd(11) || 'N/A'.padEnd(11)} | ${values[2] || 'N/A'}`;
      console.log(row);
    });

    this.results.summary = summary;
  }

  /**
   * Print all results
   */
  printResults() {
    console.log('\n\n' + '═'.repeat(70));
    console.log('📊 DETAILED RESULTS BY SAMPLE SIZE');
    console.log('═'.repeat(70));

    this.results.tests.forEach((test, index) => {
      console.log(`\n${index + 1}. Test with ${test.sampleSize} Users:`);
      console.log(`   Success Rate: ${((test.successfulRecommendations / test.usersTested) * 100).toFixed(1)}%`);
      console.log(`   Avg Score: ${test.averageScore.toFixed(2)}`);
      console.log(`   Execution Time: ${test.executionTime.toFixed(2)}s`);
      console.log(`   Time per User: ${(test.executionTime / test.usersTested).toFixed(3)}s`);
      if (test.timeouts > 0) console.log(`   Timeouts: ${test.timeouts}`);
      if (test.errors > 0) console.log(`   Errors: ${test.errors}`);
    });
  }

  /**
   * Export results to files
   */
  exportResults() {
    const jsonFile = 'scalability-test-results.json';
    fs.writeFileSync(jsonFile, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Full results saved to: ${jsonFile}`);

    this.exportTableCSV();
    this.exportMarkdownReport();
  }

  /**
   * Export comparison table as CSV
   */
  exportTableCSV() {
    const csv = [];
    csv.push('Metric,20 Users,50 Users,100 Users');

    const metrics = [
      ['Users Tested', 'usersTested'],
      ['Total Recommendations', 'totalRecommendations'],
      ['Users with Recommendations', 'successfulRecommendations'],
      ['Success Rate (%)', (test) => ((test.successfulRecommendations / test.usersTested) * 100).toFixed(1)],
      ['Avg Recommendations/User', (test) => test.averageRecommendationsPerUser.toFixed(2)],
      ['Average Score', (test) => test.averageScore.toFixed(2)],
      ['Min Score', (test) => test.minScore.toFixed(0)],
      ['Max Score', (test) => test.maxScore.toFixed(0)],
      ['Execution Time (s)', (test) => test.executionTime.toFixed(2)],
      ['Time per User (s)', (test) => (test.executionTime / test.usersTested).toFixed(3)],
      ['Perfect Matches (≥90)', (test) => test.matchQualityMetrics.perfectMatches],
      ['Good Matches (≥75)', (test) => test.matchQualityMetrics.goodMatches],
      ['Acceptable Matches (≥55)', (test) => test.matchQualityMetrics.acceptableMatches],
      ['No Matches', (test) => test.matchQualityMetrics.noMatches]
    ];

    metrics.forEach(([label, accessor]) => {
      const values = this.results.tests.map(test => {
        if (typeof accessor === 'function') {
          return accessor(test);
        }
        return test[accessor];
      });

      csv.push(`"${label}",${values.join(',')}`);
    });

    const filename = 'table-scalability-comparison.csv';
    fs.writeFileSync(filename, csv.join('\n'));
    console.log(`💾 Scalability table saved to: ${filename}`);
  }

  /**
   * Export markdown report
   */
  exportMarkdownReport() {
    let md = '# Recommendation Algorithm Scalability Test Report\n\n';
    md += `**Generated**: ${this.results.timestamp}\n\n`;
    md += `**Test Sizes**: ${this.testSizes.join(', ')} users\n\n`;
    md += '---\n\n';

    md += '## Summary\n\n';
    md += `Total tests completed: ${this.results.tests.length}\n\n`;

    md += '## Table: Scalability Comparison\n\n';
    md += '| Metric | 20 Users | 50 Users | 100 Users |\n';
    md += '|--------|----------|----------|----------|\n';

    const test20 = this.results.tests[0];
    const test50 = this.results.tests[1];
    const test100 = this.results.tests[2];

    if (test20) {
      md += `| Total Recommendations | ${test20.totalRecommendations} | ${test50?.totalRecommendations || 'N/A'} | ${test100?.totalRecommendations || 'N/A'} |\n`;
      md += `| Avg Recs/User | ${test20.averageRecommendationsPerUser.toFixed(2)} | ${test50?.averageRecommendationsPerUser.toFixed(2) || 'N/A'} | ${test100?.averageRecommendationsPerUser.toFixed(2) || 'N/A'} |\n`;
      md += `| Average Score | ${test20.averageScore.toFixed(2)} | ${test50?.averageScore.toFixed(2) || 'N/A'} | ${test100?.averageScore.toFixed(2) || 'N/A'} |\n`;
      md += `| Success Rate (%) | ${((test20.successfulRecommendations / test20.usersTested) * 100).toFixed(1)} | ${test50 ? ((test50.successfulRecommendations / test50.usersTested) * 100).toFixed(1) : 'N/A'} | ${test100 ? ((test100.successfulRecommendations / test100.usersTested) * 100).toFixed(1) : 'N/A'} |\n`;
      md += `| Execution Time (s) | ${test20.executionTime.toFixed(2)} | ${test50?.executionTime.toFixed(2) || 'N/A'} | ${test100?.executionTime.toFixed(2) || 'N/A'} |\n`;
    }

    const filename = 'scalability-test-report.md';
    fs.writeFileSync(filename, md);
    console.log(`💾 Markdown report saved to: ${filename}`);
  }
}

// Run tests
if (require.main === module) {
  const tester = new RecommendationScalabilityTest();
  tester.runScalabilityTests()
    .then(() => {
      console.log('\n✨ Scalability testing completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = RecommendationScalabilityTest;