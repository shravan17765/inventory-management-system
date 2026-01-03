import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  if (!user) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="flex justify-center items-start">
      <div className="bg-white shadow rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">User Profile</h2>

        <p className="mb-2">
          <strong>Email:</strong> {user.email}
        </p>

        <p className="mb-2 break-all">
          <strong>User ID:</strong> {user.uid}
        </p>

        <p className="mb-2">
          <strong>Account Created:</strong>{" "}
          {user.metadata.creationTime}
        </p>

        <p className="mb-2">
          <strong>Last Login:</strong>{" "}
          {user.metadata.lastSignInTime}
        </p>
      </div>
    </div>
  );
}

export default Profile;
