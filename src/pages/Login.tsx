import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

type LoginMode = 'login' | 'register' | 'forgot-password';
type RegistrationStep = 'details' | 'otp-verification' | 'password' | 'success';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('login');
  const [step, setStep] = useState<RegistrationStep>('details');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // OTP data
  const [otpData, setOtpData] = useState({
    emailOTP: '',
    phoneOTP: ''
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Forgot password data
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'firstName' || name === 'lastName') {
      // Convert any type of letters to uppercase
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (name === 'phone') {
      // Only allow numbers for phone input
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleForgotPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const validateLoginForm = () => {
    if (!loginData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!loginData.password.trim()) {
      toast({
        title: "Validation Error", 
        description: "Password is required.",
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validatePersonalDetails = () => {
    // First name validation - at least 1 character
    if (!formData.firstName || formData.firstName.trim().length < 1) {
      toast({
        title: "Validation Error",
        description: "First name must be at least 1 character.",
        variant: "destructive"
      });
      return false;
    }

    // Last name validation - at least 1 character
    if (!formData.lastName || formData.lastName.trim().length < 1) {
      toast({
        title: "Validation Error",
        description: "Last name must be at least 1 character.",
        variant: "destructive"
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }

    // Phone validation - must be exactly 10 digits
    if (!formData.phone || formData.phone.length !== 10 || !/^[6-9]\d{9}$/.test(formData.phone)) {
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 10 digits starting with 6, 7, 8, or 9.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validatePassword = () => {
    const password = passwordData.password;

    // Check minimum length
    if (!password || password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return false;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      toast({
        title: "Validation Error",
        description: "Password must contain at least one uppercase letter.",
        variant: "destructive"
      });
      return false;
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      toast({
        title: "Validation Error",
        description: "Password must contain at least one lowercase letter.",
        variant: "destructive"
      });
      return false;
    }

    // Check for number
    if (!/\d/.test(password)) {
      toast({
        title: "Validation Error",
        description: "Password must contain at least one number.",
        variant: "destructive"
      });
      return false;
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      toast({
        title: "Validation Error",
        description: "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;':\",./<>?).",
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      navigate('/admin');
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled.";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const sendOTPs = async () => {
    if (!validatePersonalDetails()) {
      return;
    }

    setLoading(true);
    try {
      // Note: In real implementation, you would integrate with SMS and Email services
      // For now, we simulate sending OTPs
      console.log('Sending OTP to email:', formData.email);
      console.log('Sending OTP to phone: +91' + formData.phone);
      
      toast({
        title: "OTPs Sent",
        description: "Verification codes have been sent to your email and phone. Please check both. (Note: This is simulated for demo)",
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
    if (!otpData.emailOTP || otpData.emailOTP.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Please enter complete email OTP (6 digits).",
        variant: "destructive"
      });
      return;
    }

    if (!otpData.phoneOTP || otpData.phoneOTP.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Please enter complete phone OTP (6 digits).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Note: In real implementation, you would verify OTPs with your backend
      // For demo purposes, we simulate verification
      console.log('Verifying email OTP:', otpData.emailOTP);
      console.log('Verifying phone OTP:', otpData.phoneOTP);
      
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

  const completeRegistration = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      // Create Firebase user
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
        phone: `+91${formData.phone}`,
        role: 'admin',
        createdAt: new Date(),
        verified: true
      });

      // Send email verification
      await sendEmailVerification(user);
      
      setStep('success');
      
      toast({
        title: "Registration Successful",
        description: "Admin account created successfully! You can now log in.",
      });
    } catch (error: any) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email is already registered. Please use a different email or try logging in.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Email/password authentication is not enabled in Firebase. Please contact support.";
      }

      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordData.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email to reset password.",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordData.email);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      setMode('login');
    } catch (error: any) {
      let errorMessage = "Failed to send reset email.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={loginData.email}
          onChange={handleLoginInputChange}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={loginData.password}
            onChange={handleLoginInputChange}
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

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-school-blue hover:bg-school-blue/90 text-white py-3"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );

  const renderRegistrationStep = () => {
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
                  onChange={handleRegistrationInputChange}
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
                  onChange={handleRegistrationInputChange}
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
                onChange={handleRegistrationInputChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  <span className="text-sm font-medium">+91</span>
                </div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleRegistrationInputChange}
                  placeholder="Enter 10-digit number"
                  className="rounded-l-none"
                  maxLength={10}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter 10 digits starting with 6, 7, 8, or 9</p>
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
              <p className="text-xs text-orange-600 mt-1">(Note: Real OTP integration requires SMS/Email service setup)</p>
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
              <Label htmlFor="password">Password *</Label>
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
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>At least 8 characters</li>
                  <li>One uppercase letter (A-Z)</li>
                  <li>One lowercase letter (a-z)</li>
                  <li>One number (0-9)</li>
                  <li>One special character (!@#$%^&*)</li>
                </ul>
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
                Your admin account has been created successfully. You can now log in to access the admin panel.
              </p>
            </div>
            <Button onClick={() => {
              setMode('login');
              setStep('details');
              // Reset all form data
              setFormData({ firstName: '', lastName: '', email: '', phone: '' });
              setOtpData({ emailOTP: '', phoneOTP: '' });
              setPasswordData({ password: '', confirmPassword: '' });
            }} className="w-full bg-school-blue hover:bg-school-blue/90">
              Go to Login
            </Button>
          </div>
        );
    }
  };

  const renderForgotPasswordForm = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Reset Password</h3>
        <p className="text-sm text-gray-600">Enter your email to receive reset instructions</p>
      </div>
      <div>
        <Label htmlFor="forgotEmail">Email Address *</Label>
        <Input
          id="forgotEmail"
          name="email"
          type="email"
          value={forgotPasswordData.email}
          onChange={handleForgotPasswordInputChange}
          placeholder="Enter your email"
          required
        />
      </div>
      <Button onClick={handleForgotPassword} disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
        {loading ? 'Sending...' : 'Send Reset Email'}
      </Button>
      <Button variant="outline" onClick={() => setMode('login')} className="w-full">
        Back to Login
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-blue-light to-school-orange-light p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-school-blue mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-school-blue mb-2">
            {mode === 'login' ? 'Admin Login' : mode === 'register' ? 'Admin Registration' : 'Reset Password'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Access the school management system' : mode === 'register' ? 'Create your admin account' : 'Reset your password'}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-school-blue">
              {mode === 'login' ? 'Sign In' : mode === 'register' ? `Step ${step === 'details' ? '1' : step === 'otp-verification' ? '2' : step === 'password' ? '3' : '4'} of 4` : 'Password Reset'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === 'login' && renderLoginForm()}
            {mode === 'register' && renderRegistrationStep()}
            {mode === 'forgot-password' && renderForgotPasswordForm()}

            {/* Navigation Links */}
            {mode === 'login' && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button variant="link" className="text-school-blue" onClick={() => setMode('forgot-password')}>
                    Forgot Password?
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  <p>Need admin access?</p>
                  <Button 
                    variant="link" 
                    className="text-school-orange"
                    onClick={() => setMode('register')}
                  >
                    Register as Admin
                  </Button>
                </div>
              </div>
            )}

            {mode === 'register' && step === 'details' && (
              <div className="mt-6 text-center">
                <Button 
                  variant="link" 
                  className="text-school-blue"
                  onClick={() => setMode('login')}
                >
                  Already have an account? Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
