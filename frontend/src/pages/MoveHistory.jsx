import { useEffect, useState } from "react";
import { Search, History, ArrowDownToLine, ArrowUpFromLine, Shuffle, ClipboardEdit } from "lucide-react";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";

const docTypeIcons = {
  receipt: { icon: ArrowDownToLine, color: "text-success" },
  delivery: { icon: ArrowUpFromLine, color: "text-danger" },
  internal_transfer: { icon: Shuffle, color: "text-primary" },
  adjustment: { icon: ClipboardEdit, color: "text-yellow-600" },
};

const docTypeLabel = {
  receipt: "Receipt",
  delivery: "Delivery",
  internal_transfer: "Internal Transfer",
  adjustment: "Adjustment",
};

const MoveHistory = () => {
  const [moves, setMoves] = useState([]);
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMoves = async () => {
    setLoading(true);
    try {
      const res = await api.get("/moves", { params: { search, docType } });
      setMoves(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchMoves, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search, docType]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input !pl-10" placeholder="Search by reference..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input max-w-[200px]" value={docType} onChange={(e) => setDocType(e.target.value)}>
          <option value="">All Document Types</option>
          <option value="receipt">Receipts</option>
          <option value="delivery">Deliveries</option>
          <option value="internal_transfer">Internal Transfers</option>
          <option value="adjustment">Adjustments</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>From</th>
              <th>To</th>
              <th>Date</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : moves.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon={History} title="No stock movements yet" description="Every receipt, delivery, transfer and adjustment will appear here." /></td></tr>
            ) : (
              moves.map((m) => {
                const { icon: Icon, color } = docTypeIcons[m.docType] || {};
                return (
                  <tr key={m._id}>
                    <td className="font-medium text-gray-800">{m.reference}</td>
                    <td>
                      <span className="flex items-center gap-1.5 text-gray-600">
                        {Icon && <Icon size={14} className={color} />} {docTypeLabel[m.docType]}
                      </span>
                    </td>
                    <td>{m.product?.name}</td>
                    <td className={m.quantity > 0 ? "text-success font-semibold" : m.quantity < 0 ? "text-danger font-semibold" : ""}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="text-gray-500">{m.from}</td>
                    <td className="text-gray-500">{m.to}</td>
                    <td>{new Date(m.date).toLocaleString()}</td>
                    <td>{m.performedBy?.name || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MoveHistory;
