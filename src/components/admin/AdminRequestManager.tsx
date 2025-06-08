
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Save, UserPlus } from 'lucide-react';

const AdminRequestManager = () => {
  const { state, dispatch } = useSchool();
  const { toast } = useToast();
  const [newRequest, setNewRequest] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'firstName' || name === 'lastName') {
      setNewRequest(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= 10) {
        setNewRequest(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setNewRequest(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData = {
      id: Date.now().toString(),
      ...newRequest,
      phone: `+91${newRequest.phone}`,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Add to admin requests (you would store this in context or database)
    toast({
      title: "Admin Request Submitted",
      description: `Request for ${newRequest.firstName} ${newRequest.lastName} has been submitted for approval.`,
    });

    // Reset form
    setNewRequest({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admin Access Requests</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New Admin Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={newRequest.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={newRequest.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newRequest.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                  <span className="text-sm font-medium">+91</span>
                </div>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={newRequest.phone}
                  onChange={handleInputChange}
                  className="rounded-l-none"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-school-blue hover:bg-school-blue/90"
            >
              Submit Request for Admin Approval
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRequestManager;
