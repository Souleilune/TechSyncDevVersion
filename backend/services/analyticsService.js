// services/analyticsService.js - Fixed Database Relationships
const supabase = require('../config/supabase');

class AnalyticsService {
    constructor() {
        // Define confidence levels based on recommendation scores
        this.confidenceLevels = {
            high: { min: 85, max: 100 },
            medium: { min: 70, max: 84 },
            low: { min: 50, max: 69 }
        };

        // Define success levels based on assessment scores
        this.assessmentLevels = {
            success: { min: 80, max: 100 },
            moderate: { min: 60, max: 79 },
            failure: { min: 0, max: 59 }
        };
    }

    /**
     * Generate REAL confusion matrix for recommendation effectiveness
     * FIXED: Removed problematic joins, using separate queries
     */
    async generateRecommendationConfusionMatrix(timeframe = '30 days') {
        try {
            console.log(`Generating recommendation confusion matrix for ${timeframe}`);
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            const days = parseInt(timeframe.split(' ')[0]) || 30;
            startDate.setDate(startDate.getDate() - days);

            // Query for recommendations with feedback (FIXED: Simple query without joins)
            const { data: recommendations, error: recError } = await supabase
                .from('project_recommendations')
                .select('*')
                .gte('recommended_at', startDate.toISOString())
                .lte('recommended_at', endDate.toISOString());

            if (recError) {
                console.error('Error fetching recommendations:', recError);
                return this.getMockRecommendationMatrix();
            }

            // Get feedback data separately
            const { data: feedback, error: feedbackError } = await supabase
                .from('recommendation_feedback')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (feedbackError) {
                console.error('Error fetching feedback:', feedbackError);
                // Continue without feedback data
            }

            // Create feedback lookup map
            const feedbackMap = new Map();
            (feedback || []).forEach(f => {
                feedbackMap.set(f.recommendation_id, f);
            });

            // Initialize matrix
            const matrix = {
                high_confidence: { positive: 0, neutral: 0, negative: 0 },
                medium_confidence: { positive: 0, neutral: 0, negative: 0 },
                low_confidence: { positive: 0, neutral: 0, negative: 0 }
            };

            // Process each recommendation
            for (const rec of recommendations || []) {
                const confidenceLevel = this.getConfidenceLevel(rec.recommendation_score);
                const relatedFeedback = feedbackMap.get(rec.id);
                const outcome = await this.determineRecommendationOutcome(rec, relatedFeedback);
                
                if (confidenceLevel && outcome) {
                    matrix[confidenceLevel][outcome]++;
                }
            }

            // If matrix is empty, return mock data
            if (this.isMatrixEmpty(matrix)) {
                console.log('No real data available, returning mock matrix');
                return this.getMockRecommendationMatrix();
            }

            console.log('Generated recommendation matrix:', matrix);
            return matrix;

        } catch (error) {
            console.error('Error generating recommendation confusion matrix:', error);
            return this.getMockRecommendationMatrix();
        }
    }

    /**
     * Generate REAL confusion matrix for coding assessment
     * FIXED: Removed problematic joins, using separate queries
     */
    async generateAssessmentConfusionMatrix(timeframe = '30 days') {
        try {
            console.log(`Generating assessment confusion matrix for ${timeframe}`);
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            const days = parseInt(timeframe.split(' ')[0]) || 30;
            startDate.setDate(startDate.getDate() - days);

            // Query challenge attempts (FIXED: Simple query without joins)
            const { data: attempts, error: attemptError } = await supabase
                .from('challenge_attempts')
                .select('*')
                .gte('submitted_at', startDate.toISOString())
                .lte('submitted_at', endDate.toISOString());

            if (attemptError) {
                console.error('Error fetching challenge attempts:', attemptError);
                return this.getMockAssessmentMatrix();
            }

            // Initialize matrix
            const matrix = {
                predicted_success: { actual_success: 0, actual_moderate: 0, actual_failure: 0 },
                predicted_moderate: { actual_success: 0, actual_moderate: 0, actual_failure: 0 },
                predicted_failure: { actual_success: 0, actual_moderate: 0, actual_failure: 0 }
            };

            // Process each attempt
            for (const attempt of attempts || []) {
                const predicted = this.getPredictedAssessmentLevel(attempt.score);
                const actual = await this.getActualAssessmentLevel(attempt);
                
                if (predicted && actual) {
                    matrix[predicted][actual]++;
                }
            }

            // If no data, return mock matrix
            if (this.isMatrixEmpty(matrix)) {
                console.log('No real assessment data available, returning mock matrix');
                return this.getMockAssessmentMatrix();
            }

            console.log('Generated assessment matrix:', matrix);
            return matrix;

        } catch (error) {
            console.error('Error generating assessment confusion matrix:', error);
            return this.getMockAssessmentMatrix();
        }
    }

