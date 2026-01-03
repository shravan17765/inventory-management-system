import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { createNotification } from "../utils/notify";

function Sales() {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantitySold, setQuantitySold] = useState("");

  // 🔐 AUTH LISTENER
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setProducts([]);
        setSales([]);
      }
    });
    return () => unsub();
  }, []);

  const generateOrderId = () =>
    "ORD-" + Math.floor(100000 + Math.random() * 900000);

  // 📦 FETCH PRODUCTS
  const fetchProducts = async () => {
    if (!currentUser) return;

    const q = query(
      collection(db, "products"),
      where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // 🧾 FETCH SALES (SORT LATEST FIRST)
  const fetchSales = async () => {
    if (!currentUser) return;

    const q = query(
      collection(db, "sales"),
      where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);

    const salesData = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // 🔥 SORT BY DATE (LATEST FIRST)
    salesData.sort((a, b) => {
      const aTime = a.date?.seconds || 0;
      const bTime = b.date?.seconds || 0;
      return bTime - aTime;
    });

    setSales(salesData);
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchProducts();
    fetchSales();
  }, [currentUser]);

  const getStatusBadge = (status) =>
    status === "Completed"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  // 🧾 RECORD SALE
  const recordSale = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const qty = Number(quantitySold);
    if (qty > product.quantity) {
      alert("Not enough stock");
      return;
    }

    const amount = product.price * qty;

    await addDoc(collection(db, "sales"), {
      orderId: generateOrderId(),
      productName: product.name,
      quantity: qty,
      price: product.price,
      amount,
      date: Timestamp.now(), // 🔥 REQUIRED
      status: "Completed",
      userId: currentUser.uid,
    });

    await updateDoc(doc(db, "products", product.id), {
      quantity: product.quantity - qty,
    });

    await createNotification(
      `New sale recorded for "${product.name}"`,
      "info"
    );

    setQuantitySold("");
    setSelectedProduct("");
    fetchProducts();
    fetchSales();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Record Sale</h2>

        <form onSubmit={recordSale} className="space-y-4 mb-8">
          <select
            className="border p-2 w-full rounded"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            required
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.quantity})
              </option>
            ))}
          </select>

          <input
            type="number"
            className="border p-2 w-full rounded"
            placeholder="Quantity Sold"
            value={quantitySold}
            onChange={(e) => setQuantitySold(e.target.value)}
            required
          />

          <button className="bg-green-600 text-white w-full py-2 rounded">
            Record Sale
          </button>
        </form>

        {/* SALES HISTORY */}
        <div className="mt-8 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Sales History</h3>

          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Product</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="p-3">{sale.orderId}</td>
                  <td className="p-3">{sale.productName}</td>
                  <td className="p-3">{sale.quantity}</td>
                  <td className="p-3">₹{sale.amount}</td>
                  <td className="p-3">
                    {sale.date?.toDate().toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-sm rounded ${getStatusBadge(
                        sale.status
                      )}`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sales.length === 0 && (
            <p className="text-gray-500 text-center mt-4">
              No sales recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;
