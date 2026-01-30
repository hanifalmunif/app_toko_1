import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';

// Import Halaman
import Dashboard from './pages/Dashboard';
import KelolaToko from './pages/KelolaToko';
import Produk from './pages/Produk';
import Service from './pages/Service';
import Kasir from './pages/Kasir';
import Laporan from './pages/Laporan';
import TokenPln from './pages/TokenPln';
import CetakKwitansi from './pages/CetakKwitansi';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="bg-[#0f172a] h-screen w-full"></div>;

  return (
    <Router>
      <Routes>
        {/* Jika belum login, tampilkan Login. Jika sudah, redirect ke dashboard */}
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
        />

        {/* Semua Route di bawah ini butuh Login */}
        <Route path="*" element={
          user ? (
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/toko" element={<KelolaToko />} />
                <Route path="/produk" element={<Produk />} />
                <Route path="/service" element={<Service />} />
                <Route path="/kasir" element={<Kasir />} />
                <Route path="/laporan" element={<Laporan />} />
                
                {/* --- FITUR BARU --- */}
                <Route path="/token" element={<TokenPln />} />
                <Route path="/kwitansi" element={<CetakKwitansi />} />
                
                {/* Redirect halaman tidak dikenal ke Dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;