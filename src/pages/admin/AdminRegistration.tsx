
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerAdmin } from '@/lib/firebase';

const passwordStrength = (password: string): number => {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 10) score += 1;
  
  // Character type checks
  if (/[A-Z]/.test(password)) score += 1; // Has uppercase
  if (/[a-z]/.test(password)) score += 1; // Has lowercase
  if (/[0-9]/.test(password)) score += 1; // Has number
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
  
  return score;
};

const getPasswordFeedback = (score: number): { message: string; color: string } => {
  if (score <= 2) return { message: "Weak", color: "text-red-500" };
  if (score <= 4) return { message: "Moderate", color: "text-yellow-500" };
  return { message: "Strong", color: "text-green-500" };
};

const AdminRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const passwordScore = passwordStrength(formData.password);
  const { message: passwordStrengthText, color: passwordStrengthColor } = getPasswordFeedback(passwordScore);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "Last name is required.",
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return false;
    }

    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: "Validation Error",
        description: "Phone number must be in format +91XXXXXXXXXX.",
        variant: "destructive"
      });
      return false;
    }

    // Enhanced password validation
    if (formData.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive"
      });
      return false;
    }
    
    if (passwordScore < 4) {
      toast({
        title: "Password Too Weak",
        description: "Please use a stronger password with a mix of uppercase, lowercase, numbers, and special characters.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Register the admin in Firebase
      await registerAdmin(formData.email, formData.password, {
        firstName: formData.firstName.toUpperCase(),
        lastName: formData.lastName.toUpperCase(),
        phone: formData.phone,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });
      
      setSubmitted(true);
      
      toast({
        title: "Registration Submitted",
        description: "Your admin access request has been submitted for approval.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive"
      });
      console.error('Registration error:', error);
    }
    
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-blue-light to-school-orange-light p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Request Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your admin access request has been submitted successfully. You will receive notification once your request is reviewed and approved.
            </p>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full bg-school-blue hover:bg-school-blue/90"
            >
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
        {submitted ? (
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Request Submitted</h2>
              <p className="text-gray-600 mb-6">
                Your admin access request has been submitted successfully. You will receive notification once your request is reviewed and approved.
              </p>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full bg-school-blue hover:bg-school-blue/90"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        required
                      />
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
                      placeholder="your.email@domain.com"
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
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
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
                    {formData.password && (
                      <div className="mt-1 text-sm">
                        <span>Password strength: </span>
                        <span className={passwordStrengthColor}>{passwordStrengthText}</span>
                        <div className="h-1 w-full bg-gray-200 mt-1 rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              passwordScore <= 2 ? 'bg-red-500' : 
                              passwordScore <= 4 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`} 
                            style={{ width: `${(passwordScore / 6) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Use at least 8 characters with uppercase, lowercase, numbers, and special characters.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-school-blue hover:bg-school-blue/90"
                  >
                    {loading ? 'Submitting...' : 'Submit Registration'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have access?{' '}
                    <Button 
                      variant="link" 
                      className="text-school-blue p-0" 
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </Button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRegistration;
