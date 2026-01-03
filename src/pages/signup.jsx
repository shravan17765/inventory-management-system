import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ ADD THIS

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");

      // ✅ Redirect to Login page
      navigate("/");

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login.");
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full rounded"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full rounded"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-green-600 text-white w-full py-2 rounded"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
