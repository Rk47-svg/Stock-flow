import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, DollarSign, AlertTriangle, Truck, 
  TrendingUp, Tag
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell 
} from 'recharts';
import api from '../utils/api';
import { Link } from 'react-router-dom';

function EmptyState({ icon: Icon, title, hint, to, cta }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-11 h-11 rounded-xl bg-surface-800 flex items-center justify-center mb-3">
        <Icon size={20} className="text-slate-500" />
      </div>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">{hint}</p>
      {to && <Link to={to} className="btn-secondary mt-4 text-xs">{cta}</Link>}
    </div>
  );
}

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 }
  })
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_value: 0,
    low_stock_count: 0,
    total_suppliers: 0,
    monthly_trend: [],
    category_breakdown: [],
    recent_products: [],
    recent_movements: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/controllers/stats.php?action=dashboard');
      const d = res.data;
      setStats(prev => ({
        ...prev,
        ...d,
        // PHP sends SUM()/COUNT() as strings; charts need real numbers
        monthly_trend: (d.monthly_trend ?? []).map(m => ({
          ...m, stock_in: Number(m.stock_in), stock_out: Number(m.stock_out),
        })),
        category_breakdown: (d.category_breakdown ?? []).map(c => ({
          ...c, count: Number(c.count), value: Number(c.value),
        })),
      }));
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);   // show a banner instead of fake numbers
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const trend = stats.monthly_trend ?? [];
  const categoryData = stats.category_breakdown ?? [];
  const hasTrend = trend.length > 0;
  const hasCategoryData = categoryData.some(c => c.count > 0);

  const statCards = [
    { label: 'Total Products', value: stats.total_products, change: stats.total_products ? 'Items in your catalogue' : 'No products yet', color: 'text-primary-400', bg: 'bg-primary-500/10', icon: Package },
    { label: 'Inventory Value', value: `NPR ${Number(stats.total_value || 0).toLocaleString()}`, change: stats.total_value > 0 ? 'Current stock value' : 'No stock added yet', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: DollarSign },
    { label: 'Low Stock Alerts', value: stats.low_stock_count, change: stats.low_stock_count > 0 ? 'Needs restocking' : 'Nothing to restock', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
    { label: 'Active Suppliers', value: stats.total_suppliers, change: stats.total_suppliers > 0 ? 'Currently active' : 'No suppliers yet', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Truck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-400">Real-time supply chain metrics and warehouse movement tracking.</p>
        </div>
      </div>

      {error && (
        <div className="card p-4 border-red-500/30 text-sm text-red-400">
          Could not load dashboard data. Check that Apache and MySQL are running.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible" className="card p-5 flex items-center justify-between bg-surface-900 border border-surface-800 rounded-xl">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold text-white mt-1.5">{s.value}</p>
              <p className={`text-xs mt-1 ${s.color}`}>{s.change}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Section */}
        <div className="card p-6 lg:col-span-2 flex flex-col bg-surface-900 border border-surface-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-primary-400" /> Stock Movement Trend
            </h2>
          </div>
          <div className="flex-1 min-h-[220px]">
            {hasTrend ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                {/* Styled Grid or removed for clean look */}
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                
                {/* Customized Axis Ticks */}
                <XAxis dataKey="month" tick={{ fill: '#a1a1aa', fontSize: 12 }} stroke="#3f3f46" />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} stroke="#3f3f46" />
                
                {/* Styled Tooltip */}
                <Tooltip 
                  contentStyle={{ 
                    background: '#09090b', 
                    border: '1px solid #27272a', 
                    borderRadius: '8px', 
                    color: '#f4f4f5', 
                    fontSize: '12px' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                <Bar dataKey="stock_in" name="Stock In" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="stock_out" name="Stock Out" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} title="No stock movements yet"
                hint="Record your first Stock In or Stock Out and the chart will appear here."
                to="/movements" cta="Go to Stock Movements" />
            )}
          </div>
        </div>

        {/* Pie Chart Section */}
        <div className="card p-6 flex flex-col bg-surface-900 border border-surface-800 rounded-xl">
          <h2 className="text-sm font-semibold text-white mb-4">Inventory by Category</h2>
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            {hasCategoryData ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie 
                  data={categoryData} 
                  dataKey="count" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={45} 
                  outerRadius={75} 
                  paddingAngle={3}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#09090b', 
                    border: '1px solid #27272a', 
                    borderRadius: '8px', 
                    fontSize: '12px', 
                    color: '#f4f4f5' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <EmptyState icon={Tag} title="No category data yet"
                hint="Add categories, then add products to them to see the breakdown."
                to="/categories" cta="Go to Categories" />
            )}
          </div>
          <div className="space-y-1.5 mt-2">
            {(hasCategoryData ? categoryData : []).slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-400">{c.name}</span>
                </div>
                <span className="text-white font-medium">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}