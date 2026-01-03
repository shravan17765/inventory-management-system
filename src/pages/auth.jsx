import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
        if (mode === "login") {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    navigate("/dashboard/products");
    } else {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
    setMessage("Account created successfully. Please sign in.");
    setMode("login");
    setPassword("");
    }

        } catch (error) {
    if (error.code === "auth/invalid-credential") {
        setMessage("Invalid email or wrong password.");
    } else if (error.code === "auth/user-not-found") {
        setMessage("No account found with this email.");
    } else if (error.code === "auth/wrong-password") {
        setMessage("Wrong password. Please try again.");
    } else if (error.code === "auth/email-already-in-use") {
        setMessage("Account already exists. Please sign in.");
        setMode("login");
    } else {
        setMessage("Something went wrong. Please try again.");
    }
    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-4">Welcome</h2>

        {/* Radio Selection */}
        <div className="border rounded mb-4">
          <label className="flex items-center gap-2 p-3 border-b">
            <input
              type="radio"
              checked={mode === "signup"}
              onChange={() => setMode("signup")}
            />
            <span>
              <b>Create account</b> <span className="text-gray-500">New here?</span>
            </span>
          </label>

          <label className="flex items-center gap-2 p-3">
            <input
              type="radio"
              checked={mode === "login"}
              onChange={() => setMode("login")}
            />
            <span>
              <b>Sign in</b>{" "}
              <span className="text-gray-500">Already a customer?</span>
            </span>
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter email"
            className="border p-2 w-full rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter password"
            className="border p-2 w-full rounded mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="bg-yellow-400 hover:bg-yellow-500 w-full py-2 rounded font-medium">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center text-blue-600 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}

export default Auth;
