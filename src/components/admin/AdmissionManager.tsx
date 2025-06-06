
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, Trash2 } from 'lucide-react';

const AdmissionManager = () => {
  const { toast } = useToast();
  
  // Mock admission data - in real app this would come from Firebase
  const [admissions] = useState([
    {
      id: '1',
      studentName: 'Rahul Sharma',
      classApplied: '5th Grade',
      previousClass: '4th Grade',
      previousSchool: 'ABC Public School',
      fatherName: 'Suresh Sharma',
      motherName: 'Priya Sharma',
      contactNumbers: ['+91 9876543210', '+91 8765432109'],
      location: 'Mumbai, Maharashtra',
      submittedAt: '2024-01-15',
      status: 'pending'
    },
    {
      id: '2',
      studentName: 'Anjali Patel',
      classApplied: '3rd Grade',
      previousClass: '2nd Grade',
      previousSchool: 'XYZ School',
      fatherName: 'Amit Patel',
      motherName: 'Sunita Patel',
      contactNumbers: ['+91 9123456789'],
      location: 'Pune, Maharashtra',
      submittedAt: '2024-01-14',
      status: 'reviewed'
    }
  ]);

  const handleExportToExcel = () => {
    // In a real implementation, this would generate and download an Excel file
    toast({
      title: "Export Started",
      description: "Admission data is being exported to Excel.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admission Management</h2>
        <Button onClick={handleExportToExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-school-blue">{admissions.length}</p>
              <p className="text-sm text-gray-600">Total Inquiries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {admissions.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {admissions.filter(a => a.status === 'reviewed').length}
              </p>
              <p className="text-sm text-gray-600">Reviewed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {admissions.filter(a => a.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admission List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admissions.map((admission) => (
              <div key={admission.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">{admission.studentName}</h3>
                      <Badge className={getStatusColor(admission.status)}>
                        {admission.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Class Applied:</strong> {admission.classApplied}</p>
                        <p><strong>Previous Class:</strong> {admission.previousClass}</p>
                        <p><strong>Previous School:</strong> {admission.previousSchool}</p>
                      </div>
                      <div>
                        <p><strong>Father:</strong> {admission.fatherName}</p>
                        <p><strong>Mother:</strong> {admission.motherName}</p>
                        <p><strong>Contact:</strong> {admission.contactNumbers.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <p><strong>Location:</strong> {admission.location}</p>
                      <p><strong>Submitted:</strong> {admission.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionManager;
