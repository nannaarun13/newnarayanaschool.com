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
  
  // Ensure contactInfo has all required properties with defaults
  const safeContactInfo = {
    address: state.data.contactInfo?.address || '',
    email: state.data.contactInfo?.email || '',
    phone: state.data.contactInfo?.phone || '',
    contactNumbers: state.data.contactInfo?.contactNumbers || [],
    mapEmbed: state.data.contactInfo?.mapEmbed || ''
  };
  
  const [contactData, setContactData] = useState(safeContactInfo);
  const [newContact, setNewContact] = useState({ label: '', number: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'number') {
      // Ensure + symbol is added
      const formattedValue = value.startsWith('+') ? value : `+${value}`;
      setNewContact(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setNewContact(prev => ({ ...prev, [name]: value }));
    }
  };

  const addContactNumber = () => {
    if (newContact.label && newContact.number) {
      const contactNumber = {
        id: Date.now().toString(),
        label: newContact.label,
        number: newContact.number
      };
      
      dispatch({ type: 'ADD_CONTACT_NUMBER', payload: contactNumber });
      setNewContact({ label: '', number: '+' });
      
      toast({
        title: "Contact Added",
        description: "New contact number has been added.",
      });
    }
  };

  const deleteContactNumber = (id: string) => {
    dispatch({ type: 'DELETE_CONTACT_NUMBER', payload: id });
    toast({
      title: "Contact Deleted",
      description: "Contact number has been removed.",
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

  // Safe access to contact numbers with fallback
  const contactNumbers = state.data.contactInfo?.contactNumbers || [];

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

      <Card>
        <CardHeader>
          <CardTitle>Phone Numbers (Up to 5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Contact Numbers */}
          <div className="space-y-2">
            {contactNumbers.map((contact) => (
              <div key={contact.id} className="flex items-center gap-2 p-2 border rounded">
                <span className="font-medium">{contact.label}:</span>
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

          {/* Add New Contact */}
          {contactNumbers.length < 5 && (
            <div className="flex gap-2">
              <Input
                name="label"
                placeholder="Label (e.g., Principal Office)"
                value={newContact.label}
                onChange={handleNewContactChange}
              />
              <Input
                name="number"
                placeholder="+91 Phone Number"
                value={newContact.number}
                onChange={handleNewContactChange}
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
