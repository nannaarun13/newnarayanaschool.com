
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAdminByEmail } from '@/utils/authUtils';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type LoginMode = 'login' | 'forgot-password';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const admin = await getAdminByEmail(values.email);

      if (!admin) {
        toast({ title: "Login Failed", description: "This email is not registered.", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      if (admin.status !== 'approved') {
        toast({ title: "Access Denied", description: "Your admin access request is pending approval or has been rejected.", variant: "destructive" });
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      toast({ title: "Login Successful", description: "Welcome to the admin panel!" });
      // Navigation is handled by RouteProtection
      // navigate('/admin');

    } catch (error: any) {
      console.error('Login error:', error);
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
      setMode('login');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Failed to send reset email. Please check the email address.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const renderLoginForm = () => (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...field}
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );

  const renderForgotPasswordForm = () => (
    <Form {...forgotPasswordForm}>
      <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
        <FormField
          control={forgotPasswordForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
          {loading ? 'Sending...' : 'Send Reset Email'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setMode('login')} className="w-full">
          Back to Login
        </Button>
      </form>
    </Form>
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
            {mode === 'login' ? renderLoginForm() : renderForgotPasswordForm()}
            {mode === 'login' && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button variant="link" className="text-school-blue" onClick={() => setMode('forgot-password')}>
                    Forgot Password?
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="outline" onClick={() => navigate('/admin/register')} className="w-full border-school-blue text-school-blue hover:bg-school-blue hover:text-white">
                    Request Admin Access
                  </Button>
                </div>
                <div className="text-center">
                   <Button variant="link" className="text-gray-600" onClick={() => navigate('/')}>
                     <Home /> Return to Site
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
