
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SchoolData, defaultSchoolData } from '@/contexts/SchoolContext';

const schoolConfigRef = () => doc(db, 'school', 'config');

// Queue for offline operations
let offlineQueue: Array<{ operation: 'update' | 'set', data: Partial<SchoolData> }> = [];
let isOnline = navigator.onLine;

// Monitor online/offline status
window.addEventListener('online', () => {
  isOnline = true;
  processOfflineQueue();
});

window.addEventListener('offline', () => {
  isOnline = false;
});

// Process queued operations when coming back online
const processOfflineQueue = async () => {
  console.log('Processing offline queue...');
  
  while (offlineQueue.length > 0) {
    const operation = offlineQueue.shift();
    if (!operation) continue;
    
    try {
      if (operation.operation === 'update') {
        await updateDoc(schoolConfigRef(), operation.data);
      } else {
        await setDoc(schoolConfigRef(), operation.data);
      }
      console.log('Offline operation synced successfully');
    } catch (error) {
      console.error('Failed to sync offline operation:', error);
      // Re-queue if failed
      offlineQueue.unshift(operation);
      break;
    }
  }
};

export const getSchoolData = async (): Promise<SchoolData> => {
  try {
    const docSnap = await getDoc(schoolConfigRef());
    if (docSnap.exists()) {
      // Merge fetched data with defaults to ensure all properties are present
      return { ...defaultSchoolData, ...docSnap.data() };
    } else {
      // If no config exists in Firestore, create it with default data
      await setDoc(schoolConfigRef(), defaultSchoolData);
      return defaultSchoolData;
    }
  } catch (error) {
    console.error('Failed to get school data:', error);
    // Fallback to localStorage
    try {
      const cachedData = localStorage.getItem('schoolData');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return { ...defaultSchoolData, ...parsedData };
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError);
    }
    return defaultSchoolData;
  }
};

export const updateSchoolData = async (data: Partial<SchoolData>): Promise<void> => {
  if (!isOnline) {
    console.log('Offline: queueing update operation');
    offlineQueue.push({ operation: 'update', data });
    return;
  }

  try {
    await updateDoc(schoolConfigRef(), data);
    console.log('School data updated successfully');
  } catch (error) {
    console.error('Failed to update school data:', error);
    // Queue for retry when back online
    offlineQueue.push({ operation: 'update', data });
    throw error;
  }
};

// Real-time subscription function with enhanced error handling
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
        console.log('Real-time update processed');
      } else {
        // If document doesn't exist, create it with defaults
        setDoc(schoolConfigRef(), defaultSchoolData)
          .then(() => {
            callback(defaultSchoolData);
            console.log('Created default school config');
          })
          .catch(error => {
            console.error('Failed to create default config:', error);
            if (onError) onError(error);
          });
      }
    },
    (error) => {
      console.error('Real-time subscription error:', error);
      if (onError) onError(error);
    }
  );
};

// Utility to check if data is synced
export const isDataSynced = (): boolean => {
  return isOnline && offlineQueue.length === 0;
};

// Force sync all pending operations
export const forceSyncData = async (): Promise<boolean> => {
  if (!isOnline) {
    console.log('Cannot force sync: offline');
    return false;
  }
  
  try {
    await processOfflineQueue();
    return true;
  } catch (error) {
    console.error('Force sync failed:', error);
    return false;
  }
};
