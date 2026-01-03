import { Link, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // Redirect to login
  };

  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="flex flex-col gap-4">
          {/* Dashboard home */}
          <Link to="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>

          {/* Profile */}
          <Link to="/dashboard/profile" className="hover:text-gray-300">
            Profile
          </Link>

          {/* Notifications */}
          <Link to="/dashboard/notifications" className="hover:text-gray-300">
            Notifications
          </Link>

          {/* Products */}
          <Link to="/dashboard/products" className="hover:text-gray-300">
            Products
          </Link>

          {/* Sales */}
          <Link to="/dashboard/sales" className="hover:text-gray-300">
            Sales
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 px-3 py-2 rounded w-full hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-gray-100 p-6">
        {/* 🔑 REQUIRED for nested routes */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
