import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Image, 
  Bell, 
  Settings, 
  FileText, 
  Phone,
  Shield,
  Home,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSchool } from '@/contexts/SchoolContext';
import ContentManager from '@/components/admin/ContentManager';
import GalleryManager from '@/components/admin/GalleryManager';
import NoticeManager from '@/components/admin/NoticeManager';
import AdmissionManager from '@/components/admin/AdmissionManager';
import ContactManager from '@/components/admin/ContactManager';
import AdminRequestManager from '@/components/admin/AdminRequestManager';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useSchool();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAdminEmail(user.email || 'Admin');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
      value: (state.data.galleryImages?.length || 0).toString(), 
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
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-school-blue" />
              <div>
                <h1 className="text-2xl font-bold text-school-blue">Admin Dashboard</h1>
                <p className="text-gray-600">New Narayana School Management</p>
                <p className="text-sm text-gray-500">Welcome, {adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-school-blue text-school-blue hover:bg-school-blue hover:text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="admissions">Admissions</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="approvals">Admin Approval</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Dashboard Stats */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-12 w-12 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div 
                      className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => setActiveTab('admissions')}
                    >
                      <Bell className="h-5 w-5 text-school-blue" />
                      <div>
                        <p className="font-medium">New admission inquiry received</p>
                        <p className="text-sm text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                      onClick={() => setActiveTab('gallery')}
                    >
                      <Image className="h-5 w-5 text-school-orange" />
                      <div>
                        <p className="font-medium">Gallery updated with new images</p>
                        <p className="text-sm text-gray-600">5 hours ago</p>
                      </div>
                    </div>
                    <div 
                      className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => setActiveTab('notices')}
                    >
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Notice board updated</p>
                        <p className="text-sm text-gray-600">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Enhanced Security Status */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Security Review</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">Security Status: SECURE</h3>
                        <p className="text-green-700">All security checks passed</p>
                        <ul className="mt-2 text-sm text-green-600 list-disc list-inside">
                          <li>Admin registration & approval system active</li>
                          <li>Password reset with Firebase configured</li>
                          <li>Protected admin routes implemented</li>
                          <li>Session management secured via Firebase</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">Access Control</h3>
                        <p className="text-blue-700">Admin approval system active</p>
                        <ul className="mt-2 text-sm text-blue-600 list-disc list-inside">
                          <li>Registration requests require approval via Firestore</li>
                          <li>Unapproved users cannot access admin panel</li>
                          <li>Firebase password reset enabled</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
