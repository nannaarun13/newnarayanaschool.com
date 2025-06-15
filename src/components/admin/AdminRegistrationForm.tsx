
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Form } from "@/components/ui/form";
import { useAdminRegistration } from '@/hooks/useAdminRegistration';
import NameInputs from './registration/NameInputs';
import EmailInput from './registration/EmailInput';
import PhoneInput from './registration/PhoneInput';
import PasswordInputs from './registration/PasswordInputs';
import SecurityNotice from './registration/SecurityNotice';
import SubmitButton from './registration/SubmitButton';
import SignInLink from './registration/SignInLink';

interface AdminRegistrationFormProps {
  onSuccess: () => void;
}

const AdminRegistrationForm = ({ onSuccess }: AdminRegistrationFormProps) => {
  const { form, loading, handleRegistrationSubmit } = useAdminRegistration(onSuccess);

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
          <form onSubmit={form.handleSubmit(handleRegistrationSubmit)} className="space-y-4">
            <NameInputs loading={loading} />
            <EmailInput loading={loading} />
            <PhoneInput loading={loading} />
            <PasswordInputs loading={loading} />
            <SecurityNotice />
            <SubmitButton loading={loading} />
          </form>
        </Form>
        <SignInLink loading={loading} />
      </CardContent>
    </Card>
  );
};

export default AdminRegistrationForm;
