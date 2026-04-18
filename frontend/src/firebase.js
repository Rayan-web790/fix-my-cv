import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCKh7TN-5ESUuzY38iF6E6g5Bh7SlLdkNA",
  authDomain: "fixmycv-auth.firebaseapp.com",
  projectId: "fixmycv-auth",
  storageBucket: "fixmycv-auth.firebasestorage.app",
  messagingSenderId: "257564470184",
  appId: "1:257564470184:web:e5a840d7cc772991c9cb9d",
  measurementId: "G-CG7QJ53LHD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
