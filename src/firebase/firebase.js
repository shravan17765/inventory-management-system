import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDydVaYpa-st27MOazk3erPGW2oVoBIxq0",
  authDomain: "inventory-management-sys-b2a63.firebaseapp.com",
  projectId: "inventory-management-sys-b2a63",
  storageBucket: "inventory-management-sys-b2a63.firebasestorage.app",
  messagingSenderId: "699301600334",
  appId: "1:699301600334:web:d2a20427e5e031bdf7b71f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
