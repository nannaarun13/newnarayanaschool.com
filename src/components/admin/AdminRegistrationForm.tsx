
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { registrationSchema } from '@/utils/adminRegistrationSchema';
import * as z from "zod";

// Security fix: Remove password fields from registration
const secureRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().email("Invalid email address").max(100, "Email too long"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
});

type SecureRegistrationFormData = z.infer<typeof secureRegistrationSchema>;

interface AdminRegistrationFormProps {
  onSuccess: () => void;
}

const AdminRegistrationForm = ({ onSuccess }: AdminRegistrationFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<SecureRegistrationFormData>({
    resolver: zodResolver(secureRegistrationSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '', phone: ''
    }
  });

  const handleSubmit = async (values: SecureRegistrationFormData) => {
    setLoading(true);
    
    try {
      // Generate a unique ID for the request
      const requestId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Security fix: Store only basic info, no passwords
      const adminData = {
        uid: requestId,
        firstName: values.firstName.toUpperCase(),
        lastName: values.lastName.toUpperCase(),
        email: values.email.toLowerCase().trim(),
        phone: `+91${values.phone}`,
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "admins"), adminData);

      onSuccess();
      toast({
        title: "Registration Submitted Successfully",
        description: "Your admin access request has been submitted. You'll need to create your Firebase account separately after approval.",
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Security Notice:</strong> After approval, you'll need to create your Firebase account separately using the same email address.
              </p>
            </div>
            
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
