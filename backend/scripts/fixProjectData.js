// backend/scripts/fixProjectData.js
// Run with: node backend/scripts/fixProjectData.js

const supabase = require('../config/supabase');

const validExpLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

// Keywords to infer experience level from description
const experienceKeywords = {
  beginner: ['beginner', 'simple', 'basic', 'easy', 'intro', 'fundamental', 'starter', 'learning', 'tutorial'],
  intermediate: ['intermediate', 'medium', 'moderate', 'practical', 'standard', 'typical'],
  advanced: ['advanced', 'complex', 'sophisticated', 'expert', 'professional', 'senior', 'scalable', 'production']
};

function inferExperienceLevel(description, title) {
  const text = `${description} ${title}`.toLowerCase();
  
  // Check for keywords
  const scores = {
    beginner: 0,
    intermediate: 0,
    advanced: 0
  };
  
  Object.entries(experienceKeywords).forEach(([level, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        scores[level]++;
      }
    });
  });
  
  // Return level with highest score, or intermediate as default
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'intermediate'; // Default
  
  const inferredLevel = Object.entries(scores).find(([_, score]) => score === maxScore)[0];
  return inferredLevel;
}

async function analyzeProjects() {
  console.log('🔍 Analyzing project data quality...\n');
  
  // Get all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*');
    
  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }
  
  const analysis = {
    total: projects.length,
    missingExperience: [],
    missingTopics: [],
    missingLanguages: [],
    fullyValid: []
  };
  
  console.log(`Found ${projects.length} total projects\n`);
  console.log('Analyzing each project...\n');
  
  for (const project of projects) {
    let isValid = true;
    
    // Check experience level
    if (!project.required_experience_level || 
        !validExpLevels.includes(project.required_experience_level.toLowerCase())) {
      analysis.missingExperience.push({
        id: project.id,
        title: project.title,
        current: project.required_experience_level,
        inferred: inferExperienceLevel(project.description || '', project.title || '')
      });
      isValid = false;
    }
    
    // Check topics
    const { data: topics } = await supabase
      .from('project_topics')
      .select('*')
      .eq('project_id', project.id);
      
    if (!topics || topics.length === 0) {
      analysis.missingTopics.push({
        id: project.id,
        title: project.title,
        description: (project.description || '').substring(0, 100)
      });
      isValid = false;
    }
    
    // Check languages
    const { data: languages } = await supabase
      .from('project_languages')
      .select('*')
      .eq('project_id', project.id);
      
    if (!languages || languages.length === 0) {
      analysis.missingLanguages.push({
        id: project.id,
        title: project.title,
        description: (project.description || '').substring(0, 100)
      });
      isValid = false;
    }
    
    if (isValid) {
      analysis.fullyValid.push(project.id);
    }
  }
  
  // Print results
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 ANALYSIS RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log(`Total Projects: ${analysis.total}`);
  console.log(`✅ Fully Valid: ${analysis.fullyValid.length} (${(analysis.fullyValid.length/analysis.total*100).toFixed(1)}%)`);
  console.log(`❌ Missing Experience: ${analysis.missingExperience.length} (${(analysis.missingExperience.length/analysis.total*100).toFixed(1)}%)`);
  console.log(`❌ Missing Topics: ${analysis.missingTopics.length} (${(analysis.missingTopics.length/analysis.total*100).toFixed(1)}%)`);
  console.log(`❌ Missing Languages: ${analysis.missingLanguages.length} (${(analysis.missingLanguages.length/analysis.total*100).toFixed(1)}%)\n`);
  
  return analysis;
}

