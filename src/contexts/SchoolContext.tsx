import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface Founder {
  id: string;
  name: string;
  image: string;
  details: string;
}

interface LatestUpdate {
  id: string;
  content: string;
  date: string;
}

interface ContactNumber {
  id: string;
  label: string;
  number: string;
}

interface NavigationItem {
  name: string;
  path: string;
  visible: boolean;
}

interface SchoolData {
  schoolName: string;
  schoolLogo: string;
  schoolNameImage: string;
  welcomeMessage: string;
  welcomeImage: string;
  schoolHistory: string;
  yearEstablished: string;
  educationalSociety: string;
  educationalSocietyContent: string;
  founderDetails: string;
  founders: Founder[];
  founderImages: string[];
  aboutContent: string;
  missionStatement: string;
  visionStatement: string;
  navigationItems: NavigationItem[];
  galleryImages: Array<{
    id: string;
    url: string;
    caption: string;
    date: string;
    category: 'general' | 'event' | 'festivals' | 'activities';
  }>;
  notices: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
  }>;
  latestUpdates: LatestUpdate[];
  contactInfo: {
    address: string;
    email: string;
    phone: string;
    contactNumbers: ContactNumber[];
    mapEmbed: string;
  };
}

interface SchoolState {
  data: SchoolData;
  admissionInquiries: Array<{
    id: string;
    studentName: string;
    classApplied: string;
    presentClass: string;
    previousClass: string;
    previousSchool: string;
    fatherName: string;
    motherName: string;
    primaryContact: string;
    secondaryContact: string;
    location: string;
    additionalInfo: string;
    submittedAt: string;
  }>;
  siteVisitors: number;
  isAdmin?: boolean;
  currentUser?: any;
}

