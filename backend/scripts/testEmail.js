require('dotenv').config();
const emailService = require('../services/emailService');

async function testEmail() {
    console.log('🧪 Testing email service...\n');
    
    try {
        // Test with your actual email
        const testEmailAddress = process.env.GMAIL_USER; // Send to yourself
        
        console.log(`📧 Sending test email to: ${testEmailAddress}`);
        
        await emailService.sendTestEmail(testEmailAddress);
        
        console.log('\n✅ Email sent successfully!');
        console.log('📬 Check your inbox (and spam folder)');
        
    } catch (error) {
        console.error('\n❌ Email test failed:');
        console.error('Error:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.error('\n💡 Fix: Check your Gmail App Password');
            console.error('   - Make sure 2-Step Verification is enabled');
            console.error('   - Generate a new App Password at: https://myaccount.google.com/apppasswords');
            console.error('   - Copy it to .env as GMAIL_APP_PASSWORD');
        }
        
        if (error.message.includes('ENOTFOUND')) {
            console.error('\n💡 Fix: Check your internet connection');
        }
    }
}

testEmail();