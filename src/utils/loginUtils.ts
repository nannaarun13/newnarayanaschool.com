
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { logAdminLogin, logFailedAdminLogin } from './loginActivityUtils';
import { ensureDefaultAdmin, DEFAULT_ADMIN } from './adminUtils';
import { persistentRateLimiter } from './persistentRateLimiter';
import * as z from "zod";

// Enhanced validation schemas with stronger security
export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .refine(
      email => {
        // Enhanced email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const hasConsecutiveDots = /\.\./.test(email);
        const startsWithDot = email.startsWith('.');
        const endsWithDot = email.endsWith('.');
        
        return emailRegex.test(email) && !hasConsecutiveDots && !startsWithDot && !endsWithDot;
      },
      { message: "Invalid email format." }
    )
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(100, { message: "Password too long." })
    .refine(
      password => {
        // Check for common weak patterns
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasUpper && hasLower && hasNumber && hasSpecial;
      },
      { message: "Password must contain uppercase, lowercase, number, and special character." }
    ),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .refine(
      email => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email) && email.length >= 5;
      },
      { message: "Invalid email format." }
    )
    .transform(email => email.toLowerCase().trim()),
});

// Enhanced input validation with stricter security
const validateAndSanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email format');
  }
  
  const sanitized = email.toLowerCase().trim();
  
  // Enhanced email validation with security checks
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  // Check for suspicious patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    throw new Error('Invalid email format');
  }
  
  if (sanitized.length < 5 || sanitized.length > 100) {
    throw new Error('Email length must be between 5 and 100 characters');
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
  
  // Enhanced password strength validation
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
    throw new Error('Password must contain uppercase, lowercase, number, and special character');
  }
};

// Enhanced login handler with persistent rate limiting
export const handleLogin = async (values: z.infer<typeof loginSchema>) => {
  console.log('Login attempt for:', values.email);
  
  try {
    // Enhanced input validation
    const sanitizedEmail = validateAndSanitizeEmail(values.email);
    validatePassword(values.password);
    
    // Enhanced rate limiting with persistent storage
    const emailLimitCheck = await persistentRateLimiter.isRateLimited(`email:${sanitizedEmail}`);
    
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
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      
      // Enhanced error handling with security logging
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
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Email not verified');
      throw new Error('Please verify your email address before logging in.');
    }
    
    // For default admin, ensure admin record exists
    if (sanitizedEmail === DEFAULT_ADMIN.email.toLowerCase()) {
      await ensureDefaultAdmin(user.uid);
    }
    
    // Enhanced admin status verification with security checks
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
        await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
        await logFailedAdminLogin(sanitizedEmail, 'Email not registered as admin or access pending approval');
        throw new Error('This email is not registered as an admin or your access is pending approval.');
      }
      
      adminDoc = querySnapshot.docs[0];
    }
    
    const adminData = adminDoc.data();
    
    // Enhanced admin data validation with security checks
    if (!adminData || !adminData.status || !adminData.email) {
      console.log('Invalid admin data');
      await auth.signOut();
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Invalid admin data');
      throw new Error('Invalid admin record. Please contact support.');
    }
    
    // Verify email matches (prevent account takeover)
    if (adminData.email.toLowerCase() !== sanitizedEmail) {
      console.log('Email mismatch in admin record');
      await auth.signOut();
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Email mismatch');
      throw new Error('Security error. Please contact support.');
    }
    
    if (adminData.status !== 'approved') {
      console.log('Admin not approved, status:', adminData.status);
      await auth.signOut();
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, `Admin access ${adminData.status}`);
      
      const statusMessage = {
        'pending': 'Your admin access request is pending approval.',
        'rejected': 'Your admin access request has been rejected.',
        'revoked': 'Your admin access has been revoked.'
      };
      
      throw new Error(statusMessage[adminData.status as keyof typeof statusMessage] || 'Admin access denied.');
    }
    
    // Success - clear any failed attempts
    await persistentRateLimiter.clearAttempts(`email:${sanitizedEmail}`);
    
    // Log successful login with enhanced security details
    await logAdminLogin(user.uid, sanitizedEmail);
    console.log('Admin login successful');
    
  } catch (error: any) {
    console.error('Login error details:', error);
    
    // Enhanced error tracking for security monitoring
    if (!error.message.includes('Rate limited') && 
        !error.message.includes('Invalid email') && 
        !error.message.includes('pending approval')) {
      await persistentRateLimiter.recordFailedAttempt(`email:${values.email}`);
    }
    
    throw error;
  }
};

// Enhanced password reset with additional security
export const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
  try {
    const sanitizedEmail = validateAndSanitizeEmail(values.email);
    
    // Check rate limiting for password reset requests
    const resetLimitCheck = await persistentRateLimiter.isRateLimited(`reset:${sanitizedEmail}`);
    if (resetLimitCheck.isLimited) {
      // Don't reveal rate limiting for password reset to prevent enumeration
      console.log('Password reset rate limited for:', sanitizedEmail);
      return;
    }
    
    await sendPasswordResetEmail(auth, sanitizedEmail);
    
    // Record password reset attempt for monitoring
    console.log('Password reset email sent to:', sanitizedEmail);
    
  } catch (error: any) {
    console.error('Password reset error:', error);
    // Always show success message to prevent email enumeration attacks
  }
};

// Export rate limiter info for monitoring (now async)
export const getRateLimitInfo = async (email: string) => {
  try {
    const sanitizedEmail = validateAndSanitizeEmail(email);
    return await persistentRateLimiter.getAttemptInfo(`email:${sanitizedEmail}`);
  } catch {
    return { count: 0 };
  }
};
