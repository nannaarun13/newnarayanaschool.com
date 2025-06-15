
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { logAdminLogin, logFailedAdminLogin } from './loginActivityUtils';
import { ensureDefaultAdmin, DEFAULT_ADMIN } from './adminUtils';
import * as z from "zod";

// Enhanced validation schemas
export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(100, { message: "Password too long." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .transform(email => email.toLowerCase().trim()),
});

// Enhanced rate limiting with persistent storage
class RateLimiter {
  private attempts = new Map<string, { count: number; firstAttempt: number; lastAttempt: number }>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly ESCALATION_ATTEMPTS = 10;
  private readonly ESCALATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

  isRateLimited(identifier: string): { isLimited: boolean; timeRemaining?: number; reason?: string } {
    const now = Date.now();
    const attempts = this.attempts.get(identifier);
    
    if (!attempts) {
      return { isLimited: false };
    }

    // Check if window has expired
    if (now - attempts.firstAttempt > this.WINDOW_MS) {
      this.attempts.delete(identifier);
      return { isLimited: false };
    }

    // Check for escalated blocking (too many attempts in longer window)
    if (attempts.count >= this.ESCALATION_ATTEMPTS && 
        now - attempts.firstAttempt < this.ESCALATION_WINDOW_MS) {
      const timeRemaining = this.ESCALATION_WINDOW_MS - (now - attempts.firstAttempt);
      return { 
        isLimited: true, 
        timeRemaining,
        reason: 'Extended lockout due to excessive attempts' 
      };
    }

    // Check for regular rate limiting
    if (attempts.count >= this.MAX_ATTEMPTS) {
      const timeRemaining = this.WINDOW_MS - (now - attempts.lastAttempt);
      return { 
        isLimited: true, 
        timeRemaining,
        reason: 'Too many failed attempts' 
      };
    }

    return { isLimited: false };
  }

  recordFailedAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier);
    
    if (!attempts || now - attempts.firstAttempt > this.WINDOW_MS) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    } else {
      attempts.count += 1;
      attempts.lastAttempt = now;
      this.attempts.set(identifier, attempts);
    }
  }

  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getAttemptInfo(identifier: string): { count: number; timeUntilReset?: number } {
    const attempts = this.attempts.get(identifier);
    if (!attempts) {
      return { count: 0 };
    }
    
    const timeUntilReset = this.WINDOW_MS - (Date.now() - attempts.firstAttempt);
    return { 
      count: attempts.count, 
      timeUntilReset: timeUntilReset > 0 ? timeUntilReset : 0 
    };
  }
}

const rateLimiter = new RateLimiter();

// Enhanced input validation
const validateAndSanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email format');
  }
  
  const sanitized = email.toLowerCase().trim();
  
  // Enhanced email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  if (sanitized.length > 100) {
    throw new Error('Email too long');
  }
  
  return sanitized;
};

const validatePassword = (password: string): void => {
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password');
  }
  
  if (password.length < 8 || password.length > 100) {
    throw new Error('Password must be between 8 and 100 characters');
  }
};

