
import { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import AdminRegistrationForm from '@/components/admin/AdminRegistrationForm';
import AdminRegistrationSuccess from '@/components/admin/AdminRegistrationSuccess';
import { getAdminByEmail, AdminUser } from '@/utils/authUtils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CompleteAdminRegistration from '@/components/auth/CompleteAdminRegistration';

type Status = 'prompt_email' | 'checking' | 'not_found' | 'pending' | 'approved' | 'rejected' | 'revoked' | 'request_submitted';

const AdminRegistration = () => {
  const [status, setStatus] = useState<Status>('prompt_email');
  const [email, setEmail] = useState('');
  const [adminRequest, setAdminRequest] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const handleCheckEmail = async () => {
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setStatus('checking');
    const request = await getAdminByEmail(email);
    setAdminRequest(request);
    if (request) {
      setStatus(request.status);
    } else {
      setStatus('not_found');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'prompt_email':
        return (
          <div className="space-y-4">
            <p className="text-center text-gray-600">Enter your email to begin registration or check your application status.</p>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckEmail()}
            />
            <Button onClick={handleCheckEmail} className="w-full bg-school-blue hover:bg-school-blue/90">Continue</Button>
          </div>
        );
      case 'checking':
        return (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-school-blue" />
            <p className="ml-2 text-gray-600">Checking status...</p>
          </div>
        );
      case 'not_found':
        return <AdminRegistrationForm onSuccess={() => setStatus('request_submitted')} prefilledEmail={email} />;
      case 'request_submitted':
        return <AdminRegistrationSuccess />;
      case 'approved':
        return <CompleteAdminRegistration adminRequest={adminRequest!} />;
      case 'pending':
        return <p className="text-center text-yellow-600 bg-yellow-100 p-4 rounded-md">Your admin access request is currently pending approval. Please check back later.</p>;
      case 'rejected':
        return <p className="text-center text-red-600 bg-red-100 p-4 rounded-md">Your admin access request has been rejected. Please contact support for more information.</p>;
      case 'revoked':
        return <p className="text-center text-gray-600 bg-gray-100 p-4 rounded-md">Your admin access has been revoked. Please contact support if you believe this is an error.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-blue-light to-school-orange-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-school-blue mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-school-blue mb-2">Admin Registration</h1>
          <p className="text-gray-600">Request access or complete your registration</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;
