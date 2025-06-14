
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { createApprovedAdmin } from '@/utils/adminUtils';

const QuickAdminApproval = ({ onAdminCreated }: { onAdminCreated: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleQuickApproval = async () => {
    setLoading(true);
    try {
      await createApprovedAdmin(
        'arunnanna3@gmail.com',
        'Arun',
        'Nanna',
        '9999999999',
        'arun22004'
      );
      
      toast({
        title: "Admin Access Granted",
        description: "arunnanna3@gmail.com can now login to the admin panel.",
      });
      
      onAdminCreated();
    } catch (error: any) {
      console.error('Error granting admin access:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin access. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <UserPlus className="h-5 w-5" />
          Quick Admin Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input value="arunnanna3@gmail.com" disabled />
            <Input value="arun22004" type="password" disabled />
          </div>
          <Button 
            onClick={handleQuickApproval}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Granting Access...' : 'Grant Admin Access to arunnanna3@gmail.com'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAdminApproval;
