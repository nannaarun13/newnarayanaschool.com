
import { CSRFToken } from './CSRFToken';
import { CSRFValidator } from './CSRFValidator';
import { CSRFMiddleware } from './CSRFMiddleware';

class CSRFProtection {
  private static instance: CSRFProtection;
  private tokenManager: CSRFToken;
  private validator: CSRFValidator;
  private middleware: CSRFMiddleware;

  private constructor() {
    this.tokenManager = new CSRFToken();
    this.validator = new CSRFValidator();
    this.middleware = new CSRFMiddleware(this.tokenManager, this.validator);
  }

  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  public getToken(): string {
    return this.tokenManager.getToken();
  }

  public refreshToken(): void {
    this.tokenManager.refreshToken();
  }

  public validateToken(providedToken: string): boolean {
    const expectedToken = this.tokenManager.getCurrentToken();
    if (!expectedToken) return false;
    return this.validator.validateToken(providedToken, expectedToken);
  }

  public validateOrigin(origin?: string): boolean {
    return this.validator.validateOrigin(origin);
  }

  public getHeaders(): Record<string, string> {
    const headers = this.validator.getHeaders();
    headers['X-CSRF-Token'] = this.getToken();
    return headers;
  }

  public validateRequest(providedToken?: string, origin?: string): boolean {
    if (!providedToken) return false;
    const expectedToken = this.tokenManager.getCurrentToken();
    if (!expectedToken) return false;
    return this.validator.validateRequest(providedToken, expectedToken, origin);
  }
}

export const csrfProtection = CSRFProtection.getInstance();

// Enhanced admin operation validation with origin checking
export const validateAdminOperation = (providedToken?: string, origin?: string): boolean => {
  return csrfProtection.validateRequest(providedToken, origin);
};

// Enhanced middleware with comprehensive protection
export const withCSRFProtection = (operation: Function) => {
  return (...args: any[]) => {
    const token = csrfProtection.getToken();
    const origin = window.location.origin;
    
    if (!token) {
      throw new Error('CSRF protection not available');
    }
    
    if (!csrfProtection.validateOrigin()) {
      throw new Error('Invalid request origin');
    }
    
    return operation(...args, { 
      csrfToken: token,
      origin: origin,
      timestamp: Date.now()
    });
  };
};

// Form protection helper
export const protectForm = (formElement: HTMLFormElement): void => {
  if (!formElement) return;
  
  // Add CSRF token as hidden input
  const existingToken = formElement.querySelector('input[name="csrf_token"]') as HTMLInputElement;
  if (existingToken) {
    existingToken.value = csrfProtection.getToken();
  } else {
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = 'csrf_token';
    tokenInput.value = csrfProtection.getToken();
    formElement.appendChild(tokenInput);
  }
  
  // Add origin validation
  formElement.addEventListener('submit', (event) => {
    if (!csrfProtection.validateOrigin()) {
      event.preventDefault();
      console.error('Form submission blocked: invalid origin');
      alert('Security error: Invalid request origin');
    }
  });
};

// Auto-protect all forms on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form') as NodeListOf<HTMLFormElement>;
    forms.forEach(protectForm);
  });
}
