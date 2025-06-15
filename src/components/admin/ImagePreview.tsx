
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  preview: string;
  isUploading: boolean;
  onRemove: () => void;
}

const ImagePreview = ({ preview, isUploading, onRemove }: ImagePreviewProps) => {
  return (
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
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ImagePreview;
