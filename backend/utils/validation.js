// utils/validation.js
const validator = require('validator');

const validateUUID = (uuid) => {
    if (!uuid || typeof uuid !== 'string') return false;
    return validator.isUUID(uuid);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    // Basic HTML sanitization - remove potentially dangerous content
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]*>/g, '') // Remove all HTML tags for now
        .trim();
};

const validateCommentContent = (content) => {
    if (!content || typeof content !== 'string') {
        return { valid: false, error: 'Content is required' };
    }
    
    const trimmed = content.trim();
    
    if (trimmed.length === 0) {
        return { valid: false, error: 'Content cannot be empty' };
    }
    
    if (trimmed.length > 2000) {
        return { valid: false, error: 'Content too long (max 2000 characters)' };
    }
    
    return { valid: true, content: trimmed };
};

const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
};

module.exports = {
    validateUUID,
    sanitizeInput,
    validateCommentContent,
    rateLimitConfig
};