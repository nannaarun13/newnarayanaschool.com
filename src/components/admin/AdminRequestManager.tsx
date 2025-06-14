import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Check, X, Loader2, Trash2, UserX } from 'lucide-react';
import { getAdminRequests, AdminUser, cleanupInvalidAdminRequests } from '@/utils/authUtils';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminRequestManager = () => {
  const { toast } = useToast();
  const [adminRequests, setAdminRequests] = useState<AdminUser[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const loadRequests = async () => {
    setListLoading(true);
    try {
        const requests = await getAdminRequests();
        console.log('Loaded admin requests:', requests);
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

  const handleCleanupInvalidDates = async () => {
    setCleanupLoading(true);
    try {
      const deletedCount = await cleanupInvalidAdminRequests();
      if (deletedCount > 0) {
        toast({
          title: "Cleanup Complete",
          description: `Removed ${deletedCount} admin record(s) with invalid data.`,
        });
        await loadRequests(); // Reload the list
      } else {
        toast({
          title: "No Invalid Records",
          description: "All admin records are valid.",
        });
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup invalid records.",
        variant: "destructive"
      });
    }
    setCleanupLoading(false);
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
        // Check if the request has a password field
        const requestPassword = (request as any).password;
        if (!requestPassword) {
          toast({
            title: "Error",
            description: "Cannot approve request: No password found in the registration data.",
            variant: "destructive"
          });
          setActionLoading(false);
          return;
        }

        console.log('Creating Firebase account for approved user:', request.email);
        
        // Create Firebase account for the approved user using their actual password
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          request.email, 
          requestPassword
        );

        console.log('Firebase account created with UID:', userCredential.user.uid);

        // Update the admin record with Firebase UID and approval info (and remove password!)
        await updateDoc(doc(db, 'admins', request.id), {
          uid: userCredential.user.uid,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: currentAdminEmail || 'System',
          password: null, // Remove the password for security
        });

        // Sign out the newly created user so admin can continue
        await auth.signOut();

        toast({
          title: "Request Approved",
          description: "Admin access has been granted. The user can now login with their original password.",
        });
      } else {
        // Update the request status to rejected instead of deleting
        await updateDoc(doc(db, 'admins', request.id), {
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: currentAdminEmail || 'System',
          password: null, // Remove the password for security
        });
        
        toast({
          title: "Request Rejected",
          description: "Admin access request has been rejected.",
          variant: "destructive"
        });
      }
      
      await loadRequests(); // Reload to show updated status
    } catch (error: any) {
      console.error('Error updating request:', error);
      let errorMessage = "Failed to update request status.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already exists. Request marked as approved anyway.";
        // Still update the status in Firestore
        const currentUser = auth.currentUser;
        await updateDoc(doc(db, 'admins', request.id), {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: currentUser?.email || 'System',
          password: null,
        });
        await loadRequests();
        toast({
          title: "Request Approved",
          description: "Admin access granted (user account already existed).",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
    setActionLoading(false);
  };

  const handleRemoveAccess = async (request: AdminUser) => {
    setActionLoading(true);
    try {
      const currentUser = auth.currentUser;
      const currentAdminEmail = currentUser?.email;

      // Update the admin record to revoke access
      await updateDoc(doc(db, 'admins', request.id), {
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        revokedBy: currentAdminEmail || 'System',
      });

      toast({
        title: "Access Revoked",
        description: "Admin access has been successfully revoked.",
      });
      
      await loadRequests(); // Reload to show updated status
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

  // Filter requests with proper null/undefined checks
  const validRequests = adminRequests.filter(r => r && r.status);
  const pendingRequests = validRequests.filter(r => r.status === 'pending');
  const approvedRequests = validRequests.filter(r => r.status === 'approved');
  const rejectedRequests = validRequests.filter(r => r.status === 'rejected');
  const revokedRequests = validRequests.filter(r => r.status === 'revoked');

  console.log('Request counts:', {
    total: validRequests.length,
    pending: pendingRequests.length,
    approved: approvedRequests.length,
    rejected: rejectedRequests.length,
    revoked: revokedRequests.length
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Access Requests</h2>
        <Button
          onClick={handleCleanupInvalidDates}
          disabled={cleanupLoading}
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-50"
        >
          {cleanupLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          Clean Up Data
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-school-blue">{validRequests.length}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{rejectedRequests.length}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{revokedRequests.length}</p>
              <p className="text-sm text-gray-600">Revoked</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                          {request?.firstName && typeof request.firstName === "string" 
                            ? request.firstName.toUpperCase() 
                            : ""}
                          {" "}
                          {request?.lastName && typeof request.lastName === "string" 
                            ? request.lastName.toUpperCase() 
                            : ""}
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
                        </TableCell>
                        <TableCell>
                          {request.approvedBy || request.rejectedBy || request.revokedBy || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {request.status === 'pending' && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleApproval(request, true)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  disabled={actionLoading}
                                  onClick={() => handleApproval(request, false)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleRemoveAccess(request)}
                                className="border-red-500 text-red-500 hover:bg-red-50"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Remove Access
                              </Button>
                            )}
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
    </div>
  );
};

export default AdminRequestManager;
