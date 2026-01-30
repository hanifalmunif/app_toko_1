import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Database, Upload, Download } from 'lucide-react';
import { BASE_URL } from '../config';

const KelolaToko = () => {
  // ... (kode profil toko yang lama biarkan saja) ...
  const [loadingRestore, setLoadingRestore] = useState(false);

  const handleBackup = () => {
    // Redirect browser untuk download file langsung
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
        alert(res.data.message);
        setLoadingRestore(false);
    })
    .catch(err => {
        alert("Gagal Restore");
        setLoadingRestore(false);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* CARD 1: Profil Toko (Kode Lama Kamu di sini) */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Pengaturan Toko</h2>
          <p className="text-slate-400 text-sm">Bagian ini kode lama kamu...</p>
      </div>

      {/* CARD 2: DATABASE BACKUP & RESTORE */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="text-blue-500"/> Backup & Restore Database
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
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-700 text-center relative">
                  <Upload size={40} className="text-red-500 mx-auto mb-2"/>
                  <h3 className="text-white font-bold">Restore Data</h3>
                  <p className="text-slate-500 text-xs mb-4">Upload file .sql untuk mengembalikan data.</p>
                  
                  {loadingRestore ? (
                      <div className="text-white text-sm">Memproses...</div>
                  ) : (
                      <>
                        <label htmlFor="fileUpload" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm w-full block cursor-pointer">
                            Pilih File Backup
                        </label>
                        <input 
                            type="file" 
                            id="fileUpload" 
                            accept=".sql" 
                            className="hidden" 
                            onChange={handleRestore}
                        />
                      </>
                  )}
              </div>

          </div>
      </div>
    </div>
  );
};

export default KelolaToko;