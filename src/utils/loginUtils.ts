
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { logAdminLogin, logFailedAdminLogin } from './loginActivityUtils';
import { ensureDefaultAdmin, DEFAULT_ADMIN } from './adminUtils';
import { persistentRateLimiter } from './persistentRateLimiter';
import { advancedSecurityMonitor } from './advancedSecurityMonitor';
import { sanitizeInput, sanitizeEmail } from './security/inputSanitization';
import { handleSecurityError, ValidationError, AuthenticationError, RateLimitError } from './security/errorHandling';
import { csrfProtection } from './security/csrfProtection';
import * as z from "zod";

// Enhanced validation schemas with stronger security
export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .refine(
      email => {
        const sanitized = sanitizeEmail(email);
        return sanitized.length > 0;
      },
      { message: "Invalid email format." }
    )
    .transform(email => sanitizeEmail(email)),
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
        const sanitized = sanitizeEmail(email);
        return sanitized.length >= 5;
      },
      { message: "Invalid email format." }
    )
    .transform(email => sanitizeEmail(email)),
});

// Enhanced login handler with improved security
export const handleLogin = async (values: z.infer<typeof loginSchema>) => {
  console.log('Login attempt for:', values.email);
  
  try {
    // Enhanced input validation with sanitization
    const sanitizedEmail = values.email; // Already sanitized by schema transform
    const sanitizedPassword = sanitizeInput(values.password, { maxLength: 100, stripTags: true });
    
    if (!sanitizedEmail || !sanitizedPassword) {
      throw new ValidationError('Invalid credentials provided');
    }
    
    // Enhanced rate limiting check
    const emailLimitCheck = await persistentRateLimiter.isRateLimited(`email:${sanitizedEmail}`);
    
    if (emailLimitCheck.isLimited) {
      const minutes = Math.ceil((emailLimitCheck.timeRemaining || 0) / 60000);
      await logFailedAdminLogin(sanitizedEmail, `Rate limited: ${emailLimitCheck.reason}`);
      throw new RateLimitError(emailLimitCheck.reason, emailLimitCheck.timeRemaining);
    }

    // Attempt Firebase authentication
    console.log('Attempting Firebase authentication');
    let userCredential;
    
    try {
      userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
    } catch (authError: any) {
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      
      const errorCode = authError.code;
      let errorMessage = 'Authentication failed';
      
      switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          await logFailedAdminLogin(sanitizedEmail, 'Invalid credentials');
          throw new AuthenticationError('Invalid email or password');
        case 'auth/too-many-requests':
          await logFailedAdminLogin(sanitizedEmail, 'Firebase rate limited');
          throw new RateLimitError('Account temporarily disabled due to many failed login attempts');
        case 'auth/user-disabled':
          await logFailedAdminLogin(sanitizedEmail, 'Account disabled');
          throw new AuthenticationError('This account has been disabled');
        case 'auth/network-request-failed':
          await logFailedAdminLogin(sanitizedEmail, 'Network error');
          throw new Error('Network error. Please check your connection and try again.');
        default:
          await logFailedAdminLogin(sanitizedEmail, `Firebase error: ${errorCode}`);
          throw new AuthenticationError();
      }
    }
    
    const user = userCredential.user;
    
    // Verify email is verified for additional security
    if (!user.emailVerified && sanitizedEmail !== DEFAULT_ADMIN.email.toLowerCase()) {
      await auth.signOut();
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Email not verified');
      throw new AuthenticationError('Please verify your email address before logging in.');
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
        throw new AuthenticationError('This email is not registered as an admin or your access is pending approval.');
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
      throw new AuthenticationError('Invalid admin record. Please contact support.');
    }
    
    // Verify email matches (prevent account takeover)
    if (adminData.email.toLowerCase() !== sanitizedEmail) {
      console.log('Email mismatch in admin record');
      await auth.signOut();
      await persistentRateLimiter.recordFailedAttempt(`email:${sanitizedEmail}`);
      await logFailedAdminLogin(sanitizedEmail, 'Email mismatch');
      throw new AuthenticationError('Security error. Please contact support.');
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
      
      throw new AuthenticationError(statusMessage[adminData.status as keyof typeof statusMessage] || 'Admin access denied.');
    }
    
    // Success - clear any failed attempts
    await persistentRateLimiter.clearAttempts(`email:${sanitizedEmail}`);
    
    // Advanced security analysis for successful login
    await advancedSecurityMonitor.analyzeLoginAttempt(sanitizedEmail, true);
    
    // Log successful login
    await logAdminLogin(user.uid, sanitizedEmail);
    console.log('Admin login successful');
    
  } catch (error: any) {
    const securityError = handleSecurityError(error, 'login');
    console.error('Login error details:', securityError);
    throw securityError;
  }
};

// Enhanced password reset with additional security
export const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
  try {
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
    if (!sanitizedEmail) {
      return { count: 0 };
    }
    return await persistentRateLimiter.getAttemptInfo(`email:${sanitizedEmail}`);
  } catch {
    return { count: 0 };
  }
};
