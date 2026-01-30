import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Wrench, AlertTriangle, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import { BASE_URL } from '../config';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Inisialisasi state dengan nilai default yang aman
  const [stats, setStats] = useState({
    omzet_hari_ini: 0,
    servis_aktif: 0,
    jumlah_stok_kritis: 0,
    transaksi_terbaru: [],
    barang_habis: []
  });

  const [loading, setLoading] = useState(true); // Tambahkan loading state

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = () => {
    axios.get(`${BASE_URL}/api_dashboard.php`)
      .then(res => {
        // Cek apakah data valid, jika tidak pakai object kosong
        const data = res.data || {}; 
        setStats({
            omzet_hari_ini: data.omzet_hari_ini || 0,
            servis_aktif: data.servis_aktif || 0,
            jumlah_stok_kritis: data.jumlah_stok_kritis || 0,
            transaksi_terbaru: data.transaksi_terbaru || [],
            barang_habis: data.barang_habis || []
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal load dashboard:", err);
        setLoading(false);
      });
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

  if (loading) return <div className="text-white p-10 text-center">Memuat Data Dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard Toko</h2>
        <p className="text-slate-400 text-sm">Ringkasan aktivitas hari ini</p>
      </div>

      {/* STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-900 to-slate-900 p-6 rounded-2xl border border-green-800 relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-green-200 text-sm font-medium mb-1">Omzet Toko Hari Ini</p>
                <h3 className="text-3xl font-bold text-white">{formatRupiah(stats.omzet_hari_ini)}</h3>
            </div>
            <TrendingUp className="absolute right-4 bottom-4 text-green-500/20" size={80} />
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 relative group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Servis Sedang Proses</p>
                    <h3 className="text-3xl font-bold text-white">{stats.servis_aktif} <span className="text-base font-normal text-slate-500">Unit</span></h3>
                </div>
                <Wrench className="text-blue-500" size={32} />
            </div>
            <Link to="/service" className="absolute bottom-4 right-4 text-xs text-blue-400 flex items-center gap-1 hover:underline">Lihat Antrian <ArrowRight size={12}/></Link>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 relative group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">Stok Menipis</p>
                    <h3 className="text-3xl font-bold text-white">{stats.jumlah_stok_kritis} <span className="text-base font-normal text-slate-500">Barang</span></h3>
                </div>
                <AlertTriangle className="text-red-500" size={32} />
            </div>
            <Link to="/produk" className="absolute bottom-4 right-4 text-xs text-red-400 flex items-center gap-1 hover:underline">Cek Gudang <ArrowRight size={12}/></Link>
        </div>
      </div>

      {/* TABEL SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Transaksi Terakhir (GUNAKAN ?.map AGAR TIDAK CRASH) */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-[#0f172a]"><h3 className="font-bold text-white">Penjualan Terakhir</h3></div>
            <div className="p-0">
                {stats.transaksi_terbaru?.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">Belum ada transaksi.</div>
                ) : (
                    <table className="w-full text-sm text-left text-slate-400">
                        <tbody>
                            {stats.transaksi_terbaru?.map((trx, idx) => (
                                <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                    <td className="px-4 py-3 text-white">{trx.no_nota}</td>
                                    <td className="px-4 py-3 text-right font-bold text-green-400">{formatRupiah(trx.total_belanja)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {/* Barang Habis (GUNAKAN ?.map JUGA) */}
        <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-[#0f172a]"><h3 className="font-bold text-white">Perlu Restock!</h3></div>
            <div className="p-4 space-y-3">
                {stats.barang_habis?.length === 0 ? (
                    <div className="text-center text-slate-500 text-sm">Stok Aman.</div>
                ) : (
                    stats.barang_habis?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-red-500/10 border border-red-500/20 p-2 rounded">
                            <div className="text-white text-sm font-bold">{item.nama_produk}</div>
                            <div className="text-red-400 font-bold">Sisa: {item.stok}</div>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;