
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
  
  // Special handling for the specific admin email
  if (values.email === 'arunnanna3@gmail.com' && values.password === 'Arun@2004') {
    console.log('Attempting hardcoded admin login');
    try {
      // Try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      console.log('Hardcoded admin login successful:', userCredential.user.uid);
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
        } catch (createError: any) {
          console.log('Create error:', createError.code);
          if (createError.code === 'auth/email-already-in-use') {
            // If email exists but sign in failed, try again
            await signInWithEmailAndPassword(auth, values.email, values.password);
          } else {
            throw createError;
          }
        }
      } else if (signInError.code === 'auth/wrong-password') {
        throw new Error('Invalid password');
      } else {
        throw signInError;
      }
    }
  } else {
    // Regular login flow for other users
    console.log('Attempting regular user login');
    await signInWithEmailAndPassword(auth, values.email, values.password);
    
    // Check if user has admin record
    const user = auth.currentUser;
    if (user) {
      console.log('Checking admin status for user:', user.uid);
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (!adminDoc.exists()) {
          console.log('No admin record found, signing out');
          await auth.signOut();
          throw new Error('This email is not registered as an admin.');
        }
        console.log('Admin record found for user');
      } catch (error) {
        console.error('Error checking admin record:', error);
        await auth.signOut();
        throw new Error('This email is not registered as an admin.');
      }
    }
  }
};

export const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
  await sendPasswordResetEmail(auth, values.email);
};