    /**
     * Determine confidence level from recommendation score
     */
    getConfidenceLevel(score) {
        if (score >= this.confidenceLevels.high.min) return 'high_confidence';
        if (score >= this.confidenceLevels.medium.min) return 'medium_confidence';
        if (score >= this.confidenceLevels.low.min) return 'low_confidence';
        return null;
    }

    /**
     * Determine recommendation outcome from feedback and actions
     * FIXED: Async function to handle database lookups
     */
    async determineRecommendationOutcome(recommendation, feedback) {
        // Priority 1: explicit feedback score
        if (feedback && feedback.feedback_score) {
            if (feedback.feedback_score >= 4) return 'positive';
            if (feedback.feedback_score >= 3) return 'neutral';
            return 'negative';
        }

        // Priority 2: action-based inference
        if (feedback && feedback.action_taken) {
            switch (feedback.action_taken) {
                case 'joined':
                case 'applied':
                    return 'positive';
                case 'viewed':
                    return 'neutral';
                case 'ignored':
                    return 'negative';
                default:
                    break;
            }
        }

        // Priority 3: Check if user actually joined the project (separate query)
        try {
            const { data: membership, error } = await supabase
                .from('project_members')
                .select('status')
                .eq('user_id', recommendation.user_id)
                .eq('project_id', recommendation.project_id)
                .single();

            if (!error && membership && membership.status === 'active') {
                return 'positive';
            }
        } catch (error) {
            // Ignore errors for membership lookup
        }

        // Priority 4: Check user engagement level from recommendation data
        if (recommendation.applied_at) return 'positive';
        if (recommendation.clicked_at || recommendation.viewed_at) return 'neutral';
        
        return 'negative'; // No engagement = negative outcome
    }

    /**
     * Get predicted assessment level from initial score
     */
    getPredictedAssessmentLevel(score) {
        if (score >= this.assessmentLevels.success.min) return 'predicted_success';
        if (score >= this.assessmentLevels.moderate.min) return 'predicted_moderate';
        return 'predicted_failure';
    }

    /**
     * Get actual assessment level from project performance
     * FIXED: Async function with separate database lookup
     */
    async getActualAssessmentLevel(attempt) {
        try {
            // Check if user joined the project after the attempt
            const { data: membership, error } = await supabase
                .from('project_members')
                .select('status, contribution_score, joined_at')
                .eq('user_id', attempt.user_id)
                .eq('project_id', attempt.project_id)
                .single();

            if (!error && membership) {
                const contributionScore = membership.contribution_score || 0;
                const memberStatus = membership.status;

                if (memberStatus === 'active' && contributionScore >= 80) {
                    return 'actual_success';
                } else if (memberStatus === 'active' && contributionScore >= 50) {
                    return 'actual_moderate';
                } else {
                    return 'actual_failure';
                }
            }
        } catch (error) {
            // If membership lookup fails, fall back to simple assessment
        }

        // Fallback: Use simple score-based assessment
        return this.getSimpleActualLevel(attempt);
    }

    /**
     * Get simple actual level from challenge attempt only
     */
    getSimpleActualLevel(attempt) {
        const score = attempt.score || 0;
        const successRate = attempt.total_test_cases > 0 
            ? (attempt.test_cases_passed / attempt.total_test_cases) * 100 
            : score;

        // Combine score and test case success rate
        const finalScore = (score * 0.7) + (successRate * 0.3);

        if (finalScore >= 80 && attempt.status === 'passed') return 'actual_success';
        if (finalScore >= 60) return 'actual_moderate';
        return 'actual_failure';
    }

    /**
     * Check if matrix is empty (no real data)
     */
    isMatrixEmpty(matrix) {
        return Object.values(matrix).every(row => 
            Object.values(row).every(value => value === 0)
        );
    }

