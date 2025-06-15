import { SchoolState, SchoolAction } from '@/types';
import { updateSchoolData, addGalleryImage, removeGalleryImage } from '@/utils/schoolDataUtils';

// Reducer that relies on Firestore real-time updates for gallery changes
export const schoolReducer = (state: SchoolState, action: SchoolAction): SchoolState => {
  switch (action.type) {
    case 'SET_SCHOOL_DATA':
      return { 
        ...state, 
        data: {
          ...action.payload,
          galleryImages: action.payload.galleryImages || [],
        },
        loading: false 
      };
    case 'ADD_GALLERY_IMAGE':
      console.log('Dispatching ADD_GALLERY_IMAGE. Persisting to Firestore...');
      // Only trigger the Firestore update. The state will be updated by the real-time listener.
      addGalleryImage(action.payload).catch((error) => {
        console.error('Failed to save gallery image to Firestore:', error);
        // In a real app, you might dispatch an error action here to notify the user.
      });
      // Do not update state optimistically. Return the current state.
      return state;
    case 'REMOVE_GALLERY_IMAGE':
      console.log('Dispatching REMOVE_GALLERY_IMAGE. Persisting to Firestore...');
      // Only trigger the Firestore update. The state will be updated by the real-time listener.
      removeGalleryImage(action.payload).catch((error) => {
        console.error('Failed to remove gallery image from Firestore:', error);
      });
      // Do not update state optimistically. Return the current state.
      return state;
    case 'UPDATE_SCHOOL_DATA':
      const updatedData = { ...state.data, ...action.payload };
      // This is now deprecated for galleryImages, but kept for other partial updates
      updateSchoolData(action.payload).catch(console.error);
      return { ...state, data: updatedData };
    case 'ADD_NOTICE':
      return { 
        ...state, 
        data: { 
          ...state.data, 
          notices: [...state.data.notices, action.payload] 
        } 
      };
    case 'UPDATE_NOTICE':
      return {
        ...state,
        data: {
          ...state.data,
          notices: state.data.notices.map(notice =>
            notice.id === action.payload.id ? { ...notice, title: action.payload.title, content: action.payload.content } : notice
          ),
        }
      };
    case 'DELETE_NOTICE':
      return {
        ...state,
        data: {
          ...state.data,
          notices: state.data.notices.filter(notice => notice.id !== action.payload),
        }
      };
    case 'ADD_ADMISSION_INQUIRY':
      return { ...state, admissionInquiries: [...state.admissionInquiries, action.payload] };
    case 'ADD_CONTACT_MESSAGE':
      return { ...state, contactMessages: [...state.contactMessages, action.payload] };
    case 'INCREMENT_VISITORS':
      return { ...state, siteVisitors: state.siteVisitors + 1 };
    case 'ADD_LATEST_UPDATE':
      return { 
        ...state, 
        data: { 
          ...state.data, 
          latestUpdates: [...state.data.latestUpdates, action.payload] 
        } 
      };
    case 'DELETE_LATEST_UPDATE':
      return {
        ...state,
        data: {
          ...state.data,
          latestUpdates: state.data.latestUpdates.filter(update => update.id !== action.payload),
        }
      };
    case 'ADD_FOUNDER':
      return { 
        ...state, 
        data: { 
          ...state.data, 
          founders: [...state.data.founders, action.payload] 
        } 
      };
    case 'DELETE_FOUNDER':
      return {
        ...state,
        data: {
          ...state.data,
          founders: state.data.founders.filter(founder => founder.id !== action.payload),
        }
      };
    default:
      return state;
  }
};
