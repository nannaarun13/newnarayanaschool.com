
import { SchoolState, SchoolAction } from '@/types';
import { updateSchoolData } from '@/utils/schoolDataUtils';

// Enhanced reducer with optimistic updates
export const schoolReducer = (state: SchoolState, action: SchoolAction): SchoolState => {
  switch (action.type) {
    case 'SET_SCHOOL_DATA':
      return { 
        ...state, 
        data: action.payload, 
        galleryImages: action.payload.galleryImages || [],
        loading: false 
      };
    case 'SET_GALLERY_IMAGES':
      return { ...state, galleryImages: action.payload };
    case 'ADD_GALLERY_IMAGE':
      // Update both local state and Firestore
      const newGalleryImages = [...state.galleryImages, action.payload];
      const updatedDataWithNewImage = {
        ...state.data,
        galleryImages: newGalleryImages
      };
      // Save to Firestore
      updateSchoolData({ galleryImages: newGalleryImages }).catch(console.error);
      return { 
        ...state, 
        galleryImages: newGalleryImages,
        data: updatedDataWithNewImage
      };
    case 'REMOVE_GALLERY_IMAGE':
      // Update both local state and Firestore
      const filteredGalleryImages = state.galleryImages.filter(img => img.id !== action.payload);
      const updatedDataWithRemovedImage = {
        ...state.data,
        galleryImages: filteredGalleryImages
      };
      // Save to Firestore
      updateSchoolData({ galleryImages: filteredGalleryImages }).catch(console.error);
      return { 
        ...state, 
        galleryImages: filteredGalleryImages,
        data: updatedDataWithRemovedImage
      };
    case 'UPDATE_SCHOOL_DATA':
      const updatedData = { ...state.data, ...action.payload };
      // Save to Firestore
      updateSchoolData(action.payload).catch(console.error);
      return { ...state, data: updatedData };
    case 'ADD_NOTICE':
      const updatedNotices = [...state.data.notices, action.payload];
      const dataWithNewNotice = { ...state.data, notices: updatedNotices };
      updateSchoolData({ notices: updatedNotices }).catch(console.error);
      return { ...state, data: dataWithNewNotice };
    case 'UPDATE_NOTICE':
      const updatedNoticesList = state.data.notices.map(notice =>
        notice.id === action.payload.id ? { ...notice, title: action.payload.title, content: action.payload.content } : notice
      );
      const dataWithUpdatedNotice = { ...state.data, notices: updatedNoticesList };
      updateSchoolData({ notices: updatedNoticesList }).catch(console.error);
      return { ...state, data: dataWithUpdatedNotice };
    case 'DELETE_NOTICE':
      const filteredNotices = state.data.notices.filter(notice => notice.id !== action.payload);
      const dataWithDeletedNotice = { ...state.data, notices: filteredNotices };
      updateSchoolData({ notices: filteredNotices }).catch(console.error);
      return { ...state, data: dataWithDeletedNotice };
    case 'ADD_ADMISSION_INQUIRY':
      return { ...state, admissionInquiries: [...state.admissionInquiries, action.payload] };
    case 'ADD_CONTACT_MESSAGE':
      return { ...state, contactMessages: [...state.contactMessages, action.payload] };
    case 'INCREMENT_VISITORS':
      return { ...state, siteVisitors: state.siteVisitors + 1 };
    case 'ADD_LATEST_UPDATE':
      const updatedLatestUpdates = [...state.data.latestUpdates, action.payload];
      const dataWithNewUpdate = { ...state.data, latestUpdates: updatedLatestUpdates };
      updateSchoolData({ latestUpdates: updatedLatestUpdates }).catch(console.error);
      return { ...state, data: dataWithNewUpdate };
    case 'DELETE_LATEST_UPDATE':
      const filteredUpdates = state.data.latestUpdates.filter(update => update.id !== action.payload);
      const dataWithDeletedUpdate = { ...state.data, latestUpdates: filteredUpdates };
      updateSchoolData({ latestUpdates: filteredUpdates }).catch(console.error);
      return { ...state, data: dataWithDeletedUpdate };
    case 'ADD_FOUNDER':
      const updatedFounders = [...state.data.founders, action.payload];
      const dataWithNewFounder = { ...state.data, founders: updatedFounders };
      updateSchoolData({ founders: updatedFounders }).catch(console.error);
      return { ...state, data: dataWithNewFounder };
    case 'DELETE_FOUNDER':
      const filteredFounders = state.data.founders.filter(founder => founder.id !== action.payload);
      const dataWithDeletedFounder = { ...state.data, founders: filteredFounders };
      updateSchoolData({ founders: filteredFounders }).catch(console.error);
      return { ...state, data: dataWithDeletedFounder };
    default:
      return state;
  }
};
