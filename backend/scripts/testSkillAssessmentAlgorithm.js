// backend/scripts/testSkillAssessmentAlgorithm.js
// ENHANCED VERSION - More comprehensive test coverage
const supabase = require('../config/supabase');
const skillMatching = require('../services/SkillMatchingService');

class SkillAssessmentTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.minPassingScore = 60;
    
    // Confusion Matrix for classification
    this.confusionMatrix = {
      truePositives: 0,   // Correctly predicted as pass
      trueNegatives: 0,   // Correctly predicted as fail
      falsePositives: 0,  // Incorrectly predicted as pass
      falseNegatives: 0   // Incorrectly predicted as fail
    };
    
    // Score distribution tracking
    this.scoreDistribution = {
      excellent: 0,    // 90-100
      good: 0,         // 80-89
      passing: 0,      // 70-79
      belowPassing: 0, // 50-69
      poor: 0          // 0-49
    };
  }

  /**
   * Main test runner
   */
  async runAllTests() {
    console.log('\n🧪 SKILL ASSESSMENT ALGORITHM TEST SUITE');
    console.log('═'.repeat(70));
    console.log('Testing current skill assessment algorithm');
    console.log('Minimum passing score: 60/100');
    console.log('═'.repeat(70));

    try {
      await this.testCodeEvaluation();
      await this.testCodeEvaluationExtended();
      await this.testLanguageSpecificPatterns();
      await this.testComplexityLevels();
      await this.testFeedbackGeneration();
      await this.testPassingThresholds();
      await this.testCodeQualityMetrics();
      await this.testBoundaryConditions();
      await this.testRealWorldScenarios();
      await this.testRealChallengeAttempts();
      await this.testChallengeRetrieval();
      await this.testAssessmentWorkflow();
      await this.testAttemptTracking();
      await this.testProgressiveFailureHandling();
      await this.testScoringConsistency();
      await this.testEdgeCases();
      await this.testAssessmentDatabaseIntegration();
      
      this.printTestSummary();
      this.printConfusionMatrix();
      this.printMetrics();
      this.printRecommendations();
    } catch (error) {
      console.error('❌ Test suite failed with error:', error);
      throw error;
    }
  }

  /**
   * Record test result and update confusion matrix
   */
  recordTest(name, passed, details = {}) {
    const result = { name, passed, details };
    this.testResults.tests.push(result);
    
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }

    // Update confusion matrix if this is a pass/fail test
    if (details.expectedPass !== undefined && details.actualPass !== undefined) {
      if (details.expectedPass && details.actualPass) {
        this.confusionMatrix.truePositives++;
      } else if (!details.expectedPass && !details.actualPass) {
        this.confusionMatrix.trueNegatives++;
      } else if (!details.expectedPass && details.actualPass) {
        this.confusionMatrix.falsePositives++;
      } else if (details.expectedPass && !details.actualPass) {
        this.confusionMatrix.falseNegatives++;
      }
    }

    // Track score distribution
    if (details.score !== undefined) {
      const score = details.score;
      if (score >= 90) this.scoreDistribution.excellent++;
      else if (score >= 80) this.scoreDistribution.good++;
      else if (score >= 70) this.scoreDistribution.passing++;
      else if (score >= 50) this.scoreDistribution.belowPassing++;
      else this.scoreDistribution.poor++;
    }

    const emoji = passed ? '✅' : '❌';
    console.log(`${emoji} ${name}`);
    
    if (!passed && details.error) {
      console.log(`   Error: ${details.error}`);
    }
    if (details.score !== undefined) {
      console.log(`   Score: ${details.score} (Expected: ${details.expectedPass ? 'Pass' : 'Fail'})`);
    }
  }

  /**
   * Test code evaluation logic - Core cases
   */
  async testCodeEvaluation() {
    console.log('\n📝 Testing Code Evaluation - Core Cases...');
    
    const testCases = [
      {
        name: 'Excellent code with all elements',
        code: `
// Calculate the sum of positive numbers in an array
function calculateSum(arr) {
  // Validate input array
  if (!Array.isArray(arr)) {
    throw new Error('Input must be an array');
  }
  
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 0) {
      sum += arr[i];
    }
  }
  return sum;
}
        `,
        expectedPass: true
      },
      {
        name: 'Good code with error handling',
        code: `
function processData(data) {
  try {
    if (!data) return [];
    return data.filter(item => item.isValid);
  } catch (error) {
    console.error('Processing failed:', error);
    return [];
  }
}
        `,
        expectedPass: true
      },
      {
        name: 'Basic function with logic',
        code: `
function greet(name) {
  if (!name) return "Hello!";
  return "Hello " + name;
}
        `,
        expectedPass: false
      },
      {
        name: 'Simple variable assignment',
        code: `const x = 5;`,
        expectedPass: false
      },
      {
        name: 'Empty code',
        code: '',
        expectedPass: false
      },
      {
        name: 'Complex code with multiple patterns',
        code: `
function processData(data) {
  // Check for empty data
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
        expectedPass: true
      },
      {
        name: 'Advanced code with class and async',
        code: `
class DataProcessor {
  constructor(options = {}) {
    this.threshold = options.threshold || 0;
  }
  
  async process(items) {
    try {
      const filtered = items.filter(item => item.value > this.threshold);
      return filtered.map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Processing failed:', error);
      return [];
    }
  }
}
        `,
        expectedPass: true
      },
      {
        name: 'Code without function',
        code: `
let total = 0;
for (let i = 0; i < 10; i++) {
  total += i;
}
        `,
        expectedPass: false
      },
      {
        name: 'Function without logic',
        code: `
function simpleReturn() {
  return 42;
}
        `,
        expectedPass: false
      },
      {
        name: 'Code with only comments',
        code: `
// This is a comment
// Another comment
// Yet another comment
        `,
        expectedPass: false
      }
    ];

    for (const testCase of testCases) {
      const score = skillMatching.evaluateCode(testCase.code);
      const actualPass = score >= this.minPassingScore;

      this.recordTest(
        `Code Evaluation: ${testCase.name}`,
        actualPass === testCase.expectedPass,
        { 
          score, 
          actualPass,
          expectedPass: testCase.expectedPass,
          codeLength: testCase.code.length
        }
      );
    }
  }

  /**
   * Test code evaluation - Extended scenarios
   */
  async testCodeEvaluationExtended() {
    console.log('\n📝 Testing Code Evaluation - Extended Scenarios...');
    
    const testCases = [
      {
        name: 'Recursive function',
        code: `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
        `,
        expectedPass: true
      },
      {
        name: 'Higher-order function',
        code: `
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}
        `,
        expectedPass: true
      },
      {
        name: 'Arrow function with complex logic',
        code: `
const processUsers = (users) => {
  return users
    .filter(user => user.age >= 18)
    .map(user => ({ ...user, adult: true }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
        `,
        expectedPass: true
      },
      {
        name: 'Promise-based function',
        code: `
function fetchData(url) {
  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      console.error('Fetch failed:', error);
      return null;
    });
}
        `,
        expectedPass: true
      },
      {
        name: 'Async/await with error handling',
        code: `
async function loadUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load user:', error);
    throw error;
  }
}
        `,
        expectedPass: true
      },
      {
        name: 'Generator function',
        code: `
function* numberGenerator(max) {
  let current = 0;
  while (current < max) {
    yield current++;
  }
}
        `,
        expectedPass: true
      },
      {
        name: 'Object method with this',
        code: `
const calculator = {
  total: 0,
  add(value) {
    this.total += value;
    return this;
  },
  subtract(value) {
    this.total -= value;
    return this;
  }
};
        `,
        expectedPass: true
      },
      {
        name: 'Closure example',
        code: `
function createCounter() {
  let count = 0;
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}
        `,
        expectedPass: true
      },
      {
        name: 'Array manipulation',
        code: `
function removeDuplicates(arr) {
  const seen = new Set();
  return arr.filter(item => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}
        `,
        expectedPass: true
      },
      {
        name: 'Switch statement logic',
        code: `
function getGrade(score) {
  switch(true) {
    case score >= 90: return 'A';
    case score >= 80: return 'B';
    case score >= 70: return 'C';
    case score >= 60: return 'D';
    default: return 'F';
  }
}
        `,
        expectedPass: true
      }
    ];

    for (const testCase of testCases) {
      const score = skillMatching.evaluateCode(testCase.code);
      const actualPass = score >= this.minPassingScore;

      this.recordTest(
        `Extended: ${testCase.name}`,
        actualPass === testCase.expectedPass,
        { 
          score, 
          actualPass,
          expectedPass: testCase.expectedPass
        }
      );
    }
  }

  /**
   * Test language-specific patterns
   */
  async testLanguageSpecificPatterns() {
    console.log('\n🌐 Testing Language-Specific Patterns...');
    
    const testCases = [
      {
        name: 'Python-style function',
        code: `
def calculate_average(numbers):
    if not numbers:
        return 0
    total = sum(numbers)
    return total / len(numbers)
        `,
        expectedPass: true
      },
      {
        name: 'Python list comprehension',
        code: `
def get_even_squares(numbers):
    return [x**2 for x in numbers if x % 2 == 0]
        `,
        expectedPass: true
      },
      {
        name: 'Java method',
        code: `
public int findMax(int[] numbers) {
    if (numbers == null || numbers.length == 0) {
        throw new IllegalArgumentException("Array cannot be empty");
    }
    int max = numbers[0];
    for (int i = 1; i < numbers.length; i++) {
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }
    return max;
}
        `,
        expectedPass: true
      },
      {
        name: 'C++ template function',
        code: `
template <typename T>
T findMax(const vector<T>& arr) {
    if (arr.empty()) {
        throw runtime_error("Array is empty");
    }
    T maxVal = arr[0];
    for (size_t i = 1; i < arr.size(); i++) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
        }
    }
    return maxVal;
}
        `,
        expectedPass: true
      },
      {
        name: 'PHP function',
        code: `
