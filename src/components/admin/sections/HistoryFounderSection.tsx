
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface HistoryFounderSectionProps {
  formData: {
    schoolHistory: string;
    founderDetails: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const HistoryFounderSection = ({ formData, onInputChange }: HistoryFounderSectionProps) => {
  return (
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
            onChange={(e) => onInputChange('schoolHistory', e.target.value)}
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
            onChange={(e) => onInputChange('founderDetails', e.target.value)}
            placeholder="Enter founder details"
            rows={4}
            maxLength={2000}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryFounderSection;
