import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Topbar = ({ title }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-surface/90 backdrop-blur border-b border-border">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-canvas rounded-xl px-3 py-2 border border-border w-64">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search Orders or Tasks"
            className="bg-transparent outline-none text-sm w-full placeholder-gray-400"
          />
        </div>

        <button className="h-9 w-9 flex items-center justify-center rounded-xl border border-border hover:bg-canvas text-gray-500 relative">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-canvas transition-colors"
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: user?.avatarColor || "#714B67" }}
            >
              {initials || "U"}
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-popover py-1.5 animate-fadeIn"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="px-3.5 py-2 border-b border-border">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2 text-sm text-gray-600 hover:bg-primary-50 hover:text-primary"
              >
                <UserIcon size={15} /> My Profile
              </Link>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-danger hover:bg-danger/10"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
