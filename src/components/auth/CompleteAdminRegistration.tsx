
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc, runTransaction } from 'firebase/firestore';
import { AdminUser } from '@/utils/authUtils';
import { useNavigate } from 'react-router-dom';
import PasswordRequirements from '@/components/admin/PasswordRequirements';

const passwordSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(100, { message: "Password too long." })
    .refine(
      password => {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        return hasUpper && hasLower && hasNumber && hasSpecial;
      },
      { message: "Password must contain uppercase, lowercase, number, and special character." }
    ),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface CompleteAdminRegistrationProps {
  adminRequest: AdminUser;
}

const CompleteAdminRegistration = ({ adminRequest }: CompleteAdminRegistrationProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, adminRequest.email, values.password);
      const user = userCredential.user;

      // Create new admin document with UID as document ID and copy all data
      const newAdminDocRef = doc(db, 'admins', user.uid);
      const oldAdminDocRef = doc(db, 'admins', adminRequest.id);
      
      // Copy admin data to new document with UID as document ID
      const adminData = {
        ...adminRequest,
        uid: user.uid,
        completedAt: new Date().toISOString()
      };
      
      // Use transaction to safely migrate the document
      await runTransaction(db, async (transaction) => {
        // Create new document with UID as ID
        transaction.set(newAdminDocRef, adminData);
        // Delete old document
        transaction.delete(oldAdminDocRef);
      });

      toast({
        title: "Registration Successful",
        description: "Your admin account has been created. You can now log in.",
      });
      navigate('/login');

    } catch (error: any) {
      console.error("Error completing registration:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <p className="text-sm text-gray-600">Welcome, {adminRequest.firstName}. Your request has been approved. Please create a password to complete your registration.</p>
          <p className="font-medium text-gray-800">{adminRequest.email}</p>
        </div>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <PasswordRequirements />
        <Button type="submit" disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
          {loading ? 'Completing Registration...' : 'Complete Registration'}
        </Button>
      </form>
    </Form>
  );
};

export default CompleteAdminRegistration;
