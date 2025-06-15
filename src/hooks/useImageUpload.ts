
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { resizeAndCompressImage } from '@/utils/imageUtils';

interface UseImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onUploading?: (isUploading: boolean) => void;
  currentImage?: string;
}

export const useImageUpload = ({ onImageUpload, onUploading, currentImage }: UseImageUploadProps) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    setPreview(currentImage || '');
  }, [currentImage]);
  
  const handleFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid image file.",
        variant: "destructive"
      });
      return;
    }

    console.log('[useImageUpload] Starting upload for file:', file.name, 'Size:', file.size);
    setIsUploading(true);
    setUploadProgress(0);
    onUploading?.(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      console.log('[useImageUpload] Starting image compression...');
      const compressedBlob = await resizeAndCompressImage(file);
      const uploadFile = new File([compressedBlob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: "image/jpeg" });
      console.log('[useImageUpload] Image compressed. New size:', uploadFile.size);

      const fileName = `gallery/${Date.now()}_${uploadFile.name}`;
      const storageRef = ref(storage, fileName);
      console.log('[useImageUpload] Starting Firebase upload to:', fileName);
      
      const uploadTask = uploadBytesResumable(storageRef, uploadFile);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('[useImageUpload] Upload progress:', Math.round(progress) + '%');
          setUploadProgress(progress);
        },
        (error) => {
          console.error('[useImageUpload] Upload failed:', error);
          throw error;
        },
        async () => {
          try {
            console.log('[useImageUpload] Upload completed, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[useImageUpload] Download URL obtained:', downloadURL);
            
            onImageUpload(downloadURL);
            toast({
              title: "Image Uploaded Successfully",
              description: "Image is ready to be saved to the gallery.",
            });
          } catch (urlError) {
            console.error('[useImageUpload] Failed to get download URL:', urlError);
            throw urlError;
          } finally {
            setIsUploading(false);
            onUploading?.(false);
          }
        }
      );
    } catch (error) {
      console.error("[useImageUpload] Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
      setPreview('');
      onImageUpload('');
      setIsUploading(false);
      setUploadProgress(0);
      onUploading?.(false);
    }
  };

  const removeImage = () => {
    setPreview('');
    onImageUpload('');
  };

  return {
    preview,
    isUploading,
    uploadProgress,
    handleFile,
    removeImage,
  };
};
