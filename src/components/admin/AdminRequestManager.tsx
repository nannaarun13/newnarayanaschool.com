
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Check, X, Loader2, UserX, UserCheck } from 'lucide-react';
import { getAdminRequests, AdminUser } from '@/utils/authUtils';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
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

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApproval = async (request: AdminUser, approved: boolean) => {
    setActionLoading(true);
    try {
      const currentUser = auth.currentUser;
      const currentAdminEmail = currentUser?.email;

      if (approved) {
        // For both pending and revoked requests, we need to ensure Firebase account exists
        const requestPassword = (request as any).password;
        
        console.log('Creating/Re-approving Firebase account for user:', request.email);
        
        try {
          // Try to create Firebase account first
          if (request.status === 'pending' && requestPassword) {
            const userCredential = await createUserWithEmailAndPassword(
              auth, 
              request.email, 
              requestPassword
            );

            console.log('Firebase account created with UID:', userCredential.user.uid);

            // Update the admin record with Firebase UID and approval info
            await updateDoc(doc(db, 'admins', request.id), {
              uid: userCredential.user.uid,
              status: 'approved',
              approvedAt: new Date().toISOString(),
              approvedBy: currentAdminEmail || 'System',
              password: null, // Remove the password for security
            });

            // Sign out the newly created user so the current admin can continue
            await signOut(auth);

            toast({
              title: "Request Approved",
              description: "Admin access has been granted. The user can now login with their original password.",
            });
          } else if (request.status === 'revoked') {
            // For revoked requests, try to create account if it doesn't exist
            // We'll use a default password that the user will need to reset
            try {
              if (requestPassword) {
                // If we have the original password, use it
                const userCredential = await createUserWithEmailAndPassword(
                  auth, 
                  request.email, 
                  requestPassword
                );
                console.log('Firebase account recreated for revoked user with UID:', userCredential.user.uid);
                
                await updateDoc(doc(db, 'admins', request.id), {
                  uid: userCredential.user.uid,
                  status: 'approved',
                  reapprovedAt: new Date().toISOString(),
                  reapprovedBy: currentAdminEmail || 'System',
                  revokedAt: null,
                  revokedBy: null,
                  password: null, // Remove the password for security
                });

                // Sign out the newly created user
                await signOut(auth);
              } else {
                // If no password available, just update the status
                await updateDoc(doc(db, 'admins', request.id), {
                  status: 'approved',
                  reapprovedAt: new Date().toISOString(),
                  reapprovedBy: currentAdminEmail || 'System',
                  revokedAt: null,
                  revokedBy: null,
                });
              }

              toast({
                title: "Access Re-approved",
                description: requestPassword ? 
                  "Admin access has been restored. User can login with their original password." :
                  "Admin access has been restored. User may need to reset their password.",
              });
            } catch (createError: any) {
              if (createError.code === 'auth/email-already-in-use') {
                // Account exists, just update status
                await updateDoc(doc(db, 'admins', request.id), {
                  status: 'approved',
                  reapprovedAt: new Date().toISOString(),
                  reapprovedBy: currentAdminEmail || 'System',
                  revokedAt: null,
                  revokedBy: null,
                });
                
                toast({
                  title: "Access Re-approved",
                  description: "Admin access has been restored successfully.",
                });
              } else {
                throw createError;
              }
            }
          }

        } catch (createError: any) {
          console.error('Error creating Firebase account:', createError);
          
          if (createError.code === 'auth/email-already-in-use') {
            // Email already exists in Firebase Auth, just update the status
            console.log('Email already exists in Firebase Auth, updating status only');
            await updateDoc(doc(db, 'admins', request.id), {
              status: 'approved',
              approvedAt: request.status === 'pending' ? new Date().toISOString() : request.approvedAt,
              reapprovedAt: request.status === 'revoked' ? new Date().toISOString() : undefined,
              approvedBy: request.status === 'pending' ? (currentAdminEmail || 'System') : request.approvedBy,
              reapprovedBy: request.status === 'revoked' ? (currentAdminEmail || 'System') : undefined,
              password: null, // Remove the password for security
              revokedAt: null,
              revokedBy: null,
            });
            
            toast({
              title: request.status === 'pending' ? "Request Approved" : "Access Re-approved",
              description: request.status === 'pending' ? "Admin access granted (user account already existed)." : "Admin access has been restored successfully.",
            });
          } else {
            throw createError;
          }
        }
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
      
      toast({
        title: "Error",
        description: errorMessage,
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
                          {(request as any).reapprovedAt && new Date((request as any).reapprovedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {request.approvedBy || request.rejectedBy || request.revokedBy || (request as any).reapprovedBy || '-'}
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
                            {request.status === 'revoked' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleApproval(request, true)}
                                className="border-green-500 text-green-500 hover:bg-green-50"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Re-approve
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
