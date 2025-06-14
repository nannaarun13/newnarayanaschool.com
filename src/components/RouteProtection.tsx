
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isUserAdmin } from '@/utils/authUtils';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

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
        // User is logged in
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
          } else {
            // Logged-in non-admin on a public route, this is fine.
            // If they are on an auth route, we can log them out if we want to enforce a clean slate.
             if (onAuthRoute) {
                await auth.signOut();
             }
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

  return <>{children}</>;
};

export default RouteProtection;
