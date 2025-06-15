
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageDropzoneProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  onClick: () => void;
}

const ImageDropzone = ({ onFileSelect, isUploading, onClick }: ImageDropzoneProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  return (
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
      onClick={onClick}
    >
      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">
        Drag and drop an image here, or click to select
      </p>
      <Button type="button" variant="outline" className="mt-2" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Choose File'}
      </Button>
    </div>
  );
};

export default ImageDropzone;
