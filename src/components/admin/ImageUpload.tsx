
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function to resize and compress image
async function resizeAndCompressImage(file: File, options = { maxWidth: 1200, quality: 0.8 }) : Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();

    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        // Calculate new size while maintaining aspect ratio
        let { width, height } = img;
        if (width > options.maxWidth) {
          height = Math.round((height * options.maxWidth) / width);
          width = options.maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Unable to get canvas context'));
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/jpeg',
          options.quality
        );
      };
      img.onerror = reject;
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

  const handleFile = async (file: File) => {
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

    try {
      // 1. Show local preview ASAP (original, before resize for snappier UI)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // 2. Resize and compress the image before uploading
      const compressedBlob = await resizeAndCompressImage(file, { maxWidth: 1200, quality: 0.8 });
      const uploadFile = new File([compressedBlob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: "image/jpeg" });

      // 3. Now upload to Firebase
      const storageRef = ref(storage, `gallery/${Date.now()}_${uploadFile.name}`);
      uploadBytes(storageRef, uploadFile)
        .then((snapshot) => getDownloadURL(snapshot.ref))
        .then((downloadURL) => {
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
    } catch (error) {
      console.error("Image processing failed", error);
      toast({
        title: "Image Processing Failed",
        description: "Could not process the image for upload.",
        variant: "destructive"
      });
      setIsUploading(false);
      onUploading?.(false);
      setPreview('');
      onImageUpload('');
    }
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
