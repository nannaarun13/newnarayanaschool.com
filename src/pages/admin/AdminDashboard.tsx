import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentManagement } from '@/components/admin/ContentManagement';
import { GalleryManagement } from '@/components/admin/GalleryManagement';
import { NoticeManagement } from '@/components/admin/NoticeManagement';
import { UpdateManagement } from '@/components/admin/UpdateManagement';
import { AdmissionManagement } from '@/components/admin/AdmissionManagement';
import { ContactInfoManagement } from '@/components/admin/ContactInfoManagement';
import { AdminRequestList } from '@/components/admin/AdminRequestList';
import SecurityMonitorEnhanced from '@/components/security/SecurityMonitorEnhanced';
import SecurityHeaders from '@/components/security/SecurityHeaders';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    // Any initialization logic here
  }, []);

  return (
    <>
      <SecurityHeaders />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-school-blue mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your school's content and settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="admissions">Admissions</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <GalleryManagement />
          </TabsContent>

          <TabsContent value="notices" className="space-y-6">
            <NoticeManagement />
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <UpdateManagement />
          </TabsContent>

          <TabsContent value="admissions" className="space-y-6">
            <AdmissionManagement />
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <ContactInfoManagement />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <AdminRequestList />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityMonitorEnhanced />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AdminDashboard;
