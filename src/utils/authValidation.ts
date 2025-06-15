
// Enhanced input validation with stricter security
export const validateAndSanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email format');
  }
  
  const sanitized = email.toLowerCase().trim();
  
  // Enhanced email validation with security checks
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  // Check for suspicious patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    throw new Error('Invalid email format');
  }
  
  if (sanitized.length < 5 || sanitized.length > 100) {
    throw new Error('Email length must be between 5 and 100 characters');
  }
  
  return sanitized;
};
