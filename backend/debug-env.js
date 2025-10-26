// scripts/debug-env.js
// Run this to check your environment variables: node scripts/debug-env.js

// Load environment variables explicitly
require('dotenv').config();

console.log('🔍 ENVIRONMENT VARIABLES DEBUG');
console.log('=' .repeat(50));

console.log('\n📂 Current Working Directory:');
console.log('  ', process.cwd());

console.log('\n📄 .env File Check:');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
console.log('  Expected .env location:', envPath);
console.log('  .env file exists:', fs.existsSync(envPath) ? '✅ YES' : '❌ NO');

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log('  .env file lines:', lines.length);
    
    // Check for required variables in file
    const hasSupabaseUrl = envContent.includes('SUPABASE_URL=');
    const hasSupabaseKey = envContent.includes('SUPABASE_SERVICE_KEY=') || envContent.includes('SUPABASE_ANON_KEY=');
    
    console.log('  Contains SUPABASE_URL:', hasSupabaseUrl ? '✅ YES' : '❌ NO');
    console.log('  Contains SUPABASE_KEY:', hasSupabaseKey ? '✅ YES' : '❌ NO');
}

console.log('\n🔧 Environment Variables Status:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('  PORT:', process.env.PORT || 'undefined');

// Check Supabase variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('\n🗄️  Supabase Configuration:');
console.log('  SUPABASE_URL:', supabaseUrl ? '✅ SET' : '❌ MISSING');
if (supabaseUrl) {
    console.log('    Preview:', supabaseUrl.substring(0, 30) + '...');
    console.log('    Looks valid:', supabaseUrl.includes('supabase.co') ? '✅ YES' : '⚠️  CHECK FORMAT');
}

console.log('  SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ SET' : '❌ MISSING');
if (supabaseServiceKey) {
    console.log('    Preview:', supabaseServiceKey.substring(0, 20) + '...');
    console.log('    Length:', supabaseServiceKey.length, '(should be >100 chars)');
}

console.log('  SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ SET' : '❌ MISSING');
if (supabaseAnonKey) {
    console.log('    Preview:', supabaseAnonKey.substring(0, 20) + '...');
    console.log('    Length:', supabaseAnonKey.length);
}

console.log('\n🔗 Testing Supabase Import:');
try {
    // Test if we can import the Supabase client
    const { createClient } = require('@supabase/supabase-js');
    console.log('  ✅ @supabase/supabase-js import successful');
    
    if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
        const client = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
        console.log('  ✅ Supabase client creation successful');
        console.log('  Client type:', typeof client);
        console.log('  Has .from method:', typeof client.from === 'function' ? '✅ YES' : '❌ NO');
    } else {
        console.log('  ⚠️  Cannot create client - missing credentials');
    }
    
} catch (error) {
    console.log('  ❌ Supabase import failed:', error.message);
}

console.log('\n🧪 Testing Config File:');
try {
    const configPath = path.join(process.cwd(), 'config', 'supabase.js');
    console.log('  Config file location:', configPath);
    console.log('  Config file exists:', fs.existsSync(configPath) ? '✅ YES' : '❌ NO');
    
    if (fs.existsSync(configPath)) {
        // Don't require it yet, just check if it would work
        console.log('  Config file can be read:', fs.readFileSync(configPath, 'utf8').length > 0 ? '✅ YES' : '❌ NO');
    }
} catch (error) {
    console.log('  ❌ Config test failed:', error.message);
}

console.log('\n💡 TROUBLESHOOTING TIPS:');

if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials:');
    console.log('   1. Check your .env file exists in the backend directory');
    console.log('   2. Make sure it contains:');
    console.log('      SUPABASE_URL=https://your-project.supabase.co');
    console.log('      SUPABASE_SERVICE_KEY=your-service-key');
    console.log('   3. Get these from: https://app.supabase.com/project/your-project/settings/api');
} else {
    console.log('✅ Supabase credentials look good!');
}

console.log('\n📦 Next Steps:');
console.log('   1. If credentials are missing, update your .env file');
console.log('   2. Run: node scripts/debug-env.js (this script) to verify');
console.log('   3. Then run: node scripts/seedConfusionMatrixData.js');

console.log('\n' + '='.repeat(50));