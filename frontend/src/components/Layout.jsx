import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const titleMap = {
  "/": "Dashboard",
  "/products": "Products",
  "/receipts": "Receipts",
  "/deliveries": "Delivery Orders",
  "/transfers": "Internal Transfers",
  "/adjustments": "Stock Adjustments",
  "/move-history": "Move History",
  "/warehouses": "Warehouses",
  "/profile": "My Profile",
};

const Layout = () => {
  const location = useLocation();
  const title = titleMap[location.pathname] || "StockSense";

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-4 md:p-6 animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
