
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SchoolData } from '@/types';
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
        callback(data);
      } else {
        // If document doesn't exist, create it with defaults
        setDoc(schoolConfigRef(), defaultSchoolData)
          .then(() => callback(defaultSchoolData))
          .catch(onError || console.error);
      }
    },
    (error) => {
      console.error('Real-time subscription error:', error);
      if (onError) onError(error);
    }
  );
};
