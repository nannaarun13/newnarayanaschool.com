
import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImagePreview from './image-upload/ImagePreview';
import ImageDropzone from './image-upload/ImageDropzone';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onUploading?: (isUploading: boolean) => void;
  currentImage?: string;
  label: string;
  accept?: string;
}

const ImageUpload = ({
  onImageUpload,
  onUploading,
  currentImage,
  label,
  accept = "image/*",
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    preview,
    isUploading,
    uploadProgress,
    handleFile,
    removeImage,
  } = useImageUpload({ onImageUpload, onUploading, currentImage });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleRemoveImage = () => {
    removeImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {preview ? (
        <ImagePreview
          preview={preview}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onRemove={handleRemoveImage}
        />
      ) : (
        <ImageDropzone
          onFileSelect={handleFile}
          isUploading={isUploading}
          onClick={triggerFileInput}
        />
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default ImageUpload;
