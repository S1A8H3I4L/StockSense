import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";

const statusStyles = {
  in_stock: "bg-success/15 text-green-700",
  low_stock: "bg-warning/15 text-yellow-700",
  out_of_stock: "bg-danger/15 text-red-700",
};
const statusLabel = { in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock" };

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  unitOfMeasure: "Units",
  costPerUnit: 0,
  salesPrice: 0,
  reorderPoint: 10,
  initialStock: 0,
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", { params: { search, status: statusFilter } });
      setProducts(res.data.products);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category?._id || "",
      unitOfMeasure: p.unitOfMeasure,
      costPerUnit: p.costPerUnit,
      salesPrice: p.salesPrice,
      reorderPoint: p.reorderPoint,
      initialStock: p.onHand,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, form);
        toast.success("Product updated");
      } else {
        await api.post("/products", form);
        toast.success("Product created");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
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
            <input
              className="input !pl-10"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input max-w-[160px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> New Product
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>On Hand</th>
              <th>Free to Use</th>
              <th>Cost / Unit</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState icon={Package} title="No products found" description="Create your first product to get started." />
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium text-gray-800">{p.name}</td>
                  <td className="text-gray-500">{p.sku}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>{p.onHand}</td>
                  <td>{p.freeToUse}</td>
                  <td>₹{p.costPerUnit}</td>
                  <td>
                    <span className={`badge ${statusStyles[p.stockStatus]}`}>{statusLabel[p.stockStatus]}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="btn-ghost !p-2">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="btn-ghost !p-2 hover:!text-danger">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Product Name</label>
              <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">SKU / Code</label>
              <input
                required
                disabled={!!editing}
                className="input"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Unit of Measure</label>
              <input
                className="input"
                value={form.unitOfMeasure}
                onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{editing ? "On Hand" : "Initial Stock"}</label>
              <input
                type="number"
                className="input"
                value={editing ? form.initialStock : form.initialStock}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, initialStock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Cost per Unit (₹)</label>
              <input
                type="number"
                className="input"
                value={form.costPerUnit}
                onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Sales Price (₹)</label>
              <input
                type="number"
                className="input"
                value={form.salesPrice}
                onChange={(e) => setForm({ ...form, salesPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Reorder Point</label>
              <input
                type="number"
                className="input"
                value={form.reorderPoint}
                onChange={(e) => setForm({ ...form, reorderPoint: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductList;
