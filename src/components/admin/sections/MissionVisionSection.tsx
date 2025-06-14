
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MissionVisionSectionProps {
  formData: {
    missionStatement: string;
    visionStatement: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const MissionVisionSection = ({ formData, onInputChange }: MissionVisionSectionProps) => {
  return (
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
            onChange={(e) => onInputChange('missionStatement', e.target.value)}
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
            onChange={(e) => onInputChange('visionStatement', e.target.value)}
            placeholder="Enter vision statement"
            rows={3}
            maxLength={1000}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionVisionSection;
