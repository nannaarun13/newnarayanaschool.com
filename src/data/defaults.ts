
import { SchoolData, Notice, LatestUpdate, Founder, ContactInfo } from '@/types';

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
  mapEmbed: '',
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
