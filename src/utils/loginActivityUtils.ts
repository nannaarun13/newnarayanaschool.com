
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

// Secure client IP detection without external API dependency
const getClientIP = (): string => {
  try {
    // In a production environment, you would get this from your server
    // For now, we'll use a placeholder that doesn't make external requests
    return 'client-ip'; // This should be set by your server/proxy
  } catch (error) {
    console.error('Error getting client IP:', error);
    return 'unknown';
  }
};

// Sanitize user agent to prevent XSS
const sanitizeUserAgent = (userAgent: string): string => {
  if (!userAgent || typeof userAgent !== 'string') return 'unknown';
  // Remove any potential script tags or dangerous content
  return userAgent.replace(/<[^>]*>/g, '').substring(0, 500);
};

// Log successful admin login
export const logAdminLogin = async (adminId: string, email: string): Promise<void> => {
  try {
    const loginActivity: LoginActivity = {
      adminId,
      email: email.toLowerCase().trim(),
      loginTime: new Date().toISOString(),
      ipAddress: getClientIP(),
      userAgent: sanitizeUserAgent(navigator.userAgent),
      status: 'success'
    };

    await addDoc(collection(db, 'admin_login_activities'), loginActivity);
    console.log('Admin login activity logged successfully');
  } catch (error) {
    console.error('Error logging admin login activity:', error);
    // Don't throw error to prevent login flow interruption
  }
};

// Log failed admin login attempt
export const logFailedAdminLogin = async (email: string, reason: string): Promise<void> => {
  try {
    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedReason = reason.substring(0, 500); // Limit reason length

    const loginActivity: Partial<LoginActivity> = {
      email: sanitizedEmail,
      loginTime: new Date().toISOString(),
      ipAddress: getClientIP(),
      userAgent: sanitizeUserAgent(navigator.userAgent),
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

// Get recent login activities with input validation
export const getRecentLoginActivities = async (limitCount: number = 50): Promise<LoginActivity[]> => {
  try {
    // Validate and sanitize limit
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
      // Validate required fields
      if (data.email && data.loginTime && data.status) {
        activities.push({ ...data } as LoginActivity);
      }
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting login activities:', error);
    return [];
  }
};
