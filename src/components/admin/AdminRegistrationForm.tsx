
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Shield } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { registrationSchema, type RegistrationFormData } from '@/utils/adminRegistrationSchema';
import { useAdminRegistration } from '@/hooks/useAdminRegistration';
import PasswordField from './PasswordField';
import PasswordRequirements from './PasswordRequirements';

interface AdminRegistrationFormProps {
  onSuccess: () => void;
}

const AdminRegistrationForm = ({ onSuccess }: AdminRegistrationFormProps) => {
  const { loading, handleSubmit, navigate } = useAdminRegistration({ onSuccess });
  
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
                    <Input 
                      placeholder="First name" 
                      {...field} 
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Last name" 
                      {...field} 
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your.email@domain.com" 
                    {...field} 
                    disabled={loading}
                  />
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
                    <Input 
                      type="tel" 
                      placeholder="9876543210" 
                      maxLength={10}
                      className="rounded-l-none"
                      {...field} 
                      disabled={loading}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9]/g, '');
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="password" render={({ field }) => (
              <PasswordField 
                field={field} 
                label="Password" 
                placeholder="Password" 
                loading={loading} 
              />
            )} />
            
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <PasswordField 
                field={field} 
                label="Confirm Password" 
                placeholder="Confirm Password" 
                loading={loading} 
              />
            )} />
            
            <PasswordRequirements />
            
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
            <Button 
              variant="link" 
              className="text-school-blue p-0 h-auto" 
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
