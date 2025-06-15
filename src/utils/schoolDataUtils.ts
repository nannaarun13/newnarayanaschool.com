
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SchoolData, defaultSchoolData } from '@/contexts/SchoolContext';

const schoolConfigRef = () => doc(db, 'school', 'config');

// Initialize school config if it doesn't exist
export const initializeSchoolConfig = async (): Promise<void> => {
  try {
    const docSnap = await getDoc(schoolConfigRef());
    if (!docSnap.exists()) {
      console.log('Initializing school config with default data...');
      await setDoc(schoolConfigRef(), defaultSchoolData);
      console.log('School config initialized successfully');
    }
  } catch (error: any) {
    console.error('Error initializing school config:', error);
    // Don't throw error - this is optional initialization
  }
};

// Enhanced data retrieval with initialization
export const getSchoolData = async (): Promise<SchoolData> => {
  try {
    const docSnap = await getDoc(schoolConfigRef());
    if (docSnap.exists()) {
      const data = { ...defaultSchoolData, ...docSnap.data() };
      localStorage.setItem('schoolData', JSON.stringify(data));
      return data;
    } else {
      // Try to initialize the config
      await initializeSchoolConfig();
      localStorage.setItem('schoolData', JSON.stringify(defaultSchoolData));
      return defaultSchoolData;
    }
  } catch (error: any) {
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

// Enhanced update with authentication check
export const updateSchoolData = async (data: Partial<SchoolData>): Promise<void> => {
  try {
    const { auth } = await import('@/lib/firebase');
    if (!auth.currentUser) {
      throw new Error('Authentication required for updates');
    }

    console.log('Updating school data with authenticated user:', auth.currentUser.email);
    
    // Update Firestore
    await updateDoc(schoolConfigRef(), data);
    
    // Update local cache
    const currentCache = localStorage.getItem('schoolData');
    const cachedData = currentCache ? JSON.parse(currentCache) : defaultSchoolData;
    const updatedCache = { ...cachedData, ...data };
    localStorage.setItem('schoolData', JSON.stringify(updatedCache));
    
    console.log('School data updated successfully');
  } catch (error: any) {
    console.error('Failed to update school data:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to update school data. Please ensure you are logged in as an approved admin.');
    }
    
    if (error.message === 'Authentication required for updates') {
      throw new Error('Please log in as an admin to make changes.');
    }
    
    throw error;
  }
};

// Enhanced real-time subscription
export const subscribeToSchoolData = (
  callback: (data: SchoolData) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return onSnapshot(
    schoolConfigRef(),
    (doc) => {
      if (doc.exists()) {
        const data = { ...defaultSchoolData, ...doc.data() } as SchoolData;
        localStorage.setItem('schoolData', JSON.stringify(data));
        callback(data);
      } else {
        // Try to initialize if user is authenticated
        const initializeIfAuthenticated = async () => {
          try {
            const { auth } = await import('@/lib/firebase');
            if (auth.currentUser) {
              await initializeSchoolConfig();
            }
            localStorage.setItem('schoolData', JSON.stringify(defaultSchoolData));
            callback(defaultSchoolData);
          } catch (error: any) {
            console.error('Failed to initialize document:', error);
            callback(defaultSchoolData);
            if (onError) onError(error);
          }
        };
        
        initializeIfAuthenticated();
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
