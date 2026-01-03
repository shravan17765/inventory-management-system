import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

function Notifications() {
  // 🔐 Logged-in user
  const [currentUser, setCurrentUser] = useState(null);

  // 🔔 User-specific notifications
  const [notifications, setNotifications] = useState([]);

  // ✅ STEP 1: Listen to auth state & clear on logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        // Prevent previous user's data showing
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ STEP 2: Fetch notifications ONLY for this user
  const fetchNotifications = async () => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setNotifications(list);
  };

  // ✅ STEP 3: Fetch again whenever user changes
  useEffect(() => {
    if (!currentUser) return;
    fetchNotifications();
  }, [currentUser]);

  // 🎨 UI helper
  const getColor = (type) => {
    if (type === "success") return "bg-green-100 text-green-700";
    if (type === "warning") return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`p-3 mb-3 rounded ${getColor(n.type)}`}
          >
            <p>{n.message}</p>
            <small className="text-xs text-gray-600">
              {n.createdAt?.toDate
                ? n.createdAt.toDate().toLocaleString()
                : "—"}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;
