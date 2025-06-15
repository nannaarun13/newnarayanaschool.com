
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegistrationFormData } from '@/utils/adminRegistrationSchema';

interface PhoneInputProps {
  loading: boolean;
}

const PhoneInput = ({ loading }: PhoneInputProps) => {
  const form = useFormContext<RegistrationFormData>();
  return (
    <FormField control={form.control} name="phone" render={({ field }) => (
      <FormItem>
        <FormLabel>Phone Number *</FormLabel>
        <FormControl>
          <div className="flex">
            <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-700 font-medium">
              +91
            </span>
            <Input type="tel" placeholder="9876543210" maxLength={10} className="rounded-l-none" {...field} disabled={loading} autoComplete="tel" />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
};

export default PhoneInput;
