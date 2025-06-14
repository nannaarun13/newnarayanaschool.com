
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
  // Special handling for the specific admin email
  if (values.email === 'arunnanna3@gmail.com' && values.password === 'Arun@2004') {
    try {
      // Try to sign in first
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (signInError: any) {
      if (signInError.code === 'auth/user-not-found') {
        // User doesn't exist, create them
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
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
        } catch (createError: any) {
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
    await signInWithEmailAndPassword(auth, values.email, values.password);
    
    // Check if user has admin record
    const user = auth.currentUser;
    if (user) {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!adminDoc.exists()) {
        await auth.signOut();
        throw new Error('This email is not registered as an admin.');
      }
    }
  }
};

export const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
  await sendPasswordResetEmail(auth, values.email);
};
