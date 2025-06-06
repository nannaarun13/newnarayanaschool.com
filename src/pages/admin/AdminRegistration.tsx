
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

type RegistrationStep = 'details' | 'otp-verification' | 'password' | 'success';

const AdminRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<RegistrationStep>('details');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'firstName' || name === 'lastName') {
      // Convert to uppercase for names
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validatePersonalDetails = () => {
    // Validate first name - at least 1 character
    if (!formData.firstName || formData.firstName.trim().length < 1) {
      toast({
        title: "Validation Error",
        description: "First name must be at least 1 character.",
        variant: "destructive"
      });
      return false;
    }

    // Validate last name - at least 1 character
    if (!formData.lastName || formData.lastName.trim().length < 1) {
      toast({
        title: "Validation Error",
        description: "Last name must be at least 1 character.",
        variant: "destructive"
      });
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }

    // Validate phone number - must start with +91 and have 10 digits after
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Validation Error",
        description: "Phone number must be in format +91XXXXXXXXXX with valid Indian mobile number.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const sendOTPs = async () => {
    if (!validatePersonalDetails()) {
      return;
    }

    setLoading(true);
    try {
      // Here you would integrate with your SMS service for phone OTP
      // For now, we'll simulate OTP generation
      console.log('Sending OTP to email:', formData.email);
      console.log('Sending OTP to phone:', formData.phone);
      
      toast({
        title: "OTPs Sent",
        description: "Verification codes sent to your email and phone. Please check both.",
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
    if (otpData.emailOTP.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Please enter complete email OTP (6 digits).",
        variant: "destructive"
      });
      return;
    }

    if (otpData.phoneOTP.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Please enter complete phone OTP (6 digits).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Here you would verify OTPs with your backend/Firebase
      // For demo purposes, we'll accept any 6-digit OTP
      toast({
        title: "Verification Successful",
        description: "OTPs verified successfully. Please set your password.",
      });
      setStep('password');
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTPs. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const validatePassword = () => {
    if (passwordData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return false;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please enter the same password in both fields.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const completeRegistration = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, passwordData.password);
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
        description: "Admin account created successfully! Please verify your email.",
      });
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email is already registered. Please use a different email.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      }

      toast({
        title: "Registration Failed",
        description: errorMessage,
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
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase</p>
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91XXXXXXXXXX"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: +91 followed by 10 digits</p>
            </div>
            <Button onClick={sendOTPs} disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
              {loading ? 'Sending OTPs...' : 'Send Verification Codes'}
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
                <Label>Email OTP (6 digits) *</Label>
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
                <Label>Phone OTP (6 digits) *</Label>
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
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                Back
              </Button>
              <Button onClick={verifyOTPs} disabled={loading} className="flex-1 bg-school-blue hover:bg-school-blue/90">
                {loading ? 'Verifying...' : 'Verify Codes'}
              </Button>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Set Your Password</h3>
              <p className="text-sm text-gray-600">Create a secure password for your admin account</p>
            </div>
            <div>
              <Label htmlFor="password">Password * (minimum 6 characters)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep('otp-verification')} className="flex-1">
                Back
              </Button>
              <Button onClick={completeRegistration} disabled={loading} className="flex-1 bg-school-blue hover:bg-school-blue/90">
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              <Shield className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold">Registration Successful!</h3>
              <p className="text-gray-600 mt-2">
                Your admin account has been created successfully. Please check your email to verify your account.
              </p>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full bg-school-blue hover:bg-school-blue/90">
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
