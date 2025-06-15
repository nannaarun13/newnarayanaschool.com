
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { registrationSchema, RegistrationFormData } from '@/utils/adminRegistrationSchema';

export const useAdminRegistration = (onSuccess: () => void) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  const checkForDuplicates = async (email: string, phone: string): Promise<void> => {
    const emailQuery = query(collection(db, "admins"), where("email", "==", email));
    const phoneQuery = query(collection(db, "admins"), where("phone", "==", `+91${phone}`));
    
    const [emailSnapshot, phoneSnapshot] = await Promise.all([
      getDocs(emailQuery),
      getDocs(phoneQuery)
    ]);
    
    if (!emailSnapshot.empty) {
      throw new Error('An admin request with this email already exists.');
    }
    
    if (!phoneSnapshot.empty) {
      throw new Error('An admin request with this phone number already exists.');
    }
  };

  const handleRegistrationSubmit = async (values: RegistrationFormData) => {
    setLoading(true);
    
    try {
      // Enable Firestore debug logs
      console.log("Enabling Firestore debug logs...");
      
      await checkForDuplicates(values.email, values.phone);
      
      console.log("Before registration: auth.currentUser", auth.currentUser);

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      console.log("After registration: userCredential", userCredential);
      console.log("User UID:", user.uid);
      console.log("User email verified:", user.emailVerified);

      // Force token refresh to ensure email_verified status is current
      await user.reload();
      const token = await user.getIdToken(true);
      console.log("Token refreshed, user.emailVerified:", user.emailVerified);

      // Use simplified admin data structure that matches the rules
      const adminData = {
        name: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.toLowerCase().trim(),
      };

      console.log("Attempting to write admin record:", adminData, "to UID:", user.uid);

      await setDoc(doc(db, "admins", user.uid), adminData);

      console.log("✅ Admin record written successfully for UID:", user.uid);

      await signOut(auth);

      onSuccess();
      toast({
        title: "Registration Submitted Successfully",
        description: "Your admin access request has been submitted and is pending approval. You'll be notified once reviewed.",
      });

    } catch (error: any) {
      console.error("❌ Registration error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      let errorMessage = "Failed to submit registration. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use by another account.";
      } else if (error.message.includes('already exists')) {
        errorMessage = error.message;
      } else if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check console for detailed logs.";
      }
      
      toast({ 
        title: "Registration Failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, handleRegistrationSubmit };
};
