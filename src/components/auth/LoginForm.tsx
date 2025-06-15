
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema } from '@/utils/authSchemas';
import { handleLogin } from '@/utils/authHandlers';
import * as z from "zod";

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegisterClick: () => void;
  onHomeClick: () => void;
}

const LoginForm = ({ onForgotPassword, onRegisterClick, onHomeClick }: LoginFormProps) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await handleLogin(values);
      toast({ title: "Login Successful", description: "Welcome to the admin panel!" });
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Invalid email or password.";
      if (error.message) {
        errorMessage = error.message;
      }
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
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
            control={form.control}
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
      <div className="mt-6 space-y-4">
        <div className="text-center">
          <Button variant="link" className="text-school-blue" onClick={onForgotPassword}>
            Forgot Password?
          </Button>
        </div>
        <div className="text-center">
          <Button variant="outline" onClick={onRegisterClick} className="w-full border-school-blue text-school-blue hover:bg-school-blue hover:text-white">
            Request Admin Access
          </Button>
        </div>
        <div className="text-center">
          <Button variant="link" className="text-gray-600" onClick={onHomeClick}>
            Return to Site
          </Button>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
