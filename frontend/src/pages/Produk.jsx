import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Search, Tag, Box, DollarSign, Wallet } from 'lucide-react';
import { BASE_URL } from '../config';

const Produk = () => {
  const [produkList, setProdukList] = useState([]);
  const [formData, setFormData] = useState({
    nama: '',
    merk: '',
    kategori: 'Aksesoris',
    modal: '',
    harga: '',
    stok: '',
    satuan: 'Unit'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get(`${BASE_URL}/api_produk.php`)
      .then(response => {
        setProdukList(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false);
      });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${BASE_URL}/api_produk.php`, formData)
      .then(() => {
        alert('Produk Lengkap Berhasil Disimpan!');
        fetchData();
        setFormData({ 
            nama: '', merk: '', kategori: 'Aksesoris', 
            modal: '', harga: '', stok: '', satuan: 'Unit' 
        });
      })
      .catch(err => alert('Gagal menyimpan data. Cek koneksi.'));
  };

  const handleDelete = (id) => {
    if(confirm('Hapus produk ini dari database?')) {
        axios.get(`${BASE_URL}/api_produk.php?action=delete&id=${id}`)
        .then(() => fetchData());
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* --- FORM INPUT DETAIL --- */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 h-fit">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Package className="text-blue-500" /> Input Produk Baru
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Baris 1: Nama & Merk */}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-slate-400 text-xs mb-1">Nama Barang</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="Nama Produk..." className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 px-3 text-white focus:border-blue-500" required />
            </div>
            <div>
                <label className="block text-slate-400 text-xs mb-1">Merk / Brand</label>
                <input type="text" name="merk" value={formData.merk} onChange={handleChange} placeholder="Asus, Rexus..." className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 px-3 text-white focus:border-blue-500" />
            </div>
          </div>

          {/* Baris 2: Kategori & Satuan */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-slate-400 text-xs mb-1">Kategori</label>
                <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 px-3 text-white focus:border-blue-500">
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Laptop">Laptop / PC</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Network">Network</option>
                </select>
             </div>
             <div>
                <label className="block text-slate-400 text-xs mb-1">Satuan</label>
                <select name="satuan" value={formData.satuan} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 px-3 text-white focus:border-blue-500">
                    <option value="Unit">Unit</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                </select>
             </div>
          </div>

          <hr className="border-slate-700 my-2"/>

          {/* Baris 3: Modal & Harga Jual */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Harga Beli (Modal)</label>
              <div className="relative">
                 <span className="absolute left-3 top-2 text-slate-500 text-xs">Rp</span>
                 <input type="number" name="modal" value={formData.modal} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-white focus:border-blue-500" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-blue-400 text-xs mb-1 font-bold">Harga Jual (Konsumen)</label>
              <div className="relative">
                 <span className="absolute left-3 top-2 text-slate-500 text-xs">Rp</span>
                 <input type="number" name="harga" value={formData.harga} onChange={handleChange} className="w-full bg-[#0f172a] border border-blue-900/50 rounded-lg py-2 pl-8 pr-3 text-white focus:border-blue-500" placeholder="0" required />
              </div>
            </div>
          </div>

          {/* Baris 4: Stok */}
          <div>
            <label className="block text-slate-400 text-xs mb-1">Stok Awal</label>
            <input type="number" name="stok" value={formData.stok} onChange={handleChange} placeholder="Jumlah..." className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 px-3 text-white focus:border-blue-500" required />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
            <Plus size={18} /> Simpan Produk
          </button>
        </form>
      </div>

      {/* --- TABEL DATA --- */}
      <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[600px]">
        <div className="p-6 border-b border-slate-700 shrink-0">
           <h3 className="font-bold text-white mb-1">Database Gudang</h3>
           <p className="text-slate-500 text-xs">Menampilkan harga modal dan jual</p>
        </div>
        
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left text-slate-400">
             <thead className="text-xs text-slate-500 uppercase bg-[#0f172a] sticky top-0">
                <tr>
                   <th className="px-6 py-4">Produk</th>
                   <th className="px-6 py-4">Harga Modal</th>
                   <th className="px-6 py-4">Harga Jual</th>
                   <th className="px-6 py-4 text-center">Stok</th>
                   <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-700">
                {isLoading ? (
                    <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                ) : produkList.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8">Belum ada data.</td></tr>
                ) : (
                  produkList.map((item) => (
                     <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-bold text-white text-base">{item.nama_produk}</div>
                            <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">{item.merk || '-'}</span>
                                <span>{item.kategori}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                           {formatRupiah(item.modal)}
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-blue-400 font-bold text-base">{formatRupiah(item.harga)}</div>
                           {/* Hitung Laba Kasar */}
                           <div className="text-xs text-green-500 mt-1">
                               Laba: {formatRupiah(item.harga - item.modal)}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="font-bold text-white">{item.stok}</div>
                           <div className="text-xs text-slate-500">{item.satuan}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-700 rounded-lg hover:bg-red-600 text-white transition-colors"><Trash2 size={16}/></button>
                        </td>
                     </tr>
                  ))
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Produk;