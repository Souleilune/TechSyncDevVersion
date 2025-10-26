// backend/scripts/testJudge0.js
// Run this to test your Judge0 integration: node scripts/testJudge0.js

require('dotenv').config();
const { runTests, testJudge0Connection } = require('../utils/codeEvaluator');

async function main() {
  console.log('🔧 Testing Judge0 Integration...\n');

  // Step 1: Test connection
  console.log('1️⃣ Testing Judge0 Connection:');
  const connectionTest = await testJudge0Connection();
  if (!connectionTest.success) {
    console.error('❌ Connection failed:', connectionTest.error);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check your .env file has JUDGE0_KEY set');
    console.log('   - Verify your RapidAPI subscription is active');
    console.log('   - Make sure JUDGE0_URL is correct');
    return;
  }
  console.log(`✅ Connected! ${connectionTest.languageCount} languages available\n`);

  // Step 2: Test simple JavaScript execution
  console.log('2️⃣ Testing JavaScript Code Execution:');
  try {
    const testCode = `
console.log("Hello World");
console.log("42");
    `.trim();

    const testCases = {
      tests: [
        {
          input: "",
          expected_output: "Hello World\n42"
        }
      ]
    };

    const result = await runTests({
      sourceCode: testCode,
      languageName: 'javascript',
      testCases,
      timeLimitMs: 3000,
      memoryLimitMb: 64
    });

    console.log(`✅ JavaScript test completed:`);
    console.log(`   - Tests passed: ${result.passedCount}/${result.totalCount}`);
    console.log(`   - Total time: ${result.totalTimeMs.toFixed(2)}ms`);
    console.log(`   - Peak memory: ${result.peakMemoryKb}KB\n`);

  } catch (error) {
    console.error('❌ JavaScript test failed:', error.message);
  }

  // Step 3: Test Python execution
  console.log('3️⃣ Testing Python Code Execution:');
  try {
    const pythonCode = `
print("Hello Python")
print(2 + 2)
    `.trim();

    const pythonTestCases = {
      tests: [
        {
          input: "",
          expected_output: "Hello Python\n4"
        }
      ]
    };

    const pythonResult = await runTests({
      sourceCode: pythonCode,
      languageName: 'python',
      testCases: pythonTestCases,
      timeLimitMs: 3000,
      memoryLimitMb: 64
    });

    console.log(`✅ Python test completed:`);
    console.log(`   - Tests passed: ${pythonResult.passedCount}/${pythonResult.totalCount}`);
    console.log(`   - Total time: ${pythonResult.totalTimeMs.toFixed(2)}ms`);
    console.log(`   - Peak memory: ${pythonResult.peakMemoryKb}KB\n`);

  } catch (error) {
    console.error('❌ Python test failed:', error.message);
  }

  // Step 4: Test with multiple test cases
  console.log('4️⃣ Testing Multiple Test Cases:');
  try {
    const fibonacciCode = `
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const n = parseInt(input);
console.log(fibonacci(n));
    `.trim();

    const fibTestCases = {
      tests: [
        { input: "0", expected_output: "0" },
        { input: "1", expected_output: "1" },
        { input: "5", expected_output: "5" },
        { input: "7", expected_output: "13" }
      ]
    };

    const fibResult = await runTests({
      sourceCode: fibonacciCode,
      languageName: 'javascript',
      testCases: fibTestCases,
      timeLimitMs: 5000,
      memoryLimitMb: 128
    });

    console.log(`✅ Fibonacci test completed:`);
    console.log(`   - Tests passed: ${fibResult.passedCount}/${fibResult.totalCount}`);
    console.log(`   - Total time: ${fibResult.totalTimeMs.toFixed(2)}ms`);
    console.log(`   - All tests passed: ${fibResult.allPassed ? 'YES' : 'NO'}\n`);

    // Show individual test results
    fibResult.tests.forEach((test, i) => {
      const status = test.passed ? '✅' : '❌';
      console.log(`   Test ${i + 1} ${status}: Input="${test.input}" Expected="${test.expectedOutput}" Got="${test.actualOutput}"`);
    });

  } catch (error) {
    console.error('❌ Fibonacci test failed:', error.message);
  }

  console.log('\n🎉 Judge0 Integration Test Complete!');
  console.log('\n💡 If all tests passed, your Judge0 integration is working perfectly!');
  console.log('   You can now use real code execution in your challenges.');
}

// Run the test
main().catch(console.error);