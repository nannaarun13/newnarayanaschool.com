import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, signInAdmin, isApprovedAdmin } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

type LoginMode = 'login' | 'forgot-password';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });

  useEffect(() => {
    // Check if already logged in
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Check if user is an approved admin
        const approved = await isApprovedAdmin(user.email || '');
        if (approved) {
          navigate('/admin');
        }
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleForgotPasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if email is approved for admin access
      const isApproved = await isApprovedAdmin(loginData.email);
      
      if (!isApproved) {
        toast({
          title: "Access Denied",
          description: "Your admin access request is pending approval or you don't have access to the admin panel.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Sign in with Firebase Auth
      await signInAdmin(loginData.email, loginData.password);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!",
      });
      
      navigate('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, forgotPasswordData.email);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      setMode('login');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please check the email address.",
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
        className="w-full bg-school-blue hover:bg-school-blue/90"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
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
      
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-school-blue hover:bg-school-blue/90"
      >
        {loading ? 'Sending...' : 'Send Reset Email'}
      </Button>
      
      <Button 
        type="button"
        variant="outline" 
        onClick={() => setMode('login')} 
        className="w-full"
      >
        Back to Login
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-blue-light to-school-orange-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-school-blue mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-school-blue mb-2">
            {mode === 'login' ? 'Admin Login' : 'Reset Password'}
          </h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-school-blue">
              {mode === 'login' ? 'Sign In' : 'Password Reset'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === 'login' && (
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
                  className="w-full bg-school-blue hover:bg-school-blue/90"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            )}
            
            {mode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
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
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-school-blue hover:bg-school-blue/90"
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setMode('login')} 
                  className="w-full"
                >
                  Back to Login
                </Button>
              </form>
            )}

            {mode === 'login' && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-school-blue" 
                    onClick={() => setMode('forgot-password')}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/register')}
                    className="w-full border-school-blue text-school-blue hover:bg-school-blue hover:text-white"
                  >
                    Request Admin Access
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
