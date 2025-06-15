
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadImageToStorage, compressImage } from '@/utils/imageUploadUtils';
import { addGalleryImageToDb } from '@/utils/galleryUtils';

interface UseImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onUploading?: (isUploading: boolean) => void;
  autoSaveToDatabase?: boolean;
}

export const useImageUpload = ({ 
  onImageUpload, 
  onUploading, 
  autoSaveToDatabase = false 
}: UseImageUploadProps) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid image file.",
        variant: "destructive"
      });
      return;
    }

    console.log(`Original file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
    
    setIsUploading(true);
    onUploading?.(true);

    try {
      // Compress image
      const compressedFile = await compressImage(file);
      
      // Upload to Firebase Storage
      const downloadURL = await uploadImageToStorage(compressedFile);
      onImageUpload(downloadURL);

      // Auto-save to database if enabled
      if (autoSaveToDatabase) {
        console.log('Auto-saving image to database...');
        const imageData = {
          url: downloadURL,
          altText: `Image uploaded on ${new Date().toLocaleDateString()}`,
          caption: `Image uploaded on ${new Date().toLocaleDateString()}`,
          category: 'General',
        };
        
        await addGalleryImageToDb(imageData);
        console.log('Image automatically saved to database');
        
        toast({
          title: "Image Saved",
          description: "Image has been uploaded and automatically saved to the gallery.",
        });
      } else {
        toast({
          title: "Image Ready",
          description: "Image has been uploaded. You can now add details and save.",
        });
      }

    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      onUploading?.(false);
    }
  };

  const removeImage = (onImageUpload: (url: string) => void, fileInputRef: React.RefObject<HTMLInputElement>) => {
    setPreview('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return {
    preview,
    setPreview,
    isUploading,
    handleFile,
    removeImage
  };
};
