
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
}

const SubmitButton = ({ loading }: SubmitButtonProps) => {
  return (
    <Button type="submit" disabled={loading} className="w-full bg-school-blue hover:bg-school-blue/90">
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Submitting Request...</span>
        </div>
      ) : (
        'Submit Registration Request'
      )}
    </Button>
  );
};

export default SubmitButton;
