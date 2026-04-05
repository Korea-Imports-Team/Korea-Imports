import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDzIcBGlMEB33zwA8qqQZdGHjrAvW2kPyM",
  authDomain: "korea-imports.firebaseapp.com",
  projectId: "korea-imports",
  storageBucket: "korea-imports.firebasestorage.app",
  messagingSenderId: "637164111844",
  appId: "1:637164111844:web:950e8edc92410fa5de29f1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });