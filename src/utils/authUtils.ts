
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminUser {
  uid: string; // Firebase Auth UID
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

// Sanitize user input to prevent injection attacks
const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

// Fetches all admin requests from Firestore (filtered for valid dates)
export const getAdminRequests = async (): Promise<AdminUser[]> => {
  try {
    const q = query(collection(db, 'admins'));
    const querySnapshot = await getDocs(q);
    const requests: AdminUser[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Validate required fields and data integrity
      if (isValidDate(data.requestedAt) && 
          data.firstName && 
          data.lastName && 
          data.email && 
          data.phone && 
          data.status) {
        requests.push({ 
          uid: data.uid || doc.id, 
          id: doc.id, 
          firstName: sanitizeString(data.firstName),
          lastName: sanitizeString(data.lastName),
          email: sanitizeString(data.email).toLowerCase(),
          phone: sanitizeString(data.phone),
          status: data.status,
          requestedAt: data.requestedAt,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy,
          rejectedAt: data.rejectedAt,
          rejectedBy: data.rejectedBy,
          revokedAt: data.revokedAt,
          revokedBy: data.revokedBy
        } as AdminUser);
      } else {
        console.warn('Skipping admin record with invalid/missing data:', doc.id, data);
      }
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting admin requests:', error);
    return [];
  }
};

// Updates an admin's status in Firestore with validation
export const updateAdminRequestStatus = async (
  uid: string,
  status: 'approved' | 'rejected' | 'revoked',
  approvedByEmail?: string
): Promise<void> => {
  try {
    // Validate inputs
    if (!uid || typeof uid !== 'string') {
      throw new Error('Invalid UID provided');
    }
    
    if (!['approved', 'rejected', 'revoked'].includes(status)) {
      throw new Error('Invalid status provided');
    }

    const adminDocRef = doc(db, 'admins', uid);
    const currentDoc = await getDoc(adminDocRef);
    
    if (!currentDoc.exists()) {
      throw new Error('Admin record not found');
    }

    const updateData: any = { status };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date().toISOString();
      if (approvedByEmail) {
        updateData.approvedBy = sanitizeString(approvedByEmail).toLowerCase();
      }
      // Clear any previous rejection/revocation data
      updateData.rejectedAt = null;
      updateData.rejectedBy = null;
      updateData.revokedAt = null;
      updateData.revokedBy = null;
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date().toISOString();
      if (approvedByEmail) {
        updateData.rejectedBy = sanitizeString(approvedByEmail).toLowerCase();
      }
    } else if (status === 'revoked') {
      updateData.revokedAt = new Date().toISOString();
      if (approvedByEmail) {
        updateData.revokedBy = sanitizeString(approvedByEmail).toLowerCase();
      }
    }
    
    await updateDoc(adminDocRef, updateData);
    console.log('Admin request status updated for UID:', uid, 'to:', status);
  } catch (error) {
    console.error('Error updating admin request status:', error);
    throw error;
  }
};

// Checks if a user is an admin and approved with enhanced security
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    if (!uid || typeof uid !== 'string') {
      return false;
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
      return userData.status === 'approved';
    }
    
    const userData = user.data();
    return userData.status === 'approved';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Gets admin user profile from Firestore by email with enhanced validation
export const getAdminByEmail = async (email: string): Promise<AdminUser | null> => {
  try {
    if (!email || typeof email !== 'string') {
      return null;
    }
    
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    const q = query(collection(db, "admins"), where("email", "==", sanitizedEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const adminDoc = querySnapshot.docs[0];
    const data = adminDoc.data();
    
    // Validate data integrity
    if (!data.firstName || !data.lastName || !data.email) {
      console.warn('Invalid admin data found:', adminDoc.id);
      return null;
    }
    
    return { 
      id: adminDoc.id, 
      uid: data.uid || adminDoc.id, 
      firstName: sanitizeString(data.firstName),
      lastName: sanitizeString(data.lastName),
      email: sanitizeString(data.email).toLowerCase(),
      phone: sanitizeString(data.phone),
      status: data.status,
      requestedAt: data.requestedAt,
      approvedAt: data.approvedAt,
      approvedBy: data.approvedBy,
      rejectedAt: data.rejectedAt,
      rejectedBy: data.rejectedBy,
      revokedAt: data.revokedAt,
      revokedBy: data.revokedBy
    } as AdminUser;
  } catch (error) {
    console.error("Error getting admin by email:", error);
    return null;
  }
}
