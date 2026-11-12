import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, Truck } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const emptyForm = { name: '', contact_person: '', email: '', phone: '', address: '', status: 'active' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/controllers/suppliers.php');
      setSuppliers(res.data);
    } catch (err) {
      setSuppliers([]);
      toast.error(err.response?.data?.error || 'Could not load suppliers. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, contact_person: s.contact_person || '', email: s.email || '', phone: s.phone || '', address: s.address || '', status: s.status || 'active' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/controllers/suppliers.php?id=${editing.id}`, form);
        toast.success('Supplier updated');
      } else {
        await api.post('/controllers/suppliers.php', form);
        toast.success('Supplier created');
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/controllers/suppliers.php?id=${deleteModal.id}`);
      toast.success('Supplier deleted');
      setDeleteModal(null);
      fetchSuppliers();
    } catch (err) {
      toast.error('Failed to delete supplier');
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Suppliers</h1>
          <p className="text-sm text-slate-400">Manage vendor profiles, contact details, and partnership status.</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start sm:self-auto"><Plus size={18} /> Add Supplier</button>
      </div>

      <div className="card p-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!loading && filtered.length === 0 && (
          <div className="card col-span-full flex flex-col items-center justify-center text-center py-14 px-4">
            <p className="text-sm font-medium text-slate-300">{search ? 'No suppliers match your search' : 'No suppliers yet'}</p>
            {!search && <p className="text-xs text-slate-500 mt-1">Add your first supplier to start linking products to vendors.</p>}
            {!search && <button onClick={openCreate} className="btn-primary mt-4"><Plus size={16} /> Add Supplier</button>}
          </div>
        )}
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card p-5 group relative flex flex-col justify-between">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(s)} className="p-1.5 bg-surface-800 text-slate-300 hover:text-primary-400 rounded-lg"><Edit2 size={14} /></button>
              <button onClick={() => setDeleteModal(s)} className="p-1.5 bg-surface-800 text-slate-300 hover:text-red-400 rounded-lg"><Trash2 size={14} /></button>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><Truck size={20} /></div>
                <div>
                  <h3 className="font-semibold text-white">{s.name}</h3>
                  <p className="text-xs text-slate-400">{s.contact_person || 'No contact person'}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 mt-4">
                {s.email && <div className="flex items-center gap-2"><Mail size={14} className="text-slate-500" /><span>{s.email}</span></div>}
                {s.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-slate-500" /><span>{s.phone}</span></div>}
                {s.address && <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-500" /><span>{s.address}</span></div>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-800 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-medium ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                ✓ {s.status}
              </span>
              <span className="text-slate-400">{s.product_count || 0} products supplied</span>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Supplier Name *</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" placeholder="TechSupply Co." /></div>
          <div><label className="label">Contact Person</label><input type="text" value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} className="input" placeholder="Raj Kumar" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" placeholder="you@company.com" /></div>
            <div><label className="label">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input" placeholder="+977-..." /></div>
          </div>
          <div><label className="label">Address</label><input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input" placeholder="Kathmandu, Nepal" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Create Supplier'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Supplier" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">Are you sure you want to delete <strong className="text-white">{deleteModal?.name}</strong>?</p>
          <div className="flex justify-end gap-3"><button onClick={() => setDeleteModal(null)} className="btn-secondary">Cancel</button><button onClick={handleDelete} className="btn-danger">Delete</button></div>
        </div>
      </Modal>
    </div>
  );
}