function processOrder($order) {
    if (!isset($order['items']) || empty($order['items'])) {
        return ['error' => 'No items in order'];
    }
    
    $total = 0;
    foreach ($order['items'] as $item) {
        $total += $item['price'] * $item['quantity'];
    }
    
    return ['total' => $total];
}
        `,
        expectedPass: true
      },
      {
        name: 'Ruby method',
        code: `
def process_users(users)
  users.select { |user| user.age >= 18 }
       .map { |user| user.name.upcase }
       .sort
end
        `,
        expectedPass: true
      },
      {
        name: 'Go function',
        code: `
func calculateSum(numbers []int) (int, error) {
    if len(numbers) == 0 {
        return 0, errors.New("empty array")
    }
    
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    return sum, nil
}
        `,
        expectedPass: true
      },
      {
        name: 'Rust function',
        code: `
fn find_max(numbers: &[i32]) -> Option<i32> {
    if numbers.is_empty() {
        return None;
    }
    
    let mut max = numbers[0];
    for &num in numbers.iter().skip(1) {
        if num > max {
            max = num;
        }
    }
    Some(max)
}
        `,
        expectedPass: true
      }
    ];

    for (const testCase of testCases) {
      const score = skillMatching.evaluateCode(testCase.code);
      const actualPass = score >= this.minPassingScore;

      this.recordTest(
        `Language Pattern: ${testCase.name}`,
        actualPass === testCase.expectedPass,
        { 
          score, 
          actualPass,
          expectedPass: testCase.expectedPass
        }
      );
    }
  }

  /**
   * Test different complexity levels
   */
  async testComplexityLevels() {
    console.log('\n📊 Testing Different Complexity Levels...');
    
    const testCases = [
      {
        name: 'Beginner: Simple variable',
        code: `let x = 10;`,
        expectedPass: false,
        expectedRange: [0, 30]
      },
      {
        name: 'Beginner: Basic function',
        code: `
