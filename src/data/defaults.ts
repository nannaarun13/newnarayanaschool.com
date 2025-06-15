
import { SchoolData } from '@/types';

export const defaultSchoolData: SchoolData = {
  schoolName: "New Narayana School",
  schoolLogo: "https://via.placeholder.com/150x150?text=School+Logo",
  schoolNameImage: "https://via.placeholder.com/400x100?text=New+Narayana+School",
  email: "info@newnarayanaschool.edu",
  phone: "+91 9876543210",
  address: "123 Education Street, Knowledge City, State 560001",
  navigationItems: [
    { name: "Home", path: "/", visible: true },
    { name: "About", path: "/about", visible: true },
    { name: "Admissions", path: "/admissions", visible: true },
    { name: "Gallery", path: "/gallery", visible: true },
    { name: "Notice Board", path: "/notice-board", visible: true },
    { name: "Contact", path: "/contact", visible: true }
  ],
  notices: [
    {
      id: "1",
      title: "Welcome to New Academic Year 2024-25",
      content: "We are excited to welcome all students to the new academic year. Classes will commence from April 1st, 2024.",
      date: "2024-03-15"
    },
    {
      id: "2", 
      title: "Annual Sports Day",
      content: "Annual Sports Day will be held on March 25th, 2024. All students are encouraged to participate.",
      date: "2024-03-10"
    }
  ],
  welcomeMessage: "Welcome to New Narayana School - Excellence in Education",
  welcomeImage: "https://via.placeholder.com/1200x600?text=School+Campus",
  aboutUsText: "Committed to providing quality education and nurturing young minds for a brighter future.",
  aboutContent: "New Narayana School has been a beacon of educational excellence for over two decades. We are committed to providing holistic education that develops not just academic prowess but also character, creativity, and critical thinking skills in our students.",
  missionStatement: "To provide quality education that enables students to achieve their full potential and become responsible global citizens.",
  visionStatement: "To be a leading educational institution that inspires excellence, innovation, and integrity in every student.",
  contactDetails: {
    address: "123 Education Street, Knowledge City, State 560001",
    phone: "+91 9876543210",
    email: "info@newnarayanaschool.edu"
  },
  contactInfo: {
    address: "123 Education Street, Knowledge City, State 560001",
    phone: "+91 9876543210",
    email: "info@newnarayanaschool.edu",
    contactNumbers: [
      { id: "1", number: "+91 9876543210" },
      { id: "2", number: "+91 9876543211" }
    ],
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.1!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjgiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1234567890123",
    location: {
      latitude: 12.9716,
      longitude: 77.5946
    }
  },
  latestUpdates: [
    {
      id: "1",
      content: "Admission open for Academic Year 2024-25. Apply now!",
      date: "2024-03-01"
    },
    {
      id: "2",
      content: "Annual function scheduled for April 15th, 2024",
      date: "2024-03-05"
    }
  ],
  founders: [
    {
      id: "1",
      name: "Dr. Rajesh Kumar",
      details: "Founder and Principal with 30+ years of experience in education",
      image: "https://via.placeholder.com/200x200?text=Dr.+Rajesh+Kumar"
    }
  ],
  schoolHistory: "Founded in 2000, New Narayana School has been dedicated to providing quality education and has grown to become one of the most respected institutions in the region.",
  founderDetails: "Our founder, Dr. Rajesh Kumar, envisioned a school that would provide holistic education combining academic excellence with moral values.",
  galleryImages: []
};
