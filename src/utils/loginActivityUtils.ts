
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface LoginActivity {
  adminId: string;
  email: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  failureReason?: string;
}

// Enhanced input sanitization with additional security measures
const sanitizeString = (input: string, maxLength: number = 500): string => {
  if (!input || typeof input !== 'string') return 'unknown';
  // Enhanced sanitization with additional security patterns
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&`]/g, '') // Remove potentially dangerous characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim()
    .substring(0, maxLength);
};

const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  const cleaned = email.toLowerCase().trim();
  
  // Enhanced email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned) || cleaned.length > 100 || cleaned.length < 5) {
    return '';
  }
  
  // Check for suspicious patterns
  if (cleaned.includes('..') || cleaned.startsWith('.') || cleaned.endsWith('.')) {
    return '';
  }
  
  return cleaned;
};

// Enhanced client info detection with additional security
const getSecureClientInfo = () => {
  try {
    const userAgent = navigator.userAgent;
    
    // Enhanced user agent validation
    if (!userAgent || userAgent.length > 1000) {
      return {
        ipAddress: 'client-detected',
        userAgent: 'unknown'
      };
    }
    
    return {
      ipAddress: 'client-detected', // In production, should be server-provided
      userAgent: sanitizeString(userAgent, 500)
    };
  } catch (error) {
    console.error('Error getting client info:', error);
    return {
      ipAddress: 'unknown',
      userAgent: 'unknown'
    };
  }
};

// Enhanced date validation with additional security checks
const isValidISODate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;
  
  // Check format first
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  const isValid = !isNaN(date.getTime());
  
  // Additional validation: date should be recent (within last 24 hours to future 1 minute)
  const now = Date.now();
  const dateTime = date.getTime();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);
  const oneMinuteFromNow = now + (60 * 1000);
  
  return isValid && dateTime >= oneDayAgo && dateTime <= oneMinuteFromNow;
};

// Log successful admin login with enhanced security (requires authentication)
export const logAdminLogin = async (adminId: string, email: string): Promise<void> => {
  try {
    // Enhanced input validation
    if (!adminId || typeof adminId !== 'string' || adminId.length > 100) {
      console.error('Invalid adminId provided');
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      console.error('Invalid email provided');
      return;
    }

    // SECURITY: Verify the current user is authenticated and matches
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No authenticated user for login logging');
      return;
    }

    if (currentUser.email?.toLowerCase() !== sanitizedEmail) {
      console.error('Email mismatch for login logging');
      return;
    }

    const clientInfo = getSecureClientInfo();
    const loginTime = new Date().toISOString();

    if (!isValidISODate(loginTime)) {
      console.error('Invalid date generated');
      return;
    }

    const loginActivity: LoginActivity = {
      adminId: sanitizeString(adminId, 100),
      email: sanitizedEmail,
      loginTime,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: 'success'
    };

    await addDoc(collection(db, 'admin_login_activities'), loginActivity);
    console.log('Admin login activity logged successfully');
  } catch (error) {
    console.error('Error logging admin login activity:', error);
    // Don't throw error to prevent login flow interruption
  }
};

// Log failed admin login attempt (can be called without authentication for security monitoring)
export const logFailedAdminLogin = async (email: string, reason: string): Promise<void> => {
  try {
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      console.error('Invalid email provided');
      return;
    }

    const sanitizedReason = sanitizeString(reason, 500);
    if (!sanitizedReason) {
      console.error('Invalid failure reason provided');
      return;
    }

    const clientInfo = getSecureClientInfo();
    const loginTime = new Date().toISOString();

    if (!isValidISODate(loginTime)) {
      console.error('Invalid date generated');
      return;
    }

    // For failed logins, we create a minimal record for security monitoring
    const loginActivity: Partial<LoginActivity> = {
      email: sanitizedEmail,
      loginTime,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: 'failed',
      failureReason: sanitizedReason
    };

    // Note: This will fail due to Firestore rules requiring authentication
    // In production, this should be handled by a Cloud Function or server endpoint
    // For now, we'll log locally for development debugging
    console.log('Failed login attempt (would be logged to secure endpoint):', loginActivity);
    
    // Try to log if user is authenticated (for rate limiting, etc.)
    if (auth.currentUser) {
      await addDoc(collection(db, 'admin_login_activities'), loginActivity);
    }
    
  } catch (error) {
    console.error('Error logging failed admin login attempt:', error);
    // Don't throw error to prevent login flow interruption
  }
};

// Get recent login activities with enhanced validation (requires admin authentication)
export const getRecentLoginActivities = async (limitCount: number = 50): Promise<LoginActivity[]> => {
  try {
    // SECURITY: Verify user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No authenticated user for activity retrieval');
      return [];
    }

    // Enhanced input validation
    const sanitizedLimit = Math.min(Math.max(1, Number(limitCount) || 50), 100);
    
    const q = query(
      collection(db, 'admin_login_activities'),
      orderBy('loginTime', 'desc'),
      limit(sanitizedLimit)
    );
    
    const querySnapshot = await getDocs(q);
    const activities: LoginActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Enhanced data validation with additional security checks
      if (data.email && 
          data.loginTime && 
          data.status && 
          typeof data.email === 'string' &&
          typeof data.loginTime === 'string' &&
          ['success', 'failed'].includes(data.status) &&
          isValidISODate(data.loginTime)) {
        
        const sanitizedEmail = sanitizeEmail(data.email);
        if (sanitizedEmail) {
          activities.push({
            adminId: data.adminId ? sanitizeString(data.adminId, 100) : '',
            email: sanitizedEmail,
            loginTime: data.loginTime,
            ipAddress: data.ipAddress ? sanitizeString(data.ipAddress, 50) : undefined,
            userAgent: data.userAgent ? sanitizeString(data.userAgent, 500) : undefined,
            status: data.status,
            failureReason: data.failureReason ? sanitizeString(data.failureReason, 500) : undefined
          } as LoginActivity);
        }
      }
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting login activities:', error);
    return [];
  }
};
