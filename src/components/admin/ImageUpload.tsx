
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onUploading?: (isUploading: boolean) => void;
  currentImage?: string;
  label: string;
  accept?: string;
}

const ImageUpload = ({ onImageUpload, onUploading, currentImage, label, accept = "image/*" }: ImageUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);

  // Sync internal preview state with the currentImage prop
  useEffect(() => {
    setPreview(currentImage || '');
  }, [currentImage]);

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a valid image file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    onUploading?.(true);

    // Show a local preview immediately for better UX
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    
    uploadBytes(storageRef, file)
      .then((snapshot) => {
        console.log('Uploaded a blob or file!', snapshot);
        return getDownloadURL(snapshot.ref);
      })
      .then((downloadURL) => {
        console.log('File available at', downloadURL);
        onImageUpload(downloadURL); // Pass the public storage URL to the parent
        toast({
          title: "Image Uploaded to Storage",
          description: "Image is now ready to be saved to the gallery.",
        });
      })
      .catch((error) => {
        console.error("Upload failed", error);
        toast({
          title: "Upload Failed",
          description: "There was a problem uploading your image. Please try again.",
          variant: "destructive",
        });
        // Clear preview on failure to prevent saving a broken link
        setPreview(''); 
        onImageUpload('');
      })
      .finally(() => {
        setIsUploading(false);
        onUploading?.(false);
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const removeImage = () => {
    setPreview('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          {isUploading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
             </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-school-blue bg-school-blue-light' 
              : 'border-gray-300 hover:border-school-blue'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Drag and drop an image here, or click to select
          </p>
          <Button type="button" variant="outline" className="mt-2" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </div>
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