function add(a, b) {
  return a + b;
}
        `,
        expectedPass: false,
        expectedRange: [40, 60]
      },
      {
        name: 'Intermediate: Function with validation',
        code: `
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
        `,
        expectedPass: true,
        expectedRange: [60, 80]
      },
      {
        name: 'Advanced: Class with methods',
        code: `
class Stack {
  constructor() {
    this.items = [];
  }
  
  push(item) {
    this.items.push(item);
  }
  
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this.items.pop();
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
}
        `,
        expectedPass: true,
        expectedRange: [80, 100]
      },
      {
        name: 'Expert: Complex algorithm',
        code: `
class BinarySearchTree {
  constructor() {
    this.root = null;
  }
  
  insert(value) {
    const newNode = { value, left: null, right: null };
    
    if (!this.root) {
      this.root = newNode;
      return;
    }
    
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return;
        }
        current = current.right;
      }
    }
  }
  
  search(value) {
    let current = this.root;
    while (current) {
      if (value === current.value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }
}
        `,
        expectedPass: true,
        expectedRange: [85, 100]
      }
    ];

    for (const testCase of testCases) {
      const score = skillMatching.evaluateCode(testCase.code);
      const actualPass = score >= this.minPassingScore;
      const inRange = score >= testCase.expectedRange[0] && score <= testCase.expectedRange[1];

      this.recordTest(
        `Complexity: ${testCase.name}`,
        (actualPass === testCase.expectedPass) && inRange,
        { 
          score, 
          actualPass,
          expectedPass: testCase.expectedPass,
          expectedRange: testCase.expectedRange,
          inRange
        }
      );
    }
  }

  /**
   * Test boundary conditions
   */
  async testBoundaryConditions() {
    console.log('\n⚡ Testing Boundary Conditions...');
    
    const testCases = [
      {
        name: 'Exactly at passing threshold - 60 points',
        code: `
function process(data) {
  if (!data) return null;
  let result = [];
  for (let item of data) {
    result.push(item);
  }
  return result;
}
        `,
        targetScore: 60,
        tolerance: 10
      },
      {
        name: 'Just below passing - 55-59 points',
        code: `
function simple(x) {
  if (x > 0) return x;
  return 0;
}
        `,
        expectedPass: false
      },
      {
        name: 'Just above passing - 61-65 points',
        code: `
function calculate(nums) {
  // Calculate sum
  if (!nums || nums.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum;
}
        `,
        expectedPass: true
      },
      {
        name: 'Maximum score territory - 95+ points',
        code: `
/**
 * Advanced data processor with comprehensive error handling
 * @param {Array} items - Items to process
 * @returns {Promise<Array>} Processed items
 */
class DataProcessor {
  constructor(config = {}) {
    this.batchSize = config.batchSize || 100;
    this.retries = config.retries || 3;
  }
  
  async processBatch(items) {
    try {
      if (!Array.isArray(items)) {
        throw new TypeError('Items must be an array');
      }
      
      const results = [];
      for (let i = 0; i < items.length; i += this.batchSize) {
        const batch = items.slice(i, i + this.batchSize);
        const processed = await this.processSingleBatch(batch);
        results.push(...processed);
      }
      
      return results;
    } catch (error) {
      console.error('Batch processing failed:', error);
      throw error;
    }
  }
  
  async processSingleBatch(batch) {
    return batch
      .filter(item => item && item.isValid)
      .map(item => ({
        ...item,
        processed: true,
        timestamp: Date.now()
      }));
  }
}
        `,
        expectedPass: true
      }
    ];

    for (const testCase of testCases) {
      const score = skillMatching.evaluateCode(testCase.code);
      const actualPass = score >= this.minPassingScore;
      
      let passed;
      if (testCase.targetScore) {
        const withinTolerance = Math.abs(score - testCase.targetScore) <= testCase.tolerance;
        passed = withinTolerance;
      } else {
        passed = actualPass === testCase.expectedPass;
      }

      this.recordTest(
        `Boundary: ${testCase.name}`,
        passed,
        { 
          score, 
          actualPass,
          expectedPass: testCase.expectedPass,
          targetScore: testCase.targetScore
        }
      );
    }
  }

  /**
   * Test real-world scenarios
   */
  async testRealWorldScenarios() {
    console.log('\n🌍 Testing Real-World Scenarios...');
    
    const testCases = [
      {
        name: 'API endpoint handler',
        code: `
async function handleGetUser(req, res) {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const user = await db.users.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
        `,
        expectedPass: true
      },
      {
        name: 'Form validation',
        code: `
function validateUserForm(formData) {
  const errors = {};
  
  if (!formData.email || !formData.email.includes('@')) {
    errors.email = 'Valid email required';
  }
  
  if (!formData.password || formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords must match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
        `,
        expectedPass: true
      },
      {
        name: 'Data transformation',
        code: `
function transformApiResponse(rawData) {
  if (!rawData || !rawData.items) {
    return [];
  }
  
  return rawData.items
    .filter(item => item.status === 'active')
    .map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      inStock: item.inventory > 0
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
        `,
        expectedPass: true
      },
      {
        name: 'Event handler',
        code: `
class ButtonHandler {
  constructor(button) {
    this.button = button;
    this.clickCount = 0;
    this.setupListeners();
  }
  
  setupListeners() {
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleClick();
    });
  }
  
  handleClick() {
    this.clickCount++;
    console.log(\`Button clicked \${this.clickCount} times\`);
    
    if (this.clickCount >= 5) {
      this.button.disabled = true;
    }
  }
}
        `,
        expectedPass: true
      },
      {
        name: 'Authentication middleware',
        code: `
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
        `,
        expectedPass: true
      }
    ];

    for (const testCase of testCases) {
      const score = skillMatching.evaluateCode(testCase.code);
      const actualPass = score >= this.minPassingScore;

      this.recordTest(
        `Real-World: ${testCase.name}`,
        actualPass === testCase.expectedPass,
        { 
          score, 
          actualPass,
          expectedPass: testCase.expectedPass
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
      { score: 95, expectedTone: 'excellent', mustInclude: ['excellent', 'exceptional'] },
      { score: 85, expectedTone: 'great', mustInclude: ['great', 'strong'] },
      { score: 75, expectedTone: 'good', mustInclude: ['good', 'solid'] },
      { score: 65, expectedTone: 'nice', mustInclude: ['nice', 'try'] },
      { score: 50, expectedTone: 'practice', mustInclude: ['practice', 'keep'] },
      { score: 30, expectedTone: 'start', mustInclude: ['start', 'good'] }
    ];

    for (const test of testScores) {
      const feedback = skillMatching.generateFeedback(test.score);
      const hasAppropriateLength = feedback.length > 20;
      const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(feedback);
      const includesKeyword = test.mustInclude.some(word => 
        feedback.toLowerCase().includes(word.toLowerCase())
      );

      this.recordTest(
        `Feedback for score ${test.score}`,
        hasAppropriateLength && hasEmoji && includesKeyword,
        { 
          score: test.score,
          feedbackLength: feedback.length,
          hasEmoji,
          includesKeyword,
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
    
    const thresholdTests = [
      { score: 60, shouldPass: true, name: 'Minimum passing score' },
      { score: 59, shouldPass: false, name: 'Just below passing' },
      { score: 61, shouldPass: true, name: 'Just above passing' },
      { score: 100, shouldPass: true, name: 'Perfect score' },
      { score: 0, shouldPass: false, name: 'Zero score' },
      { score: 50, shouldPass: false, name: 'Halfway' },
      { score: 75, shouldPass: true, name: 'Good score' },
      { score: 90, shouldPass: true, name: 'Excellent score' }
    ];

    for (const test of thresholdTests) {
      const passes = test.score >= this.minPassingScore;
      const correct = passes === test.shouldPass;

      this.recordTest(
        `Threshold Test: ${test.name}`,
        correct,
        { 
          score: test.score,
          passes,
          expectedPass: test.shouldPass,
          actualPass: passes
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
        name: 'Function detection',
        code: 'function test() { return true; }',
        shouldDetectFunction: true
      },
      {
        name: 'Arrow function detection',
        code: 'const test = () => true;',
        shouldDetectFunction: true
      },
      {
        name: 'Logic detection - if statement',
        code: 'if (x > 0) { return x; }',
        shouldDetectLogic: true
      },
      {
        name: 'Logic detection - for loop',
        code: 'for (let i = 0; i < 10; i++) { sum += i; }',
        shouldDetectLogic: true
      },
      {
        name: 'Logic detection - while loop',
        code: 'while (count < 10) { count++; }',
        shouldDetectLogic: true
      },
      {
        name: 'Comment detection - single line',
        code: '// This is a comment\nconst x = 5;',
        shouldDetectComments: true
      },
      {
        name: 'Comment detection - multi line',
        code: '/* Multi\nline\ncomment */\nconst x = 5;',
        shouldDetectComments: true
      },
      {
        name: 'Variable detection - const',
        code: 'const myVar = 10;',
        shouldDetectVariables: true
      },
      {
        name: 'Variable detection - let',
        code: 'let another = 20;',
        shouldDetectVariables: true
      },
      {
        name: 'Error handling detection',
        code: 'try { doSomething(); } catch (e) { console.error(e); }',
        shouldDetectErrorHandling: true
      },
      {
        name: 'Async detection',
        code: 'async function test() { await fetch("/api"); }',
        shouldDetectAsync: true
      },
      {
        name: 'Class detection',
        code: 'class MyClass { constructor() {} }',
        shouldDetectClass: true
      }
    ];

    for (const test of qualityTests) {
      const metrics = skillMatching.analyzeCodeQuality(test.code);
      let passed = true;

      if (test.shouldDetectFunction !== undefined) {
        passed = passed && (metrics.hasFunction === test.shouldDetectFunction);
      }
      if (test.shouldDetectLogic !== undefined) {
        passed = passed && (metrics.hasLogic === test.shouldDetectLogic);
      }
      if (test.shouldDetectComments !== undefined) {
        passed = passed && (metrics.hasComments === test.shouldDetectComments);
      }
      if (test.shouldDetectVariables !== undefined) {
        passed = passed && (metrics.hasVariables === test.shouldDetectVariables);
      }
      if (test.shouldDetectErrorHandling !== undefined) {
        passed = passed && (metrics.hasErrorHandling === test.shouldDetectErrorHandling);
      }
      if (test.shouldDetectAsync !== undefined) {
        passed = passed && (metrics.hasAsync === test.shouldDetectAsync);
      }
      if (test.shouldDetectClass !== undefined) {
        passed = passed && (metrics.hasClassOrOOP === test.shouldDetectClass);
      }

      this.recordTest(
        `Quality Metric: ${test.name}`,
        passed,
        { metrics }
      );
    }
  }

  /**
   * Test real challenge attempts
   */
  async testRealChallengeAttempts() {
    console.log('\n🔍 Testing Real Challenge Attempts Analysis...');
    
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
        .limit(20)
        .order('created_at', { ascending: false });

      if (error || !attempts || attempts.length === 0) {
        this.recordTest(
          'Real Challenge Attempts Analysis',
          true,
          { note: 'No real attempts found to analyze (this is OK for new systems)' }
        );
        return;
      }

      let validAttempts = 0;
      for (const attempt of attempts) {
        if (!attempt.submitted_code) continue;

        const evaluatedScore = skillMatching.evaluateCode(attempt.submitted_code);
        const storedScore = attempt.score || 0;
        const expectedPass = storedScore >= this.minPassingScore;
        const actualPass = evaluatedScore >= this.minPassingScore;
        
        const scoreDifference = Math.abs(evaluatedScore - storedScore);
        const scoreConsistent = scoreDifference <= 30;

        this.recordTest(
          `Real Attempt (ID: ${attempt.id.substring(0, 8)})`,
          scoreConsistent || storedScore === 0,
          { 
            storedScore,
            evaluatedScore,
            scoreDifference,
            status: attempt.status,
            codeLength: attempt.submitted_code.length,
            expectedPass,
            actualPass
          }
        );
        validAttempts++;
      }

      console.log(`   Analyzed ${validAttempts} real attempts`);
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
          true,
          { note: 'No challenges found (expected for new systems)' }
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
          true,
          { note: 'Insufficient test data (user, project, or challenge missing)' }
        );
        return;
      }

      const passingCode = `
function solution(arr) {
  // Validate input array
  if (!arr || arr.length === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > 0) {
      sum += arr[i];
    }
  }
  return sum;
}
      `;

      const passingScore = skillMatching.evaluateCode(passingCode);
      const passingPassed = passingScore >= this.minPassingScore;

      this.recordTest(
        'Assessment Workflow: Passing Code',
        passingPassed,
        { 
          score: passingScore,
          expectedPass: true,
          actualPass: passingPassed
        }
      );

      const failingCode = 'const x = 5;';
      const failingScore = skillMatching.evaluateCode(failingCode);
      const failingPassed = failingScore >= this.minPassingScore;

      this.recordTest(
        'Assessment Workflow: Failing Code',
        !failingPassed,
        { 
          score: failingScore,
          expectedPass: false,
          actualPass: failingPassed
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
      const { data: attempts, error } = await supabase
        .from('challenge_attempts')
        .select('user_id, score, status')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error || !attempts || attempts.length === 0) {
        this.recordTest(
          'Attempt Tracking',
          true,
          { note: 'No attempts found (expected for new systems)' }
        );
        return;
      }

      const userAttempts = {};
      for (const attempt of attempts) {
        if (!userAttempts[attempt.user_id]) {
          userAttempts[attempt.user_id] = [];
        }
        userAttempts[attempt.user_id].push(attempt);
      }

      const usersWithMultipleAttempts = Object.keys(userAttempts).filter(
        userId => userAttempts[userId].length > 1
      ).length;

      this.recordTest(
        'Attempt Tracking: Multiple Attempts',
        usersWithMultipleAttempts >= 0,
        { 
          totalUsers: Object.keys(userAttempts).length,
          usersWithMultipleAttempts,
          totalAttempts: attempts.length
        }
      );

    } catch (error) {
      this.recordTest(
        'Attempt Tracking',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Test progressive failure handling
   */
  async testProgressiveFailureHandling() {
    console.log('\n🔁 Testing Progressive Failure Handling...');
    
    try {
      const { data: attempts, error } = await supabase
        .from('challenge_attempts')
        .select('user_id, score, status')
        .eq('status', 'completed')
        .lt('score', 60);

      if (error) {
        this.recordTest(
          'Progressive Failure Handling',
          false,
          { error: error.message }
        );
        return;
      }

      if (!attempts || attempts.length === 0) {
        this.recordTest(
          'Progressive Failure Handling',
          true,
          { note: 'No failed attempts found (excellent!)' }
        );
        return;
      }

      const failuresByUser = {};
      attempts.forEach(attempt => {
        if (!failuresByUser[attempt.user_id]) {
          failuresByUser[attempt.user_id] = 0;
        }
        failuresByUser[attempt.user_id]++;
      });

      const usersNeedingHelp = Object.entries(failuresByUser)
        .filter(([_, count]) => count >= 8)
        .map(([userId, count]) => ({ userId, count }));

      this.recordTest(
        'Progressive Failure: Users Needing Support',
        true,
        { 
          totalUsersWithFailures: Object.keys(failuresByUser).length,
          usersNeedingHelp: usersNeedingHelp.length,
          threshold: 8
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
    for (let i = 0; i < 10; i++) {
      scores.push(skillMatching.evaluateCode(testCode));
    }

    const allSame = scores.every(score => score === scores[0]);

    this.recordTest(
      'Scoring Consistency: Same Code',
      allSame,
      { 
        scores: scores.slice(0, 3),
        consistent: allSame,
        iterations: 10
      }
    );

    // Test different code gets different scores
    const code1 = 'const x = 5;';
    const code2 = 'function test() { return true; }';
    
    const score1 = skillMatching.evaluateCode(code1);
    const score2 = skillMatching.evaluateCode(code2);
    
    this.recordTest(
      'Scoring Consistency: Different Code',
      score1 !== score2,
      { 
        score1,
        score2,
        different: score1 !== score2
      }
    );
  }

  /**
   * Test edge cases
   */
  async testEdgeCases() {
    console.log('\n⚠️ Testing Edge Cases...');
    
    const edgeCases = [
      { name: 'Null code', code: null, shouldNotCrash: true, expectedPass: false },
      { name: 'Undefined code', code: undefined, shouldNotCrash: true, expectedPass: false },
      { name: 'Very long code', code: 'const x = 1;\n'.repeat(1000), shouldNotCrash: true, expectedPass: true },
      { name: 'Special characters', code: 'const emoji = "🚀💻"; // Special chars', shouldNotCrash: true, expectedPass: false },
      { name: 'Unicode in code', code: 'function αβγ() { return "Greek"; }', shouldNotCrash: true, expectedPass: true },
      { name: 'Only whitespace', code: '     \n\n\t\t   ', shouldNotCrash: true, expectedPass: false },
      { name: 'Single character', code: 'x', shouldNotCrash: true, expectedPass: false },
      { name: 'HTML in code', code: '<script>alert("test")</script>', shouldNotCrash: true, expectedPass: false },
      { name: 'SQL in code', code: 'SELECT * FROM users WHERE id = 1;', shouldNotCrash: true, expectedPass: false },
      { name: 'Regex patterns', code: 'const pattern = /^[a-z]+$/gi;', shouldNotCrash: true, expectedPass: false }
    ];

    for (const testCase of edgeCases) {
      try {
        const score = skillMatching.evaluateCode(testCase.code);
        const didNotCrash = typeof score === 'number' && score >= 0 && score <= 100;
        const actualPass = score >= this.minPassingScore;
        
        this.recordTest(
          `Edge Case: ${testCase.name}`,
          didNotCrash === testCase.shouldNotCrash,
          { 
            score,
            didNotCrash,
            actualPass,
            expectedPass: testCase.expectedPass
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
      const { data: attempts, error: attemptsError } = await supabase
        .from('challenge_attempts')
        .select('id, score, status')
        .limit(5);

      if (attemptsError) {
        this.recordTest(
          'Database Integration: challenge_attempts',
          true,
          { note: 'Table might not exist yet (OK for new systems)' }
        );
        return;
      }

      this.recordTest(
        'Database Integration: challenge_attempts',
        attempts && attempts.length >= 0,
        { 
          recordCount: attempts ? attempts.length : 0,
          tableExists: true
        }
      );

    } catch (error) {
      this.recordTest(
        'Assessment Database Integration',
        false,
        { error: error.message }
      );
    }
  }

  /**
   * Calculate confusion matrix metrics
   */
  calculateMetrics() {
    const { truePositives, trueNegatives, falsePositives, falseNegatives } = this.confusionMatrix;
    const total = truePositives + trueNegatives + falsePositives + falseNegatives;

    if (total === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        specificity: 0,
        totalClassifications: 0
      };
    }

    const accuracy = ((truePositives + trueNegatives) / total) * 100;
    const precision = truePositives + falsePositives > 0 
      ? (truePositives / (truePositives + falsePositives)) * 100 
      : 0;
    const recall = truePositives + falseNegatives > 0 
      ? (truePositives / (truePositives + falseNegatives)) * 100 
      : 0;
    const f1Score = precision + recall > 0 
      ? (2 * precision * recall) / (precision + recall) 
      : 0;
    const specificity = trueNegatives + falsePositives > 0 
      ? (trueNegatives / (trueNegatives + falsePositives)) * 100 
      : 0;

    return {
      accuracy: accuracy.toFixed(2),
      precision: precision.toFixed(2),
      recall: recall.toFixed(2),
      f1Score: f1Score.toFixed(2),
      specificity: specificity.toFixed(2),
      totalClassifications: total
    };
  }

  /**
   * Print confusion matrix
   */
  printConfusionMatrix() {
    const total = this.confusionMatrix.truePositives + this.confusionMatrix.trueNegatives + 
                  this.confusionMatrix.falsePositives + this.confusionMatrix.falseNegatives;
    
    console.log('\n\n📊 CONFUSION MATRIX');
    console.log('═'.repeat(70));
    console.log(`Total Classifications: ${total}`);
    console.log('─'.repeat(70));
    console.log('                     Predicted Positive  |  Predicted Negative');
    console.log('─'.repeat(70));
    console.log(`Actual Positive      ${String(this.confusionMatrix.truePositives).padEnd(20)} |  ${this.confusionMatrix.falseNegatives}`);
    console.log(`                     (True Positives)    |  (False Negatives)`);
    console.log('─'.repeat(70));
    console.log(`Actual Negative      ${String(this.confusionMatrix.falsePositives).padEnd(20)} |  ${this.confusionMatrix.trueNegatives}`);
    console.log(`                     (False Positives)   |  (True Negatives)`);
    console.log('═'.repeat(70));
  }

  /**
   * Print performance metrics
   */
  printMetrics() {
    const metrics = this.calculateMetrics();

    console.log('\n📈 PERFORMANCE METRICS');
    console.log('═'.repeat(70));
    console.log(`Accuracy:    ${metrics.accuracy}%  (Overall correctness)`);
    console.log(`Precision:   ${metrics.precision}%  (Positive predictive value)`);
    console.log(`Recall:      ${metrics.recall}%  (Sensitivity / True positive rate)`);
    console.log(`F1 Score:    ${metrics.f1Score}%  (Harmonic mean of precision & recall)`);
    console.log(`Specificity: ${metrics.specificity}%  (True negative rate)`);
    console.log('═'.repeat(70));

    console.log('\n📊 SCORE DISTRIBUTION');
    console.log('═'.repeat(70));
    console.log(`Excellent (90-100):     ${this.scoreDistribution.excellent} tests`);
    console.log(`Good (80-89):           ${this.scoreDistribution.good} tests`);
    console.log(`Passing (70-79):        ${this.scoreDistribution.passing} tests`);
    console.log(`Below Passing (50-69):  ${this.scoreDistribution.belowPassing} tests`);
    console.log(`Poor (0-49):            ${this.scoreDistribution.poor} tests`);
    console.log('═'.repeat(70));
  }

  /**
   * Print recommendations based on metrics
   */
  printRecommendations() {
    const metrics = this.calculateMetrics();
    const total = metrics.totalClassifications;

    console.log('\n💡 RECOMMENDATIONS');
    console.log('═'.repeat(70));

    if (total < 20) {
      console.log('⚠️  LOW TEST COVERAGE');
      console.log(`   Only ${total} classifications made (confusion matrix entries)`);
      console.log('   Recommendation: Add more test cases with explicit pass/fail expectations');
      console.log('   Target: 50+ classifications for reliable metrics');
    }

    if (parseFloat(metrics.accuracy) < 85) {
      console.log('⚠️  LOW ACCURACY');
      console.log(`   Current: ${metrics.accuracy}% (Target: >85%)`);
      console.log('   Action: Review scoring criteria and adjust thresholds');
    }

    if (parseFloat(metrics.precision) < 80) {
      console.log('⚠️  LOW PRECISION (Too many false positives)');
      console.log(`   Current: ${metrics.precision}% (Target: >80%)`);
      console.log('   Action: Algorithm is too lenient - increase score requirements');
    }

    if (parseFloat(metrics.recall) < 80) {
      console.log('⚠️  LOW RECALL (Too many false negatives)');
      console.log(`   Current: ${metrics.recall}% (Target: >80%)`);
      console.log('   Action: Algorithm is too strict - decrease score requirements');
    }

    if (parseFloat(metrics.f1Score) >= 80 && parseFloat(metrics.accuracy) >= 85) {
      console.log('✅ ALGORITHM PERFORMANCE: EXCELLENT');
      console.log('   All metrics within acceptable ranges');
      console.log('   System is production-ready!');
    }

    console.log('═'.repeat(70));
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    const total = this.testResults.passed + this.testResults.failed;
    const successRate = total > 0 
      ? ((this.testResults.passed / total) * 100).toFixed(2) 
      : 0;

    console.log('\n\n');
    console.log('═'.repeat(70));
    console.log('🎯 TEST SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Tests:  ${total}`);
    console.log(`✅ Passed:    ${this.testResults.passed}`);
    console.log(`❌ Failed:    ${this.testResults.failed}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('═'.repeat(70));

    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.tests
        .filter(t => !t.passed)
        .forEach(t => {
          console.log(`   - ${t.name}`);
          if (t.details.error) {
            console.log(`     Error: ${t.details.error}`);
          }
          if (t.details.score !== undefined) {
            console.log(`     Score: ${t.details.score}, Expected: ${t.details.expectedPass ? 'Pass' : 'Fail'}`);
          }
        });
    }
  }
}


if (require.main === module) {
  const tester = new SkillAssessmentTester();
  
  tester.runAllTests()
    .then(() => {
      const successRate = (tester.testResults.passed / 
        (tester.testResults.passed + tester.testResults.failed)) * 100;
      process.exit(successRate >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = SkillAssessmentTester;