// scripts/testConfusionMatrix.js
// Run from backend directory: node scripts/testConfusionMatrix.js

const AnalyticsService = require('../services/analyticsService');
const { DataSeeder } = require('./seedConfusionMatrixData');

class ConfusionMatrixTester {
    constructor() {
        this.testResults = {
            recommendation: null,
            assessment: null,
            effectiveness: null,
            errors: []
        };
    }

    async runAllTests() {
        console.log('🧪 Starting Confusion Matrix Tests...\n');

        try {
            // Test 1: Check if we have real data or need to seed
            await this.testDataAvailability();

            // Test 2: Generate recommendation confusion matrix
            await this.testRecommendationMatrix();

            // Test 3: Generate assessment confusion matrix  
            await this.testAssessmentMatrix();

            // Test 4: Calculate effectiveness metrics
            await this.testEffectivenessMetrics();

            // Test 5: Validate matrix accuracy
            await this.validateMatrixAccuracy();

            // Test 6: Performance test
            await this.testPerformance();

            this.printTestResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.testResults.errors.push(`Test suite failed: ${error.message}`);
            this.printTestResults();
        }
    }

    async testDataAvailability() {
        console.log('📊 Testing data availability...');
        
        try {
            const supabase = require('../config/supabase');
            
            // Test connection first
            const { data: connectionTest, error: connectionError } = await supabase
                .from('users')
                .select('count', { count: 'exact', head: true });

            if (connectionError) {
                throw new Error(`Supabase connection failed: ${connectionError.message}`);
            }

            console.log('✅ Supabase connection successful');
            
            // Check for recommendation data
            const { data: recommendations, count: recCount } = await supabase
                .from('project_recommendations')
                .select('id', { count: 'exact' })
                .limit(1);

            // Check for feedback data
            const { data: feedback, count: feedbackCount } = await supabase
                .from('recommendation_feedback')
                .select('id', { count: 'exact' })
                .limit(1);

            // Check for challenge attempts
            const { data: attempts, count: attemptCount } = await supabase
                .from('challenge_attempts')
                .select('id', { count: 'exact' })
                .limit(1);

            const hasRecommendations = (recCount || 0) > 0;
            const hasFeedback = (feedbackCount || 0) > 0;
            const hasAttempts = (attemptCount || 0) > 0;

            console.log(`📈 Recommendations: ${hasRecommendations ? '✅' : '❌'} (${recCount || 0})`);
            console.log(`💬 Feedback: ${hasFeedback ? '✅' : '❌'} (${feedbackCount || 0})`);
            console.log(`🧪 Challenge Attempts: ${hasAttempts ? '✅' : '❌'} (${attemptCount || 0})`);

            if (!hasRecommendations || !hasFeedback) {
                console.log('⚠️  Insufficient data detected. Would you like to seed sample data? (Y/n)');
                
                // For automated testing, just seed the data
                console.log('🌱 Auto-seeding sample data...');
                const seeder = new DataSeeder();
                await seeder.seedConfusionMatrixData();
                console.log('✅ Sample data seeded successfully\n');
            } else {
                console.log('✅ Sufficient data available for testing\n');
            }

        } catch (error) {
            this.testResults.errors.push(`Data availability test failed: ${error.message}`);
            console.error('❌ Data availability test failed:', error);
            
            if (error.message.includes('connection') || error.message.includes('config')) {
                console.log('💡 Make sure your .env file has the correct Supabase credentials');
                console.log('💡 Check that your Supabase project is running and accessible');
            }
        }
    }

    async testRecommendationMatrix() {
        console.log('🎯 Testing recommendation confusion matrix...');
        
        try {
            const startTime = Date.now();
            
            // Test different timeframes
            const timeframes = ['30 days', '60 days', '90 days'];
            
            for (const timeframe of timeframes) {
                console.log(`  📅 Testing ${timeframe} timeframe...`);
                
                const matrix = await AnalyticsService.generateRecommendationConfusionMatrix(timeframe);
                
                // Validate matrix structure
                this.validateRecommendationMatrixStructure(matrix);
                
                // Check if matrix has real data (not all zeros)
                const hasRealData = this.hasRealData(matrix);
                console.log(`    📊 Real data: ${hasRealData ? '✅' : '❌'}`);
                
                if (timeframe === '30 days') {
                    this.testResults.recommendation = {
                        matrix,
                        hasRealData,
                        timeframe,
                        totalRecommendations: this.getTotalCount(matrix)
                    };
                }
            }
            
            const endTime = Date.now();
            console.log(`  ⏱️  Completed in ${endTime - startTime}ms\n`);
            
        } catch (error) {
            this.testResults.errors.push(`Recommendation matrix test failed: ${error.message}`);
            console.error('❌ Recommendation matrix test failed:', error);
        }
    }

