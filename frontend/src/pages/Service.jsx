import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, User, Phone, Save, Monitor, AlertCircle, Clock, Trash2, Calendar, Printer } from 'lucide-react';
import { BASE_URL } from '../config';

const Service = () => {
  const [serviceList, setServiceList] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  // --- KONFIGURASI NAMA TOKO (GANTI DISINI) ---
  const shopProfile = {
    name: "GALERI KOMPUTER & SERVICE",
    address: "Jl. Merdeka No. 45, Jakarta Pusat",
    phone: "0812-9999-8888",
    email: "admin@galerikomputer.com"
  };

  const [formData, setFormData] = useState({
    tgl_masuk: today,
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

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  // --- FUNGSI CETAK NOTA TERBARU (DENGAN TABEL & NAMA TOKO) ---
  const handlePrint = (item) => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    
    // Generate Nomor Nota
    const noNota = `SRV-${String(item.id).padStart(5, '0')}`;
    const tglCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    printWindow.document.write(`
      <html>
        <head>
          <title>Nota Servis - ${item.nama_pelanggan}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #000; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            .header p { margin: 2px 0; font-size: 12px; }
            
            .info-container { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-box { width: 48%; border: 1px solid #000; padding: 10px; border-radius: 4px; }
            .info-title { font-weight: bold; border-bottom: 1px solid #ccc; margin-bottom: 5px; padding-bottom: 2px; }
            .row { display: flex; margin-bottom: 3px; }
            .label { width: 100px; font-weight: bold; }

            /* STYLE UNTUK TABEL */
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .no-border { border: none; }

            .footer { display: flex; justify-content: space-between; margin-top: 30px; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { margin-top: 60px; border-bottom: 1px solid #000; }
            
            .grand-total { font-size: 16px; font-weight: bold; background: #eee; padding: 5px; }

            @media print {
              @page { margin: 0.5cm; }
            }
          </style>
        </head>
        <body>
          
          <div class="header">
            <h1>${shopProfile.name}</h1>
            <p>${shopProfile.address}</p>
            <p>Telp/WA: ${shopProfile.phone} | Email: ${shopProfile.email}</p>
          </div>

          <div class="info-container">
            <div class="info-box">
              <div class="info-title">DATA PELANGGAN</div>
              <div class="row"><div class="label">Nama</div> : ${item.nama_pelanggan}</div>
              <div class="row"><div class="label">Telepon</div> : ${item.no_telp}</div>
              <div class="row"><div class="label">Tanggal Masuk</div> : ${item.tgl_masuk}</div>
            </div>
            <div class="info-box">
              <div class="info-title">DETAIL NOTA</div>
              <div class="row"><div class="label">No. Nota</div> : <strong>${noNota}</strong></div>
              <div class="row"><div class="label">Tgl Cetak</div> : ${tglCetak}</div>
              <div class="row"><div class="label">Status</div> : ${item.status}</div>
            </div>
          </div>

          <h3>Rincian Jasa & Barang</h3>
          <table>
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="30%">Unit / Barang</th>
                <th width="40%">Keluhan / Perbaikan</th>
                <th width="25%">Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td>${item.nama_barang}</td>
                <td>${item.keluhan}</td>
                <td class="text-right">${formatRupiah(item.biaya)}</td>
              </tr>
              <tr style="height: 25px;"><td>2</td><td></td><td></td><td></td></tr>
              <tr style="height: 25px;"><td>3</td><td></td><td></td><td></td></tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right grand-total">TOTAL BAYAR</td>
                <td class="text-right grand-total">${formatRupiah(item.biaya)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <div class="signature-box">
              <p>Hormat Kami,</p>
              <div class="signature-line"></div>
              <p>( Admin )</p>
            </div>
            
            <div class="signature-box">
              <p>Penerima / Pelanggan,</p>
              <div class="signature-line"></div>
              <p>( ${item.nama_pelanggan} )</p>
            </div>
          </div>

          <div style="margin-top: 20px; font-size: 10px; font-style: italic;">
            * Garansi servis 1 minggu untuk kerusakan yang sama.<br/>
            * Barang yang tidak diambil lebih dari 1 bulan diluar tanggung jawab kami.
          </div>

        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* --- FORM INPUT --- */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 h-fit">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Wrench className="text-blue-500" /> Penerimaan Servis
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                            <button onClick={() => handlePrint(item)} className="p-2 bg-white text-slate-800 hover:bg-gray-200 rounded-lg transition-colors border border-slate-300" title="Cetak Nota">
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