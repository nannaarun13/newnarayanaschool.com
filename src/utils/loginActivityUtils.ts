
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LoginActivity {
  adminId: string;
  email: string;
  loginTime: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  failureReason?: string;
}

// Enhanced input sanitization
const sanitizeString = (input: string, maxLength: number = 500): string => {
  if (!input || typeof input !== 'string') return 'unknown';
  // Remove any potential script tags, HTML, and limit length
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, maxLength);
};

const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  return email.toLowerCase().trim().substring(0, 100);
};

// Secure client info detection without external dependencies
const getSecureClientInfo = () => {
  try {
    return {
      // In production, IP should be set by server/proxy headers
      ipAddress: 'client-detected', // Placeholder - should be server-provided
      userAgent: sanitizeString(navigator.userAgent, 500)
    };
  } catch (error) {
    console.error('Error getting client info:', error);
    return {
      ipAddress: 'unknown',
      userAgent: 'unknown'
    };
  }
};

// Validate ISO date string
const isValidISODate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('T');
};

// Log successful admin login with enhanced security
export const logAdminLogin = async (adminId: string, email: string): Promise<void> => {
  try {
    // Enhanced input validation
    if (!adminId || typeof adminId !== 'string' || adminId.length > 100) {
      console.error('Invalid adminId provided');
      return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      console.error('Invalid email provided');
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

// Log failed admin login attempt with enhanced security
export const logFailedAdminLogin = async (email: string, reason: string): Promise<void> => {
  try {
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
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

    const loginActivity: Partial<LoginActivity> = {
      email: sanitizedEmail,
      loginTime,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      status: 'failed',
      failureReason: sanitizedReason
    };

    await addDoc(collection(db, 'admin_login_activities'), loginActivity);
    console.log('Failed admin login attempt logged successfully');
  } catch (error) {
    console.error('Error logging failed admin login attempt:', error);
    // Don't throw error to prevent login flow interruption
  }
};

// Get recent login activities with enhanced validation
export const getRecentLoginActivities = async (limitCount: number = 50): Promise<LoginActivity[]> => {
  try {
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
      
      // Enhanced data validation
      if (data.email && 
          data.loginTime && 
          data.status && 
          typeof data.email === 'string' &&
          typeof data.loginTime === 'string' &&
          ['success', 'failed'].includes(data.status) &&
          isValidISODate(data.loginTime)) {
        
        activities.push({
          adminId: data.adminId ? sanitizeString(data.adminId, 100) : '',
          email: sanitizeEmail(data.email),
          loginTime: data.loginTime,
          ipAddress: data.ipAddress ? sanitizeString(data.ipAddress, 50) : undefined,
          userAgent: data.userAgent ? sanitizeString(data.userAgent, 500) : undefined,
          status: data.status,
          failureReason: data.failureReason ? sanitizeString(data.failureReason, 500) : undefined
        } as LoginActivity);
      }
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting login activities:', error);
    return [];
  }
};
