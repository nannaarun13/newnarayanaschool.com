
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import ImageUpload from './ImageUpload';

const ContentManager = () => {
  const { state, dispatch } = useSchool();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    schoolName: state.data.schoolName,
    schoolLogo: state.data.schoolLogo,
    welcomeMessage: state.data.welcomeMessage,
    welcomeImage: state.data.welcomeImage,
    schoolHistory: state.data.schoolHistory,
    yearEstablished: state.data.yearEstablished,
    educationalSociety: state.data.educationalSociety,
    founderDetails: state.data.founderDetails
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (field: string, imageUrl: string) => {
    setFormData(prev => ({ ...prev, [field]: imageUrl }));
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SCHOOL_DATA',
      payload: formData
    });
    toast({
      title: "Content Updated",
      description: "School content has been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
        <Button onClick={handleSave} className="bg-school-blue hover:bg-school-blue/90">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* School Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
              />
            </div>
            
            <ImageUpload
              label="School Logo"
              currentImage={formData.schoolLogo}
              onImageUpload={(url) => handleImageUpload('schoolLogo', url)}
            />
            
            <div>
              <Label htmlFor="yearEstablished">Year Established</Label>
              <Input
                id="yearEstablished"
                name="yearEstablished"
                value={formData.yearEstablished}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="educationalSociety">Educational Society</Label>
              <Input
                id="educationalSociety"
                name="educationalSociety"
                value={formData.educationalSociety}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <ImageUpload
              label="Welcome Image"
              currentImage={formData.welcomeImage}
              onImageUpload={(url) => handleImageUpload('welcomeImage', url)}
            />
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Us Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="schoolHistory">School History</Label>
              <Textarea
                id="schoolHistory"
                name="schoolHistory"
                value={formData.schoolHistory}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="founderDetails">Founder Details</Label>
              <Textarea
                id="founderDetails"
                name="founderDetails"
                value={formData.founderDetails}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentManager;
