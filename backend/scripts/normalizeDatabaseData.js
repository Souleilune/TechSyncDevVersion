// backend/scripts/normalizeDatabaseData_Smart.js
// SMART VERSION - Handles users who have both variations of the same language

const supabase = require('../config/supabase');

class SmartDatabaseNormalizer {
  constructor() {
    this.results = {
      languagesFixed: 0,
      topicsFixed: 0,
      duplicateUserEntriesRemoved: 0,
      languageMappings: [],
      topicMappings: [],
      errors: []
    };
  }

  async normalize() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  🔧 SMART DATABASE NORMALIZATION                         ║');
    console.log('║  Handles users with duplicate entries                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    try {
      await this.normalizeLanguages();
      await this.normalizeTopics();
      this.printResults();
      
      return this.results;
    } catch (error) {
      console.error('❌ Normalization failed:', error);
      throw error;
    }
  }

  /**
   * Smart language normalization
   */
  async normalizeLanguages() {
    console.log('🔤 Step 1: Smart language normalization...\n');

    const languageMappings = {
      'javascript': 'JavaScript',
      '** JavaScript': 'JavaScript',
      'Javascript': 'JavaScript',
      'JAVASCRIPT': 'JavaScript',
      'python': 'Python',
      'PYTHON': 'Python',
      'java': 'Java',
      'JAVA': 'Java',
      'c++': 'C++',
      'C plus plus': 'C++',
      'CPP': 'C++',
      'c#': 'C#',
      'C sharp': 'C#',
      'csharp': 'C#',
      'html': 'HTML',
      'Html': 'HTML',
      'css': 'CSS',
      'Css': 'CSS',
      'sql': 'SQL',
      'Sql': 'SQL',
      'typescript': 'TypeScript',
      'Typescript': 'TypeScript',
      'go': 'Go',
      'golang': 'Go',
      'rust': 'Rust',
      'kotlin': 'Kotlin',
      'swift': 'Swift',
      'php': 'PHP',
      'ruby': 'Ruby',
      'r': 'R',
      'bash': 'Bash',
      'shell': 'Shell'
    };

    const { data: languages, error } = await supabase
      .from('programming_languages')
      .select('*');

    if (error) throw error;

    console.log(`   Found ${languages.length} programming languages\n`);

    // Build canonical map
    const canonicalLanguages = new Map();
    const duplicates = [];

    for (const lang of languages) {
      const canonical = languageMappings[lang.name] || lang.name;
      
      if (canonicalLanguages.has(canonical)) {
        duplicates.push({
          duplicate: lang,
          canonical: canonicalLanguages.get(canonical)
        });
      } else {
        canonicalLanguages.set(canonical, lang);
      }
    }

    console.log(`   Found ${duplicates.length} duplicate language entries\n`);

    // Fix each duplicate
    for (const dup of duplicates) {
      console.log(`   Merging "${dup.duplicate.name}" → "${dup.canonical.name}"`);
      
      try {
        // STEP 1: Find users who have BOTH the duplicate and canonical
        const { data: conflictingUsers, error: conflictError } = await supabase
          .from('user_programming_languages')
          .select('user_id, id, proficiency_level')
          .eq('language_id', dup.duplicate.id);

        if (conflictError) throw conflictError;

        console.log(`      Found ${conflictingUsers.length} users with "${dup.duplicate.name}"`);

        // STEP 2: For each user, check if they already have the canonical
        for (const userLang of conflictingUsers) {
          const { data: existingCanonical } = await supabase
            .from('user_programming_languages')
            .select('id')
            .eq('user_id', userLang.user_id)
            .eq('language_id', dup.canonical.id)
            .single();

          if (existingCanonical) {
            // User has BOTH! Remove the duplicate entry
            console.log(`      ⚠️  User ${userLang.user_id} has both - removing duplicate`);
            
            const { error: deleteError } = await supabase
              .from('user_programming_languages')
              .delete()
              .eq('id', userLang.id);

            if (deleteError) throw deleteError;
            this.results.duplicateUserEntriesRemoved++;
          } else {
            // User only has duplicate - update to canonical
            const { error: updateError } = await supabase
              .from('user_programming_languages')
              .update({ language_id: dup.canonical.id })
              .eq('id', userLang.id);

            if (updateError) throw updateError;
          }
        }

        // STEP 3: Update project_languages
        const { data: projectLangs } = await supabase
          .from('project_languages')
          .select('project_id, id')
          .eq('language_id', dup.duplicate.id);

        for (const projLang of projectLangs || []) {
          // Check if project already has canonical
          const { data: existingCanonical } = await supabase
            .from('project_languages')
            .select('id')
            .eq('project_id', projLang.project_id)
            .eq('language_id', dup.canonical.id)
            .single();

          if (existingCanonical) {
            // Project has both - remove duplicate
            await supabase
              .from('project_languages')
              .delete()
              .eq('id', projLang.id);
          } else {
            // Update to canonical
            await supabase
              .from('project_languages')
              .update({ language_id: dup.canonical.id })
              .eq('id', projLang.id);
          }
        }

        // STEP 4: Delete the duplicate language
        const { error: deleteError } = await supabase
          .from('programming_languages')
          .delete()
          .eq('id', dup.duplicate.id);

        if (deleteError) throw deleteError;

        this.results.languagesFixed++;
        this.results.languageMappings.push({
          from: dup.duplicate.name,
          to: dup.canonical.name
        });

        console.log(`      ✅ Successfully merged!\n`);

      } catch (error) {
        console.error(`      ❌ Error: ${error.message}\n`);
        this.results.errors.push({
          type: 'language',
          from: dup.duplicate.name,
          error: error.message
        });
      }
    }

    console.log(`✅ Fixed ${this.results.languagesFixed} duplicate languages\n`);
  }

  /**
   * Smart topic normalization
   */
  async normalizeTopics() {
    console.log('📚 Step 2: Smart topic normalization...\n');

    const topicMappings = {
      'web development': 'Web Development',
      'Web development': 'Web Development',
      'backend development': 'Backend Development',
      'Backend development': 'Backend Development',
      'back-end development': 'Backend Development',
      'frontend development': 'Frontend Development',
      'Frontend development': 'Frontend Development',
      'front-end development': 'Frontend Development',
      'mobile development': 'Mobile Development',
      'mobile app development': 'Mobile Development',
      'ui/ux design': 'UI/UX Design',
      'UI/UX design': 'UI/UX Design',
      'devops': 'DevOps',
      'Devops': 'DevOps',
      'machine learning': 'Machine Learning',
      'Machine learning': 'Machine Learning',
      'artificial intelligence': 'Artificial Intelligence',
      'Artificial intelligence': 'Artificial Intelligence',
      'database design': 'Database Design',
      'Database design': 'Database Design',
      'cloud computing': 'Cloud Computing',
      'Cloud computing': 'Cloud Computing',
      'microservices': 'Microservices',
      'Microservices': 'Microservices',
      'performance optimization': 'Performance Optimization',
      'Performance optimization': 'Performance Optimization'
    };

    const { data: topics, error } = await supabase
      .from('topics')
      .select('*');

    if (error) throw error;

    console.log(`   Found ${topics.length} topics\n`);

    // Build canonical map
    const canonicalTopics = new Map();
    const duplicates = [];

    for (const topic of topics) {
      const canonical = topicMappings[topic.name] || topic.name;
      
      if (canonicalTopics.has(canonical)) {
        duplicates.push({
          duplicate: topic,
          canonical: canonicalTopics.get(canonical)
        });
      } else {
        canonicalTopics.set(canonical, topic);
      }
    }

    console.log(`   Found ${duplicates.length} duplicate topic entries\n`);

    // Fix each duplicate
    for (const dup of duplicates) {
      console.log(`   Merging "${dup.duplicate.name}" → "${dup.canonical.name}"`);
      
      try {
        // STEP 1: Find users who have the duplicate
        const { data: conflictingUsers, error: conflictError } = await supabase
          .from('user_topics')
          .select('user_id, id')
          .eq('topic_id', dup.duplicate.id);

        if (conflictError) throw conflictError;

        console.log(`      Found ${conflictingUsers.length} users with "${dup.duplicate.name}"`);

        // STEP 2: For each user, check if they already have the canonical
        for (const userTopic of conflictingUsers) {
          const { data: existingCanonical } = await supabase
            .from('user_topics')
            .select('id')
            .eq('user_id', userTopic.user_id)
            .eq('topic_id', dup.canonical.id)
            .single();

          if (existingCanonical) {
            // User has BOTH! Remove the duplicate entry
            console.log(`      ⚠️  User ${userTopic.user_id} has both - removing duplicate`);
            
            const { error: deleteError } = await supabase
              .from('user_topics')
              .delete()
              .eq('id', userTopic.id);

            if (deleteError) throw deleteError;
            this.results.duplicateUserEntriesRemoved++;
          } else {
            // User only has duplicate - update to canonical
            const { error: updateError } = await supabase
              .from('user_topics')
              .update({ topic_id: dup.canonical.id })
              .eq('id', userTopic.id);

            if (updateError) throw updateError;
          }
        }

        // STEP 3: Update project_topics
        const { data: projectTopics } = await supabase
          .from('project_topics')
          .select('project_id, id')
          .eq('topic_id', dup.duplicate.id);

        for (const projTopic of projectTopics || []) {
          // Check if project already has canonical
          const { data: existingCanonical } = await supabase
            .from('project_topics')
            .select('id')
            .eq('project_id', projTopic.project_id)
            .eq('topic_id', dup.canonical.id)
            .single();

          if (existingCanonical) {
            // Project has both - remove duplicate
            await supabase
              .from('project_topics')
              .delete()
              .eq('id', projTopic.id);
          } else {
            // Update to canonical
            await supabase
              .from('project_topics')
              .update({ topic_id: dup.canonical.id })
              .eq('id', projTopic.id);
          }
        }

        // STEP 4: Delete the duplicate topic
        const { error: deleteError } = await supabase
          .from('topics')
          .delete()
          .eq('id', dup.duplicate.id);

        if (deleteError) throw deleteError;

        this.results.topicsFixed++;
        this.results.topicMappings.push({
          from: dup.duplicate.name,
          to: dup.canonical.name
        });

        console.log(`      ✅ Successfully merged!\n`);

      } catch (error) {
        console.error(`      ❌ Error: ${error.message}\n`);
        this.results.errors.push({
          type: 'topic',
          from: dup.duplicate.name,
          error: error.message
        });
      }
    }

    console.log(`✅ Fixed ${this.results.topicsFixed} duplicate topics\n`);
  }

  /**
   * Print results
   */
  printResults() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    📊 NORMALIZATION RESULTS              ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('📊 SUMMARY:');
    console.log('─'.repeat(60));
    console.log(`   Languages Fixed:              ${this.results.languagesFixed}`);
    console.log(`   Topics Fixed:                 ${this.results.topicsFixed}`);
    console.log(`   Duplicate User Entries Removed: ${this.results.duplicateUserEntriesRemoved}`);
    console.log(`   Errors:                       ${this.results.errors.length}\n`);

    if (this.results.languageMappings.length > 0) {
      console.log('🔤 LANGUAGE MAPPINGS:');
      console.log('─'.repeat(60));
      this.results.languageMappings.forEach(mapping => {
        console.log(`   "${mapping.from}" → "${mapping.to}"`);
      });
      console.log();
    }

    if (this.results.topicMappings.length > 0) {
      console.log('📚 TOPIC MAPPINGS:');
      console.log('─'.repeat(60));
      this.results.topicMappings.forEach(mapping => {
        console.log(`   "${mapping.from}" → "${mapping.to}"`);
      });
      console.log();
    }

    if (this.results.errors.length > 0) {
      console.log('⚠️  ERRORS:');
      console.log('─'.repeat(60));
      this.results.errors.forEach(err => {
        console.log(`   [${err.type}] "${err.from}": ${err.error}`);
      });
      console.log();
    }

    console.log('═'.repeat(60));
    if (this.results.languagesFixed + this.results.topicsFixed > 0) {
      console.log('✅ Database normalized successfully!');
      console.log('');
      console.log('🎯 Next Steps:');
      console.log('   1. Verify: node backend/scripts/validateUserProfiles.js');
      console.log('   2. Test:   node backend/scripts/testRecommendationAlgorithm_Improved.js');
      console.log('   3. Expected: Precision/Recall 75-85% ✅');
    } else {
      console.log('ℹ️  No changes made - database may already be normalized');
      console.log('   Or all duplicates had conflicts (check errors above)');
    }
    console.log('═'.repeat(60));
  }
}

// Main execution
async function main() {
  const normalizer = new SmartDatabaseNormalizer();
  
  try {
    await normalizer.normalize();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Normalization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SmartDatabaseNormalizer;