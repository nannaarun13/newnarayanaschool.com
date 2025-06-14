
import DOMPurify from 'dompurify';

export interface SanitizationOptions {
  allowHTML?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  stripTags?: boolean;
}

// Enhanced input sanitization with comprehensive validation
export const sanitizeInput = (
  input: unknown, 
  options: SanitizationOptions = {}
): string => {
  const {
    allowHTML = false,
    maxLength = 1000,
    allowedTags = [],
    stripTags = true
  } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Remove potentially dangerous patterns
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers

  if (allowHTML) {
    // Use DOMPurify for HTML content with correct configuration
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: allowedTags.length > 0 ? allowedTags : ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: ['class', 'id'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      STRIP_COMMENTS: true
    });
  } else if (stripTags) {
    // Remove all HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Remove additional dangerous characters
  sanitized = sanitized
    .replace(/[<>"'&`]/g, '')
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters

  // Limit length
  return sanitized.substring(0, maxLength);
};

export const sanitizeEmail = (email: string): string => {
  const sanitized = sanitizeInput(email, { maxLength: 100 }).toLowerCase();
  
  // Enhanced email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized) || sanitized.length < 5) {
    return '';
  }
  
  // Check for suspicious patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    return '';
  }
  
  return sanitized;
};

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName || typeof fileName !== 'string') {
    return 'unknown';
  }
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken || typeof token !== 'string' || typeof expectedToken !== 'string') {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
};
