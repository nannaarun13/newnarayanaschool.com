
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  console.log('Starting image compression...');
  const compressionStartTime = Date.now();
  
  const compressedFile = await imageCompression(file, options);
  
  const compressionEndTime = Date.now();
  console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Image compression took ${compressionEndTime - compressionStartTime} ms.`);

  return compressedFile;
};

export const uploadImageToStorage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    console.log('Starting upload to Firebase Storage...');
    const uploadStartTime = Date.now();

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress.toFixed(0)}% done`);
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      async () => {
        const uploadEndTime = Date.now();
        console.log(`Upload to Firebase Storage took ${uploadEndTime - uploadStartTime} ms.`);
        
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          console.error("Error getting download URL:", error);
          reject(error);
        }
      }
    );
  });
};
