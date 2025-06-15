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
      await checkForDuplicates(values.email, values.phone);
      
      // Log auth state before registration
      console.log("Before registration: auth.currentUser", auth.currentUser);

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // NEW: Log user state after registration
      console.log("After registration: userCredential", userCredential);
      console.log("auth.currentUser (should be new user):", auth.currentUser);

      const adminData = {
        firstName: values.firstName.trim().replace(/\s+/g, ' '),
        lastName: values.lastName.trim().replace(/\s+/g, ' '),
        email: values.email.toLowerCase().trim(),
        // Always add +91 and remove duplicate +91 if exists
        phone: `+91${values.phone.trim().replace(/^(\+91)?/, "")}`,
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
      };

      // NEW: Log adminData for debugging
      console.log("Attempting to write admin record:", adminData, "UID:", user.uid);

      await setDoc(doc(db, "admins", user.uid), adminData);

      // Confirm write succeeded
      console.log("Admin record written for UID:", user.uid);

      await signOut(auth);

      onSuccess();
      toast({
        title: "Registration Submitted Successfully",
        description: "Your admin access request has been submitted and is pending approval. You'll be notified once reviewed.",
      });

    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Failed to submit registration. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use by another account.";
      } else if (error.message.includes('already exists')) {
        errorMessage = error.message;
      } else if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please contact the system administrator.";
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
