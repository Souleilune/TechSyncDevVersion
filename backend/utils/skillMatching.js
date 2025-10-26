// backend/utils/skillMatching.js - IMPROVED ERROR HANDLING

const storeRecommendations = async (userId, recommendations) => {
  try {
    // Use UPSERT (INSERT ... ON CONFLICT) instead of plain INSERT
    const { data, error } = await supabase
      .from('project_recommendations')
      .upsert(
        recommendations.map(rec => ({
          user_id: userId,
          project_id: rec.projectId,
          score: rec.score,
          reasoning: rec.reasoning,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        { 
          onConflict: 'user_id,project_id',
          ignoreDuplicates: false // Update existing records
        }
      );

    if (error) {
      console.error('Error upserting recommendations:', error);
      return false;
    }

    console.log(`✅ Successfully stored/updated ${recommendations.length} recommendations for user ${userId}`);
    return true;

  } catch (error) {
    // Handle the specific duplicate key error gracefully
    if (error.code === '23505') {
      console.warn(`⚠️ Duplicate recommendation detected for user ${userId} - this is normal and handled gracefully`);
      return true; // Consider this a success since the recommendation already exists
    }
    
    console.error('Unexpected error storing recommendations:', error);
    return false;
  }
};

// Alternative approach: Check before insert
const storeRecommendationsSafe = async (userId, recommendations) => {
  try {
    // First, get existing recommendations for this user
    const { data: existing } = await supabase
      .from('project_recommendations')
      .select('project_id')
      .eq('user_id', userId);

    const existingProjectIds = new Set(existing?.map(r => r.project_id) || []);
    
    // Filter out recommendations that already exist
    const newRecommendations = recommendations.filter(
      rec => !existingProjectIds.has(rec.projectId)
    );

    if (newRecommendations.length === 0) {
      console.log(`ℹ️ No new recommendations to store for user ${userId}`);
      return true;
    }

    // Insert only new recommendations
    const { data, error } = await supabase
      .from('project_recommendations')
      .insert(
        newRecommendations.map(rec => ({
          user_id: userId,
          project_id: rec.projectId,
          score: rec.score,
          reasoning: rec.reasoning,
          created_at: new Date().toISOString()
        }))
      );

    if (error) {
      console.error('Error inserting new recommendations:', error);
      return false;
    }

    console.log(`✅ Successfully stored ${newRecommendations.length} new recommendations for user ${userId}`);
    return true;

  } catch (error) {
    console.error('Error in safe recommendation storage:', error);
    return false;
  }
};

// Recommended: Use this in your skill matching service
const handleRecommendationStorage = async (userId, recommendations) => {
  const success = await storeRecommendations(userId, recommendations);
  
  if (!success) {
    // Log for monitoring but don't fail the request
    console.warn(`⚠️ Failed to store recommendations for user ${userId}, but continuing...`);
  }
  
  return recommendations; // Always return recommendations to user
};

module.exports = {
  storeRecommendations,
  storeRecommendationsSafe,
  handleRecommendationStorage
};