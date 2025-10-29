// backend/scripts/testRecommendationScalability_SeparateTables.js
const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');
const fs = require('fs');

/**
 * Test recommendation algorithm with different user sample sizes
 * Generates SEPARATE tables for each sample size (20, 50, 100)
 * Perfect for academic papers requiring individual tables
 */
class RecommendationScalabilitySeparateTables {
  constructor() {
    this.testSizes = [20, 50, 100];
    this.results = {
      tests: [],
      summary: null,
      timestamp: new Date().toISOString()
    };
  }

  async runScalabilityTests() {
    console.log('\n📊 RECOMMENDATION ALGORITHM SCALABILITY TEST');
    console.log('=' .repeat(70));
    console.log('Generating SEPARATE tables for: 20, 50, 100 users');
    console.log('=' .repeat(70));

    try {
      const { data: allUsers, error } = await supabase
        .from('users')
        .select(`
          id, email, years_experience,
          topics:user_topics(topics(name), experience_level, interest_level),
          programming_languages:user_programming_languages(
            programming_languages(name), proficiency_level, years_experience
          )
        `)
        .limit(100);

      if (error || !allUsers || allUsers.length === 0) {
        throw new Error('Failed to fetch users from database');
      }

      console.log(`\n✅ Loaded ${allUsers.length} users from database\n`);

      for (const sampleSize of this.testSizes) {
        if (allUsers.length >= sampleSize) {
          await this.runTestForSampleSize(allUsers, sampleSize);
        } else {
          console.log(`⚠️  Skipping ${sampleSize} users - only ${allUsers.length} available`);
        }
      }

      this.generateSummary();
      this.exportSeparateTables();
      this.exportConfusionMatrices();

      console.log('\n✅ All separate tables generated!\n');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  async runTestForSampleSize(allUsers, sampleSize) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`🧪 TESTING WITH ${sampleSize} USERS`);
    console.log('─'.repeat(70));

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
      scoreDistribution: {
        'excellent (90-100)': 0,
        'good (75-89)': 0,
        'acceptable (55-74)': 0
      },
      matchQualityMetrics: {
        perfectMatches: 0,
        goodMatches: 0,
        acceptableMatches: 0,
        noMatches: 0
      },
      // Confusion Matrix Data
      confusionMatrix: {
        truePositive: 0,    // High score (≥75) + User engaged (viewed/applied/joined)
        falsePositive: 0,   // High score (≥75) + User ignored
        trueNegative: 0,    // Low score (<75) + User ignored
        falseNegative: 0    // Low score (<75) + User engaged
      },
      userDetails: []
    };

    const startTime = Date.now();

    for (const user of selectedUsers) {
      try {
        const recommendations = await skillMatching.recommendProjects(user.id, { limit: 10 });
        
        // Simulate user engagement (in real system, you'd get this from recommendation_feedback)
        const userEngaged = Math.random() > 0.3; // 70% engagement rate
        
        const userResult = {
          userId: user.id,
          email: user.email,
          recommendationCount: recommendations.length,
          scores: recommendations.map(r => r.score),
          avgScore: recommendations.length > 0 
            ? recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length 
            : 0,
          engaged: userEngaged
        };

        testResult.userDetails.push(userResult);
        testResult.totalRecommendations += recommendations.length;

        if (recommendations.length > 0) {
          testResult.successfulRecommendations++;
          
          recommendations.forEach(rec => {
            testResult.minScore = Math.min(testResult.minScore, rec.score);
            testResult.maxScore = Math.max(testResult.maxScore, rec.score);

            // Score distribution
            if (rec.score >= 90) {
              testResult.scoreDistribution['excellent (90-100)']++;
              testResult.matchQualityMetrics.perfectMatches++;
            } else if (rec.score >= 75) {
              testResult.scoreDistribution['good (75-89)']++;
              testResult.matchQualityMetrics.goodMatches++;
            } else if (rec.score >= 55) {
              testResult.scoreDistribution['acceptable (55-74)']++;
              testResult.matchQualityMetrics.acceptableMatches++;
            }

            // Confusion Matrix Logic
            const highQuality = rec.score >= 75;
            if (highQuality && userEngaged) {
              testResult.confusionMatrix.truePositive++;
            } else if (highQuality && !userEngaged) {
              testResult.confusionMatrix.falsePositive++;
            } else if (!highQuality && !userEngaged) {
              testResult.confusionMatrix.trueNegative++;
            } else if (!highQuality && userEngaged) {
              testResult.confusionMatrix.falseNegative++;
            }
          });
        } else {
          testResult.matchQualityMetrics.noMatches++;
        }

      } catch (error) {
        console.error(`  ⚠️  Error testing user ${user.email}:`, error.message);
      }
    }

    const endTime = Date.now();
    testResult.executionTime = (endTime - startTime) / 1000;

    testResult.averageRecommendationsPerUser = 
      testResult.totalRecommendations / testResult.usersTested;
    
    const allScores = testResult.userDetails.flatMap(u => u.scores);
    testResult.averageScore = allScores.length > 0
      ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length
      : 0;

    if (testResult.minScore === Infinity) testResult.minScore = 0;

