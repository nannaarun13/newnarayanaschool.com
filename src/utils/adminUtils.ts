
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Removed createApprovedAdmin function due to security vulnerabilities:
// - Plain text password storage
// - Hardcoded credentials
// Use proper Firebase Auth registration flow instead
