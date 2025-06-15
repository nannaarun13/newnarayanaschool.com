
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegistrationFormData } from '@/utils/adminRegistrationSchema';

interface EmailInputProps {
  loading: boolean;
}

const EmailInput = ({ loading }: EmailInputProps) => {
  const form = useFormContext<RegistrationFormData>();
  return (
    <FormField control={form.control} name="email" render={({ field }) => (
      <FormItem>
        <FormLabel>Email Address *</FormLabel>
        <FormControl>
          <Input type="email" placeholder="your.email@domain.com" {...field} disabled={loading} autoComplete="email" />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
};

export default EmailInput;
