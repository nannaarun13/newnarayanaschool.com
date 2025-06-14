
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { logAdminLogin, logFailedAdminLogin } from './loginActivityUtils';
import { ensureDefaultAdmin, DEFAULT_ADMIN } from './adminUtils';
import { persistentRateLimiter } from './persistentRateLimiter';
import { advancedSecurityMonitor } from './advancedSecurityMonitor';
import { sanitizeEmail, validateAndSanitizeUrl, generateCSRFToken } from './inputSanitization';
import { SecureErrorHandler } from './errorHandling';
import { validateRequestOrigin, validateTimestamp } from './requestValidation';
import * as z from "zod";

// Enhanced validation schemas with stronger security
export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .refine(
      email => {
        try {
          sanitizeEmail(email);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid email format." }
    )
    .transform(email => {
      try {
        return sanitizeEmail(email);
      } catch {
        throw new Error("Invalid email format");
      }
    }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(100, { message: "Password too long." })
    .refine(
      password => {
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
        try {
          sanitizeEmail(email);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid email format." }
    )
    .transform(email => {
      try {
        return sanitizeEmail(email);
      } catch {
        throw new Error("Invalid email format");
      }
    }),
});

// Enhanced login handler with comprehensive security
export const handleLogin = async (values: z.infer<typeof loginSchema>) => {
  console.log('Login attempt initiated');
  
  try {
    // Validate request origin
    if (!validateRequestOrigin()) {
      const error = SecureErrorHandler.handleSuspiciousActivity(
        new Error('Invalid origin'), 
        'Request from unauthorized origin'
      );
      throw new Error(error.userMessage);
    }

    // Enhanced input validation with sanitization
    const sanitizedEmail = values.email; // Already sanitized by schema transform
    const password = values.password;
    
    if (!password || password.length < 8 || password.length > 100) {
      const error = SecureErrorHandler.handleValidationError(new Error('Invalid password'), 'password');
      throw new Error(error.userMessage);
    }
    
    // Enhanced rate limiting check
    const emailLimitCheck = await persistentRateLimiter.isRateLimited(`email:${sanitizedEmail}`);
    
    if (emailLimitCheck.isLimited) {
      const minutes = Math.ceil((emailLimitCheck.timeRemaining || 0) / 60000);
      await logFailedAdminLogin(sanitizedEmail, `Rate limited: ${emailLimitCheck.reason}`);
      const error = SecureErrorHandler.handleRateLimitError(new Error(emailLimitCheck.reason));
      throw new Error(`${error.userMessage} Please try again in ${minutes} minutes.`);
    }

    // Generate CSRF token for session
    const csrfToken = generateCSRFToken();
    sessionStorage.setItem('csrf_token', csrfToken);

    // Attempt Firebase authentication
    console.log('Attempting Firebase authentication');
    let userCredential;
    
    try {
      userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
    } catch (firebaseAuthError: any) {
      // Record failed attempt before handling error
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      
      // Enhanced error handling with security logging
      const errorCode = firebaseAuthError.code;
      
      switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          await logFailedAdminLogin(sanitizedEmail, 'Invalid credentials');
          const credentialError = SecureErrorHandler.handleAuthenticationError(firebaseAuthError);
          throw new Error(credentialError.userMessage);
        case 'auth/too-many-requests':
          await logFailedAdminLogin(sanitizedEmail, 'Firebase rate limited');
          const rateError = SecureErrorHandler.handleRateLimitError(firebaseAuthError);
          throw new Error(rateError.userMessage);
        case 'auth/user-disabled':
          await logFailedAdminLogin(sanitizedEmail, 'Account disabled');
          const suspiciousError = SecureErrorHandler.handleSuspiciousActivity(firebaseAuthError, 'Disabled account access attempt');
          throw new Error(suspiciousError.userMessage);
        case 'auth/network-request-failed':
          await logFailedAdminLogin(sanitizedEmail, 'Network error');
          const networkError = SecureErrorHandler.handleNetworkError(firebaseAuthError);
          throw new Error(networkError.userMessage);
        default:
          await logFailedAdminLogin(sanitizedEmail, `Firebase error: ${errorCode}`);
          const unknownError = SecureErrorHandler.handleUnknownError(firebaseAuthError);
          throw new Error(unknownError.userMessage);
      }
    }
    
    const user = userCredential.user;
    
    // Verify email is verified for additional security
    if (!user.emailVerified && sanitizedEmail !== DEFAULT_ADMIN.email.toLowerCase()) {
      await auth.signOut();
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Email not verified');
      const error = SecureErrorHandler.handleAuthenticationError(new Error('Email not verified'));
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
        await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
        await logFailedAdminLogin(sanitizedEmail, 'Email not registered as admin or access pending approval');
        const error = SecureErrorHandler.handleAuthenticationError(new Error('Not authorized'));
        throw new Error('This email is not registered as an admin or your access is pending approval.');
      }
      
      adminDoc = querySnapshot.docs[0];
    }
    
    const adminData = adminDoc.data();
    
    // Enhanced admin data validation
    if (!adminData || !adminData.status || !adminData.email) {
      console.log('Invalid admin data');
      await auth.signOut();
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Invalid admin data');
      const error = SecureErrorHandler.handleSuspiciousActivity(new Error('Invalid admin data'));
      throw new Error(error.userMessage);
    }
    
    // Verify email matches (prevent account takeover)
    if (adminData.email.toLowerCase() !== sanitizedEmail) {
      console.log('Email mismatch in admin record');
      await auth.signOut();
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Email mismatch');
      const error = SecureErrorHandler.handleSuspiciousActivity(new Error('Email mismatch'));
      throw new Error(error.userMessage);
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
      
      const error = SecureErrorHandler.handleAuthenticationError(new Error('Access denied'));
      throw new Error(statusMessage[adminData.status as keyof typeof statusMessage] || error.userMessage);
    }
    
    // Success - clear any failed attempts
    await persistentRateLimiter.clearAttempts(`email:${sanitizedEmail}`);
    
    // Advanced security analysis for successful login
    await advancedSecurityMonitor.analyzeLoginAttempt(sanitizedEmail, true);
    
    // Log successful login
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

// Export rate limiter info for monitoring
export const getRateLimitInfo = async (email: string) => {
  try {
    const sanitizedEmail = sanitizeEmail(email);
    return await persistentRateLimiter.getAttemptInfo(`email:${sanitizedEmail}`);
  } catch {
    return { count: 0 };
  }
};
