// backend/scripts/runAllAlgorithmTests.js
const RecommendationAlgorithmTester = require('./testRecommendationAlgorithm');
const SkillAssessmentTester = require('./testSkillAssessmentAlgorithm');

class AlgorithmTestRunner {
  constructor() {
    this.results = {
      recommendation: null,
      assessment: null,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Run all algorithm tests
   */
  async runAll() {
    this.results.startTime = new Date();
    
    console.log('\n');
    console.log('═'.repeat(70));
    console.log('🚀 RUNNING ALL ALGORITHM TESTS');
    console.log('═'.repeat(70));
    console.log(`Started at: ${this.results.startTime.toISOString()}`);
    console.log('═'.repeat(70));

    try {
      // Run recommendation algorithm tests
      console.log('\n\n📊 PART 1: RECOMMENDATION ALGORITHM TESTS');
      console.log('─'.repeat(70));
      const recommendationTester = new RecommendationAlgorithmTester();
      await recommendationTester.runAllTests();
      this.results.recommendation = recommendationTester.testResults;

      // Run skill assessment tests
      console.log('\n\n🎯 PART 2: SKILL ASSESSMENT ALGORITHM TESTS');
      console.log('─'.repeat(70));
      const assessmentTester = new SkillAssessmentTester();
      await assessmentTester.runAllTests();
      await assessmentTester.testScoringConsistency();
      await assessmentTester.testEdgeCases();
      await assessmentTester.testAssessmentDatabaseIntegration();
      this.results.assessment = assessmentTester.testResults;

      this.results.endTime = new Date();
      this.printFinalReport();

      // Exit with appropriate code
      const hasFailed = 
        this.results.recommendation.failed > 0 || 
        this.results.assessment.failed > 0;
      
      process.exit(hasFailed ? 1 : 0);

    } catch (error) {
      console.error('\n💥 FATAL ERROR:', error);
      process.exit(1);
    }
  }

  /**
   * Print comprehensive final report
   */
  printFinalReport() {
    const duration = (this.results.endTime - this.results.startTime) / 1000;
    
    console.log('\n\n');
    console.log('═'.repeat(70));
    console.log('📊 FINAL TEST REPORT');
    console.log('═'.repeat(70));

    // Overall statistics
    const totalTests = 
      this.results.recommendation.passed + this.results.recommendation.failed +
      this.results.assessment.passed + this.results.assessment.failed;
    
    const totalPassed = 
      this.results.recommendation.passed + this.results.assessment.passed;
    
    const totalFailed = 
      this.results.recommendation.failed + this.results.assessment.failed;

    const overallSuccessRate = totalTests > 0 
      ? ((totalPassed / totalTests) * 100).toFixed(2)
      : 0;

    console.log('\n📈 OVERALL STATISTICS:');
    console.log(`  Total Tests Run: ${totalTests}`);
    console.log(`  ✅ Total Passed: ${totalPassed}`);
    console.log(`  ❌ Total Failed: ${totalFailed}`);
    console.log(`  📊 Success Rate: ${overallSuccessRate}%`);
    console.log(`  ⏱️  Duration: ${duration.toFixed(2)}s`);

    // Recommendation algorithm results
    console.log('\n\n🎯 RECOMMENDATION ALGORITHM:');
    console.log('─'.repeat(70));
    const recTests = this.results.recommendation.passed + this.results.recommendation.failed;
    const recSuccessRate = recTests > 0
      ? ((this.results.recommendation.passed / recTests) * 100).toFixed(2)
      : 0;
    
    console.log(`  Tests: ${recTests}`);
    console.log(`  Passed: ${this.results.recommendation.passed}`);
    console.log(`  Failed: ${this.results.recommendation.failed}`);
    console.log(`  Success Rate: ${recSuccessRate}%`);
    
    if (this.results.recommendation.failed > 0) {
      console.log('\n  ⚠️  Failed Tests:');
      this.results.recommendation.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`    - ${t.name}`));
    } else {
      console.log('  ✨ All recommendation tests passed!');
    }

    // Assessment algorithm results
    console.log('\n\n🧪 SKILL ASSESSMENT ALGORITHM:');
    console.log('─'.repeat(70));
    const assTests = this.results.assessment.passed + this.results.assessment.failed;
    const assSuccessRate = assTests > 0
      ? ((this.results.assessment.passed / assTests) * 100).toFixed(2)
      : 0;
    
    console.log(`  Tests: ${assTests}`);
    console.log(`  Passed: ${this.results.assessment.passed}`);
    console.log(`  Failed: ${this.results.assessment.failed}`);
    console.log(`  Success Rate: ${assSuccessRate}%`);
    
    if (this.results.assessment.failed > 0) {
      console.log('\n  ⚠️  Failed Tests:');
      this.results.assessment.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`    - ${t.name}`));
    } else {
      console.log('  ✨ All assessment tests passed!');
    }

    // Health assessment
    console.log('\n\n💊 ALGORITHM HEALTH ASSESSMENT:');
    console.log('─'.repeat(70));
    
    const recHealth = this.getHealthStatus(recSuccessRate);
    const assHealth = this.getHealthStatus(assSuccessRate);
    const overallHealth = this.getHealthStatus(overallSuccessRate);

    console.log(`  Recommendation Algorithm: ${recHealth.emoji} ${recHealth.status}`);
    console.log(`  Assessment Algorithm: ${assHealth.emoji} ${assHealth.status}`);
    console.log(`  Overall System: ${overallHealth.emoji} ${overallHealth.status}`);

    // Recommendations
    console.log('\n\n💡 RECOMMENDATIONS:');
    console.log('─'.repeat(70));
    
    if (totalFailed === 0) {
      console.log('  ✨ All systems operational! Algorithms are performing as expected.');
    } else {
      console.log('  ⚠️  Action items:');
      
      if (this.results.recommendation.failed > 0) {
        console.log('    1. Review failed recommendation algorithm tests');
        console.log('    2. Check weight configurations in SkillMatchingService');
        console.log('    3. Verify database schema for project_recommendations table');
      }
      
      if (this.results.assessment.failed > 0) {
        console.log('    1. Review failed assessment algorithm tests');
        console.log('    2. Verify evaluateCode() logic for edge cases');
        console.log('    3. Check database schema for challenge_attempts table');
      }
    }

    // Export results option
    console.log('\n\n💾 TEST RESULTS:');
    console.log('─'.repeat(70));
    console.log('  To export detailed results, use:');
    console.log('  node backend/scripts/runAllAlgorithmTests.js > test-results.json');

    console.log('\n═'.repeat(70));
    
    if (totalFailed === 0) {
      console.log('🎉 ALL TESTS PASSED - ALGORITHMS ARE HEALTHY!');
    } else {
      console.log('⚠️  SOME TESTS FAILED - REVIEW RECOMMENDED');
    }
    
    console.log('═'.repeat(70));
    console.log(`Completed at: ${this.results.endTime.toISOString()}`);
    console.log('═'.repeat(70));
  }

  /**
   * Get health status based on success rate
   */
  getHealthStatus(successRate) {
    if (successRate >= 95) {
      return { emoji: '🟢', status: 'Excellent' };
    } else if (successRate >= 85) {
      return { emoji: '🟡', status: 'Good' };
    } else if (successRate >= 70) {
      return { emoji: '🟠', status: 'Fair' };
    } else {
      return { emoji: '🔴', status: 'Needs Attention' };
    }
  }

  /**
   * Export results to JSON
   */
  exportResultsToJSON() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: (this.results.endTime - this.results.startTime) / 1000,
      summary: {
        totalTests: 
          this.results.recommendation.passed + this.results.recommendation.failed +
          this.results.assessment.passed + this.results.assessment.failed,
        totalPassed: 
          this.results.recommendation.passed + this.results.assessment.passed,
        totalFailed: 
          this.results.recommendation.failed + this.results.assessment.failed
      },
      recommendation: this.results.recommendation,
      assessment: this.results.assessment
    };

    return JSON.stringify(report, null, 2);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new AlgorithmTestRunner();
  runner.runAll().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = AlgorithmTestRunner;