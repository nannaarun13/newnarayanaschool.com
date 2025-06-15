
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { type RegistrationFormData } from '@/utils/adminRegistrationSchema';

interface UseAdminRegistrationProps {
  onSuccess: () => void;
}

export const useAdminRegistration = ({ onSuccess }: UseAdminRegistrationProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const checkForDuplicates = async (email: string, phone: string): Promise<void> => {
    const emailQuery = query(collection(db, "admins"), where("email", "==", email));
    const phoneQuery = query(collection(db, "admins"), where("phone", "==", phone));
    
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

  const handleSubmit = async (values: RegistrationFormData) => {
    setLoading(true);
    
    try {
      // Check for duplicates
      await checkForDuplicates(values.email, values.phone);
      
      // Create admin request (pending approval)
      const adminData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password, // Store temporarily for approval process
        status: 'pending' as const,
        requestedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "admins"), adminData);

      onSuccess();
      toast({
        title: "Registration Submitted Successfully",
        description: "Your admin access request has been submitted and is pending approval.",
      });

    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Failed to submit registration. Please try again.";
      
      if (error.message.includes('already exists')) {
        errorMessage = error.message;
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

  return {
    loading,
    handleSubmit,
    navigate
  };
};
