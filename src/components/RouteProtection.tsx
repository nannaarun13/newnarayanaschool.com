
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAdminAuth } from '@/utils/authUtils';

const RouteProtection = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Current route:', location.pathname);
    
    // Always allow access to login and register routes
    if (location.pathname === '/login' || location.pathname === '/admin/register') {
      console.log('Auth route accessible:', location.pathname);
      return;
    }
    
    // Check if current route requires admin auth (but exclude register route)
    if (location.pathname.startsWith('/admin')) {
      const isAuthenticated = checkAdminAuth();
      
      console.log('Admin auth check:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('Admin auth required, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default RouteProtection;
