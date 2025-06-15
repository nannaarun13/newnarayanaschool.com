
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { registrationSchema, RegistrationFormData } from '@/utils/adminRegistrationSchema';

interface AdminRegistrationFormProps {
  onSuccess: () => void;
}

const AdminRegistrationForm = ({ onSuccess }: AdminRegistrationFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleSubmit = async (values: RegistrationFormData) => {
    setLoading(true);
    
    try {
      await checkForDuplicates(values.email, values.phone);
      
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      const adminData = {
        firstName: values.firstName.trim().replace(/\s+/g, ' '),
        lastName: values.lastName.trim().replace(/\s+/g, ' '),
        email: values.email.toLowerCase().trim(),
        phone: `+91${values.phone.trim()}`,
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "admins", user.uid), adminData);
      
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-school-blue" />
        </div>
        <CardTitle className="text-2xl text-center text-school-blue">
          Register for Admin Access
        </CardTitle>
        <p className="text-center text-gray-600 text-sm">
          Request administrative access to the school management system
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} disabled={loading} autoComplete="given-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
               <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} disabled={loading} autoComplete="family-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@domain.com" {...field} disabled={loading} autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-700 font-medium">
                      +91
                    </span>
                    <Input type="tel" placeholder="9876543210" maxLength={10} className="rounded-l-none" {...field} disabled={loading} autoComplete="tel" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} disabled={loading} autoComplete="new-password" />
                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} disabled={loading} autoComplete="new-password" />
                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Security Notice</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your request will be reviewed by existing administrators</li>
                <li>• After approval, you can sign in with your credentials.</li>
                <li>• All registration attempts are logged for security purposes.</li>
              </ul>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Request...</span>
                </div>
              ) : (
                'Submit Registration Request'
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Already have access?{' '}
            <Button variant="link" className="text-school-blue p-0 h-auto" onClick={() => navigate('/login')} disabled={loading}>
              Sign In
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRegistrationForm;
