
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
  mapEmbed?: string;
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
  galleryImages: GalleryImage[];
  admissionInquiries: AdmissionInquiry[];
  contactMessages: ContactMessage[];
  siteVisitors: number;
  loading: boolean;
}

// Define the actions that can be dispatched to update the state
export type SchoolAction =
  | { type: 'SET_SCHOOL_DATA'; payload: SchoolData }
  | { type: 'SET_GALLERY_IMAGES'; payload: GalleryImage[] }
  | { type: 'UPDATE_SCHOOL_DATA'; payload: Partial<SchoolData> }
  | { type: 'ADD_NOTICE'; payload: Notice }
  | { type: 'UPDATE_NOTICE'; payload: { id: string; title: string; content: string } }
  | { type: 'DELETE_NOTICE'; payload: string }
  | { type: 'ADD_ADMISSION_INQUIRY'; payload: AdmissionInquiry }
  | { type: 'ADD_CONTACT_MESSAGE'; payload: ContactMessage }
  | { type: 'INCREMENT_VISITORS' }
  | { type: 'ADD_LATEST_UPDATE'; payload: LatestUpdate }
  | { type: 'DELETE_LATEST_UPDATE'; payload: string }
  | { type: 'ADD_FOUNDER'; payload: Founder }
  | { type: 'DELETE_FOUNDER'; payload: string };
