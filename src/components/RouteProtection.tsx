
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAdminAuth } from '@/utils/authUtils';

const RouteProtection = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if current route requires admin auth
    if (location.pathname.startsWith('/admin') && !location.pathname.includes('/register')) {
      const isAuthenticated = checkAdminAuth();
      
      if (!isAuthenticated) {
        console.log('Admin auth required, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
    }

    // Ensure login and register routes are accessible
    if (location.pathname === '/login' || location.pathname === '/admin/register') {
      console.log('Auth route accessible:', location.pathname);
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default RouteProtection;
