
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const createApprovedAdmin = async (
  email: string, 
  firstName: string, 
  lastName: string, 
  phone: string,
  password: string
) => {
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    
    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
    const uid = userCredential.user.uid;
    
    // Sign out the newly created user so current admin can continue
    await signOut(auth);
    
    // Create admin record in Firestore
    const adminData = {
      uid: uid,
      firstName: firstName,
      lastName: lastName,
      email: sanitizedEmail,
      phone: phone,
      status: 'approved',
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: 'System'
    };
    
    await setDoc(doc(db, 'admins', uid), adminData);
    
    console.log('Admin account created and approved:', sanitizedEmail);
    return { success: true, uid };
  } catch (error: any) {
    console.error('Error creating approved admin:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      // Email exists, try to update existing record
      try {
        const sanitizedEmail = email.toLowerCase().trim();
        
        // Find existing admin record by email
        const adminQuery = await getDoc(doc(db, 'admins', sanitizedEmail));
        
        if (adminQuery.exists()) {
          // Update existing record to approved
          await setDoc(doc(db, 'admins', adminQuery.id), {
            ...adminQuery.data(),
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: 'System'
          }, { merge: true });
          
          return { success: true, uid: adminQuery.id };
        }
      } catch (updateError) {
        console.error('Error updating existing admin:', updateError);
      }
    }
    
    throw error;
  }
};
