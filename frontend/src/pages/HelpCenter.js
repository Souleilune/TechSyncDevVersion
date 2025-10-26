// frontend/src/pages/HelpCenter.js - WITH SIDEBAR TOGGLE SUPPORT (COMPLETE)
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Book, 
  Users, 
  Target, 
  GraduationCap,
  AlertCircle,
  Code,
  MessageCircle,
  PanelLeft
} from 'lucide-react';

// Background symbols component with floating animations
const BackgroundSymbols = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1,
    pointerEvents: 'none'
  }}>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)' }}>&#60;/&#62;</div>
    <div className="floating-symbol" style={{ position: 'absolute', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontStyle: 'normal', fontWeight: 900, fontSize: '24px', lineHeight: '29px', userSelect: 'none', pointerEvents: 'none', left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)' }}>&#60;/&#62;</div>
  </div>
);

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  const isProjectRoute = location.pathname.startsWith('/project/');
  const isSoloProjectRoute = location.pathname.startsWith('/soloproject/');

  // NEW: Sidebar toggle state - initialize from localStorage with lazy initialization
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const storageKey = isSoloProjectRoute
      ? 'soloProjectSidebarCollapsed'
      : isProjectRoute
      ? 'projectSidebarCollapsed'
      : 'sidebarCollapsed';
    const saved = localStorage.getItem(storageKey);
    return saved === 'true';
  });

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // NEW: Listen for sidebar state changes from Sidebar component
  useEffect(() => {
    const eventName = isSoloProjectRoute
      ? 'soloProjectSidebarToggle'
      : isProjectRoute
      ? 'projectSidebarToggle'
      : 'sidebarToggle';

    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener(eventName, handleSidebarToggle);
    return () => window.removeEventListener(eventName, handleSidebarToggle);
  }, [isProjectRoute, isSoloProjectRoute]);

  // NEW: Function to toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;

    const storageKey = isSoloProjectRoute
      ? 'soloProjectSidebarCollapsed'
      : isProjectRoute
      ? 'projectSidebarCollapsed'
      : 'sidebarCollapsed';

    const eventName = isSoloProjectRoute
      ? 'soloProjectSidebarToggle'
      : isProjectRoute
      ? 'projectSidebarToggle'
      : 'sidebarToggle';

    localStorage.setItem(storageKey, newCollapsedState.toString());
    window.dispatchEvent(new CustomEvent(eventName, { detail: { collapsed: newCollapsedState } }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

   const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'getting-started', name: 'Getting Started', icon: Target },
    { id: 'team-matching', name: 'Team Matching', icon: Users },
    { id: 'learning', name: 'Learning Support', icon: GraduationCap },
    { id: 'solo-projects', name: 'Solo Projects', icon: Code },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertCircle }
  ];

  const helpContent = [
    {
      id: 'getting-started',
      category: 'getting-started',
      title: 'Getting Started with TechSync',
      icon: Target,
      sections: [
        {
          id: 'account-setup',
          title: 'Account Setup',
          content: `When you first sign up for TechSync, you'll be asked to provide:

**Programming Languages** - Select 3 or more languages you're proficient in (Java, JavaScript, Python, C++, etc.)

**Topic Interests** - Choose your areas of focus (AI, Front-End, Back-End, Mobile Development, etc.)

**Experience Level** - Input your years of programming experience

This information powers TechSync's skill-matching algorithm to recommend relevant projects and teams.`
        },
        {
          id: 'profile-importance',
          title: 'Why Your Profile Matters',
          content: `Your profile is the foundation of TechSync's AI-powered matching system. The more accurate your profile, the better your project recommendations will be.

**Match Score Components:**
- Topic Match (40% weight)
- Experience Match (30% weight)
- Language Match (30% weight)

You'll only see projects with a compatibility score above 70%.`
        }
      ]
    },
    {
      id: 'team-matching',
      category: 'team-matching',
      title: 'AI-Powered Team Matching (SOP #1)',
      icon: Users,
      sections: [
        {
          id: 'how-matching-works',
          title: 'How Team Matching Works',
          content: `TechSync uses an intelligent algorithm to match you with projects based on three key factors:

**Topic Match (40%)** - Alignment between your interests and project requirements

**Experience Match (30%)** - Your experience level vs. required experience

**Language Match (30%)** - Your programming languages vs. project languages

Match Score Threshold: You'll only see projects with a compatibility score above 70%.`
        },
        {
          id: 'creating-projects',
          title: 'Creating a Project',
          content: `**For Project Managers:**

1. Navigate to "Create Project" from the main menu
2. Enter project details:
   - Project Title
   - Description
   - Topic Category (e.g., AI, Web Development)
   - Required Programming Languages
   - Experience Level Required (Beginner/Intermediate/Advanced/Expert)
3. Review and submit

Your project will now appear in the recommendation feed for compatible developers.`
        },
        {
          id: 'joining-projects',
          title: 'Joining a Project',
          content: `**Discovery Methods:**

**View Recommended Projects** - AI-curated projects matching your profile
**Browse All Projects** - Manual search through available projects

**Joining Process:**

1. Select a project that interests you
2. Review the project details and requirements
3. Click "Join Project"
4. Complete the Automation Test (coding challenge)
5. Submit your solution

**Passing Criteria:** Score 70 or above (out of 100)

Pass - You're added to the project team and gain workspace access
Fail - You receive feedback and can try again or improve skills through learning materials`
        },
        {
          id: 'automation-test',
          title: 'Understanding Automation Tests',
          content: `**Your code is assessed on:**

- Language match with project requirements (20 points)
- Function definitions (25 points)
- Logic and control structures (20 points)
- Comments and documentation (10 points)
- Code complexity (15 points)
- Code structure (10 points)

**Total:** 100 points | **Passing Score:** 70+

The automation test ensures team quality by verifying that all members have the necessary technical competency for the project.`
        },
        {
          id: 'workspace-features',
          title: 'Project Workspace Features',
          content: `Once you join a project, you'll have access to:

**Dashboard**
- View deadline information
- Track project completion rate
- See important notices
- Review project history

**Task Management**
- View assigned tasks
- Submit task solutions
- Automatic evaluation (80/100 threshold for approval)

**Team Communication**
- Group chat with all team members
- Direct messages with individuals

**File Repository**
- Access project files (similar to GitHub)
- View code, documentation, and configuration files

**Team Members**
- View all collaborators
- Project owners can remove underperforming members`
        }
      ]
    },
    {
      id: 'learning-support',
      category: 'learning',
      title: 'Automated Learning Support (SOP #2)',
      icon: GraduationCap,
      sections: [
        {
          id: 'alert-system',
          title: 'How the Alert System Works',
          content: `TechSync monitors your project joining attempts to provide targeted support when needed.

**Trigger Condition:** Failed 8 or more project joining attempts

**What Happens:**

1. You receive a notification about personalized learning recommendations
2. The system analyzes:
   - Projects you attempted to join
   - Skills gaps identified from failed tests
   - Your current skill profile
3. You're provided with:
   - Customized Learning Materials targeting your specific weaknesses
   - Recommended Resources (tutorials, courses, documentation)
   - Skill-building Guidance to prepare for future attempts`
        },
        {
          id: 'learning-materials',
          title: 'Accessing Learning Materials',
          content: `**Navigation:** Main Menu → "Learn Materials"

**What You'll Find:**

- Personalized tutorials based on your skill gaps
- Programming language resources
- Topic-specific guides
- Practice exercises

**Purpose:** The learning pathway helps you strengthen weak areas so you can successfully join projects that previously rejected you.

The system doesn't give up on you - it guides you forward with targeted education.`
        },
        {
          id: 'skill-improvement',
          title: 'Continuous Skill Improvement',
          content: `TechSync's learning support system is designed to help you grow:

**Automated Progress Tracking** - Monitor your improvement over time
**Personalized Resources** - Content tailored to your specific needs
**Skill Gap Analysis** - Identify exactly what you need to work on
**Milestone Achievements** - Celebrate your progress

The goal is to transform repeated failures into learning opportunities, ensuring you eventually succeed in joining the projects you're interested in.`
        }
      ]
    },
    {
      id: 'solo-projects',
      category: 'solo-projects',
      title: 'Solo Development Pathway (SOP #3)',
      icon: Code,
      sections: [
        {
          id: 'when-solo',
          title: 'When to Use Solo Projects',
          content: `Solo projects are ideal if you:

- Want to build skills independently before joining teams
- Prefer working at your own pace
- Need portfolio projects
- Are new to certain technologies
- Want to experiment without team pressure

Solo projects give you full control while still providing structure, guidance, and progress tracking.`
        },
        {
          id: 'getting-recommendations',
          title: 'Getting Solo Project Recommendations',
          content: `**Step-by-Step:**

1. Navigate to "Home" → "Solo Projects"
2. The system prompts you with questions about your interests
3. AI analyzes your:
   - Current skill level
   - Programming languages
   - Topic interests
   - Experience level
4. You receive project ideas tailored to your qualifications
5. Select a project to create it and add it to your workspace

The recommendations are based on the same skill-matching algorithm used for team projects, ensuring projects are challenging but achievable.`
        },
        {
          id: 'solo-workspace',
          title: 'Solo Project Workspace Features',
          content: `**Project Dashboard**
- Track your progress
- View deadline (if self-imposed)
- Monitor completion rate

**Project Info**
- Detailed project description
- Objectives and requirements
- Feature specifications

**Project Goals**
- Set personal milestones
- Define completion criteria
- Track achievement progress

**Weekly Challenges**
- Complete coding challenges related to your project
- Earn points for correct solutions (passing score: 6/10)
- Accumulate 10+ points to unlock the Skill Map

**Task Management**
- Create personal tasks
- Track your development progress
- Organize project deliverables`
        },
        {
          id: 'gamification',
          title: 'Weekly Challenges & Skill Maps',
          content: `**Weekly Challenge System:**

1. View the weekly coding challenge
2. Submit your solution
3. Receive automated scoring
4. Earn points for passing submissions (score > 6)

**Skill Map Progression:**

- Accumulate 10+ challenge points
- Unlock skill maps showing your development journey
- Visualize your growth across technologies
- Gain motivation through visible progress

This gamification system keeps you engaged and provides clear indicators of your skill advancement over time.`
        }
      ]
    },
    {
      id: 'troubleshooting',
      category: 'troubleshooting',
      title: 'Troubleshooting Common Issues',
      icon: AlertCircle,
      sections: [
        {
          id: 'no-recommendations',
          title: 'No Recommended Projects Available',
          content: `**Possible causes:**
- Your skill profile is too narrow (select more languages/topics)
- No active projects match your criteria
- Your experience level doesn't match available projects

**Solution:** Edit your profile to broaden your interests or adjust your experience level. Go to Profile → Edit to update your information.`
        },
        {
          id: 'failed-tests',
          title: 'Failed Automation Test Multiple Times',
          content: `**What this means:** Your coding submissions haven't met the minimum 70-point threshold.

**Next steps:**

1. Review the feedback provided after each attempt
2. Access personalized learning materials (automatically provided after 8 failures)
3. Practice specific areas where you scored low:
   - Function definitions
   - Logic implementation
   - Code structure
   - Comments and documentation

Remember: Failure is a learning opportunity. TechSync provides resources to help you improve.`
        },
        {
          id: 'task-rejected',
          title: 'Task Submission Rejected',
          content: `**Reason:** Your task submission scored below 80 points.

**Solution:**

- Review the task requirements carefully
- Revise your submission
- Ensure your code includes proper logic, structure, and documentation
- Resubmit for evaluation

Task submissions have a higher threshold (80) than joining tests (70) to maintain project quality standards.`
        },
        {
          id: 'no-workspace-access',
          title: "Can't Access Project Workspace",
          content: `**Possible reasons:**

1. You haven't passed the automation test yet
2. You were removed from the project by the project owner
3. The project was deleted

**Check:** Go to "Projects" to view your active project collaborations and verify your project memberships.`
        },
        {
          id: 'no-learning-materials',
          title: 'No Learning Materials Available',
          content: `**Reason:** You haven't triggered the learning support system yet (requires 8+ failed joining attempts).

**Alternative:** You can still browse general resources or work on solo projects to build skills independently. The personalized learning materials are triggered automatically when the system detects you need additional support.`
        }
      ]
    },
    {
      id: 'faq',
      category: 'all',
      title: 'Frequently Asked Questions',
      icon: MessageCircle,
      sections: [
        {
          id: 'faq-matching',
          title: 'How does the skill-matching algorithm work?',
          content: `The algorithm calculates a compatibility score based on three factors: topic match (40%), experience match (30%), and programming language match (30%). You'll only see projects with scores above 70%.`
        },
        {
          id: 'faq-fail-test',
          title: 'What happens if I fail an automation test?',
          content: `You receive feedback on your performance and can attempt other projects. After 8 failed attempts, TechSync provides personalized learning materials to help you improve.`
        },
        {
          id: 'faq-both-projects',
          title: 'Can I work on both team projects and solo projects?',
          content: `Yes! You can join collaborative team projects while also maintaining solo projects in your personal workspace. There's no limit to how many projects you can participate in.`
        },
        {
          id: 'faq-scoring',
          title: 'How are automation tests scored?',
          content: `Tests evaluate your code on language compatibility (20 pts), function definitions (25 pts), logic structures (20 pts), documentation (10 pts), complexity (15 pts), and overall structure (10 pts), totaling 100 points. You need 70+ to pass.`
        },
        {
          id: 'faq-tasks-challenges',
          title: "What's the difference between project tasks and weekly challenges?",
          content: `Project tasks are specific deliverables for team projects (require 80+ score). Weekly challenges are optional skill-building exercises for solo developers that earn points toward unlocking skill maps.`
        },
        {
          id: 'faq-removal',
          title: 'Can project owners remove me from a team?',
          content: `Yes, project owners can remove underperforming members with documented justification to maintain team quality and project success.`
        },
        {
          id: 'faq-tracking',
          title: 'How do I track my skill development?',
          content: `Through multiple systems: automation test scores show project readiness, task completion rates indicate collaborative performance, weekly challenge points and skill maps visualize solo progress, and learning material completion tracks educational advancement.`
        }
      ]
    }
  ];

  const filteredContent = helpContent.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sections.some(section => 
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const styles = {
    // NEW: Sidebar toggle button style
    toggleButton: {
      position: 'fixed',
      top: '20px',
      left: isSidebarCollapsed ? '100px' : '290px',
      zIndex: 1100,
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      backgroundColor: 'rgba(26, 28, 32, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#9ca3af',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    container: {
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      padding: '2rem',
      paddingLeft: '120px',  // Changed from 270px to 120px
      transition: 'padding-left 0.3s ease',  // Added transition
      position: 'relative',
      overflow: 'hidden'
    },
    loading: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      minHeight: '400px',
      fontSize: '18px',
      color: '#9ca3af'
    },
  };

  // Loading state render
  if (loading) {
    return (
      <>
        {/* NEW: Sidebar Toggle Button - OUTSIDE CONTAINER */}
        <button
          style={{
            position: 'fixed',
            top: '20px',
            left: isSidebarCollapsed ? '100px' : '290px',
            zIndex: 1100,
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(26, 28, 32, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#9ca3af',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onClick={toggleSidebar}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
            e.currentTarget.style.color = '#3b82f6';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft size={20} />
        </button>

        <div style={styles.container}>
          <BackgroundSymbols />
          <div style={styles.loading}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} className="global-loading-spinner">
              <img 
                src="/images/logo/TechSyncLogo.png" 
                alt="TechSync Logo" 
                style={{
                  width: '125%',
                  height: '125%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <span>Loading help center...</span>
          </div>
          
          <style>
            {`
              @keyframes globalLogoRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }

              .global-loading-spinner {
                animation: globalLogoRotate 2s linear infinite;
              }
            `}
          </style>
        </div>
      </>
    );
  }

  return (
    <>
      {/* NEW: Sidebar Toggle Button - OUTSIDE CONTAINER */}
      <button
        style={styles.toggleButton}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.color = '#3b82f6';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
          e.currentTarget.style.color = '#9ca3af';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeft size={20} />
      </button>
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F1116',
        color: 'white',
        padding: '2rem',
        paddingLeft: '120px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'padding-left 0.3s ease'
      }}>
        {/* Background Code Symbols - Now with floating animations */}
        <BackgroundSymbols />

        <style>
          {`
            .category-btn {
              transition: all 0.3s ease;
            }

            .category-btn:hover {
              background: rgba(255, 255, 255, 0.1) !important;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15);
            }

            .category-btn.active {
              background: linear-gradient(135deg, #60a5fa, #3b82f6) !important;
              color: white !important;
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
            }

            .help-section {
              transition: all 0.3s ease;
            }

            .help-section:hover {
              background: rgba(255, 255, 255, 0.05) !important;
              transform: translateY(-2px);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            }

            .section-header {
              transition: all 0.2s ease;
            }

            .section-header:hover {
              background: rgba(255, 255, 255, 0.08) !important;
            }

            .search-input {
              transition: all 0.3s ease;
            }

            .search-input:focus {
              outline: none;
              border-color: #60a5fa;
              box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
            }

            .quick-link-btn {
              transition: all 0.3s ease;
            }

            .quick-link-btn:hover {
              background: rgba(96, 165, 250, 0.15) !important;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(96, 165, 250, 0.2);
            }

            /* FLOATING BACKGROUND SYMBOLS ANIMATIONS */
            @keyframes floatAround1 {
              0%, 100% { transform: translate(0, 0) rotate(-10.79deg); }
              25% { transform: translate(30px, -20px) rotate(-5deg); }
              50% { transform: translate(-15px, 25px) rotate(-15deg); }
              75% { transform: translate(20px, 10px) rotate(-8deg); }
            }

            @keyframes floatAround2 {
              0%, 100% { transform: translate(0, 0) rotate(-37.99deg); }
              33% { transform: translate(-25px, 15px) rotate(-30deg); }
              66% { transform: translate(35px, -10px) rotate(-45deg); }
            }

            @keyframes floatAround3 {
              0%, 100% { transform: translate(0, 0) rotate(34.77deg); }
              20% { transform: translate(-20px, -30px) rotate(40deg); }
              40% { transform: translate(25px, 20px) rotate(28deg); }
              60% { transform: translate(-10px, -15px) rotate(38deg); }
              80% { transform: translate(15px, 25px) rotate(30deg); }
            }

            @keyframes floatAround4 {
              0%, 100% { transform: translate(0, 0) rotate(28.16deg); }
              50% { transform: translate(-40px, 30px) rotate(35deg); }
            }

            @keyframes floatAround5 {
              0%, 100% { transform: translate(0, 0) rotate(24.5deg); }
              25% { transform: translate(20px, -25px) rotate(30deg); }
              50% { transform: translate(-30px, 20px) rotate(18deg); }
              75% { transform: translate(25px, 15px) rotate(28deg); }
            }

            @keyframes floatAround6 {
              0%, 100% { transform: translate(0, 0) rotate(25.29deg); }
              33% { transform: translate(-15px, -20px) rotate(30deg); }
              66% { transform: translate(30px, 25px) rotate(20deg); }
            }

            @keyframes driftSlow {
              0%, 100% { transform: translate(0, 0) rotate(-19.68deg); }
              25% { transform: translate(-35px, 20px) rotate(-25deg); }
              50% { transform: translate(20px, -30px) rotate(-15deg); }
              75% { transform: translate(-10px, 35px) rotate(-22deg); }
            }

            @keyframes gentleDrift {
              0%, 100% { transform: translate(0, 0) rotate(-6.83deg); }
              50% { transform: translate(25px, -40px) rotate(-2deg); }
            }

            @keyframes spiralFloat {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              25% { transform: translate(20px, -20px) rotate(5deg); }
              50% { transform: translate(0px, -40px) rotate(10deg); }
              75% { transform: translate(-20px, -20px) rotate(5deg); }
            }

            @keyframes waveMotion {
              0%, 100% { transform: translate(0, 0) rotate(15deg); }
              25% { transform: translate(30px, 10px) rotate(20deg); }
              50% { transform: translate(15px, -25px) rotate(10deg); }
              75% { transform: translate(-15px, 10px) rotate(18deg); }
            }

            @keyframes circularDrift {
              0%, 100% { transform: translate(0, 0) rotate(-45deg); }
              25% { transform: translate(25px, 0px) rotate(-40deg); }
              50% { transform: translate(25px, 25px) rotate(-50deg); }
              75% { transform: translate(0px, 25px) rotate(-42deg); }
            }

            @keyframes globalLogoRotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            .global-loading-spinner {
              animation: globalLogoRotate 2s linear infinite;
            }

            .floating-symbol {
              animation-timing-function: ease-in-out;
              animation-iteration-count: infinite;
              opacity: 0.6;
            }

            .floating-symbol:nth-child(1) { animation: floatAround1 15s infinite; }
            .floating-symbol:nth-child(2) { animation: floatAround2 18s infinite; animation-delay: -2s; }
            .floating-symbol:nth-child(3) { animation: floatAround3 12s infinite; animation-delay: -5s; }
            .floating-symbol:nth-child(4) { animation: floatAround4 20s infinite; animation-delay: -8s; }
            .floating-symbol:nth-child(5) { animation: floatAround5 16s infinite; animation-delay: -3s; }
            .floating-symbol:nth-child(6) { animation: floatAround6 14s infinite; animation-delay: -7s; }
            .floating-symbol:nth-child(7) { animation: driftSlow 22s infinite; animation-delay: -10s; }
            .floating-symbol:nth-child(8) { animation: gentleDrift 19s infinite; animation-delay: -1s; }
            .floating-symbol:nth-child(9) { animation: spiralFloat 17s infinite; animation-delay: -6s; }
            .floating-symbol:nth-child(10) { animation: waveMotion 13s infinite; animation-delay: -4s; }
            .floating-symbol:nth-child(11) { animation: circularDrift 21s infinite; animation-delay: -9s; }
            .floating-symbol:nth-child(12) { animation: floatAround1 16s infinite; animation-delay: -2s; }
            .floating-symbol:nth-child(13) { animation: floatAround2 18s infinite; animation-delay: -11s; }
            .floating-symbol:nth-child(14) { animation: floatAround3 14s infinite; animation-delay: -5s; }
            .floating-symbol:nth-child(15) { animation: floatAround4 19s infinite; animation-delay: -7s; }
            .floating-symbol:nth-child(16) { animation: floatAround5 23s infinite; animation-delay: -3s; }
            .floating-symbol:nth-child(17) { animation: driftSlow 15s infinite; animation-delay: -8s; }
            .floating-symbol:nth-child(18) { animation: gentleDrift 17s infinite; animation-delay: -1s; }
            .floating-symbol:nth-child(19) { animation: spiralFloat 20s infinite; animation-delay: -12s; }
            .floating-symbol:nth-child(20) { animation: waveMotion 18s infinite; animation-delay: -6s; }
            .floating-symbol:nth-child(21) { animation: circularDrift 16s infinite; animation-delay: -4s; }
            `}
        </style>

        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          position: 'relative',
          zIndex: 10
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            TechSync Help Center
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Find answers to your questions and learn how to make the most of TechSync
          </p>
        </div>

        <div style={{
          maxWidth: '700px',
          margin: '0 auto 3rem auto',
          position: 'relative',
          zIndex: 10
        }}>
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              zIndex: 2
            }}
          />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              background: 'rgba(26, 28, 32, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: activeCategory === category.id 
                    ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                    : 'rgba(26, 28, 32, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                <Icon size={18} />
                {category.name}
              </button>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}>
          {filteredContent.length > 0 ? (
            filteredContent.map(item => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className="help-section"
                  style={{
                    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.8), rgba(15, 17, 22, 0.6))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '2rem',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ItemIcon size={24} color="white" />
                    </div>
                    <h2 style={{
                      fontSize: '1.75rem',
                      fontWeight: 'bold',
                      color: 'white',
                      margin: 0
                    }}>
                      {item.title}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {item.sections.map(section => (
                      <div key={section.id}>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="section-header"
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            textAlign: 'left'
                          }}
                        >
                          <span>{section.title}</span>
                          {expandedSections[section.id] ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>

                        {expandedSections[section.id] && (
                          <div style={{
                            padding: '1.5rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '8px',
                            marginTop: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                          }}>
                            <div style={{
                              color: '#d1d5db',
                              lineHeight: '1.8',
                              fontSize: '1rem'
                            }}>
                              {section.content.split('\n').map((paragraph, idx) => {
                                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                  return (
                                    <h3 key={idx} style={{
                                      fontSize: '1.125rem',
                                      fontWeight: 'bold',
                                      color: '#60a5fa',
                                      marginTop: idx === 0 ? 0 : '1.5rem',
                                      marginBottom: '0.75rem'
                                    }}>
                                      {paragraph.replace(/\*\*/g, '')}
                                    </h3>
                                  );
                                }
                                
                                if (paragraph.trim().startsWith('-')) {
                                  return (
                                    <div key={idx} style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: '0.5rem',
                                      marginBottom: '0.5rem',
                                      marginLeft: '1rem'
                                    }}>
                                      <div style={{
                                        width: '6px',
                                        height: '6px',
                                        background: '#60a5fa',
                                        borderRadius: '50%',
                                        marginTop: '0.6rem',
                                        flexShrink: 0
                                      }} />
                                      <span style={{ flex: 1 }}>
                                        {paragraph.trim().substring(1).trim()}
                                      </span>
                                    </div>
                                  );
                                }
                                
                                if (paragraph.trim() === '') {
                                  return <div key={idx} style={{ height: '0.75rem' }} />;
                                }
                                
                                const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                                return (
                                  <p key={idx} style={{ marginBottom: '0.75rem' }}>
                                    {parts.map((part, partIdx) => {
                                      if (part.startsWith('**') && part.endsWith('**')) {
                                        return (
                                          <strong key={partIdx} style={{ color: 'white' }}>
                                            {part.replace(/\*\*/g, '')}
                                          </strong>
                                        );
                                      }
                                      return <span key={partIdx}>{part}</span>;
                                    })}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.8), rgba(15, 17, 22, 0.6))',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              zIndex: 10
            }}>
              <AlertCircle size={48} color="#9ca3af" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                No results found
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '1rem'
              }}>
                Try adjusting your search or selecting a different category
              </p>
            </div>
          )}
        </div>

        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.8), rgba(15, 17, 22, 0.6))',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '1200px',
          margin: '4rem auto 0',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 10
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Quick Links
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <button
              onClick={() => {
                setActiveCategory('getting-started');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="quick-link-btn"
              style={{
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Target size={24} color="#60a5fa" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Getting Started</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Learn the basics of TechSync
              </div>
            </button>

            <button
              onClick={() => {
                setActiveCategory('team-matching');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="quick-link-btn"
              style={{
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Users size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Join a Team</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Find and join collaborative projects
              </div>
            </button>

            <button
              onClick={() => {
                setActiveCategory('solo-projects');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="quick-link-btn"
              style={{
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Code size={24} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Solo Projects</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Work independently on your own projects
              </div>
            </button>

            <button
              onClick={() => {
                setActiveCategory('troubleshooting');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="quick-link-btn"
              style={{
                padding: '1.25rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                backdropFilter: 'blur(10px)'
              }}
            >
              <AlertCircle size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Troubleshooting</div>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Resolve common issues and errors
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpCenter;