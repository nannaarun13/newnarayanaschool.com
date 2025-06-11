
import { auth, db, getAdminData, isApprovedAdmin } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

// Check if a user is authenticated as an admin
export const checkAdminAuth = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get admin document from Firestore
          const adminData = await getAdminData(user.uid);
          
          // Check if user has admin status approved
          if (adminData && adminData.status === 'approved') {
            resolve(true);
            return;
          }
          
          // Check if user's email is approved
          const isApproved = await isApprovedAdmin(user.email || '');
          resolve(isApproved);
        } catch (error) {
          console.error('Error checking admin status:', error);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
};

// Get current authenticated user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Get current admin email
export const getAdminEmail = (): string | null => {
  return auth.currentUser?.email;
};

// Log out the current user
export const clearAdminAuth = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('Admin auth cleared');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Local storage functions for admin requests
// These will eventually be migrated to Firestore
export const getAdminRequests = (): AdminUser[] => {
  try {
    const requests = localStorage.getItem('adminRequests');
    return requests ? JSON.parse(requests) : [];
  } catch (error) {
    console.error('Error getting admin requests:', error);
    return [];
  }
};

export const saveAdminRequest = (request: AdminUser): void => {
  try {
    const requests = getAdminRequests();
    requests.push(request);
    localStorage.setItem('adminRequests', JSON.stringify(requests));
    console.log('Admin request saved for:', request.email);
  } catch (error) {
    console.error('Error saving admin request:', error);
  }
};

export const updateAdminRequestStatus = (email: string, status: 'approved' | 'rejected', approvedBy?: string): void => {
  try {
    const requests = getAdminRequests();
    const updatedRequests = requests.map(request => 
      request.email === email 
        ? { 
            ...request, 
            status, 
            approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
            approvedBy 
          }
        : request
    );
    localStorage.setItem('adminRequests', JSON.stringify(updatedRequests));
    console.log('Admin request status updated for:', email, 'to:', status);
  } catch (error) {
    console.error('Error updating admin request status:', error);
  }
};
