
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, Calendar, TrendingUp, Download } from 'lucide-react';
import { useSchool } from '@/contexts/SchoolContext';

const AdmissionManager = () => {
  const { state } = useSchool();
  const { toast } = useToast();
  const [monthlyData, setMonthlyData] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Calculate monthly inquiry counts
    const inquiries = state.admissionInquiries || [];
    const monthly: {[key: string]: number} = {};
    
    inquiries.forEach(inquiry => {
      if (inquiry.submittedAt) {
        const date = new Date(inquiry.submittedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthly[monthKey] = (monthly[monthKey] || 0) + 1;
      }
    });
    
    setMonthlyData(monthly);
  }, [state.admissionInquiries]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthCount = monthlyData[currentMonth] || 0;
  const totalInquiries = state.admissionInquiries?.length || 0;

  const handleExport = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Grade', 'Submitted Date'];
    const csvContent = [
      headers.join(','),
      ...(state.admissionInquiries || []).map(inquiry => [
        `"${inquiry.studentName}"`,
        `"${inquiry.parentEmail}"`,
        `"${inquiry.parentPhone}"`,
        `"${inquiry.gradeApplying}"`,
        `"${new Date(inquiry.submittedAt || '').toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admission-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Admission inquiries exported successfully.",
    });
  };

  const getMonthlyStats = () => {
    const months = Object.keys(monthlyData).sort().slice(-6);
    return months.map(month => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: monthlyData[month]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Admission Management</h2>
        <Button onClick={handleExport} variant="outline" className="border-school-blue text-school-blue">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-800">{totalInquiries}</p>
              </div>
              <Users className="h-12 w-12 text-school-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-800">{currentMonthCount}</p>
              </div>
              <Calendar className="h-12 w-12 text-school-orange" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg per Month</p>
                <p className="text-3xl font-bold text-gray-800">
                  {Object.keys(monthlyData).length > 0 
                    ? Math.round(totalInquiries / Object.keys(monthlyData).length)
                    : 0
                  }
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Inquiry Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getMonthlyStats().length > 0 ? (
              getMonthlyStats().map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{stat.month}</span>
                  <span className="text-2xl font-bold text-school-blue">{stat.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No inquiry data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Inquiries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Admission Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(state.admissionInquiries || []).slice(0, 10).map((inquiry, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{inquiry.studentName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Parent Email:</strong> {inquiry.parentEmail}</p>
                        <p><strong>Phone:</strong> {inquiry.parentPhone}</p>
                      </div>
                      <div>
                        <p><strong>Grade:</strong> {inquiry.gradeApplying}</p>
                        <p><strong>Submitted:</strong> {new Date(inquiry.submittedAt || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                    {inquiry.message && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600"><strong>Message:</strong> {inquiry.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!state.admissionInquiries?.length && (
              <p className="text-center text-gray-500 py-8">No admission inquiries yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionManager;
