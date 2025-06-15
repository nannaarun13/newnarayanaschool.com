
import { useAdminRequests } from '@/hooks/useAdminRequests';
import AdminRequestStats from './requests/AdminRequestStats';
import AdminRequestsTable from './requests/AdminRequestsTable';

const AdminRequestManager = () => {
  const { adminRequests, isLoading } = useAdminRequests();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Access Requests</h2>
      </div>

      <AdminRequestStats requests={adminRequests} />
      
      <AdminRequestsTable requests={adminRequests} isLoading={isLoading} />
    </div>
  );
};

export default AdminRequestManager;
