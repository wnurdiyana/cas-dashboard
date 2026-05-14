import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqZ0ZhlDAmFEmK9VrQ0rNhji1CqMfqWIA",
  authDomain: "mycas-dashboard.firebaseapp.com",
  databaseURL: "https://mycas-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mycas-dashboard",
  storageBucket: "mycas-dashboard.firebasestorage.app",
  messagingSenderId: "641922638381",
  appId: "1:641922638381:web:372171a1c6d600b6044ea4",
  measurementId: "G-YDXFWVECQE"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
