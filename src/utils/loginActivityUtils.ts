
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

// Log successful admin login
export const logAdminLogin = async (adminId: string, email: string): Promise<void> => {
  try {
    const loginActivity: LoginActivity = {
      adminId,
      email,
      loginTime: new Date().toISOString(),
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      status: 'success'
    };

    await addDoc(collection(db, 'admin_login_activities'), loginActivity);
    console.log('Admin login activity logged successfully');
  } catch (error) {
    console.error('Error logging admin login activity:', error);
  }
};

// Log failed admin login attempt
export const logFailedAdminLogin = async (email: string, reason: string): Promise<void> => {
  try {
    const loginActivity: Partial<LoginActivity> = {
      email,
      loginTime: new Date().toISOString(),
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      status: 'failed',
      failureReason: reason
    };

    await addDoc(collection(db, 'admin_login_activities'), loginActivity);
    console.log('Failed admin login attempt logged successfully');
  } catch (error) {
    console.error('Error logging failed admin login attempt:', error);
  }
};

// Get recent login activities
export const getRecentLoginActivities = async (limitCount: number = 50): Promise<LoginActivity[]> => {
  try {
    const q = query(
      collection(db, 'admin_login_activities'),
      orderBy('loginTime', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const activities: LoginActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({ ...doc.data() } as LoginActivity);
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting login activities:', error);
    return [];
  }
};

// Helper function to get client IP (basic implementation)
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting client IP:', error);
    return 'unknown';
  }
};
