import { SchoolState, SchoolAction } from '@/types';
import { updateSchoolData, addGalleryImage, removeGalleryImage } from '@/utils/schoolDataUtils';

// Enhanced reducer with optimistic updates
export const schoolReducer = (state: SchoolState, action: SchoolAction): SchoolState => {
  switch (action.type) {
    case 'SET_SCHOOL_DATA':
      console.log('Setting school data with gallery images:', action.payload.galleryImages);
      return { 
        ...state, 
        data: action.payload, 
        galleryImages: action.payload.galleryImages || [],
        loading: false 
      };
    case 'SET_GALLERY_IMAGES':
      console.log('Setting gallery images:', action.payload);
      return { 
        ...state, 
        galleryImages: action.payload,
        data: {
          ...state.data,
          galleryImages: action.payload
        }
      };
    case 'ADD_GALLERY_IMAGE':
      console.log('Adding gallery image:', action.payload);
      // Save to Firestore immediately
      addGalleryImage(action.payload).then(() => {
        console.log('Gallery image saved to Firestore successfully');
      }).catch((error) => {
        console.error('Failed to save gallery image to Firestore:', error);
      });
      
      const newGalleryImages = [...state.galleryImages, action.payload];
      return { 
        ...state, 
        galleryImages: newGalleryImages,
        data: {
          ...state.data,
          galleryImages: newGalleryImages
        }
      };
    case 'REMOVE_GALLERY_IMAGE':
      console.log('Removing gallery image:', action.payload);
      // Remove from Firestore immediately
      removeGalleryImage(action.payload).then(() => {
        console.log('Gallery image removed from Firestore successfully');
      }).catch((error) => {
        console.error('Failed to remove gallery image from Firestore:', error);
      });
      
      const filteredImages = state.galleryImages.filter(img => img.id !== action.payload);
      return { 
        ...state, 
        galleryImages: filteredImages,
        data: {
          ...state.data,
          galleryImages: filteredImages
        }
      };
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
