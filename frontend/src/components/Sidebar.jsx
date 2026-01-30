// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Wrench, Package, ShoppingCart, Zap, Database, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation(); // Untuk tahu kita sedang di halaman mana
  
  const menus = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Kelola Toko', icon: Store, path: '/toko' },
    { name: 'Service', icon: Wrench, path: '/service' },
    { name: 'Produk', icon: Package, path: '/produk' },
    { name: 'Penjualan', icon: ShoppingCart, path: '/kasir' },
    { name: 'Laporan', icon: ShoppingCart, path: '/laporan' },
    { name: 'PLN Token', icon: Zap, path: '/token' },
    { name: 'Backup', icon: Database, path: '/backup' },
    { name: 'User', icon: Users, path: '/users' },
  ];

  return (
    <div className="w-64 bg-[#0f172a] border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Store className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">COMP STORE</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menus.map((m) => {
          const isActive = location.pathname === m.path;
          return (
            <Link key={m.name} to={m.path}>
              <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <m.icon size={20} /> <span className="text-sm font-medium">{m.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white w-full">
          <Settings size={20} /> <span className="text-sm">Settings</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg w-full">
          <LogOut size={20} /> <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;