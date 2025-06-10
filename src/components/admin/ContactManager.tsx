
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

const ContactManager = () => {
  const { state, dispatch } = useSchool();
  const { toast } = useToast();
  
  const safeContactInfo = {
    address: state.data.contactInfo?.address || '',
    email: state.data.contactInfo?.email || '',
    phone: state.data.contactInfo?.phone || '',
    contactNumbers: state.data.contactInfo?.contactNumbers || [],
    mapEmbed: state.data.contactInfo?.mapEmbed || ''
  };
  
  const [contactData, setContactData] = useState(safeContactInfo);
  const [newContactNumber, setNewContactNumber] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const addContactNumber = () => {
    if (newContactNumber.trim() && contactData.contactNumbers.length < 5) {
      const formattedNumber = newContactNumber.startsWith('+') ? newContactNumber : `+${newContactNumber}`;
      const contactNumber = {
        id: Date.now().toString(),
        label: `Phone ${contactData.contactNumbers.length + 1}`,
        number: formattedNumber
      };
      
      const updatedContactData = {
        ...contactData,
        contactNumbers: [...contactData.contactNumbers, contactNumber]
      };
      
      setContactData(updatedContactData);
      setNewContactNumber('');
      
      toast({
        title: "Phone Number Added",
        description: "New phone number has been added.",
      });
    }
  };

  const deleteContactNumber = (id: string) => {
    const updatedContactData = {
      ...contactData,
      contactNumbers: contactData.contactNumbers.filter(contact => contact.id !== id)
    };
    setContactData(updatedContactData);
    
    toast({
      title: "Phone Number Deleted",
      description: "Phone number has been removed.",
    });
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
          <CardTitle>Basic Contact Information</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Phone Numbers (Up to 5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {contactData.contactNumbers.map((contact) => (
              <div key={contact.id} className="flex items-center gap-2 p-2 border rounded">
                <span>{contact.number}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteContactNumber(contact.id)}
                  className="ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {contactData.contactNumbers.length < 5 && (
            <div className="flex gap-2">
              <Input
                placeholder="+91 Phone Number"
                value={newContactNumber}
                onChange={(e) => setNewContactNumber(e.target.value)}
              />
              <Button onClick={addContactNumber} className="bg-school-blue hover:bg-school-blue/90">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactManager;