const initialState: SchoolState = {
  data: {
    schoolName: "New Narayana School",
    schoolLogo: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=200&h=200&fit=crop&crop=center",
    schoolNameImage: "",
    welcomeMessage: "Welcome to New Narayana School - Nurturing Excellence in Education",
    welcomeImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop",
    schoolHistory: "Established in 2023, our school has been committed to providing quality education and nurturing young minds. We believe in holistic development and creating future leaders.",
    yearEstablished: "2023",
    educationalSociety: "Narayana Educational Society",
    educationalSocietyContent: "We are proudly affiliated with the Narayana Educational Society, which has been dedicated to promoting quality education and holistic development of students.",
    founderDetails: "Our founder envisioned a school that would provide world-class education while maintaining traditional values.",
    aboutContent: "New Narayana School is dedicated to providing quality education and fostering the overall development of our students. We believe in creating an environment where every child can thrive and reach their full potential.",
    missionStatement: "To provide quality education that develops critical thinking, creativity, and character in our students, preparing them to be responsible global citizens.",
    visionStatement: "To be a leading educational institution that inspires excellence, innovation, and integrity in every student.",
    founders: [
      {
        id: "1",
        name: "Dr. John Smith",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
        details: "Dr. John Smith founded our institution with a vision to provide quality education accessible to all."
      }
    ],
    founderImages: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    ],
    navigationItems: [
      { name: "Home", path: "/", visible: true },
      { name: "About Us", path: "/about", visible: true },
      { name: "Admissions", path: "/admissions", visible: true },
      { name: "Gallery", path: "/gallery", visible: true },
      { name: "Notice Board", path: "/notice-board", visible: true },
      { name: "Contact Us", path: "/contact", visible: true }
    ],
    galleryImages: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
        caption: "Our beautiful campus",
        date: "2024-01-15",
        category: "general"
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=600&fit=crop",
        caption: "Students in classroom",
        date: "2024-01-20",
        category: "activities"
      }
    ],
    notices: [
      {
        id: "1",
        title: "School Reopening Notice",
        content: "School will reopen on January 15th, 2024. All students are requested to report on time.",
        date: "2024-01-10"
      }
    ],
    latestUpdates: [
      {
        id: "1",
        content: "New computer lab equipped with latest technology",
        date: "2024-01-15"
      },
      {
        id: "2",
        content: "Annual sports day scheduled for February 20th",
        date: "2024-01-10"
      }
    ],
    contactInfo: {
      address: "123 Education Street\nLearning City, State 12345\nIndia",
      email: "info@newnarayanaschool.edu",
      phone: "+91 98765 43210",
      contactNumbers: [
        { id: "1", label: "Principal Office", number: "+91 98765 43210" },
        { id: "2", label: "Admissions Office", number: "+91 98765 43211" }
      ],
      mapEmbed: "https://maps.google.com/maps?width=600&height=600&hl=en&q=17%C2%B018%2733.1%22N%2078%C2%B030%2733.9%22E&t=&z=14&ie=UTF8&iwloc=B&output=embed"
    }
  },
  admissionInquiries: [],
  siteVisitors: 1247
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
  | { type: 'CLEANUP_OLD_INQUIRIES' }
  | { type: 'ADD_FOUNDER'; payload: Founder }
  | { type: 'UPDATE_FOUNDER'; payload: Founder }
  | { type: 'DELETE_FOUNDER'; payload: string }
  | { type: 'ADD_LATEST_UPDATE'; payload: LatestUpdate }
  | { type: 'UPDATE_LATEST_UPDATE'; payload: LatestUpdate }
  | { type: 'DELETE_LATEST_UPDATE'; payload: string }
  | { type: 'INCREMENT_VISITORS' }
  | { type: 'ADD_CONTACT_NUMBER'; payload: ContactNumber }
  | { type: 'DELETE_CONTACT_NUMBER'; payload: string };

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
        admissionInquiries: [action.payload, ...state.admissionInquiries]
      };
      break;
    case 'DELETE_ADMISSION_INQUIRY':
      newState = {
        ...state,
        admissionInquiries: state.admissionInquiries.filter(inquiry => inquiry.id !== action.payload)
      };
      break;
    case 'CLEANUP_OLD_INQUIRIES':
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      newState = {
        ...state,
        admissionInquiries: state.admissionInquiries.filter(inquiry => {
          const inquiryDate = new Date(inquiry.submittedAt);
          return inquiryDate > sixMonthsAgo;
        })
      };
      break;
    case 'ADD_FOUNDER':
      newState = {
        ...state,
        data: {
          ...state.data,
          founders: [...state.data.founders, action.payload]
        }
      };
      break;
    case 'UPDATE_FOUNDER':
      newState = {
        ...state,
        data: {
          ...state.data,
          founders: state.data.founders.map(founder =>
            founder.id === action.payload.id ? action.payload : founder
          )
        }
      };
      break;
    case 'DELETE_FOUNDER':
      newState = {
        ...state,
        data: {
          ...state.data,
          founders: state.data.founders.filter(founder => founder.id !== action.payload)
        }
      };
      break;
    case 'ADD_LATEST_UPDATE':
      newState = {
        ...state,
        data: {
          ...state.data,
          latestUpdates: [...state.data.latestUpdates, action.payload]
        }
      };
      break;
    case 'UPDATE_LATEST_UPDATE':
      newState = {
        ...state,
        data: {
          ...state.data,
          latestUpdates: state.data.latestUpdates.map(update =>
            update.id === action.payload.id ? action.payload : update
          )
        }
      };
      break;
    case 'DELETE_LATEST_UPDATE':
      newState = {
        ...state,
        data: {
          ...state.data,
          latestUpdates: state.data.latestUpdates.filter(update => update.id !== action.payload)
        }
      };
      break;
    case 'INCREMENT_VISITORS':
      newState = {
        ...state,
        siteVisitors: state.siteVisitors + 1
      };
      break;
    case 'ADD_CONTACT_NUMBER':
      newState = {
        ...state,
        data: {
          ...state.data,
          contactInfo: {
            ...state.data.contactInfo,
            contactNumbers: [...state.data.contactInfo.contactNumbers, action.payload]
          }
        }
      };
      break;
    case 'DELETE_CONTACT_NUMBER':
      newState = {
        ...state,
        data: {
          ...state.data,
          contactInfo: {
            ...state.data.contactInfo,
            contactNumbers: state.data.contactInfo.contactNumbers.filter(contact => contact.id !== action.payload)
          }
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
