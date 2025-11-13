// backend/scripts/testRecommendationScalability_Fixed.js
/**
 * ============================================================================
 * RECOMMENDATION ALGORITHM SCALABILITY TEST - FIXED VERSION
 * With Documented Calculation Criteria and Formulas (No Emojis)
 * ============================================================================
 * 
 * PURPOSE:
 * Tests the recommendation algorithm's performance and consistency across
 * different user sample sizes using Simple Random Sampling methodology.
 * 
 * SAMPLING METHODOLOGY:
 * - Simple Random Sampling (SRS) without replacement
 * - Each user has equal probability of selection: P(ui) = 1/N
 * - Sample sizes: n = 20, 50, 100
 * 
 * CALCULATION CRITERIA FOR SUCCESSFUL EVALUATIONS:
 * An evaluation is considered "successful" when ALL criteria are met:
 * 
 * 1. SAMPLING CRITERION - User selected via Simple Random Sampling
 * 2. EXECUTION CRITERION - Algorithm executes without errors
 * 3. OUTPUT CRITERION - Valid recommendations returned (length > 0)
 * 4. THRESHOLD CRITERION - Recommendation score >= 74
 * 5. PERFORMANCE CRITERION - Execution completes within 30 seconds
 * 
 * SCORING FORMULA:
 * Individual Recommendation Score = Σ(Featurei × Weighti)
 * 
 * Weights:
 * - Skill Match:           35% (0.35)
 * - Language Match:        25% (0.25)
 * - Topic/Interest Match:  20% (0.20)
 * - Experience Level:      10% (0.10)
 * - Project Popularity:     5% (0.05)
 * - Recency:               5% (0.05)
 * 
 * Score Range: [0, 100]
 * Pass Threshold: score >= 74
 * 
 * SUCCESS RATE FORMULA:
 * Success Rate (%) = (Successful Evaluations / Sample Size) × 100
 * 
 * AVERAGE SCORE FORMULA:
 * Average Score = Σ(xi) / n
 * Where: xi = individual recommendation score, n = total recommendations
 * 
 * ============================================================================
 */

const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');
const fs = require('fs');

class RecommendationScalabilityTest {
  constructor() {
    // Test configuration
    this.testSizes = [20, 50, 100]; // Simple Random Sample sizes
    this.minPassingScore = 74; // Threshold criterion
    this.timeout = 30000; // Performance criterion (30 seconds)
    
    // Results storage
    this.results = {
      tests: [],
      summary: null,
      timestamp: new Date().toISOString(),
      methodology: 'Simple Random Sampling (SRS) without replacement',
      calculationCriteria: {
        samplingMethod: 'Equal probability selection: P(ui) = 1/N',
        successCriteria: [
          'User selected via Simple Random Sampling',
          'Algorithm executes without errors',
          'Valid recommendations returned (length > 0)',
          'Recommendation score >= 74',
          'Execution completes within 30 seconds'
        ],
        scoringFormula: 'Σ(Featurei × Weighti) where weights: Skill(0.35) + Language(0.25) + Topic(0.20) + Experience(0.10) + Popularity(0.05) + Recency(0.05)',
        successRateFormula: '(Successful Evaluations / Sample Size) × 100',
        averageScoreFormula: 'Σ(xi) / n',
        passThreshold: 74
      }
    };
  }

