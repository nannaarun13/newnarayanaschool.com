
import { validateCSRFToken } from './inputSanitization';

class CSRFProtection {
  private static instance: CSRFProtection;
  private token: string | null = null;
  private readonly TOKEN_KEY = '__csrf_token__';

  private constructor() {
    this.initializeToken();
  }

  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  private generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private initializeToken(): void {
    try {
      const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
      if (storedToken && this.isValidToken(storedToken)) {
        this.token = storedToken;
      } else {
        this.refreshToken();
      }
    } catch (error) {
      console.error('CSRF token initialization failed:', error);
      this.refreshToken();
    }
  }

  private isValidToken(token: string): boolean {
    return typeof token === 'string' && token.length === 64 && /^[a-f0-9]+$/.test(token);
  }

  public getToken(): string {
    if (!this.token) {
      this.refreshToken();
    }
    return this.token!;
  }

  public refreshToken(): void {
    this.token = this.generateToken();
    try {
      sessionStorage.setItem(this.TOKEN_KEY, this.token);
    } catch (error) {
      console.error('Failed to store CSRF token:', error);
    }
  }

  public validateToken(providedToken: string): boolean {
    if (!this.token) {
      return false;
    }
    return validateCSRFToken(providedToken, this.token);
  }

  public getHeaders(): Record<string, string> {
    return {
      'X-CSRF-Token': this.getToken(),
      'X-Requested-With': 'XMLHttpRequest'
    };
  }
}

export const csrfProtection = CSRFProtection.getInstance();

// Helper function for admin operations
export const validateAdminOperation = (providedToken?: string): boolean => {
  if (!providedToken) {
    console.warn('CSRF token missing for admin operation');
    return false;
  }
  
  const isValid = csrfProtection.validateToken(providedToken);
  if (!isValid) {
    console.warn('Invalid CSRF token for admin operation');
  }
  
  return isValid;
};

// Middleware for protecting state-changing operations
export const withCSRFProtection = (operation: Function) => {
  return (...args: any[]) => {
    const token = csrfProtection.getToken();
    if (!token) {
      throw new Error('CSRF protection not available');
    }
    
    return operation(...args, { csrfToken: token });
  };
};
