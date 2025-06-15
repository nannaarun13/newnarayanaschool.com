
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface SignInLinkProps {
  loading: boolean;
}

const SignInLink = ({ loading }: SignInLinkProps) => {
  const navigate = useNavigate();
  return (
    <div className="mt-6 text-center space-y-2">
      <p className="text-sm text-gray-600">
        Already have access?{' '}
        <Button variant="link" className="text-school-blue p-0 h-auto" onClick={() => navigate('/login')} disabled={loading}>
          Sign In
        </Button>
      </p>
    </div>
  );
};

export default SignInLink;
