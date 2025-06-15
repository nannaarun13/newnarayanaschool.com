import { doc, getDoc, setDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SchoolData, GalleryImage } from '@/types';
import { defaultSchoolData } from '@/data/defaults';

const schoolConfigRef = () => doc(db, 'school', 'config');

export const getSchoolData = async (): Promise<SchoolData> => {
  const docSnap = await getDoc(schoolConfigRef());
  if (docSnap.exists()) {
    // Merge fetched data with defaults to ensure all properties are present
    return { ...defaultSchoolData, ...docSnap.data() };
  } else {
    // If no config exists in Firestore, create it with default data
    await setDoc(schoolConfigRef(), defaultSchoolData);
    return defaultSchoolData;
  }
};

export const updateSchoolData = async (data: Partial<SchoolData>): Promise<void> => {
  await updateDoc(schoolConfigRef(), data);
};

// Gallery-specific functions with improved error handling
export const addGalleryImage = async (image: GalleryImage): Promise<void> => {
  try {
    // New validation for missing fields
    if (
      !image ||
      !image.id ||
      !image.url ||
      typeof image.caption === "undefined" ||
      typeof image.category === "undefined" ||
      typeof image.date === "undefined"
    ) {
      console.error("addGalleryImage: missing required fields or bad image object", image);
      throw new Error("Invalid image data. Cannot save gallery image: " + JSON.stringify(image));
    }
    console.log('[addGalleryImage] Called with image:', image);

    const docSnap = await getDoc(schoolConfigRef());
    
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const currentGalleryImages = currentData.galleryImages || [];
      
      // Ensure we don't add duplicates
      const existingImage = currentGalleryImages.find((img: GalleryImage) => img.id === image.id);
      if (existingImage) {
        console.log('[addGalleryImage] Image already exists, skipping add operation');
        return;
      }
      
      const updatedGalleryImages = [...currentGalleryImages, image];
      
      await updateDoc(schoolConfigRef(), {
        galleryImages: updatedGalleryImages
      });
      
      console.log('[addGalleryImage] Gallery image successfully added to Firestore');
    } else {
      // Create the document with the new image
      await setDoc(schoolConfigRef(), {
        ...defaultSchoolData,
        galleryImages: [image]
      });
      console.log('[addGalleryImage] Created new school config with gallery image');
    }
  } catch (error) {
    console.error('[addGalleryImage] Error adding gallery image to Firestore:', error);
    throw error;
  }
};

export const removeGalleryImage = async (imageId: string): Promise<void> => {
  try {
    console.log('Removing gallery image from Firestore:', imageId);
    const docSnap = await getDoc(schoolConfigRef());
    
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const currentGalleryImages = currentData.galleryImages || [];
      const filteredImages = currentGalleryImages.filter((img: GalleryImage) => img.id !== imageId);
      
      await updateDoc(schoolConfigRef(), {
        galleryImages: filteredImages
      });
      
      console.log('Gallery image successfully removed from Firestore');
    }
  } catch (error) {
    console.error('Error removing gallery image from Firestore:', error);
    throw error;
  }
};

// Real-time subscription function
export const subscribeToSchoolData = (
  callback: (data: SchoolData) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return onSnapshot(
    schoolConfigRef(),
    (doc) => {
      if (doc.exists()) {
        // Merge with defaults to ensure all properties are present
        const data = { ...defaultSchoolData, ...doc.data() } as SchoolData;
        console.log('Received school data from Firestore:', {
          hasGalleryImages: !!data.galleryImages,
          galleryImagesCount: data.galleryImages?.length || 0
        });
        callback(data);
      } else {
        console.log('School config document does not exist, creating with defaults');
        // If document doesn't exist, create it with defaults
        setDoc(schoolConfigRef(), defaultSchoolData)
          .then(() => {
            console.log('Created default school config document');
            callback(defaultSchoolData);
          })
          .catch(onError || console.error);
      }
    },
    (error) => {
      console.error('Real-time subscription error:', error);
      if (onError) onError(error);
    }
  );
};
