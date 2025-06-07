
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface SchoolData {
  schoolName: string;
  schoolLogo: string;
  welcomeMessage: string;
  welcomeImage: string;
  latestUpdates: string[];
  schoolHistory: string;
  yearEstablished: string;
  educationalSociety: string;
  founderDetails: string;
  founderImages: string[];
  contactInfo: {
    address: string;
    email: string;
    phone: string;
    mapEmbed: string;
  };
  navigationItems: Array<{
    name: string;
    path: string;
    visible: boolean;
  }>;
  notices: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
  }>;
  galleryImages: Array<{
    id: string;
    url: string;
    caption: string;
    date: string;
  }>;
  admissionInquiries: Array<{
    id: string;
    studentName: string;
    classApplied: string;
    fatherName: string;
    motherName: string;
    primaryContact: string;
    submittedDate: string;
    [key: string]: any;
  }>;
}

interface SchoolState {
  data: SchoolData;
  isAdmin: boolean;
  currentUser: any;
}

const initialState: SchoolState = {
  data: {
    schoolName: "New Narayana School",
    schoolLogo: "/placeholder.svg",
    welcomeMessage: "Welcome to New Narayana School - Nurturing Excellence in Education",
    welcomeImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    latestUpdates: [
      "Admission Open for Academic Year 2024-25",
      "Annual Sports Day scheduled for December 15th",
      "Parent-Teacher Meeting on November 30th"
    ],
    schoolHistory: "Established in 1995, New Narayana School has been a beacon of quality education, fostering academic excellence and character development for over 25 years.",
    yearEstablished: "1995",
    educationalSociety: "Narayana Educational Society",
    founderDetails: "Founded by Dr. P. Narayana with a vision to provide world-class education accessible to all.",
    founderImages: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"],
    contactInfo: {
      address: "123 Education Street, Knowledge City, State - 123456",
      email: "info@newnarayanaschool.edu",
      phone: "+91 98765 43210",
      mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.123456789!2d-74.123456789!3d40.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x123456789abcdef%3A0x123456789abcdef!2sSchool!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
    },
    navigationItems: [
      { name: "Home", path: "/", visible: true },
      { name: "About Us", path: "/about", visible: true },
      { name: "Admissions", path: "/admissions", visible: true },
      { name: "Gallery", path: "/gallery", visible: true },
      { name: "Notice Board", path: "/notice-board", visible: true },
      { name: "Contact Us", path: "/contact", visible: true },
      { name: "Login", path: "/login", visible: true }
    ],
    notices: [
      {
        id: "1",
        title: "Admission Open",
        content: "Admissions are now open for the academic year 2024-25. Please visit the admissions office for more details.",
        date: "2024-01-15"
      }
    ],
    galleryImages: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
        caption: "School Building",
        date: "2024-01-01"
      }
    ],
    admissionInquiries: []
  },
  isAdmin: false,
  currentUser: null
};

type SchoolAction = 
  | { type: 'UPDATE_SCHOOL_DATA'; payload: Partial<SchoolData> }
  | { type: 'SET_ADMIN'; payload: { isAdmin: boolean; user: any } }
  | { type: 'ADD_NOTICE'; payload: any }
  | { type: 'UPDATE_NOTICE'; payload: { id: string; notice: any } }
  | { type: 'DELETE_NOTICE'; payload: string }
  | { type: 'ADD_GALLERY_IMAGE'; payload: any }
  | { type: 'DELETE_GALLERY_IMAGE'; payload: string }
  | { type: 'ADD_ADMISSION_INQUIRY'; payload: any }
  | { type: 'DELETE_ADMISSION_INQUIRY'; payload: string }
  | { type: 'LOAD_PERSISTED_DATA'; payload: SchoolData }
  | { type: 'CLEANUP_OLD_INQUIRIES' };

function schoolReducer(state: SchoolState, action: SchoolAction): SchoolState {
  let newState: SchoolState;
  
  switch (action.type) {
    case 'LOAD_PERSISTED_DATA':
      newState = {
        ...state,
        data: { ...state.data, ...action.payload }
      };
      break;
    case 'UPDATE_SCHOOL_DATA':
      newState = {
        ...state,
        data: { ...state.data, ...action.payload }
      };
      break;
    case 'SET_ADMIN':
      newState = {
        ...state,
        isAdmin: action.payload.isAdmin,
        currentUser: action.payload.user
      };
      break;
    case 'ADD_NOTICE':
      newState = {
        ...state,
        data: {
          ...state.data,
          notices: [action.payload, ...state.data.notices]
        }
      };
      break;
    case 'UPDATE_NOTICE':
      newState = {
        ...state,
        data: {
          ...state.data,
          notices: state.data.notices.map(notice =>
            notice.id === action.payload.id ? { ...notice, ...action.payload.notice } : notice
          )
        }
      };
      break;
    case 'DELETE_NOTICE':
      newState = {
        ...state,
        data: {
          ...state.data,
          notices: state.data.notices.filter(notice => notice.id !== action.payload)
        }
      };
      break;
    case 'ADD_GALLERY_IMAGE':
      newState = {
        ...state,
        data: {
          ...state.data,
          galleryImages: [action.payload, ...state.data.galleryImages]
        }
      };
      break;
    case 'DELETE_GALLERY_IMAGE':
      newState = {
        ...state,
        data: {
          ...state.data,
          galleryImages: state.data.galleryImages.filter(img => img.id !== action.payload)
        }
      };
      break;
    case 'ADD_ADMISSION_INQUIRY':
      newState = {
        ...state,
        data: {
          ...state.data,
          admissionInquiries: [action.payload, ...state.data.admissionInquiries]
        }
      };
      break;
    case 'DELETE_ADMISSION_INQUIRY':
      newState = {
        ...state,
        data: {
          ...state.data,
          admissionInquiries: state.data.admissionInquiries.filter(inquiry => inquiry.id !== action.payload)
        }
      };
      break;
    case 'CLEANUP_OLD_INQUIRIES':
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      newState = {
        ...state,
        data: {
          ...state.data,
          admissionInquiries: state.data.admissionInquiries.filter(inquiry => {
            const inquiryDate = new Date(inquiry.submittedDate);
            return inquiryDate > sixMonthsAgo;
          })
        }
      };
      break;
    default:
      return state;
  }

  // Persist to localStorage
  localStorage.setItem('schoolData', JSON.stringify(newState.data));
  return newState;
}

const SchoolContext = createContext<{
  state: SchoolState;
  dispatch: React.Dispatch<SchoolAction>;
} | null>(null);

export function SchoolContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(schoolReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    try {
      const persistedData = localStorage.getItem('schoolData');
      if (persistedData) {
        const parsedData = JSON.parse(persistedData);
        dispatch({ type: 'LOAD_PERSISTED_DATA', payload: parsedData });
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }

    // Cleanup old inquiries on mount
    dispatch({ type: 'CLEANUP_OLD_INQUIRIES' });
  }, []);

  // Auto-cleanup old inquiries daily
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CLEANUP_OLD_INQUIRIES' });
    }, 24 * 60 * 60 * 1000); // Run daily

    return () => clearInterval(interval);
  }, []);

  return (
    <SchoolContext.Provider value={{ state, dispatch }}>
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolContextProvider');
  }
  return context;
}
