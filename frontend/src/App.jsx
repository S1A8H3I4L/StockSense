import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/products/ProductList";
import Receipts from "./pages/operations/Receipts";
import Deliveries from "./pages/operations/Deliveries";
import Transfers from "./pages/operations/Transfers";
import Adjustments from "./pages/operations/Adjustments";
import MoveHistory from "./pages/MoveHistory";
import Warehouses from "./pages/settings/Warehouses";
import Profile from "./pages/Profile";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
          success: { iconTheme: { primary: "#714B67", secondary: "#fff" } },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/deliveries" element={<Deliveries />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/adjustments" element={<Adjustments />} />
          <Route path="/move-history" element={<MoveHistory />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
