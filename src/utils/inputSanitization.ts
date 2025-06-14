import DOMPurify from 'dompurify';

// Configure DOMPurify for strict sanitization
const purifyConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  FORCE_BODY: false,
  SANITIZE_NAMED_PROPS: true
};

export const sanitizeHtml = (dirty: string): string => {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, purifyConfig);
};

export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  let sanitized = input
    .replace(/[<>'"&`]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
  
  // Limit length
  return sanitized.substring(0, maxLength);
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  const sanitized = email.toLowerCase().trim();
  
  // Enhanced email validation with security checks
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(sanitized) || 
      sanitized.includes('..') || 
      sanitized.startsWith('.') || 
      sanitized.endsWith('.') ||
      sanitized.length < 5 || 
      sanitized.length > 100) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digit characters except +
  const sanitized = phone.replace(/[^\d+]/g, '');
  
  // Validate phone format
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  
  if (!phoneRegex.test(sanitized)) {
    throw new Error('Invalid phone number format');
  }
  
  return sanitized;
};

export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  
  // Allow only letters, spaces, hyphens, and apostrophes
  const sanitized = name
    .replace(/[^a-zA-Z\s\-']/g, '')
    .trim()
    .substring(0, 50);
  
  if (sanitized.length < 1) {
    throw new Error('Name must contain at least one letter');
  }
  
  return sanitized;
};

export const validateAndSanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    
    // Only allow https and http protocols
    if (!['https:', 'http:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    return urlObj.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
};

// CSRF token generation and validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken || token !== storedToken) {
    return false;
  }
  return true;
};
