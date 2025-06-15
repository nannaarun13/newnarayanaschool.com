
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Unsubscribe } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { SchoolState, SchoolAction } from '@/types';
import { defaultSchoolData } from '@/data/defaults';
import { schoolReducer } from '@/reducers/schoolReducer';
import { subscribeToSchoolData } from '@/utils/schoolDataUtils';

const initialState: SchoolState = {
  data: defaultSchoolData,
  galleryImages: defaultSchoolData.galleryImages || [],
  admissionInquiries: [],
  contactMessages: [],
  siteVisitors: 0,
  loading: true,
};

// Create the school context
const SchoolContext = createContext<{
  state: SchoolState;
  dispatch: React.Dispatch<SchoolAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const useSchool = () => {
  const context = useContext(SchoolContext);
  
  if (!context) {
    throw new Error('useSchool must be used within a SchoolContextProvider');
  }
  
  return context;
};

export const SchoolContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(schoolReducer, initialState);
  const unsubscribeSchoolDataRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    console.log('Setting up real-time listener for school data...');
    
    // Set up real-time listener for main school data (including gallery)
    unsubscribeSchoolDataRef.current = subscribeToSchoolData(
      (data) => {
        console.log('Real-time data update received:', data);
        dispatch({ type: 'SET_SCHOOL_DATA', payload: data });
      },
      (error) => {
        console.error("Real-time subscription error:", error);
        dispatch({ type: 'SET_SCHOOL_DATA', payload: defaultSchoolData });
      }
    );

    // Cleanup function
    return () => {
      if (unsubscribeSchoolDataRef.current) {
        console.log('Cleaning up real-time listener for school data...');
        unsubscribeSchoolDataRef.current();
      }
    };
  }, []);

  if (state.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-school-blue" />
          <p className="text-lg text-gray-700">Loading School Data...</p>
        </div>
      </div>
    );
  }

  return (
    <SchoolContext.Provider value={{ state, dispatch }}>
      {children}
    </SchoolContext.Provider>
  );
};
