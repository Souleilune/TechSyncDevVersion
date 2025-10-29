// backend/scripts/checkDatabaseStats.js
const supabase = require('../config/supabase');

class DatabaseStatsChecker {
  constructor() {
    this.stats = {
      users: 0,
      projects: 0,
      activeProjects: 0,
      recruitingProjects: 0,
      completedProjects: 0,
      codingChallenges: 0,
      challengeAttempts: 0,
      projectMembers: 0,
      learningRecommendations: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Main function to check all database statistics
   */
  async checkAllStats() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 DATABASE STATISTICS CHECK');
    console.log('='.repeat(70));
    console.log(`Timestamp: ${new Date().toLocaleString()}`);
    console.log('='.repeat(70));

    try {
      await this.testConnection();
      await this.checkUsers();
      await this.checkProjects();
      await this.checkProjectsByStatus();
      await this.checkCodingChallenges();
      await this.checkChallengeAttempts();
      await this.checkProjectMembers();
      await this.checkLearningRecommendations();
      
      this.printSummary();
      this.exportStats();

    } catch (error) {
      console.error('❌ Error checking database stats:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      console.log('\n🔍 Testing database connection...');
      
      const { error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw new Error('Cannot connect to database. Check your configuration.');
    }
  }

  /**
   * Check total number of users
   */
  async checkUsers() {
    try {
      console.log('\n👥 Checking users...');
      
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      this.stats.users = count || 0;
      console.log(`   Total Users: ${this.stats.users}`);

      // Get additional user details
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, email, created_at, is_suspended')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!usersError && users && users.length > 0) {
        console.log('\n   📋 Recent Users (last 5):');
        users.forEach((user, index) => {
          const createdDate = new Date(user.created_at).toLocaleDateString();
          const status = user.is_suspended ? '🔴 Suspended' : '🟢 Active';
          console.log(`      ${index + 1}. ${user.username || user.email} - ${status} - ${createdDate}`);
        });
      }

      // Get suspended users count
      const { count: suspendedCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_suspended', true);

      if (suspendedCount > 0) {
        console.log(`\n   ⚠️  Suspended Users: ${suspendedCount}`);
      }

    } catch (error) {
      console.error('   ❌ Error checking users:', error.message);
    }
  }

  /**
   * Check total number of projects
   */
  async checkProjects() {
    try {
      console.log('\n📦 Checking projects...');
      
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      this.stats.projects = count || 0;
      console.log(`   Total Projects: ${this.stats.projects}`);

      // Get recent projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          status,
          difficulty_level,
          current_members,
          maximum_members,
          created_at,
          users:owner_id (username, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!projectsError && projects && projects.length > 0) {
        console.log('\n   📋 Recent Projects (last 5):');
        projects.forEach((project, index) => {
          const createdDate = new Date(project.created_at).toLocaleDateString();
          const owner = project.users?.username || project.users?.full_name || 'Unknown';
          const members = `${project.current_members}/${project.maximum_members}`;
          const statusIcon = this.getStatusIcon(project.status);
          console.log(`      ${index + 1}. ${project.title}`);
          console.log(`         ${statusIcon} ${project.status} | ${project.difficulty_level} | Members: ${members}`);
          console.log(`         Owner: ${owner} | Created: ${createdDate}`);
        });
      }

    } catch (error) {
      console.error('   ❌ Error checking projects:', error.message);
    }
  }

  /**
   * Check projects by status
   */
  async checkProjectsByStatus() {
    try {
      console.log('\n📊 Checking projects by status...');

      const statuses = ['recruiting', 'active', 'completed', 'on_hold', 'cancelled'];
      
      for (const status of statuses) {
        const { count, error } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);

        if (!error) {
          const statusCount = count || 0;
          const icon = this.getStatusIcon(status);
          console.log(`   ${icon} ${status.charAt(0).toUpperCase() + status.slice(1)}: ${statusCount}`);
          
          // Store specific status counts
          if (status === 'active') this.stats.activeProjects = statusCount;
          if (status === 'recruiting') this.stats.recruitingProjects = statusCount;
          if (status === 'completed') this.stats.completedProjects = statusCount;
        }
      }

    } catch (error) {
      console.error('   ❌ Error checking projects by status:', error.message);
    }
  }

  /**
   * Check coding challenges
   */
  async checkCodingChallenges() {
    try {
      console.log('\n🧩 Checking coding challenges...');
      
      const { count, error } = await supabase
        .from('coding_challenges')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      this.stats.codingChallenges = count || 0;
      console.log(`   Total Coding Challenges: ${this.stats.codingChallenges}`);

      // Get challenges by difficulty
      const difficulties = ['easy', 'medium', 'hard', 'expert'];
      console.log('\n   📊 By Difficulty:');
      
      for (const difficulty of difficulties) {
        const { count: diffCount } = await supabase
          .from('coding_challenges')
          .select('*', { count: 'exact', head: true })
          .eq('difficulty_level', difficulty);

        if (diffCount > 0) {
          console.log(`      ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}: ${diffCount}`);
        }
      }

    } catch (error) {
      console.error('   ❌ Error checking coding challenges:', error.message);
    }
  }

  /**
   * Check challenge attempts
   */
  async checkChallengeAttempts() {
    try {
      console.log('\n📝 Checking challenge attempts...');
      
      const { count, error } = await supabase
        .from('challenge_attempts')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      this.stats.challengeAttempts = count || 0;
      console.log(`   Total Challenge Attempts: ${this.stats.challengeAttempts}`);

      // Get attempts by status
      const { count: passedCount } = await supabase
        .from('challenge_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'passed');

      const { count: failedCount } = await supabase
        .from('challenge_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      if (this.stats.challengeAttempts > 0) {
        const passRate = ((passedCount / this.stats.challengeAttempts) * 100).toFixed(1);
        console.log(`\n   📊 Attempt Statistics:`);
        console.log(`      ✅ Passed: ${passedCount} (${passRate}%)`);
        console.log(`      ❌ Failed: ${failedCount} (${(100 - passRate).toFixed(1)}%)`);
      }

    } catch (error) {
      console.error('   ❌ Error checking challenge attempts:', error.message);
    }
  }

  /**
   * Check project members
   */
  async checkProjectMembers() {
    try {
      console.log('\n👥 Checking project members...');
      
      const { count, error } = await supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      this.stats.projectMembers = count || 0;
      console.log(`   Total Project Memberships: ${this.stats.projectMembers}`);

      // Get members by role
      const roles = ['owner', 'admin', 'member', 'contributor'];
      console.log('\n   📊 By Role:');
      
      for (const role of roles) {
        const { count: roleCount } = await supabase
          .from('project_members')
          .select('*', { count: 'exact', head: true })
          .eq('role', role);

        if (roleCount > 0) {
          console.log(`      ${role.charAt(0).toUpperCase() + role.slice(1)}: ${roleCount}`);
        }
      }

      // Active vs inactive members
      const { count: activeCount } = await supabase
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      console.log(`\n   🟢 Active Members: ${activeCount}`);

    } catch (error) {
      console.error('   ❌ Error checking project members:', error.message);
    }
  }

  /**
   * Check learning recommendations
   */
  async checkLearningRecommendations() {
    try {
      console.log('\n🎓 Checking learning recommendations...');
      
      const { count, error } = await supabase
        .from('learning_recommendations')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      this.stats.learningRecommendations = count || 0;
      console.log(`   Total Learning Recommendations: ${this.stats.learningRecommendations}`);

      if (this.stats.learningRecommendations > 0) {
        // Get completed recommendations
        const { count: completedCount } = await supabase
          .from('learning_recommendations')
          .select('*', { count: 'exact', head: true })
          .not('completed_at', 'is', null);

        const completionRate = ((completedCount / this.stats.learningRecommendations) * 100).toFixed(1);
        console.log(`\n   📊 Recommendation Statistics:`);
        console.log(`      ✅ Completed: ${completedCount} (${completionRate}%)`);
        console.log(`      ⏳ Pending: ${this.stats.learningRecommendations - completedCount}`);

        // Get by difficulty
        const difficulties = ['beginner', 'intermediate', 'advanced'];
        console.log(`\n   📊 By Difficulty:`);
        
        for (const difficulty of difficulties) {
          const { count: diffCount } = await supabase
            .from('learning_recommendations')
            .select('*', { count: 'exact', head: true })
            .eq('difficulty_level', difficulty);

          if (diffCount > 0) {
            console.log(`      ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}: ${diffCount}`);
          }
        }
      }

    } catch (error) {
      console.error('   ❌ Error checking learning recommendations:', error.message);
    }
  }

  /**
   * Get status icon for display
   */
  getStatusIcon(status) {
    const icons = {
      'recruiting': '📢',
      'active': '🟢',
      'completed': '✅',
      'on_hold': '⏸️',
      'cancelled': '❌'
    };
    return icons[status] || '📦';
  }

  /**
   * Print summary of all statistics
   */
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 DATABASE STATISTICS SUMMARY');
    console.log('='.repeat(70));
    console.log('\n📈 Core Metrics:');
    console.log(`   Total Users: ${this.stats.users}`);
    console.log(`   Total Projects: ${this.stats.projects}`);
    console.log(`   Total Coding Challenges: ${this.stats.codingChallenges}`);
    console.log(`   Total Challenge Attempts: ${this.stats.challengeAttempts}`);
    console.log(`   Total Project Memberships: ${this.stats.projectMembers}`);
    console.log(`   Total Learning Recommendations: ${this.stats.learningRecommendations}`);

    console.log('\n📊 Project Breakdown:');
    console.log(`   📢 Recruiting: ${this.stats.recruitingProjects}`);
    console.log(`   🟢 Active: ${this.stats.activeProjects}`);
    console.log(`   ✅ Completed: ${this.stats.completedProjects}`);

    if (this.stats.users > 0 && this.stats.projects > 0) {
      const avgProjectsPerUser = (this.stats.projects / this.stats.users).toFixed(2);
      const avgMembersPerProject = (this.stats.projectMembers / this.stats.projects).toFixed(2);
      
      console.log('\n📊 Engagement Metrics:');
      console.log(`   Avg Projects per User: ${avgProjectsPerUser}`);
      console.log(`   Avg Members per Project: ${avgMembersPerProject}`);
    }

    if (this.stats.challengeAttempts > 0) {
      const avgAttemptsPerUser = (this.stats.challengeAttempts / this.stats.users).toFixed(2);
      console.log(`   Avg Challenge Attempts per User: ${avgAttemptsPerUser}`);
    }

    console.log('\n' + '='.repeat(70));
  }

  /**
   * Export statistics to JSON file
   */
  exportStats() {
    try {
      const filename = `database-stats-${new Date().toISOString().split('T')[0]}.json`;
      const jsonContent = JSON.stringify(this.stats, null, 2);
      
      const fs = require('fs');
      fs.writeFileSync(filename, jsonContent);
      
      console.log(`\n💾 Statistics exported to: ${filename}`);
    } catch (error) {
      console.error('❌ Error exporting statistics:', error.message);
    }
  }
}

// Run the checker
if (require.main === module) {
  const checker = new DatabaseStatsChecker();
  checker.checkAllStats()
    .then(() => {
      console.log('\n✨ Database statistics check completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = DatabaseStatsChecker;