
import DOMPurify from 'dompurify';

export interface SanitizationOptions {
  allowHTML?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  stripTags?: boolean;
  preventXSS?: boolean;
}

// Enhanced XSS prevention patterns
export const removeXSSPatterns = (input: string): string => {
  return input
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/url\s*\(/gi, '') // Remove CSS url() calls
    .replace(/import\s+/gi, '') // Remove import statements
    .replace(/@import/gi, '') // Remove CSS @import
    .replace(/eval\s*\(/gi, '') // Remove eval calls
    .replace(/Function\s*\(/gi, '') // Remove Function constructor
    .replace(/setTimeout\s*\(/gi, '') // Remove setTimeout
    .replace(/setInterval\s*\(/gi, ''); // Remove setInterval
};

// Enhanced HTML sanitization with DOMPurify
export const sanitizeHTML = (input: string, allowedTags: string[] = []): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: allowedTags.length > 0 ? allowedTags : ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: ['class', 'id'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe', 'link', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: false
  });
};

// Remove all HTML tags and decode entities
export const stripHTMLTags = (input: string): string => {
  const stripped = input.replace(/<[^>]*>/g, '');
  // Decode HTML entities to prevent double encoding attacks
  const textarea = document.createElement('textarea');
  textarea.innerHTML = stripped;
  return textarea.value;
};

// Enhanced dangerous character removal
export const removeDangerousCharacters = (input: string): string => {
  return input
    .replace(/[<>"'&`\\]/g, '') // Remove dangerous characters
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[\u0080-\u009F]/g, '') // Remove additional control characters
    .replace(/\uFEFF/g, '') // Remove byte order mark
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
};
