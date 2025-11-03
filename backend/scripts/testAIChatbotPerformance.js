// backend/scripts/testAIChatbotPerformance.js
// Comprehensive AI Chatbot Performance Testing Script
// Run: node scripts/testAIChatbotPerformance.js

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

class AIChatbotPerformanceTester {
  constructor() {
    this.genAI = null;
    this.availableModels = [];
    this.testResults = {
      responseTime: [],
      accuracy: [],
      conversation: [],
      projectRecommendations: [],
      projectCreation: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        avgResponseTime: 0,
        accuracyScore: 0,
        conversationScore: 0
      }
    };
    this.testPrompts = this.generateTestPrompts();
  }

  /**
   * Initialize Gemini AI
   */
  async initialize() {
    console.log('\n🚀 INITIALIZING AI CHATBOT PERFORMANCE TESTER');
    console.log('═'.repeat(70));
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    try {
      this.genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
      });

      // Test available models
      const testModels = ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'];
      for (const model of testModels) {
        try {
          await this.genAI.models.generateContent({
            model: model,
            contents: "Hello"
          });
          this.availableModels.push(model);
          console.log(`✅ Model available: ${model}`);
          break; // Use first available model
        } catch (error) {
          console.log(`❌ Model not available: ${model}`);
        }
      }

      if (this.availableModels.length === 0) {
        throw new Error('No compatible Gemini models available');
      }

      console.log(`\n🎯 Using model: ${this.availableModels[0]}`);
      console.log('═'.repeat(70));
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate 50 diverse test prompts
   */
  generateTestPrompts() {
    return {
      // Category 1: General Conversation (10 prompts)
      conversation: [
        "Hi! Who are you?",
        "What can you help me with?",
        "Tell me about yourself",
        "What technologies do you know?",
        "Can you help me learn programming?",
        "What programming languages are popular?",
        "I'm new to coding, where should I start?",
        "Thanks for your help!",
        "What's the best way to learn JavaScript?",
        "How long does it take to become a developer?"
      ],

      // Category 2: Technical Questions (10 prompts)
      technical: [
        "What is the difference between let and const in JavaScript?",
        "Explain async/await in JavaScript",
        "How does useState work in React?",
        "What are REST APIs?",
        "Explain the concept of closures",
        "What is the difference between == and === in JavaScript?",
        "How do I handle errors in async functions?",
        "What are promises in JavaScript?",
        "Explain the concept of callback functions",
        "What is the virtual DOM in React?"
      ],

      // Category 3: Project Recommendations (15 prompts)
      projectRequests: [
        "Generate a beginner JavaScript project idea",
        "I want to build a web application, give me a project idea",
        "Suggest a Python project for beginners",
        "Create a project idea for learning React",
        "I need a full-stack project idea",
        "Generate an easy JavaScript game project",
        "Suggest a data science project for beginners",
        "I want to build a mobile app, give me ideas",
        "Create a project for learning APIs",
        "Generate a JavaScript calculator project",
        "I want to build a todo app with tasks breakdown",
        "Suggest a weather app project with weekly tasks",
        "Create a portfolio website project idea",
        "Generate a quiz game project with implementation steps",
        "I need a CRUD application project idea"
      ],

      // Category 4: Code Help (10 prompts)
      codeHelp: [
        "How do I create a function in JavaScript?",
        "Show me how to fetch data from an API",
        "How do I create a React component?",
        "Help me understand array methods in JavaScript",
        "How do I use map() in JavaScript?",
        "Explain how to use filter() and reduce()",
        "How do I create a form in React?",
        "Show me how to handle button clicks in JavaScript",
        "How do I work with JSON data?",
        "Explain arrow functions with examples"
      ],

      // Category 5: Edge Cases & Complex (5 prompts)
      edgeCases: [
        "Can you generate 3 different project ideas at once?",
        "I want a project that uses JavaScript, Python, and Java together",
        "Create a very complex enterprise-level project for experts",
        "Generate a project with exactly 12 weeks of tasks",
        "I need a project that combines AI, blockchain, and quantum computing"
      ]
    };
  }

  /**
   * Test 1: Response Time Performance
   */
  async testResponseTime() {
    console.log('\n\n📊 TEST 1: RESPONSE TIME PERFORMANCE');
    console.log('═'.repeat(70));
    console.log('Testing chatbot response time across different prompt types');
    console.log('⏱️  FREE TIER MODE: 7-second delays between requests to avoid rate limits\n');

    const allPrompts = [
      ...this.testPrompts.conversation.slice(0, 3),
      ...this.testPrompts.technical.slice(0, 3),
      ...this.testPrompts.projectRequests.slice(0, 3),
      ...this.testPrompts.codeHelp.slice(0, 3)
    ];

    for (let i = 0; i < allPrompts.length; i++) {
      const prompt = allPrompts[i];
      const startTime = Date.now();
      
      try {
        const response = await this.sendMessage(prompt);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const result = {
          promptNumber: i + 1,
          prompt: prompt.substring(0, 50) + '...',
          responseTime,
          success: true,
          responseLength: response.length
        };

        this.testResults.responseTime.push(result);
        this.recordTest('Response Time', true, result);

        console.log(`✅ Prompt ${i + 1}/12: ${responseTime}ms`);
        
        // Add delay to avoid rate limiting (FREE TIER: 10 requests/minute = 6+ seconds between)
        if (i < allPrompts.length - 1) {
          console.log(`   ⏳ Waiting 7 seconds to avoid rate limit...`);
          await this.delay(7000);
        }
      } catch (error) {
        console.log(`❌ Prompt ${i + 1}/12 failed: ${error.message}`);
        this.recordTest('Response Time', false, { prompt, error: error.message });
        
        // If rate limited, wait longer
        if (error.message && error.message.includes('429')) {
          console.log(`   ⏳ Rate limited! Waiting 60 seconds...`);
          await this.delay(60000);
        }
      }
    }

    // Calculate average response time
    const avgTime = this.testResults.responseTime.reduce((sum, r) => sum + r.responseTime, 0) / this.testResults.responseTime.length;
    console.log(`\n📈 Average Response Time: ${avgTime.toFixed(2)}ms`);
    
    // Performance rating
    if (avgTime < 2000) {
      console.log('🎯 EXCELLENT: Response time under 2 seconds');
    } else if (avgTime < 5000) {
      console.log('✅ GOOD: Response time under 5 seconds');
    } else if (avgTime < 10000) {
      console.log('⚠️  ACCEPTABLE: Response time under 10 seconds');
    } else {
      console.log('❌ SLOW: Response time over 10 seconds - needs optimization');
    }
  }

  /**
   * Test 2: Response Accuracy
   */
  async testResponseAccuracy() {
    console.log('\n\n🎯 TEST 2: RESPONSE ACCURACY');
    console.log('═'.repeat(70));
    console.log('Testing if chatbot provides accurate and relevant responses');
    console.log('⏱️  FREE TIER MODE: 7-second delays between requests\n');

    const accuracyTests = [
      {
        prompt: "What is JavaScript?",
        expectedKeywords: ['programming', 'language', 'web', 'browser'],
        category: 'Technical Definition'
      },
      {
        prompt: "Explain React hooks",
        expectedKeywords: ['useState', 'useEffect', 'functional', 'component'],
        category: 'Technical Concept'
      },
      {
        prompt: "What is an API?",
        expectedKeywords: ['application', 'interface', 'communication', 'data'],
        category: 'Technical Definition'
      },
      {
        prompt: "How do I start learning programming?",
        expectedKeywords: ['practice', 'project', 'tutorial', 'language'],
        category: 'Advice'
      },
      {
        prompt: "What are the best programming languages?",
        expectedKeywords: ['JavaScript', 'Python', 'Java', 'depends'],
        category: 'Opinion/Advice'
      }
    ];

    for (let i = 0; i < accuracyTests.length; i++) {
      const test = accuracyTests[i];
      
      try {
        const response = await this.sendMessage(test.prompt);
        const responseLC = response.toLowerCase();
        
        // Check how many expected keywords are in the response
        const foundKeywords = test.expectedKeywords.filter(keyword => 
          responseLC.includes(keyword.toLowerCase())
        );
        
        const accuracyScore = (foundKeywords.length / test.expectedKeywords.length) * 100;
        const passed = accuracyScore >= 50; // At least 50% keywords found

        const result = {
          category: test.category,
          prompt: test.prompt,
          accuracyScore: accuracyScore.toFixed(1) + '%',
          foundKeywords: foundKeywords.length,
          totalKeywords: test.expectedKeywords.length,
          passed
        };

        this.testResults.accuracy.push(result);
        this.recordTest('Accuracy', passed, result);

        console.log(`${passed ? '✅' : '❌'} ${test.category}: ${accuracyScore.toFixed(1)}% accuracy`);
        console.log(`   Found: ${foundKeywords.join(', ')}`);
        
        if (i < accuracyTests.length - 1) {
          console.log(`   ⏳ Waiting 7 seconds...`);
          await this.delay(7000);
        }
      } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
        this.recordTest('Accuracy', false, { test, error: error.message });
        
        if (error.message && error.message.includes('429')) {
          console.log(`   ⏳ Rate limited! Waiting 60 seconds...`);
          await this.delay(60000);
        }
      }
    }

    // Calculate overall accuracy
    const avgAccuracy = this.testResults.accuracy.reduce((sum, r) => sum + parseFloat(r.accuracyScore), 0) / this.testResults.accuracy.length;
    console.log(`\n📊 Average Accuracy Score: ${avgAccuracy.toFixed(1)}%`);
  }

  /**
   * Test 3: Conversational Ability
   */
  async testConversationalAbility() {
    console.log('\n\n💬 TEST 3: CONVERSATIONAL ABILITY');
    console.log('═'.repeat(70));
    console.log('Testing multi-turn conversations and context retention');
    console.log('⏱️  FREE TIER MODE: 7-second delays between requests\n');

    const conversations = [
      {
        name: 'Project Discussion',
        turns: [
          "I want to build a todo app",
          "Should I use React or Vue?",
          "How long will it take to build?",
          "What features should I include?"
        ]
      },
      {
        name: 'Learning Path',
        turns: [
          "I'm new to programming",
          "Which language should I learn first?",
          "Can you recommend projects for beginners?",
          "How do I practice effectively?"
        ]
      },
      {
        name: 'Technical Help',
        turns: [
          "I'm learning JavaScript",
          "What are the important concepts?",
          "Can you explain async programming?",
          "Show me an example"
        ]
      }
    ];

    for (const conversation of conversations) {
      console.log(`\n🗣️  Testing: ${conversation.name}`);
      console.log('─'.repeat(70));
      
      const conversationHistory = [];
      let conversationScore = 0;

      for (let i = 0; i < conversation.turns.length; i++) {
        const userMessage = conversation.turns[i];
        
        try {
          const response = await this.sendMessage(userMessage, conversationHistory);
          
          // Add to history
          conversationHistory.push({ role: 'user', content: userMessage });
          conversationHistory.push({ role: 'assistant', content: response });

          // Check if response is contextual (mentions previous topics)
          const isContextual = i > 0 && this.checkContextRetention(conversationHistory, response);
          
          if (isContextual) conversationScore += 25;
          
          console.log(`   Turn ${i + 1}: ${isContextual ? '✅ Contextual' : '⚠️  Generic'}`);
          
          if (i < conversation.turns.length - 1) {
            console.log(`   ⏳ Waiting 7 seconds...`);
            await this.delay(7000);
          }
        } catch (error) {
          console.log(`   Turn ${i + 1}: ❌ Failed - ${error.message}`);
          
          if (error.message && error.message.includes('429')) {
            console.log(`   ⏳ Rate limited! Waiting 60 seconds...`);
            await this.delay(60000);
          }
        }
      }

      const result = {
        conversation: conversation.name,
        turns: conversation.turns.length,
        score: conversationScore,
        passed: conversationScore >= 50
      };

      this.testResults.conversation.push(result);
      this.recordTest('Conversation', result.passed, result);
      
      console.log(`   📊 Conversation Score: ${conversationScore}/100`);
    }
  }

  /**
   * Test 4: Project Recommendation Quality
   */
  async testProjectRecommendations() {
    console.log('\n\n🎨 TEST 4: PROJECT RECOMMENDATION QUALITY');
    console.log('═'.repeat(70));
    console.log('Testing quality and structure of project recommendations');
    console.log('⏱️  FREE TIER MODE: 7-second delays between requests\n');

    const projectPrompts = this.testPrompts.projectRequests.slice(0, 8);

    for (let i = 0; i < projectPrompts.length; i++) {
      const prompt = projectPrompts[i];
      
      try {
        const response = await this.sendMessage(prompt);
        
        // Check if response has project structure
        const hasTitle = /\*\*[^*]+\*\*/.test(response);
        const hasFeatures = response.includes('Key Features') || response.includes('Features:');
        const hasTechnologies = response.includes('Technologies:');
        const hasDifficulty = response.includes('Difficulty:');
        const hasTimeEstimate = response.includes('Time Estimate:');
        const hasWeeklyTasks = response.includes('Weekly Task Breakdown:') || /Week\s+\d+:/i.test(response);

        const structureScore = [
          hasTitle,
          hasFeatures,
          hasTechnologies,
          hasDifficulty,
          hasTimeEstimate,
          hasWeeklyTasks
        ].filter(Boolean).length;

        const qualityScore = (structureScore / 6) * 100;
        const passed = qualityScore >= 66.67; // At least 4 out of 6 required elements

        const result = {
          promptNumber: i + 1,
          prompt: prompt.substring(0, 50) + '...',
          qualityScore: qualityScore.toFixed(1) + '%',
          hasTitle,
          hasFeatures,
          hasTechnologies,
          hasDifficulty,
          hasTimeEstimate,
          hasWeeklyTasks,
          passed
        };

        this.testResults.projectRecommendations.push(result);
        this.recordTest('Project Recommendation', passed, result);

        console.log(`${passed ? '✅' : '❌'} Project ${i + 1}: ${qualityScore.toFixed(1)}% quality`);
        console.log(`   Title: ${hasTitle ? '✓' : '✗'} | Features: ${hasFeatures ? '✓' : '✗'} | Tech: ${hasTechnologies ? '✓' : '✗'}`);
        console.log(`   Difficulty: ${hasDifficulty ? '✓' : '✗'} | Time: ${hasTimeEstimate ? '✓' : '✗'} | Tasks: ${hasWeeklyTasks ? '✓' : '✗'}`);
        
        if (i < projectPrompts.length - 1) {
          console.log(`   ⏳ Waiting 7 seconds...`);
          await this.delay(7000);
        }
      } catch (error) {
        console.log(`❌ Project ${i + 1} failed: ${error.message}`);
        this.recordTest('Project Recommendation', false, { prompt, error: error.message });
        
        if (error.message && error.message.includes('429')) {
          console.log(`   ⏳ Rate limited! Waiting 60 seconds...`);
          await this.delay(60000);
        }
      }
    }

    // Calculate average quality score
    const avgQuality = this.testResults.projectRecommendations
      .reduce((sum, r) => sum + parseFloat(r.qualityScore), 0) / this.testResults.projectRecommendations.length;
    console.log(`\n📊 Average Project Quality: ${avgQuality.toFixed(1)}%`);
  }

  /**
   * Test 5: Solo Project Creation with Tasks
   */
  async testProjectCreationWithTasks() {
    console.log('\n\n🏗️  TEST 5: SOLO PROJECT CREATION WITH TASKS');
    console.log('═'.repeat(70));
    console.log('Testing complete project creation including weekly task breakdown');
    console.log('⏱️  FREE TIER MODE: 7-second delays between requests\n');

    const projectCreationPrompts = [
      "Generate a beginner Todo List application project with weekly tasks",
      "Create a Weather App project with 4 weeks of tasks",
      "I need a Calculator project with step-by-step weekly breakdown",
      "Generate a Quiz Game project with detailed weekly tasks",
      "Create a Portfolio Website project with implementation schedule"
    ];

    for (let i = 0; i < projectCreationPrompts.length; i++) {
      const prompt = projectCreationPrompts[i];
      
      try {
        const response = await this.sendMessage(prompt);
        
        // Extract project data
        const projectData = this.extractProjectData(response);
        
        // Validate project structure
        const hasValidTitle = projectData.title && projectData.title.length > 0;
        const hasDescription = projectData.description && projectData.description.length > 20;
        const hasTechnology = projectData.programming_languages && projectData.programming_languages.length > 0;
        const hasDifficulty = ['easy', 'medium', 'hard'].includes(projectData.difficulty_level);
        const hasTasks = projectData.tasks && projectData.tasks.length >= 3;
        const tasksHaveSubtasks = projectData.tasks && projectData.tasks.every(t => t.subtasks && t.subtasks.length > 0);

        const validationScore = [
          hasValidTitle,
          hasDescription,
          hasTechnology,
          hasDifficulty,
          hasTasks,
          tasksHaveSubtasks
        ].filter(Boolean).length;

        const creationScore = (validationScore / 6) * 100;
        const passed = creationScore >= 83.33; // At least 5 out of 6 elements

        const result = {
          projectNumber: i + 1,
          prompt: prompt.substring(0, 50) + '...',
          title: projectData.title,
          technology: projectData.programming_languages ? projectData.programming_languages.join(', ') : 'None',
          taskCount: projectData.tasks ? projectData.tasks.length : 0,
          creationScore: creationScore.toFixed(1) + '%',
          hasValidTitle,
          hasDescription,
          hasTechnology,
          hasDifficulty,
          hasTasks,
          tasksHaveSubtasks,
          passed
        };

        this.testResults.projectCreation.push(result);
        this.recordTest('Project Creation', passed, result);

        console.log(`${passed ? '✅' : '❌'} Project ${i + 1}: "${projectData.title}" - ${creationScore.toFixed(1)}%`);
        console.log(`   Tasks: ${projectData.tasks ? projectData.tasks.length : 0} | Technology: ${result.technology}`);
        console.log(`   Structure: Title ${hasValidTitle ? '✓' : '✗'} | Desc ${hasDescription ? '✓' : '✗'} | Tech ${hasTechnology ? '✓' : '✗'} | Diff ${hasDifficulty ? '✓' : '✗'} | Tasks ${hasTasks ? '✓' : '✗'} | Subtasks ${tasksHaveSubtasks ? '✓' : '✗'}`);
        
        if (i < projectCreationPrompts.length - 1) {
          console.log(`   ⏳ Waiting 7 seconds...`);
          await this.delay(7000);
        }
      } catch (error) {
        console.log(`❌ Project ${i + 1} failed: ${error.message}`);
        this.recordTest('Project Creation', false, { prompt, error: error.message });
        
        if (error.message && error.message.includes('429')) {
          console.log(`   ⏳ Rate limited! Waiting 60 seconds...`);
          await this.delay(60000);
        }
      }
    }

    // Calculate average creation score
    const avgCreation = this.testResults.projectCreation
      .reduce((sum, r) => sum + parseFloat(r.creationScore), 0) / this.testResults.projectCreation.length;
    console.log(`\n📊 Average Project Creation Quality: ${avgCreation.toFixed(1)}%`);
  }

  /**
   * Helper: Send message to AI
   */
  async sendMessage(message, conversationHistory = []) {
    const systemPrompt = `You are Sync, a helpful and friendly coding project assistant.

IMPORTANT: You should have natural conversations with users. Only provide structured project suggestions when the user explicitly asks for project ideas or help creating a project.

=== WHEN TO PROVIDE A PROJECT SUGGESTION ===
Only format your response as a structured project when the user asks questions like:
- "Generate a project idea"
- "Help me create a project"
- "I need a coding project"
- "What project should I build?"
- "Suggest a JavaScript project"
- Or similar requests for project ideas

=== PROJECT FORMAT (use ONLY when user asks for a project) ===
**[Project Name]**

[1-2 sentence description]

Key Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Feature 4]

Technologies: [Single programming language - JavaScript, Python, Java, etc.]

Time Estimate: [X weeks]

Difficulty: [Easy/Medium/Hard]

Weekly Task Breakdown:

Week 1: [Task title]
- [Subtask 1]
- [Subtask 2]
- [Subtask 3]

Week 2: [Task title]
- [Subtask 1]
- [Subtask 2]
- [Subtask 3]

Week 3: [Task title]
- [Subtask 1]
- [Subtask 2]
- [Subtask 3]

Week 4: [Task title]
- [Subtask 1]
- [Subtask 2]
- [Subtask 3]

=== CONVERSATION HISTORY ===
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

=== CURRENT USER MESSAGE ===
User: ${message}

Remember: Only use the structured project format when the user is asking for a project idea. Otherwise, have a natural conversation!`;

    const response = await this.genAI.models.generateContent({
      model: this.availableModels[0],
      contents: systemPrompt
    });

    return response.text;
  }

  /**
   * Helper: Extract project data from AI response
   */
  extractProjectData(text) {
    const projectData = {
      title: '',
      description: '',
      detailed_description: '',
      programming_languages: [],
      difficulty_level: 'medium',
      estimated_duration_weeks: null,
      tasks: []
    };

    // Extract title
    const titleMatch = text.match(/\*\*([^*]+)\*\*/);
    if (titleMatch) {
      projectData.title = titleMatch[1].trim();
    }

    // Extract description
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('*') && !line.includes(':') && line.length > 20 && !projectData.description) {
        projectData.description = line;
        projectData.detailed_description = line;
        break;
      }
    }

    // Extract technologies
    const techMatch = text.match(/Technologies?:\s*([^\n]+)/i);
    if (techMatch) {
      const tech = techMatch[1].trim();
      projectData.programming_languages = [this.normalizeProgrammingLanguage(tech)];
    }

    // Extract difficulty
    const diffMatch = text.match(/Difficulty:\s*(Easy|Medium|Hard)/i);
    if (diffMatch) {
      projectData.difficulty_level = diffMatch[1].toLowerCase();
    }

    // Extract time estimate
    const timeMatch = text.match(/Time Estimate:\s*(\d+)/i);
    if (timeMatch) {
      projectData.estimated_duration_weeks = parseInt(timeMatch[1]);
    }

    // Extract weekly tasks
    const weekPattern = /Week\s+(\d+):\s*([^\n]+)((?:\n\s*-\s*[^\n]+)*)/gi;
    let weekMatch;
    
    while ((weekMatch = weekPattern.exec(text)) !== null) {
      const weekNumber = parseInt(weekMatch[1]);
      const taskTitle = weekMatch[2].trim();
      const subtasksText = weekMatch[3];
      
      const subtasks = [];
      const subtaskMatches = subtasksText.matchAll(/\n\s*-\s*([^\n]+)/g);
      for (const subtaskMatch of subtaskMatches) {
        subtasks.push(subtaskMatch[1].trim());
      }

      projectData.tasks.push({
        title: taskTitle,
        description: taskTitle,
        week_number: weekNumber,
        subtasks: subtasks
      });
    }

    return projectData;
  }

  /**
   * Helper: Normalize programming language
   */
  normalizeProgrammingLanguage(langName) {
    if (!langName || typeof langName !== 'string') return 'JavaScript';
    
    const cleaned = langName.toLowerCase().trim();
    const mapping = {
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'c++': 'C++',
      'c#': 'C#',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'typescript': 'TypeScript'
    };

    return mapping[cleaned] || 'JavaScript';
  }

  /**
   * Helper: Check context retention in conversation
   */
  checkContextRetention(history, response) {
    if (history.length < 2) return false;
    
    // Extract key terms from previous messages
    const previousMessages = history.slice(0, -1).map(m => m.content.toLowerCase());
    const keyTerms = [];
    
    previousMessages.forEach(msg => {
      const words = msg.split(/\s+/).filter(w => w.length > 4);
      keyTerms.push(...words);
    });

    // Check if response mentions any previous terms
    const responseLower = response.toLowerCase();
    return keyTerms.some(term => responseLower.includes(term));
  }

  /**
   * Helper: Record test result
   */
  recordTest(testName, passed, details = {}) {
    this.testResults.summary.totalTests++;
    if (passed) {
      this.testResults.summary.passedTests++;
    } else {
      this.testResults.summary.failedTests++;
    }
  }

  /**
   * Helper: Delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    console.log('\n\n📊 COMPREHENSIVE TEST REPORT');
    console.log('═'.repeat(70));
    
    // Calculate metrics
    const avgResponseTime = this.testResults.responseTime.reduce((sum, r) => sum + r.responseTime, 0) / 
      (this.testResults.responseTime.length || 1);
    
    const avgAccuracy = this.testResults.accuracy.reduce((sum, r) => sum + parseFloat(r.accuracyScore), 0) / 
      (this.testResults.accuracy.length || 1);
    
    const avgProjectQuality = this.testResults.projectRecommendations.reduce((sum, r) => sum + parseFloat(r.qualityScore), 0) / 
      (this.testResults.projectRecommendations.length || 1);
    
    const avgProjectCreation = this.testResults.projectCreation.reduce((sum, r) => sum + parseFloat(r.creationScore), 0) / 
      (this.testResults.projectCreation.length || 1);
    
    const conversationPassed = this.testResults.conversation.filter(c => c.passed).length;
    const conversationTotal = this.testResults.conversation.length;
    const conversationScore = (conversationPassed / conversationTotal) * 100;

    // Update summary
    this.testResults.summary.avgResponseTime = avgResponseTime;
    this.testResults.summary.accuracyScore = avgAccuracy;
    this.testResults.summary.conversationScore = conversationScore;

    // Overall score
    const passRate = (this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100;

    console.log('\n📈 PERFORMANCE METRICS');
    console.log('─'.repeat(70));
    console.log(`Total Tests Run: ${this.testResults.summary.totalTests}`);
    console.log(`Passed: ${this.testResults.summary.passedTests} | Failed: ${this.testResults.summary.failedTests}`);
    console.log(`Pass Rate: ${passRate.toFixed(1)}%`);
    console.log('');
    console.log(`⏱️  Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`🎯 Response Accuracy: ${avgAccuracy.toFixed(1)}%`);
    console.log(`💬 Conversation Quality: ${conversationScore.toFixed(1)}%`);
    console.log(`🎨 Project Recommendation Quality: ${avgProjectQuality.toFixed(1)}%`);
    console.log(`🏗️  Project Creation Quality: ${avgProjectCreation.toFixed(1)}%`);

    console.log('\n🎯 DETAILED BREAKDOWN');
    console.log('─'.repeat(70));
    console.log(`\n1️⃣  Response Time Tests: ${this.testResults.responseTime.length}`);
    console.log(`   Range: ${Math.min(...this.testResults.responseTime.map(r => r.responseTime))}ms - ${Math.max(...this.testResults.responseTime.map(r => r.responseTime))}ms`);
    
    console.log(`\n2️⃣  Accuracy Tests: ${this.testResults.accuracy.length}`);
    console.log(`   Passed: ${this.testResults.accuracy.filter(a => a.passed).length}/${this.testResults.accuracy.length}`);
    
    console.log(`\n3️⃣  Conversation Tests: ${this.testResults.conversation.length}`);
    console.log(`   Passed: ${conversationPassed}/${conversationTotal}`);
    
    console.log(`\n4️⃣  Project Recommendation Tests: ${this.testResults.projectRecommendations.length}`);
    console.log(`   Passed: ${this.testResults.projectRecommendations.filter(p => p.passed).length}/${this.testResults.projectRecommendations.length}`);
    
    console.log(`\n5️⃣  Project Creation Tests: ${this.testResults.projectCreation.length}`);
    console.log(`   Passed: ${this.testResults.projectCreation.filter(p => p.passed).length}/${this.testResults.projectCreation.length}`);

    // Overall rating
    console.log('\n🏆 OVERALL PERFORMANCE RATING');
    console.log('─'.repeat(70));
    if (passRate >= 90) {
      console.log('🌟 EXCELLENT: Chatbot performs exceptionally well');
    } else if (passRate >= 75) {
      console.log('✅ GOOD: Chatbot performs well with minor improvements needed');
    } else if (passRate >= 60) {
      console.log('⚠️  ACCEPTABLE: Chatbot works but needs optimization');
    } else {
      console.log('❌ NEEDS IMPROVEMENT: Significant optimization required');
    }

    console.log('\n💡 RECOMMENDATIONS');
    console.log('─'.repeat(70));
    
    if (avgResponseTime > 5000) {
      console.log('• Consider optimizing response time (currently > 5 seconds)');
    }
    
    if (avgAccuracy < 70) {
      console.log('• Improve prompt engineering for better accuracy');
    }
    
    if (conversationScore < 70) {
      console.log('• Enhance conversation history handling for better context retention');
    }
    
    if (avgProjectQuality < 80) {
      console.log('• Refine project generation prompts to include all required sections');
    }
    
    if (avgProjectCreation < 80) {
      console.log('• Improve weekly task breakdown structure and subtask generation');
    }

    console.log('\n═'.repeat(70));

    // Save report to file
    this.saveReportToFile();
  }

  /**
   * Save report to markdown file
   */
  saveReportToFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ai-chatbot-test-report-${timestamp}.md`;
    const filepath = path.join(__dirname, filename);

    let markdown = `# AI Chatbot Performance Test Report\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    markdown += `**Model Used:** ${this.availableModels[0]}\n\n`;
    markdown += `---\n\n`;

    markdown += `## Executive Summary\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Tests | ${this.testResults.summary.totalTests} |\n`;
    markdown += `| Passed | ${this.testResults.summary.passedTests} |\n`;
    markdown += `| Failed | ${this.testResults.summary.failedTests} |\n`;
    markdown += `| Pass Rate | ${((this.testResults.summary.passedTests / this.testResults.summary.totalTests) * 100).toFixed(1)}% |\n`;
    markdown += `| Avg Response Time | ${this.testResults.summary.avgResponseTime.toFixed(2)}ms |\n`;
    markdown += `| Accuracy Score | ${this.testResults.summary.accuracyScore.toFixed(1)}% |\n`;
    markdown += `| Conversation Score | ${this.testResults.summary.conversationScore.toFixed(1)}% |\n\n`;

    markdown += `## Test Categories\n\n`;

    // Response Time
    markdown += `### 1. Response Time Performance\n\n`;
    markdown += `| Test # | Prompt | Response Time | Status |\n`;
    markdown += `|--------|--------|---------------|--------|\n`;
    this.testResults.responseTime.forEach(r => {
      markdown += `| ${r.promptNumber} | ${r.prompt} | ${r.responseTime}ms | ${r.success ? '✅' : '❌'} |\n`;
    });
    markdown += `\n**Average:** ${this.testResults.summary.avgResponseTime.toFixed(2)}ms\n\n`;

    // Accuracy
    markdown += `### 2. Response Accuracy\n\n`;
    markdown += `| Category | Accuracy | Keywords Found | Status |\n`;
    markdown += `|----------|----------|----------------|--------|\n`;
    this.testResults.accuracy.forEach(r => {
      markdown += `| ${r.category} | ${r.accuracyScore} | ${r.foundKeywords}/${r.totalKeywords} | ${r.passed ? '✅' : '❌'} |\n`;
    });
    markdown += `\n**Average Accuracy:** ${this.testResults.summary.accuracyScore.toFixed(1)}%\n\n`;

    // Conversations
    markdown += `### 3. Conversational Ability\n\n`;
    markdown += `| Conversation | Turns | Score | Status |\n`;
    markdown += `|--------------|-------|-------|--------|\n`;
    this.testResults.conversation.forEach(c => {
      markdown += `| ${c.conversation} | ${c.turns} | ${c.score}/100 | ${c.passed ? '✅' : '❌'} |\n`;
    });
    markdown += `\n**Success Rate:** ${this.testResults.summary.conversationScore.toFixed(1)}%\n\n`;

    // Project Recommendations
    markdown += `### 4. Project Recommendations\n\n`;
    markdown += `| # | Quality | Title | Features | Tech | Tasks | Status |\n`;
    markdown += `|---|---------|-------|----------|------|-------|--------|\n`;
    this.testResults.projectRecommendations.forEach(p => {
      markdown += `| ${p.promptNumber} | ${p.qualityScore} | ${p.hasTitle ? '✓' : '✗'} | ${p.hasFeatures ? '✓' : '✗'} | ${p.hasTechnologies ? '✓' : '✗'} | ${p.hasWeeklyTasks ? '✓' : '✗'} | ${p.passed ? '✅' : '❌'} |\n`;
    });
    markdown += `\n`;

    // Project Creation
    markdown += `### 5. Solo Project Creation\n\n`;
    markdown += `| # | Title | Quality | Tasks | Technology | Status |\n`;
    markdown += `|---|-------|---------|-------|------------|--------|\n`;
    this.testResults.projectCreation.forEach(p => {
      markdown += `| ${p.projectNumber} | ${p.title} | ${p.creationScore} | ${p.taskCount} | ${p.technology} | ${p.passed ? '✅' : '❌'} |\n`;
    });
    markdown += `\n`;

    markdown += `## Interpretation\n\n`;
    markdown += `The AI chatbot demonstrates the following characteristics:\n\n`;
    markdown += `- **Response Speed:** ${this.testResults.summary.avgResponseTime < 3000 ? 'Fast' : this.testResults.summary.avgResponseTime < 6000 ? 'Moderate' : 'Slow'} response times suitable for ${this.testResults.summary.avgResponseTime < 3000 ? 'real-time' : 'standard'} user interactions\n`;
    markdown += `- **Accuracy:** ${this.testResults.summary.accuracyScore >= 70 ? 'High' : this.testResults.summary.accuracyScore >= 50 ? 'Moderate' : 'Low'} accuracy in providing relevant information\n`;
    markdown += `- **Conversation:** ${this.testResults.summary.conversationScore >= 70 ? 'Good' : this.testResults.summary.conversationScore >= 50 ? 'Fair' : 'Limited'} context retention across multi-turn conversations\n`;
    markdown += `- **Project Generation:** Capable of generating structured project recommendations with varying completeness\n\n`;

    markdown += `## Recommendations\n\n`;
    markdown += `Based on the test results:\n\n`;
    markdown += `1. **Performance Optimization:** ${this.testResults.summary.avgResponseTime > 5000 ? 'Priority' : 'Maintain current performance'}\n`;
    markdown += `2. **Accuracy Enhancement:** ${this.testResults.summary.accuracyScore < 70 ? 'Needs improvement in prompt engineering' : 'Maintain current quality'}\n`;
    markdown += `3. **Context Retention:** ${this.testResults.summary.conversationScore < 70 ? 'Improve conversation history handling' : 'Acceptable for production'}\n`;
    markdown += `4. **Project Quality:** Ensure all generated projects include required sections (title, features, tech, difficulty, time, tasks)\n\n`;

    try {
      fs.writeFileSync(filepath, markdown);
      console.log(`\n📄 Report saved to: ${filename}`);
    } catch (error) {
      console.error('Error saving report:', error.message);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      await this.initialize();
      
      await this.testResponseTime();
      await this.testResponseAccuracy();
      await this.testConversationalAbility();
      await this.testProjectRecommendations();
      await this.testProjectCreationWithTasks();
      
      this.generateReport();
      
      console.log('\n✨ All tests completed successfully!\n');
      process.exit(0);
    } catch (error) {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    }
  }
}

// Run tests if this is the main module
if (require.main === module) {
  const tester = new AIChatbotPerformanceTester();
  tester.runAllTests();
}

module.exports = AIChatbotPerformanceTester;