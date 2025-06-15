import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';
import { AdminUser, updateAdminRequestStatus } from '@/utils/authUtils';
import { auth } from '@/lib/firebase';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminActionButtons from './AdminActionButtons';

interface AdminRequestsTableProps {
  requests: AdminUser[];
  isLoading: boolean;
}

const AdminRequestsTable = ({ requests, isLoading }: AdminRequestsTableProps) => {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(false);

  const handleApproval = async (request: AdminUser, approved: boolean) => {
    setActionLoading(true);
    try {
      const currentUser = auth.currentUser;
      const currentAdminEmail = currentUser?.email;
      const newStatus = approved ? 'approved' : 'rejected';

      await updateAdminRequestStatus(request.id, newStatus, currentAdminEmail, request.status);

      if (approved) {
        if (request.status === 'pending') {
          toast({
            title: "Request Approved",
            description: "Admin access has been granted.",
          });
        } else {
          toast({
            title: "Access Re-approved",
            description: "Admin access has been restored successfully.",
          });
        }
      } else {
        toast({
          title: "Request Rejected",
          description: "Admin access request has been rejected.",
          variant: "destructive"
        });
      }
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

  const handleRemoveAccess = async (request: AdminUser) => {
    setActionLoading(true);
    try {
      const currentUser = auth.currentUser;
      const currentAdminEmail = currentUser?.email;

      await updateAdminRequestStatus(request.id, 'revoked', currentAdminEmail, request.status);

      toast({
        title: "Access Revoked",
        description: "Admin access has been successfully revoked.",
      });
    } catch (error: any) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke admin access.",
        variant: "destructive"
      });
    }
    setActionLoading(false);
  };
  
  const validRequests = requests.filter(r => r && r.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Admin Access Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-school-blue" />
            <p className="ml-2 text-gray-600">Loading requests...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {validRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Action Date</TableHead>
                    <TableHead>Action By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {`${request.firstName?.toUpperCase() ?? ''} ${request.lastName?.toUpperCase() ?? ''}`}
                      </TableCell>
                      <TableCell>{request.email}</TableCell>
                      <TableCell>{request.phone}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status?.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {request.approvedAt && new Date(request.approvedAt).toLocaleDateString()}
                        {request.rejectedAt && new Date(request.rejectedAt).toLocaleDateString()}
                        {request.revokedAt && new Date(request.revokedAt).toLocaleDateString()}
                        {request.reapprovedAt && new Date(request.reapprovedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {request.approvedBy || request.rejectedBy || request.revokedBy || request.reapprovedBy || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                           <AdminActionButtons 
                              request={request}
                              actionLoading={actionLoading}
                              onApprove={handleApproval}
                              onRemoveAccess={handleRemoveAccess}
                           />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">No admin access requests yet.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRequestsTable;
