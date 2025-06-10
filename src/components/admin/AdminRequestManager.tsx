
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Check, X, Eye } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminRequestManager = () => {
  const { toast } = useToast();
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const fetchAdminRequests = async () => {
    try {
      const requestsCollection = collection(db, 'adminRequests');
      const requestsSnapshot = await getDocs(requestsCollection);
      const requests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminRequest[];
      
      setAdminRequests(requests);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin requests.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean) => {
    try {
      const requestRef = doc(db, 'adminRequests', requestId);
      
      if (approved) {
        await updateDoc(requestRef, {
          status: 'approved',
          approvedAt: new Date().toISOString()
        });
      } else {
        await deleteDoc(requestRef);
      }

      // Update local state
      if (approved) {
        setAdminRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: 'approved' as const }
              : req
          )
        );
      } else {
        setAdminRequests(prev => 
          prev.filter(req => req.id !== requestId)
        );
      }

      toast({
        title: approved ? "Request Approved" : "Request Rejected",
        description: approved 
          ? "Admin access has been granted. User can now login."
          : "Admin access request has been rejected and removed.",
        variant: approved ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (request: AdminRequest) => {
    toast({
      title: "Request Details",
      description: `${request.firstName} ${request.lastName} - ${request.email}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-600">Loading admin requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Access Requests</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-2xl font-bold text-yellow-600">
                {adminRequests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {adminRequests.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
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
          <div className="space-y-4">
            {adminRequests.map((request) => (
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
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {request.status === 'pending' && (
                      <>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleApproval(request.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleApproval(request.id, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {adminRequests.length === 0 && (
              <p className="text-center text-gray-500 py-8">No admin access requests yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRequestManager;
