
import { Button } from '@/components/ui/button';
import { Check, X, UserX, Trash2 } from 'lucide-react';
import { AdminUser } from '@/utils/authUtils';

const SUPER_ADMIN_EMAIL = "arunnanna3@gmail.com";

interface AdminRequestActionsProps {
  request: AdminUser;
  actionLoading: boolean;
  onApproval: (request: AdminUser, approved: boolean) => void;
  onRemoveAccess: (request: AdminUser) => void;
  onDeleteRequest: (request: AdminUser) => void;
}

const AdminRequestActions = ({ 
  request, 
  actionLoading, 
  onApproval, 
  onRemoveAccess, 
  onDeleteRequest 
}: AdminRequestActionsProps) => {
  const isProtected = request.email === SUPER_ADMIN_EMAIL;
  return (
    <div className="flex space-x-2">
      {request.status === 'pending' && (
        <>
          <Button 
            variant="default" 
            size="sm"
            disabled={actionLoading || isProtected}
            onClick={() => onApproval(request, true)}
            className="bg-green-600 hover:bg-green-700"
            title={isProtected ? "This admin cannot be modified." : "Approve"}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            disabled={actionLoading || isProtected}
            onClick={() => onApproval(request, false)}
            title={isProtected ? "This admin cannot be modified." : "Reject"}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      )}
      {request.status === 'approved' && (
        <Button 
          variant="outline" 
          size="sm"
          disabled={actionLoading || isProtected}
          onClick={() => onRemoveAccess(request)}
          className="border-red-500 text-red-500 hover:bg-red-50"
          title={isProtected ? "Cannot remove access from main admin." : "Remove Access"}
        >
          <UserX className="h-4 w-4 mr-1" />
          Remove Access
        </Button>
      )}
      <Button 
        variant="outline" 
        size="sm"
        disabled={actionLoading || isProtected}
        onClick={() => onDeleteRequest(request)}
        className="border-red-600 text-red-600 hover:bg-red-50"
        title={isProtected ? "Cannot delete the main admin." : "Delete"}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AdminRequestActions;

