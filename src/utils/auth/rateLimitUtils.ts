
import { sanitizeEmail } from '../inputSanitization';
import { persistentRateLimiter } from '../persistentRateLimiter';

// Export rate limiter info for monitoring
export const getRateLimitInfo = async (email: string) => {
  try {
    const sanitizedEmail = sanitizeEmail(email);
    return await persistentRateLimiter.getAttemptInfo(`email:${sanitizedEmail}`);
  } catch {
    return { count: 0 };
  }
};
