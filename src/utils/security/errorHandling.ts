export class SecurityError extends Error {
  public readonly name = 'SecurityError';
  public readonly code: string;
  public readonly userMessage: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  constructor(
    message: string, 
    code: string = 'SECURITY_ERROR',
    userMessage: string = 'A security error occurred. Please try again.',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) {
    super(message);
    this.code = code;
    this.userMessage = userMessage;
    this.severity = severity;
  }
}

export class ValidationError extends SecurityError {
  constructor(message: string, field?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      field ? `Invalid ${field}. Please check your input.` : 'Please check your input and try again.',
      'low'
    );
  }
}

export class AuthenticationError extends SecurityError {
  constructor(message: string = 'Authentication failed') {
    super(
      message,
      'AUTH_ERROR',
      'Authentication failed. Please check your credentials.',
      'medium'
    );
  }
}

export class RateLimitError extends SecurityError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    const userMsg = retryAfter 
      ? `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60000)} minutes.`
      : 'Too many attempts. Please try again later.';
      
    super(message, 'RATE_LIMIT_ERROR', userMsg, 'medium');
  }
}

// Production-safe error handler
export const handleSecurityError = (error: unknown, context?: string): SecurityError => {
  // Log detailed error for debugging (server-side only in production)
  if (process.env.NODE_ENV === 'development') {
    console.error('Security error details:', {
      error,
      context,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });
  }

  // Return user-safe error
  if (error instanceof SecurityError) {
    return error;
  }

  if (error instanceof Error) {
    // Map common errors to security errors
    if (error.message.includes('auth/')) {
      return new AuthenticationError();
    }
    
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return new ValidationError('Invalid input provided');
    }
    
    if (error.message.includes('rate') || error.message.includes('limit')) {
      return new RateLimitError();
    }
  }

  // Generic security error for unknown issues
  return new SecurityError(
    `Unknown security error in ${context || 'system'}`,
    'UNKNOWN_ERROR',
    'An unexpected error occurred. Please try again later.',
    'medium'
  );
};

// Safe error message for user display
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof SecurityError) {
    return error.userMessage;
  }
  
  // Never expose internal error details to users in production
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred. Please try again later.';
  }
  
  // In development, show more details
  return error instanceof Error ? error.message : 'Unknown error occurred';
};

// Error boundary helper
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
      url: window.location.href
    },
    severity
  };

  if (process.env.NODE_ENV === 'development') {
    console.warn('Security event:', logEntry);
  }

  // In production, this would send to monitoring service
  // For now, we'll store critical events locally for review
  if (severity === 'critical' || severity === 'high') {
    try {
      const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
      existingEvents.push(logEntry);
      
      // Keep only last 100 events
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }
      
      localStorage.setItem('security_events', JSON.stringify(existingEvents));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
};
