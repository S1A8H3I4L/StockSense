import { useState } from "react";
import { Save, User, Mail, Shield, Lock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/auth/profile", { name, password: password || undefined });
      setUser({ ...user, name: res.data.name });
      localStorage.setItem("stocksense_user", JSON.stringify({ ...user, name: res.data.name }));
      toast.success("Profile updated");
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="card flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
          style={{ backgroundColor: user?.avatarColor || "#714B67" }}
        >
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-lg">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="badge bg-primary-50 text-primary mt-1 capitalize">
            <Shield size={11} /> {user?.role?.replace("_", " ")}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h3 className="font-semibold text-gray-800">Account Settings</h3>
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input !pl-10" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input !pl-10 bg-canvas" value={user?.email} disabled />
          </div>
        </div>
        <div>
          <label className="label">New Password (leave blank to keep current)</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              className="input !pl-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
