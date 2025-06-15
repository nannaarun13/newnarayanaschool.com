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
      console.log('ADD_GALLERY_IMAGE action dispatched, but the async logic is now handled directly in the component for better UX. State will be updated by the listener.');
      // The async logic has been moved to the component. State is updated by the real-time listener.
      return state;
    case 'REMOVE_GALLERY_IMAGE':
      console.log('REMOVE_GALLERY_IMAGE action dispatched, but the async logic is now handled directly in the component for better UX. State will be updated by the listener.');
      // The async logic has been moved to the component. State is updated by the real-time listener.
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
