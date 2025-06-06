
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Image, 
  Bell, 
  Settings, 
  FileText, 
  Phone,
  BarChart,
  Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const dashboardStats = [
    { title: "Total Inquiries", value: "45", icon: Users, color: "text-school-blue" },
    { title: "Gallery Images", value: "124", icon: Image, color: "text-school-orange" },
    { title: "Active Notices", value: "8", icon: Bell, color: "text-green-600" },
    { title: "Page Updates", value: "12", icon: FileText, color: "text-purple-600" }
  ];

  const quickActions = [
    { title: "Manage Content", icon: FileText, description: "Update homepage, about us, and other pages" },
    { title: "Gallery Management", icon: Image, description: "Add, remove, and organize gallery images" },
    { title: "Notice Board", icon: Bell, description: "Post new notices and announcements" },
    { title: "Admission Inquiries", icon: Users, description: "View and manage admission requests" },
    { title: "Contact Information", icon: Phone, description: "Update school contact details" },
    { title: "System Settings", icon: Settings, description: "Configure system preferences" }
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
              </div>
            </div>
            <Button variant="outline" className="border-school-blue text-school-blue">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
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

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <action.icon className="h-6 w-6 text-school-blue" />
                    <span className="text-lg">{action.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{action.description}</p>
                  <Button className="w-full bg-school-blue hover:bg-school-blue/90">
                    Access
                  </Button>
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
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Bell className="h-5 w-5 text-school-blue" />
                  <div>
                    <p className="font-medium">New admission inquiry received</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Image className="h-5 w-5 text-school-orange" />
                  <div>
                    <p className="font-medium">Gallery updated with new images</p>
                    <p className="text-sm text-gray-600">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
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

        {/* System Status */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">System Status</h2>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-green-800">All systems operational</p>
                  <p className="text-sm text-green-600">Website is running smoothly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
