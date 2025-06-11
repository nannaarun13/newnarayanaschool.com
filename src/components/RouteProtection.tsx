
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAdminAuth } from '@/utils/authUtils';

const RouteProtection = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const validateRoute = async () => {
      try {
        // Always allow access to login and register routes
        if (location.pathname === '/login' || location.pathname === '/admin/register') {
          setIsChecking(false);
          return;
        }
        
        // Check if current route requires admin auth
        if (location.pathname.startsWith('/admin')) {
          const isAuthenticated = await checkAdminAuth();
          
          if (!isAuthenticated) {
            console.log('Admin auth required, redirecting to login');
            navigate('/login', { replace: true });
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/login', { replace: true });
      }
    };

    validateRoute();
  }, [location.pathname, navigate]);

  if (isChecking) {
    return <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Verifying access...</p>
    </div>;
  }

  return <>{children}</>;
};

export default RouteProtection;
