export class SecurityError extends Error {
  public readonly name = 'SecurityError';
  public readonly code: string;
  public readonly userMessage: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly timestamp: string;
  public readonly context?: string;

  constructor(
    message: string, 
    code: string = 'SECURITY_ERROR',
    userMessage: string = 'A security error occurred. Please try again.',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: string
  ) {
    super(message);
    this.code = code;
    this.userMessage = userMessage;
    this.severity = severity;
    this.timestamp = new Date().toISOString();
    this.context = context;
  }
}

export class ValidationError extends SecurityError {
  constructor(message: string, field?: string, context?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      field ? `Invalid ${field}. Please check your input.` : 'Please check your input and try again.',
      'low',
      context
    );
  }
}

export class AuthenticationError extends SecurityError {
  constructor(message: string = 'Authentication failed', context?: string) {
    super(
      message,
      'AUTH_ERROR',
      'Authentication failed. Please check your credentials.',
      'medium',
      context
    );
  }
}

export class RateLimitError extends SecurityError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number, context?: string) {
    const userMsg = retryAfter 
      ? `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60000)} minutes.`
      : 'Too many attempts. Please try again later.';
      
    super(message, 'RATE_LIMIT_ERROR', userMsg, 'medium', context);
  }
}

export class CSRFError extends SecurityError {
  constructor(message: string = 'CSRF token validation failed', context?: string) {
    super(
      message,
      'CSRF_ERROR',
      'Security validation failed. Please refresh the page and try again.',
      'high',
      context
    );
  }
}

export class XSSError extends SecurityError {
  constructor(message: string = 'Potential XSS attack detected', context?: string) {
    super(
      message,
      'XSS_ERROR',
      'Invalid content detected. Please remove any script tags or suspicious content.',
      'high',
      context
    );
  }
}

// Production-safe error handler with enhanced logging
export const handleSecurityError = (error: unknown, context?: string): SecurityError => {
  const errorId = Math.random().toString(36).substring(2, 15);
  
  // Enhanced error logging for development
  if (process.env.NODE_ENV === 'development') {
    console.error('Security error details:', {
      errorId,
      error,
      context,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  // Log security events for monitoring
  logSecurityEvent('error_occurred', {
    errorId,
    context,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
    message: error instanceof Error ? error.message : 'Unknown error'
  }, 'medium');

  // Return user-safe error
  if (error instanceof SecurityError) {
    return error;
  }

  if (error instanceof Error) {
    // Enhanced error mapping with more specific categorization
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('auth/') || errorMessage.includes('authentication')) {
      return new AuthenticationError('Authentication failed', context);
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return new ValidationError('Invalid input provided', undefined, context);
    }
    
    if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
      return new RateLimitError('Rate limit exceeded', undefined, context);
    }
    
    if (errorMessage.includes('csrf') || errorMessage.includes('token')) {
      return new CSRFError('Security token validation failed', context);
    }
    
    if (errorMessage.includes('xss') || errorMessage.includes('script')) {
      return new XSSError('Potential security threat detected', context);
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return new SecurityError(
        'Network error occurred',
        'NETWORK_ERROR',
        'Network error. Please check your connection and try again.',
        'low',
        context
      );
    }
  }

  // Generic security error for unknown issues with error ID for tracking
  return new SecurityError(
    `Unknown security error in ${context || 'system'} (ID: ${errorId})`,
    'UNKNOWN_ERROR',
    'An unexpected error occurred. Please try again later.',
    'medium',
    context
  );
};

// Enhanced safe error message extraction
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof SecurityError) {
    return error.userMessage;
  }
  
  // Never expose internal error details to users in production
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred. Please try again later.';
  }
  
  // In development, show sanitized details
  if (error instanceof Error) {
    // Remove sensitive information from error messages
    const sanitizedMessage = error.message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP]')
      .replace(/[a-f0-9]{32,}/gi, '[TOKEN]')
      .replace(/password|secret|key|token/gi, '[REDACTED]');
    
    return sanitizedMessage;
  }
  
  return 'Unknown error occurred';
};

// Enhanced security event logging with threat classification
export const logSecurityEvent = (
  event: string, 
  details: Record<string, any>, 
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void => {
  const logEntry = {
    event,
    details: {
      ...details,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      sessionId: sessionStorage.getItem('__session_id__') || 'unknown'
    },
    severity,
    id: Math.random().toString(36).substring(2, 15)
  };

  // Enhanced development logging
  if (process.env.NODE_ENV === 'development') {
    const logMethod = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    console[logMethod]('Security event:', logEntry);
  }

  // Store high-severity events for review with size management
  if (severity === 'critical' || severity === 'high') {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
      existingEvents.push(logEntry);
      
      // Keep only last 50 events and ensure storage doesn't exceed 1MB
      const maxEvents = 50;
      const maxSize = 1024 * 1024; // 1MB
      
      if (existingEvents.length > maxEvents) {
        existingEvents.splice(0, existingEvents.length - maxEvents);
      }
      
      const eventsString = JSON.stringify(existingEvents);
      if (eventsString.length > maxSize) {
        // Remove oldest events until under size limit
        while (eventsString.length > maxSize && existingEvents.length > 0) {
          existingEvents.shift();
        }
      }
      
      localStorage.setItem('security_events', JSON.stringify(existingEvents));
      
      // Trigger real-time alert for critical events
      if (severity === 'critical') {
        triggerSecurityAlert(logEntry);
      }
      
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
};

// Real-time security alerting
const triggerSecurityAlert = (event: any): void => {
  // In production, this would integrate with alerting systems
  console.error('CRITICAL SECURITY EVENT:', event);
  
  // Create visual alert for critical events
  if (typeof window !== 'undefined' && document.body) {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      max-width: 400px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    alertDiv.innerHTML = `
      <strong>Security Alert</strong><br>
      Critical security event detected. Please contact support if this persists.
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 10000);
  }
};

// Get security event history for monitoring
export const getSecurityEventHistory = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('security_events') || '[]');
  } catch {
    return [];
  }
};

// Clear security event history
export const clearSecurityEventHistory = (): void => {
  try {
    localStorage.removeItem('security_events');
  } catch (error) {
    console.error('Failed to clear security event history:', error);
  }
};
