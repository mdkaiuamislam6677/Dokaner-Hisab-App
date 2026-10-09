// Firebase Web SDK Initialization for Dokaner Hisab
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyByefUhtL78tmn7w8P8KgDiJWSg_X223qo",
  authDomain: "dokaner-hisab-94e6d.firebaseapp.com",
  projectId: "dokaner-hisab-94e6d",
  storageBucket: "dokaner-hisab-94e6d.firebasestorage.app",
  messagingSenderId: "393915111533",
  appId: "1:393915111533:web:a6eae1de86bf4ac8d78764",
  measurementId: "G-JKHTR6F94Z"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optional Analytics
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch (err) {
        console.warn("Analytics skipped", err);
      }
    }
  }).catch(() => {});
}

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
};