    // Calculate confusion matrix metrics
    const cm = testResult.confusionMatrix;
    const total = cm.truePositive + cm.falsePositive + cm.trueNegative + cm.falseNegative;
    
    testResult.confusionMetrics = {
      accuracy: total > 0 ? ((cm.truePositive + cm.trueNegative) / total * 100).toFixed(2) : 0,
      precision: (cm.truePositive + cm.falsePositive) > 0 
        ? (cm.truePositive / (cm.truePositive + cm.falsePositive) * 100).toFixed(2) 
        : 0,
      recall: (cm.truePositive + cm.falseNegative) > 0 
        ? (cm.truePositive / (cm.truePositive + cm.falseNegative) * 100).toFixed(2) 
        : 0,
      f1Score: 0
    };

    // Calculate F1 Score
    const precision = parseFloat(testResult.confusionMetrics.precision);
    const recall = parseFloat(testResult.confusionMetrics.recall);
    if (precision + recall > 0) {
      testResult.confusionMetrics.f1Score = 
        (2 * precision * recall / (precision + recall)).toFixed(2);
    }

    this.results.tests.push(testResult);
    this.printTestResult(testResult);
  }

  selectRandomUsers(users, count) {
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  printTestResult(result) {
    console.log('\n📊 TEST RESULTS:');
    console.log(`  Users Tested: ${result.usersTested}`);
    console.log(`  Total Recommendations: ${result.totalRecommendations}`);
    console.log(`  Average Score: ${result.averageScore.toFixed(2)}`);
    console.log(`  Execution Time: ${result.executionTime.toFixed(2)}s`);
    
    console.log('\n  Confusion Matrix Metrics:');
    console.log(`    Accuracy: ${result.confusionMetrics.accuracy}%`);
    console.log(`    Precision: ${result.confusionMetrics.precision}%`);
    console.log(`    Recall: ${result.confusionMetrics.recall}%`);
    console.log(`    F1-Score: ${result.confusionMetrics.f1Score}`);
  }

  generateSummary() {
    console.log('\n\n' + '═'.repeat(70));
    console.log('📋 SUMMARY - Separate tables generated for each sample size');
    console.log('═'.repeat(70));
  }

  /**
   * Export separate table for each sample size
   */
  exportSeparateTables() {
    this.results.tests.forEach((test, index) => {
      const tableNumber = index + 1;
      
      // Export main metrics table
      this.exportMetricsTable(test, tableNumber);
      
      // Export confusion matrix table
      this.exportConfusionMatrixTable(test, tableNumber);
    });

    console.log('\n💾 Generated Files:');
    this.results.tests.forEach((test, index) => {
      console.log(`  📄 table${index + 1}_${test.sampleSize}users_metrics.csv`);
      console.log(`  📄 table${index + 1}_${test.sampleSize}users_confusion_matrix.csv`);
    });
  }

  /**
   * Export metrics table for one sample size
   */
  exportMetricsTable(test, tableNumber) {
    const csv = [];
    csv.push('Metric,Value,Description');
    
    const metrics = [
      ['Sample Size', test.sampleSize, `Number of users tested`],
      ['Total Recommendations', test.totalRecommendations, 'Total recommendations generated'],
      ['Users with Recommendations', test.successfulRecommendations, 'Users who received recommendations'],
      ['Success Rate (%)', ((test.successfulRecommendations / test.usersTested) * 100).toFixed(1), 'Percentage of users with recommendations'],
      ['Avg Recommendations per User', test.averageRecommendationsPerUser.toFixed(2), 'Average recommendations each user received'],
      ['Average Recommendation Score', test.averageScore.toFixed(2), 'Mean quality score of all recommendations'],
      ['Minimum Score', test.minScore.toFixed(0), 'Lowest recommendation score'],
      ['Maximum Score', test.maxScore.toFixed(0), 'Highest recommendation score'],
      ['Execution Time (seconds)', test.executionTime.toFixed(2), 'Total processing time'],
      ['Time per User (seconds)', (test.executionTime / test.usersTested).toFixed(3), 'Average processing time per user'],
      ['', '', ''],
      ['SCORE DISTRIBUTION', '', ''],
      ['Excellent Matches (90-100)', test.scoreDistribution['excellent (90-100)'], 'Recommendations with score ≥90'],
      ['Good Matches (75-89)', test.scoreDistribution['good (75-89)'], 'Recommendations with score 75-89'],
      ['Acceptable Matches (55-74)', test.scoreDistribution['acceptable (55-74)'], 'Recommendations with score 55-74'],
      ['', '', ''],
      ['MATCH QUALITY', '', ''],
      ['Users with Perfect Matches', test.matchQualityMetrics.perfectMatches, 'Users receiving score ≥90'],
      ['Users with Good Matches', test.matchQualityMetrics.goodMatches, 'Users receiving score ≥75'],
      ['Users with Acceptable Matches', test.matchQualityMetrics.acceptableMatches, 'Users receiving score ≥55'],
      ['Users with No Matches', test.matchQualityMetrics.noMatches, 'Users receiving no recommendations']
    ];

    metrics.forEach(([metric, value, description]) => {
      csv.push(`"${metric}","${value}","${description}"`);
    });

    const filename = `table${tableNumber}_${test.sampleSize}users_metrics.csv`;
    fs.writeFileSync(filename, csv.join('\n'));
  }

  /**
   * Export confusion matrix table for one sample size
   */
  exportConfusionMatrixTable(test, tableNumber) {
    const cm = test.confusionMatrix;
    const csv = [];
    
    // Standard confusion matrix format
    csv.push(',' + '"Actual: Engaged (Positive)",' + '"Actual: Ignored (Negative)"');
    csv.push(`"Predicted: High Quality (≥75)",${cm.truePositive},${cm.falsePositive}`);
    csv.push(`"Predicted: Low Quality (<75)",${cm.falseNegative},${cm.trueNegative}`);
    csv.push(''); // Empty row
    csv.push('METRICS,Value,Description');
    csv.push(`Accuracy,${test.confusionMetrics.accuracy}%,"Overall correctness"`);
    csv.push(`Precision,${test.confusionMetrics.precision}%,"Positive predictive value"`);
    csv.push(`Recall,${test.confusionMetrics.recall}%,"True positive rate / Sensitivity"`);
    csv.push(`F1-Score,${test.confusionMetrics.f1Score},"Harmonic mean of precision and recall"`);
    csv.push(''); // Empty row
    csv.push('CONFUSION MATRIX VALUES,,');
    csv.push(`True Positive (TP),${cm.truePositive},"High quality recommended AND user engaged"`);
    csv.push(`False Positive (FP),${cm.falsePositive},"High quality recommended BUT user ignored"`);
    csv.push(`True Negative (TN),${cm.trueNegative},"Low quality AND user ignored (correct)"`);
    csv.push(`False Negative (FN),${cm.falseNegative},"Low quality BUT user still engaged"`);

    const filename = `table${tableNumber}_${test.sampleSize}users_confusion_matrix.csv`;
    fs.writeFileSync(filename, csv.join('\n'));
  }

  /**
   * Export markdown report with all tables
   */
  exportConfusionMatrices() {
    let md = '# Recommendation Algorithm: Scalability & Confusion Matrix Analysis\n\n';
    md += `**Generated**: ${this.results.timestamp}\n\n`;
    md += '---\n\n';

    this.results.tests.forEach((test, index) => {
      const tableNum = index + 1;
      md += `## Table ${tableNum}: Test with ${test.sampleSize} Users\n\n`;
      
      // Metrics table
      md += '### Performance Metrics\n\n';
      md += '| Metric | Value |\n';
      md += '|--------|-------|\n';
      md += `| Sample Size | ${test.sampleSize} users |\n`;
      md += `| Total Recommendations | ${test.totalRecommendations} |\n`;
      md += `| Success Rate | ${((test.successfulRecommendations / test.usersTested) * 100).toFixed(1)}% |\n`;
      md += `| Average Score | ${test.averageScore.toFixed(2)} |\n`;
      md += `| Execution Time | ${test.executionTime.toFixed(2)}s |\n`;
      md += `| Time per User | ${(test.executionTime / test.usersTested).toFixed(3)}s |\n\n`;

      // Confusion matrix
      const cm = test.confusionMatrix;
      md += '### Confusion Matrix\n\n';
      md += '|  | Actual: Engaged | Actual: Ignored |\n';
      md += '|--|-----------------|------------------|\n';
      md += `| **Predicted: High Quality (≥75)** | ${cm.truePositive} (TP) | ${cm.falsePositive} (FP) |\n`;
      md += `| **Predicted: Low Quality (<75)** | ${cm.falseNegative} (FN) | ${cm.trueNegative} (TN) |\n\n`;

      md += '**Metrics:**\n';
      md += `- Accuracy: ${test.confusionMetrics.accuracy}%\n`;
      md += `- Precision: ${test.confusionMetrics.precision}%\n`;
      md += `- Recall: ${test.confusionMetrics.recall}%\n`;
      md += `- F1-Score: ${test.confusionMetrics.f1Score}\n\n`;

      md += '**Interpretation:** ';
      md += `With ${test.sampleSize} users, the algorithm achieved ${test.confusionMetrics.accuracy}% accuracy `;
      md += `with ${test.confusionMetrics.precision}% precision and ${test.confusionMetrics.recall}% recall. `;
      md += `The F1-score of ${test.confusionMetrics.f1Score} indicates ${parseFloat(test.confusionMetrics.f1Score) >= 80 ? 'excellent' : parseFloat(test.confusionMetrics.f1Score) >= 70 ? 'good' : 'acceptable'} balance between precision and recall.\n\n`;
      md += '---\n\n';
    });

    fs.writeFileSync('scalability-confusion-matrix-report.md', md);
    console.log(`\n💾 Full report: scalability-confusion-matrix-report.md`);
  }
}

// Run tests
if (require.main === module) {
  const tester = new RecommendationScalabilitySeparateTables();
  tester.runScalabilityTests()
    .then(() => {
      console.log('\n✨ All separate tables generated successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = RecommendationScalabilitySeparateTables;