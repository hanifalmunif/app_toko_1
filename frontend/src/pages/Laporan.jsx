import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, FileText, Search, Download } from 'lucide-react';
import { BASE_URL } from '../config';

const Laporan = () => {
  // Default tanggal: Awal bulan ini sampai hari ini
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);
  const [tipe, setTipe] = useState('penjualan'); // 'penjualan' atau 'servis'
  const [data, setData] = useState([]);
  const [totalOmzet, setTotalOmzet] = useState(0);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, tipe]);

  const fetchData = () => {
    axios.get(`${BASE_URL}/api_laporan.php?start=${startDate}&end=${endDate}&tipe=${tipe}`)
      .then(res => {
        setData(res.data);
        // Hitung Total Otomatis
        const total = res.data.reduce((acc, item) => {
            const nominal = tipe === 'penjualan' ? item.total_belanja : item.biaya;
            return acc + parseInt(nominal);
        }, 0);
        setTotalOmzet(total);
      })
      .catch(err => console.error(err));
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // Fungsi Cetak Laporan (Print Browser)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & FILTER */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="text-blue-500" /> Laporan Keuangan
            </h2>
            <div className="flex gap-2 print:hidden">
                <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Download size={16}/> Cetak / PDF
                </button>
            </div>
        </div>

        {/* Filter Tanggal & Tipe */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
            <div>
                <label className="text-xs text-slate-400 mb-1 block">Dari Tanggal</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded-lg"/>
            </div>
            <div>
                <label className="text-xs text-slate-400 mb-1 block">Sampai Tanggal</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded-lg"/>
            </div>
            <div className="md:col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Jenis Laporan</label>
                <div className="flex bg-[#0f172a] p-1 rounded-lg border border-slate-700">
                    <button 
                        onClick={() => setTipe('penjualan')}
                        className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${tipe === 'penjualan' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        Penjualan Toko
                    </button>
                    <button 
                        onClick={() => setTipe('servis')}
                        className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${tipe === 'servis' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        Jasa Servis
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* CARD TOTAL */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-6 rounded-2xl border border-blue-800 flex justify-between items-center shadow-lg">
         <div>
            <p className="text-blue-200 text-sm">Total Omzet ({tipe === 'penjualan' ? 'Penjualan' : 'Servis'})</p>
            <h3 className="text-3xl font-bold text-white mt-1">{formatRupiah(totalOmzet)}</h3>
            <p className="text-xs text-slate-400 mt-1">Periode: {startDate} s/d {endDate}</p>
         </div>
         <FileText size={48} className="text-blue-500/50" />
      </div>

      {/* TABEL DATA */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-[#0f172a] text-slate-200 uppercase font-bold border-b border-slate-700">
                <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">{tipe === 'penjualan' ? 'No Nota' : 'Nama Pelanggan'}</th>
                    <th className="p-4 hidden md:table-cell">{tipe === 'penjualan' ? 'Total Item' : 'Barang'}</th>
                    <th className="p-4 text-right">Nominal</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {data.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center">Tidak ada data di periode ini.</td></tr>
                ) : (
                    data.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-800 transition-colors">
                            <td className="p-4 text-white">
                                {tipe === 'penjualan' ? item.tgl_transaksi : item.tgl_masuk}
                            </td>
                            <td className="p-4 font-bold text-white">
                                {tipe === 'penjualan' ? item.no_nota : item.nama_pelanggan}
                            </td>
                            <td className="p-4 hidden md:table-cell">
                                {tipe === 'penjualan' 
                                    ? <span className="text-xs bg-slate-700 px-2 py-1 rounded">Cek Detail</span> 
                                    : item.nama_barang
                                }
                            </td>
                            <td className="p-4 text-right font-bold text-blue-400">
                                {formatRupiah(tipe === 'penjualan' ? item.total_belanja : item.biaya)}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

    </div>
  );
};

export default Laporan;