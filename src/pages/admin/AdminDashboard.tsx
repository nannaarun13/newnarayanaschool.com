import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import ContentManager from '@/components/admin/ContentManager';
import GalleryManager from '@/components/admin/GalleryManager';
import NoticeManager from '@/components/admin/NoticeManager';
import AdmissionManager from '@/components/admin/AdmissionManager';
import ContactManager from '@/components/admin/ContactManager';
import AdminRequestManager from '@/components/admin/AdminRequestManager';
import SecurityHeadersEnhanced from '@/components/security/SecurityHeadersEnhanced';
import SecurityMetricsDashboard from '@/components/security/SecurityMetricsDashboard';
import SecurityMonitorEnhanced from '@/components/security/SecurityMonitorEnhanced';
import SyncStatusIndicator from '@/components/SyncStatusIndicator';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("content");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Any initialization logic here
  }, []);

  const handleViewSite = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SecurityHeadersEnhanced />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-school-blue mb-2">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">Manage your school's content and settings</p>
              <SyncStatusIndicator />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleViewSite}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>View Site</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="admissions">Admissions</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <ContentManager />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <GalleryManager />
          </TabsContent>

          <TabsContent value="notices" className="space-y-6">
            <NoticeManager />
          </TabsContent>

          <TabsContent value="admissions" className="space-y-6">
            <AdmissionManager />
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <ContactManager />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <AdminRequestManager />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityMetricsDashboard />
            <SecurityMonitorEnhanced />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminDashboard;
