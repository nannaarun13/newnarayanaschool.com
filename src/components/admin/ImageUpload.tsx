
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageDropZone from './ImageDropZone';
import ImagePreview from './ImagePreview';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onUploading?: (isUploading: boolean) => void;
  currentImage?: string;
  label: string;
  accept?: string;
  autoSaveToDatabase?: boolean;
}

const ImageUpload = ({ 
  onImageUpload, 
  onUploading, 
  currentImage, 
  label, 
  accept = "image/*",
  autoSaveToDatabase = false 
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { preview, setPreview, isUploading, handleFile, removeImage } = useImageUpload({
    onImageUpload,
    onUploading,
    autoSaveToDatabase
  });

  // Set initial preview from currentImage prop
  if (currentImage && !preview) {
    setPreview(currentImage);
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleRemoveImage = () => {
    removeImage(onImageUpload, fileInputRef);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {preview ? (
        <ImagePreview 
          preview={preview}
          isUploading={isUploading}
          onRemove={handleRemoveImage}
        />
      ) : (
        <ImageDropZone 
          onFileDrop={handleFile}
          onFileSelect={handleFileSelect}
          isUploading={isUploading}
        />
      )}
      
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default ImageUpload;
