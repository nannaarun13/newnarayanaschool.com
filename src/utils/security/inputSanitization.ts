
// Main export file that combines all sanitization utilities
export { 
  sanitizeInput, 
  sanitizeEmail, 
  sanitizeFileName,
  type SanitizationOptions 
} from './inputValidation';

export { 
  validateCSRFToken 
} from './csrfValidation';

export { 
  validateOrigin, 
  sanitizeURL 
} from './urlValidation';

export {
  removeXSSPatterns,
  sanitizeHTML,
  stripHTMLTags,
  removeDangerousCharacters
} from './xssProtection';
