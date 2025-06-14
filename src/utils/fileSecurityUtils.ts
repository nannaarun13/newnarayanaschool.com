
// File type validation using magic numbers (file signatures)
const ALLOWED_FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 4096; // 4K max width/height

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFile?: File;
}

export const validateFileType = async (file: File): Promise<boolean> => {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  for (const [mimeType, signature] of Object.entries(ALLOWED_FILE_SIGNATURES)) {
    if (file.type === mimeType && signature.every((byte, index) => bytes[index] === byte)) {
      return true;
    }
  }
  return false;
};

export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

export const validateImageDimensions = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.width <= MAX_IMAGE_DIMENSION && img.height <= MAX_IMAGE_DIMENSION);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    
    img.src = url;
  });
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove dangerous characters and limit length
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100)
    .toLowerCase();
};

export const validateImageFile = async (file: File): Promise<FileValidationResult> => {
  // Check file size
  if (!validateFileSize(file)) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type by magic number
  if (!(await validateFileType(file))) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed',
    };
  }

  // Check image dimensions
  if (!(await validateImageDimensions(file))) {
    return {
      isValid: false,
      error: `Image dimensions exceed ${MAX_IMAGE_DIMENSION}px limit`,
    };
  }

  // Create sanitized file with safe name
  const sanitizedName = sanitizeFileName(file.name);
  const sanitizedFile = new File([file], sanitizedName, { type: file.type });

  return {
    isValid: true,
    sanitizedFile,
  };
};

export const createSecureImageUrl = (file: File): string => {
  // Create object URL for preview, but ensure it's cleaned up
  const url = URL.createObjectURL(file);
  
  // Auto-cleanup after 10 minutes to prevent memory leaks
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10 * 60 * 1000);
  
  return url;
};
