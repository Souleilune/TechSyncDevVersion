// backend/scripts/testRecommendationAlgorithm.js
const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');

class RecommendationAlgorithmTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Main test runner
   */
  async runAllTests() {
    console.log('\n🧪 RECOMMENDATION ALGORITHM TEST SUITE');
    console.log('=' .repeat(60));
    console.log('Testing current enhanced recommendation algorithm');
    console.log('Algorithm version: 2.0-enhanced');
    console.log('=' .repeat(60));

    try {
      await this.testTopicCoverageScoring();
      await this.testLanguageProficiencyScoring();
      await this.testDifficultyAlignmentScoring();
      await this.testAggregateScoring();
      await this.testRecommendationGeneration();
      await this.testScoreThresholds();
      await this.testMatchFactorsGeneration();
      await this.testDiversityReRanking();
      await this.testRealUserRecommendations();
      
      this.printTestSummary();
    } catch (error) {
      console.error('❌ Test suite failed with error:', error);
      throw error;
    }
  }

  /**
   * Test topic coverage scoring
   */
  async testTopicCoverageScoring() {
    console.log('\n📊 Testing Topic Coverage Scoring...');
    
    const testCases = [
      {
        name: 'Perfect match with primary topic',
        userTopics: [
          { topics: { name: 'Web Development' }, experience_level: 4, interest_level: 5 }
        ],
        projectTopics: [
          { topics: { name: 'Web Development' }, is_primary: true }
        ],
        expectedMinScore: 85
      },
      {
        name: 'Partial match with missing primary',
        userTopics: [
          { topics: { name: 'Backend Development' }, experience_level: 3, interest_level: 4 }
        ],
        projectTopics: [
          { topics: { name: 'Web Development' }, is_primary: true },
          { topics: { name: 'Backend Development' }, is_primary: false }
        ],
        expectedMinScore: 30
      },
      {
        name: 'No matching topics',
        userTopics: [
          { topics: { name: 'Mobile Development' }, experience_level: 3, interest_level: 4 }
        ],
        projectTopics: [
          { topics: { name: 'Web Development' }, is_primary: true }
        ],
        expectedMinScore: 0,
        expectedMaxScore: 5
      }
    ];

    for (const testCase of testCases) {
      const result = skillMatching.topicCoverageScore(
        testCase.userTopics,
        testCase.projectTopics
      );

      const passed = result.score >= testCase.expectedMinScore && 
                     (!testCase.expectedMaxScore || result.score <= testCase.expectedMaxScore);

      this.recordTest(
        `Topic Coverage: ${testCase.name}`,
        passed,
        { 
          score: result.score, 
          expectedMin: testCase.expectedMinScore,
          matches: result.matches.length,
          missing: result.missing.length
        }
      );
    }
  }

  /**
   * Test language proficiency scoring
   */
  async testLanguageProficiencyScoring() {
    console.log('\n💻 Testing Language Proficiency Scoring...');
    
    const testCases = [
      {
        name: 'Expert in required primary language',
        userLangs: [
          { 
            programming_languages: { name: 'JavaScript' }, 
            proficiency_level: 'expert', 
            years_experience: 5 
          }
        ],
        projectLangs: [
          { 
            programming_languages: { name: 'JavaScript' }, 
            required_level: 'intermediate',
            is_primary: true 
          }
        ],
        expectedMinScore: 90
      },
      {
        name: 'Below required proficiency',
        userLangs: [
          { 
            programming_languages: { name: 'Python' }, 
            proficiency_level: 'beginner', 
            years_experience: 1 
          }
        ],
        projectLangs: [
          { 
            programming_languages: { name: 'Python' }, 
            required_level: 'advanced',
            is_primary: true 
          }
        ],
        expectedMinScore: 0,
        expectedMaxScore: 40
      },
      {
        name: 'Missing required language',
        userLangs: [
          { 
            programming_languages: { name: 'JavaScript' }, 
            proficiency_level: 'expert', 
            years_experience: 5 
          }
        ],
        projectLangs: [
          { 
            programming_languages: { name: 'Python' }, 
            required_level: 'intermediate',
            is_primary: true 
          }
        ],
        expectedMinScore: 0,
        expectedMaxScore: 20
      }
    ];

    for (const testCase of testCases) {
      const result = skillMatching.languageProficiencyScore(
        testCase.userLangs,
        testCase.projectLangs
      );

      const passed = result.score >= testCase.expectedMinScore && 
                     (!testCase.expectedMaxScore || result.score <= testCase.expectedMaxScore);

      this.recordTest(
        `Language Proficiency: ${testCase.name}`,
        passed,
        { 
          score: result.score, 
          expectedMin: testCase.expectedMinScore,
          matches: result.matches.length,
          gaps: result.gaps.length,
          coverage: result.coverage
        }
      );
    }
  }

  /**
   * Test difficulty alignment scoring
   */
  async testDifficultyAlignmentScoring() {
    console.log('\n🎯 Testing Difficulty Alignment Scoring...');
    
    const testCases = [
      {
        name: 'User exceeds requirement',
        userYears: 5,
        requiredLevel: 'intermediate',
        expectedScore: 100
      },
      {
        name: 'User meets exact requirement',
        userYears: 3,
        requiredLevel: 'intermediate',
        expectedScore: 100
      },
      {
        name: 'User below requirement',
        userYears: 0.5,
        requiredLevel: 'advanced',
        expectedMinScore: 30,
        expectedMaxScore: 60
      }
    ];

    for (const testCase of testCases) {
      const score = skillMatching.difficultyAlignmentScore(
        testCase.userYears,
        testCase.requiredLevel
      );

      const passed = testCase.expectedScore 
        ? score === testCase.expectedScore
        : score >= testCase.expectedMinScore && score <= testCase.expectedMaxScore;

      this.recordTest(
        `Difficulty Alignment: ${testCase.name}`,
        passed,
        { 
          score, 
          userYears: testCase.userYears,
          required: testCase.requiredLevel 
        }
      );
    }
  }

  /**
   * Test aggregate scoring with weights
   */
  async testAggregateScoring() {
    console.log('\n⚖️  Testing Aggregate Score Calculation...');
    
    const testFeatures = {
      topic: { score: 80 },
      lang: { score: 70 },
      diff: 90
    };

    const score = skillMatching.aggregateScore(testFeatures);
    
    // Calculate expected score manually
    const expectedScore = 
      skillMatching.weights.topicCoverage * 80 +
      skillMatching.weights.languageProficiency * 70 +
      skillMatching.weights.difficultyAlignment * 90;

    const passed = Math.abs(score - expectedScore) < 1;

    this.recordTest(
      'Aggregate Score Calculation',
      passed,
      { 
        calculatedScore: score, 
        expectedScore,
        weights: skillMatching.weights 
      }
    );
  }

  /**
   * Test recommendation generation with real users
   */
  async testRecommendationGeneration() {
    console.log('\n🔍 Testing Recommendation Generation...');
    
    try {
      // Get a sample user
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .limit(5);

      if (userError || !users || users.length === 0) {
        this.recordTest(
          'Recommendation Generation',
          false,
          { error: 'No users found for testing' }
        );
        return;
      }

      for (const user of users) {
        try {
          const recommendations = await skillMatching.recommendProjects(user.id, { limit: 10 });
          
          const allScoresValid = recommendations.every(rec => 
            rec.score >= skillMatching.threshold && rec.score <= 100
          );

          const hasRequiredFields = recommendations.every(rec => 
            rec.projectId && rec.score && rec.title && rec.matchFactors
          );

          this.recordTest(
            `Generate Recommendations for User ${user.email}`,
            allScoresValid && hasRequiredFields,
            { 
              recommendationCount: recommendations.length,
              avgScore: recommendations.length > 0 
                ? Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length)
                : 0,
              minScore: recommendations.length > 0 ? Math.min(...recommendations.map(r => r.score)) : 0,
              maxScore: recommendations.length > 0 ? Math.max(...recommendations.map(r => r.score)) : 0
            }
          );
        } catch (error) {
          this.recordTest(
            `Generate Recommendations for User ${user.email}`,
            false,
            { error: error.message }
          );
        }
      }
    } catch (error) {
      this.recordTest(
        'Recommendation Generation',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Test score thresholds
   */
  async testScoreThresholds() {
    console.log('\n🎚️  Testing Score Thresholds...');
    
    const currentThreshold = skillMatching.threshold;
    
    this.recordTest(
      'Threshold Configuration',
      currentThreshold === 55,
      { 
        currentThreshold,
        expectedThreshold: 55,
        note: 'Ensures only quality matches are recommended'
      }
    );
  }

  /**
   * Test match factors generation
   */
  async testMatchFactorsGeneration() {
    console.log('\n🧩 Testing Match Factors Generation...');
    
    try {
      const { data: users } = await supabase
        .from('users')
        .select(`
          id, years_experience,
          topics:user_topics(topics(name), experience_level, interest_level),
          programming_languages:user_programming_languages(
            programming_languages(name), 
            proficiency_level, 
            years_experience
          )
        `)
        .limit(1)
        .single();

      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id, title, required_experience_level,
          project_topics(topics(name), is_primary),
          project_languages:project_programming_languages(
            programming_languages(name), 
            required_level, 
            is_primary
          )
        `)
        .limit(1)
        .single();

      if (users && projects) {
        const features = skillMatching.computeFeatures(users, projects);
        const matchFactors = skillMatching.buildMatchFactors(users, projects, features);

        const hasRequiredFields = 
          matchFactors.topicMatches !== undefined &&
          matchFactors.languageMatches !== undefined &&
          matchFactors.experienceLevel !== undefined;

        this.recordTest(
          'Match Factors Structure',
          hasRequiredFields,
          { 
            matchFactors: JSON.stringify(matchFactors, null, 2).substring(0, 200) + '...'
          }
        );
      }
    } catch (error) {
      this.recordTest(
        'Match Factors Generation',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Test diversity re-ranking
   */
  async testDiversityReRanking() {
    console.log('\n🎲 Testing Diversity Re-Ranking...');
    
    const mockRecommendations = [
      { score: 90, technologies: ['JavaScript', 'React', 'Node.js'] },
      { score: 88, technologies: ['JavaScript', 'React', 'Express'] },
      { score: 85, technologies: ['Python', 'Django', 'PostgreSQL'] },
      { score: 82, technologies: ['Java', 'Spring', 'MySQL'] }
    ];

    const reranked = skillMatching.diversityReRank(mockRecommendations, 0.25);

    // Check that order changed (diversity was considered)
    const orderChanged = JSON.stringify(reranked) !== JSON.stringify(mockRecommendations);

    this.recordTest(
      'Diversity Re-Ranking Applied',
      orderChanged || reranked.length === 0,
      { 
        originalFirst: mockRecommendations[0]?.technologies,
        rerankedFirst: reranked[0]?.technologies,
        note: 'Should balance relevance with diversity'
      }
    );
  }

  /**
   * Test with real user data
   */
  async testRealUserRecommendations() {
    console.log('\n👤 Testing with Real User Data...');
    
    try {
      const { data: activeUsers } = await supabase
        .from('users')
        .select('id, email')
        .limit(3);

      if (!activeUsers || activeUsers.length === 0) {
        this.recordTest(
          'Real User Recommendations',
          false,
          { error: 'No active users found' }
        );
        return;
      }

      for (const user of activeUsers) {
        const recommendations = await skillMatching.recommendProjects(user.id, { limit: 5 });
        
        const meetsThreshold = recommendations.every(rec => rec.score >= skillMatching.threshold);
        const sortedByScore = recommendations.every((rec, i) => 
          i === 0 || rec.score <= recommendations[i - 1].score
        );

        this.recordTest(
          `Real Recommendations - ${user.email}`,
          meetsThreshold && sortedByScore,
          { 
            count: recommendations.length,
            scores: recommendations.map(r => r.score).join(', ')
          }
        );
      }
    } catch (error) {
      this.recordTest(
        'Real User Recommendations',
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
      console.log(`     Details:`, details);
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
    console.log(`Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(2)}%`);
    console.log('=' .repeat(60));

    if (this.testResults.failed > 0) {
      console.log('\n⚠️  Failed Tests:');
      this.testResults.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`  - ${t.name}: ${JSON.stringify(t.details)}`));
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new RecommendationAlgorithmTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n✨ Test suite completed');
      process.exit(tester.testResults.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = RecommendationAlgorithmTester;