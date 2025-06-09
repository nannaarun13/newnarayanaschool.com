
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUpload from './ImageUpload';

const ContentManager = () => {
  const { state, dispatch } = useSchool();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    schoolName: state.data.schoolName,
    schoolLogo: state.data.schoolLogo,
    schoolNameImage: state.data.schoolNameImage,
    welcomeMessage: state.data.welcomeMessage,
    welcomeImage: state.data.welcomeImage,
    schoolHistory: state.data.schoolHistory,
    founderDetails: state.data.founderDetails
  });

  // Latest Updates state
  const [newUpdateContent, setNewUpdateContent] = useState('');

  // Founders state
  const [newFounder, setNewFounder] = useState({
    name: '',
    details: '',
    image: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (field: string, imageUrl: string) => {
    setFormData(prev => ({ ...prev, [field]: imageUrl }));
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_SCHOOL_DATA',
      payload: formData
    });
    toast({
      title: "Content Updated",
      description: "School content has been updated successfully.",
    });
  };

  // Latest Updates functions
  const addLatestUpdate = () => {
    if (newUpdateContent.trim()) {
      const newUpdate = {
        id: Date.now().toString(),
        content: newUpdateContent,
        date: new Date().toISOString().split('T')[0]
      };
      
      dispatch({ type: 'ADD_LATEST_UPDATE', payload: newUpdate });
      setNewUpdateContent('');
      
      toast({
        title: "Update Added",
        description: "Latest update has been added successfully.",
      });
    }
  };

  const deleteLatestUpdate = (id: string) => {
    dispatch({ type: 'DELETE_LATEST_UPDATE', payload: id });
    toast({
      title: "Update Deleted",
      description: "Latest update has been removed.",
    });
  };

  // Founders functions
  const addFounder = () => {
    if (newFounder.name.trim() && newFounder.details.trim()) {
      const founder = {
        id: Date.now().toString(),
        name: newFounder.name,
        details: newFounder.details,
        image: newFounder.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
      };
      
      dispatch({ type: 'ADD_FOUNDER', payload: founder });
      setNewFounder({ name: '', details: '', image: '' });
      
      toast({
        title: "Founder Added",
        description: "New founder has been added successfully.",
      });
    }
  };

  const deleteFounder = (id: string) => {
    dispatch({ type: 'DELETE_FOUNDER', payload: id });
    toast({
      title: "Founder Deleted",
      description: "Founder has been removed.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Content Management</h2>
        <Button onClick={handleSave} className="bg-school-blue hover:bg-school-blue/90">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Content</TabsTrigger>
          <TabsTrigger value="updates">Latest Updates</TabsTrigger>
          <TabsTrigger value="founders">Founders</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="schoolName">School Name (fallback text)</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                />
              </div>

              <ImageUpload
                label="School Logo"
                currentImage={formData.schoolLogo}
                onImageUpload={(url) => handleImageUpload('schoolLogo', url)}
              />

              <ImageUpload
                label="School Main Image"
                currentImage={formData.schoolNameImage}
                onImageUpload={(url) => handleImageUpload('schoolNameImage', url)}
              />

              <ImageUpload
                label="School Name Image (replaces text header)"
                currentImage={formData.schoolNameImage}
                onImageUpload={(url) => handleImageUpload('schoolNameImage', url)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Welcome Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  name="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <ImageUpload
                label="Welcome Section Image"
                currentImage={formData.welcomeImage}
                onImageUpload={(url) => handleImageUpload('welcomeImage', url)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Us Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="schoolHistory">School History</Label>
                <Textarea
                  id="schoolHistory"
                  name="schoolHistory"
                  value={formData.schoolHistory}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="founderDetails">Founder Details</Label>
                <Textarea
                  id="founderDetails"
                  name="founderDetails"
                  value={formData.founderDetails}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Update</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="updateContent">Update Content</Label>
                <Textarea
                  id="updateContent"
                  placeholder="Enter the latest update"
                  value={newUpdateContent}
                  onChange={(e) => setNewUpdateContent(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={addLatestUpdate} className="bg-school-blue hover:bg-school-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Update
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.data.latestUpdates.map((update) => (
                  <div key={update.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{update.content}</p>
                      <p className="text-sm text-gray-500 mt-1">{update.date}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLatestUpdate(update.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {state.data.latestUpdates.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No updates yet. Add your first update above.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="founders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Founder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="founderName">Founder Name</Label>
                <Input
                  id="founderName"
                  placeholder="Enter founder name"
                  value={newFounder.name}
                  onChange={(e) => setNewFounder(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="founderDescription">Description</Label>
                <Textarea
                  id="founderDescription"
                  placeholder="Enter founder description"
                  value={newFounder.details}
                  onChange={(e) => setNewFounder(prev => ({ ...prev, details: e.target.value }))}
                  rows={3}
                />
              </div>
              <ImageUpload
                label="Founder Image"
                currentImage={newFounder.image}
                onImageUpload={(url) => setNewFounder(prev => ({ ...prev, image: url }))}
              />
              <Button onClick={addFounder} className="bg-school-blue hover:bg-school-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Founder
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Founders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.data.founders.map((founder) => (
                  <div key={founder.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <img 
                      src={founder.image} 
                      alt={founder.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-school-blue">{founder.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{founder.details}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteFounder(founder.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                ))}
                {state.data.founders.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No founders yet. Add your first founder above.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManager;
