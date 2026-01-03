import { addDoc, collection, Timestamp } from "firebase/firestore";
import { auth } from "../firebase/firebase";
import { db } from "../firebase/firebase";

export const createNotification = async (message, type = "info") => {
  const user = auth.currentUser;

  // 🔐 Safety check
  if (!user) {
    console.warn("Notification not created: user not logged in");
    return;
  }

  await addDoc(collection(db, "notifications"), {
    message,
    type,
    userId: user.uid,          // ✅ THIS FIXES EVERYTHING
    createdAt: Timestamp.now(),
  });
};
