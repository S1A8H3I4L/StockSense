import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Shuffle,
  ClipboardEdit,
  History,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/receipts", label: "Receipts", icon: ArrowDownToLine },
  { to: "/deliveries", label: "Delivery Orders", icon: ArrowUpFromLine },
  { to: "/transfers", label: "Internal Transfers", icon: Shuffle },
  { to: "/adjustments", label: "Adjustments", icon: ClipboardEdit },
  { to: "/move-history", label: "Move History", icon: History },
  { to: "/warehouses", label: "Warehouses", icon: Warehouse },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col bg-surface border-r border-border h-screen sticky top-0 transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Boxes size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-gray-800 tracking-tight">StockSense</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-primary-50 hover:text-primary"
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-center h-12 border-t border-border text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default Sidebar;
