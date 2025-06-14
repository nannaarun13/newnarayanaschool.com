
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
}

export class SessionManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private warningId: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private config: SessionConfig;
  private onWarning?: () => void;
  private onTimeout?: () => void;

  constructor(config: SessionConfig = { timeoutMinutes: 30, warningMinutes: 5 }) {
    this.config = config;
    this.setupActivityListeners();
    this.setupAuthListener();
  }

  private setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, this.resetTimer.bind(this), true);
    });
  }

  private setupAuthListener() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.resetTimer();
      } else {
        this.clearTimers();
      }
    });
  }

  setCallbacks(onWarning: () => void, onTimeout: () => void) {
    this.onWarning = onWarning;
    this.onTimeout = onTimeout;
  }

  private resetTimer() {
    this.lastActivity = Date.now();
    this.clearTimers();
    
    if (auth.currentUser) {
      // Set warning timer
      this.warningId = setTimeout(() => {
        this.onWarning?.();
      }, (this.config.timeoutMinutes - this.config.warningMinutes) * 60 * 1000);

      // Set timeout timer
      this.timeoutId = setTimeout(() => {
        this.handleTimeout();
      }, this.config.timeoutMinutes * 60 * 1000);
    }
  }

  private clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningId) {
      clearTimeout(this.warningId);
      this.warningId = null;
    }
  }

  private async handleTimeout() {
    console.log('Session timeout - logging out user');
    try {
      await auth.signOut();
      this.onTimeout?.();
    } catch (error) {
      console.error('Error during session timeout logout:', error);
    }
  }

  extendSession() {
    this.resetTimer();
  }

  destroy() {
    this.clearTimers();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, this.resetTimer.bind(this), true);
    });
  }
}

export const sessionManager = new SessionManager();
