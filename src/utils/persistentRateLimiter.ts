
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RateLimitData {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  escalationCount?: number;
}

export class PersistentRateLimiter {
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly ESCALATION_ATTEMPTS = 10;
  private readonly ESCALATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Cleanup old entries periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupExpiredEntries(), this.CLEANUP_INTERVAL);
    }
  }

  private getRateLimitDoc(identifier: string) {
    // Hash identifier for security and to handle special characters
    const hashedId = this.hashIdentifier(identifier);
    return doc(db, 'rate_limits', hashedId);
  }

  private hashIdentifier(identifier: string): string {
    // Simple hash function for identifier
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `rate_${Math.abs(hash)}`;
  }

  async isRateLimited(identifier: string): Promise<{ isLimited: boolean; timeRemaining?: number; reason?: string }> {
    try {
      const now = Date.now();
      const rateLimitDoc = await getDoc(this.getRateLimitDoc(identifier));
      
      if (!rateLimitDoc.exists()) {
        return { isLimited: false };
      }

      const data = rateLimitDoc.data() as RateLimitData;

      // Check if window has expired
      if (now - data.firstAttempt > this.WINDOW_MS) {
        await deleteDoc(this.getRateLimitDoc(identifier));
        return { isLimited: false };
      }

      // Check for escalated blocking
      if (data.escalationCount && data.escalationCount >= this.ESCALATION_ATTEMPTS && 
          now - data.firstAttempt < this.ESCALATION_WINDOW_MS) {
        const timeRemaining = this.ESCALATION_WINDOW_MS - (now - data.firstAttempt);
        return { 
          isLimited: true, 
          timeRemaining,
          reason: 'Extended lockout due to excessive attempts' 
        };
      }

      // Check for regular rate limiting
      if (data.count >= this.MAX_ATTEMPTS) {
        const timeRemaining = this.WINDOW_MS - (now - data.lastAttempt);
        return { 
          isLimited: true, 
          timeRemaining,
          reason: 'Too many failed attempts' 
        };
      }

      return { isLimited: false };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Fail safe - don't block if we can't check
      return { isLimited: false };
    }
  }

  async recordFailedAttempt(identifier: string): Promise<void> {
    try {
      const now = Date.now();
      const docRef = this.getRateLimitDoc(identifier);
      const rateLimitDoc = await getDoc(docRef);
      
      if (!rateLimitDoc.exists() || now - rateLimitDoc.data().firstAttempt > this.WINDOW_MS) {
        // Create new rate limit record
        const newData: RateLimitData = {
          count: 1,
          firstAttempt: now,
          lastAttempt: now
        };
        await setDoc(docRef, newData);
      } else {
        // Update existing record
        const data = rateLimitDoc.data() as RateLimitData;
        const updateData: Partial<RateLimitData> = {
          count: data.count + 1,
          lastAttempt: now
        };

        // Track escalation
        if (data.count + 1 >= this.ESCALATION_ATTEMPTS) {
          updateData.escalationCount = (data.escalationCount || 0) + 1;
        }

        await updateDoc(docRef, updateData);
      }
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  }

  async clearAttempts(identifier: string): Promise<void> {
    try {
      await deleteDoc(this.getRateLimitDoc(identifier));
    } catch (error) {
      console.error('Error clearing attempts:', error);
    }
  }

  async getAttemptInfo(identifier: string): Promise<{ count: number; timeUntilReset?: number }> {
    try {
      const rateLimitDoc = await getDoc(this.getRateLimitDoc(identifier));
      if (!rateLimitDoc.exists()) {
        return { count: 0 };
      }
      
      const data = rateLimitDoc.data() as RateLimitData;
      const timeUntilReset = this.WINDOW_MS - (Date.now() - data.firstAttempt);
      return { 
        count: data.count, 
        timeUntilReset: timeUntilReset > 0 ? timeUntilReset : 0 
      };
    } catch (error) {
      console.error('Error getting attempt info:', error);
      return { count: 0 };
    }
  }

  private async cleanupExpiredEntries(): Promise<void> {
    // Note: In production, this should be handled by a Cloud Function
    // This is a basic cleanup that runs client-side
    console.log('Rate limiter cleanup would run here (implement via Cloud Function in production)');
  }
}

export const persistentRateLimiter = new PersistentRateLimiter();
