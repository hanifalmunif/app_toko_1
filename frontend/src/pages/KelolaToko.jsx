import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Database, Upload, Download, Store, Plus, Trash2, Edit2, MapPin, Phone } from 'lucide-react';
import { BASE_URL } from '../config';

const KelolaToko = () => {
  // --- STATE UNTUK MULTI TOKO ---
  const [tokoList, setTokoList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formToko, setFormToko] = useState({
    id: '',
    nama_toko: '',
    alamat: '',
    no_telp: '',
    footer_struk: ''
  });

  // --- STATE UNTUK BACKUP ---
  const [loadingRestore, setLoadingRestore] = useState(false);

  useEffect(() => {
    fetchToko();
  }, []);

  // --- FUNGSI API TOKO ---
  const fetchToko = () => {
    axios.get(`${BASE_URL}/api_toko.php`)
      .then(res => setTokoList(res.data))
      .catch(err => console.error(err));
  };

  const handleSimpanToko = (e) => {
    e.preventDefault();
    axios.post(`${BASE_URL}/api_toko.php`, formToko)
      .then(() => {
        alert('Data Toko Berhasil Disimpan');
        fetchToko();
        resetForm();
      })
      .catch(() => alert('Gagal menyimpan'));
  };

  const handleHapusToko = (id) => {
    if (confirm("Hapus cabang toko ini?")) {
        axios.delete(`${BASE_URL}/api_toko.php?id=${id}`) // Pastikan backend support method DELETE atau pakai GET dgn parameter
        // Alternatif jika server hosting memblokir method DELETE, gunakan GET:
        // axios.get(`${BASE_URL}/api_toko.php?action=delete&id=${id}`)
        .then(() => fetchToko());
    }
  };

  const handleEditClick = (item) => {
    setFormToko(item);
    setIsEditing(true);
    // Scroll ke atas form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormToko({ id: '', nama_toko: '', alamat: '', no_telp: '', footer_struk: '' });
    setIsEditing(false);
  };

  // --- FUNGSI API BACKUP ---
  const handleBackup = () => {
    window.location.href = `${BASE_URL}/api_backup.php?action=download`;
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm("PERINGATAN: Restore akan menimpa/menghapus data lama. Lanjutkan?")) return;

    const formData = new FormData();
    formData.append('file_sql', file);

    setLoadingRestore(true);
    axios.post(`${BASE_URL}/api_restore.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => {
        alert(res.data.message || "Restore Berhasil");
        setLoadingRestore(false);
    })
    .catch(err => {
        alert("Gagal Restore");
        setLoadingRestore(false);
    });
  };

  return (
    <div className="space-y-8">
      
      {/* --- BAGIAN 1: LIST CABANG TOKO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: FORM INPUT/EDIT TOKO */}
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 h-fit">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Store className="text-blue-500"/> 
                {isEditing ? 'Edit Data Toko' : 'Tambah Toko Baru'}
            </h2>
            
            <form onSubmit={handleSimpanToko} className="space-y-4">
                <div>
                    <label className="text-xs text-slate-400">Nama Toko / Cabang</label>
                    <input type="text" className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded-lg" 
                        value={formToko.nama_toko} 
                        onChange={e => setFormToko({...formToko, nama_toko: e.target.value})} 
                        required 
                        placeholder="Contoh: Cabang Jakarta"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Alamat</label>
                    <textarea className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded-lg h-20 resize-none" 
                        value={formToko.alamat} 
                        onChange={e => setFormToko({...formToko, alamat: e.target.value})} 
                        required 
                    ></textarea>
                </div>
                <div>
                    <label className="text-xs text-slate-400">No. Telepon</label>
                    <input type="text" className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded-lg" 
                        value={formToko.no_telp} 
                        onChange={e => setFormToko({...formToko, no_telp: e.target.value})} 
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400">Catatan Kaki Struk</label>
                    <input type="text" className="w-full bg-[#0f172a] border border-slate-700 text-white p-2 rounded-lg" 
                        value={formToko.footer_struk} 
                        onChange={e => setFormToko({...formToko, footer_struk: e.target.value})} 
                        placeholder="Contoh: Barang tidak dapat dikembalikan"
                    />
                </div>

                <div className="flex gap-2 pt-2">
                    {isEditing && (
                        <button type="button" onClick={resetForm} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-sm">
                            Batal
                        </button>
                    )}
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                        <Save size={16}/> Simpan
                    </button>
                </div>
            </form>
        </div>

        {/* KOLOM KANAN: LIST DAFTAR TOKO */}
        <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between mb-2">
                 <h3 className="text-white font-bold text-lg">Daftar Cabang</h3>
                 <span className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-full">{tokoList.length} Cabang</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tokoList.map((shop) => (
                    <div key={shop.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-xl hover:border-slate-600 transition relative group">
                        
                        {/* Tombol Aksi (Muncul saat hover di desktop, atau selalu ada di mobile) */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => handleEditClick(shop)} className="p-2 bg-slate-700 text-yellow-400 rounded-lg hover:bg-slate-600 transition">
                                <Edit2 size={14}/>
                            </button>
                            {/* Toko Pusat (id 1 atau flag is_pusat) biasanya tidak boleh dihapus sembarangan */}
                            <button onClick={() => handleHapusToko(shop.id)} className="p-2 bg-slate-700 text-red-400 rounded-lg hover:bg-slate-600 transition">
                                <Trash2 size={14}/>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-3 rounded-full ${shop.is_pusat == 1 ? 'bg-yellow-600/20 text-yellow-500' : 'bg-blue-600/20 text-blue-500'}`}>
                                <Store size={20}/>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg leading-tight">{shop.nama_toko}</h4>
                                {shop.is_pusat == 1 && <span className="text-[10px] bg-yellow-600 text-white px-1.5 rounded uppercase">Pusat</span>}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-400 pl-1">
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="mt-0.5 shrink-0"/> 
                                <span>{shop.alamat || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14}/> 
                                <span>{shop.no_telp || '-'}</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      </div>

      <hr className="border-slate-800"/>

      {/* --- BAGIAN 2: DATABASE BACKUP & RESTORE --- */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="text-green-500"/> Backup & Restore Database
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box Backup */}
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-700 text-center">
                  <Download size={40} className="text-green-500 mx-auto mb-2"/>
                  <h3 className="text-white font-bold">Backup Data</h3>
                  <p className="text-slate-500 text-xs mb-4">Download semua data transaksi, stok, & servis.</p>
                  <button onClick={handleBackup} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm w-full">
                      Download .SQL
                  </button>
              </div>

              {/* Box Restore */}
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-700 text-center">
                  <Upload size={40} className="text-red-500 mx-auto mb-2"/>
                  <h3 className="text-white font-bold">Restore Data</h3>
                  <p className="text-slate-500 text-xs mb-4">Upload file .sql untuk mengembalikan data.</p>
                  
                  {loadingRestore ? (
                      <div className="text-white text-sm animate-pulse">Memproses Restore...</div>
                  ) : (
                      <>
                        <label htmlFor="fileUpload" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm w-full block cursor-pointer transition">
                            Pilih File Backup
                        </label>
                        <input type="file" id="fileUpload" accept=".sql" className="hidden" onChange={handleRestore}/>
                      </>
                  )}
              </div>
          </div>
      </div>

    </div>
  );
};

export default KelolaToko;