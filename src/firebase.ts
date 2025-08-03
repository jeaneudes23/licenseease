import { initializeApp } from "firebase/app"
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxSrHl0Ti4Q8RcOs6HMscXQBWcKw0mA4Y",
  authDomain: "licenseease-b9a1b.firebaseapp.com",
  projectId: "licenseease-b9a1b",
  storageBucket: "licenseease-b9a1b.firebasestorage.app",
  messagingSenderId: "1052990268418",
  appId: "1:1052990268418:web:ce29a954b421fb5e97331b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db } 