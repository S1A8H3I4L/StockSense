import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Shuffle,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../api/axios";
import StatCard from "../components/StatCard";

const COLORS = ["#714B67", "#9C6F91", "#C4A5BC", "#3B82C4", "#F5A623", "#28A745"];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card h-24 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }

const { kpis, movementTrend, categoryDistribution, statusBreakdown } = data;


const last7Days = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(2026, 8, 24); // 09-24-2026
  date.setDate(date.getDate() + i);

  const key = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  const existing = movementTrend.find((item) => item.date === key);

  return existing || {
    date: key,
    in: 0,
    out: 0,
  };
});


  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={kpis.totalProducts} icon={Package} tone="primary" />
        <StatCard label="Total Stock Units" value={kpis.totalStockUnits.toLocaleString()} icon={Package} tone="primary" />
        <StatCard label="Low Stock Items" value={kpis.lowStock} icon={AlertTriangle} tone="warning" />
        <StatCard label="Out of Stock" value={kpis.outOfStock} icon={XCircle} tone="danger" />
        <StatCard label="Pending Receipts" value={kpis.pendingReceipts} icon={ArrowDownToLine} tone="primary" />
        <StatCard label="Pending Deliveries" value={kpis.pendingDeliveries} icon={ArrowUpFromLine} tone="primary" />
        <StatCard label="Transfers Scheduled" value={kpis.scheduledTransfers} icon={Shuffle} tone="primary" />
        <StatCard
          label="Inventory Value"
          value={`₹${Number(kpis.inventoryValue).toLocaleString()}`}
          icon={DollarSign}
          tone="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Stock Movement — Last 7 Days</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#714B67" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#714B67" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5A623" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F5A623" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E1E5" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickFormatter={(d) => d.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E6E1E5", fontSize: 12 }} />
              <Area type="monotone" dataKey="in" name="Stock In" stroke="#714B67" fill="url(#colorIn)" strokeWidth={2} />
              <Area type="monotone" dataKey="out" name="Stock Out" stroke="#F5A623" fill="url(#colorOut)" strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Stock by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {categoryDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E6E1E5", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status breakdown - dynamic filter style counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(statusBreakdown).map(([doc, counts]) => (
          <div className="card" key={doc}>
            <h4 className="font-semibold text-gray-800 mb-3 capitalize">{doc}</h4>
            <div className="space-y-2">
              {Object.entries(counts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className={`badge-${status}`}>{status}</span>
                  <span className="font-semibold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
