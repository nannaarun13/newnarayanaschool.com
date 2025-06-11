
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
  caption: string;
  category: string;
  date: string;
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
  presentClass: string;
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

// Define the structure for latest updates
export interface LatestUpdate {
  id: string;
  content: string;
  date: string;
}

// Define the structure for a founder
export interface Founder {
  id: string;
  name: string;
  details: string;
  image: string;
}

// Define the structure for contact information
export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  contactNumbers: Array<{id: string, number: string}>;
  location: {
    latitude: number;
    longitude: number;
  };
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
  welcomeImage: string;
  aboutUsText: string;
  aboutContent: string;
  missionStatement: string;
  visionStatement: string;
  contactDetails: {
    address: string;
    phone: string;
    email: string;
  };
  contactInfo: ContactInfo;
  latestUpdates: LatestUpdate[];
  founders: Founder[];
  schoolHistory: string;
  founderDetails: string;
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
  | { type: 'INCREMENT_VISITORS' }
  | { type: 'ADD_LATEST_UPDATE'; payload: LatestUpdate }
  | { type: 'DELETE_LATEST_UPDATE'; payload: string }
  | { type: 'ADD_FOUNDER'; payload: Founder }
  | { type: 'DELETE_FOUNDER'; payload: string };

// Helper function to initialize gallery images with default data
const initializeGalleryImages = (): GalleryImage[] => [
  { 
    id: '1', 
    url: 'https://via.placeholder.com/300', 
    altText: 'School Building', 
    caption: 'School Building',
    category: 'General',
    date: new Date().toLocaleDateString() 
  },
  { 
    id: '2', 
    url: 'https://via.placeholder.com/300', 
    altText: 'Classroom', 
    caption: 'Modern Classroom',
    category: 'Facilities',
    date: new Date().toLocaleDateString()
  },
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

// Helper function to initialize latest updates
const initializeLatestUpdates = (): LatestUpdate[] => [
  {
    id: '1',
    content: 'School reopens after summer vacation on June 15, 2024',
    date: new Date().toLocaleDateString(),
  },
  {
    id: '2',
    content: 'Annual Sports Day scheduled for August 10, 2024',
    date: new Date().toLocaleDateString(),
  },
];

// Helper function to initialize founders
const initializeFounders = (): Founder[] => [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    details: 'Founder and Chairman with over 30 years of experience in education',
    image: 'https://via.placeholder.com/150',
  },
];

// Default contact info
const defaultContactInfo: ContactInfo = {
  address: '123 Education Street, Hyderabad, Telangana',
  phone: '+91 9999999999',
  email: 'info@newnarayanaschool.edu',
  contactNumbers: [
    { id: '1', number: '+91 9999999999' },
    { id: '2', number: '+91 8888888888' }
  ],
  location: {
    latitude: 17.3092,
    longitude: 78.5095
  }
};

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
  welcomeImage: "https://via.placeholder.com/1200x600",
  aboutUsText: "New Narayana School is committed to providing quality education and fostering holistic development in students.",
  aboutContent: "Our school offers a comprehensive education focusing on academic excellence and character development.",
  missionStatement: "To provide quality education that develops each student's potential to thrive as a global citizen.",
  visionStatement: "To be a leading educational institution that empowers students to excel academically and contribute positively to society.",
  contactDetails: {
    address: "123 Education Street, Hyderabad, Telangana",
    phone: "+91 9999999999",
    email: "info@newnarayanaschool.edu",
  },
  contactInfo: defaultContactInfo,
  latestUpdates: initializeLatestUpdates(),
  founders: initializeFounders(),
  schoolHistory: "Founded in 1995, New Narayana School has been a pioneer in education for over two decades.",
  founderDetails: "Our founder envisioned an educational institution that would transform young minds into future leaders.",
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
        },
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
        },
      };
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
export const useSchool = () => {
  const context = useContext(SchoolContext);
  
  if (!context) {
    throw new Error('useSchool must be used within a SchoolContextProvider');
  }
  
  return context;
};

// Create a provider component to wrap the app and provide the school context
export const SchoolContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(schoolReducer, initialState);

  return (
    <SchoolContext.Provider value={{ state, dispatch }}>
      {children}
    </SchoolContext.Provider>
  );
};
