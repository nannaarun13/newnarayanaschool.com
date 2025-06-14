
import DOMPurify from 'dompurify';

// Configure DOMPurify for strict sanitization
const sanitizeConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  FORCE_BODY: false,
  USE_PROFILES: { html: false },
};

// Strict sanitization for content that should not contain HTML
const strictSanitizeConfig = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
};

export const sanitizeHTML = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), sanitizeConfig);
};

export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), strictSanitizeConfig);
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  const sanitized = sanitizeText(email).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(sanitized) ? sanitized : '';
};

export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.replace(/[^\d+\-\s()]/g, '');
  return cleaned.length <= 20 ? cleaned : '';
};

export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
};

export const validateContentLength = (content: string, maxLength: number = 5000): boolean => {
  return content && content.length <= maxLength;
};

export const sanitizeAdmissionData = (data: any) => {
  return {
    studentName: sanitizeText(data.studentName || ''),
    parentName: sanitizeText(data.parentName || ''),
    email: sanitizeEmail(data.email || ''),
    phone: sanitizePhone(data.phone || ''),
    class: sanitizeText(data.class || ''),
    message: sanitizeHTML(data.message || ''),
    address: sanitizeText(data.address || ''),
  };
};
