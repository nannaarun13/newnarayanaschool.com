
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { logAdminLogin, logFailedAdminLogin } from './loginActivityUtils';
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

export const handleLogin = async (values: z.infer<typeof loginSchema>) => {
  console.log('Login attempt for:', values.email);
  
  try {
    // Special handling for the specific admin email - always allow access
    if (values.email === 'arunnanna3@gmail.com' && values.password === 'Arun@2004') {
      console.log('Attempting hardcoded admin login');
      try {
        // Try to sign in first
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        console.log('Hardcoded admin login successful:', userCredential.user.uid);
        
        // Log successful login
        await logAdminLogin(userCredential.user.uid, values.email);
        return; // Skip admin status check for this user
      } catch (signInError: any) {
        console.log('Sign in error:', signInError.code);
        if (signInError.code === 'auth/user-not-found') {
          // User doesn't exist, create them
          console.log('Creating hardcoded admin user');
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            console.log('Hardcoded admin user created:', userCredential.user.uid);
            // Add admin record to Firestore
            await setDoc(doc(db, 'admins', userCredential.user.uid), {
              firstName: 'NANNA',
              lastName: 'ARUN',
              email: values.email,
              phone: '+91 9848047368',
              status: 'approved',
              requestedAt: new Date().toISOString(),
              approvedAt: new Date().toISOString(),
              approvedBy: 'system'
            });
            console.log('Hardcoded admin record created in Firestore');
            
            // Log successful login
            await logAdminLogin(userCredential.user.uid, values.email);
            return; // Skip additional checks
          } catch (createError: any) {
            console.log('Create error:', createError.code);
            if (createError.code === 'auth/email-already-in-use') {
              // If email exists but sign in failed, try again
              const retryCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
              await logAdminLogin(retryCredential.user.uid, values.email);
              return;
            } else {
              await logFailedAdminLogin(values.email, `Account creation failed: ${createError.message}`);
              throw createError;
            }
          }
        } else if (signInError.code === 'auth/wrong-password') {
          await logFailedAdminLogin(values.email, 'Invalid password');
          throw new Error('Invalid password');
        } else {
          await logFailedAdminLogin(values.email, signInError.message);
          throw signInError;
        }
      }
    } else {
      // Regular login flow for other users
      console.log('Attempting regular user login');
      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        
        // Check if user has admin record and is approved
        console.log('Checking admin status for user:', user.uid);
        
        // First try to find admin record by UID
        let adminDoc = await getDoc(doc(db, 'admins', user.uid));
        
        if (!adminDoc.exists()) {
          // If not found by UID, try to find by email
          console.log('Admin record not found by UID, searching by email');
          const q = query(collection(db, 'admins'), where('email', '==', values.email), where('status', '==', 'approved'));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            console.log('No approved admin record found, signing out');
            await auth.signOut();
            await logFailedAdminLogin(values.email, 'Email not registered as admin or access pending approval');
            throw new Error('This email is not registered as an admin or your access is pending approval.');
          }
          
          // Update the admin record with the Firebase UID if found by email
          const adminDocFromEmail = querySnapshot.docs[0];
          await setDoc(doc(db, 'admins', user.uid), {
            ...adminDocFromEmail.data(),
            uid: user.uid
          });
          
          console.log('Admin record found by email and updated with UID');
        } else {
          const adminData = adminDoc.data();
          if (adminData.status !== 'approved') {
            console.log('Admin not approved, signing out');
            await auth.signOut();
            await logFailedAdminLogin(values.email, `Admin access ${adminData.status}`);
            throw new Error('Your admin access request is pending approval or has been rejected.');
          }
        }
        
        // Log successful login
        await logAdminLogin(user.uid, values.email);
        console.log('Admin login successful');
      } catch (error: any) {
        console.error('Login error details:', error);
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          await logFailedAdminLogin(values.email, 'Invalid email or password');
          throw new Error('Invalid email or password.');
        }
        
        if (error.message.includes('pending approval') || error.message.includes('not registered')) {
          // Already logged in the specific catch blocks above
          throw error;
        }
        
        await logFailedAdminLogin(values.email, error.message);
        throw new Error('Login failed. Please try again.');
      }
    }
  } catch (error: any) {
    // If not already logged, log the failed attempt
    if (!error.message.includes('pending approval') && !error.message.includes('not registered')) {
      await logFailedAdminLogin(values.email, error.message);
    }
    throw error;
  }
};

export const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
  await sendPasswordResetEmail(auth, values.email);
};
