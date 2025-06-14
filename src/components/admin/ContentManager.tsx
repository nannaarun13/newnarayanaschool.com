
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
    welcomeTitle: state.data.welcomeTitle,
    welcomeMessage: state.data.welcomeMessage,
    aboutContent: state.data.aboutContent,
    mission: state.data.mission,
    vision: state.data.vision,
    heroImage: state.data.heroImage,
    principalMessage: state.data.principalMessage,
    principalImage: state.data.principalImage
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
      welcomeTitle: sanitizeText(formData.welcomeTitle),
      welcomeMessage: sanitizeHTML(formData.welcomeMessage),
      aboutContent: sanitizeHTML(formData.aboutContent),
      mission: sanitizeHTML(formData.mission),
      vision: sanitizeHTML(formData.vision),
      heroImage: formData.heroImage, // Already validated by ImageUpload
      principalMessage: sanitizeHTML(formData.principalMessage),
      principalImage: formData.principalImage // Already validated by ImageUpload
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

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="welcomeTitle">Welcome Title *</Label>
            <Input
              id="welcomeTitle"
              value={formData.welcomeTitle}
              onChange={(e) => handleInputChange('welcomeTitle', e.target.value)}
              placeholder="Enter welcome title"
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
            label="Hero Image"
            currentImage={formData.heroImage}
            onImageUpload={(url) => handleInputChange('heroImage', url)}
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
            <Label htmlFor="mission">Mission Statement *</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => handleInputChange('mission', e.target.value)}
              placeholder="Enter mission statement"
              rows={3}
              maxLength={1000}
            />
          </div>
          
          <div>
            <Label htmlFor="vision">Vision Statement *</Label>
            <Textarea
              id="vision"
              value={formData.vision}
              onChange={(e) => handleInputChange('vision', e.target.value)}
              placeholder="Enter vision statement"
              rows={3}
              maxLength={1000}
            />
          </div>
        </CardContent>
      </Card>

      {/* Principal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Principal Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="principalMessage">Principal Message</Label>
            <Textarea
              id="principalMessage"
              value={formData.principalMessage}
              onChange={(e) => handleInputChange('principalMessage', e.target.value)}
              placeholder="Enter principal's message"
              rows={4}
              maxLength={2000}
            />
          </div>

          <ImageUpload
            label="Principal Image"
            currentImage={formData.principalImage}
            onImageUpload={(url) => handleInputChange('principalImage', url)}
          />
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
