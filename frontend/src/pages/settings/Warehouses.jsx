import { useEffect, useState } from "react";
import { Plus, Warehouse as WarehouseIcon, MapPin, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";

const emptyForm = { name: "", shortCode: "", address: "" };
const emptyLocation = { name: "", shortCode: "" };

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [locModal, setLocModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [locForm, setLocForm] = useState(emptyLocation);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/warehouses");
      setWarehouses(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/warehouses", form);
      toast.success("Warehouse created");
      setModalOpen(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create warehouse");
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/warehouses/${locModal}/locations`, locForm);
      toast.success("Location added");
      setLocModal(null);
      setLocForm(emptyLocation);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add location");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this warehouse?")) return;
    try {
      await api.delete(`/warehouses/${id}`);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> New Warehouse
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : warehouses.length === 0 ? (
        <div className="card">
          <EmptyState icon={WarehouseIcon} title="No warehouses yet" description="Add your first warehouse to start receiving and shipping stock." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((w) => (
            <div key={w._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{w.name}</p>
                  <p className="text-xs text-gray-400">Code: {w.shortCode}</p>
                  {w.address && <p className="text-xs text-gray-400 mt-0.5">{w.address}</p>}
                </div>
                <button onClick={() => handleDelete(w._id)} className="btn-ghost !p-2 hover:!text-danger">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase text-gray-400">Locations</p>
                  <button onClick={() => setLocModal(w._id)} className="text-xs font-semibold text-primary hover:underline">
                    + Add Location
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {w.locations.map((l) => (
                    <span key={l.shortCode} className="badge bg-primary-50 text-primary">
                      <MapPin size={11} /> {l.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Warehouse">
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className="label">Name</label>
      <input
        required
        className="input"
        placeholder="e.g. Main Warehouse"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
    </div>

    <div>
      <label className="label">Short Code</label>
      <input
        required
        className="input"
        placeholder="e.g. WH"
        value={form.shortCode}
        onChange={(e) => setForm({ ...form, shortCode: e.target.value })}
      />
    </div>

    <div>
      <label className="label">Address</label>
      <input
        className="input"
        placeholder="e.g. 123 Industrial Area, Ahmedabad"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
    </div>

    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={() => setModalOpen(false)}
        className="btn-outline"
      >
        Cancel
      </button>
      <button type="submit" className="btn-primary">
        Create Warehouse
      </button>
    </div>
  </form>
</Modal>

      <Modal open={!!locModal} onClose={() => setLocModal(null)} title="Add Location" size="sm">
        <form onSubmit={handleAddLocation} className="space-y-4">
          <div>
            <label className="label">Location Name</label>
            <input required className="input" placeholder="e.g. Rack A" value={locForm.name} onChange={(e) => setLocForm({ ...locForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Short Code</label>
            <input required className="input" placeholder="e.g. RackA" value={locForm.shortCode} onChange={(e) => setLocForm({ ...locForm, shortCode: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setLocModal(null)} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">Add Location</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warehouses;
