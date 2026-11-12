import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const emptyForm = { product_id: '', type: 'in', quantity: '', reference: '', notes: '' };

export default function Movements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        api.get('/controllers/stats.php?action=movements'),
        api.get('/controllers/products.php')
      ]);
      setMovements(mRes.data);
      setProducts(pRes.data);
    } catch (err) {
      setMovements([]);
      setProducts([]);
      toast.error(err.response?.data?.error || 'Could not load stock movements. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/controllers/stats.php?action=adjust', {
        product_id: form.product_id,
        type: form.type,
        quantity: Number(form.quantity),
        note: form.reference,
      });
      toast.success('Stock movement logged');
      setModalOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to log movement'); }
  };

  const summary = {
    in: movements.filter(m => m.type === 'in').reduce((a, m) => a + Number(m.quantity), 0),
    out: movements.filter(m => m.type === 'out').reduce((a, m) => a + Number(m.quantity), 0),
    total: movements.length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Movements</h1>
          <p className="text-sm text-slate-400">Track inbound and outbound warehouse shipments and audit trails.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={18} /> Record Movement</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center justify-between">
          <div><p className="text-xs text-slate-500 uppercase">Total Inbound</p><p className="text-2xl font-bold text-emerald-400 mt-1">+{summary.in}</p></div>
          <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400"><ArrowUpRight size={20} /></div>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div><p className="text-xs text-slate-500 uppercase">Total Outbound</p><p className="text-2xl font-bold text-amber-400 mt-1">-{summary.out}</p></div>
          <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400"><ArrowDownRight size={20} /></div>
        </div>
        <div className="card p-5 flex items-center justify-between">
          <div><p className="text-xs text-slate-500 uppercase">Total Transactions</p><p className="text-2xl font-bold text-indigo-400 mt-1">{summary.total}</p></div>
          <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400"><ArrowLeftRight size={20} /></div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-800/60 text-slate-400 uppercase text-[11px] border-b border-surface-800">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Reference / Note</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Logged By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800">
            {!loading && movements.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                  No stock movements yet. {products.length === 0 ? 'Add a product first, then record your first movement.' : 'Click "Record Movement" to log your first one.'}
                </td>
              </tr>
            )}
            {movements.map((m, i) => (
              <motion.tr key={m.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-surface-800/40">
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase ${m.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {m.type === 'in' ? '↑ In' : '↓ Out'}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-white">{m.product_name}</td>
                <td className="px-4 py-3 font-semibold text-slate-200">±{m.quantity}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{m.note || '-'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{m.created_at ? new Date(m.created_at).toLocaleString() : '-'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{m.user_name || '-'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Stock Movement" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Movement Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['in', 'out'].map(t => (
                <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${form.type === t ? (t === 'in' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30') : 'bg-surface-800 text-slate-400 border-surface-700'}`}>
                  {t === 'in' ? '↑ Stock In' : '↓ Stock Out'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Product *</label>
            <select required value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className="input">
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="label">Quantity *</label><input type="number" required min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input" placeholder="10" /></div>
          <div><label className="label">Reference / PO Number</label><input type="text" value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} className="input" placeholder="PO-1029" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Record Movement</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}