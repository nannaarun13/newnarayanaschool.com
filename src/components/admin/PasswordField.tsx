
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  field: any;
  label: string;
  placeholder: string;
  loading: boolean;
}

const PasswordField = ({ field, label, placeholder, loading }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormItem>
      <FormLabel>{label} *</FormLabel>
      <FormControl>
        <div className="relative">
          <Input 
            type={showPassword ? "text" : "password"} 
            placeholder={placeholder} 
            {...field} 
            disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default PasswordField;
