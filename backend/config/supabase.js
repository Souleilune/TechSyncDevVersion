// config/supabase.js
// Load environment variables if not already loaded
if (!process.env.SUPABASE_URL) {
    require('dotenv').config();
}

const { createClient } = require('@supabase/supabase-js');

// Enhanced validation with helpful error messages
if (!process.env.SUPABASE_URL) {
    console.error('❌ SUPABASE_URL is required but not found in environment variables');
    console.error('💡 Solutions:');
    console.error('   1. Create a .env file in your backend directory');
    console.error('   2. Add: SUPABASE_URL=https://your-project.supabase.co');
    console.error('   3. Get this URL from: https://app.supabase.com/project/your-project/settings/api');
    process.exit(1);
}

// Check for either service key or anon key
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!serviceKey && !anonKey) {
    console.error('❌ SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY is required');
    console.error('💡 Solutions:');
    console.error('   1. Add to your .env file: SUPABASE_SERVICE_KEY=your-service-key');
    console.error('   2. Or add: SUPABASE_ANON_KEY=your-anon-key');
    console.error('   3. Get these from: https://app.supabase.com/project/your-project/settings/api');
    console.error('   4. For backend operations, SERVICE_KEY is recommended');
    process.exit(1);
}

// Use service key if available, otherwise use anon key
const supabaseKey = serviceKey || anonKey;
const keyType = serviceKey ? 'service' : 'anon';

console.log('🔧 Supabase Configuration:');
console.log(`   URL: ${process.env.SUPABASE_URL}`);
console.log(`   Key Type: ${keyType}`);
console.log(`   Key Preview: ${supabaseKey.substring(0, 20)}...`);

// Create Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    supabaseKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Simple connection test function
const testConnection = async () => {
    try {
        console.log('🧪 Testing Supabase connection...');
        
        // Simple test query
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.log('⚠️  Connection test failed (this might be normal if tables don\'t exist yet)');
            console.log('   Error:', error.message);
            return false;
        }
        
        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.log('⚠️  Connection error:', error.message);
        return false;
    }
};

// Export the client and test function
module.exports = supabase;
module.exports.testConnection = testConnection;

// Test connection in development mode
if (process.env.NODE_ENV === 'development') {
    // Don't await this, just run it in background
    testConnection().catch(() => {
        // Ignore connection test failures in config
    });
}