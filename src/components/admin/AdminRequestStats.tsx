
import { Card, CardContent } from '@/components/ui/card';

interface AdminRequestStatsProps {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  revokedRequests: number;
}

const AdminRequestStats = ({ 
  totalRequests, 
  pendingRequests, 
  approvedRequests, 
  rejectedRequests, 
  revokedRequests 
}: AdminRequestStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-school-blue">{totalRequests}</p>
            <p className="text-sm text-gray-600">Total Requests</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{rejectedRequests}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{revokedRequests}</p>
            <p className="text-sm text-gray-600">Revoked</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRequestStats;
