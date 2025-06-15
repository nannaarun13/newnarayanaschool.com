
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SchoolData, defaultSchoolData } from '@/contexts/SchoolContext';

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
