
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { subscribeToAdminRequests, AdminUser } from '@/utils/authUtils';

export const useAdminRequests = () => {
  const { toast } = useToast();
  const [adminRequests, setAdminRequests] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToAdminRequests(
      (newRequests) => {
        setAdminRequests((currentRequests) => {
          if (isInitialLoad.current) {
            isInitialLoad.current = false;
          } else {
            const newPending = newRequests.filter(
              (req) => req.status === 'pending' && !currentRequests.some((cr) => cr.id === req.id)
            );

            if (newPending.length > 0) {
              toast({
                title: 'New Admin Request',
                description: `Request from ${newPending[0].firstName} ${newPending[0].lastName} needs approval.`,
              });
            }
          }
          return newRequests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        });
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to admin requests:", error);
        setError(error);
        toast({
          title: "Error loading requests",
          description: "Could not fetch the list of admin requests in real-time.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
      isInitialLoad.current = true; // Reset on unmount
    };
  }, [toast]);

  return { adminRequests, isLoading, error };
};
