import { useEffect, useState } from "react";
import { Plus, Search, CheckCircle2, XCircle, Trash2, ArrowDownToLine } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";

const emptyForm = {
  supplier: "",
  warehouse: "",
  destinationLocation: "Stock",
  scheduleDate: new Date().toISOString().slice(0, 10),
  products: [{ product: "", quantity: 1 }],
};

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/receipts", { params: { search, status: statusFilter } });
      setReceipts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/warehouses").then((r) => setWarehouses(r.data));
    api.get("/products", { params: { limit: 500 } }).then((r) => setProducts(r.data.products));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchAll, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search, statusFilter]);

  const addLine = () => setForm({ ...form, products: [...form.products, { product: "", quantity: 1 }] });
  const removeLine = (i) => setForm({ ...form, products: form.products.filter((_, idx) => idx !== i) });
  const updateLine = (i, key, value) => {
    const next = [...form.products];
    next[i][key] = value;
    setForm({ ...form, products: next });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/receipts", form);
      toast.success("Receipt created as Draft");
      setModalOpen(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create receipt");
    }
  };

  const validate = async (id) => {
    try {
      await api.post(`/receipts/${id}/validate`);
      toast.success("Receipt validated — stock updated");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Validation failed");
    }
  };

  const cancel = async (id) => {
    await api.post(`/receipts/${id}/cancel`);
    toast.success("Receipt cancelled");
    fetchAll();
  };

  const remove = async (id) => {
    if (!confirm("Delete this receipt?")) return;
    try {
      await api.delete(`/receipts/${id}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input !pl-10" placeholder="Search reference or supplier..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> New Receipt
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Supplier</th>
              <th>Warehouse</th>
              <th>Destination</th>
              <th>Schedule Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : receipts.length === 0 ? (
              <tr><td colSpan={7}><EmptyState icon={ArrowDownToLine} title="No receipts yet" description="Create a receipt to bring stock in from a vendor." /></td></tr>
            ) : (
              receipts.map((r) => (
                <tr key={r._id}>
                  <td className="font-medium text-gray-800">{r.reference}</td>
                  <td>{r.supplier}</td>
                  <td>{r.warehouse?.shortCode}</td>
                  <td>{r.destinationLocation}</td>
                  <td>{new Date(r.scheduleDate).toLocaleDateString()}</td>
                  <td><Badge status={r.status} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {r.status === "draft" && (
                        <>
                          <button onClick={() => validate(r._id)} className="btn-ghost !p-2 hover:!text-success" title="Validate">
                            <CheckCircle2 size={15} />
                          </button>
                          <button onClick={() => cancel(r._id)} className="btn-ghost !p-2 hover:!text-danger" title="Cancel">
                            <XCircle size={15} />
                          </button>
                          <button onClick={() => remove(r._id)} className="btn-ghost !p-2 hover:!text-danger" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Receipt (WH/IN)" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Receive From (Supplier)</label>
              <input required className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
            </div>
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
              <label className="label">Destination Location</label>
              <input className="input" value={form.destinationLocation} onChange={(e) => setForm({ ...form, destinationLocation: e.target.value })} />
            </div>
            <div>
              <label className="label">Schedule Date</label>
              <input type="date" className="input" value={form.scheduleDate} onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Products</label>
              <button type="button" onClick={addLine} className="text-xs font-semibold text-primary hover:underline">+ Add Product</button>
            </div>
            <div className="space-y-2">
  {form.products.map((line, i) => (
    <div key={i} className="flex items-center gap-2">
      {/* Product */}
      <select
        required
        className="input !w-full flex-1 min-w-0"
        value={line.product}
        onChange={(e) => updateLine(i, "product", e.target.value)}
      >
        <option value="">Select product</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} ({p.sku})
          </option>
        ))}
      </select>

      {/* Quantity */}
      <input
        type="number"
        min="1"
        required
        className="input !w-24 shrink-0"
        value={line.quantity}
        onChange={(e) =>
          updateLine(i, "quantity", Number(e.target.value))
        }
      />

      {/* Remove */}
      {form.products.length > 1 && (
        <button
          type="button"
          onClick={() => removeLine(i)}
          className="btn-ghost !p-2 shrink-0 hover:!text-danger"
          title="Remove product"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  ))}
</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">Save as Draft</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Receipts;
