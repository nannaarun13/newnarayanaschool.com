
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { storage, auth } from '@/lib/firebase';
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

    // Check authentication first
    const currentUser = auth.currentUser;
    console.log('[useImageUpload] Current user:', currentUser?.email || 'Not authenticated');
    
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in as an admin to upload images.",
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
      console.log('[useImageUpload] Storage bucket:', storage.app.options.storageBucket);
      
      const uploadTask = uploadBytesResumable(storageRef, uploadFile);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('[useImageUpload] Upload progress:', Math.round(progress) + '%', 
                     `${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes`);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('[useImageUpload] Upload failed with error:', error);
          console.error('[useImageUpload] Error code:', error.code);
          console.error('[useImageUpload] Error message:', error.message);
          
          // Enhanced error handling for storage permission issues
          let errorMessage = "There was a problem uploading your image. Please try again.";
          
          if (error.code === 'storage/unauthorized') {
            errorMessage = "Upload failed: Storage permissions not configured. Please apply the Firebase Storage rules in your Firebase Console.";
          } else if (error.code === 'storage/unauthenticated') {
            errorMessage = "Upload failed: Authentication required. Please log in as an admin.";
          } else if (error.code === 'storage/quota-exceeded') {
            errorMessage = "Upload failed: Storage quota exceeded.";
          } else if (error.code === 'storage/invalid-format') {
            errorMessage = "Upload failed: Invalid file format.";
          } else if (error.code === 'storage/unknown') {
            errorMessage = "Upload failed: Please check if Firebase Storage rules are properly configured.";
          }
          
          toast({
            title: "Upload Failed",
            description: errorMessage,
            variant: "destructive",
          });
          
          setIsUploading(false);
          setUploadProgress(0);
          onUploading?.(false);
          setPreview('');
          onImageUpload('');
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
            toast({
              title: "Upload Failed",
              description: "Failed to get image URL. Please try again.",
              variant: "destructive",
            });
          } finally {
            setIsUploading(false);
            onUploading?.(false);
          }
        }
      );
    } catch (error) {
      console.error("[useImageUpload] Upload failed:", error);
      setPreview('');
      onImageUpload('');
      setIsUploading(false);
      setUploadProgress(0);
      onUploading?.(false);
      
      toast({
        title: "Upload Failed",
        description: "There was a problem preparing your image for upload.",
        variant: "destructive",
      });
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
