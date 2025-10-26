const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD
                }
            });

            // Verify connection
            await this.transporter.verify();
            this.initialized = true;
            console.log('✅ Email service initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
            throw new Error(`Email service initialization failed: ${error.message}`);
        }
    }

    async sendPasswordResetEmail(email, resetToken, username) {
        await this.initialize();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: `"TechSync Platform" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - TechSync',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6; 
                            color: #333;
                            background-color: #f5f5f5;
                            padding: 20px;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white; 
                            padding: 40px 30px; 
                            text-align: center;
                        }
                        .header h1 {
                            font-size: 28px;
                            font-weight: 600;
                            margin-bottom: 10px;
                        }
                        .content { 
                            padding: 40px 30px;
                            background: white;
                        }
                        .content p {
                            margin-bottom: 15px;
                            color: #555;
                            font-size: 16px;
                        }
                        .button-container {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .button { 
                            display: inline-block; 
                            padding: 14px 32px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white !important;
                            text-decoration: none;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 16px;
                        }
                        .url-box {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #667eea;
                            margin: 20px 0;
                            word-break: break-all;
                            font-size: 14px;
                            color: #667eea;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .warning strong {
                            color: #856404;
                        }
                        .footer { 
                            text-align: center; 
                            padding: 30px;
                            background: #f8f9fa;
                            color: #666;
                            font-size: 13px;
                            border-top: 1px solid #e9ecef;
                        }
                        .divider {
                            height: 1px;
                            background: linear-gradient(to right, transparent, #e9ecef, transparent);
                            margin: 25px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 0;">TechSync Platform</p>
                        </div>
                        
                        <div class="content">
                            <p>Hi <strong>${username}</strong>,</p>
                            
                            <p>We received a request to reset the password for your TechSync account.</p>
                            
                            <p>Click the button below to reset your password:</p>
                            
                            <div class="button-container">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <p style="font-size: 14px; color: #666;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            
                            <div class="url-box">
                                ${resetUrl}
                            </div>
                            
                            <div class="warning">
                                <strong>⏰ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
                            </div>
                            
                            <div class="divider"></div>
                            
                            <p style="font-size: 14px; color: #666;">
                                <strong>Didn't request this?</strong> You can safely ignore this email. 
                                Your password will remain unchanged.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} TechSync. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent to: ${email}`);
            console.log('Message ID:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Email sending error:', error);
            throw error;
        }
    }

    async sendPasswordResetConfirmation(email, username) {
        await this.initialize();

        const mailOptions = {
            from: `"TechSync Platform" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: '✅ Password Successfully Reset - TechSync',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #333;
                            background-color: #f5f5f5;
                            padding: 20px;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto;
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                            color: white; 
                            padding: 30px; 
                            text-align: center;
                        }
                        .content { 
                            padding: 30px;
                            background: white;
                        }
                        .content p {
                            margin-bottom: 15px;
                            color: #555;
                            font-size: 16px;
                        }
                        .footer { 
                            text-align: center; 
                            padding: 20px;
                            background: #f8f9fa;
                            color: #666; 
                            font-size: 13px;
                            border-top: 1px solid #e9ecef;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Password Reset Successful</h1>
                        </div>
                        <div class="content">
                            <p>Hi <strong>${username}</strong>,</p>
                            <p>Your TechSync password has been successfully reset.</p>
                            <p>You can now log in with your new password.</p>
                            <p><strong>If you didn't make this change</strong>, please contact support immediately at support@techsync.com</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} TechSync. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password confirmation email sent to: ${email}`);
        } catch (error) {
            console.error('❌ Confirmation email error:', error);
            // Don't throw - this is not critical
        }
    }

    async sendTestEmail(email) {
        await this.initialize();

        const mailOptions = {
            from: `"TechSync Platform" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: '🧪 Test Email - TechSync',
            html: `
                <h1>Test Email</h1>
                <p>If you're reading this, your email service is working correctly! 🎉</p>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Test email sent to: ${email}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Test email error:', error);
            throw error;
        }
    }
}

module.exports = new EmailService();