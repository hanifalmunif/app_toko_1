import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, User, Phone, Save, Monitor, AlertCircle, Clock, Trash2, Calendar, Printer } from 'lucide-react';
import { BASE_URL } from '../config';

const Service = () => {
  const [serviceList, setServiceList] = useState([]);
  
  // Kita set tanggal default ke hari ini (format YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    tgl_masuk: today, // Field baru untuk tanggal
    nama_pelanggan: '',
    no_telp: '',
    nama_barang: '',
    keluhan: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get(`${BASE_URL}/api_service.php`)
      .then(res => setServiceList(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${BASE_URL}/api_service.php`, formData)
      .then(() => {
        alert('Data Berhasil Disimpan!');
        fetchData();
        // Reset form tapi tanggal tetap hari ini
        setFormData({ 
            tgl_masuk: today, 
            nama_pelanggan: '', 
            no_telp: '', 
            nama_barang: '', 
            keluhan: '' 
        });
      })
      .catch(err => alert('Gagal menyimpan'));
  };

  const handleUpdateStatus = (id, newStatus, currentBiaya) => {
    let fixBiaya = currentBiaya;
    if (newStatus === 'Selesai') {
        const inputBiaya = prompt("Masukkan Biaya Servis (Rp):", currentBiaya);
        if (inputBiaya === null) return;
        fixBiaya = inputBiaya;
    }
    axios.post(`${BASE_URL}/api_service.php`, {
        id: id, status: newStatus, biaya: fixBiaya
    }).then(() => fetchData());
  };

  const handleDelete = (id) => {
    if(confirm('Hapus data servis ini?')) {
        axios.get(`${BASE_URL}/api_service.php?action=delete&id=${id}`)
        .then(() => fetchData());
    }
  };

  // --- FUNGSI CETAK NOTA (NEW!) ---
  const handlePrint = (item) => {
    // Membuka jendela baru untuk cetak
    const printWindow = window.open('', '', 'height=600,width=400');
    
    // Desain HTML untuk Struk/Nota
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota Servis - ${item.nama_pelanggan}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; text-align: left; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
            .title { font-size: 18px; font-weight: bold; }
            .info { margin-bottom: 15px; font-size: 14px; }
            .item { border-bottom: 1px dashed #ccc; padding: 10px 0; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
            .total { font-weight: bold; font-size: 16px; margin-top: 10px; text-align: right;}
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">TOKO KOMPUTER</div>
            <div>Jl. Teknologi No. 12, Kota Digital</div>
            <div>Telp: 0812-3456-7890</div>
          </div>
          
          <div class="info">
            <div><strong>Tgl Masuk:</strong> ${item.tgl_masuk}</div>
            <div><strong>Pelanggan:</strong> ${item.nama_pelanggan}</div>
            <div><strong>Telp:</strong> ${item.no_telp}</div>
            <div><strong>Status:</strong> ${item.status}</div>
          </div>

          <hr/>

          <div class="item">
            <div><strong>Unit:</strong> ${item.nama_barang}</div>
            <div><strong>Keluhan:</strong> ${item.keluhan}</div>
          </div>

          <div class="total">
            Biaya: ${formatRupiah(item.biaya)}
          </div>

          <div class="footer">
            <p>-- Tanda Terima Servis --</p>
            <p>Barang yang tidak diambil dalam 3 bulan<br/>diluar tanggung jawab kami.</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    // Tunggu sebentar agar style terload baru print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'Masuk': return 'bg-gray-600';
        case 'Proses': return 'bg-yellow-600';
        case 'Menunggu Sparepart': return 'bg-orange-600';
        case 'Selesai': return 'bg-green-600';
        case 'Diambil': return 'bg-blue-600';
        default: return 'bg-slate-700';
    }
  };

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* --- FORM INPUT --- */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 h-fit">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Wrench className="text-blue-500" /> Penerimaan Servis
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            
          {/* Tanggal Manual */}
          <div>
            <label className="block text-slate-400 text-xs mb-1">Tanggal Masuk</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input type="date" name="tgl_masuk" value={formData.tgl_masuk} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:border-blue-500" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-slate-400 text-xs mb-1">Nama Pelanggan</label>
                <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input type="text" name="nama_pelanggan" value={formData.nama_pelanggan} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:border-blue-500" placeholder="Nama..." required />
                </div>
             </div>
             <div>
                <label className="block text-slate-400 text-xs mb-1">No. WhatsApp</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input type="text" name="no_telp" value={formData.no_telp} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:border-blue-500" placeholder="08xxx..." required />
                </div>
             </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Nama Barang / Tipe</label>
            <div className="relative">
                <Monitor className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input type="text" name="nama_barang" value={formData.nama_barang} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:border-blue-500" placeholder="Contoh: Laptop Asus A456U" required />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Keluhan / Kerusakan</label>
            <div className="relative">
                <AlertCircle className="absolute left-3 top-3 text-slate-500" size={16} />
                <textarea name="keluhan" value={formData.keluhan} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm h-24 resize-none focus:border-blue-500" placeholder="Jelaskan kerusakan..." required></textarea>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all">
            <Save size={18} /> Simpan Data
          </button>
        </form>
      </div>

      {/* --- LIST DAFTAR SERVIS --- */}
      <div className="xl:col-span-2 space-y-4">
        <h3 className="font-bold text-white mb-2">Antrian Servis</h3>
        
        {serviceList.length === 0 ? (
             <div className="text-center py-10 text-slate-500 bg-[#1e293b] rounded-xl border border-slate-800">
                Belum ada servis masuk.
            </div>
        ) : (
            serviceList.map((item) => (
                <div key={item.id} className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4 hover:border-slate-600 transition-all shadow-lg">
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                {item.nama_barang}
                                <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-1 rounded-full border border-slate-700">
                                    {item.nama_pelanggan}
                                </span>
                            </h4>
                        </div>
                        <p className="text-red-400 text-sm mt-2 flex items-start gap-1 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                            <AlertCircle size={14} className="mt-0.5 shrink-0"/> Keluhan: "{item.keluhan}"
                        </p>
                        <p className="text-slate-500 text-xs mt-2 flex items-center gap-2">
                            <Clock size={12}/> Masuk: {item.tgl_masuk}
                        </p>
                    </div>

                    <div className="flex flex-col items-end justify-between min-w-[200px] gap-3 border-l border-slate-700 pl-4">
                        <div className="text-right w-full">
                            <p className="text-xs text-slate-400">Biaya Servis</p>
                            <p className="text-2xl font-bold text-blue-400">{formatRupiah(item.biaya)}</p>
                        </div>

                        <div className="flex items-center gap-2 w-full justify-end">
                            
                            {/* TOMBOL CETAK NOTA (BARU) */}
                            <button onClick={() => handlePrint(item)} className="p-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg transition-colors" title="Cetak Nota">
                                <Printer size={16} />
                            </button>

                            <select 
                                value={item.status} 
                                onChange={(e) => handleUpdateStatus(item.id, e.target.value, item.biaya)}
                                className={`text-xs font-bold py-2 px-3 rounded cursor-pointer outline-none border-none text-white appearance-none text-center flex-1 ${getStatusColor(item.status)}`}
                            >
                                <option value="Masuk" className="text-black">⏳ Baru</option>
                                <option value="Proses" className="text-black">🔧 Proses</option>
                                <option value="Menunggu Sparepart" className="text-black">📦 Part</option>
                                <option value="Selesai" className="text-black">✅ Selesai</option>
                                <option value="Diambil" className="text-black">🏠 Diambil</option>
                            </select>

                            <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-slate-700 rounded-lg transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Service;