async function fixExperienceLevels(dryRun = true) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🔧 FIXING EXPERIENCE LEVELS ${dryRun ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('═'.repeat(60) + '\n');
  
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*');
    
  if (error) throw error;
  
  const fixes = [];
  const cannotFix = [];
  
  for (const project of projects) {
    if (!project.required_experience_level || 
        !validExpLevels.includes(project.required_experience_level.toLowerCase())) {
      
      const inferredLevel = inferExperienceLevel(
        project.description || '', 
        project.title || ''
      );
      
      fixes.push({
        id: project.id,
        title: project.title,
        old: project.required_experience_level,
        new: inferredLevel
      });
      
      if (!dryRun) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ required_experience_level: inferredLevel })
          .eq('id', project.id);
          
        if (updateError) {
          console.error(`❌ Failed to update ${project.title}:`, updateError.message);
          cannotFix.push(project.id);
        } else {
          console.log(`✅ Updated "${project.title}": ${project.required_experience_level} → ${inferredLevel}`);
        }
      } else {
        console.log(`📝 Would update "${project.title}": ${project.required_experience_level} → ${inferredLevel}`);
      }
    }
  }
  
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Total to fix: ${fixes.length}`);
  if (!dryRun) {
    console.log(`Successfully fixed: ${fixes.length - cannotFix.length}`);
    console.log(`Failed: ${cannotFix.length}`);
  }
  console.log('─'.repeat(60));
  
  return { fixes, cannotFix };
}

async function exportMissingData(analysis) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📄 EXPORTING MISSING DATA REPORTS');
  console.log('═'.repeat(60) + '\n');
  
  // Export projects missing topics
  if (analysis.missingTopics.length > 0) {
    const csv = [
      'Project ID,Title,Description',
      ...analysis.missingTopics.map(p => 
        `"${p.id}","${p.title}","${p.description.replace(/"/g, '""')}"`
      )
    ].join('\n');
    
    require('fs').writeFileSync('projects_missing_topics.csv', csv);
    console.log(`✅ Exported ${analysis.missingTopics.length} projects missing topics → projects_missing_topics.csv`);
  }
  
  // Export projects missing languages
  if (analysis.missingLanguages.length > 0) {
    const csv = [
      'Project ID,Title,Description',
      ...analysis.missingLanguages.map(p => 
        `"${p.id}","${p.title}","${p.description.replace(/"/g, '""')}"`
      )
    ].join('\n');
    
    require('fs').writeFileSync('projects_missing_languages.csv', csv);
    console.log(`✅ Exported ${analysis.missingLanguages.length} projects missing languages → projects_missing_languages.csv`);
  }
  
  // Export experience level fixes
  if (analysis.missingExperience.length > 0) {
    const csv = [
      'Project ID,Title,Current Value,Inferred Value',
      ...analysis.missingExperience.map(p => 
        `"${p.id}","${p.title}","${p.current}","${p.inferred}"`
      )
    ].join('\n');
    
    require('fs').writeFileSync('projects_experience_fixes.csv', csv);
    console.log(`✅ Exported ${analysis.missingExperience.length} experience level fixes → projects_experience_fixes.csv`);
  }
  
  console.log('\n📨 Send these CSV files to project owners for manual data entry.');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║         TechSync Data Quality Fix Tool                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  try {
    if (!command || command === 'analyze') {
      // Analyze only
      const analysis = await analyzeProjects();
      await exportMissingData(analysis);
      
    } else if (command === 'fix-dry-run') {
      // Dry run of experience level fixes
      const analysis = await analyzeProjects();
      await fixExperienceLevels(true);
      
    } else if (command === 'fix-live') {
      // Actually fix experience levels
      console.log('⚠️  WARNING: This will modify the database!\n');
      const analysis = await analyzeProjects();
      await fixExperienceLevels(false);
      
      console.log('\n✅ Experience levels have been fixed!');
      console.log('\n⚠️  NEXT STEPS:');
      console.log('1. Check the exported CSV files');
      console.log('2. Manually add topics and languages to projects');
      console.log('3. Re-run "analyze" command to verify\n');
      
    } else {
      console.log('Usage:');
      console.log('  node fixProjectData.js analyze       - Analyze and export issues');
      console.log('  node fixProjectData.js fix-dry-run   - Show what would be fixed');
      console.log('  node fixProjectData.js fix-live      - Actually fix the data');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeProjects, fixExperienceLevels, exportMissingData };