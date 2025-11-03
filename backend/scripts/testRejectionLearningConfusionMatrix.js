// backend/scripts/testRejectionLearningConfusionMatrix.js
const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');
const fs = require('fs');

/**
 * Simplified Confusion Matrix for Learning Recommendation Accuracy
 * 
 * This script evaluates: Are we recommending the RIGHT courses to users?
 * 
 * Simple Logic:
 * - Get user's failed attempts → identify which languages/topics they failed
 * - Get user's recommendations → check which languages/topics were recommended
 * - TRUE POSITIVE: Recommendation matches a failure area (CORRECT!)
 * - FALSE POSITIVE: Recommendation for something they didn't fail (WRONG!)
 * - FALSE NEGATIVE: They failed but we didn't recommend (MISSED!)
 * - TRUE NEGATIVE: No failure, no recommendation (CORRECT!)
 */
class RejectionLearningConfusionMatrixTester {
  constructor() {
    this.maxAttempts = 8;
    
    this.confusionMatrix = {
      truePositive: 0,     // Recommended course matches their failure area
      falsePositive: 0,    // Recommended course they don't need
      trueNegative: 0,     // Correctly didn't recommend
      falseNegative: 0     // Should have recommended but didn't
    };

    this.metrics = {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0
    };

    this.analysisResults = {
      totalUsersAnalyzed: 0,
      usersWithRecommendations: 0,
      totalRecommendations: 0,
      matchingRecommendations: 0,
      mismatchedRecommendations: 0,
      sampleUsers: []
    };
  }

