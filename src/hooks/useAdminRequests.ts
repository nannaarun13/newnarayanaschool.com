
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { subscribeToAdminRequests, AdminUser } from '@/utils/authUtils';

export const useAdminRequests = () => {
  const { toast } = useToast();
  const [adminRequests, setAdminRequests] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToAdminRequests(
      (requests) => {
        setAdminRequests(requests);
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

    return () => unsubscribe();
  }, [toast]);

  return { adminRequests, isLoading, error };
};
