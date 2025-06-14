import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Check, X, Loader2 } from 'lucide-react';
import { getAdminRequests, AdminUser } from '@/utils/authUtils';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

const AdminRequestManager = () => {
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
        // Create Firebase account for the approved user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          request.email, 
          'TempPassword123!'
        );
        
        // Update the admin record with Firebase UID and approval info
        await updateDoc(doc(db, 'admins', request.id), {
          uid: userCredential.user.uid,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: currentAdminEmail || 'System'
        });
        
        // Sign out the newly created user so admin can continue
        await auth.signOut();
        
        toast({
          title: "Request Approved",
          description: "Admin access has been granted. The user can now login.",
        });
      } else {
        // Just delete the request if rejected
        await deleteDoc(doc(db, 'admins', request.id));
        
        toast({
          title: "Request Rejected",
          description: "Admin access request has been rejected and removed.",
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
          approvedBy: currentUser?.email || 'System'
        });
        await loadRequests();
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
    setActionLoading(false);
  };

  const pendingRequests = adminRequests.filter(r => r.status === 'pending');
  const approvedRequests = adminRequests.filter(r => r.status === 'approved');
  const rejectedRequests = adminRequests.filter(r => r.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Access Requests</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-school-blue">{adminRequests.length}</p>
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
      </div>

      {/* Requests List */}
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
              {adminRequests.length > 0 ? adminRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">
                          {request.firstName} {request.lastName}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Email:</strong> {request.email}</p>
                          <p><strong>Phone:</strong> {request.phone}</p>
                        </div>
                        <div>
                          <p><strong>Requested:</strong> {new Date(request.requestedAt).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date(request.requestedAt).toLocaleTimeString()}</p>
                          {request.approvedAt && (
                            <p><strong>Approved:</strong> {new Date(request.approvedAt).toLocaleDateString()}</p>
                          )}
                          {request.approvedBy && (
                            <p><strong>Approved By:</strong> {request.approvedBy}</p>
                          )}
                        </div>
                      </div>
                    </div>
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
                    </div>
                  </div>
                </div>
              )) : (
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
