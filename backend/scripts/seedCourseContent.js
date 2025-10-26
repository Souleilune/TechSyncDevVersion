// backend/scripts/seedCourseContent.js
require('dotenv').config();

// Validate environment variables
if (!process.env.SUPABASE_URL) {
    console.error('❌ SUPABASE_URL is required in .env file');
    process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY is required in .env file');
    process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class CourseSeeder {
    constructor() {
        this.adminUserId = null;
    }

    async seedCourses() {
        try {
            console.log('🌱 Starting course content seeding...\n');

            await this.testConnection();
            await this.getOrCreateAdminUser();
            
            // Clear existing course data (optional - comment out if you want to keep existing data)
            await this.clearExistingCourses();

            // Seed courses
            await this.seedJavaScriptCourse();
            await this.seedReactCourse();
            await this.seedNodeJSCourse();

            console.log('\n✅ Course content seeding completed successfully!');
            
        } catch (error) {
            console.error('❌ Error seeding courses:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('count', { count: 'exact', head: true });
            
            if (error) throw error;
            console.log('✅ Supabase connection successful\n');
        } catch (error) {
            console.error('❌ Supabase connection failed:', error.message);
            throw new Error('Cannot connect to Supabase. Check your configuration.');
        }
    }

    async getOrCreateAdminUser() {
        try {
            // Try to find existing admin user
            const { data: users } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'admin')
                .limit(1);

            if (users && users.length > 0) {
                this.adminUserId = users[0].id;
                console.log('✅ Using existing admin user:', this.adminUserId);
            } else {
                // Create a seed admin user
                const { data: newUser, error } = await supabase
                    .from('users')
                    .insert([{
                        username: 'course_admin',
                        email: 'admin@courses.com',
                        password_hash: 'placeholder_hash', // In production, use bcrypt
                        role: 'admin',
                        full_name: 'Course Administrator'
                    }])
                    .select()
                    .single();

                if (error) throw error;
                this.adminUserId = newUser.id;
                console.log('✅ Created admin user:', this.adminUserId);
            }
        } catch (error) {
            console.error('❌ Error with admin user:', error);
            throw error;
        }
    }

    async clearExistingCourses() {
        console.log('🧹 Clearing existing course data...');
        
        // Delete in reverse order of dependencies
        await supabase.from('user_lesson_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('user_course_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('course_lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('course_modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        console.log('✅ Existing course data cleared\n');
    }

    async seedJavaScriptCourse() {
        console.log('📚 Seeding JavaScript Fundamentals Course...');

        // Create course
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert([{
                title: 'JavaScript Fundamentals',
                slug: 'javascript-fundamentals-v2', // Changed slug
                description: 'Master the core concepts of JavaScript programming. Learn variables, functions, objects, arrays, and modern ES6+ features.',
                short_description: 'Learn JavaScript from scratch with hands-on examples',
                level: 'Beginner',
                category: 'Programming',
                icon_emoji: '🟨',
                estimated_duration_hours: 12,
                total_modules: 4,
                total_lessons: 16,
                is_published: true,
                is_featured: true,
                created_by: this.adminUserId
            }])
            .select()
            .single();

        if (courseError) throw courseError;

        // Module 1: Introduction
        const { data: module1 } = await supabase
            .from('course_modules')
            .insert([{
                course_id: course.id,
                title: 'Getting Started with JavaScript',
                description: 'Introduction to JavaScript and setting up your development environment',
                order_index: 1,
                estimated_duration_minutes: 180
            }])
            .select()
            .single();

        await supabase.from('course_lessons').insert([
            {
                module_id: module1.id,
                title: 'What is JavaScript?',
                description: 'Understanding JavaScript and its role in web development',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
                content: 'JavaScript is a versatile programming language that powers interactive web experiences. In this lesson, you\'ll learn about JavaScript\'s history, its role in modern web development, and why it\'s essential for every web developer.',
                order_index: 1,
                estimated_duration_minutes: 25,
                is_free: true
            },
            {
                module_id: module1.id,
                title: 'Setting Up Your Environment',
                description: 'Install and configure VS Code, Node.js, and browser dev tools',
                lesson_type: 'text',
                content: `# Setting Up Your Development Environment

To start coding in JavaScript, you'll need:

## 1. Text Editor - VS Code
Download and install Visual Studio Code from https://code.visualstudio.com/
- Install extensions: ESLint, Prettier, JavaScript (ES6) code snippets

## 2. Web Browser with DevTools
Use Chrome or Firefox with developer tools
- Press F12 to open DevTools
- Console tab for running JavaScript

## 3. Node.js (Optional but recommended)
Download from https://nodejs.org/
- Verify installation: \`node --version\`
- Comes with npm (Node Package Manager)

## Quick Test
Create a file \`hello.js\` and add:
\`\`\`javascript
console.log('Hello, JavaScript!');
\`\`\`

Run in browser console or with \`node hello.js\``,
                order_index: 2,
                estimated_duration_minutes: 30,
                is_free: true
            },
            {
                module_id: module1.id,
                title: 'Your First JavaScript Program',
                description: 'Write and run your first JavaScript code',
                lesson_type: 'coding',
                code_template: `// Welcome to your first JavaScript program!
// Write a program that prints your name and favorite programming language

// TODO: Create a variable to store your name
const myName = '';

// TODO: Create a variable for your favorite language
const favoriteLanguage = '';

// TODO: Print a greeting message
console.log();`,
                content: 'Create variables and use console.log() to display a personalized greeting. Practice basic syntax and see your code in action!',
                order_index: 3,
                estimated_duration_minutes: 20
            },
            {
                module_id: module1.id,
                title: 'JavaScript in HTML',
                description: 'Learn how to embed JavaScript in web pages',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=2Ji-clqUYnA',
                content: 'Discover different ways to include JavaScript in your HTML documents: inline scripts, internal scripts, and external script files. Learn best practices for script placement and loading.',
                order_index: 4,
                estimated_duration_minutes: 20
            }
        ]);

        // Module 2: Variables and Data Types
        const { data: module2 } = await supabase
            .from('course_modules')
            .insert([{
                course_id: course.id,
                title: 'Variables and Data Types',
                description: 'Learn how to store and work with different types of data',
                order_index: 2,
                estimated_duration_minutes: 200
            }])
            .select()
            .single();

        await supabase.from('course_lessons').insert([
            {
                module_id: module2.id,
                title: 'Variables: let, const, var',
                description: 'Understanding different ways to declare variables',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=9vJRopau0g0',
                content: 'Master the three ways to declare variables in JavaScript. Learn when to use let, const, and var, and understand the differences in scope and mutability.',
                order_index: 1,
                estimated_duration_minutes: 30
            },
            {
                module_id: module2.id,
                title: 'Primitive Data Types',
                description: 'Explore strings, numbers, booleans, null, and undefined',
                lesson_type: 'text',
                content: `# JavaScript Primitive Data Types

JavaScript has 7 primitive types:

## 1. String
Text data enclosed in quotes
\`\`\`javascript
const name = "Alice";
const greeting = 'Hello';
const message = \`Welcome, \${name}\`;
\`\`\`

## 2. Number
Integers and decimals
\`\`\`javascript
const age = 25;
const price = 19.99;
const infinity = Infinity;
\`\`\`

## 3. Boolean
True or false values
\`\`\`javascript
const isActive = true;
const hasPermission = false;
\`\`\`

## 4. Undefined
Variable declared but not assigned
\`\`\`javascript
let value;
console.log(value); // undefined
\`\`\`

## 5. Null
Intentional absence of value
\`\`\`javascript
const empty = null;
\`\`\`

## 6. Symbol (advanced)
Unique identifiers

## 7. BigInt (advanced)
Very large integers`,
                order_index: 2,
                estimated_duration_minutes: 35
            },
            {
                module_id: module2.id,
                title: 'Working with Strings',
                description: 'String methods and template literals',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=09BwruU4kiY',
                content: 'Learn essential string operations: concatenation, template literals, common methods like slice, indexOf, replace, and more.',
                order_index: 3,
                estimated_duration_minutes: 35
            },
            {
                module_id: module2.id,
                title: 'Practice: Data Types',
                description: 'Hands-on exercises with variables and data types',
                lesson_type: 'coding',
                code_template: `// Practice working with different data types

// TODO: Create variables for a user profile
const username = '';
const age = 0;
const isPremium = false;
const accountBalance = 0.0;

// TODO: Create a greeting message using template literals
const greeting = \`\`;

// TODO: Check the type of each variable
console.log(typeof username);
console.log(typeof age);
console.log(typeof isPremium);
console.log(typeof accountBalance);

// TODO: Convert age to string and concatenate
const ageString = '';
const message = '';

console.log(message);`,
                content: 'Practice creating variables, working with different data types, and using template literals. Complete all TODOs to finish the exercise.',
                order_index: 4,
                estimated_duration_minutes: 40
            }
        ]);

        // Module 3: Operators and Control Flow
        const { data: module3 } = await supabase
            .from('course_modules')
            .insert([{
                course_id: course.id,
                title: 'Operators and Control Flow',
                description: 'Make decisions and control program flow',
                order_index: 3,
                estimated_duration_minutes: 220
            }])
            .select()
            .single();

        await supabase.from('course_lessons').insert([
            {
                module_id: module3.id,
                title: 'Arithmetic and Comparison Operators',
                description: 'Perform calculations and comparisons',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=FZzyij43A54',
                content: 'Learn about arithmetic operators (+, -, *, /, %), comparison operators (==, ===, !=, !==, <, >, <=, >=), and logical operators (&&, ||, !).',
                order_index: 1,
                estimated_duration_minutes: 30
            },
            {
                module_id: module3.id,
                title: 'If Statements and Conditionals',
                description: 'Making decisions in your code',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=IsG4Xd6LlsM',
                content: 'Master conditional statements: if, else if, else, and the ternary operator. Learn to write clean, logical code that makes decisions.',
                order_index: 2,
                estimated_duration_minutes: 35
            },
            {
                module_id: module3.id,
                title: 'Switch Statements',
                description: 'Multiple condition checking',
                lesson_type: 'text',
                content: `# Switch Statements

Use switch for multiple condition checks:

\`\`\`javascript
const day = 'Monday';

switch(day) {
  case 'Monday':
    console.log('Start of the week!');
    break;
  case 'Friday':
    console.log('Almost weekend!');
    break;
  case 'Saturday':
  case 'Sunday':
    console.log('Weekend!');
    break;
  default:
    console.log('Regular day');
}
\`\`\`

## When to use switch vs if/else:
- Use switch for many specific value comparisons
- Use if/else for range checks or complex conditions
- Switch is more readable for multiple exact matches`,
                order_index: 3,
                estimated_duration_minutes: 25
            },
            {
                module_id: module3.id,
                title: 'Loops: for, while, do-while',
                description: 'Repeat code efficiently',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=s9wW2PpJsmQ',
                content: 'Learn to use loops to repeat operations: for loops, while loops, and do-while loops. Understand when to use each type.',
                order_index: 4,
                estimated_duration_minutes: 40
            },
            {
                module_id: module3.id,
                title: 'Practice: Control Flow',
                description: 'Build a simple calculator and grade checker',
                lesson_type: 'coding',
                code_template: `// Build a simple calculator

// TODO: Create a calculator function
function calculator(num1, num2, operator) {
  // Use switch or if/else to perform operation
  // operators: '+', '-', '*', '/'
  
  // Return the result
}

// TODO: Test your calculator
console.log(calculator(10, 5, '+')); // Should be 15
console.log(calculator(10, 5, '-')); // Should be 5
console.log(calculator(10, 5, '*')); // Should be 50
console.log(calculator(10, 5, '/')); // Should be 2

// TODO: Create a grade checker function
function getGrade(score) {
  // Use if/else to return letter grade
  // A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: below 60
}

// TODO: Test your grade checker
console.log(getGrade(95)); // Should be 'A'
console.log(getGrade(82)); // Should be 'B'
console.log(getGrade(70)); // Should be 'C'`,
                content: 'Practice control flow by building a calculator and grade checker. Use conditionals and implement proper logic.',
                order_index: 5,
                estimated_duration_minutes: 50
            }
        ]);

        // Module 4: Functions
        const { data: module4 } = await supabase
            .from('course_modules')
            .insert([{
                course_id: course.id,
                title: 'Functions',
                description: 'Create reusable blocks of code',
                order_index: 4,
                estimated_duration_minutes: 240
            }])
            .select()
            .single();

        await supabase.from('course_lessons').insert([
            {
                module_id: module4.id,
                title: 'Function Basics',
                description: 'Declaring and calling functions',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=N8ap4k_1QEQ',
                content: 'Learn how to create and use functions in JavaScript. Understand parameters, arguments, and return values.',
                order_index: 1,
                estimated_duration_minutes: 35
            },
            {
                module_id: module4.id,
                title: 'Arrow Functions',
                description: 'Modern ES6 function syntax',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=h33Srr5J9nY',
                content: 'Master arrow functions, a concise way to write functions in modern JavaScript. Learn the syntax and when to use them.',
                order_index: 2,
                estimated_duration_minutes: 30
            },
            {
                module_id: module4.id,
                title: 'Function Scope and Closures',
                description: 'Understanding variable scope in functions',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=1S8SBDhA7HA',
                content: 'Dive deep into how JavaScript handles scope, closures, and the execution context. Essential concepts for advanced JavaScript.',
                order_index: 3,
                estimated_duration_minutes: 45
            },
            {
                module_id: module4.id,
                title: 'Final Project: Todo List Functions',
                description: 'Build a simple todo list with functions',
                lesson_type: 'project',
                code_template: `// Todo List Project - Implement these functions

const todos = [];

// TODO: Function to add a new todo
function addTodo(task) {
  // Add task to todos array
}

// TODO: Function to remove a todo by index
function removeTodo(index) {
  // Remove todo at given index
}

// TODO: Function to mark todo as complete
function completeTodo(index) {
  // Mark the todo as complete (add a property)
}

// TODO: Function to display all todos
function displayTodos() {
  // Loop through and console.log each todo
}

// TODO: Function to get incomplete todos count
function getIncompleteCount() {
  // Return number of incomplete todos
}

// Test your functions
addTodo('Learn JavaScript');
addTodo('Build a project');
addTodo('Master functions');
displayTodos();
completeTodo(0);
console.log('Incomplete:', getIncompleteCount());
displayTodos();`,
                content: 'Apply everything you\'ve learned to build a functional todo list. Implement add, remove, complete, and display functions. This project brings together variables, arrays, loops, and functions.',
                order_index: 4,
                estimated_duration_minutes: 90
            }
        ]);

        console.log('✅ JavaScript Fundamentals course seeded');
    }

    async seedReactCourse() {
        console.log('📚 Seeding React Development Course...');

        const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert([{
                title: 'React Development',
                slug: 'react-development',
                description: 'Build modern, interactive user interfaces with React. Learn components, hooks, state management, and best practices.',
                short_description: 'Master React and build dynamic web applications',
                level: 'Intermediate',
                category: 'Frontend',
                icon_emoji: '⚛️',
                estimated_duration_hours: 18,
                total_modules: 3,
                total_lessons: 12,
                is_published: true,
                is_featured: true,
                created_by: this.adminUserId
            }])
            .select()
            .single();

        if (courseError) throw courseError;

        // Module 1: React Basics
        const { data: module1 } = await supabase
            .from('course_modules')
            .insert([{
                course_id: course.id,
                title: 'React Fundamentals',
                description: 'Introduction to React and core concepts',
                order_index: 1,
                estimated_duration_minutes: 360
            }])
            .select()
            .single();

        await supabase.from('course_lessons').insert([
            {
                module_id: module1.id,
                title: 'What is React?',
                description: 'Understanding React and the component-based architecture',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
                content: 'Learn what React is, why it\'s popular, and how it differs from vanilla JavaScript. Understand the virtual DOM and component-based architecture.',
                order_index: 1,
                estimated_duration_minutes: 30,
                is_free: true
            },
            {
                module_id: module1.id,
                title: 'Setting Up React',
                description: 'Create React App and project structure',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
                content: 'Set up your React development environment using Create React App. Understand the project structure and important files.',
                order_index: 2,
                estimated_duration_minutes: 25,
                is_free: true
            },
            {
                module_id: module1.id,
                title: 'JSX Syntax',
                description: 'Learn the JSX syntax and expressions',
                lesson_type: 'text',
                content: `# JSX - JavaScript XML

JSX lets you write HTML-like code in JavaScript:

\`\`\`jsx
function Welcome() {
  const name = 'World';
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Welcome to React</p>
    </div>
  );
}
\`\`\`

## JSX Rules:
1. Return single parent element
2. Use \`className\` instead of \`class\`
3. Use \`{}\` for JavaScript expressions
4. Self-close tags: \`<img />\`, \`<br />\`
5. camelCase for attributes: \`onClick\`, \`onChange\`

## Expressions in JSX:
\`\`\`jsx
const user = { name: 'Alice', age: 25 };
<div>
  <p>{user.name}</p>
  <p>{2 + 2}</p>
  <p>{user.age >= 18 ? 'Adult' : 'Minor'}</p>
</div>
\`\`\``,
                order_index: 3,
                estimated_duration_minutes: 30
            },
            {
                module_id: module1.id,
                title: 'Components and Props',
                description: 'Building reusable components',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=0mVbNp1ol_w',
                content: 'Create functional components and pass data using props. Learn component composition and best practices.',
                order_index: 4,
                estimated_duration_minutes: 45
            }
        ]);

        console.log('✅ React Development course seeded');
    }

    async seedNodeJSCourse() {
        console.log('📚 Seeding Node.js Backend Course...');

        const { data: course, error: courseError } = await supabase
            .from('courses')
            .insert([{
                title: 'Node.js Backend Development',
                slug: 'nodejs-backend',
                description: 'Build scalable backend applications with Node.js and Express. Learn REST APIs, databases, authentication, and deployment.',
                short_description: 'Master backend development with Node.js',
                level: 'Intermediate',
                category: 'Backend',
                icon_emoji: '🟢',
                estimated_duration_hours: 20,
                total_modules: 3,
                total_lessons: 10,
                is_published: true,
                is_featured: false,
                created_by: this.adminUserId
            }])
            .select()
            .single();

        if (courseError) throw courseError;

        const { data: module1 } = await supabase
            .from('course_modules')
            .insert([{
                course_id: course.id,
                title: 'Node.js Fundamentals',
                description: 'Introduction to Node.js and server-side JavaScript',
                order_index: 1,
                estimated_duration_minutes: 400
            }])
            .select()
            .single();

        await supabase.from('course_lessons').insert([
            {
                module_id: module1.id,
                title: 'Introduction to Node.js',
                description: 'What is Node.js and why use it?',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
                content: 'Understand Node.js, the V8 engine, and how JavaScript runs on the server. Learn about Node\'s event-driven architecture.',
                order_index: 1,
                estimated_duration_minutes: 35,
                is_free: true
            },
            {
                module_id: module1.id,
                title: 'NPM and Package Management',
                description: 'Working with npm and managing dependencies',
                lesson_type: 'video',
                video_url: 'https://www.youtube.com/watch?v=cjoTTSbOuG0',
                content: 'Learn to use npm (Node Package Manager) to install packages, manage dependencies, and understand package.json.',
                order_index: 2,
                estimated_duration_minutes: 30
            },
            {
                module_id: module1.id,
                title: 'Building a Simple Server',
                description: 'Create your first HTTP server',
                lesson_type: 'coding',
                code_template: `// Build a simple HTTP server with Node.js

const http = require('http');

// TODO: Create server that responds to requests
const server = http.createServer((req, res) => {
  // Set response header
  
  // Handle different routes
  if (req.url === '/') {
    // Home page
  } else if (req.url === '/about') {
    // About page
  } else {
    // 404 Not Found
  }
  
  // End response
});

// TODO: Start server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
                content: 'Build your first Node.js HTTP server. Handle different routes and send responses to clients.',
                order_index: 3,
                estimated_duration_minutes: 60
            }
        ]);

        console.log('✅ Node.js Backend course seeded');
    }
}

// Run the seeder
const seeder = new CourseSeeder();
seeder.seedCourses()
    .then(() => {
        console.log('\n🎉 All courses seeded successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Seeding failed:', error);
        process.exit(1);
    });