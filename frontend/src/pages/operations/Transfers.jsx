import { useEffect, useState } from "react";
import { Plus, Search, CheckCircle2, XCircle, Trash2, Shuffle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import EmptyState from "../../components/EmptyState";

const emptyForm = {
  warehouse: "",
  fromLocation: "",
  toLocation: "",
  scheduleDate: new Date().toISOString().slice(0, 10),
  products: [{ product: "", quantity: 1 }],
};

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/transfers", { params: { search } });
      setTransfers(res.data);
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
  }, [search]);

  const selectedWarehouse = warehouses.find((w) => w._id === form.warehouse);

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
      await api.post("/transfers", form);
      toast.success("Internal transfer created");
      setModalOpen(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create transfer");
    }
  };

  const validate = async (id) => {
    try {
      await api.post(`/transfers/${id}/validate`);
      toast.success("Transfer validated — location updated");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Validation failed");
    }
  };

  const cancel = async (id) => {
    await api.post(`/transfers/${id}/cancel`);
    toast.success("Transfer cancelled");
    fetchAll();
  };

  const remove = async (id) => {
    if (!confirm("Delete this transfer?")) return;
    try {
      await api.delete(`/transfers/${id}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input !pl-10" placeholder="Search reference..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> New Transfer
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Warehouse</th>
              <th>From</th>
              <th>To</th>
              <th>Schedule Date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : transfers.length === 0 ? (
              <tr><td colSpan={7}><EmptyState icon={Shuffle} title="No internal transfers yet" description="Move stock between racks, floors or warehouses." /></td></tr>
            ) : (
              transfers.map((t) => (
                <tr key={t._id}>
                  <td className="font-medium text-gray-800">{t.reference}</td>
                  <td>{t.warehouse?.shortCode}</td>
                  <td>{t.fromLocation}</td>
                  <td>{t.toLocation}</td>
                  <td>{new Date(t.scheduleDate).toLocaleDateString()}</td>
                  <td><Badge status={t.status} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {t.status === "draft" && (
                        <>
                          <button onClick={() => validate(t._id)} className="btn-ghost !p-2 hover:!text-success" title="Validate">
                            <CheckCircle2 size={15} />
                          </button>
                          <button onClick={() => cancel(t._id)} className="btn-ghost !p-2 hover:!text-danger" title="Cancel">
                            <XCircle size={15} />
                          </button>
                          <button onClick={() => remove(t._id)} className="btn-ghost !p-2 hover:!text-danger" title="Delete">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Internal Transfer (WH/INT)" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Warehouse</label>
              <select required className="input" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value, fromLocation: "", toLocation: "" })}>
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name} ({w.shortCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">From Location</label>
              <select required className="input" value={form.fromLocation} onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}>
                <option value="">Select location</option>
                {selectedWarehouse?.locations.map((l) => (
                  <option key={l.shortCode} value={l.shortCode}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">To Location</label>
              <select required className="input" value={form.toLocation} onChange={(e) => setForm({ ...form, toLocation: e.target.value })}>
                <option value="">Select location</option>
                {selectedWarehouse?.locations.map((l) => (
                  <option key={l.shortCode} value={l.shortCode}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
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
            {p.name} ({p.sku}) — {p.onHand} in stock
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
            <button type="submit" className="btn-primary">Create Transfer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Transfers;
