import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration should ideally come from environment variables
// For now, we'll keep it but add security rules in Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDMswGY1AAL7k6bGaTq8pjZ-NAx3Ii22VQ",
  authDomain: "newnarayanaschool-2022.firebaseapp.com",
  projectId: "newnarayanaschool-2022",
  storageBucket: "newnarayanaschool-2022.firebasestorage.app",
  messagingSenderId: "1022443065552",
  appId: "1:1022443065552:web:70cdd78f7f1b3dcff5ced5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Collection references
export const adminsCollection = collection(db, 'admins');

// Admin authentication functions
export const registerAdmin = async (email: string, password: string, userData: object) => {
  // Create user with Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Store additional user data in Firestore
  const adminRef = doc(db, 'admins', userCredential.user.uid);
  await setDoc(adminRef, {
    ...userData,
    uid: userCredential.user.uid,
    email,
    status: 'pending',
    requestedAt: new Date().toISOString()
  });
  
  return userCredential.user;
};

export const signInAdmin = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const getAdminData = async (uid: string) => {
  const adminRef = doc(db, 'admins', uid);
  const adminSnap = await getDoc(adminRef);
  
  if (adminSnap.exists()) {
    return adminSnap.data();
  }
  
  return null;
};

export const isApprovedAdmin = async (email: string) => {
  // Special case for our super admin
  if (email === 'arunnanna3@gmail.com') {
    return true;
  }
  
  const adminQuery = query(
    adminsCollection, 
    where('email', '==', email),
    where('status', '==', 'approved')
  );
  
  const querySnapshot = await getDocs(adminQuery);
  return !querySnapshot.empty;
};

export default app;
