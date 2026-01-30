import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Wrench, 
  ShoppingCart, 
  FileBarChart, 
  Zap, 
  FileText, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const Layout = ({ children, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Daftar Menu Navigasi
  const menus = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/kasir', label: 'Kasir', icon: <ShoppingCart size={20} /> },
    { path: '/produk', label: 'Data Produk', icon: <Package size={20} /> },
    { path: '/service', label: 'Service', icon: <Wrench size={20} /> },
    { path: '/token', label: 'Token PLN', icon: <Zap size={20} /> },        // Fitur Baru
    { path: '/kwitansi', label: 'Cetak Kwitansi', icon: <FileText size={20} /> }, // Fitur Baru
    { path: '/laporan', label: 'Laporan', icon: <FileBarChart size={20} /> },
    { path: '/toko', label: 'Pengaturan Toko', icon: <Store size={20} /> },
  ];

  // Judul Header berdasarkan Path aktif
  const currentTitle = menus.find(m => m.path === location.pathname)?.label || 'Aplikasi Toko';

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700 shadow-sm">
          <h1 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
            <Store className="text-blue-500"/> POS SYSTEM
          </h1>
          {/* Tombol Close di Mobile */}
          <button onClick={() => setIsOpen(false)} className="absolute right-4 md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              onClick={() => setIsOpen(false)} // Tutup sidebar saat klik menu (mobile)
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              {menu.icon}
              <span className="font-medium">{menu.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout (Bottom Sidebar) */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.username || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-400 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors text-sm font-bold"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header Navbar */}
        <header className="h-16 bg-slate-800/50 backdrop-blur border-b border-slate-700 flex items-center justify-between px-4 md:px-6 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsOpen(true)} className="md:hidden p-2 text-slate-300 hover:bg-slate-700 rounded">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-100">{currentTitle}</h2>
          </div>
          
          <div className="text-xs text-slate-500 hidden md:block">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900 scroll-smooth">
          {/* Ini tempat komponen halaman (Dashboard, TokenPln, dll) muncul */}
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            {children}
          </div>
        </main>
        
      </div>

      {/* Overlay Background untuk Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;