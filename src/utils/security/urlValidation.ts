
import { sanitizeInput } from './inputValidation';

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
