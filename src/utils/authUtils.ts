import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminUser {
  uid: string; // Firebase Auth UID
  id: string; // Firestore Document ID, can be the same as UID
  firstName: string;
  lastName:string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string; // ISO string
  approvedAt?: string;
  approvedBy?: string; // email of the approving admin
}

// Fetches all admin requests from Firestore
export const getAdminRequests = async (): Promise<AdminUser[]> => {
  try {
    const q = query(collection(db, 'admins'));
    const querySnapshot = await getDocs(q);
    const requests: AdminUser[] = [];
    querySnapshot.forEach((doc) => {
      // Make sure to include the id from the document
      requests.push({ uid: doc.id, id: doc.id, ...doc.data() } as AdminUser);
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
  status: 'approved' | 'rejected',
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
    }
    await updateDoc(adminDocRef, updateData);
    console.log('Admin request status updated for UID:', uid, 'to:', status);
  } catch (error) {
    console.error('Error updating admin request status:', error);
  }
};

// Checks if a user is an admin by their UID.
// NOTE: This check has been modified to bypass the approval status.
// It now returns true if an admin record exists for the UID, regardless of status.
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const adminDocRef = doc(db, 'admins', uid);
    const docSnap = await getDoc(adminDocRef);

    if (docSnap.exists()) {
      // User is considered an admin if a record exists.
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Gets admin user profile from Firestore by email.
// NOTE: This requires appropriate Firestore security rules to prevent data exposure.
export const getAdminByEmail = async (email: string): Promise<AdminUser | null> => {
    try {
        const q = query(collection(db, "admins"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const adminDoc = querySnapshot.docs[0];
        return { id: adminDoc.id, uid: adminDoc.id, ...adminDoc.data() } as AdminUser;
    } catch (error) {
        console.error("Error getting admin by email:", error);
        return null;
    }
}
