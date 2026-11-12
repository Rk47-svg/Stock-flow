import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const PRESET_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4'];
const emptyForm = { name: '', description: '', color: '#6366f1' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/controllers/categories.php');
      setCategories(res.data);
    } catch (err) {
      setCategories([]);
      toast.error(err.response?.data?.error || 'Could not load categories. Is the backend running?');
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', color: c.color || '#6366f1' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/controllers/categories.php?id=${editing.id}`, form);
        toast.success('Category updated');
      } else {
        await api.post('/controllers/categories.php', form);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/controllers/categories.php?id=${deleteModal.id}`);
      toast.success('Category deleted');
      setDeleteModal(null);
      fetchCategories();
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-sm text-slate-400">Organize your inventory catalog into distinct groupings.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={18} /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loaded && categories.length === 0 && (
          <div className="card col-span-full flex flex-col items-center justify-center text-center py-14 px-4">
            <Tag size={26} className="text-slate-500 mb-3" />
            <p className="text-sm font-medium text-slate-300">No categories yet</p>
            <p className="text-xs text-slate-500 mt-1">Create a category to start organising your products.</p>
            <button onClick={openCreate} className="btn-primary mt-4"><Plus size={16} /> Add Category</button>
          </div>
        )}
        {categories.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
            className="card p-5 group relative flex flex-col justify-between" style={{ borderLeft: `4px solid ${c.color || '#6366f1'}` }}>
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(c)} className="p-1.5 bg-surface-800 text-slate-300 hover:text-primary-400 rounded-lg"><Edit2 size={14} /></button>
              <button onClick={() => setDeleteModal(c)} className="p-1.5 bg-surface-800 text-slate-300 hover:text-red-400 rounded-lg"><Trash2 size={14} /></button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag size={16} style={{ color: c.color }} />
                <h3 className="font-semibold text-white">{c.name}</h3>
              </div>
              <p className="text-xs text-slate-400">{c.description || 'No description provided.'}</p>
            </div>
            <div className="pt-4 mt-4 border-t border-surface-800 text-xs text-slate-400 flex justify-between">
              <span>{c.product_count || 0} items in category</span>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Category Name *</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="Electronics" /></div>
          <div><label className="label">Description</label><input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input" placeholder="Sensors, boards..." /></div>
          <div>
            <label className="label">Color Swatch</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_COLORS.map(color => (
                <button key={color} type="button" onClick={() => setForm({...form, color})}
                  className={`w-7 h-7 rounded-lg transition-all ${form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-900 scale-110' : ''}`}
                  style={{ background: color }} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" style={{ background: form.color }}>{editing ? 'Save Changes' : 'Create Category'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Category" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Delete category <strong className="text-white">{deleteModal?.name}</strong>?</p>
          <div className="flex justify-end gap-3"><button onClick={() => setDeleteModal(null)} className="btn-secondary">Cancel</button><button onClick={handleDelete} className="btn-danger">Delete</button></div>
        </div>
      </Modal>
    </div>
  );
}