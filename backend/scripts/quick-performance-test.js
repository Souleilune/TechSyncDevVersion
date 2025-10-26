// scripts/quick-performance-test.js
// Run this to test performance: node scripts/quick-performance-test.js

require('dotenv').config();

const AnalyticsService = require('../services/analyticsService');

async function runPerformanceTest() {
    console.log('🚀 Starting Quick Performance Test...\n');
    
    try {
        console.log('📊 Testing Recommendation Matrix...');
        const recStart = Date.now();
        const recMatrix = await AnalyticsService.generateRecommendationConfusionMatrix('30 days');
        const recEnd = Date.now();
        const recTime = recEnd - recStart;
        
        console.log(`⏱️  Recommendation Matrix: ${recTime}ms`);
        console.log(`📈 Total Recommendations: ${getTotalCount(recMatrix)}`);
        console.log(`📊 Matrix:`, recMatrix);
        
        console.log('\n🧪 Testing Assessment Matrix...');
        const assStart = Date.now();
        const assMatrix = await AnalyticsService.generateAssessmentConfusionMatrix('30 days');
        const assEnd = Date.now();
        const assTime = assEnd - assStart;
        
        console.log(`⏱️  Assessment Matrix: ${assTime}ms`);
        console.log(`📈 Total Assessments: ${getTotalCount(assMatrix)}`);
        console.log(`📊 Matrix:`, assMatrix);
        
        console.log('\n📈 Testing Full Metrics...');
        const metricsStart = Date.now();
        const metrics = await AnalyticsService.calculateEffectivenessMetrics();
        const metricsEnd = Date.now();
        const metricsTime = metricsEnd - metricsStart;
        
        console.log(`⏱️  Full Metrics: ${metricsTime}ms`);
        console.log(`🎯 Recommendation Accuracy: ${metrics.recommendation?.accuracy}`);
        console.log(`🎯 Assessment Accuracy: ${metrics.assessment?.accuracy}`);
        
        const totalTime = recTime + assTime;
        console.log('\n📋 PERFORMANCE SUMMARY');
        console.log('=' .repeat(40));
        console.log(`🏃‍♂️ Total Matrix Generation: ${totalTime}ms`);
        console.log(`📊 Recommendation Matrix: ${recTime}ms`);
        console.log(`🧪 Assessment Matrix: ${assTime}ms`);
        console.log(`📈 Full Metrics: ${metricsTime}ms`);
        
        // Performance thresholds
        if (totalTime < 5000) {
            console.log('✅ EXCELLENT: Performance under 5 seconds');
        } else if (totalTime < 10000) {
            console.log('✅ GOOD: Performance under 10 seconds');
        } else if (totalTime < 30000) {
            console.log('⚠️  ACCEPTABLE: Performance under 30 seconds');
        } else {
            console.log('❌ SLOW: Performance over 30 seconds - needs optimization');
        }
        
        console.log('\n🎉 Performance test completed!');
        
    } catch (error) {
        console.error('❌ Performance test failed:', error);
        process.exit(1);
    }
}

function getTotalCount(matrix) {
    return Object.values(matrix).reduce((total, row) => 
        total + Object.values(row).reduce((sum, count) => sum + count, 0), 0
    );
}

if (require.main === module) {
    runPerformanceTest()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('💥 Test failed:', error);
            process.exit(1);
        });
}

module.exports = { runPerformanceTest };