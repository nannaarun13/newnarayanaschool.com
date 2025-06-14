
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { persistentRateLimiter } from '../persistentRateLimiter';
import { SecureErrorHandler } from '../errorHandling';
import { validateRequestOrigin } from '../requestValidation';
import * as z from "zod";
import { forgotPasswordSchema } from './loginSchemas';

// Enhanced password reset with additional security
export const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
  try {
    // Validate request origin
    if (!validateRequestOrigin()) {
      const error = SecureErrorHandler.handleSuspiciousActivity(
        new Error('Invalid origin'), 
        'Password reset from unauthorized origin'
      );
      console.log('Password reset blocked:', error.message);
      return; // Don't reveal blocking to prevent enumeration
    }

    const sanitizedEmail = values.email; // Already sanitized by schema transform
    
    // Check rate limiting for password reset requests
    const resetLimitCheck = await persistentRateLimiter.isRateLimited(`reset:${sanitizedEmail}`);
    if (resetLimitCheck.isLimited) {
      console.log('Password reset rate limited for:', sanitizedEmail);
      return; // Don't reveal rate limiting to prevent enumeration
    }
    
    await sendPasswordResetEmail(auth, sanitizedEmail);
    console.log('Password reset email sent to:', sanitizedEmail);
    
  } catch (error: any) {
    console.error('Password reset error:', error);
    // Always show success message to prevent email enumeration attacks
  }
};
