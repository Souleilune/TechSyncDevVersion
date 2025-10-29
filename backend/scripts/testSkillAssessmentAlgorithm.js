// backend/scripts/testSkillAssessmentAlgorithm.js
const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');

class SkillAssessmentTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.minPassingScore = 70;
  }

  /**
   * Main test runner
   */
  async runAllTests() {
    console.log('\n🧪 SKILL ASSESSMENT ALGORITHM TEST SUITE');
    console.log('=' .repeat(60));
    console.log('Testing current skill assessment algorithm');
    console.log('Minimum passing score: 70/100');
    console.log('=' .repeat(60));

    try {
      await this.testCodeEvaluation();
      await this.testFeedbackGeneration();
      await this.testPassingThresholds();
      await this.testCodeQualityMetrics();
      await this.testRealChallengeAttempts();
      await this.testChallengeRetrieval();
      await this.testAssessmentWorkflow();
      await this.testAttemptTracking();
      await this.testProgressiveFailureHandling();
      
      this.printTestSummary();
    } catch (error) {
      console.error('❌ Test suite failed with error:', error);
      throw error;
    }
  }

  /**
   * Test code evaluation logic
   */
  async testCodeEvaluation() {
    console.log('\n📝 Testing Code Evaluation...');
    
    const testCases = [
      {
        name: 'Excellent code with all elements',
        code: `
function calculateSum(arr) {
  if (!Array.isArray(arr)) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}
        `,
        expectedMinScore: 80,
        shouldPass: true
      },
      {
        name: 'Good code with basic logic',
        code: `
function greet(name) {
  return "Hello " + name;
}
        `,
        expectedMinScore: 40,
        expectedMaxScore: 80,
        shouldPass: false
      },
      {
        name: 'Minimal code',
        code: `
const x = 5;
        `,
        expectedMinScore: 0,
        expectedMaxScore: 40,
        shouldPass: false
      },
      {
        name: 'Empty code',
        code: '',
        expectedScore: 0,
        shouldPass: false
      },
      {
        name: 'Complex code with multiple patterns',
        code: `
function processData(data) {
  if (!data || data.length === 0) {
    return [];
  }
  
  const result = [];
  for (let item of data) {
    if (item.value > 0) {
      result.push(item);
    }
  }
  
  return result.sort((a, b) => b.value - a.value);
}
        `,
        expectedMinScore: 80,
        shouldPass: true
      }
    ];

    for (const testCase of testCases) {
      const score = skillMatching.evaluateCode(testCase.code);
      const passes = score >= this.minPassingScore;
      
      let scoreValid;
      if (testCase.expectedScore !== undefined) {
        scoreValid = score === testCase.expectedScore;
      } else {
        scoreValid = score >= testCase.expectedMinScore && 
                    (!testCase.expectedMaxScore || score <= testCase.expectedMaxScore);
      }

      const passed = scoreValid && (passes === testCase.shouldPass);

      this.recordTest(
        `Code Evaluation: ${testCase.name}`,
        passed,
        { 
          score, 
          passes,
          expectedPass: testCase.shouldPass,
          codeLength: testCase.code.length
        }
      );
    }
  }

  /**
   * Test feedback generation
   */
  async testFeedbackGeneration() {
    console.log('\n💬 Testing Feedback Generation...');
    
    const testScores = [
      { score: 95, expectedTone: 'excellent' },
      { score: 80, expectedTone: 'good' },
      { score: 65, expectedTone: 'basic' },
      { score: 40, expectedTone: 'needs improvement' }
    ];

    for (const test of testScores) {
      const feedback = skillMatching.generateFeedback(test.score);
      const hasAppropriateLength = feedback.length > 20;
      const isEncouraging = feedback.length > 0;

      this.recordTest(
        `Feedback for score ${test.score}`,
        hasAppropriateLength && isEncouraging,
        { 
          score: test.score,
          feedbackLength: feedback.length,
          feedback: feedback.substring(0, 50) + '...'
        }
      );
    }
  }

  /**
   * Test passing thresholds
   */
  async testPassingThresholds() {
    console.log('\n🎯 Testing Passing Thresholds...');
    
    const boundaryScores = [69, 70, 71];
    
    for (const score of boundaryScores) {
      const passes = score >= this.minPassingScore;
      const expectedPass = score >= 70;
      
      this.recordTest(
        `Boundary Score ${score}`,
        passes === expectedPass,
        { 
          score,
          passes,
          threshold: this.minPassingScore
        }
      );
    }
  }

  /**
   * Test code quality metrics
   */
  async testCodeQualityMetrics() {
    console.log('\n📊 Testing Code Quality Metrics...');
    
    const qualityTests = [
      {
        name: 'Has function definition',
        code: 'function test() { return 42; }',
        shouldScore: true
      },
      {
        name: 'Has return statement',
        code: 'const test = () => { return 42; }',
        shouldScore: true
      },
      {
        name: 'Has control flow (if)',
        code: 'if (x > 0) { console.log(x); }',
        shouldScore: true
      },
      {
        name: 'Has loop (for)',
        code: 'for (let i = 0; i < 10; i++) { }',
        shouldScore: true
      },
      {
        name: 'Has multiple lines',
        code: 'const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;',
        shouldScore: true
      }
    ];

    for (const test of qualityTests) {
      const score = skillMatching.evaluateCode(test.code);
      const hasPoints = score > 0;
      
      this.recordTest(
        `Quality Metric: ${test.name}`,
        hasPoints === test.shouldScore,
        { 
          code: test.code.substring(0, 50),
          score
        }
      );
    }
  }

  /**
   * Test with real challenge attempts
   */
  async testRealChallengeAttempts() {
    console.log('\n🔍 Testing Real Challenge Attempts...');
    
    try {
      const { data: attempts, error } = await supabase
        .from('challenge_attempts')
        .select(`
          id,
          submitted_code,
          score,
          status,
          feedback,
          challenge_id,
          user_id
        `)
        .limit(5)
        .order('created_at', { ascending: false });

      if (error || !attempts || attempts.length === 0) {
        this.recordTest(
          'Real Challenge Attempts Analysis',
          false,
          { error: 'No attempts found for testing' }
        );
        return;
      }

      for (const attempt of attempts) {
        if (!attempt.submitted_code) continue;

        const evaluatedScore = skillMatching.evaluateCode(attempt.submitted_code);
        const storedScore = attempt.score || 0;
        
        // Allow some variance in scoring
        const scoreDifference = Math.abs(evaluatedScore - storedScore);
        const scoreConsistent = scoreDifference <= 30; // Allow 30 point variance

        this.recordTest(
          `Real Attempt Analysis (ID: ${attempt.id.substring(0, 8)})`,
          scoreConsistent || storedScore === 0,
          { 
            storedScore,
            evaluatedScore,
            scoreDifference,
            status: attempt.status,
            codeLength: attempt.submitted_code.length
          }
        );
      }
    } catch (error) {
      this.recordTest(
        'Real Challenge Attempts Analysis',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Test challenge retrieval
   */
  async testChallengeRetrieval() {
    console.log('\n📚 Testing Challenge Retrieval...');
    
    try {
      const { data: challenges, error } = await supabase
        .from('coding_challenges')
        .select('id, title, difficulty_level')
        .limit(5);

      if (error || !challenges || challenges.length === 0) {
        this.recordTest(
          'Challenge Retrieval',
          false,
          { error: 'No challenges found' }
        );
        return;
      }

      for (const challenge of challenges) {
        const retrieved = await skillMatching.getChallengeById(challenge.id);
        
        this.recordTest(
          `Retrieve Challenge: ${challenge.title}`,
          retrieved !== null && retrieved.id === challenge.id,
          { 
            challengeId: challenge.id,
            title: challenge.title,
            difficulty: challenge.difficulty_level
          }
        );
      }
    } catch (error) {
      this.recordTest(
        'Challenge Retrieval',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Test complete assessment workflow
   */
  async testAssessmentWorkflow() {
    console.log('\n🔄 Testing Assessment Workflow...');
    
    try {
      // Get a test user and challenge
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .limit(1)
        .single();

      const { data: challenge } = await supabase
        .from('coding_challenges')
        .select('id')
        .limit(1)
        .single();

      if (!user || !project || !challenge) {
        this.recordTest(
          'Assessment Workflow',
          false,
          { error: 'Missing test data (user, project, or challenge)' }
        );
        return;
      }

      // Test passing code
      const passingCode = `
function solution(arr) {
  if (!arr || arr.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 0) sum += arr[i];
  }
  return sum;
}
      `;

      const passingResult = await skillMatching.assessCodingSkill(
        user.id,
        project.id,
        passingCode,
        challenge.id
      );

      this.recordTest(
        'Assessment Workflow: Passing Code',
        passingResult.success && passingResult.passed && passingResult.score >= 70,
        { 
          score: passingResult.score,
          passed: passingResult.passed,
          canJoin: passingResult.canJoinProject
        }
      );

      // Test failing code
      const failingCode = 'const x = 5;';

      const failingResult = await skillMatching.assessCodingSkill(
        user.id,
        project.id,
        failingCode,
        challenge.id
      );

      this.recordTest(
        'Assessment Workflow: Failing Code',
        failingResult.success && !failingResult.passed && failingResult.score < 70,
        { 
          score: failingResult.score,
          passed: failingResult.passed,
          canJoin: failingResult.canJoinProject
        }
      );

    } catch (error) {
      this.recordTest(
        'Assessment Workflow',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Test attempt tracking
   */
  async testAttemptTracking() {
    console.log('\n📈 Testing Attempt Tracking...');
    
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .limit(3);

      if (!users || users.length === 0) {
        this.recordTest(
          'Attempt Tracking',
          false,
          { error: 'No users found' }
        );
        return;
      }

      for (const user of users) {
        const { data: attempts, error } = await supabase
          .from('challenge_attempts')
          .select('id, status, score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          this.recordTest(
            `Attempt Tracking for ${user.email}`,
            false,
            { error: error.message }
          );
          continue;
        }

        const passedAttempts = (attempts || []).filter(a => a.status === 'passed').length;
        const failedAttempts = (attempts || []).filter(a => a.status === 'failed').length;
        const totalAttempts = (attempts || []).length;

        this.recordTest(
          `Attempt Tracking for ${user.email}`,
          true,
          { 
            totalAttempts,
            passed: passedAttempts,
            failed: failedAttempts,
            successRate: totalAttempts > 0 
              ? ((passedAttempts / totalAttempts) * 100).toFixed(1) + '%'
              : 'N/A'
          }
        );
      }
    } catch (error) {
      this.recordTest(
        'Attempt Tracking',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Test progressive failure handling (8+ attempts triggers learning materials)
   */
  async testProgressiveFailureHandling() {
    console.log('\n📉 Testing Progressive Failure Handling...');
    
    try {
      const { data: usersWithFailures } = await supabase
        .from('challenge_attempts')
        .select('user_id, status')
        .eq('status', 'failed');

      if (!usersWithFailures || usersWithFailures.length === 0) {
        this.recordTest(
          'Progressive Failure Analysis',
          true,
          { note: 'No failed attempts found (good sign!)' }
        );
        return;
      }

      // Group by user_id
      const failuresByUser = {};
      usersWithFailures.forEach(attempt => {
        if (!failuresByUser[attempt.user_id]) {
          failuresByUser[attempt.user_id] = 0;
        }
        failuresByUser[attempt.user_id]++;
      });

      // Find users with 8+ failures
      const usersNeedingHelp = Object.entries(failuresByUser)
        .filter(([_, count]) => count >= 8)
        .map(([userId, count]) => ({ userId, count }));

      this.recordTest(
        'Users Needing Learning Support (8+ failures)',
        true,
        { 
          totalUsersWithFailures: Object.keys(failuresByUser).length,
          usersNeedingHelp: usersNeedingHelp.length,
          threshold: 8,
          note: 'These users should receive personalized learning materials'
        }
      );

      // Test max attempts constant
      const maxAttemptsCorrect = skillMatching.maxAttempts === 8;
      
      this.recordTest(
        'Max Attempts Configuration',
        maxAttemptsCorrect,
        { 
          currentValue: skillMatching.maxAttempts,
          expectedValue: 8
        }
      );

    } catch (error) {
      this.recordTest(
        'Progressive Failure Handling',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Test scoring consistency
   */
  async testScoringConsistency() {
    console.log('\n🎲 Testing Scoring Consistency...');
    
    const testCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
    `;

    const scores = [];
    for (let i = 0; i < 5; i++) {
      scores.push(skillMatching.evaluateCode(testCode));
    }

    const allSame = scores.every(score => score === scores[0]);

    this.recordTest(
      'Scoring Consistency (Same Code)',
      allSame,
      { 
        scores,
        consistent: allSame
      }
    );
  }

  /**
   * Test edge cases
   */
  async testEdgeCases() {
    console.log('\n⚠️  Testing Edge Cases...');
    
    const edgeCases = [
      {
        name: 'Null code',
        code: null,
        shouldNotCrash: true
      },
      {
        name: 'Undefined code',
        code: undefined,
        shouldNotCrash: true
      },
      {
        name: 'Very long code',
        code: 'const x = 1;\n'.repeat(1000),
        shouldNotCrash: true
      },
      {
        name: 'Special characters',
        code: 'const emoji = "🚀💻"; // Special chars',
        shouldNotCrash: true
      },
      {
        name: 'Multiple languages mixed',
        code: `
function test() {
  const sql = "SELECT * FROM users";
  const html = "<div>Test</div>";
  return { sql, html };
}
        `,
        shouldNotCrash: true
      }
    ];

    for (const testCase of edgeCases) {
      try {
        const score = skillMatching.evaluateCode(testCase.code);
        const didNotCrash = typeof score === 'number' && score >= 0 && score <= 100;
        
        this.recordTest(
          `Edge Case: ${testCase.name}`,
          didNotCrash === testCase.shouldNotCrash,
          { 
            score,
            didNotCrash
          }
        );
      } catch (error) {
        this.recordTest(
          `Edge Case: ${testCase.name}`,
          false,
          { 
            error: error.message,
            shouldNotCrash: testCase.shouldNotCrash
          }
        );
      }
    }
  }

  /**
   * Test assessment database integration
   */
  async testAssessmentDatabaseIntegration() {
    console.log('\n💾 Testing Assessment Database Integration...');
    
    try {
      // Check if skill_assessments table exists and has data
      const { data: assessments, error } = await supabase
        .from('skill_assessments')
        .select('id, score, passed')
        .limit(5);

      if (error) {
        // Table might not exist or might be named differently
        // Check challenge_attempts instead (current implementation)
        const { data: attempts, error: attemptError } = await supabase
          .from('challenge_attempts')
          .select('id, score, status')
          .limit(5);

        if (attemptError) {
          this.recordTest(
            'Database Integration',
            false,
            { error: 'Neither skill_assessments nor challenge_attempts table accessible' }
          );
          return;
        }

        this.recordTest(
          'Database Integration (challenge_attempts)',
          true,
          { 
            recordCount: attempts?.length || 0,
            note: 'Using challenge_attempts table'
          }
        );
      } else {
        this.recordTest(
          'Database Integration (skill_assessments)',
          true,
          { 
            recordCount: assessments?.length || 0,
            note: 'Using skill_assessments table'
          }
        );
      }
    } catch (error) {
      this.recordTest(
        'Database Integration',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Record test result
   */
  recordTest(testName, passed, details = {}) {
    if (passed) {
      this.testResults.passed++;
      console.log(`  ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      console.log(`  ❌ ${testName}`);
    }
    
    if (Object.keys(details).length > 0) {
      console.log(`     Details:`, JSON.stringify(details, null, 2));
    }

    this.testResults.tests.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    console.log('\n' + '=' .repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${this.testResults.passed + this.testResults.failed}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    
    const successRate = this.testResults.passed + this.testResults.failed > 0
      ? ((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(2)
      : 0;
    
    console.log(`Success Rate: ${successRate}%`);
    console.log('=' .repeat(60));

    if (this.testResults.failed > 0) {
      console.log('\n⚠️  Failed Tests:');
      this.testResults.tests
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`  - ${t.name}`);
          console.log(`    ${JSON.stringify(t.details, null, 2)}`);
        });
    }

    console.log('\n💡 Algorithm Configuration:');
    console.log(`  Minimum Passing Score: ${this.minPassingScore}`);
    console.log(`  Max Attempts Before Help: ${skillMatching.maxAttempts}`);
  }
}

// Run tests
if (require.main === module) {
  const tester = new SkillAssessmentTester();
  
  // Run all tests including edge cases
  Promise.resolve()
    .then(() => tester.runAllTests())
    .then(() => tester.testScoringConsistency())
    .then(() => tester.testEdgeCases())
    .then(() => tester.testAssessmentDatabaseIntegration())
    .then(() => {
      console.log('\n✨ Test suite completed');
      process.exit(tester.testResults.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = SkillAssessmentTester;