
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import { updateSchoolData } from '@/utils/schoolDataUtils';

const formatPhoneForDisplay = (digits: string) => {
  // Accepts only digits, outputs "+91 98765 43210"
  const onlyNumbers = digits.replace(/\D/g, '').slice(-10); // last 10 digits
  if (onlyNumbers.length === 10) {
    return `+91 ${onlyNumbers.slice(0,5)} ${onlyNumbers.slice(5)}`;
  }
  return "+91 ";
};

const ContactManager = () => {
  const { state, dispatch } = useSchool();
  const { toast } = useToast();
  
  const safeContactInfo = {
    address: state.data.contactInfo?.address || '',
    email: state.data.contactInfo?.email || '',
    phone: state.data.contactInfo?.phone || '',
    contactNumbers: state.data.contactInfo?.contactNumbers || [],
    mapEmbed: state.data.contactInfo?.mapEmbed || '',
    location: state.data.contactInfo?.location || { latitude: 17.3092, longitude: 78.5095 }
  };
  
  const [contactData, setContactData] = useState(safeContactInfo);
  const [newContactNumber, setNewContactNumber] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const addContactNumber = () => {
    const formatted = formatPhoneForDisplay(newContactNumber.trim());
    if (
      newContactNumber.trim().length === 10 &&
      /^\d{10}$/.test(newContactNumber.trim()) &&
      contactData.contactNumbers.length < 5
    ) {
      const contactNumber = {
        id: Date.now().toString(),
        label: `Phone ${contactData.contactNumbers.length + 1}`,
        number: formatted
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
    } else {
      toast({
        title: "Invalid Number",
        description: "Please enter exactly 10 digits for an Indian mobile number.",
        variant: "destructive"
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

  const handleSave = async () => {
    // Save phone numbers always in "+91 98765 43210" format.
    const cleanedContactNumbers = contactData.contactNumbers.map(contact => ({
      ...contact,
      number: formatPhoneForDisplay(contact.number)
    }));
    const dataToSave = {
      ...contactData,
      contactNumbers: cleanedContactNumbers
    };

    dispatch({
      type: 'UPDATE_SCHOOL_DATA',
      payload: { contactInfo: dataToSave }
    });

    try {
      await updateSchoolData({ contactInfo: dataToSave });
      toast({
        title: "Contact Information Updated",
        description: "Contact details have been updated successfully.",
      });
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        toast({
          title: "Contact Updated Locally",
          description: "Contact information updated locally. Database permissions need configuration for persistence.",
          variant: "default",
        });
      } else {
        toast({
          title: "Partial Save",
          description: "Contact updated locally but couldn't sync to database.",
          variant: "default",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Contact Management</h2>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">School Address</Label>
            <Textarea
              id="address"
              name="address"
              value={contactData.address}
              onChange={handleInputChange}
              rows={3}
              className="mt-1"
              placeholder="Enter school address"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={contactData.email}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Phone Numbers</Label>
            <div className="mt-2 space-y-3">
              {contactData.contactNumbers.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <span className="flex-1 font-medium">{contact.number}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteContactNumber(contact.id)}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {contactData.contactNumbers.length < 5 && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                    +91
                  </span>
                  <Input
                    placeholder="98765 43210"
                    value={newContactNumber}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setNewContactNumber(v);
                    }}
                    className="flex-1 rounded-l-none"
                    maxLength={10}
                  />
                  <Button 
                    onClick={addContactNumber} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Phone
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter 10 digit Indian mobile number. The number will be saved as "+91 XXXXX YYYYY".</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="mapEmbed" className="text-sm font-medium text-gray-700">Map Embed URL</Label>
            <Textarea
              id="mapEmbed"
              name="mapEmbed"
              value={contactData.mapEmbed}
              onChange={handleInputChange}
              rows={4}
              className="mt-1"
              placeholder="Enter Google Maps embed URL"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactManager;
