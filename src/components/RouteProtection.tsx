
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isUserAdmin } from '@/utils/authUtils';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import SessionTimeoutWarning from '@/components/security/SessionTimeoutWarning';

const RouteProtection = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const onAdminRoute = location.pathname.startsWith('/admin');
      const onAuthRoute = location.pathname === '/login' || location.pathname === '/admin/register';

      if (user) {
        // User is logged in - check admin status and approval
        console.log('User logged in:', user.email);
        
        try {
          const isAdmin = await isUserAdmin(user.uid);
          if (isAdmin) {
            // User is an approved admin
            if (onAuthRoute) {
              navigate('/admin', { replace: true });
            }
          } else {
            // User is not an approved admin
            if (onAdminRoute && !onAuthRoute) {
              toast({
                title: "Access Denied",
                description: "Your admin account is pending approval or not authorized.",
                variant: "destructive",
              });
              await auth.signOut();
              navigate('/login', { replace: true });
            } else if (onAuthRoute) {
              await auth.signOut();
            }
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          // If there's an error checking admin status, deny access to admin routes
          if (onAdminRoute && !onAuthRoute) {
            toast({
              title: "Access Denied",
              description: "Unable to verify admin status. Please try again later.",
              variant: "destructive",
            });
            await auth.signOut();
            navigate('/login', { replace: true });
          }
        }
      } else {
        // No user is logged in
        if (onAdminRoute && !onAuthRoute) {
          navigate('/login', { replace: true });
        }
      }
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, [location.pathname, navigate, toast]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-16 w-16 text-school-blue mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Verifying security status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <SessionTimeoutWarning />
    </>
  );
};

export default RouteProtection;
