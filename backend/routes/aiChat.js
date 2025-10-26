// backend/routes/aiChat.js - ENHANCED WITH TASKS (Based on your existing structure)
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const auth = require('../middleware/auth');
const supabase = require('../config/supabase'); // FIXED: Use supabase instead of database

const router = express.Router();

// Initialize Gemini AI with better error handling
let genAI = null;
let availableModels = [];

const initializeGeminiAI = async () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found. AI features will be disabled.');
      return;
    }

    console.log('Initializing Gemini AI...');
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    
    try {
      const testResponse = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Hello"
      });
      
      console.log('✅ Gemini AI initialized successfully');
      availableModels = ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
      
    } catch (testError) {
      console.error('❌ Error testing Gemini AI:', testError.message);
      
      const alternativeModels = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
      for (const model of alternativeModels) {
        try {
          await genAI.models.generateContent({
            model: model,
            contents: "Hello"
          });
          console.log(`✅ Using alternative model: ${model}`);
          availableModels = [model];
          break;
        } catch (altError) {
          console.log(`❌ Model ${model} not available`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error initializing Gemini AI:', error.message);
    genAI = null;
  }
};

initializeGeminiAI();

const getBestAvailableModel = () => {
  if (!genAI || availableModels.length === 0) {
    return null;
  }
  return availableModels[0];
};

// FIXED: Programming language mapping - EXACT match to your database
const normalizeProgrammingLanguage = (langName) => {
  if (!langName || typeof langName !== 'string') return null;
  
  let cleaned = langName
    .toLowerCase()
    .trim()
    .replace(/^\*\*\s*/, '')
    .replace(/\s*\*\*$/, '')
    .replace(/\*\*/g, '')
    .replace(/[()[```{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const LANGUAGE_MAPPING = {
    'javascript': 'JavaScript',
    'js': 'JavaScript', 
    'react': 'JavaScript',
    'vue': 'JavaScript',
    'angular': 'JavaScript',
    'node': 'JavaScript',
    'nodejs': 'JavaScript',
    'node.js': 'JavaScript',
    'express': 'JavaScript',
    'next': 'JavaScript',
    'nextjs': 'JavaScript',
    'next.js': 'JavaScript',
    'python': 'Python',
    'django': 'Python',
    'flask': 'Python',
    'fastapi': 'Python',
    'java': 'Java',
    'spring': 'Java',
    'c++': 'C++',
    'cpp': 'C++',
    'c': 'C',
    'c#': 'C#',
    'csharp': 'C#',
    'dotnet': 'C#',
    '.net': 'C#',
    'php': 'PHP',
    'laravel': 'PHP',
    'ruby': 'Ruby',
    'rails': 'Ruby',
    'go': 'Go',
    'golang': 'Go',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'CSS',
    'sass': 'CSS',
    'sql': 'SQL',
    'mysql': 'SQL',
    'postgresql': 'SQL',
    'postgres': 'SQL',
    'dart': 'Dart',
    'flutter': 'Dart'
  };

  return LANGUAGE_MAPPING[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Test endpoint
router.get('/test-api', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ error: 'No API key found' });
    }

    if (!genAI) {
      return res.json({ error: 'Gemini AI not initialized' });
    }

    const testResponse = await genAI.models.generateContent({
      model: getBestAvailableModel() || "gemini-2.5-flash",
      contents: "Hello"
    });
    
    res.json({
      success: true,
      apiKeyLength: process.env.GEMINI_API_KEY.length,
      modelsFound: availableModels.length,
      models: availableModels,
      testResponse: testResponse.text
    });
  } catch (error) {
    res.json({
      error: error.message,
      apiKeyExists: !!process.env.GEMINI_API_KEY,
      apiKeyLength: process.env.GEMINI_API_KEY?.length || 0
    });
  }
});

// ENHANCED: AI Chat endpoint with task breakdown support
router.post('/', auth, async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not available',
        error: 'Gemini AI not initialized'
      });
    }

    const modelName = getBestAvailableModel();
    if (!modelName) {
      return res.status(500).json({
        success: false,
        message: 'No available AI models',
        error: 'No compatible models found'
      });
    }

    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    // ENHANCED: Include weekly task breakdown in the prompt
    const systemPrompt = `You are Sync, a helpful coding project assistant.

CRITICAL INSTRUCTION: You MUST respond in this EXACT format. Do NOT skip any sections.

**[Project Name]**

[1-2 sentence description]

Key Features:
• [Feature 1]
• [Feature 2]
• [Feature 3]
• [Feature 4]

Technologies: JavaScript

Time Estimate: 3-4 weeks

Difficulty: Medium

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

MANDATORY RULES:
1. You MUST include the "Weekly Task Breakdown:" section
2. You MUST have exactly 4 weeks labeled "Week 1:", "Week 2:", "Week 3:", "Week 4:"
3. The "Technologies:" line MUST contain ONLY ONE programming language (JavaScript, Python, Java, C++, etc.)
4. DO NOT list features, frameworks, or tools in "Technologies:" - ONLY the base programming language

EXAMPLE RESPONSE:

**Quiz Game Application**

An interactive quiz game where users answer multiple-choice questions and track their score.

Key Features:
• Multiple choice questions with 4 options
• Real-time score tracking
• Timer countdown for each question
• Restart functionality to play again

Technologies: JavaScript

Time Estimate: 3-4 weeks

Difficulty: Medium

Weekly Task Breakdown:

Week 1: Core Game Structure & UI
- Create HTML structure for quiz interface
- Style with CSS for clean design
- Implement basic question display

Week 2: Quiz Logic & Scoring
- Add answer checking functionality
- Implement score tracking system
- Create results screen

Week 3: Timer & Navigation
- Implement countdown timer
- Add next/previous buttons
- Create visual timer indicator

Week 4: Polish & Testing
- Add restart functionality
- Implement question shuffling
- Add animations and test thoroughly

User message: ${message}

REMEMBER: Your response MUST include the "Weekly Task Breakdown:" section with Week 1, Week 2, Week 3, and Week 4.`;

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: systemPrompt
    });

    const aiMessage = response.text;

    res.json({
      success: true,
      data: {
        message: aiMessage,
        timestamp: new Date().toISOString(),
        conversationId: `${userId}_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

// ENHANCED: Project creation with tasks - using Supabase (no raw SQL)
router.post('/create-project', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectData } = req.body;

    console.log('═══════════════════════════════════════════════');
    console.log('🔄 BACKEND RECEIVED CREATE PROJECT REQUEST');
    console.log('═══════════════════════════════════════════════');
    console.log('📥 req.body.projectData:', typeof req.body.projectData);
    console.log('📥 projectData.tasks:', projectData.tasks?.length || 0);
    if (projectData.tasks && Array.isArray(projectData.tasks)) {
      console.log('📋 Received task titles:', projectData.tasks.map(t => t.title));
    } else {
      console.log('⚠️ projectData.tasks is NOT an array or is empty');
      console.log('⚠️ projectData.tasks type:', typeof projectData.tasks);
      console.log('⚠️ projectData.tasks value:', projectData.tasks);
    }
    console.log('═══════════════════════════════════════════════');

    // Step 1: Create main project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        owner_id: userId,
        title: projectData.title.trim(),
        description: projectData.description.trim(),
        detailed_description: projectData.detailed_description || null,
        required_experience_level: projectData.required_experience_level || null,
        maximum_members: projectData.maximum_members || 1,
        estimated_duration_weeks: projectData.estimated_duration_weeks || null,
        difficulty_level: projectData.difficulty_level || null,
        github_repo_url: projectData.github_repo_url || null,
        deadline: projectData.deadline || null,
        status: 'recruiting'
      })
      .select()
      .single();

    if (projectError) {
      console.error('💥 Error creating project:', projectError);
      throw projectError;
    }

    const projectId = project.id;
    console.log('✅ Project created:', projectId);

    // Step 2: Get ALL existing programming languages
    const { data: existingLanguages, error: langError } = await supabase
      .from('programming_languages')
      .select('id, name')
      .eq('is_active', true)
      .order('id');

    if (langError) {
      console.error('Error fetching languages:', langError);
    }

    console.log('📊 Database has', existingLanguages?.length || 0, 'active languages');

    const langByName = new Map();
    const langByLowerName = new Map();
    
    if (existingLanguages) {
      existingLanguages.forEach(lang => {
        langByName.set(lang.name, lang);
        langByLowerName.set(lang.name.toLowerCase(), lang);
      });
    }

    // Step 3: Process programming languages (your existing strict logic)
    const languagesAdded = [];
    const processedNames = new Set();

    if (projectData.programming_languages && Array.isArray(projectData.programming_languages)) {
      console.log('Processing languages:', projectData.programming_languages);
      
      for (const rawLangName of projectData.programming_languages) {
        if (!rawLangName || typeof rawLangName !== 'string') continue;

        const cleanedName = rawLangName
          .trim()
          .replace(/^\*\*\s*/, '')
          .replace(/\s*\*\*$/, '')
          .replace(/\*\*/g, '')
          .replace(/[()[```{}]/g, '')
          .trim();

        const normalizedName = normalizeProgrammingLanguage(cleanedName);

        if (processedNames.has(normalizedName?.toLowerCase())) {
          continue;
        }

        let dbLang = langByName.get(normalizedName);
        if (!dbLang) {
          dbLang = langByLowerName.get(normalizedName?.toLowerCase());
        }

        if (dbLang) {
          console.log(`✓ FOUND in database: "${normalizedName}" -> ID:${dbLang.id}`);
          
          processedNames.add(normalizedName.toLowerCase());
          const isPrimary = languagesAdded.length === 0;
          
          try {
            const { error: linkError } = await supabase
              .from('project_languages')
              .insert({
                project_id: projectId,
                language_id: dbLang.id,
                is_primary: isPrimary,
                required_level: 'intermediate'
              });

            if (linkError) {
              console.error(`Error linking language "${dbLang.name}":`, linkError);
            } else {
              languagesAdded.push({
                id: dbLang.id,
                name: dbLang.name,
                is_primary: isPrimary
              });
            }
          } catch (linkError) {
            console.error(`Error linking language "${dbLang.name}":`, linkError);
          }
        } else {
          console.log(`X NOT FOUND in database: "${normalizedName}"`);
          console.log('X SKIPPING - WILL NOT CREATE NEW LANGUAGE');
        }
      }
    }

    // Step 4: Ensure at least one language (default to JavaScript)
    if (languagesAdded.length === 0) {
      console.log('⚠️ No languages added, adding default JavaScript...');
      
      const jsLang = langByName.get('JavaScript') || langByLowerName.get('javascript');
      if (jsLang) {
        const { error: jsError } = await supabase
          .from('project_languages')
          .insert({
            project_id: projectId,
            language_id: jsLang.id,
            is_primary: true,
            required_level: 'intermediate'
          });

        if (!jsError) {
          languagesAdded.push({
            id: jsLang.id,
            name: jsLang.name,
            is_primary: true
          });
          console.log('✅ Added default JavaScript');
        }
      }
    }

    console.log('🎉 Final languages added:', languagesAdded.map(l => `${l.name}${l.is_primary ? '(primary)' : ''}`));

    // Step 5: Handle topics (can create new ones)
    if (projectData.topics && Array.isArray(projectData.topics)) {
      for (let i = 0; i < projectData.topics.length; i++) {
        const topicName = projectData.topics[i];
        if (!topicName || typeof topicName !== 'string') continue;

        // Find or create topic
        let { data: topic, error: topicFindError } = await supabase
          .from('topics')
          .select('id')
          .ilike('name', topicName.trim())
          .single();

        if (topicFindError || !topic) {
          const { data: newTopic, error: topicCreateError } = await supabase
            .from('topics')
            .insert({
              name: topicName.trim(),
              is_predefined: false,
              created_by: userId
            })
            .select()
            .single();

          if (!topicCreateError) {
            topic = newTopic;
          }
        }

        if (topic) {
          await supabase
            .from('project_topics')
            .insert({
              project_id: projectId,
              topic_id: topic.id,
              is_primary: i === 0
            });
        }
      }
    }

    // Step 6: NEW - Create tasks/goals from AI suggestion
    if (projectData.tasks && Array.isArray(projectData.tasks) && projectData.tasks.length > 0) {
      console.log(`📋 Creating ${projectData.tasks.length} tasks for project...`);
      
      const tasksToInsert = projectData.tasks.map(task => ({
        project_id: projectId,
        user_id: userId,
        title: task.title,
        description: task.description || '',
        status: 'active', // FIXED: Changed from 'todo' to 'active' to match your UI
        priority: task.priority || 'medium',
        category: task.category || 'learning',
        estimated_hours: task.estimated_hours || null,
        target_date: task.target_date || null
      }));

      const { error: tasksError } = await supabase
        .from('solo_project_goals')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('💥 Error creating tasks:', tasksError);
      } else {
        console.log('✅ Tasks created successfully');
      }
    }

    // Step 7: Create project member
    const { error: memberError } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: userId,
        role: 'owner',
        status: 'active'
      });

    if (memberError) {
      console.error('Error creating project member:', memberError);
    }

    // Step 8: Create notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        project_id: projectId,
        notification_type: 'project_created',
        title: 'Project Created Successfully',
        message: `Your project "${projectData.title}" has been created!`
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // Step 9: Fetch complete project with relations
    const { data: completeProject, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        users!projects_owner_id_fkey (
          username,
          email
        ),
        project_languages (
          id,
          is_primary,
          required_level,
          programming_languages (id, name)
        ),
        project_topics (
          id,
          is_primary,
          topics (id, name)
        )
      `)
      .eq('id', projectId)
      .single();

    if (fetchError) {
      console.error('Error fetching complete project:', fetchError);
    }

    console.log('🎉 Project created successfully with tasks!');

    res.json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: completeProject || project
      }
    });

  } catch (error) {
    console.error('💥 Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
});

// Generate project ideas endpoint (your existing code)
router.post('/generate-project', auth, async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not available',
        error: 'Gemini AI not initialized'
      });
    }

    const modelName = getBestAvailableModel();
    if (!modelName) {
      return res.status(500).json({
        success: false,
        message: 'No available AI models',
        error: 'No compatible models found'
      });
    }

    const { skills = [], interests = [], difficulty = 'easy', projectType = 'web' } = req.body;

    const projectPrompt = `Generate 1 ${difficulty} ${projectType} project idea for a beginner:

Requirements:
- Use ONLY JavaScript as the technology (no React, Node.js, or frameworks)
- Make it simple and achievable for beginners
- Format clearly with sections

Format:
**Project Name**
Brief description (2-3 sentences)
Key Features: 
• Feature 1
• Feature 2  
• Feature 3
Technologies: JavaScript
Time Estimate: 1-2 weeks
Difficulty: Easy

Focus on: ${skills.join(', ') || 'general web development'}
Interest: ${interests.join(', ') || 'learning programming'}`;

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: projectPrompt
    });

    const aiResponse = response.text;

    let projects = [];
    try {
      const lines = aiResponse.split('\n').filter(line => line.trim());
      
      let name = '';
      let description = '';
      let technologies = ['JavaScript'];
      let timeEstimate = '1-2 weeks';
      let difficulty = 'Easy';
      
      for (const line of lines) {
        if (line.startsWith('**') && line.endsWith('**')) {
          name = line.replace(/\*\*/g, '').trim();
        } else if (line.includes('Technologies:')) {
          const tech = line.replace('Technologies:', '').trim();
          technologies = tech ? [tech] : ['JavaScript'];
        } else if (line.includes('Time Estimate:')) {
          timeEstimate = line.replace('Time Estimate:', '').trim();
        } else if (line.includes('Difficulty:')) {
          difficulty = line.replace('Difficulty:', '').trim();
        } else if (!line.startsWith('•') && !line.includes(':') && line.length > 10 && !description) {
          description = line.trim();
        }
      }

      projects = [{
        name: name || 'JavaScript Project',
        description: description || 'A simple JavaScript project for beginners',
        technologies,
        timeEstimate,
        difficulty
      }];

    } catch (parseError) {
      console.error('Parse error:', parseError);
      projects = [{
        name: "Simple JavaScript Project",
        description: "A beginner-friendly JavaScript project",
        technologies: ["JavaScript"],
        timeEstimate: "1-2 weeks",
        difficulty: "Easy"
      }];
    }

    res.json({
      success: true,
      data: {
        projects,
        rawResponse: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate project ideas',
      error: error.message
    });
  }
});

module.exports = router;