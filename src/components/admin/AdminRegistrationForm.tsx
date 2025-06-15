import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { registrationSchema, type RegistrationFormData } from '@/utils/adminRegistrationSchema';

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
      firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
    }
  });

  const handleSubmit = async (values: RegistrationFormData) => {
    setLoading(true);
    
    try {
      // Generate a unique ID for the request
      const requestId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save admin request to Firestore, including password for future account creation
      const adminData = {
        uid: requestId, // Use custom ID instead of Firebase auth UID
        firstName: values.firstName.toUpperCase(),
        lastName: values.lastName.toUpperCase(),
        email: values.email,
        phone: `+91${values.phone}`,
        password: values.password, // Store password for later account creation
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "admins"), adminData);

      onSuccess();
      toast({
        title: "Registration Submitted Successfully",
        description: "Your admin access request has been submitted and is pending approval.",
      });

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({ 
        title: "Registration Failed", 
        description: "Failed to submit registration. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default AdminRegistrationForm;
