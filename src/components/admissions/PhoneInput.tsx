
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  required?: boolean;
  placeholder?: string;
}

const PhoneInput = ({ id, name, value, onChange, label, required = false, placeholder = "98765 43210" }: PhoneInputProps) => {
  return (
    <div>
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <div className="flex">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
          +91
        </span>
        <Input
          id={id}
          name={name}
          value={value.replace(/\D/g, '').slice(0,10)} // Only digits, max 10
          onChange={(e) => {
            let v = e.target.value.replace(/\D/g, '').slice(0,10);
            // Compose a fake event object to maintain compatibility
            onChange({
              ...e,
              target: {
                ...e.target,
                value: v
              }
            });
          }}
          placeholder={placeholder}
          required={required}
          className="rounded-l-none"
          maxLength={10}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {required ? "10 digit Indian mobile number" : "Optional 10 digit number"} (will be stored as "+91 XXXXX YYYYY")
      </p>
    </div>
  );
};

export default PhoneInput;
