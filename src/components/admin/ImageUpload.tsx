import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';

// Helper function to resize and compress image
async function resizeAndCompressImage(file: File, options = { maxWidth: 1200, quality: 0.8 }): Promise<Blob> {
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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

    console.log('[ImageUpload] Starting upload for file:', file.name, 'Size:', file.size);
    setIsUploading(true);
    setUploadProgress(0);
    onUploading?.(true);

    try {
      // 1. Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        console.log('[ImageUpload] Preview set successfully');
      };
      reader.readAsDataURL(file);

      // 2. Resize and compress the image
      console.log('[ImageUpload] Starting image compression...');
      const compressedBlob = await resizeAndCompressImage(file, { maxWidth: 1200, quality: 0.8 });
      const uploadFile = new File([compressedBlob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: "image/jpeg" });
      
      console.log('[ImageUpload] Image compressed successfully. Original size:', file.size, 'Compressed size:', uploadFile.size);

      // 3. Upload to Firebase Storage with real-time progress
      const fileName = `gallery/${Date.now()}_${uploadFile.name}`;
      const storageRef = ref(storage, fileName);
      
      console.log('[ImageUpload] Starting Firebase upload to:', fileName);
      
      // Use uploadBytesResumable for real progress tracking
      const uploadTask = uploadBytesResumable(storageRef, uploadFile);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Real-time progress updates
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('[ImageUpload] Upload progress:', Math.round(progress) + '%');
          setUploadProgress(progress);
        },
        (error) => {
          // Handle unsuccessful uploads
          console.error('[ImageUpload] Upload failed:', error);
          throw error;
        },
        async () => {
          // Handle successful uploads
          try {
            console.log('[ImageUpload] Upload completed, getting download URL...');
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[ImageUpload] Download URL obtained:', downloadURL);
            
            onImageUpload(downloadURL);
            toast({
              title: "Image Uploaded Successfully",
              description: "Image is ready to be saved to the gallery.",
            });
          } catch (urlError) {
            console.error('[ImageUpload] Failed to get download URL:', urlError);
            throw urlError;
          }
        }
      );
      
    } catch (error) {
      console.error("[ImageUpload] Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
      setPreview('');
      onImageUpload('');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      onUploading?.(false);
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
            <>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <div className="absolute bottom-0 left-0 w-full px-1 pb-1">
                <Progress value={uploadProgress} className="h-2" />
                <span className="text-xs text-white absolute right-2 bottom-2">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
            </>
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
