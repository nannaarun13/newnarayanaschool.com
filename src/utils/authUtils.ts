
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminUser {
  uid: string; // Firebase Auth UID or custom ID
  id: string; // Firestore Document ID
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  requestedAt: string; // ISO string
  approvedAt?: string;
  approvedBy?: string; // email of the approving admin
  rejectedAt?: string;
  rejectedBy?: string; // email of the rejecting admin
  revokedAt?: string;
  revokedBy?: string; // email of the revoking admin
}

// Helper function to validate if a date string is valid
const isValidDate = (dateString: string): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString !== 'Invalid Date';
};

// Fetches all admin requests from Firestore (filtered for valid dates)
export const getAdminRequests = async (): Promise<AdminUser[]> => {
  try {
    const q = query(collection(db, 'admins'));
    const querySnapshot = await getDocs(q);
    const requests: AdminUser[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only include records with valid requestedAt dates
      if (isValidDate(data.requestedAt)) {
        requests.push({ 
          uid: data.uid || doc.id, 
          id: doc.id, 
          ...data 
        } as AdminUser);
      } else {
        console.warn('Skipping admin record with invalid date:', doc.id, data);
      }
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting admin requests:', error);
    return [];
  }
};

// Updates an admin's status in Firestore
export const updateAdminRequestStatus = async (
  uid: string,
  status: 'approved' | 'rejected' | 'revoked',
  approvedByEmail?: string
): Promise<void> => {
  try {
    const adminDocRef = doc(db, 'admins', uid);
    const updateData: any = { status };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString();
      if (approvedByEmail) {
        updateData.approvedBy = approvedByEmail;
      }
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date().toISOString();
      if (approvedByEmail) {
        updateData.rejectedBy = approvedByEmail;
      }
    } else if (status === 'revoked') {
      updateData.revokedAt = new Date().toISOString();
      if (approvedByEmail) {
        updateData.revokedBy = approvedByEmail;
      }
    }
    
    await updateDoc(adminDocRef, updateData);
    console.log('Admin request status updated for UID:', uid, 'to:', status);
  } catch (error) {
    console.error('Error updating admin request status:', error);
  }
};

// Checks if a user is an admin and approved
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    // Special case for hardcoded admin
    if (uid === 'hardcoded-admin') {
      return true;
    }
    
    const user = await getDoc(doc(db, 'admins', uid));
    if (!user.exists()) {
      // Try to find by Firebase UID in case document ID is different
      const q = query(collection(db, 'admins'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return false;
      }
      const userData = querySnapshot.docs[0].data();
      return userData.status === 'approved' || userData.email === 'arunnanna3@gmail.com';
    }
    
    const userData = user.data();
    // Check if user is approved (or is the hardcoded admin)
    return userData.status === 'approved' || userData.email === 'arunnanna3@gmail.com';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Gets admin user profile from Firestore by email.
export const getAdminByEmail = async (email: string): Promise<AdminUser | null> => {
    try {
        const q = query(collection(db, "admins"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const adminDoc = querySnapshot.docs[0];
        return { id: adminDoc.id, uid: adminDoc.data().uid || adminDoc.id, ...adminDoc.data() } as AdminUser;
    } catch (error) {
        console.error("Error getting admin by email:", error);
        return null;
    }
}
