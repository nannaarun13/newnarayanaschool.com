
export class CSRFToken {
  private token: string | null = null;
  private readonly TOKEN_KEY = '__csrf_token__';

  constructor() {
    this.initializeToken();
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
    if (!token || typeof token !== 'string') return false;
    
    // Enhanced token validation
    const validLength = token.length === 64;
    const validFormat = /^[a-f0-9]+$/.test(token);
    const notExpired = this.isTokenNotExpired(token);
    
    return validLength && validFormat && notExpired;
  }

  private isTokenNotExpired(token: string): boolean {
    try {
      const tokenTimestamp = sessionStorage.getItem(`${this.TOKEN_KEY}_timestamp`);
      if (!tokenTimestamp) return false;
      
      const tokenTime = parseInt(tokenTimestamp, 10);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      return (now - tokenTime) < maxAge;
    } catch {
      return false;
    }
  }

  public getToken(): string {
    if (!this.token || !this.isValidToken(this.token)) {
      this.refreshToken();
    }
    return this.token!;
  }

  public refreshToken(): void {
    this.token = this.generateToken();
    try {
      sessionStorage.setItem(this.TOKEN_KEY, this.token);
      sessionStorage.setItem(`${this.TOKEN_KEY}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Failed to store CSRF token:', error);
    }
  }

  public getCurrentToken(): string | null {
    return this.token;
  }
}
