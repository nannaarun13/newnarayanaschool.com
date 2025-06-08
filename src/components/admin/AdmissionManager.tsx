
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, Trash2 } from 'lucide-react';

const AdmissionManager = () => {
  const { state } = useSchool();
  const { toast } = useToast();
  
  // Get admission inquiries from the state
  const admissions = state.data.admissionInquiries || [];

  const handleExportToExcel = () => {
    try {
      // Create CSV content
      const headers = ['Student Name', 'Class Applied', 'Present Class', 'Previous School', 'Father Name', 'Mother Name', 'Primary Contact', 'Secondary Contact', 'Location', 'Submitted Date'];
      const csvContent = [
        headers.join(','),
        ...admissions.map(admission => [
          admission.studentName,
          admission.classApplied,
          admission.presentClass,
          admission.previousSchool || '',
          admission.fatherName,
          admission.motherName,
          admission.primaryContact,
          admission.secondaryContact || '',
          admission.location,
          new Date(admission.submittedAt).toLocaleDateString()
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'admission_inquiries.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: "Export Successful",
        description: "Admission data has been exported to CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export admission data.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Badge className={getStatusColor(admission.status || 'pending')}>
                        {admission.status || 'pending'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Class Applied:</strong> {admission.classApplied}</p>
                        <p><strong>Present Class:</strong> {admission.presentClass}</p>
                        <p><strong>Previous School:</strong> {admission.previousSchool || 'N/A'}</p>
                      </div>
                      <div>
                        <p><strong>Father:</strong> {admission.fatherName}</p>
                        <p><strong>Mother:</strong> {admission.motherName}</p>
                        <p><strong>Primary Contact:</strong> {admission.primaryContact}</p>
                        {admission.secondaryContact && (
                          <p><strong>Secondary Contact:</strong> {admission.secondaryContact}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <p><strong>Location:</strong> {admission.location}</p>
                      <p><strong>Submitted:</strong> {new Date(admission.submittedAt).toLocaleDateString()}</p>
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
            {admissions.length === 0 && (
              <p className="text-center text-gray-500 py-8">No admission inquiries yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionManager;
