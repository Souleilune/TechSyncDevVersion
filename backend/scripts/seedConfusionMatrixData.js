// scripts/seedConfusionMatrixData.js - Improved with constraint handling
require('dotenv').config();

// Validate environment variables before importing anything else
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

class DataSeeder {
    constructor() {
        this.userIds = [];
        this.projectIds = [];
        this.challengeIds = [];
        this.recommendationCount = 100;
        this.attemptCount = 80;
        this.existingRecommendations = new Set();
    }

    async seedConfusionMatrixData() {
        try {
            console.log('🌱 Starting to seed confusion matrix data...');

            await this.testConnection();
            await this.getExistingData();

            if (this.userIds.length === 0 || this.projectIds.length === 0) {
                console.log('⚠️  No users or projects found. Please create some users and projects first.');
                return;
            }

            // Clean up old test data first
            await this.cleanupOldData();

            // Seed recommendation data with feedback
            await this.seedRecommendationData();

            // Seed challenge attempts with assessments
            await this.seedChallengeAssessmentData();

            console.log('✅ Confusion matrix data seeding completed!');
            
        } catch (error) {
            console.error('❌ Error seeding data:', error);
        }
    }

    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('count', { count: 'exact', head: true });
            
            if (error) throw error;
            console.log('✅ Supabase connection successful');
        } catch (error) {
            console.error('❌ Supabase connection failed:', error.message);
            throw new Error('Cannot connect to Supabase. Check your configuration.');
        }
    }

    async getExistingData() {
        try {
            // Get user IDs
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .limit(20);
            
            if (userError) throw userError;
            this.userIds = users?.map(u => u.id) || [];

            // Get project IDs
            const { data: projects, error: projectError } = await supabase
                .from('projects')
                .select('id')
                .limit(15);
            
            if (projectError) throw projectError;
            this.projectIds = projects?.map(p => p.id) || [];

            // Get challenge IDs (optional)
            const { data: challenges } = await supabase
                .from('coding_challenges')
                .select('id')
                .limit(10);
            
            this.challengeIds = challenges?.map(c => c.id) || [];

            // Get existing recommendations to avoid duplicates
            const { data: existingRecs } = await supabase
                .from('project_recommendations')
                .select('user_id, project_id');
            
            (existingRecs || []).forEach(rec => {
                this.existingRecommendations.add(`${rec.user_id}:${rec.project_id}`);
            });

            console.log(`Found ${this.userIds.length} users, ${this.projectIds.length} projects, ${this.challengeIds.length} challenges`);
            console.log(`Found ${this.existingRecommendations.size} existing recommendations`);
        } catch (error) {
            console.error('Error getting existing data:', error);
            throw error;
        }
    }

    async cleanupOldData() {
        try {
            console.log('🧹 Cleaning up old test data...');
            
            // Delete old feedback first (due to foreign key constraints)
            const { error: feedbackError } = await supabase
                .from('recommendation_feedback')
                .delete()
                .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Older than 7 days

            if (feedbackError) {
                console.log('Note: Could not clean old feedback:', feedbackError.message);
            }

            // Delete old recommendations
            const { error: recError } = await supabase
                .from('project_recommendations')
                .delete()
                .lt('recommended_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Older than 7 days

            if (recError) {
                console.log('Note: Could not clean old recommendations:', recError.message);
            }

            console.log('✅ Cleanup completed');
        } catch (error) {
            console.log('⚠️  Cleanup failed (this is okay):', error.message);
        }
    }

    async seedRecommendationData() {
        console.log('📊 Seeding recommendation data...');

        const recommendations = [];
        const feedbacks = [];
        const now = new Date();

        // Generate unique user-project combinations
        const usedCombinations = new Set(this.existingRecommendations);
        let successfulRecs = 0;

        for (let i = 0; i < this.recommendationCount && successfulRecs < 50; i++) {
            const userId = this.getRandomElement(this.userIds);
            const projectId = this.getRandomElement(this.projectIds);
            const combination = `${userId}:${projectId}`;

            // Skip if this combination already exists
            if (usedCombinations.has(combination)) {
                continue;
            }

            usedCombinations.add(combination);
            successfulRecs++;

            const recommendationScore = this.generateRecommendationScore();
            const daysAgo = Math.floor(Math.random() * 60);
            const recommendedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

            const recommendationId = uuidv4();

            // Create recommendation
            const recommendation = {
                id: recommendationId,
                user_id: userId,
                project_id: projectId,
                recommendation_score: recommendationScore,
                match_factors: this.generateMatchFactors(),
                recommended_at: recommendedAt.toISOString()
            };

            // Generate realistic user behavior
            const behavior = this.generateUserBehavior(recommendationScore);
            
            if (behavior.viewed) {
                recommendation.viewed_at = new Date(recommendedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString();
            }
            if (behavior.clicked) {
                recommendation.clicked_at = new Date(recommendedAt.getTime() + Math.random() * 48 * 60 * 60 * 1000).toISOString();
            }
            if (behavior.applied) {
                recommendation.applied_at = new Date(recommendedAt.getTime() + Math.random() * 72 * 60 * 60 * 1000).toISOString();
            }

            recommendations.push(recommendation);

            // Generate feedback based on behavior
            if (behavior.providedFeedback) {
                const feedback = {
                    id: uuidv4(),
                    recommendation_id: recommendationId,
                    user_id: userId,
                    project_id: projectId,
                    action_taken: behavior.action,
                    feedback_score: behavior.feedbackScore,
                    created_at: new Date(recommendedAt.getTime() + Math.random() * 96 * 60 * 60 * 1000).toISOString()
                };
                feedbacks.push(feedback);
            }

            // Simulate project joins for positive cases
            if (behavior.joined) {
                await this.createProjectMembership(userId, projectId, recommendedAt);
            }
        }

        // Insert recommendations first
        if (recommendations.length > 0) {
            await this.insertInBatches(recommendations, 'project_recommendations', 25);
            console.log(`✅ Inserted ${recommendations.length} recommendations`);
        }

        // Then insert feedback (after recommendations exist)
        if (feedbacks.length > 0) {
            await this.insertInBatches(feedbacks, 'recommendation_feedback', 25);
            console.log(`✅ Inserted ${feedbacks.length} feedback records`);
        }
    }

    async seedChallengeAssessmentData() {
        console.log('🧪 Seeding challenge assessment data...');

        if (this.challengeIds.length === 0) {
            await this.createBasicChallenges();
        }

        const attempts = [];
        const now = new Date();

        for (let i = 0; i < this.attemptCount; i++) {
            const userId = this.getRandomElement(this.userIds);
            const projectId = this.getRandomElement(this.projectIds);
            const challengeId = this.challengeIds.length > 0 ? this.getRandomElement(this.challengeIds) : null;
            const daysAgo = Math.floor(Math.random() * 45);
            const submittedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

            const assessmentData = this.generateAssessmentData();

            const attempt = {
                user_id: userId,
                project_id: projectId,
                challenge_id: challengeId,
                submitted_code: this.generateMockCode(assessmentData.score),
                score: assessmentData.score,
                status: assessmentData.status,
                test_cases_passed: assessmentData.testCasesPassed,
                total_test_cases: assessmentData.totalTestCases,
                code_quality_score: assessmentData.codeQualityScore,
                execution_time_ms: Math.floor(Math.random() * 5000) + 100,
                memory_usage_mb: Math.floor(Math.random() * 50) + 10,
                solve_time_minutes: Math.floor(Math.random() * 60) + 5,
                submitted_at: submittedAt.toISOString(),
                feedback: this.generateFeedbackText(assessmentData.score)
            };

            attempts.push(attempt);

            // Create project membership based on performance
            if (assessmentData.shouldJoinProject) {
                await this.createProjectMembership(userId, projectId, submittedAt, assessmentData.contributionScore);
            }
        }

        // Insert challenge attempts
        await this.insertInBatches(attempts, 'challenge_attempts', 30);
        console.log(`✅ Inserted ${attempts.length} challenge attempts`);
    }

    async createBasicChallenges() {
        console.log('🔧 Creating basic challenges...');
        
        const challenges = [
            {
                title: 'Fibonacci Sequence',
                description: 'Write a function to calculate the nth Fibonacci number',
                difficulty_level: 'beginner',
                expected_solution: 'function fibonacci(n) { if (n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2); }',
                test_cases: JSON.stringify([
                    { input: '0', expected: '0' },
                    { input: '1', expected: '1' },
                    { input: '5', expected: '5' }
                ])
            },
            {
                title: 'Array Sum',
                description: 'Calculate the sum of all numbers in an array',
                difficulty_level: 'beginner',
                expected_solution: 'function arraySum(arr) { return arr.reduce((sum, num) => sum + num, 0); }',
                test_cases: JSON.stringify([
                    { input: '[1,2,3]', expected: '6' },
                    { input: '[]', expected: '0' }
                ])
            }
        ];

        try {
            const { data, error } = await supabase
                .from('coding_challenges')
                .insert(challenges)
                .select('id');

            if (error) throw error;
            this.challengeIds = data?.map(c => c.id) || [];
            console.log(`✅ Created ${challenges.length} basic challenges`);
        } catch (error) {
            console.error('Error creating challenges:', error);
            // Continue without challenges
        }
    }

    async insertInBatches(data, tableName, batchSize) {
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }

        let successCount = 0;
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            
            try {
                const { error } = await supabase
                    .from(tableName)
                    .insert(batch);

                if (error) {
                    console.error(`Error inserting batch ${i + 1} into ${tableName}:`, error);
                    // Try individual inserts for failed batch
                    for (const item of batch) {
                        try {
                            const { error: individualError } = await supabase
                                .from(tableName)
                                .insert([item]);
                            if (!individualError) successCount++;
                        } catch (e) {
                            // Skip individual failures
                        }
                    }
                } else {
                    console.log(`✅ Inserted batch ${i + 1} (${batch.length} records) into ${tableName}`);
                    successCount += batch.length;
                }
            } catch (error) {
                console.error(`Error with batch ${i + 1}:`, error);
            }
        }

        console.log(`📊 Total successful inserts into ${tableName}: ${successCount}/${data.length}`);
    }

    generateRecommendationScore() {
        const rand = Math.random();
        if (rand < 0.2) return Math.floor(Math.random() * 20) + 80; // 20% high scores (80-100)
        if (rand < 0.5) return Math.floor(Math.random() * 15) + 65; // 30% medium scores (65-80)
        return Math.floor(Math.random() * 15) + 50; // 50% lower scores (50-65)
    }

    generateMatchFactors() {
        return {
            topicMatch: Math.floor(Math.random() * 100),
            experienceMatch: Math.floor(Math.random() * 100),
            languageMatch: Math.floor(Math.random() * 100),
            projectComplexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        };
    }

    generateUserBehavior(recommendationScore) {
        const behavior = {
            viewed: false,
            clicked: false,
            applied: false,
            joined: false,
            providedFeedback: false,
            action: 'ignored',
            feedbackScore: null
        };

        const engagementProb = recommendationScore / 100;

        if (Math.random() < engagementProb * 0.8) {
            behavior.viewed = true;
            behavior.action = 'viewed';

            if (Math.random() < engagementProb * 0.6) {
                behavior.clicked = true;

                if (Math.random() < engagementProb * 0.4) {
                    behavior.applied = true;
                    behavior.action = 'applied';

                    if (Math.random() < engagementProb * 0.3) {
                        behavior.joined = true;
                        behavior.action = 'joined';
                    }
                }
            }

            if (Math.random() < 0.3) {
                behavior.providedFeedback = true;
                
                if (behavior.joined) {
                    behavior.feedbackScore = Math.floor(Math.random() * 2) + 4; // 4-5
                } else if (behavior.applied) {
                    behavior.feedbackScore = Math.floor(Math.random() * 2) + 3; // 3-4
                } else if (behavior.clicked) {
                    behavior.feedbackScore = Math.floor(Math.random() * 3) + 2; // 2-4
                } else {
                    behavior.feedbackScore = Math.floor(Math.random() * 3) + 1; // 1-3
                }
            }
        }

        return behavior;
    }

    generateAssessmentData() {
        const score = Math.floor(Math.random() * 100);
        const totalTestCases = Math.floor(Math.random() * 10) + 5;
        const testCasesPassed = Math.floor((score / 100) * totalTestCases + Math.random() * 2);
        const codeQualityScore = Math.max(0, Math.min(100, score + (Math.random() - 0.5) * 20));
        const status = score >= 70 ? 'passed' : 'failed';
        const shouldJoinProject = score >= 70 && Math.random() < 0.6;
        const contributionScore = shouldJoinProject ? Math.floor(Math.random() * 40) + 60 : 0;

        return {
            score,
            status,
            testCasesPassed: Math.min(testCasesPassed, totalTestCases),
            totalTestCases,
            codeQualityScore: Math.floor(codeQualityScore),
            shouldJoinProject,
            contributionScore
        };
    }

    generateMockCode(score) {
        const codeExamples = {
            high: `function fibonacci(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}`,
            medium: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
            low: `function fibonacci(n) {
    if (n == 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n-1) + fibonacci(n-2);
}`
        };

        if (score >= 80) return codeExamples.high;
        if (score >= 60) return codeExamples.medium;
        return codeExamples.low;
    }

    generateFeedbackText(score) {
        if (score >= 90) return "Excellent solution! Clean code with optimal algorithm.";
        if (score >= 80) return "Great work! Your solution is efficient and well-structured.";
        if (score >= 70) return "Good job! Solution works correctly with minor improvements needed.";
        if (score >= 60) return "Decent attempt. Consider optimizing your approach.";
        return "Keep practicing! Review the requirements and try again.";
    }

    async createProjectMembership(userId, projectId, joinDate, contributionScore = null) {
        try {
            const { data: existing } = await supabase
                .from('project_members')
                .select('id')
                .eq('user_id', userId)
                .eq('project_id', projectId)
                .single();

            if (existing) return; // Already exists

            const membership = {
                user_id: userId,
                project_id: projectId,
                role: 'member',
                status: 'active',
                joined_at: new Date(joinDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                contribution_score: contributionScore || Math.floor(Math.random() * 40) + 60
            };

            const { error } = await supabase
                .from('project_members')
                .upsert(membership);

            if (error) {
                console.error('Error creating project membership:', error);
            }

        } catch (error) {
            // Ignore errors for membership creation as it's not critical
        }
    }

    getRandomElement(array) {
        if (array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Run the seeder
const seeder = new DataSeeder();

if (require.main === module) {
    seeder.seedConfusionMatrixData()
        .then(() => {
            console.log('🎉 Data seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Data seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { DataSeeder };