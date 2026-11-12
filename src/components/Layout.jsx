import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950 text-slate-100">
      {/* Sidebar Component */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main View Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar (h-14) */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-surface-800 bg-surface-900/80 backdrop-blur-sm flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-800"
            >
              <Menu size={20} />
            </button>
            <span className="hidden lg:block text-sm text-slate-400">
              Welcome back, <strong className="text-slate-200">{user?.name || 'User'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-800 relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-surface-800">
              <div className="w-7 h-7 bg-primary-500/20 border border-primary-500/30 rounded-full flex items-center justify-center">
                <span className="text-primary-400 text-xs font-semibold">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-300 hidden sm:block">
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Main Content (max-w-6xl) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}