    async testAssessmentMatrix() {
        console.log('🧪 Testing assessment confusion matrix...');
        
        try {
            const startTime = Date.now();
            
            const matrix = await AnalyticsService.generateAssessmentConfusionMatrix('30 days');
            
            // Validate matrix structure
            this.validateAssessmentMatrixStructure(matrix);
            
            // Check if matrix has real data
            const hasRealData = this.hasRealData(matrix);
            console.log(`  📊 Real data: ${hasRealData ? '✅' : '❌'}`);
            
            this.testResults.assessment = {
                matrix,
                hasRealData,
                totalAssessments: this.getTotalCount(matrix)
            };
            
            const endTime = Date.now();
            console.log(`  ⏱️  Completed in ${endTime - startTime}ms\n`);
            
        } catch (error) {
            this.testResults.errors.push(`Assessment matrix test failed: ${error.message}`);
            console.error('❌ Assessment matrix test failed:', error);
        }
    }

    async testEffectivenessMetrics() {
        console.log('📈 Testing effectiveness metrics calculation...');
        
        try {
            const startTime = Date.now();
            
            const metrics = await AnalyticsService.calculateEffectivenessMetrics();
            
            // Validate metrics structure
            this.validateEffectivenessMetrics(metrics);
            
            this.testResults.effectiveness = metrics;
            
            console.log('  📊 Metrics calculated:');
            console.log(`    🎯 Recommendation Accuracy: ${metrics.recommendation?.accuracy || 'N/A'}`);
            console.log(`    🎯 Assessment Accuracy: ${metrics.assessment?.accuracy || 'N/A'}`);
            console.log(`    📏 Precision: ${metrics.recommendation?.precision || 'N/A'}`);
            console.log(`    📏 Recall: ${metrics.recommendation?.recall || 'N/A'}`);
            console.log(`    📏 F1 Score: ${metrics.recommendation?.f1Score || 'N/A'}`);
            
            const endTime = Date.now();
            console.log(`  ⏱️  Completed in ${endTime - startTime}ms\n`);
            
        } catch (error) {
            this.testResults.errors.push(`Effectiveness metrics test failed: ${error.message}`);
            console.error('❌ Effectiveness metrics test failed:', error);
        }
    }

    async validateMatrixAccuracy() {
        console.log('🔍 Validating matrix accuracy...');
        
        try {
            const recMatrix = this.testResults.recommendation?.matrix;
            const assMatrix = this.testResults.assessment?.matrix;
            
            if (recMatrix) {
                const recAccuracy = AnalyticsService.calculateAccuracy(recMatrix);
                console.log(`  🎯 Recommendation matrix accuracy: ${recAccuracy}`);
                
                // Accuracy should be between 0 and 1
                if (recAccuracy < 0 || recAccuracy > 1) {
                    this.testResults.errors.push(`Invalid recommendation accuracy: ${recAccuracy}`);
                }
            }
            
            if (assMatrix) {
                const assAccuracy = AnalyticsService.calculateAccuracy(assMatrix);
                console.log(`  🎯 Assessment matrix accuracy: ${assAccuracy}`);
                
                // Accuracy should be between 0 and 1
                if (assAccuracy < 0 || assAccuracy > 1) {
                    this.testResults.errors.push(`Invalid assessment accuracy: ${assAccuracy}`);
                }
            }
            
            console.log('✅ Matrix accuracy validation completed\n');
            
        } catch (error) {
            this.testResults.errors.push(`Matrix accuracy validation failed: ${error.message}`);
            console.error('❌ Matrix accuracy validation failed:', error);
        }
    }

    async testPerformance() {
        console.log('⚡ Testing performance...');
        
        try {
            const iterations = 3;
            const times = [];
            
            for (let i = 0; i < iterations; i++) {
                const startTime = Date.now();
                
                await Promise.all([
                    AnalyticsService.generateRecommendationConfusionMatrix('30 days'),
                    AnalyticsService.generateAssessmentConfusionMatrix('30 days')
                ]);
                
                const endTime = Date.now();
                times.push(endTime - startTime);
            }
            
            const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
            const maxTime = Math.max(...times);
            const minTime = Math.min(...times);
            
            console.log(`  ⏱️  Average time: ${avgTime.toFixed(2)}ms`);
            console.log(`  ⏱️  Min time: ${minTime}ms`);
            console.log(`  ⏱️  Max time: ${maxTime}ms`);
            
            // Performance should be reasonable (under 10 seconds for testing)
            if (avgTime > 10000) {
                this.testResults.errors.push(`Performance too slow: ${avgTime}ms average`);
            }
            
            console.log('✅ Performance test completed\n');
            
        } catch (error) {
            this.testResults.errors.push(`Performance test failed: ${error.message}`);
            console.error('❌ Performance test failed:', error);
        }
    }

