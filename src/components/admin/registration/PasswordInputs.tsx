
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { RegistrationFormData } from '@/utils/adminRegistrationSchema';

interface PasswordInputsProps {
  loading: boolean;
}

const PasswordInputs = ({ loading }: PasswordInputsProps) => {
  const form = useFormContext<RegistrationFormData>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <FormField control={form.control} name="password" render={({ field }) => (
        <FormItem>
          <FormLabel>Password *</FormLabel>
          <FormControl>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} disabled={loading} autoComplete="new-password" />
              <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="confirmPassword" render={({ field }) => (
        <FormItem>
          <FormLabel>Confirm Password *</FormLabel>
          <FormControl>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} disabled={loading} autoComplete="new-password" />
              <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  );
};

export default PasswordInputs;
