
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { type RegistrationFormData } from '@/utils/adminRegistrationSchema';

interface UseAdminRegistrationProps {
  onSuccess: () => void;
}

export const useAdminRegistration = ({ onSuccess }: UseAdminRegistrationProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: RegistrationFormData) => {
    setLoading(true);
    
    try {
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
      
      const errorMessage = "Failed to submit registration. Please try again.";
      
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
