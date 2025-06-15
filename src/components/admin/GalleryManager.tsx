
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchool } from '@/contexts/SchoolContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { addGalleryImage, removeGalleryImage } from '@/utils/schoolDataUtils';
import { GalleryImage } from '@/types';

const GalleryManager = () => {
  const { state } = useSchool();
  const { toast } = useToast();
  const [newImage, setNewImage] = useState({ url: '', caption: '', category: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = ['General', 'Event', 'Festivals', 'Activities'];

  const handleImageUpload = (imageUrl: string) => {
    setNewImage(prev => ({ ...prev, url: imageUrl }));
  };

  const handleAddImage = async () => {
    if (!newImage.url || !newImage.caption || !newImage.category) {
      toast({
        title: "Missing Information",
        description: "Please provide image, caption, and category.",
        variant: "destructive"
      });
      return;
    }
    if (newImage.caption.length < 2 || newImage.category.length < 2) {
      toast({
        title: "Invalid Data",
        description: "Caption and category must be filled out.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const imageData: GalleryImage = {
        id: Date.now().toString(),
        url: newImage.url,
        altText: newImage.caption,
        caption: newImage.caption,
        category: newImage.category,
        date: new Date().toISOString(),
      };
      
      console.log("[GalleryManager] Adding image to Firestore:", imageData);
      await addGalleryImage(imageData);
      
      toast({
        title: "Image Added",
        description: "New image has been added to the gallery.",
      });
      setNewImage({ url: '', caption: '', category: '' });
    } catch (error: any) {
      console.error("[GalleryManager] Failed to save gallery image:", error);
      toast({
        title: "Error Saving Image",
        description: error?.message ?? "There was a problem saving the image.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await removeGalleryImage(id);
      toast({
        title: "Image Deleted",
        description: "Image has been removed from the gallery.",
      });
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast({
        title: "Error Deleting Image",
        description: "There was a problem deleting the image.",
        variant: "destructive",
      });
    }
  };
  
  const { galleryImages = [] } = state.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gallery Management</h2>
      </div>

      {/* Add New Image */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            label="Upload Gallery Image"
            currentImage={newImage.url}
            onImageUpload={handleImageUpload}
            onUploading={setIsUploading}
          />
          
          <div>
            <Label htmlFor="imageCaption">Caption</Label>
            <Input
              id="imageCaption"
              value={newImage.caption}
              onChange={(e) => setNewImage(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Enter image caption"
            />
          </div>

          <div>
            <Label htmlFor="imageCategory">Category *</Label>
            <Select value={newImage.category} onValueChange={(value) => setNewImage(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleAddImage} 
            className="bg-school-blue hover:bg-school-blue/90"
            disabled={isUploading || isSaving || !newImage.url}
          >
            {isUploading || isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Add Image'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Images */}
      <Card>
        <CardHeader>
          <CardTitle>Current Gallery Images</CardTitle>
        </CardHeader>
        <CardContent>
          {galleryImages.length === 0 ? (
            <p className="text-gray-500">No images in the gallery yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.altText || image.caption}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="font-medium">{image.caption}</p>
                    <p className="text-sm text-gray-600 mt-1">{image.category}</p>
                    <p className="text-sm text-gray-600">{new Date(image.date).toLocaleDateString()}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryManager;