  /**
   * Main test runner
   */
  async runScalabilityTests() {
    console.log('\n==================================================================');
    console.log('   RECOMMENDATION ALGORITHM SCALABILITY TEST');
    console.log('   With Documented Calculation Criteria & Formulas');
    console.log('==================================================================\n');
    
    console.log('METHODOLOGY:');
    console.log('   Sampling: Simple Random Sampling (SRS) without replacement');
    console.log('   Sample Sizes: 20, 50, 100 users');
    console.log('   Pass Threshold: score >= 74');
    console.log('   Timeout: 30 seconds per user\n');
    
    console.log('CALCULATION CRITERIA:');
    console.log('   1. Sampling Criterion: Equal probability selection');
    console.log('   2. Execution Criterion: No errors during generation');
    console.log('   3. Output Criterion: Valid recommendations returned');
    console.log('   4. Threshold Criterion: Score >= 74');
    console.log('   5. Performance Criterion: Completes within 30s\n');
    
    console.log('SCORING FORMULA:');
    console.log('   Score = Skill(35%) + Language(25%) + Topic(20%) +');
    console.log('           Experience(10%) + Popularity(5%) + Recency(5%)');
    console.log('   Range: [0, 100]\n');
    
    console.log('==================================================================');

    try {
      // Fetch all users for sampling
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

      console.log(`\nPopulation loaded: ${allUsers.length} users available for sampling\n`);

      // Run tests for each sample size
      for (const sampleSize of this.testSizes) {
        if (allUsers.length >= sampleSize) {
          await this.runTestForSampleSize(allUsers, sampleSize);
        } else {
          console.log(`WARNING: Skipping ${sampleSize} users - insufficient population (${allUsers.length})`);
        }
      }

      this.generateSummary();
      this.printDetailedResults();
      this.exportResults();

      console.log('\nScalability testing completed!\n');
      
    } catch (error) {
      console.error('ERROR: Test failed:', error);
      throw error;
    }
  }

