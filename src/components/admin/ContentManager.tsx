
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Shield } from 'lucide-react';
import ImageUpload from './ImageUpload';
import LatestUpdatesManager from './LatestUpdatesManager';
import FoundersManager from './FoundersManager';
import { sanitizeHTML, sanitizeText, validateContentLength } from '@/utils/sanitizationUtils';

const ContentManager = () => {
  const { state, dispatch } = useSchool();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    schoolName: state.data.schoolName,
    welcomeMessage: state.data.welcomeMessage,
    aboutContent: state.data.aboutContent,
    missionStatement: state.data.missionStatement,
    visionStatement: state.data.visionStatement,
    welcomeImage: state.data.welcomeImage,
    schoolHistory: state.data.schoolHistory,
    founderDetails: state.data.founderDetails
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate content lengths
    if (!validateContentLength(formData.welcomeMessage, 2000)) {
      toast({
        title: "Content Too Long",
        description: "Welcome message must be under 2000 characters.",
        variant: "destructive"
      });
      return;
    }

    if (!validateContentLength(formData.aboutContent, 5000)) {
      toast({
        title: "Content Too Long", 
        description: "About content must be under 5000 characters.",
        variant: "destructive"
      });
      return;
    }

    // Sanitize all inputs before saving
    const sanitizedData = {
      schoolName: sanitizeText(formData.schoolName),
      welcomeMessage: sanitizeHTML(formData.welcomeMessage),
      aboutContent: sanitizeHTML(formData.aboutContent),
      missionStatement: sanitizeHTML(formData.missionStatement),
      visionStatement: sanitizeHTML(formData.visionStatement),
      welcomeImage: formData.welcomeImage, // Already validated by ImageUpload
      schoolHistory: sanitizeHTML(formData.schoolHistory),
      founderDetails: sanitizeHTML(formData.founderDetails)
    };

    dispatch({
      type: 'UPDATE_SCHOOL_DATA',
      payload: sanitizedData
    });

    toast({
      title: "Content Updated",
      description: "All content has been securely saved with XSS protection.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
        <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <Shield className="h-4 w-4 mr-1" />
          XSS Protection Active
        </div>
      </div>

      {/* School Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="schoolName">School Name *</Label>
            <Input
              id="schoolName"
              value={formData.schoolName}
              onChange={(e) => handleInputChange('schoolName', e.target.value)}
              placeholder="Enter school name"
              maxLength={100}
            />
          </div>
          
          <div>
            <Label htmlFor="welcomeMessage">Welcome Message *</Label>
            <Textarea
              id="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
              placeholder="Enter welcome message (supports basic HTML: b, i, em, strong, u, br, p)"
              rows={4}
              maxLength={2000}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.welcomeMessage.length}/2000 characters
            </p>
          </div>

          <ImageUpload
            label="Welcome/Hero Image"
            currentImage={formData.welcomeImage}
            onImageUpload={(url) => handleInputChange('welcomeImage', url)}
          />
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="aboutContent">About Content *</Label>
            <Textarea
              id="aboutContent"
              value={formData.aboutContent}
              onChange={(e) => handleInputChange('aboutContent', e.target.value)}
              placeholder="Enter about content (supports basic HTML)"
              rows={6}
              maxLength={5000}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.aboutContent.length}/5000 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <Card>
        <CardHeader>
          <CardTitle>Mission & Vision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="missionStatement">Mission Statement *</Label>
            <Textarea
              id="missionStatement"
              value={formData.missionStatement}
              onChange={(e) => handleInputChange('missionStatement', e.target.value)}
              placeholder="Enter mission statement"
              rows={3}
              maxLength={1000}
            />
          </div>
          
          <div>
            <Label htmlFor="visionStatement">Vision Statement *</Label>
            <Textarea
              id="visionStatement"
              value={formData.visionStatement}
              onChange={(e) => handleInputChange('visionStatement', e.target.value)}
              placeholder="Enter vision statement"
              rows={3}
              maxLength={1000}
            />
          </div>
        </CardContent>
      </Card>

      {/* History & Founder Section */}
      <Card>
        <CardHeader>
          <CardTitle>History & Founder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="schoolHistory">School History</Label>
            <Textarea
              id="schoolHistory"
              value={formData.schoolHistory}
              onChange={(e) => handleInputChange('schoolHistory', e.target.value)}
              placeholder="Enter school history"
              rows={4}
              maxLength={2000}
            />
          </div>

          <div>
            <Label htmlFor="founderDetails">Founder Details</Label>
            <Textarea
              id="founderDetails"
              value={formData.founderDetails}
              onChange={(e) => handleInputChange('founderDetails', e.target.value)}
              placeholder="Enter founder details"
              rows={4}
              maxLength={2000}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-school-blue hover:bg-school-blue/90">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Additional Managers */}
      <LatestUpdatesManager />
      <FoundersManager />
    </div>
  );
};

export default ContentManager;