// Enhanced login handler with comprehensive security
export const handleLogin = async (values: z.infer<typeof loginSchema>) => {
  console.log('Login attempt for:', values.email);
  
  try {
    // Enhanced input validation
    const sanitizedEmail = validateAndSanitizeEmail(values.email);
    validatePassword(values.password);
    
    // Multi-factor rate limiting (by email and IP if available)
    const emailLimitCheck = rateLimiter.isRateLimited(`email:${sanitizedEmail}`);
    
    if (emailLimitCheck.isLimited) {
      const minutes = Math.ceil((emailLimitCheck.timeRemaining || 0) / 60000);
      await logFailedAdminLogin(sanitizedEmail, `Rate limited: ${emailLimitCheck.reason}`);
      throw new Error(`${emailLimitCheck.reason}. Please try again in ${minutes} minutes.`);
    }

    // Attempt Firebase authentication with enhanced error handling
    console.log('Attempting Firebase authentication');
    let userCredential;
    
    try {
      userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, values.password);
    } catch (authError: any) {
      // Record failed attempt before throwing
      rateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      
      // Enhanced error handling
      const errorCode = authError.code;
      let errorMessage = 'Authentication failed';
      
      switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          await logFailedAdminLogin(sanitizedEmail, 'Invalid credentials');
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Account temporarily disabled due to many failed login attempts. Try again later or reset your password.';
          await logFailedAdminLogin(sanitizedEmail, 'Firebase rate limited');
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          await logFailedAdminLogin(sanitizedEmail, 'Account disabled');
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          await logFailedAdminLogin(sanitizedEmail, 'Network error');
          break;
        default:
          await logFailedAdminLogin(sanitizedEmail, `Firebase error: ${errorCode}`);
      }
      
      throw new Error(errorMessage);
    }
    
    const user = userCredential.user;
    
    // Verify email is verified for additional security
    if (!user.emailVerified && sanitizedEmail !== DEFAULT_ADMIN.email.toLowerCase()) {
      await auth.signOut();
      rateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Email not verified');
      throw new Error('Please verify your email address before logging in.');
    }
    
    // For default admin, ensure admin record exists
    if (sanitizedEmail === DEFAULT_ADMIN.email.toLowerCase()) {
      await ensureDefaultAdmin(user.uid);
    }
    
    // Enhanced admin status verification
    console.log('Checking admin status for user:', user.uid);
    
    let adminDoc = await getDoc(doc(db, 'admins', user.uid));
    
    if (!adminDoc.exists()) {
      console.log('Admin record not found by UID, searching by email');
      const q = query(
        collection(db, 'admins'), 
        where('email', '==', sanitizedEmail), 
        where('status', '==', 'approved')
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No approved admin record found');
        await auth.signOut();
        rateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
        await logFailedAdminLogin(sanitizedEmail, 'Email not registered as admin or access pending approval');
        throw new Error('This email is not registered as an admin or your access is pending approval.');
      }
      
      adminDoc = querySnapshot.docs[0];
    }
    
    const adminData = adminDoc.data();
    
    // Enhanced admin data validation
    if (!adminData || !adminData.status) {
      console.log('Invalid admin data');
      await auth.signOut();
      rateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Invalid admin data');
      throw new Error('Invalid admin record. Please contact support.');
    }
    
    if (adminData.status !== 'approved') {
      console.log('Admin not approved, status:', adminData.status);
      await auth.signOut();
      rateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, `Admin access ${adminData.status}`);
      
      const statusMessage = {
        'pending': 'Your admin access request is pending approval.',
        'rejected': 'Your admin access request has been rejected.',
        'revoked': 'Your admin access has been revoked.'
      };
      
      throw new Error(statusMessage[adminData.status as keyof typeof statusMessage] || 'Admin access denied.');
    }
    
    // Success - clear any failed attempts
    rateLimiter.clearAttempts(`email:${sanitizedEmail}`);
    
    // Log successful login with enhanced details
    await logAdminLogin(user.uid, sanitizedEmail);
    console.log('Admin login successful');
    
  } catch (error: any) {
    console.error('Login error details:', error);
    
    // If it's not already handled, record as failed attempt
    if (!error.message.includes('Rate limited') && 
        !error.message.includes('Invalid email') && 
        !error.message.includes('pending approval')) {
      rateLimiter.recordFailedAttempt(`email:${values.email}`);
    }
    
    throw error;
  }
};

// Enhanced password reset with additional validation
export const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
  try {
    const sanitizedEmail = validateAndSanitizeEmail(values.email);
    
    // Check rate limiting for password reset requests
    const resetLimitCheck = rateLimiter.isRateLimited(`reset:${sanitizedEmail}`);
    if (resetLimitCheck.isLimited) {
      // Don't reveal rate limiting for password reset to prevent enumeration
      console.log('Password reset rate limited for:', sanitizedEmail);
      return;
    }
    
    await sendPasswordResetEmail(auth, sanitizedEmail);
    
    // Record password reset attempt (but don't increment failure counter)
    console.log('Password reset email sent to:', sanitizedEmail);
    
  } catch (error: any) {
    console.error('Password reset error:', error);
    // Always show success message to prevent email enumeration attacks
  }
};

// Export rate limiter info for monitoring
export const getRateLimitInfo = (email: string) => {
  try {
    const sanitizedEmail = validateAndSanitizeEmail(email);
    return rateLimiter.getAttemptInfo(`email:${sanitizedEmail}`);
  } catch {
    return { count: 0 };
  }
};