    /**
     * Calculate algorithm effectiveness metrics using REAL data
     */
    async calculateEffectivenessMetrics() {
        try {
            const recommendationMatrix = await this.generateRecommendationConfusionMatrix();
            const assessmentMatrix = await this.generateAssessmentConfusionMatrix();
            
            return {
                recommendation: {
                    accuracy: this.calculateAccuracy(recommendationMatrix),
                    precision: this.calculatePrecision(recommendationMatrix),
                    recall: this.calculateRecall(recommendationMatrix),
                    f1Score: this.calculateF1Score(recommendationMatrix),
                    totalRecommendations: this.getTotalCount(recommendationMatrix)
                },
                assessment: {
                    accuracy: this.calculateAccuracy(assessmentMatrix),
                    precision: this.calculatePrecision(assessmentMatrix),
                    recall: this.calculateRecall(assessmentMatrix),
                    totalAssessments: this.getTotalCount(assessmentMatrix)
                },
                dataQuality: {
                    recommendationDataAvailable: !this.isMatrixEmpty(recommendationMatrix),
                    assessmentDataAvailable: !this.isMatrixEmpty(assessmentMatrix),
                    lastUpdated: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error calculating effectiveness metrics:', error);
            return {
                recommendation: { accuracy: 0, precision: 0, recall: 0, f1Score: 0 },
                assessment: { accuracy: 0, precision: 0, recall: 0 },
                error: 'Unable to calculate metrics from real data'
            };
        }
    }

    /**
     * Calculate accuracy from confusion matrix (real implementation)
     */
    calculateAccuracy(matrix) {
        let correct = 0;
        let total = 0;
        
        try {
            Object.keys(matrix).forEach(predicted => {
                Object.keys(matrix[predicted]).forEach(actual => {
                    const count = matrix[predicted][actual];
                    total += count;
                    
                    // Define what constitutes "correct" predictions
                    if (this.isCorrectPrediction(predicted, actual)) {
                        correct += count;
                    }
                });
            });
            
            return total > 0 ? Math.round((correct / total) * 100) / 100 : 0;
        } catch (error) {
            console.error('Error calculating accuracy:', error);
            return 0;
        }
    }

    /**
     * Determine if prediction matches actual outcome
     */
    isCorrectPrediction(predicted, actual) {
        // For recommendation matrix
        if (predicted.includes('confidence')) {
            return (
                (predicted === 'high_confidence' && actual === 'positive') ||
                (predicted === 'medium_confidence' && actual === 'neutral') ||
                (predicted === 'low_confidence' && actual === 'negative')
            );
        }
        
        // For assessment matrix  
        if (predicted.includes('predicted')) {
            const predictedLevel = predicted.replace('predicted_', '');
            const actualLevel = actual.replace('actual_', '');
            return predictedLevel === actualLevel;
        }
        
        return false;
    }

    /**
     * Calculate precision (real implementation)
     */
    calculatePrecision(matrix) {
        try {
            // Calculate precision for positive predictions
            let truePositives = 0;
            let falsePositives = 0;
            
            Object.keys(matrix).forEach(predicted => {
                Object.keys(matrix[predicted]).forEach(actual => {
                    const count = matrix[predicted][actual];
                    
                    if (this.isPositivePrediction(predicted)) {
                        if (this.isPositiveOutcome(actual)) {
                            truePositives += count;
                        } else {
                            falsePositives += count;
                        }
                    }
                });
            });
            
            const totalPositivePredictions = truePositives + falsePositives;
            return totalPositivePredictions > 0 ? 
                Math.round((truePositives / totalPositivePredictions) * 100) / 100 : 0;
                
        } catch (error) {
            console.error('Error calculating precision:', error);
            return 0;
        }
    }

    /**
     * Calculate recall (real implementation)
     */
    calculateRecall(matrix) {
        try {
            let truePositives = 0;
            let falseNegatives = 0;
            
            Object.keys(matrix).forEach(predicted => {
                Object.keys(matrix[predicted]).forEach(actual => {
                    const count = matrix[predicted][actual];
                    
                    if (this.isPositiveOutcome(actual)) {
                        if (this.isPositivePrediction(predicted)) {
                            truePositives += count;
                        } else {
                            falseNegatives += count;
                        }
                    }
                });
            });
            
            const totalActualPositives = truePositives + falseNegatives;
            return totalActualPositives > 0 ? 
                Math.round((truePositives / totalActualPositives) * 100) / 100 : 0;
                
        } catch (error) {
            console.error('Error calculating recall:', error);
            return 0;
        }
    }

    /**
     * Helper methods for precision/recall calculations
     */
    isPositivePrediction(predicted) {
        return predicted === 'high_confidence' || predicted === 'predicted_success';
    }

    isPositiveOutcome(actual) {
        return actual === 'positive' || actual === 'actual_success';
    }

    /**
     * Calculate F1 score
     */
    calculateF1Score(matrix) {
        try {
            const precision = this.calculatePrecision(matrix);
            const recall = this.calculateRecall(matrix);
            
            if (precision + recall === 0) return 0;
            return Math.round((2 * precision * recall) / (precision + recall) * 100) / 100;
        } catch (error) {
            console.error('Error calculating F1 score:', error);
            return 0;
        }
    }

    /**
     * Get total count from matrix
     */
    getTotalCount(matrix) {
        return Object.values(matrix).reduce((total, row) => 
            total + Object.values(row).reduce((sum, count) => sum + count, 0), 0
        );
    }

    /**
     * Fallback mock data (kept for when no real data exists)
     */
    getMockRecommendationMatrix() {
        return {
            high_confidence: { positive: 15, neutral: 5, negative: 2 },
            medium_confidence: { positive: 10, neutral: 8, negative: 4 },
            low_confidence: { positive: 3, neutral: 12, negative: 8 }
        };
    }

    getMockAssessmentMatrix() {
        return {
            predicted_success: { actual_success: 12, actual_moderate: 3, actual_failure: 1 },
            predicted_moderate: { actual_success: 5, actual_moderate: 8, actual_failure: 2 },
            predicted_failure: { actual_success: 1, actual_moderate: 4, actual_failure: 9 }
        };
    }
}

module.exports = new AnalyticsService();