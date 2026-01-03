import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./pages/auth";
import Profile from "./pages/profile";
import Dashboard from "./pages/dashboard";
import Products from "./pages/products";
import Sales from "./pages/sales";
import Notifications from "./pages/notifications";
import Layout from "./components/layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH PAGE */}
        <Route path="/" element={<Auth />} />

        {/* DASHBOARD ROUTES */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />        {/* ✅ FIXED */}
          <Route path="notifications" element={<Notifications />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
