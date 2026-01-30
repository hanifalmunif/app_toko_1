import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, User, Phone, Save, Monitor, AlertCircle, Clock, Trash2, Calendar, Printer, Store } from 'lucide-react';
import { BASE_URL } from '../config'; // Pastikan path config sesuai struktur projectmu

const Service = () => {
  // --- STATE ---
  const [serviceList, setServiceList] = useState([]);
  const [storeList, setStoreList] = useState([]); // Menampung daftar toko dari DB
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    tgl_masuk: today,
    toko_id: '', // Wajib dipilih user
    nama_pelanggan: '',
    no_telp: '',
    nama_barang: '',
    keluhan: ''
  });

  // --- EFFECT ---
  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNGSI AMBIL DATA (SERVICES & TOKO) ---
  const fetchData = () => {
    axios.get(`${BASE_URL}/api_service.php`)
      .then(res => {
        if (res.data.success) {
            setServiceList(res.data.services || []);
            
            // Ambil data toko untuk dropdown
            // Backend mengirim key "stores" berisi list dari tabel toko
            if (res.data.stores) {
                setStoreList(res.data.stores);
            }
        }
      })
      .catch(err => console.error("Error fetching data:", err));
  };

  // --- HANDLERS FORM ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi: Toko harus dipilih
    if (!formData.toko_id) {
        alert("Harap pilih Lokasi Toko terlebih dahulu!");
        return;
    }

    axios.post(`${BASE_URL}/api_service.php`, formData)
      .then(() => {
        alert('Data Berhasil Disimpan!');
        fetchData(); // Refresh data
        // Reset form (kecuali tanggal)
        setFormData({ 
            tgl_masuk: today, 
            toko_id: '', 
            nama_pelanggan: '', 
            no_telp: '', 
            nama_barang: '', 
            keluhan: '' 
        });
      })
      .catch(err => alert('Gagal menyimpan data'));
  };

  // --- UPDATE STATUS & BIAYA ---
  const handleUpdateStatus = (id, newStatus, currentBiaya) => {
    let fixBiaya = currentBiaya;
    
    // Jika status "Selesai" atau "Diambil", tanya biaya final
    if (newStatus === 'Selesai' || newStatus === 'Diambil') {
        const inputBiaya = prompt("Masukkan Biaya Servis (Rp):", currentBiaya);
        if (inputBiaya !== null) {
            fixBiaya = inputBiaya;
        } else {
            return; // Batal jika user tekan cancel
        }
    }
    
    axios.post(`${BASE_URL}/api_service.php`, {
        id: id, status: newStatus, biaya: fixBiaya
    }).then(() => fetchData());
  };

  // --- HAPUS DATA ---
  const handleDelete = (id) => {
    if(confirm('Yakin ingin menghapus data servis ini?')) {
        axios.get(`${BASE_URL}/api_service.php?action=delete&id=${id}`)
        .then(() => fetchData());
    }
  };

  // --- FORMAT CURRENCY ---
  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  // --- FUNGSI CETAK NOTA (DESAIN SESUAI GAMBAR) ---
  const handlePrint = (item) => {
    // 1. Ambil data Toko dari item (hasil JOIN database)
    // Jika data toko kosong (misal data lama sebelum fitur toko ada), pakai default
    const namaToko = item.nama_toko || "SERVICE CENTER";
    const alamatToko = item.alamat_toko || "Alamat belum diatur";
    const telpToko = item.telp_toko || "-";
    const footerStruk = item.footer_struk || "Simpan nota ini sebagai bukti pengambilan barang / klaim garansi.";

    // 2. Format Tanggal & Nomor
    const noNota = `SRV-${String(item.id).padStart(5, '0')}`;
    const tglMasuk = new Date(item.tgl_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const tglCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // 3. Buka Jendela Print
    const printWindow = window.open('', '', 'height=800,width=1000');
    
    // 4. Tulis HTML
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota Servis - ${item.nama_pelanggan}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body { 
                font-family: 'Roboto', sans-serif; 
                font-size: 12px; 
                color: #333; 
                padding: 40px; 
                -webkit-print-color-adjust: exact; 
            }
            
            /* HEADER */
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; color: #1e293b; letter-spacing: 1px; }
            .header p { margin: 4px 0; font-size: 11px; color: #64748b; }
            .separator { border-top: 3px solid #333; margin-top: 15px; margin-bottom: 30px; }

            /* GRID INFO (Card Style seperti gambar) */
            .info-container { display: flex; gap: 20px; margin-bottom: 30px; }
            .card { 
                flex: 1; 
                border: 1px solid #e2e8f0; 
                border-radius: 8px; 
                padding: 15px; 
                background-color: #f8fafc;
            }
            .card-title { 
                font-weight: bold; 
                color: #3b82f6; /* Warna Biru */
                font-size: 11px; 
                text-transform: uppercase; 
                border-bottom: 1px solid #cbd5e1; 
                padding-bottom: 8px; 
                margin-bottom: 10px; 
                letter-spacing: 0.5px;
            }
            .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; }
            .row span:first-child { color: #64748b; } 
            .row span:last-child { font-weight: 600; color: #000; } 

            /* RINCIAN TABEL */
            .section-title { font-weight: bold; font-size: 13px; margin-bottom: 10px; text-transform: uppercase; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { 
                background-color: #1e1e1e !important; /* Hitam Pekat */
                color: white !important; 
                padding: 10px 15px; 
                text-align: left; 
                font-size: 11px; 
                text-transform: uppercase; 
            }
            td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 12px; }
            .text-right { text-align: right; }
            
            /* TOTAL ROW */
            .total-row td { 
                background-color: #e2e8f0 !important; /* Abu-abu terang */
                font-weight: bold; 
                color: #000;
                font-size: 14px;
            }

            /* TANDA TANGAN */
            .footer-sign { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 40px; }
            .sign-box { text-align: center; width: 200px; }
            .sign-box p { margin-bottom: 60px; font-size: 11px; color: #555; }
            .line { border-bottom: 2px solid #333; margin: 0 auto; width: 100%; }
            .sign-name { font-weight: bold; margin-top: 8px; display: block; }

            /* FOOTER NOTE */
            .footer-note { text-align: center; margin-top: 40px; font-style: italic; font-size: 10px; color: #888; }
          </style>
        </head>
        <body>
          
          <div class="header">
            <h1>${namaToko}</h1>
            <p>${alamatToko}</p>
            <p>Telp: ${telpToko}</p>
          </div>
          <div class="separator"></div>

          <div class="info-container">
            <div class="card">
                <div class="card-title">PELANGGAN</div>
                <div class="row"><span>Nama</span> <span>${item.nama_pelanggan}</span></div>
                <div class="row"><span>Telepon</span> <span>${item.no_telp}</span></div>
                <div class="row"><span>Tgl Masuk</span> <span>${tglMasuk}</span></div>
            </div>
            <div class="card">
                <div class="card-title">NOTA</div>
                <div class="row"><span>No. Nota</span> <span>${noNota}</span></div>
                <div class="row"><span>Tgl Cetak</span> <span>${tglCetak}</span></div>
                <div class="row"><span>Status</span> <span>${item.status}</span></div>
            </div>
          </div>

          <div class="section-title">RINCIAN SERVIS</div>
          <table>
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="40%">Unit / Barang</th>
                <th width="35%">Keluhan / Tindakan</th>
                <th width="20%" class="text-right">Biaya</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>${item.nama_barang}</td>
                <td>${item.keluhan}</td>
                <td class="text-right">${formatRupiah(item.biaya)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3" class="text-right">TOTAL</td>
                <td class="text-right">${formatRupiah(item.biaya)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="footer-sign">
            <div class="sign-box">
                <p>Hormat Kami,</p>
                <div class="line"></div>
                <span class="sign-name">( Admin )</span>
            </div>
            <div class="sign-box">
                <p>Pelanggan,</p>
                <div class="line"></div>
                <span class="sign-name">( ${item.nama_pelanggan} )</span>
            </div>
          </div>

          <div class="footer-note">
            ${footerStruk}
          </div>

        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus(); 
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
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-800 h-fit shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-3">
          <Wrench className="text-blue-500" /> Penerimaan Servis
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-slate-400 text-xs mb-1">Tanggal Masuk</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input type="date" name="tgl_masuk" value={formData.tgl_masuk} onChange={handleChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:border-blue-500" required />
                </div>
             </div>
             
             {/* DROPDOWN PILIH TOKO */}
             <div>
                <label className="block text-slate-400 text-xs mb-1">Lokasi Toko</label>
                <div className="relative">
                    <Store className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <select 
                        name="toko_id" 
                        value={formData.toko_id} 
                        onChange={handleChange} 
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:border-blue-500 appearance-none cursor-pointer"
                        required
                    >
                        <option value="">-- Pilih Toko --</option>
                        {storeList.length > 0 ? (
                            storeList.map((toko) => (
                                <option key={toko.id} value={toko.id}>
                                    {toko.nama_toko}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>Loading Toko...</option>
                        )}
                    </select>
                </div>
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
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all shadow-lg shadow-blue-500/30">
            <Save size={18} /> Simpan Data
          </button>
        </form>
      </div>

      {/* --- LIST SERVIS --- */}
      <div className="xl:col-span-2 space-y-4">
        <h3 className="font-bold text-white mb-2 text-lg">Antrian Servis</h3>
        
        {serviceList.length === 0 ? (
             <div className="text-center py-10 text-slate-500 bg-[#1e293b] rounded-xl border border-slate-800">
                <p className="mb-2">📭</p> Belum ada servis masuk.
            </div>
        ) : (
            serviceList.map((item) => (
                <div key={item.id} className="bg-[#1e293b] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4 hover:border-slate-600 transition-all shadow-lg group">
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                {item.nama_barang}
                            </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-semibold text-slate-300 bg-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <User size={10} /> {item.nama_pelanggan}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={10} /> {item.tgl_masuk}
                            </span>
                            
                            {/* Menampilkan Nama Toko (Jika ada hasil join) */}
                            {item.nama_toko && (
                                <span className="text-xs text-blue-400 flex items-center gap-1 border border-blue-900 bg-blue-900/20 px-2 py-0.5 rounded">
                                    <Store size={10} /> {item.nama_toko}
                                </span>
                            )}
                        </div>
                        <p className="text-red-400 text-sm mt-3 flex items-start gap-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                            <AlertCircle size={14} className="mt-0.5 shrink-0"/> 
                            <span>Keluhan: <span className="text-slate-300 italic">"{item.keluhan}"</span></span>
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between min-w-[220px] gap-3 border-l border-slate-700 pl-4 md:pl-6">
                        <div className="text-right w-full">
                            <p className="text-xs text-slate-400 uppercase tracking-wide">Estimasi Biaya</p>
                            <p className="text-2xl font-bold text-blue-400 tracking-tight">{formatRupiah(item.biaya)}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full justify-end">
                            {/* Tombol Print */}
                            <button onClick={() => handlePrint(item)} className="p-2.5 bg-white text-slate-800 hover:bg-gray-200 rounded-lg transition-colors border border-slate-300 shadow-sm" title="Cetak Nota">
                                <Printer size={18} />
                            </button>

                            {/* Dropdown Status */}
                            <select 
                                value={item.status} 
                                onChange={(e) => handleUpdateStatus(item.id, e.target.value, item.biaya)}
                                className={`text-xs font-bold py-2.5 px-3 rounded-lg cursor-pointer outline-none border-none text-white appearance-none text-center flex-1 transition-colors ${getStatusColor(item.status)}`}
                            >
                                <option value="Masuk" className="text-black">⏳ Baru</option>
                                <option value="Proses" className="text-black">🔧 Proses</option>
                                <option value="Menunggu Sparepart" className="text-black">📦 Part</option>
                                <option value="Selesai" className="text-black">✅ Selesai</option>
                                <option value="Diambil" className="text-black">🏠 Diambil</option>
                            </select>

                            {/* Tombol Hapus */}
                            <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-slate-800 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors border border-slate-700">
                                <Trash2 size={18} />
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