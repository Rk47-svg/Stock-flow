import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, AlertTriangle, Edit2, Trash2, 
  Package, Boxes, DollarSign, MapPin, Tag, Truck 
} from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', sku: '', description: '',
  category_id: '', supplier_id: '',
  quantity: '', price: '', reorder_level: '10',
  unit: 'pcs', location: ''
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null); // holds product object
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterCategory) params.set('category', filterCategory);
      if (lowStockOnly) params.set('low_stock', '1');

      const res = await api.get(`/controllers/products.php?${params.toString()}`);
      setProducts(res.data);
    } catch (err) {
      setProducts([]);
      toast.error(err.response?.data?.error || 'Could not load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories & suppliers on mount
  useEffect(() => {
    api.get('/controllers/categories.php')
      .then(r => setCategories(r.data))
      .catch(() => setCategories([]));

    api.get('/controllers/suppliers.php')
      .then(r => setSuppliers(r.data))
      .catch(() => setSuppliers([]));
  }, []);

  // Re-fetch products whenever any filter changes
  useEffect(() => {
    fetchProducts();
  }, [search, filterCategory, lowStockOnly]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      sku: p.sku,
      description: p.description || '',
      category_id: p.category_id || '',
      supplier_id: p.supplier_id || '',
      quantity: p.quantity,
      price: p.price,
      reorder_level: p.reorder_level,
      unit: p.unit,
      location: p.location || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/controllers/products.php?id=${editingProduct.id}`, form);
        toast.success('Product updated successfully');
      } else {
        await api.post('/controllers/products.php', form);
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await api.delete(`/controllers/products.php?id=${deleteModal.id}`);
      toast.success('Product deleted');
      setDeleteModal(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const isLow = (p) => Number(p.quantity) <= Number(p.reorder_level);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Products Inventory</h1>
          <p className="text-sm text-slate-400">Manage catalog items, track stock quantities, and locations.</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start sm:self-auto">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Control Bar: Search, Category Filter, Low Stock Toggle */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Low Stock Filter Button */}
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
              lowStockOnly 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-surface-800 border-surface-700 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle size={16} />
            <span>Low Stock</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-800/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-surface-800">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">{(search || filterCategory || lowStockOnly) ? 'No products match your filters.' : 'No products yet. Add a category and a supplier first, then add your first product.'}</td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-800/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isLow(p) && <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />}
                        <div>
                          <span className="text-sm text-white font-medium block">{p.name}</span>
                          {p.description && <span className="text-xs text-slate-500 block truncate max-w-xs">{p.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.sku}</td>
                    <td className="px-4 py-3 text-slate-300">{p.category_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        isLow(p) ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {p.quantity} {p.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-200">NPR {Number(p.price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{p.location || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(p)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Combined Modal (Size LG) */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Copper Wire Spool"
                className="input"
              />
            </div>
            <div>
              <label className="label">SKU / Code *</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. COP-050"
                className="input font-mono"
              />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief details about this product..."
              className="input resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="input"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Supplier</label>
              <select
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                className="input"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Quantity *</label>
              <input
                type="number"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">Unit *</label>
              <input
                type="text"
                required
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="input"
                placeholder="pcs, kg, box"
              />
            </div>
            <div>
              <label className="label">Price (NPR) *</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Reorder Level</label>
              <input
                type="number"
                value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                className="input"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="label">Warehouse Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Shelf B-04 / Aisle 2"
              className="input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Size SM) */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete <strong className="text-white">{deleteModal?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setDeleteModal(null)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleDelete} className="btn-danger">
              Delete Product
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}