import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYOPcQgEAT4P_ir0imfcrJU_K7j1LfNNw",
  authDomain: "swiftscope-hackathon.firebaseapp.com",
  projectId: "swiftscope-hackathon",
  storageBucket: "swiftscope-hackathon.firebasestorage.app",
  messagingSenderId: "612622259840",
  appId: "1:612622259840:web:fb93579438840c2f227865",
  measurementId: "G-YRMHZYR2QW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
