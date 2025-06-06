
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Shield, Phone, Mail, User, Lock } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type RegistrationStep = 'details' | 'otp-verification' | 'password' | 'success';

const AdminRegistration = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<RegistrationStep>('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [otpData, setOtpData] = useState({
    emailOTP: '',
    phoneOTP: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendOTPs = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would send OTPs via your backend
      // For demo purposes, we'll simulate this
      toast({
        title: "OTPs Sent",
        description: "Verification codes sent to your email and phone.",
      });
      setStep('otp-verification');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTPs. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const verifyOTPs = async () => {
    setLoading(true);
    try {
      // In a real implementation, verify OTPs with your backend
      if (otpData.emailOTP.length === 6 && otpData.phoneOTP.length === 6) {
        toast({
          title: "Verification Successful",
          description: "OTPs verified successfully.",
        });
        setStep('password');
      } else {
        throw new Error('Invalid OTPs');
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTPs. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const completeRegistration = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // Store admin data in Firestore
      await setDoc(doc(db, 'admins', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: 'admin',
        createdAt: new Date(),
        verified: true
      });

      await sendEmailVerification(user);
      setStep('success');
      
      toast({
        title: "Registration Successful",
        description: "Admin account created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button onClick={sendOTPs} disabled={loading} className="w-full">
              Send Verification Codes
            </Button>
          </div>
        );

      case 'otp-verification':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Verify Your Identity</h3>
              <p className="text-sm text-gray-600">Enter the verification codes sent to your email and phone</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Email OTP</Label>
                <InputOTP maxLength={6} value={otpData.emailOTP} onChange={(value) => setOtpData(prev => ({ ...prev, emailOTP: value }))}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div>
                <Label>Phone OTP</Label>
                <InputOTP maxLength={6} value={otpData.phoneOTP} onChange={(value) => setOtpData(prev => ({ ...prev, phoneOTP: value }))}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button onClick={verifyOTPs} disabled={loading} className="w-full">
              Verify Codes
            </Button>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button onClick={completeRegistration} disabled={loading} className="w-full">
              Complete Registration
            </Button>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              <Shield className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Registration Successful!</h3>
              <p className="text-gray-600 mt-2">
                Your admin account has been created successfully.
              </p>
            </div>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Login
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-blue-light to-school-orange-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-school-blue mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-school-blue mb-2">Admin Registration</h1>
          <p className="text-gray-600">Create your admin account</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-school-blue">
              Step {step === 'details' ? '1' : step === 'otp-verification' ? '2' : step === 'password' ? '3' : '4'} of 4
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegistration;
