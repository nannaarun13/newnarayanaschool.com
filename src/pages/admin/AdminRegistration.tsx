
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
);

const registrationSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Phone number must be 10 digits starting with 6-9."),
    password: z.string().min(8, "Password must be at least 8 characters long.")
      .regex(passwordValidation, {
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      }),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

const AdminRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');
  
  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
    }
  });

  const handleSubmit = async (values: z.infer<typeof registrationSchema>) => {
    setLoading(true);
    setSubmitProgress('Creating account...');
    
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      setSubmitProgress('Saving registration details...');

      // Prepare admin request data
      const adminRequest = {
        firstName: values.firstName.toUpperCase(),
        lastName: values.lastName.toUpperCase(),
        email: values.email,
        phone: `+91${values.phone}`,
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(doc(db, "admins", user.uid), adminRequest);
      setSubmitProgress('Finalizing...');

      // Sign out the user after registration since they need approval
      await auth.signOut();

      setSubmitted(true);
      toast({
        title: "Registration Submitted Successfully",
        description: "Your admin access request has been submitted and is pending approval.",
      });

    } catch (error: any) {
      console.error("Registration error:", error);
      let description = "Failed to submit registration. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email address is already registered.";
      } else if (error.code === 'auth/weak-password') {
        description = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/network-request-failed') {
        description = "Network error. Please check your connection and try again.";
      }
      toast({ 
        title: "Registration Failed", 
        description, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setSubmitProgress('');
    }
  };
  
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-blue-light to-school-orange-light p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Request Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your admin access request has been submitted successfully. You will be able to log in once your request is reviewed and approved by the administrator.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full bg-school-blue hover:bg-school-blue/90">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-blue-light to-school-orange-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-school-blue mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-school-blue mb-2">Admin Registration</h1>
          <p className="text-gray-600">Request access to the admin panel</p>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-school-blue">
              Register for Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl><Input placeholder="First name" {...field} disabled={loading} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                   <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl><Input placeholder="Last name" {...field} disabled={loading} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl><Input type="email" placeholder="your.email@domain.com" {...field} disabled={loading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-700">
                          +91
                        </span>
                        <Input 
                          type="tel" 
                          placeholder="9876543210" 
                          maxLength={10}
                          className="rounded-l-none"
                          {...field} 
                          disabled={loading}
                        />
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
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Enter password" 
                          {...field} 
                          disabled={loading}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8" 
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
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
                    <FormControl><Input type="password" placeholder="Confirm password" {...field} disabled={loading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                {loading && submitProgress && (
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{submitProgress}</span>
                  </div>
                )}
                
                <Button type="submit" disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Registration'
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have access?{' '}
                <Button 
                  variant="link" 
                  className="text-school-blue p-0" 
                  onClick={() => navigate('/login')}
                  disabled={loading}
                >
                  Sign In
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegistration;
