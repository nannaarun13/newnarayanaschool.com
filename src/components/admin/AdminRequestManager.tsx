
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminRequestStats from './AdminRequestStats';
import AdminRequestActions from './AdminRequestActions';
import { useAdminRequestManager } from '@/hooks/useAdminRequestManager';

const AdminRequestManager = () => {
  const {
    adminRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    revokedRequests,
    actionLoading,
    listLoading,
    handleApproval,
    handleDeleteRequest,
    handleRemoveAccess
  } = useAdminRequestManager();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Access Requests</h2>
      </div>

      {/* Stats */}
      <AdminRequestStats
        totalRequests={adminRequests.length}
        pendingRequests={pendingRequests}
        approvedRequests={approvedRequests}
        rejectedRequests={rejectedRequests}
        revokedRequests={revokedRequests}
      />

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Admin Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-school-blue" />
              <p className="ml-2 text-gray-600">Loading requests...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.firstName} {request.lastName}
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
                          <AdminRequestActions
                            request={request}
                            actionLoading={actionLoading}
                            onApproval={handleApproval}
                            onRemoveAccess={handleRemoveAccess}
                            onDeleteRequest={handleDeleteRequest}
                          />
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
    </div>
  );
};

export default AdminRequestManager;
