
import { Card, CardContent } from '@/components/ui/card';
import { AdminUser } from '@/utils/authUtils';

interface AdminRequestStatsProps {
  requests: AdminUser[];
}

const AdminRequestStats = ({ requests }: AdminRequestStatsProps) => {
  const validRequests = requests.filter(r => r && r.status);
  const pendingRequests = validRequests.filter(r => r.status === 'pending');
  const approvedRequests = validRequests.filter(r => r.status === 'approved');
  const rejectedRequests = validRequests.filter(r => r.status === 'rejected');
  const revokedRequests = validRequests.filter(r => r.status === 'revoked');

  return (
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
  );
};

export default AdminRequestStats;
