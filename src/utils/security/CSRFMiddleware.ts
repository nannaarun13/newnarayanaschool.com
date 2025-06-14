
import { CSRFToken } from './CSRFToken';
import { CSRFValidator } from './CSRFValidator';

export class CSRFMiddleware {
  private tokenManager: CSRFToken;
  private validator: CSRFValidator;

  constructor(tokenManager: CSRFToken, validator: CSRFValidator) {
    this.tokenManager = tokenManager;
    this.validator = validator;
  }

  public withCSRFProtection = (operation: Function) => {
    return (...args: any[]) => {
      const token = this.tokenManager.getToken();
      const origin = window.location.origin;
      
      if (!token) {
        throw new Error('CSRF protection not available');
      }
      
      if (!this.validator.validateOrigin()) {
        throw new Error('Invalid request origin');
      }
      
      return operation(...args, { 
        csrfToken: token,
        origin: origin,
        timestamp: Date.now()
      });
    };
  };

  public protectForm = (formElement: HTMLFormElement): void => {
    if (!formElement) return;
    
    // Add CSRF token as hidden input
    const existingToken = formElement.querySelector('input[name="csrf_token"]') as HTMLInputElement;
    if (existingToken) {
      existingToken.value = this.tokenManager.getToken();
    } else {
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'csrf_token';
      tokenInput.value = this.tokenManager.getToken();
      formElement.appendChild(tokenInput);
    }
    
    // Add origin validation
    formElement.addEventListener('submit', (event) => {
      if (!this.validator.validateOrigin()) {
        event.preventDefault();
        console.error('Form submission blocked: invalid origin');
        alert('Security error: Invalid request origin');
      }
    });
  };

  public validateAdminOperation = (providedToken?: string, origin?: string): boolean => {
    if (!providedToken) {
      console.warn('CSRF token missing for admin operation');
      return false;
    }
    
    const expectedToken = this.tokenManager.getCurrentToken();
    if (!expectedToken) {
      console.warn('No CSRF token available for validation');
      return false;
    }
    
    const isValid = this.validator.validateRequest(providedToken, expectedToken, origin);
    if (!isValid) {
      console.warn('Security validation failed for admin operation');
    }
    
    return isValid;
  };
}
