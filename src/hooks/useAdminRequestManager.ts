
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAdminRequests, AdminUser } from '@/utils/authUtils';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const useAdminRequestManager = () => {
  const { toast } = useToast();
  const [adminRequests, setAdminRequests] = useState<AdminUser[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const loadRequests = async () => {
    setListLoading(true);
    try {
      const requests = await getAdminRequests();
      setAdminRequests(requests);
    } catch (error) {
      console.error("Failed to load admin requests:", error);
      toast({
        title: "Error loading requests",
        description: "Could not fetch the list of admin requests.",
        variant: "destructive"
      });
    }
    setListLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApproval = async (request: AdminUser, approved: boolean) => {
    setActionLoading(true);
    try {
      const currentUser = auth.currentUser;
      const currentAdminEmail = currentUser?.email;

      if (approved) {
        // Only update status (never create/set Auth password here)
        await updateDoc(doc(db, 'admins', request.id), {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: currentAdminEmail || 'System',
        });

        toast({
          title: "Request Approved",
          description: "Admin access approved. The user must now register themselves via the site.",
        });
      } else {
        // Reject the request
        await updateDoc(doc(db, 'admins', request.id), {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: currentAdminEmail || 'System',
        });

        toast({
          title: "Request Rejected",
          description: "Admin access request has been rejected.",
          variant: "destructive"
        });
      }

      await loadRequests();
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive"
      });
    }
    setActionLoading(false);
  };

  const handleDeleteRequest = async (request: AdminUser) => {
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'admins', request.id));
      toast({
        title: "Request Deleted",
        description: `Admin request for ${request.email} has been permanently deleted.`,
      });
      await loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: "Failed to delete admin request.",
        variant: "destructive"
      });
    }
    setActionLoading(false);
  };

  const handleRemoveAccess = async (request: AdminUser) => {
    setActionLoading(true);
    try {
      const currentUser = auth.currentUser;
      const currentAdminEmail = currentUser?.email;

      await updateDoc(doc(db, 'admins', request.id), {
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        revokedBy: currentAdminEmail || 'System',
      });

      toast({
        title: "Access Revoked",
        description: "Admin access has been successfully revoked.",
      });

      await loadRequests();
    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke admin access.",
        variant: "destructive"
      });
    }
    setActionLoading(false);
  };

  const validRequests = adminRequests.filter(r => r && r.status);
  const pendingRequests = validRequests.filter(r => r.status === 'pending');
  const approvedRequests = validRequests.filter(r => r.status === 'approved');
  const rejectedRequests = validRequests.filter(r => r.status === 'rejected');
  const revokedRequests = validRequests.filter(r => r.status === 'revoked');

  return {
    adminRequests: validRequests,
    pendingRequests: pendingRequests.length,
    approvedRequests: approvedRequests.length,
    rejectedRequests: rejectedRequests.length,
    revokedRequests: revokedRequests.length,
    actionLoading,
    listLoading,
    handleApproval,
    handleDeleteRequest,
    handleRemoveAccess
  };
};
