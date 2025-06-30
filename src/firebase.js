import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // <-- Add this line

const firebaseConfig = {
  apiKey: "AIzaSyCNA_RuA0PYYemJ-zmN9RgkzfYynglXHbI",
  authDomain: "smart-rye-supplier-list.firebaseapp.com",
  projectId: "smart-rye-supplier-list",
  storageBucket: "smart-rye-supplier-list.appspot.com",
  messagingSenderId: "508075107341",
  appId: "1:508075107341:web:f085e0bcae107996c1e144",
  measurementId: "G-5R3QL2TXDD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // <-- Add this line