
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const ContactManager = () => {
  const { state, dispatch } = useSchool();
  const { toast } = useToast();
  const [contactData, setContactData] = useState(state.data.contactInfo);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SCHOOL_DATA',
      payload: { contactInfo: contactData }
    });
    toast({
      title: "Contact Information Updated",
      description: "Contact details have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Contact Management</h2>
        <Button onClick={handleSave} className="bg-school-blue hover:bg-school-blue/90">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">School Address</Label>
            <Textarea
              id="address"
              name="address"
              value={contactData.address}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={contactData.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={contactData.phone}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="mapEmbed">Map Embed URL</Label>
            <Textarea
              id="mapEmbed"
              name="mapEmbed"
              value={contactData.mapEmbed}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter Google Maps embed URL"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactManager;
