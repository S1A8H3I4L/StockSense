import { useEffect, useState } from "react";
import { Plus, ClipboardEdit } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";

const emptyForm = { warehouse: "", location: "Stock", product: "", countedQuantity: 0, reason: "" };

const Adjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/adjustments");
      setAdjustments(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    api.get("/warehouses").then((r) => setWarehouses(r.data));
    api.get("/products", { params: { limit: 500 } }).then((r) => setProducts(r.data.products));
  }, []);

  const selectedProduct = products.find((p) => p._id === form.product);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/adjustments", form);
      toast.success("Stock adjustment applied");
      setModalOpen(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply adjustment");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> New Adjustment
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>System Qty</th>
              <th>Counted Qty</th>
              <th>Difference</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : adjustments.length === 0 ? (
              <tr><td colSpan={8}><EmptyState icon={ClipboardEdit} title="No adjustments yet" description="Reconcile physical counts against system stock here." /></td></tr>
            ) : (
              adjustments.map((a) => (
                <tr key={a._id}>
                  <td className="font-medium text-gray-800">{a.reference}</td>
                  <td>{a.product?.name}</td>
                  <td>{a.warehouse?.shortCode}</td>
                  <td>{a.systemQuantity}</td>
                  <td>{a.countedQuantity}</td>
                  <td className={a.difference < 0 ? "text-danger font-medium" : a.difference > 0 ? "text-success font-medium" : ""}>
                    {a.difference > 0 ? `+${a.difference}` : a.difference}
                  </td>
                  <td className="text-gray-500">{a.reason || "—"}</td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Stock Adjustment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Warehouse</label>
            <select required className="input" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
              <option value="">Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>{w.name} ({w.shortCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Product</label>
            <select required className="input" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          {selectedProduct && (
            <div className="text-xs bg-canvas border border-border rounded-xl p-3 text-gray-500">
              Current system quantity: <span className="font-semibold text-gray-700">{selectedProduct.onHand}</span>
            </div>
          )}
          <div>
            <label className="label">Counted Quantity (Physical Count)</label>
            <input
              type="number"
              required
              className="input"
              value={form.countedQuantity}
              onChange={(e) => setForm({ ...form, countedQuantity: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Reason (optional)</label>
            <input className="input" placeholder="e.g. Damaged in transit" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">Apply Adjustment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Adjustments;
