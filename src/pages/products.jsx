import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/firebase";
import { createNotification } from "../utils/notify";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { query, where } from "firebase/firestore";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

function Products() {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const [productData, setProductData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const nameRef = useRef(null);
  const categoryRef = useRef(null);
  const priceRef = useRef(null);
  const quantityRef = useRef(null);

  // 🔐 AUTH LISTENER
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) setProducts([]);
    });
    return () => unsub();
  }, []);

  // 📦 FETCH PRODUCTS (USER-WISE)
  const fetchProducts = async () => {
    const q = query(
      collection(db, "products"),
      where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchProducts();
  }, [currentUser]);

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: "Out of Stock", color: "text-red-600" };
    if (qty < 5) return { label: "Low Stock", color: "text-yellow-600" };
    return { label: "In Stock", color: "text-green-600" };
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ➕ ADD / ✏️ UPDATE PRODUCT (LIVE UI UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, category, price, quantity } = productData;

    if (!name || !category || !price || !quantity) {
      setError("All fields are required");
      return;
    }
    if (price <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (quantity < 0) {
      setError("Quantity cannot be negative");
      return;
    }

    setError("");

    if (editId) {
      // 🔁 UPDATE FIRESTORE
      await updateDoc(doc(db, "products", editId), {
        name,
        category,
        price: Number(price),
        quantity: Number(quantity),
      });

      // ✅ UPDATE LOCAL STATE (NO REFRESH)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editId
            ? {
                ...p,
                name,
                category,
                price: Number(price),
                quantity: Number(quantity),
              }
            : p
        )
      );

      if (quantity < 5) {
        await createNotification(`Low stock alert for "${name}"`, "warning");
      }

      setEditId(null);
    } else {
      // ➕ ADD PRODUCT
      const docRef = await addDoc(collection(db, "products"), {
        name,
        category,
        price: Number(price),
        quantity: Number(quantity),
        userId: currentUser.uid,
        createdAt: new Date(),
      });

      setProducts((prev) => [
        ...prev,
        {
          id: docRef.id,
          name,
          category,
          price: Number(price),
          quantity: Number(quantity),
        },
      ]);

      await createNotification(
        `Product "${name}" added successfully`,
        "success"
      );
    }

    setProductData({ name: "", category: "", price: "", quantity: "" });
    nameRef.current.focus();
  };

  // ❌ DELETE PRODUCT (LIVE UI)
  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await createNotification("Product deleted successfully", "info");
  };

  const handleEnter = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Products</h2>

        <input
          type="text"
          placeholder="Search by product name or category"
          className="border px-4 py-2 rounded w-full md:w-1/3 mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-3 mb-6">
          <input
            ref={nameRef}
            placeholder="Name"
            className="border p-2 rounded"
            value={productData.name}
            onChange={(e) =>
              setProductData({ ...productData, name: e.target.value })
            }
            onKeyDown={(e) => handleEnter(e, categoryRef)}
          />

          <input
            ref={categoryRef}
            placeholder="Category"
            className="border p-2 rounded"
            value={productData.category}
            onChange={(e) =>
              setProductData({ ...productData, category: e.target.value })
            }
            onKeyDown={(e) => handleEnter(e, priceRef)}
          />

          <input
            ref={priceRef}
            type="number"
            placeholder="Price"
            className="border p-2 rounded"
            value={productData.price}
            onChange={(e) =>
              setProductData({ ...productData, price: e.target.value })
            }
            onKeyDown={(e) => handleEnter(e, quantityRef)}
          />

          <input
            ref={quantityRef}
            type="number"
            placeholder="Quantity"
            className="border p-2 rounded"
            value={productData.quantity}
            onChange={(e) =>
              setProductData({ ...productData, quantity: e.target.value })
            }
          />

          {error && (
            <p className="col-span-4 text-red-500 text-sm">{error}</p>
          )}

          <button className="col-span-4 bg-blue-600 text-white py-2 rounded">
            {editId ? "Update Product" : "Add Product"}
          </button>
        </form>

        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => {
              const status = getStockStatus(p.quantity);
              return (
                <tr key={p.id} className="text-center border-t">
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>{p.quantity}</td>
                  <td className={`font-bold ${status.color}`}>
                    {status.label}
                  </td>
                  <td className="space-x-2">
                    <button
                      onClick={() => {
                        setEditId(p.id);
                        setProductData({
                          name: p.name,
                          category: p.category,
                          price: p.price,
                          quantity: p.quantity,
                        });
                        nameRef.current.focus();
                      }}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
