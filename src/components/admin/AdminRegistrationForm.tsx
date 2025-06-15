
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Key, User, Lock } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { registrationSchema, type RegistrationFormData } from '@/utils/adminRegistrationSchema';
import { useAdminRegistration } from '@/hooks/useAdminRegistration';
import PasswordField from './PasswordField';
import PasswordRequirements from './PasswordRequirements';
import { useState } from "react";

interface AdminRegistrationFormProps {
  onSuccess: () => void;
}

const formSteps = [
  { label: "Your Details", icon: User },
  { label: "Set Password", icon: Key },
  { label: "Review & Submit", icon: Lock },
];

const AdminRegistrationForm = ({ onSuccess }: AdminRegistrationFormProps) => {
  const { loading, handleSubmit, navigate } = useAdminRegistration({ onSuccess });
  const [step, setStep] = useState(0);

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

  // Next/back navigation
  const goToNext = async () => {
    if (step === 0) {
      // Validate user details
      const validStep = await form.trigger(["firstName", "lastName", "email", "phone"]);
      if (validStep) setStep(1);
    } else if (step === 1) {
      // Validate password fields
      const validStep = await form.trigger(["password", "confirmPassword"]);
      if (validStep) setStep(2);
    }
  };
  const goBack = () => setStep((s) => (s > 0 ? s - 1 : 0));

  // Final submit only from last step
  const onFinalSubmit = (values: RegistrationFormData) => handleSubmit(values);

  // Responsive stepper
  const StepIcon = formSteps[step].icon;

  return (
    <Card className="shadow-xl animate-fade-in">
      <CardHeader>
        {/* Modern Stepper */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-4 gap-2 md:gap-8">
          {formSteps.map((s, idx) => {
            const isActive = idx === step;
            const isDone = idx < step;
            return (
              <div key={s.label} className="flex flex-col items-center relative">
                <s.icon className={`h-7 w-7 transition-colors duration-300 ${isActive ? "text-school-blue" : isDone ? "text-green-500" : "text-gray-300"} mb-1`} />
                <span className={`text-xs md:text-sm 
                  ${isActive ? "font-bold text-school-blue" : isDone ? "text-green-700" : "text-gray-400"}`}>
                  {s.label}
                </span>
                {idx < formSteps.length - 1 && (
                  <span className="hidden md:block absolute top-3.5 -right-8 w-16 h-1 bg-gradient-to-r from-school-blue to-gray-300" />
                )}
              </div>
            );
          })}
        </div>
        <CardTitle className="text-2xl text-center text-school-blue">
          Register for Admin Access
        </CardTitle>
        <p className="text-center text-gray-600 text-sm">
          Request secure administrative access to the school management system
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFinalSubmit)}
            className="space-y-6"
            autoComplete="off"
          >
            {/* Step 1: Details */}
            {step === 0 && (
              <div className="animate-fade-in-up flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} disabled={loading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@domain.com" {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
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
                            inputMode="numeric"
                            pattern="[6-9]\d{9}"
                            onInput={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Passwords */}
            {step === 1 && (
              <div className="animate-fade-in-up flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <PasswordField
                      field={field}
                      label="Password"
                      placeholder="Password"
                      loading={loading}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <PasswordField
                      field={field}
                      label="Confirm Password"
                      placeholder="Confirm Password"
                      loading={loading}
                    />
                  )}
                />
                <PasswordRequirements />
              </div>
            )}

            {/* Step 3: Review and submit */}
            {step === 2 && (
              <div className="animate-fade-in-up flex flex-col gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 space-y-2">
                  <h4 className="font-semibold">Review Your Details</h4>
                  <p>
                    <strong>Name:</strong> {form.getValues('firstName')} {form.getValues('lastName')}
                  </p>
                  <p>
                    <strong>Email:</strong> {form.getValues('email')}
                  </p>
                  <p>
                    <strong>Phone:</strong> +91 {form.getValues('phone')}
                  </p>
                  <div className="flex flex-col md:flex-row gap-2 mt-2">
                    <Button type="button" variant="outline" onClick={goBack} className="mr-auto">
                      Back
                    </Button>
                    <Button type="submit" disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Submitting Request...</span>
                        </div>
                      ) : (
                        'Confirm & Submit Registration'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 2 && (
              <div className="flex justify-between mt-2">
                <Button type="button" variant="outline" onClick={goBack} disabled={step === 0 || loading}>
                  Back
                </Button>
                <Button type="button" onClick={goToNext} disabled={loading} className="bg-school-blue hover:bg-school-blue/90">
                  Next
                </Button>
              </div>
            )}
          </form>
        </Form>
        <div className="mt-8 text-center space-y-2">
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
