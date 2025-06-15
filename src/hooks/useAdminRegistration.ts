
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
      // Create admin request (pending approval) – passwords are NOT stored
      const adminData = {
        firstName: values.firstName?.trim() || "",
        lastName: values.lastName?.trim() || "",
        email: values.email?.toLowerCase().trim() || "",
        phone: values.phone?.trim() || "",
        status: 'pending' as const,
        requestedAt: new Date().toISOString()
      };

      console.log("Attempting to submit adminData:", adminData);
      // Double check that all fields are strings and not empty
      if (
        !adminData.firstName ||
        !adminData.lastName ||
        !adminData.email ||
        !adminData.phone ||
        !adminData.requestedAt
      ) {
        throw new Error("One or more fields are empty or invalid.");
      }

      await addDoc(collection(db, "admins"), adminData);

      onSuccess();
      toast({
        title: "Registration Submitted Successfully",
        description: "Your admin access request has been submitted and is pending approval.",
      });

    } catch (error: any) {
      console.error("Registration error:", error, "Submitted adminData:", values);
      const errorMessage =
        error?.message === "One or more fields are empty or invalid."
          ? "Fill out all fields with valid data."
          : "Failed to submit registration. Please try again.";
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
