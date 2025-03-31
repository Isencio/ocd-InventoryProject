import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6ugHGaOl6kY_zKyw0x0QqYviqNT367JA",
  authDomain: "ocdncr-proj.firebaseapp.com",
  projectId: "ocdncr-proj",
  storageBucket: "ocdncr-proj.firebasestorage.app",
  messagingSenderId: "353921815542",
  appId: "1:353921815542:web:879dfff97e58cee82fadd7",
  measurementId: "G-PWS2FDW6RR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };