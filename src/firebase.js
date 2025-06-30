// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <-- Add this line
// import { getAnalytics } from "firebase/analytics"; // Optional

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNA_RuA0PYYemJ-zmN9RgkzfYynglXHbI",
  authDomain: "smart-rye-supplier-list.firebaseapp.com",
  projectId: "smart-rye-supplier-list",
  storageBucket: "smart-rye-supplier-list.appspot.com", // <-- Fix typo: should be .appspot.com
  messagingSenderId: "508075107341",
  appId: "1:508075107341:web:f085e0bcae107996c1e144",
  measurementId: "G-5R3QL2TXDD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // <-- Add this line

// Optional: Analytics (not needed for Firestore)
// const analytics = getAnalytics(app);