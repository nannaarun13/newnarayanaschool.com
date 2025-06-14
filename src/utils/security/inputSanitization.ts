
import DOMPurify from 'dompurify';

export interface SanitizationOptions {
  allowHTML?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  stripTags?: boolean;
  preventXSS?: boolean;
}

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
    sanitized = sanitized
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
  }

  if (allowHTML) {
    // Enhanced DOMPurify configuration for stricter HTML sanitization
    sanitized = DOMPurify.sanitize(sanitized, {
      ALLOWED_TAGS: allowedTags.length > 0 ? allowedTags : ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: ['class', 'id'],
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe', 'link', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      ALLOW_DATA_ATTR: false,
      SANITIZE_DOM: true,
      KEEP_CONTENT: false
    });
  } else if (stripTags) {
    // Remove all HTML tags and decode entities
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    // Decode HTML entities to prevent double encoding attacks
    const textarea = document.createElement('textarea');
    textarea.innerHTML = sanitized;
    sanitized = textarea.value;
  }

  // Enhanced dangerous character removal
  sanitized = sanitized
    .replace(/[<>"'&`\\]/g, '') // Remove dangerous characters
    .replace(/\x00/g, '') // Remove null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/[\u0080-\u009F]/g, '') // Remove additional control characters
    .replace(/\uFEFF/g, '') // Remove byte order mark
    .replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters

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

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken || typeof token !== 'string' || typeof expectedToken !== 'string') {
    return false;
  }
  
  // Enhanced validation for token format
  if (token.length !== expectedToken.length || token.length < 16) {
    return false;
  }
  
  // Check for valid token format (hexadecimal)
  if (!/^[a-f0-9]+$/i.test(token) || !/^[a-f0-9]+$/i.test(expectedToken)) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
};

// New function for validating request origin
export const validateOrigin = (origin: string, allowedOrigins: string[]): boolean => {
  if (!origin || typeof origin !== 'string') {
    return false;
  }
  
  const sanitizedOrigin = sanitizeInput(origin, { 
    maxLength: 500, 
    preventXSS: true, 
    stripTags: true 
  });
  
  return allowedOrigins.some(allowed => {
    try {
      const allowedUrl = new URL(allowed);
      const originUrl = new URL(sanitizedOrigin);
      return allowedUrl.origin === originUrl.origin;
    } catch {
      return false;
    }
  });
};

// Enhanced URL validation
export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow safe protocols
    const allowedProtocols = ['https:', 'http:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '';
    }
    
    // Prevent dangerous domains
    const dangerousDomains = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousDomains.some(domain => url.toLowerCase().includes(domain))) {
      return '';
    }
    
    return urlObj.toString();
  } catch {
    return '';
  }
};
