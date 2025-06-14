
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ImageUpload from '../ImageUpload';

interface SchoolInfoSectionProps {
  formData: {
    schoolName: string;
    welcomeMessage: string;
    welcomeImage: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const SchoolInfoSection = ({ formData, onInputChange }: SchoolInfoSectionProps) => {
  return (
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
            onChange={(e) => onInputChange('schoolName', e.target.value)}
            placeholder="Enter school name"
            maxLength={100}
          />
        </div>
        
        <div>
          <Label htmlFor="welcomeMessage">Welcome Message *</Label>
          <Textarea
            id="welcomeMessage"
            value={formData.welcomeMessage}
            onChange={(e) => onInputChange('welcomeMessage', e.target.value)}
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
          onImageUpload={(url) => onInputChange('welcomeImage', url)}
        />
      </CardContent>
    </Card>
  );
};

export default SchoolInfoSection;
