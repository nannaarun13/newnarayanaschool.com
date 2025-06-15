
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminUser {
  uid?: string; // Firebase Auth UID (optional for pending requests)
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

// Fetches all admin requests
export const getAdminRequests = async (): Promise<AdminUser[]> => {
  try {
    const q = query(collection(db, 'admins'));
    const querySnapshot = await getDocs(q);
    const requests: AdminUser[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({ 
        id: doc.id, 
        uid: data.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        status: data.status,
        requestedAt: data.requestedAt,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
        rejectedAt: data.rejectedAt,
        rejectedBy: data.rejectedBy,
        revokedAt: data.revokedAt,
        revokedBy: data.revokedBy
      } as AdminUser);
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting admin requests:', error);
    return [];
  }
};

// Enhanced admin verification
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    if (!uid || typeof uid !== 'string') {
      return false;
    }

    const user = await getDoc(doc(db, 'admins', uid));
    if (!user.exists()) {
      return false;
    }
    
    const userData = user.data();
    return userData.status === 'approved';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get admin by email
export const getAdminByEmail = async (email: string): Promise<AdminUser | null> => {
  try {
    const q = query(collection(db, "admins"), where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const adminDoc = querySnapshot.docs[0];
    const data = adminDoc.data();
    
    return { 
      id: adminDoc.id, 
      uid: data.uid, 
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
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
};
