
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { logAdminLogin, logFailedAdminLogin } from './loginActivityUtils';
import { ensureDefaultAdmin, DEFAULT_ADMIN } from './adminUtils';
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

// Rate limiting storage (in production, use Redis or similar)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Check if user is rate limited
const isRateLimited = (email: string): boolean => {
  const attempts = loginAttempts.get(email);
  if (!attempts) return false;
  
  const now = Date.now();
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(email);
    return false;
  }
  
  return attempts.count >= MAX_LOGIN_ATTEMPTS;
};

// Record failed login attempt
const recordFailedAttempt = (email: string): void => {
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(email, attempts);
};

// Clear failed attempts on successful login
const clearFailedAttempts = (email: string): void => {
  loginAttempts.delete(email);
};

export const handleLogin = async (values: z.infer<typeof loginSchema>) => {
  console.log('Login attempt for:', values.email);
  
  // Input validation and sanitization
  const sanitizedEmail = values.email.trim().toLowerCase();
  
  // Rate limiting check
  if (isRateLimited(sanitizedEmail)) {
    await logFailedAdminLogin(sanitizedEmail, 'Rate limited - too many failed attempts');
    throw new Error('Too many failed login attempts. Please try again in 15 minutes.');
  }

  try {
    // Attempt Firebase authentication
    console.log('Attempting Firebase authentication');
    const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, values.password);
    const user = userCredential.user;
    
    // For default admin, ensure admin record exists
    if (sanitizedEmail === DEFAULT_ADMIN.email.toLowerCase()) {
      await ensureDefaultAdmin(user.uid);
    }
    
    // Check if user has admin record and is approved
    console.log('Checking admin status for user:', user.uid);
    
    // First try to find admin record by UID
    let adminDoc = await getDoc(doc(db, 'admins', user.uid));
    
    if (!adminDoc.exists()) {
      // If not found by UID, try to find by email
      console.log('Admin record not found by UID, searching by email');
      const q = query(collection(db, 'admins'), where('email', '==', sanitizedEmail), where('status', '==', 'approved'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No approved admin record found, signing out');
        await auth.signOut();
        recordFailedAttempt(sanitizedEmail);
        await logFailedAdminLogin(sanitizedEmail, 'Email not registered as admin or access pending approval');
        throw new Error('This email is not registered as an admin or your access is pending approval.');
      }
      
      console.log('Admin record found by email');
      adminDoc = querySnapshot.docs[0];
    }
    
    const adminData = adminDoc.data();
    if (adminData.status !== 'approved') {
      console.log('Admin not approved, signing out');
      await auth.signOut();
      recordFailedAttempt(sanitizedEmail);
      await logFailedAdminLogin(sanitizedEmail, `Admin access ${adminData.status}`);
      throw new Error('Your admin access request is pending approval or has been rejected.');
    }
    
    // Clear failed attempts on successful login
    clearFailedAttempts(sanitizedEmail);
    
    // Log successful login
    await logAdminLogin(user.uid, sanitizedEmail);
    console.log('Admin login successful');
    
  } catch (error: any) {
    console.error('Login error details:', error);
    
    // Record failed attempt for rate limiting
    recordFailedAttempt(sanitizedEmail);
    
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      await logFailedAdminLogin(sanitizedEmail, 'Invalid email or password');
      throw new Error('Invalid email or password.');
    }
    
    if (error.code === 'auth/too-many-requests') {
      await logFailedAdminLogin(sanitizedEmail, 'Too many requests - account temporarily disabled');
      throw new Error('Account temporarily disabled due to many failed login attempts. Try again later or reset your password.');
    }
    
    if (error.message.includes('pending approval') || error.message.includes('not registered') || error.message.includes('Rate limited')) {
      throw error;
    }
    
    await logFailedAdminLogin(sanitizedEmail, error.message);
    throw new Error('Login failed. Please try again.');
  }
};

export const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
  const sanitizedEmail = values.email.trim().toLowerCase();
  
  try {
    await sendPasswordResetEmail(auth, sanitizedEmail);
  } catch (error: any) {
    console.error('Password reset error:', error);
    // Don't reveal whether email exists or not for security
    // Always show success message to prevent email enumeration
  }
};
