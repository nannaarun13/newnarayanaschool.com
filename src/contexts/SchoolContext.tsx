import React, { createContext, useContext, useReducer } from 'react';

// Define the data structure for a navigation item
export interface NavigationItem {
  name: string;
  path: string;
  visible: boolean;
}

// Define the structure for gallery images
export interface GalleryImage {
  id: string;
  url: string;
  altText: string;
}

// Define the structure for a notice
export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}

// Define the structure for an admission inquiry
export interface AdmissionInquiry {
  id: string;
  studentName: string;
  classApplied: string;
  previousClass: string;
  previousSchool: string;
  fatherName: string;
  motherName: string;
  primaryContact: string;
  secondaryContact: string;
  location: string;
  additionalInfo: string;
  submittedAt: string;
}

// Define the structure for contact messages
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  sentAt: string;
}

// Define the structure for the school data
export interface SchoolData {
  schoolName: string;
  schoolLogo: string;
	schoolNameImage: string;
  email: string;
  phone: string;
  address: string;
  navigationItems: NavigationItem[];
  galleryImages: GalleryImage[];
  notices: Notice[];
  welcomeMessage: string;
  aboutUsText: string;
  contactDetails: {
    address: string;
    phone: string;
    email: string;
  };
}

// Define the state structure for the school context
export interface SchoolState {
  data: SchoolData;
  admissionInquiries: AdmissionInquiry[];
  contactMessages: ContactMessage[];
  siteVisitors: number;
}

// Define the actions that can be dispatched to update the state
export type SchoolAction =
  | { type: 'SET_SCHOOL_DATA'; payload: SchoolData }
  | { type: 'ADD_GALLERY_IMAGE'; payload: GalleryImage }
  | { type: 'UPDATE_GALLERY_IMAGE'; payload: GalleryImage }
  | { type: 'DELETE_GALLERY_IMAGE'; payload: string }
  | { type: 'ADD_NOTICE'; payload: Notice }
  | { type: 'UPDATE_NOTICE'; payload: Notice }
  | { type: 'DELETE_NOTICE'; payload: string }
  | { type: 'ADD_ADMISSION_INQUIRY'; payload: AdmissionInquiry }
  | { type: 'ADD_CONTACT_MESSAGE'; payload: ContactMessage }
  | { type: 'INCREMENT_VISITORS' };

// Helper function to initialize gallery images with default data
const initializeGalleryImages = (): GalleryImage[] => [
  { id: '1', url: 'https://via.placeholder.com/300', altText: 'School Building' },
  { id: '2', url: 'https://via.placeholder.com/300', altText: 'Classroom' },
];

// Helper function to initialize notices with default data
const initializeNotices = (): Notice[] => [
  {
    id: '1',
    title: 'Admissions Open for 2024-2025',
    content: 'Admissions are now open for the academic year 2024-2025. Apply now!',
    date: new Date().toLocaleDateString(),
  },
  {
    id: '2',
    title: 'PTM Scheduled for July 20, 2024',
    content: 'Parent-Teacher Meeting is scheduled for July 20, 2024. Please make sure to attend.',
    date: new Date().toLocaleDateString(),
  },
];

// Default data for the school
export const defaultSchoolData: SchoolData = {
  schoolName: "NEW NARAYANA SCHOOL",
  schoolLogo: "https://via.placeholder.com/150",
	schoolNameImage: "",
  email: "info@newnarayanaschool.edu",
  phone: "+91 9999999999",
  address: "123 Education Street, Hyderabad, Telangana",
  navigationItems: [
    { name: "Home", path: "/", visible: true },
    { name: "About", path: "/about", visible: true },
    { name: "Admissions", path: "/admissions", visible: true },
    { name: "Gallery", path: "/gallery", visible: true },
    { name: "Notice Board", path: "/notice-board", visible: true },
    { name: "Contact", path: "/contact", visible: true },
		{ name: "Login", path: "/login", visible: true },
  ],
  galleryImages: initializeGalleryImages(),
  notices: initializeNotices(),
  welcomeMessage: "Welcome to New Narayana School!",
  aboutUsText: "New Narayana School is committed to providing quality education and fostering holistic development in students.",
  contactDetails: {
    address: "123 Education Street, Hyderabad, Telangana",
    phone: "+91 9999999999",
    email: "info@newnarayanaschool.edu",
  },
};

// Initial state for the school context
const initialState: SchoolState = {
  data: defaultSchoolData,
  admissionInquiries: [],
  contactMessages: [],
  siteVisitors: 0,
};

// Reducer function to handle state updates
const schoolReducer = (state: SchoolState, action: SchoolAction): SchoolState => {
  switch (action.type) {
    case 'SET_SCHOOL_DATA':
      return { ...state, data: action.payload };
    case 'ADD_GALLERY_IMAGE':
      return { ...state, data: { ...state.data, galleryImages: [...state.data.galleryImages, action.payload] } };
    case 'UPDATE_GALLERY_IMAGE':
      return {
        ...state,
        data: {
          ...state.data,
          galleryImages: state.data.galleryImages.map(image =>
            image.id === action.payload.id ? action.payload : image
          ),
        },
      };
    case 'DELETE_GALLERY_IMAGE':
      return {
        ...state,
        data: {
          ...state.data,
          galleryImages: state.data.galleryImages.filter(image => image.id !== action.payload),
        },
      };
    case 'ADD_NOTICE':
      return { ...state, data: { ...state.data, notices: [...state.data.notices, action.payload] } };
    case 'UPDATE_NOTICE':
      return {
        ...state,
        data: {
          ...state.data,
          notices: state.data.notices.map(notice =>
            notice.id === action.payload.id ? action.payload : notice
          ),
        },
      };
    case 'DELETE_NOTICE':
      return {
        ...state,
        data: {
          ...state.data,
          notices: state.data.notices.filter(notice => notice.id !== action.payload),
        },
      };
    case 'ADD_ADMISSION_INQUIRY':
      return { ...state, admissionInquiries: [...state.admissionInquiries, action.payload] };
    case 'ADD_CONTACT_MESSAGE':
      return { ...state, contactMessages: [...state.contactMessages, action.payload] };
    case 'INCREMENT_VISITORS':
      return { ...state, siteVisitors: state.siteVisitors + 1 };
    default:
      return state;
  }
};

// Create the school context
const SchoolContext = createContext<{
  state: SchoolState;
  dispatch: React.Dispatch<SchoolAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Create a custom hook to use the school context
export const useSchool = () => useContext(SchoolContext);

// Create a provider component to wrap the app and provide the school context
export const SchoolContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(schoolReducer, initialState);

  return (
    <SchoolContext.Provider value={{ state, dispatch }}>
      {children}
    </SchoolContext.Provider>
  );
};
