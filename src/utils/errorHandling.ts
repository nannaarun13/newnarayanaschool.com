
interface SecurityError extends Error {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userMessage: string;
}

const ERROR_CODES = {
  VALIDATION_ERROR: 'VAL_001',
  AUTHENTICATION_FAILED: 'AUTH_001',
  AUTHORIZATION_DENIED: 'AUTH_002',
  RATE_LIMIT_EXCEEDED: 'RATE_001',
  SUSPICIOUS_ACTIVITY: 'SEC_001',
  NETWORK_ERROR: 'NET_001',
  UNKNOWN_ERROR: 'UNK_001'
} as const;

const PRODUCTION_ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.AUTHENTICATION_FAILED]: 'Authentication failed. Please check your credentials.',
  [ERROR_CODES.AUTHORIZATION_DENIED]: 'Access denied. You do not have permission to perform this action.',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait before trying again.',
  [ERROR_CODES.SUSPICIOUS_ACTIVITY]: 'Security check failed. Please contact support if this continues.',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again later.'
} as const;

export class SecureErrorHandler {
  private static logError(error: SecurityError): void {
    // In development, log detailed errors
    if (import.meta.env.DEV) {
      console.error('Security Error:', error);
    } else {
      // In production, log only essential info without sensitive details
      console.error(`Error ${error.code}: ${error.userMessage}`);
    }
  }

  static handleValidationError(originalError: Error, field?: string): SecurityError {
    const error: SecurityError = {
      name: 'SecurityError',
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Validation failed${field ? ` for field: ${field}` : ''}`,
      severity: 'low',
      timestamp: new Date().toISOString(),
      userMessage: PRODUCTION_ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR]
    };
    
    this.logError(error);
    return error;
  }

  static handleAuthenticationError(originalError: Error): SecurityError {
    const error: SecurityError = {
      name: 'SecurityError',
      code: ERROR_CODES.AUTHENTICATION_FAILED,
      message: 'Authentication attempt failed',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      userMessage: PRODUCTION_ERROR_MESSAGES[ERROR_CODES.AUTHENTICATION_FAILED]
    };
    
    this.logError(error);
    return error;
  }

  static handleRateLimitError(originalError: Error): SecurityError {
    const error: SecurityError = {
      name: 'SecurityError',
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message: 'Rate limit exceeded',
      severity: 'high',
      timestamp: new Date().toISOString(),
      userMessage: PRODUCTION_ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED]
    };
    
    this.logError(error);
    return error;
  }

  static handleSuspiciousActivity(originalError: Error, details?: string): SecurityError {
    const error: SecurityError = {
      name: 'SecurityError',
      code: ERROR_CODES.SUSPICIOUS_ACTIVITY,
      message: `Suspicious activity detected${details ? `: ${details}` : ''}`,
      severity: 'critical',
      timestamp: new Date().toISOString(),
      userMessage: PRODUCTION_ERROR_MESSAGES[ERROR_CODES.SUSPICIOUS_ACTIVITY]
    };
    
    this.logError(error);
    return error;
  }

  static handleNetworkError(originalError: Error): SecurityError {
    const error: SecurityError = {
      name: 'SecurityError',
      code: ERROR_CODES.NETWORK_ERROR,
      message: 'Network operation failed',
      severity: 'low',
      timestamp: new Date().toISOString(),
      userMessage: PRODUCTION_ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR]
    };
    
    this.logError(error);
    return error;
  }

  static handleUnknownError(originalError: Error): SecurityError {
    const error: SecurityError = {
      name: 'SecurityError',
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: 'Unknown error occurred',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      userMessage: PRODUCTION_ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
    };
    
    this.logError(error);
    return error;
  }

  static sanitizeErrorMessage(error: any): string {
    if (!error) return PRODUCTION_ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
    
    // If it's already a SecurityError, return the user message
    if (error.userMessage) return error.userMessage;
    
    // Map common Firebase errors to user-friendly messages
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return PRODUCTION_ERROR_MESSAGES[ERROR_CODES.AUTHENTICATION_FAILED];
        case 'auth/too-many-requests':
          return PRODUCTION_ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED];
        case 'auth/network-request-failed':
          return PRODUCTION_ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
        default:
          return PRODUCTION_ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
      }
    }
    
    // For any other error, return generic message
    return PRODUCTION_ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  }
}

export { ERROR_CODES, type SecurityError };
