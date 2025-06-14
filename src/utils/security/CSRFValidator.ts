
import { validateCSRFToken, validateOrigin } from './inputSanitization';

export class CSRFValidator {
  private readonly ALLOWED_ORIGINS = [
    window.location.origin,
    'https://localhost:3000',
    'https://127.0.0.1:3000'
  ];

  constructor() {
    this.setupOriginValidation();
  }

  private setupOriginValidation(): void {
    // Add current origin if not already present
    const currentOrigin = window.location.origin;
    if (!this.ALLOWED_ORIGINS.includes(currentOrigin)) {
      this.ALLOWED_ORIGINS.push(currentOrigin);
    }
  }

  public validateToken(providedToken: string, expectedToken: string): boolean {
    if (!expectedToken) {
      return false;
    }
    return validateCSRFToken(providedToken, expectedToken);
  }

  public validateOrigin(origin?: string): boolean {
    const requestOrigin = origin || document.referrer || window.location.origin;
    return validateOrigin(requestOrigin, this.ALLOWED_ORIGINS);
  }

  public getHeaders(): Record<string, string> {
    return {
      'X-CSRF-Token': '',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Origin': window.location.origin
    };
  }

  public validateRequest(providedToken: string, expectedToken: string, origin?: string): boolean {
    const tokenValid = providedToken ? this.validateToken(providedToken, expectedToken) : false;
    const originValid = this.validateOrigin(origin);
    
    if (!tokenValid) {
      console.warn('CSRF token validation failed');
    }
    
    if (!originValid) {
      console.warn('Origin validation failed:', origin);
    }
    
    return tokenValid && originValid;
  }

  public getAllowedOrigins(): string[] {
    return [...this.ALLOWED_ORIGINS];
  }
}
