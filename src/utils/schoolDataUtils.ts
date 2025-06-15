
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SchoolData, defaultSchoolData } from '@/contexts/SchoolContext';

const schoolConfigRef = () => doc(db, 'school', 'config');

// Enhanced data persistence with retry mechanism and permission handling
export const getSchoolData = async (): Promise<SchoolData> => {
  try {
    const docSnap = await getDoc(schoolConfigRef());
    if (docSnap.exists()) {
      const data = { ...defaultSchoolData, ...docSnap.data() };
      // Always cache the latest data
      localStorage.setItem('schoolData', JSON.stringify(data));
      return data;
    } else {
      // If no config exists in Firestore, try to create it with default data
      console.log('School config not found, attempting to initialize...');
      try {
        await setDoc(schoolConfigRef(), defaultSchoolData);
        localStorage.setItem('schoolData', JSON.stringify(defaultSchoolData));
        console.log('School config initialized successfully');
        return defaultSchoolData;
      } catch (initError: any) {
        console.warn('Failed to initialize school config (possibly due to permissions):', initError);
        // Still cache and return default data for public access
        localStorage.setItem('schoolData', JSON.stringify(defaultSchoolData));
        return defaultSchoolData;
      }
    }
  } catch (error: any) {
    console.error('Error fetching school data:', error);
    
    // Handle specific permission errors gracefully
    if (error.code === 'permission-denied') {
      console.log('Permission denied, using cached or default data');
    }
    
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

// Enhanced update with authentication check and better error handling
export const updateSchoolData = async (data: Partial<SchoolData>): Promise<void> => {
  try {
    // Check if user is authenticated before attempting update
    const { auth } = await import('@/lib/firebase');
    if (!auth.currentUser) {
      throw new Error('Authentication required for updates');
    }

    console.log('Updating school data with authenticated user:', auth.currentUser.email);
    
    // Update Firestore first
    await updateDoc(schoolConfigRef(), data);
    
    // Update local cache on successful write
    const currentCache = localStorage.getItem('schoolData');
    const cachedData = currentCache ? JSON.parse(currentCache) : defaultSchoolData;
    const updatedCache = { ...cachedData, ...data };
    localStorage.setItem('schoolData', JSON.stringify(updatedCache));
    
    console.log('School data updated successfully');
  } catch (error: any) {
    console.error('Failed to update school data:', error);
    
    // Handle specific error types
    if (error.code === 'permission-denied') {
      console.error('Permission denied: User may not be an approved admin');
      throw new Error('You do not have permission to update school data. Please ensure you are logged in as an approved admin.');
    }
    
    if (error.message === 'Authentication required for updates') {
      throw new Error('Please log in as an admin to make changes.');
    }
    
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
  
  // Check authentication before processing
  const { auth } = await import('@/lib/firebase');
  if (!auth.currentUser) {
    console.log('No authenticated user, keeping updates pending');
    return;
  }
  
  const successfulUpdates: number[] = [];
  
  for (let i = 0; i < pendingUpdates.length; i++) {
    const update = pendingUpdates[i];
    try {
      await updateDoc(schoolConfigRef(), update.data);
      console.log('Pending update processed successfully');
      successfulUpdates.push(i);
    } catch (error: any) {
      console.error('Failed to process pending update:', error);
      if (error.code === 'permission-denied') {
        console.error('Permission denied during sync - user may not be admin');
        break; // Stop processing if permissions are denied
      }
    }
  }
  
  // Remove only successfully processed updates
  if (successfulUpdates.length > 0) {
    const remainingUpdates = pendingUpdates.filter((_, index) => !successfulUpdates.includes(index));
    if (remainingUpdates.length === 0) {
      localStorage.removeItem('pendingUpdates');
      console.log('All pending updates processed successfully');
    } else {
      localStorage.setItem('pendingUpdates', JSON.stringify(remainingUpdates));
      console.log(`${successfulUpdates.length} updates processed, ${remainingUpdates.length} remaining`);
    }
  }
};

// Enhanced real-time subscription with better error handling
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
        
        // Process any pending updates when connection is restored and user is authenticated
        processPendingUpdates().catch(error => {
          console.error('Error processing pending updates:', error);
        });
      } else {
        // Document doesn't exist - try to initialize if user is authenticated
        const initializeIfAuthenticated = async () => {
          try {
            const { auth } = await import('@/lib/firebase');
            if (auth.currentUser) {
              console.log('Document not found, attempting to initialize as authenticated user');
              await setDoc(schoolConfigRef(), defaultSchoolData);
              localStorage.setItem('schoolData', JSON.stringify(defaultSchoolData));
              callback(defaultSchoolData);
            } else {
              console.log('Document not found, using defaults for unauthenticated access');
              localStorage.setItem('schoolData', JSON.stringify(defaultSchoolData));
              callback(defaultSchoolData);
            }
          } catch (error: any) {
            console.error('Failed to initialize document:', error);
            // Use cached or default data
            const cachedData = localStorage.getItem('schoolData');
            if (cachedData) {
              try {
                const data = { ...defaultSchoolData, ...JSON.parse(cachedData) };
                callback(data);
              } catch {
                callback(defaultSchoolData);
              }
            } else {
              callback(defaultSchoolData);
            }
            if (onError) onError(error);
          }
        };
        
        initializeIfAuthenticated();
      }
    },
    (error) => {
      console.error('Real-time subscription error:', error);
      
      // Handle permission denied gracefully for public users
      if (error.code === 'permission-denied') {
        console.log('Permission denied for real-time updates, using cached data');
      }
      
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
