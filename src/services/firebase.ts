// Firebase configuration for Learning With Fun app
// Replace the placeholder values with your actual Firebase project config

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  NextOrObserver,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  Firestore,
  WhereFilterOp,
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbfL1rNfyYso3tVKP09q2psQ0ilAkPfd4",
  authDomain: "learnwithfun-946f5.firebaseapp.com",
  projectId: "learnwithfun-946f5",
  storageBucket: "learnwithfun-946f5.firebasestorage.app",
  messagingSenderId: "780973956441",
  appId: "1:780973956441:web:95854a3ac93626a7bfc048", 
  measurementId: "G-MLS7VK43KY", 
};

// Initialize Firebase
let firebaseApp: FirebaseApp | null = null;

export const initializeFirebase = (): FirebaseApp => {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  }
  return firebaseApp;
};

// Get Firebase app instance
export const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

// Authentication services
export const getAuthService = (): Auth => {
  const app = getFirebaseApp();
  return getAuth(app);
};

// Firestore services
export const getFirestoreService = (): Firestore => {
  const app = getFirebaseApp();
  return getFirestore(app);
};

// Anonymous authentication helper (for kids using the app without accounts)
export const signInAnonymouslyUser = async (): Promise<User> => {
  const auth = getAuthService();
  const credential = await signInAnonymously(auth);
  return credential.user;
};

// Auth state listener
export const onAuthStateChange = (
  callback: NextOrObserver<User>,
) => {
  const auth = getAuthService();
  return onAuthStateChanged(auth, callback);
};

// User progress document reference
export const getUserProgressDocRef = (userId: string, lessonId: string) => {
  const firestore = getFirestoreService();
  return doc(firestore, `users/${userId}/progress/${lessonId}`);
};

// User achievements collection reference
export const getUserAchievementsCollectionRef = (userId: string) => {
  const firestore = getFirestoreService();
  return collection(firestore, `users/${userId}/achievements`);
};

// Global settings reference (for adaptive difficulty, etc.)
export const getGlobalSettingsDocRef = () => {
  const firestore = getFirestoreService();
  return doc(firestore, `globalSettings/learningConfig`);
};

// Content reference (for dynamic content updates in future)
export const getContentCollectionRef = (subject: string, moduleId: string) => {
  const firestore = getFirestoreService();
  return collection(
    firestore,
    `content/${subject}/${moduleId}/lessons`,
  );
};

// Helper to add document with auto-generated ID
export const addDocumentWithAutoId = async (
  collectionRef: any,
  data: any,
) => {
  const docRef = await addDoc(collectionRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef;
};

// Helper to update document
export const updateDocument = async (docRef: any, data: any) => {
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

// Helper to get document
export const getDocument = async (docRef: any) => {
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Helper to query documents
export const queryDocuments = async (
  collectionRef: any,
  conditions: [string, WhereFilterOp, any][],
) => {
  let q = query(collectionRef);
  conditions.forEach(([field, op, val]) => {
    q = query(q, where(field, op, val));
  });
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as object),
  }));
};

export {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  addDoc,
};

export default {
  initializeFirebase,
  getFirebaseApp,
  getAuthService,
  getFirestoreService,
  signInAnonymouslyUser,
  onAuthStateChange,
  getUserProgressDocRef,
  getUserAchievementsCollectionRef,
  getGlobalSettingsDocRef,
  getContentCollectionRef,
  addDocumentWithAutoId,
  updateDocument,
  getDocument,
  queryDocuments,
};