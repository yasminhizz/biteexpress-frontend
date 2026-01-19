// ✅ Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Replace these values with YOUR Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyA--wnN1A33GBYui6VGRcllWNNThyroV-8",
  authDomain: "food-delivery-14ea4.firebaseapp.com",
  projectId: "food-delivery-14ea4",
  storageBucket: "food-delivery-14ea4", // <- Updated to new bucket
  messagingSenderId: "276826226172",
  appId: "1:276826226172:web:2a52536317988fd55d8679"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export services so you can use them in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // now points to new bucket