    validateRecommendationMatrixStructure(matrix) {
        const expectedKeys = ['high_confidence', 'medium_confidence', 'low_confidence'];
        const expectedSubKeys = ['positive', 'neutral', 'negative'];
        
        for (const key of expectedKeys) {
            if (!matrix[key]) {
                throw new Error(`Missing key in recommendation matrix: ${key}`);
            }
            
            for (const subKey of expectedSubKeys) {
                if (typeof matrix[key][subKey] !== 'number') {
                    throw new Error(`Invalid value for ${key}.${subKey}: ${matrix[key][subKey]}`);
                }
            }
        }
    }

    validateAssessmentMatrixStructure(matrix) {
        const expectedKeys = ['predicted_success', 'predicted_moderate', 'predicted_failure'];
        const expectedSubKeys = ['actual_success', 'actual_moderate', 'actual_failure'];
        
        for (const key of expectedKeys) {
            if (!matrix[key]) {
                throw new Error(`Missing key in assessment matrix: ${key}`);
            }
            
            for (const subKey of expectedSubKeys) {
                if (typeof matrix[key][subKey] !== 'number') {
                    throw new Error(`Invalid value for ${key}.${subKey}: ${matrix[key][subKey]}`);
                }
            }
        }
    }

    validateEffectivenessMetrics(metrics) {
        if (!metrics.recommendation || !metrics.assessment) {
            throw new Error('Missing recommendation or assessment metrics');
        }
        
        const requiredMetrics = ['accuracy'];
        for (const metric of requiredMetrics) {
            if (typeof metrics.recommendation[metric] !== 'number') {
                throw new Error(`Invalid recommendation ${metric}: ${metrics.recommendation[metric]}`);
            }
        }
    }

    hasRealData(matrix) {
        const total = this.getTotalCount(matrix);
        return total > 0;
    }

    getTotalCount(matrix) {
        return Object.values(matrix).reduce((total, row) => 
            total + Object.values(row).reduce((sum, count) => sum + count, 0), 0
        );
    }

    printTestResults() {
        console.log('\n📋 TEST RESULTS SUMMARY');
        console.log('=' .repeat(60));
        
        if (this.testResults.recommendation) {
            console.log('\n🎯 RECOMMENDATION MATRIX:');
            console.log(`  Total Recommendations: ${this.testResults.recommendation.totalRecommendations}`);
            console.log(`  Has Real Data: ${this.testResults.recommendation.hasRealData ? '✅' : '❌'}`);
            console.log('  Matrix Structure:');
            this.printMatrix(this.testResults.recommendation.matrix);
        }
        
        if (this.testResults.assessment) {
            console.log('\n🧪 ASSESSMENT MATRIX:');
            console.log(`  Total Assessments: ${this.testResults.assessment.totalAssessments}`);
            console.log(`  Has Real Data: ${this.testResults.assessment.hasRealData ? '✅' : '❌'}`);
            console.log('  Matrix Structure:');
            this.printMatrix(this.testResults.assessment.matrix);
        }
        
        if (this.testResults.effectiveness) {
            console.log('\n📈 EFFECTIVENESS METRICS:');
            console.log('  Recommendation Metrics:');
            console.log(`    Accuracy: ${this.testResults.effectiveness.recommendation?.accuracy || 'N/A'}`);
            console.log(`    Precision: ${this.testResults.effectiveness.recommendation?.precision || 'N/A'}`);
            console.log(`    Recall: ${this.testResults.effectiveness.recommendation?.recall || 'N/A'}`);
            console.log(`    F1 Score: ${this.testResults.effectiveness.recommendation?.f1Score || 'N/A'}`);
            
            console.log('  Assessment Metrics:');
            console.log(`    Accuracy: ${this.testResults.effectiveness.assessment?.accuracy || 'N/A'}`);
        }
        
        if (this.testResults.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
            console.log('\n🔧 TROUBLESHOOTING TIPS:');
            console.log('  - Check your .env file for correct Supabase credentials');
            console.log('  - Ensure your database tables exist and are accessible');
            console.log('  - Try running: node scripts/seedConfusionMatrixData.js');
        } else {
            console.log('\n✅ ALL TESTS PASSED!');
            console.log('🎉 Your confusion matrix implementation is working correctly!');
        }
        
        console.log('\n' + '='.repeat(60));
    }

    printMatrix(matrix) {
        Object.entries(matrix).forEach(([key, values]) => {
            const row = Object.entries(values)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
            console.log(`    ${key}: { ${row} }`);
        });
    }
}

// Usage
const tester = new ConfusionMatrixTester();

// Export for use in other scripts
module.exports = { ConfusionMatrixTester };

// If running directly
if (require.main === module) {
    tester.runAllTests()
        .then(() => {
            console.log('\n🎉 Testing completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Testing failed:', error);
            process.exit(1);
        });
}