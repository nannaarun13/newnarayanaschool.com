
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GalleryImage } from '@/contexts/SchoolContext';

const galleryCollectionRef = () => collection(db, 'gallery');

export const addGalleryImageToDb = async (
  imageData: Omit<GalleryImage, 'id' | 'date'>
): Promise<string> => {
  const newImageData = {
    ...imageData,
    date: new Date().toISOString(),
  };
  const docRef = await addDoc(galleryCollectionRef(), newImageData);
  return docRef.id;
};

export const deleteGalleryImageFromDb = async (imageId: string): Promise<void> => {
  const docRef = doc(db, 'gallery', imageId);
  await deleteDoc(docRef);
};

export const subscribeToGalleryImages = (
  callback: (images: GalleryImage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(galleryCollectionRef(), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const images: GalleryImage[] = [];
      querySnapshot.forEach((doc) => {
        images.push({ id: doc.id, ...doc.data() } as GalleryImage);
      });
      callback(images);
    },
    (error) => {
      console.error('Gallery subscription error:', error);
      if (onError) onError(error);
    }
  );
};
