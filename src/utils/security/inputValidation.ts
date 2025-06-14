
import { removeXSSPatterns, sanitizeHTML, stripHTMLTags, removeDangerousCharacters, SanitizationOptions } from './xssProtection';

// Enhanced input sanitization with comprehensive XSS protection
export const sanitizeInput = (
  input: unknown, 
  options: SanitizationOptions = {}
): string => {
  const {
    allowHTML = false,
    maxLength = 1000,
    allowedTags = [],
    stripTags = true,
    preventXSS = true
  } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Enhanced XSS prevention patterns
  if (preventXSS) {
    sanitized = removeXSSPatterns(sanitized);
  }

  if (allowHTML) {
    sanitized = sanitizeHTML(sanitized, allowedTags);
  } else if (stripTags) {
    sanitized = stripHTMLTags(sanitized);
  }

  // Enhanced dangerous character removal
  sanitized = removeDangerousCharacters(sanitized);

  // Normalize unicode and prevent homograph attacks
  sanitized = sanitized.normalize('NFKC');

  // Limit length and ensure it doesn't exceed bounds
  return sanitized.substring(0, Math.max(0, maxLength));
};

export const sanitizeEmail = (email: string): string => {
  const sanitized = sanitizeInput(email, { 
    maxLength: 100, 
    preventXSS: true, 
    stripTags: true 
  }).toLowerCase();
  
  // Enhanced email validation with additional security checks
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized) || sanitized.length < 5) {
    return '';
  }
  
  // Check for suspicious patterns and known attack vectors
  const suspiciousPatterns = [
    /\.\./,  // Double dots
    /^\./, // Starting with dot
    /\.$/, // Ending with dot
    /@.*@/, // Multiple @ symbols
    /[<>'"&]/,  // Dangerous characters
    /script/i, // Script tags
    /javascript/i // JavaScript protocol
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(sanitized))) {
    return '';
  }
  
  return sanitized;
};

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return 'unknown';
  }
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Allow only safe characters
    .replace(/_{2,}/g, '_') // Collapse multiple underscores
    .replace(/^[._-]+/, '') // Remove leading dots, underscores, dashes
    .replace(/[._-]+$/, '') // Remove trailing dots, underscores, dashes
    .substring(0, 255);
};