  async runConfusionMatrixAnalysis() {
    console.log('\n📊 LEARNING RECOMMENDATION ACCURACY ANALYSIS');
    console.log('='.repeat(70));
    console.log('Evaluating: Are we recommending the RIGHT courses?');
    console.log('='.repeat(70));

    try {
      console.log('\n🔍 Step 1: Getting users with 8+ failures...');
      const usersWithFailures = await this.getUsersWithFailures();
      console.log(`   ✓ Found ${usersWithFailures.length} users with ${this.maxAttempts}+ failures`);

      console.log('\n📚 Step 2: Analyzing each user\'s recommendations...');
      await this.analyzeRecommendations(usersWithFailures);

      console.log('\n📐 Step 3: Calculating metrics...');
      this.calculateMetrics();

      console.log('\n📊 Step 4: Displaying results...');
      this.displayResults();

      console.log('\n📄 Step 5: Exporting report...');
      this.exportReport();

      console.log('\n✅ Analysis completed!');

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get users with 8+ failed attempts
   */
  async getUsersWithFailures() {
    const { data: failedAttempts, error } = await supabase
      .from('challenge_attempts')
      .select(`
        user_id,
        score,
        projects (
          id,
          title,
          project_languages (
            programming_languages (id, name)
          ),
          project_topics (
            topics (id, name)
          )
        )
      `)
      .eq('status', 'failed')
      .order('submitted_at', { ascending: true });

    if (error) throw error;

    // Group by user
    const userMap = new Map();
    
    failedAttempts.forEach(attempt => {
      if (!userMap.has(attempt.user_id)) {
        userMap.set(attempt.user_id, {
          userId: attempt.user_id,
          failures: [],
          failedLanguages: new Set(),
          failedTopics: new Set(),
          totalFailures: 0
        });
      }

      const userData = userMap.get(attempt.user_id);
      userData.failures.push(attempt);
      userData.totalFailures++;

      // Track languages they failed
      if (attempt.projects?.project_languages) {
        attempt.projects.project_languages.forEach(pl => {
          if (pl.programming_languages) {
            userData.failedLanguages.add(pl.programming_languages.name);
          }
        });
      }

      // Track topics they failed
      if (attempt.projects?.project_topics) {
        attempt.projects.project_topics.forEach(pt => {
          if (pt.topics) {
            userData.failedTopics.add(pt.topics.name);
          }
        });
      }
    });

    // Filter users with 8+ failures
    return Array.from(userMap.values()).filter(u => u.totalFailures >= this.maxAttempts);
  }

  /**
   * Analyze recommendations for each user
   */
  async analyzeRecommendations(users) {
    this.analysisResults.totalUsersAnalyzed = users.length;

    for (const user of users) {
      // Get their recommendations
      const { data: recommendations } = await supabase
        .from('learning_recommendations')
        .select(`
          *,
          programming_languages (id, name),
          topics (id, name)
        `)
        .eq('user_id', user.userId);

      if (!recommendations || recommendations.length === 0) {
        // User has failures but NO recommendations
        // Each failed language/topic is a FALSE NEGATIVE
        this.confusionMatrix.falseNegative += user.failedLanguages.size + user.failedTopics.size;
        continue;
      }

      this.analysisResults.usersWithRecommendations++;
      this.analysisResults.totalRecommendations += recommendations.length;

      // Check each recommendation
      for (const rec of recommendations) {
        let isMatch = false;

        // Check if recommendation matches a failed language
        if (rec.programming_languages) {
          const langName = rec.programming_languages.name;
          if (user.failedLanguages.has(langName)) {
            isMatch = true;
            this.confusionMatrix.truePositive++;
            this.analysisResults.matchingRecommendations++;
          }
        }

        // Check if recommendation matches a failed topic
        if (rec.topics) {
          const topicName = rec.topics.name;
          if (user.failedTopics.has(topicName)) {
            isMatch = true;
            this.confusionMatrix.truePositive++;
            this.analysisResults.matchingRecommendations++;
          }
        }

        // If no match, it's a FALSE POSITIVE (wrong recommendation)
        if (!isMatch) {
          this.confusionMatrix.falsePositive++;
          this.analysisResults.mismatchedRecommendations++;
        }
      }

      // Check for MISSED opportunities (FALSE NEGATIVES)
      // Languages they failed but didn't get recommendations for
      const recommendedLanguages = new Set(
        recommendations
          .filter(r => r.programming_languages)
          .map(r => r.programming_languages.name)
      );
      
      const recommendedTopics = new Set(
        recommendations
          .filter(r => r.topics)
          .map(r => r.topics.name)
      );

      user.failedLanguages.forEach(lang => {
        if (!recommendedLanguages.has(lang)) {
          this.confusionMatrix.falseNegative++;
        }
      });

      user.failedTopics.forEach(topic => {
        if (!recommendedTopics.has(topic)) {
          this.confusionMatrix.falseNegative++;
        }
      });

      // Store sample
      if (this.analysisResults.sampleUsers.length < 10) {
        const matchingRecs = recommendations.filter(r => {
          if (r.programming_languages) {
            return user.failedLanguages.has(r.programming_languages.name);
          }
          if (r.topics) {
            return user.failedTopics.has(r.topics.name);
          }
          return false;
        });

        const mismatchedRecs = recommendations.filter(r => {
          if (r.programming_languages) {
            return !user.failedLanguages.has(r.programming_languages.name);
          }
          if (r.topics) {
            return !user.failedTopics.has(r.topics.name);
          }
          return true;
        });

        this.analysisResults.sampleUsers.push({
          userId: user.userId.substring(0, 8),
          totalFailures: user.totalFailures,
          failedLanguages: Array.from(user.failedLanguages),
          failedTopics: Array.from(user.failedTopics),
          totalRecommendations: recommendations.length,
          matchingRecommendations: matchingRecs.length,
          mismatchedRecommendations: mismatchedRecs.length,
          matchingTitles: matchingRecs.map(r => r.tutorial_title || 'Untitled').slice(0, 3),
          mismatchedTitles: mismatchedRecs.map(r => r.tutorial_title || 'Untitled').slice(0, 3)
        });
      }
    }

    // Calculate TRUE NEGATIVES
    // This is tricky - we need to estimate how many correct "non-recommendations" exist
    // For simplicity: assume each user could potentially need recommendations for all languages/topics
    // TN = (all possible combinations) - (TP + FP + FN)
    const avgLanguagesPerUser = 5; // rough estimate
    const avgTopicsPerUser = 5;
    const totalPossibleRecommendations = users.length * (avgLanguagesPerUser + avgTopicsPerUser);
    const total = this.confusionMatrix.truePositive + 
                  this.confusionMatrix.falsePositive + 
                  this.confusionMatrix.falseNegative;
    this.confusionMatrix.trueNegative = Math.max(0, totalPossibleRecommendations - total);
  }

  /**
   * Calculate metrics
   */
  calculateMetrics() {
    const { truePositive, falsePositive, trueNegative, falseNegative } = this.confusionMatrix;
    const total = truePositive + falsePositive + trueNegative + falseNegative;

    if (total === 0) {
      console.warn('⚠️  No data for metrics calculation');
      return;
    }

    // Accuracy
    this.metrics.accuracy = ((truePositive + trueNegative) / total * 100).toFixed(2);

    // Precision: Of all recommendations we gave, how many were correct?
    this.metrics.precision = (truePositive + falsePositive) > 0
      ? (truePositive / (truePositive + falsePositive) * 100).toFixed(2)
      : 0;

    // Recall: Of all the courses they needed, how many did we recommend?
    this.metrics.recall = (truePositive + falseNegative) > 0
      ? (truePositive / (truePositive + falseNegative) * 100).toFixed(2)
      : 0;

    // F1-Score
    const precision = parseFloat(this.metrics.precision);
    const recall = parseFloat(this.metrics.recall);
    this.metrics.f1Score = (precision + recall) > 0
      ? (2 * (precision * recall) / (precision + recall)).toFixed(2)
      : 0;
  }

  /**
   * Display results
   */
  displayResults() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 CONFUSION MATRIX');
    console.log('='.repeat(70));
    console.log('\n                     │  ACTUAL: Needed    │  ACTUAL: Not Needed');
    console.log('─────────────────────┼────────────────────┼──────────────────────');
    console.log(`PREDICTED: Recommend │        ${this.padNumber(this.confusionMatrix.truePositive)}       │          ${this.padNumber(this.confusionMatrix.falsePositive)}`);
    console.log(`                     │       (TP)         │         (FP)`);
    console.log(`                     │   CORRECT MATCH    │    WRONG MATCH`);
    console.log('─────────────────────┼────────────────────┼──────────────────────');
    console.log(`PREDICTED: No Rec    │        ${this.padNumber(this.confusionMatrix.falseNegative)}       │          ${this.padNumber(this.confusionMatrix.trueNegative)}`);
    console.log(`                     │       (FN)         │         (TN)`);
    console.log(`                     │   MISSED COURSE    │   CORRECT NO-REC`);
    console.log('─────────────────────┴────────────────────┴──────────────────────\n');

    console.log('🎯 PERFORMANCE METRICS');
    console.log('='.repeat(70));
    console.log(`Accuracy:    ${this.metrics.accuracy}%  ${this.getMetricRating(this.metrics.accuracy)}`);
    console.log(`             Overall correctness of recommendations\n`);

    console.log(`Precision:   ${this.metrics.precision}%  ${this.getMetricRating(this.metrics.precision)}`);
    console.log(`             Of courses we recommended, how many were RIGHT?\n`);

    console.log(`Recall:      ${this.metrics.recall}%  ${this.getMetricRating(this.metrics.recall)}`);
    console.log(`             Of courses they NEEDED, how many did we recommend?\n`);

    console.log(`F1-Score:    ${this.metrics.f1Score}%  ${this.getMetricRating(this.metrics.f1Score)}`);
    console.log(`             Balanced measure of recommendation quality\n`);

    console.log('📈 SUMMARY STATISTICS');
    console.log('='.repeat(70));
    console.log(`Total Users Analyzed:              ${this.analysisResults.totalUsersAnalyzed}`);
    console.log(`Users with Recommendations:        ${this.analysisResults.usersWithRecommendations}`);
    console.log(`Total Recommendations Given:       ${this.analysisResults.totalRecommendations}`);
    console.log(`Matching Recommendations (TP):     ${this.analysisResults.matchingRecommendations} ✅`);
    console.log(`Mismatched Recommendations (FP):   ${this.analysisResults.mismatchedRecommendations} ❌`);
    console.log(`Missed Opportunities (FN):         ${this.confusionMatrix.falseNegative} ⚠️`);
    
    const matchRate = this.analysisResults.totalRecommendations > 0
      ? ((this.analysisResults.matchingRecommendations / this.analysisResults.totalRecommendations) * 100).toFixed(1)
      : 0;
    console.log(`\nDirect Match Rate:                 ${matchRate}%`);

    if (this.analysisResults.sampleUsers.length > 0) {
      console.log('\n👥 SAMPLE USER ANALYSIS (First 10):');
      console.log('='.repeat(70));
      this.analysisResults.sampleUsers.forEach((user, idx) => {
        console.log(`\n${idx + 1}. User ${user.userId} (${user.totalFailures} failures)`);
        console.log(`   Failed Languages: ${user.failedLanguages.length > 0 ? user.failedLanguages.join(', ') : 'None'}`);
        console.log(`   Failed Topics: ${user.failedTopics.length > 0 ? user.failedTopics.join(', ') : 'None'}`);
        console.log(`   Total Recommendations: ${user.totalRecommendations}`);
        console.log(`   ✅ Matching (${user.matchingRecommendations}):`);
        if (user.matchingTitles.length > 0) {
          user.matchingTitles.forEach(title => console.log(`      - ${title}`));
        } else {
          console.log(`      - None`);
        }
        console.log(`   ❌ Mismatched (${user.mismatchedRecommendations}):`);
        if (user.mismatchedTitles.length > 0) {
          user.mismatchedTitles.forEach(title => console.log(`      - ${title}`));
        } else {
          console.log(`      - None`);
        }
      });
    }

    console.log('\n\n💡 INTERPRETATION');
    console.log('='.repeat(70));
    this.printInterpretation();
  }

  /**
   * Print interpretation
   */
  printInterpretation() {
    const precision = parseFloat(this.metrics.precision);
    const recall = parseFloat(this.metrics.recall);
    const matchRate = this.analysisResults.totalRecommendations > 0
      ? ((this.analysisResults.matchingRecommendations / this.analysisResults.totalRecommendations) * 100)
      : 0;

    console.log('Recommendation Quality Assessment:\n');

    if (matchRate >= 80) {
      console.log('🌟 EXCELLENT: Most recommendations match what users actually need!');
    } else if (matchRate >= 60) {
      console.log('✅ GOOD: Majority of recommendations are relevant to user failures');
    } else if (matchRate >= 40) {
      console.log('⚠️  FAIR: Many recommendations don\'t match user failure patterns');
    } else {
      console.log('❌ POOR: Most recommendations don\'t match what users are failing at');
    }

    console.log();

    if (precision >= 80) {
      console.log(`✅ HIGH Precision (${precision}%): We rarely recommend wrong courses`);
    } else if (precision >= 60) {
      console.log(`⚠️  MODERATE Precision (${precision}%): Some irrelevant recommendations`);
    } else {
      console.log(`❌ LOW Precision (${precision}%): Many irrelevant recommendations`);
    }

    if (recall >= 80) {
      console.log(`✅ HIGH Recall (${recall}%): We catch most of what users need`);
    } else if (recall >= 60) {
      console.log(`⚠️  MODERATE Recall (${recall}%): We miss some needed courses`);
    } else {
      console.log(`❌ LOW Recall (${recall}%): We miss many needed courses`);
    }

    console.log('\nWhat This Means:');
    
    if (precision >= 70 && recall < 60) {
      console.log('- Recommendations are accurate but conservative');
      console.log('- Consider recommending more courses to improve coverage');
    } else if (recall >= 70 && precision < 60) {
      console.log('- System recommends broadly but not precisely');
      console.log('- Need better filtering to match actual failure patterns');
    } else if (precision < 60 && recall < 60) {
      console.log('- Recommendation logic needs improvement');
      console.log('- Should better analyze which languages/topics users are failing');
    } else {
      console.log('- Good balance between accuracy and coverage');
    }
  }

  /**
   * Export report
   */
  exportReport() {
    let md = '# Learning Recommendation Accuracy Report\n\n';
    md += `**Generated:** ${new Date().toISOString()}\n\n`;
    md += '---\n\n';

    md += '## Evaluation Method\n\n';
    md += 'This analysis checks: **Are we recommending the RIGHT courses?**\n\n';
    md += '- **TRUE POSITIVE:** Recommended course matches user\'s failure area ✅\n';
    md += '- **FALSE POSITIVE:** Recommended course user doesn\'t need ❌\n';
    md += '- **FALSE NEGATIVE:** User needed course but we didn\'t recommend ⚠️\n';
    md += '- **TRUE NEGATIVE:** Correctly didn\'t recommend unnecessary course ✓\n\n';

    md += '---\n\n';

    md += '## Confusion Matrix\n\n';
    md += '|  | **Needed Course** | **Didn\'t Need** |\n';
    md += '|---|---|---|\n';
    md += `| **Recommended** | ${this.confusionMatrix.truePositive} (TP) ✅ | ${this.confusionMatrix.falsePositive} (FP) ❌ |\n`;
    md += `| **Not Recommended** | ${this.confusionMatrix.falseNegative} (FN) ⚠️ | ${this.confusionMatrix.trueNegative} (TN) ✓ |\n\n`;

    md += '---\n\n';

    md += '## Metrics\n\n';
    md += '| Metric | Value | Rating |\n';
    md += '|--------|-------|--------|\n';
    md += `| Accuracy | ${this.metrics.accuracy}% | ${this.getMetricRating(this.metrics.accuracy)} |\n`;
    md += `| Precision | ${this.metrics.precision}% | ${this.getMetricRating(this.metrics.precision)} |\n`;
    md += `| Recall | ${this.metrics.recall}% | ${this.getMetricRating(this.metrics.recall)} |\n`;
    md += `| F1-Score | ${this.metrics.f1Score}% | ${this.getMetricRating(this.metrics.f1Score)} |\n\n`;

    md += '---\n\n';

    md += '## Statistics\n\n';
    md += `- **Users Analyzed:** ${this.analysisResults.totalUsersAnalyzed}\n`;
    md += `- **Users with Recommendations:** ${this.analysisResults.usersWithRecommendations}\n`;
    md += `- **Total Recommendations:** ${this.analysisResults.totalRecommendations}\n`;
    md += `- **Matching Recommendations:** ${this.analysisResults.matchingRecommendations} ✅\n`;
    md += `- **Mismatched Recommendations:** ${this.analysisResults.mismatchedRecommendations} ❌\n`;
    md += `- **Missed Opportunities:** ${this.confusionMatrix.falseNegative} ⚠️\n\n`;

    const matchRate = this.analysisResults.totalRecommendations > 0
      ? ((this.analysisResults.matchingRecommendations / this.analysisResults.totalRecommendations) * 100).toFixed(1)
      : 0;
    md += `**Direct Match Rate:** ${matchRate}%\n\n`;

    md += '---\n\n';
    md += '## Interpretation\n\n';
    
    if (matchRate >= 80) {
      md += '🌟 **EXCELLENT**: Most recommendations match what users actually need!\n\n';
    } else if (matchRate >= 60) {
      md += '✅ **GOOD**: Majority of recommendations are relevant to user failures.\n\n';
    } else if (matchRate >= 40) {
      md += '⚠️  **FAIR**: Many recommendations don\'t match user failure patterns.\n\n';
    } else {
      md += '❌ **POOR**: Most recommendations don\'t match what users are failing at.\n\n';
    }

    md += '### Key Findings:\n\n';
    md += `- **Precision (${this.metrics.precision}%)**: Of courses recommended, this % were relevant\n`;
    md += `- **Recall (${this.metrics.recall}%)**: Of courses needed, this % were recommended\n`;
    md += `- **Direct Match Rate (${matchRate}%)**: Recommendations that directly address failure areas\n\n`;

    const filename = 'rejection-learning-confusion-matrix-report.md';
    fs.writeFileSync(filename, md);
    console.log(`💾 Report saved to: ${filename}`);
  }

  padNumber(num) {
    return num.toString().padStart(3, ' ');
  }

  getMetricRating(value) {
    const val = parseFloat(value);
    if (val >= 90) return '🌟 Excellent';
    if (val >= 80) return '✅ Very Good';
    if (val >= 70) return '✓ Good';
    if (val >= 60) return '⚠️  Fair';
    return '❌ Needs Improvement';
  }
}

// Run analysis
if (require.main === module) {
  const tester = new RejectionLearningConfusionMatrixTester();
  tester.runConfusionMatrixAnalysis()
    .then(() => {
      console.log('\n✨ Analysis completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = RejectionLearningConfusionMatrixTester;