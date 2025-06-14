
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AboutSectionProps {
  formData: {
    aboutContent: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const AboutSection = ({ formData, onInputChange }: AboutSectionProps) => {
  return (
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
            onChange={(e) => onInputChange('aboutContent', e.target.value)}
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
  );
};

export default AboutSection;
