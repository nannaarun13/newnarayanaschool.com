
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { resizeAndCompressImage } from '@/utils/imageUtils';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';

interface UseImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onUploading?: (isUploading: boolean) => void;
  currentImage?: string;
}

const CLOUDINARY_CLOUD_NAME = 'dpie6aqzf';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned'; // set this in Cloudinary dashboard for unsigned uploads
const CLOUDINARY_FOLDER = 'gallery';

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

      console.log('[useImageUpload] Starting Cloudinary upload...');
      const imageUrl = await uploadToCloudinary({
        file: uploadFile,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        folder: CLOUDINARY_FOLDER,
        cloudName: CLOUDINARY_CLOUD_NAME,
        onProgress: (progress) => {
          setUploadProgress(progress);
          console.log('[useImageUpload] Cloudinary upload progress:', Math.round(progress) + '%');
        },
      });

      console.log('[useImageUpload] Cloudinary upload complete, URL:', imageUrl);
      onImageUpload(imageUrl);
      toast({
        title: "Image Uploaded Successfully",
        description: "Image is ready to be saved to the gallery.",
      });
    } catch (error: any) {
      console.error("[useImageUpload] Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
      setPreview('');
      onImageUpload('');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
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
