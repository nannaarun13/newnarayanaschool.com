
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SchoolData, defaultSchoolData } from '@/contexts/SchoolContext';

const schoolConfigRef = () => doc(db, 'school', 'config');

// Enhanced data persistence with retry mechanism
export const getSchoolData = async (): Promise<SchoolData> => {
  try {
    const docSnap = await getDoc(schoolConfigRef());
    if (docSnap.exists()) {
      const data = { ...defaultSchoolData, ...docSnap.data() };
      // Always cache the latest data
      localStorage.setItem('schoolData', JSON.stringify(data));
      return data;
    } else {
      // If no config exists in Firestore, create it with default data
      await setDoc(schoolConfigRef(), defaultSchoolData);
      localStorage.setItem('schoolData', JSON.stringify(defaultSchoolData));
      return defaultSchoolData;
    }
  } catch (error) {
    console.error('Error fetching school data:', error);
    // Return cached data if available, otherwise return defaults
    const cachedData = localStorage.getItem('schoolData');
    if (cachedData) {
      try {
        return { ...defaultSchoolData, ...JSON.parse(cachedData) };
      } catch {
        return defaultSchoolData;
      }
    }
    return defaultSchoolData;
  }
};

// Enhanced update with local caching and retry
export const updateSchoolData = async (data: Partial<SchoolData>): Promise<void> => {
  try {
    // Update Firestore first
    await updateDoc(schoolConfigRef(), data);
    
    // Update local cache on successful write
    const currentCache = localStorage.getItem('schoolData');
    const cachedData = currentCache ? JSON.parse(currentCache) : defaultSchoolData;
    const updatedCache = { ...cachedData, ...data };
    localStorage.setItem('schoolData', JSON.stringify(updatedCache));
    
    console.log('School data updated successfully');
  } catch (error) {
    console.error('Failed to update school data:', error);
    
    // Store in pending updates queue for retry
    const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
    pendingUpdates.push({ data, timestamp: Date.now() });
    localStorage.setItem('pendingUpdates', JSON.stringify(pendingUpdates));
    
    // Still update local cache optimistically
    const currentCache = localStorage.getItem('schoolData');
    const cachedData = currentCache ? JSON.parse(currentCache) : defaultSchoolData;
    const updatedCache = { ...cachedData, ...data };
    localStorage.setItem('schoolData', JSON.stringify(updatedCache));
    
    throw error;
  }
};

// Process pending updates when connection is restored
export const processPendingUpdates = async (): Promise<void> => {
  const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
  
  if (pendingUpdates.length === 0) return;
  
  console.log(`Processing ${pendingUpdates.length} pending updates...`);
  
  for (const update of pendingUpdates) {
    try {
      await updateDoc(schoolConfigRef(), update.data);
      console.log('Pending update processed successfully');
    } catch (error) {
      console.error('Failed to process pending update:', error);
      // Keep failed updates in queue
      return;
    }
  }
  
  // Clear processed updates
  localStorage.removeItem('pendingUpdates');
  console.log('All pending updates processed');
};

// Real-time subscription with enhanced error handling and caching
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
        
        // Cache the data locally
        localStorage.setItem('schoolData', JSON.stringify(data));
        
        callback(data);
        
        // Process any pending updates when connection is restored
        processPendingUpdates().catch(console.error);
      } else {
        // If document doesn't exist, create it with defaults
        setDoc(schoolConfigRef(), defaultSchoolData)
          .then(() => {
            localStorage.setItem('schoolData', JSON.stringify(defaultSchoolData));
            callback(defaultSchoolData);
          })
          .catch(onError || console.error);
      }
    },
    (error) => {
      console.error('Real-time subscription error:', error);
      
      // Fallback to cached data
      const cachedData = localStorage.getItem('schoolData');
      if (cachedData) {
        try {
          const data = { ...defaultSchoolData, ...JSON.parse(cachedData) };
          callback(data);
        } catch (parseError) {
          console.error('Failed to parse cached data:', parseError);
          callback(defaultSchoolData);
        }
      } else {
        callback(defaultSchoolData);
      }
      
      if (onError) onError(error);
    }
  );
};
