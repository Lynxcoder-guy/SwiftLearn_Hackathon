import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase is the shared backend for authentication and learner progress.
// The client SDK is initialized once and the exported services are reused by
// every feature instead of creating separate connections per screen.
const firebaseConfig = {
  apiKey: "AIzaSyDYOPcQgEAT4P_ir0imfcrJU_K7j1LfNNw",
  authDomain: "swiftscope-hackathon.firebaseapp.com",
  projectId: "swiftscope-hackathon",
  storageBucket: "swiftscope-hackathon.firebasestorage.app",
  messagingSenderId: "612622259840",
  appId: "1:612622259840:web:fb93579438840c2f227865",
  measurementId: "G-YRMHZYR2QW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
