
import { Button } from '@/components/ui/button';
import { AdminUser } from '@/utils/authUtils';
import { Check, X, UserX, UserCheck } from 'lucide-react';

interface AdminActionButtonsProps {
  request: AdminUser;
  actionLoading: boolean;
  onApprove: (request: AdminUser, approved: boolean) => void;
  onRemoveAccess: (request: AdminUser) => void;
}

const AdminActionButtons = ({ request, actionLoading, onApprove, onRemoveAccess }: AdminActionButtonsProps) => {
  if (request.status === 'pending') {
    return (
      <>
        <Button
          variant="default"
          size="sm"
          disabled={actionLoading}
          onClick={() => onApprove(request, true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={actionLoading}
          onClick={() => onApprove(request, false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </>
    );
  }

  if (request.status === 'approved') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={actionLoading}
        onClick={() => onRemoveAccess(request)}
        className="border-red-500 text-red-500 hover:bg-red-50"
      >
        <UserX className="h-4 w-4 mr-1" />
        Remove Access
      </Button>
    );
  }

  if (request.status === 'revoked' || request.status === 'rejected') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={actionLoading}
        onClick={() => onApprove(request, true)}
        className="border-green-500 text-green-500 hover:bg-green-50"
      >
        <UserCheck className="h-4 w-4 mr-1" />
        Re-approve
      </Button>
    );
  }

  return null;
};

export default AdminActionButtons;