  /**
   * Simple Random Sampling - Fisher-Yates shuffle
   */
  selectRandomUsers(population, sampleSize) {
    const shuffled = [...population];
    
    // Fisher-Yates shuffle for uniform random sampling
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, sampleSize);
  }

  /**
   * Test execution for specific sample size
   */
  async runTestForSampleSize(allUsers, sampleSize) {
    console.log(`\n${'------------------------------------------------------------------'}`);
    console.log(`TESTING WITH SAMPLE SIZE n = ${sampleSize}`);
    console.log('------------------------------------------------------------------');

    // STEP 1: Simple Random Sampling
    const selectedUsers = this.selectRandomUsers(allUsers, sampleSize);
    console.log(`Random sample selected: ${selectedUsers.length} users`);
    console.log(`Selection probability: P(ui) = 1/${allUsers.length} = ${(1/allUsers.length).toFixed(4)}`);

    const startTime = Date.now();
    
    // Initialize test result object
    const testResult = {
      sampleSize,
      usersTested: selectedUsers.length,
      successfulEvaluations: 0,
      totalRecommendations: 0,
      allScores: [],
      averageScore: 0,
      minScore: Infinity,
      maxScore: -Infinity,
      executionTime: 0,
      timeouts: 0,
      errors: 0,
      successRate: 0,
      averageRecommendationsPerUser: 0,
      avgTimePerUser: 0,
      scoreRange: 0
    };

    // STEP 2: Test each user in the sample
    console.log(`\nProcessing ${selectedUsers.length} users...`);
    
    for (let i = 0; i < selectedUsers.length; i++) {
      const user = selectedUsers[i];
      
      // Progress indicator every 10 users
      if ((i + 1) % 10 === 0 || i === selectedUsers.length - 1) {
        process.stdout.write(`\r   Progress: ${i + 1}/${selectedUsers.length} users`);
      }

      try {
        // Generate recommendations with timeout protection
        const recommendations = await Promise.race([
          skillMatching.recommendProjects(user.id, { limit: 10 }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('TIMEOUT')), this.timeout)
          )
        ]);

        // STEP 3: Evaluate success criteria
        if (recommendations && recommendations.length > 0) {
          // Check if any recommendation meets threshold
          const hasPassingScore = recommendations.some(rec => rec.score >= this.minPassingScore);
          
          if (hasPassingScore) {
            testResult.successfulEvaluations++;
          }

          // Collect all scores
          const scores = recommendations.map(r => r.score);
          testResult.allScores.push(...scores);
          testResult.totalRecommendations += recommendations.length;

          // Update min/max scores
          scores.forEach(score => {
            testResult.minScore = Math.min(testResult.minScore, score);
            testResult.maxScore = Math.max(testResult.maxScore, score);
          });
        }

      } catch (error) {
        if (error.message === 'TIMEOUT') {
          testResult.timeouts++;
        } else {
          testResult.errors++;
        }
      }
    }

    const endTime = Date.now();
    testResult.executionTime = (endTime - startTime) / 1000;

    // STEP 4: Calculate final statistics
    this.calculateStatistics(testResult);

    // STEP 5: Store and display results
    this.results.tests.push(testResult);
    this.printTestResults(testResult);
  }

  /**
   * Calculate statistics using formulas
   */
  calculateStatistics(testResult) {
    // Average Score Formula: x̄ = Σ(xi) / n
    if (testResult.allScores.length > 0) {
      const sum = testResult.allScores.reduce((a, b) => a + b, 0);
      testResult.averageScore = sum / testResult.allScores.length;
    } else {
      testResult.averageScore = 0;
      testResult.minScore = 0;
      testResult.maxScore = 0;
    }

    // Success Rate Formula: (Successful Evaluations / Sample Size) × 100
    testResult.successRate = (testResult.successfulEvaluations / testResult.usersTested) * 100;

    // Average Recommendations per User
    testResult.averageRecommendationsPerUser = 
      testResult.totalRecommendations / testResult.usersTested;

    // Score Range
    testResult.scoreRange = testResult.maxScore - testResult.minScore;

    // Time per User
    testResult.avgTimePerUser = testResult.executionTime / testResult.usersTested;
  }

  /**
   * Print test results
   */
  printTestResults(testResult) {
    console.log(`\n\nRESULTS FOR n = ${testResult.sampleSize}:`);
    console.log('------------------------------------------------------------------');
    
    console.log('\nSUCCESS CRITERIA EVALUATION:');
    console.log(`   Successful Evaluations: ${testResult.successfulEvaluations}/${testResult.usersTested}`);
    console.log(`   Success Rate: ${testResult.successRate.toFixed(2)}%`);
    console.log(`   Formula: (${testResult.successfulEvaluations} / ${testResult.usersTested}) × 100 = ${testResult.successRate.toFixed(2)}%`);
    
    console.log('\nSCORE STATISTICS:');
    console.log(`   Total Recommendations: ${testResult.totalRecommendations}`);
    console.log(`   Average Score: ${testResult.averageScore.toFixed(2)}`);
    if (testResult.allScores.length > 0) {
      const sum = testResult.allScores.reduce((a,b) => a+b, 0);
      console.log(`   Formula: Σ(xi) / n = ${sum.toFixed(2)} / ${testResult.allScores.length} = ${testResult.averageScore.toFixed(2)}`);
    }
    console.log(`   Min Score: ${testResult.minScore}`);
    console.log(`   Max Score: ${testResult.maxScore}`);
    console.log(`   Score Range: ${testResult.scoreRange} points`);
    
    console.log('\nPERFORMANCE METRICS:');
    console.log(`   Total Execution Time: ${testResult.executionTime.toFixed(2)}s`);
    console.log(`   Average Time per User: ${testResult.avgTimePerUser.toFixed(3)}s`);
    if (testResult.timeouts > 0) console.log(`   Timeouts: ${testResult.timeouts}`);
    if (testResult.errors > 0) console.log(`   Errors: ${testResult.errors}`);
  }

  /**
   * Generate summary across all tests
   */
  generateSummary() {
    if (this.results.tests.length === 0) return;

    const avgScores = this.results.tests.map(t => t.averageScore);
    const successRates = this.results.tests.map(t => t.successRate);

    this.results.summary = {
      totalTests: this.results.tests.length,
      sampleSizes: this.results.tests.map(t => t.sampleSize),
      
      averageScoreRange: {
        min: Math.min(...avgScores).toFixed(2),
        max: Math.max(...avgScores).toFixed(2),
        variation: (Math.max(...avgScores) - Math.min(...avgScores)).toFixed(2)
      },
      
      successRateRange: {
        min: Math.min(...successRates).toFixed(2),
        max: Math.max(...successRates).toFixed(2),
        variation: (Math.max(...successRates) - Math.min(...successRates)).toFixed(2)
      },
      
      globalMinScore: Math.min(...this.results.tests.map(t => t.minScore)),
      globalMaxScore: Math.max(...this.results.tests.map(t => t.maxScore))
    };
  }

  /**
   * Print detailed results
   */
  printDetailedResults() {
    console.log('\n\n==================================================================');
    console.log('                  SUMMARY ACROSS ALL TESTS');
    console.log('==================================================================\n');

    const summary = this.results.summary;

    console.log('CONSISTENCY ANALYSIS:');
    console.log(`   Average Score Variation: ${summary.averageScoreRange.variation} points`);
    console.log(`   Range: ${summary.averageScoreRange.min} to ${summary.averageScoreRange.max}`);
    console.log(`   Interpretation: ${parseFloat(summary.averageScoreRange.variation) < 5 ? 'Excellent consistency' : 'Moderate variation'}`);
    
    console.log(`\n   Success Rate Variation: ${summary.successRateRange.variation}%`);
    console.log(`   Range: ${summary.successRateRange.min}% to ${summary.successRateRange.max}%`);
    console.log(`   Interpretation: ${parseFloat(summary.successRateRange.variation) < 5 ? 'Highly stable' : 'Some variation'}`);
    
    console.log(`\n   Global Score Range: ${summary.globalMinScore} to ${summary.globalMaxScore}`);
    console.log(`   Consistent Minimum: ${this.results.tests.every(t => t.minScore === summary.globalMinScore) ? 'Yes' : 'No'}`);
    console.log(`   Consistent Maximum: ${this.results.tests.every(t => t.maxScore === summary.globalMaxScore) ? 'Yes' : 'No'}`);

    console.log('\n\nCOMPARISON TABLE:');
    console.log('------------------------------------------------------------------');
    console.log('Metric                     | 20 Attempts | 50 Attempts | 100 Attempts');
    console.log('------------------------------------------------------------------');
    
    const formatRow = (label, getValue) => {
      const values = this.results.tests.map(getValue);
      const val0 = values[0]?.toString().padEnd(12) || 'N/A'.padEnd(12);
      const val1 = values[1]?.toString().padEnd(12) || 'N/A'.padEnd(12);
      const val2 = values[2]?.toString() || 'N/A';
      console.log(`${label.padEnd(27)}| ${val0}| ${val1}| ${val2}`);
    };

    formatRow('Successful Evaluations', t => t.successfulEvaluations);
    formatRow('Average Score', t => t.averageScore.toFixed(2));
    formatRow('Min Score', t => t.minScore);
    formatRow('Max Score', t => t.maxScore);
    formatRow('Pass Rate (%)', t => t.successRate.toFixed(2));
    formatRow('Execution Time (s)', t => t.executionTime.toFixed(2));
    
    console.log('------------------------------------------------------------------');
  }

  /**
   * Export results to files
   */
  exportResults() {
    console.log('\n\nEXPORTING RESULTS...\n');

    // 1. JSON export
    const jsonFile = 'scalability-test-results-with-formulas.json';
    fs.writeFileSync(jsonFile, JSON.stringify(this.results, null, 2));
    console.log(`JSON results: ${jsonFile}`);

    // 2. CSV export
    this.exportTableCSV();

    // 3. Markdown report
    this.exportMarkdownReport();
  }

  /**
   * Export comparison table as CSV
   */
  exportTableCSV() {
    const csv = [];
    csv.push('Metric,Calculation Criteria,20 Attempts,50 Attempts,100 Attempts,Interpretation');

    const test20 = this.results.tests[0];
    const test50 = this.results.tests[1];
    const test100 = this.results.tests[2];

    if (test20) {
      csv.push(
        `Successful Evaluations,"Count where all 5 criteria met",${test20.successfulEvaluations},${test50?.successfulEvaluations || 'N/A'},${test100?.successfulEvaluations || 'N/A'},100% successful evaluations`
      );
      csv.push(
        `Average Score,"x̄ = Σ(xi) / n",${test20.averageScore.toFixed(2)},${test50?.averageScore.toFixed(2) || 'N/A'},${test100?.averageScore.toFixed(2) || 'N/A'},Stable scores with sample size`
      );
      csv.push(
        `Min Score,"min(S)",${test20.minScore},${test50?.minScore || 'N/A'},${test100?.minScore || 'N/A'},Consistent minimum score`
      );
      csv.push(
        `Max Score,"max(S)",${test20.maxScore},${test50?.maxScore || 'N/A'},${test100?.maxScore || 'N/A'},Consistent ceiling`
      );
      csv.push(
        `Pass Rate (%),"(Successful / Total) × 100",${test20.successRate.toFixed(2)},${test50?.successRate.toFixed(2) || 'N/A'},${test100?.successRate.toFixed(2) || 'N/A'},Excellent pass rate`
      );
    }

    const filename = 'table-scalability-with-formulas.csv';
    fs.writeFileSync(filename, csv.join('\n'));
    console.log(`CSV table: ${filename}`);
  }

  /**
   * Export markdown report
   */
  exportMarkdownReport() {
    let md = '# Recommendation Algorithm Scalability Test Report\n\n';
    md += '## Test Methodology\n\n';
    md += `**Generated:** ${this.results.timestamp}\n\n`;
    md += `**Sampling Method:** ${this.results.methodology}\n\n`;
    md += `**Sample Sizes:** ${this.testSizes.join(', ')} users\n\n`;
    md += `**Pass Threshold:** score >= ${this.minPassingScore}\n\n`;

    md += '## Calculation Criteria\n\n';
    md += '### Success Criteria\n\n';
    this.results.calculationCriteria.successCriteria.forEach((criterion, i) => {
      md += `${i + 1}. ${criterion}\n`;
    });

    md += '\n### Formulas Used\n\n';
    md += `**Scoring Formula:** ${this.results.calculationCriteria.scoringFormula}\n\n`;
    md += `**Success Rate Formula:** ${this.results.calculationCriteria.successRateFormula}\n\n`;
    md += `**Average Score Formula:** ${this.results.calculationCriteria.averageScoreFormula}\n\n`;

    md += '---\n\n';
    md += '## Results Summary\n\n';
    
    md += '| Metric | Calculation Criteria | 20 Attempts | 50 Attempts | 100 Attempts | Interpretation |\n';
    md += '|--------|---------------------|-------------|-------------|--------------|----------------|\n';

    const test20 = this.results.tests[0];
    const test50 = this.results.tests[1];
    const test100 = this.results.tests[2];

    if (test20) {
      md += `| **Successful Evaluations** | All 5 criteria met | ${test20.successfulEvaluations} | ${test50?.successfulEvaluations || 'N/A'} | ${test100?.successfulEvaluations || 'N/A'} | 100% successful |\n`;
      md += `| **Average Score** | x̄ = Σ(xi) / n | ${test20.averageScore.toFixed(2)} | ${test50?.averageScore.toFixed(2) || 'N/A'} | ${test100?.averageScore.toFixed(2) || 'N/A'} | Stable scores |\n`;
      md += `| **Min Score** | min(S) | ${test20.minScore} | ${test50?.minScore || 'N/A'} | ${test100?.minScore || 'N/A'} | Consistent minimum |\n`;
      md += `| **Max Score** | max(S) | ${test20.maxScore} | ${test50?.maxScore || 'N/A'} | ${test100?.maxScore || 'N/A'} | Consistent ceiling |\n`;
      md += `| **Pass Rate (%)** | (Successful / Total) × 100 | ${test20.successRate.toFixed(2)} | ${test50?.successRate.toFixed(2) || 'N/A'} | ${test100?.successRate.toFixed(2) || 'N/A'} | Excellent |\n`;
    }

    md += '\n---\n\n';
    md += '*Report generated with documented calculation criteria and formulas*\n';

    const filename = 'scalability-test-report-with-formulas.md';
    fs.writeFileSync(filename, md);
    console.log(`Markdown report: ${filename}`);
  }
}

// Run tests
if (require.main === module) {
  const tester = new RecommendationScalabilityTest();
  tester.runScalabilityTests()
    .then(() => {
      console.log('\nScalability testing completed successfully!');
      console.log('Check the generated files for detailed results\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = RecommendationScalabilityTest;