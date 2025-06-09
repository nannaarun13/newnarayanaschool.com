
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Image, 
  Bell, 
  FileText, 
  Shield,
  Home,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSchool } from '@/contexts/SchoolContext';
import { useAuth } from '@/contexts/AuthContext';
import ContentManager from '@/components/admin/ContentManager';
import GalleryManager from '@/components/admin/GalleryManager';
import NoticeManager from '@/components/admin/NoticeManager';
import AdmissionManager from '@/components/admin/AdmissionManager';
import ContactManager from '@/components/admin/ContactManager';
import AdminRequestManager from '@/components/admin/AdminRequestManager';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useSchool();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "An error occurred while logging out.",
        variant: "destructive"
      });
    }
  };

  const dashboardStats = [
    { 
      title: "Total Inquiries", 
      value: (state.admissionInquiries?.length || 0).toString(), 
      icon: Users, 
      color: "text-school-blue" 
    },
    { 
      title: "Gallery Images", 
      value: state.data.galleryImages.length.toString(), 
      icon: Image, 
      color: "text-school-orange" 
    },
    { 
      title: "Active Notices", 
      value: state.data.notices.length.toString(), 
      icon: Bell, 
      color: "text-green-600" 
    },
    { 
      title: "Page Visits", 
      value: state.siteVisitors.toString(), 
      icon: FileText, 
      color: "text-purple-600" 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - Mobile Responsive */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-school-blue" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-school-blue">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 hidden sm:block">New Narayana School Management</p>
                {user && (
                  <p className="text-xs sm:text-sm text-gray-500">Welcome, {user.displayName || user.email}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-school-blue text-school-blue hover:bg-school-blue hover:text-white text-sm"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-500 text-red-500 hover:bg-red-50 text-sm"
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Mobile-first responsive tabs */}
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-7 min-w-max w-full">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4">Overview</TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm px-2 sm:px-4">Content</TabsTrigger>
              <TabsTrigger value="gallery" className="text-xs sm:text-sm px-2 sm:px-4">Gallery</TabsTrigger>
              <TabsTrigger value="notices" className="text-xs sm:text-sm px-2 sm:px-4">Notices</TabsTrigger>
              <TabsTrigger value="admissions" className="text-xs sm:text-sm px-2 sm:px-4">Admissions</TabsTrigger>
              <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 sm:px-4">Contact</TabsTrigger>
              <TabsTrigger value="approvals" className="text-xs sm:text-sm px-2 sm:px-4">Admin Approval</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Dashboard Stats - Mobile Responsive */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {dashboardStats.map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left">
                        <div className="mb-2 sm:mb-0">
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                          <p className="text-xl sm:text-3xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 sm:h-12 sm:w-12 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recent Activity - Mobile Responsive */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Recent Activity</h2>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div 
                      className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => setActiveTab('admissions')}
                    >
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-school-blue flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">New admission inquiry received</p>
                        <p className="text-xs sm:text-sm text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                      onClick={() => setActiveTab('gallery')}
                    >
                      <Image className="h-4 w-4 sm:h-5 sm:w-5 text-school-orange flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">Gallery updated with new images</p>
                        <p className="text-xs sm:text-sm text-gray-600">5 hours ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => setActiveTab('notices')}
                    >
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">Notice board updated</p>
                        <p className="text-xs sm:text-sm text-gray-600">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="content">
            <ContentManager />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>

          <TabsContent value="notices">
            <NoticeManager />
          </TabsContent>

          <TabsContent value="admissions">
            <AdmissionManager />
          </TabsContent>

          <TabsContent value="contact">
            <ContactManager />
          </TabsContent>

          <TabsContent value="approvals">
            <AdminRequestManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
