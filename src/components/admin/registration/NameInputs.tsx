
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegistrationFormData } from '@/utils/adminRegistrationSchema';

interface NameInputsProps {
  loading: boolean;
}

const NameInputs = ({ loading }: NameInputsProps) => {
  const form = useFormContext<RegistrationFormData>();

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField control={form.control} name="firstName" render={({ field }) => (
        <FormItem>
          <FormLabel>First Name *</FormLabel>
          <FormControl>
            <Input placeholder="First name" {...field} disabled={loading} autoComplete="given-name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="lastName" render={({ field }) => (
        <FormItem>
          <FormLabel>Last Name *</FormLabel>
          <FormControl>
            <Input placeholder="Last name" {...field} disabled={loading} autoComplete="family-name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </div>
  );
};

export default NameInputs;
