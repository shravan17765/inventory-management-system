import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  // 🔐 CURRENT USER
  const [currentUser, setCurrentUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ STEP 1: AUTH LISTENER + RESET ON LOGOUT
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (!user) {
        // 🔴 IMPORTANT: clear old user data
        setProducts([]);
        setSales([]);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // ✅ STEP 2 + 3: FETCH USER-SPECIFIC DATA
  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const productsQuery = query(
          collection(db, "products"),
          where("userId", "==", currentUser.uid)
        );

        const salesQuery = query(
          collection(db, "sales"),
          where("userId", "==", currentUser.uid)
        );

        const productSnap = await getDocs(productsQuery);
        const salesSnap = await getDocs(salesQuery);

        setProducts(productSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setSales(salesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // ---------- HELPERS (UNCHANGED) ----------

  const saleToDate = (sale) => {
    const t = sale.date ?? sale.createdAt;
    if (!t) return null;
    if (t?.seconds) return new Date(t.seconds * 1000);
    if (t?.toDate) return t.toDate();
    if (t instanceof Date) return t;
    return null;
  };

  const saleRevenue = (sale) => {
    if (typeof sale.amount === "number") return sale.amount;
    if (typeof sale.totalAmount === "number") return sale.totalAmount;
    const p = Number(sale.price);
    const q = Number(sale.quantity);
    if (!isNaN(p) && !isNaN(q)) return p * q;
    return 0;
  };

  const totalRevenue = sales.reduce(
    (sum, s) => sum + saleRevenue(s),
    0
  );

  const todayOrders = sales.filter((s) => {
    const d = saleToDate(s);
    return d && d.toDateString() === new Date().toDateString();
  }).length;

  const lowStockCount = products.filter(
    (p) => Number(p.quantity) <= 5
  ).length;

  const chartData = (() => {
    const map = new Map();
    sales.forEach((s) => {
      const d = saleToDate(s);
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + saleRevenue(s));
    });
    return Array.from(map.entries()).map(([k, v]) => ({
      name: k,
      revenue: v,
    }));
  })();

  const salesHaveDates = sales.some((s) => !!saleToDate(s));
  const salesHaveRevenue = sales.some((s) => saleRevenue(s) > 0);

  // ---------- UI ----------

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Inventory Management Dashboard
          </h1>

          <nav className="flex gap-4 mb-4">
                <Link className="text-blue-600 font-medium" to="/dashboard/profile">
                Profile
                </Link>

            <Link className="text-blue-600 font-medium" to="/dashboard/products">
              Products
            </Link>
            <Link className="text-blue-600 font-medium" to="/dashboard/sales">
              Sales
            </Link>
          </nav>

          <button
            onClick={() => signOut(auth)}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* ANALYTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Total Revenue</p>
            <h2 className="text-xl font-bold">₹{totalRevenue}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Today’s Orders</p>
            <h2 className="text-xl font-bold">{todayOrders}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-500">Low Stock Items</p>
            <h2 className="text-xl font-bold text-red-500">
              {lowStockCount}
            </h2>
          </div>
        </div>

        {/* DEBUG INFO */}
        {!loading && (
          <div className="bg-white p-3 rounded shadow text-sm mb-6">
            <p><strong>Debug:</strong></p>
            <ul className="list-disc pl-6">
              <li>Sales documents: {sales.length}</li>
              <li>Products documents: {products.length}</li>
              <li>Sales have dates: {String(salesHaveDates)}</li>
              <li>Sales have revenue: {String(salesHaveRevenue)}</li>
            </ul>
          </div>
        )}

        {/* CHART */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>

          {chartData.length === 0 ? (
            <p className="text-gray-500 text-center">No sales yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
