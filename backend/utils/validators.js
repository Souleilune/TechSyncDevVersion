const validator = require('validator');

class CustomValidators {
  // Validate password strength
  static isStrongPassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      checks: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  }

  // Validate programming experience level
  static isValidExperienceLevel(level) {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    return validLevels.includes(level);
  }

  // Validate project status
  static isValidProjectStatus(status) {
    const validStatuses = ['recruiting', 'active', 'completed', 'paused', 'cancelled'];
    return validStatuses.includes(status);
  }

  // Validate GitHub URL
  static isValidGitHubUrl(url) {
    if (!url) return true; // Optional field
    return url.startsWith('https://github.com/') && url.split('/').length >= 4;
  }

  // Validate LinkedIn URL
  static isValidLinkedInUrl(url) {
    if (!url) return true; // Optional field
    return url.startsWith('https://linkedin.com/') || url.startsWith('https://www.linkedin.com/');
  }

  // Sanitize user input
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .slice(0, 1000); // Limit length
  }

  // Validate UUID
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}