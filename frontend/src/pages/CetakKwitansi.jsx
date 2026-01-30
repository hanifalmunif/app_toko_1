import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer, FileText, Settings, Upload, Image as ImageIcon } from 'lucide-react';
import { BASE_URL } from '../config'; 

const CetakKwitansi = () => {
  // State Form (Kelas Dihapus)
  const [form, setForm] = useState({
    dari: '', untuk: '', nominal: '', tglManual: ''
  });

  // State Profil (Tambah Logo)
  const [profil, setProfil] = useState({
    yayasan: '', nama_sekolah: '', alamat: '', logo: ''
  });

  const [logoFile, setLogoFile] = useState(null); // State untuk file yang mau diupload
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    axios.get(`${BASE_URL}/api_kwitansi.php`)
      .then(res => {
        setRiwayat(res.data.riwayat || []);
        if(res.data.profil) {
            setProfil(res.data.profil);
        }
      })
      .catch(err => console.error(err));
  };

  // --- UPDATE PROFIL DENGAN UPLOAD LOGO ---
  const handleUpdateProfil = (e) => {
    e.preventDefault();
    
    // Gunakan FormData agar bisa kirim file gambar
    const formData = new FormData();
    formData.append('action', 'update_profil');
    formData.append('yayasan', profil.yayasan);
    formData.append('nama_sekolah', profil.nama_sekolah);
    formData.append('alamat', profil.alamat);
    
    if (logoFile) {
        formData.append('logo_img', logoFile);
    }

    axios.post(`${BASE_URL}/api_kwitansi.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((res) => { 
          alert('Profil & Logo Berhasil Diupdate!'); 
          setShowSettings(false);
          loadData(); // Reload agar logo baru tampil
      })
      .catch(() => alert('Gagal update profil'));
  }

  // --- RUMUS TERBILANG ---
  const terbilang = (angka) => {
    const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    let hasil = "";
    if (angka < 12) hasil = " " + bil[angka];
    else if (angka < 20) hasil = terbilang(angka - 10) + " Belas";
    else if (angka < 100) hasil = terbilang(Math.floor(angka / 10)) + " Puluh" + terbilang(angka % 10);
    else if (angka < 200) hasil = " Seratus" + terbilang(angka - 100);
    else if (angka < 1000) hasil = terbilang(Math.floor(angka / 100)) + " Ratus" + terbilang(angka % 100);
    else if (angka < 2000) hasil = " Seribu" + terbilang(angka - 1000);
    else if (angka < 1000000) hasil = terbilang(Math.floor(angka / 1000)) + " Ribu" + terbilang(angka % 1000);
    else if (angka < 1000000000) hasil = terbilang(Math.floor(angka / 1000000)) + " Juta" + terbilang(angka % 1000000);
    return hasil;
  };

  const getTerbilang = (nom) => {
    if(!nom) return "";
    return terbilang(parseInt(nom)) + " Rupiah";
  };

  // --- FUNGSI CETAK ---
  const doPrint = (data) => {
    const iframe = document.getElementById('printFrameKwitansi');
    const doc = iframe.contentWindow.document;
    const teksTerbilang = getTerbilang(data.nominal);
    const dateObj = new Date(data.tgl_kwitansi || data.tgl || new Date());
    const tglIndo = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Cek apakah ada logo, jika tidak pakai placeholder teks
    // Pastikan BASE_URL mengarah ke folder gambar yang benar
    const logoHtml = profil.logo 
        ? `<img src="${BASE_URL}/uploads/${profil.logo}" style="width:100%; height:100%; object-fit:contain; border-radius:50%;" />`
        : `<div style="display:flex; align-items:center; justify-content:center; height:100%; font-size:10px;">LOGO</div>`;

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Bukti Pembayaran</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman:ital,wght@0,400;0,700;1,400;1,700&display=swap');
            body { font-family: 'Times New Roman', serif; padding: 10px; -webkit-print-color-adjust: exact; margin: 0; }
            
            .container {
                width: 100%; max-width: 800px; height: 380px;
                border: 1px solid #ccc;
                display: flex; margin: auto; position: relative;
            }

            .sidebar {
                width: 80px; border-right: 2px solid #333;
                margin: 5px 0;
                display: flex; flex-direction: column;
                justify-content: space-between; align-items: center;
                padding: 10px 0; background: white; z-index: 2;
            }
            .sidebar-logo {
                width: 60px; height: 60px;
                border-radius: 50%;
                margin-top: 5px;
            }
            .text-vertical {
                writing-mode: vertical-rl; transform: rotate(180deg); text-align: center;
            }
            .sekolah-nama { font-weight: bold; font-size: 16px; margin-left: 5px; text-transform: uppercase; letter-spacing: 1px;}
            .yayasan-nama { font-size: 10px; margin-left: 2px; }
            .alamat-sekolah { font-size: 8px; margin-left: 2px; }

            .content { flex: 1; padding: 10px 20px; position: relative; }

            .watermark {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                font-size: 100px; font-weight: bold;
                color: rgba(0, 0, 0, 0.03);
                z-index: 0; pointer-events: none;
                white-space: nowrap;
            }

            .header-title {
                text-align: right; font-size: 28px; font-weight: bold; font-style: italic; margin-bottom: 20px;
            }
            .no-surat { font-weight: bold; font-size: 18px; margin-bottom: 10px; }

            .row { display: flex; align-items: baseline; margin-bottom: 8px; position: relative; z-index: 1; }
            .label { width: 130px; font-weight: bold; font-size: 14px; }
            .separator { width: 10px; }
            .value { flex: 1; border-bottom: 1px solid #000; padding-left: 5px; font-size: 14px; position: relative;}

            .bg-strip {
                background: #e0e0e0; display: inline-block; width: 100%;
                padding: 2px 5px; transform: skewX(-15deg); margin-left: -5px;
            }
            .bg-strip span { display: inline-block; transform: skewX(15deg); font-style: italic; font-weight: bold; }

            .footer {
                margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; z-index: 1; position: relative;
            }
            .checkbox-area { font-size: 12px; display: flex; gap: 15px; border: 1px solid #333; padding: 5px; border-radius: 5px; }
            .ttd-area { text-align: center; width: 200px; }
        
          </style>
        </head>
        <body>
          <div class="container">
            
            <div class="sidebar">
                <div class="sidebar-logo">
                    ${logoHtml}
                </div>
                <div class="text-vertical sekolah-nama">${profil.nama_sekolah}</div>
                <div class="text-vertical yayasan-nama">${profil.yayasan}</div>
                <div class="text-vertical alamat-sekolah">${profil.alamat}</div>
            </div>

            <div class="content">
                <div class="watermark">${profil.nama_sekolah}</div>
                
                <div class="header-title">BUKTI PEMBAYARAN</div>

                <div class="no-surat">No. ${data.no_kwitansi || '..........'}</div>

                <div class="row">
                    <div class="label">Telah Terima Dari</div><div class="separator">:</div>
                    <div class="value">${data.dari}</div>
                </div>
                
                <div class="row">
                    <div class="label">Terbilang</div><div class="separator">:</div>
                    <div class="value" style="border:none;">
                        <div class="bg-strip"><span># ${teksTerbilang} #</span></div>
                    </div>
                </div>

                <div class="row" style="margin-top:5px;">
                    <div class="label">Untuk Pembayaran</div><div class="separator">:</div>
                    <div class="value">${data.untuk}</div>
                </div>

                <div class="row" style="margin-top:15px;">
                    <div class="label" style="font-size:16px;">Jumlah Rp.</div><div class="separator"></div>
                    <div class="value" style="border:none; flex: 0.6;">
                         <div class="bg-strip"><span>Rp ${parseInt(data.nominal).toLocaleString('id-ID')},-</span></div>
                    </div>
                </div>

                <div class="footer">
                    <div class="checkbox-area">
                        <div>Pembayaran Via:</div>
                        <div>[ &nbsp; ] Cash</div>
                        <div>[ &nbsp; ] Transfer</div>
                    </div>

                    <div class="ttd-area">
                        <div>Tanggal, ${tglIndo}</div>
                        <br><br><br>
                        <div style="border-bottom:1px dotted #000; padding-bottom:2px;">( Penerima )</div>
                    </div>
                </div>

            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();
    setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post(`${BASE_URL}/api_kwitansi.php`, form).then(res => {
        setLoading(false);
        if(res.data.success) {
            doPrint({ ...form, no_kwitansi: res.data.no_kwitansi, tgl: res.data.tgl });
            loadData();
            setForm({...form, dari:'', untuk:'', nominal:''}); // Reset tanpa kelas
        } else { alert('Gagal simpan'); }
    }).catch(err => { setLoading(false); alert('Gagal koneksi'); });
  };

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-4">
      <iframe id="printFrameKwitansi" style={{display:'none'}} title="print"></iframe>

      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl text-white shadow-lg">
         <div className="flex items-center gap-3">
             <FileText className="text-green-400" size={32}/>
             <div>
                <h1 className="text-xl font-bold">BUKTI PEMBAYARAN</h1>
                <p className="text-xs text-slate-400">Layout sesuai format sekolah</p>
             </div>
         </div>
         <button onClick={() => setShowSettings(!showSettings)} className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition">
            <Settings size={20} className={showSettings ? "text-blue-400 animate-spin" : "text-slate-300"}/>
         </button>
      </div>

      {/* --- FORM PENGATURAN LOGO & KOP --- */}
      {showSettings && (
        <div className="bg-blue-900/20 border border-blue-800 p-6 rounded-xl animate-in fade-in">
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                <Settings size={18}/> Pengaturan Kop & Logo
            </h3>
            <form onSubmit={handleUpdateProfil} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Input Teks */}
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-400">Nama Yayasan (Kecil)</label>
                        <input required value={profil.yayasan} onChange={e=>setProfil({...profil, yayasan:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Nama Sekolah (Besar)</label>
                        <input required value={profil.nama_sekolah} onChange={e=>setProfil({...profil, nama_sekolah:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Alamat Lengkap</label>
                        <textarea required rows="2" value={profil.alamat} onChange={e=>setProfil({...profil, alamat:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700"></textarea>
                    </div>
                </div>

                {/* Input Logo */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-4 bg-slate-900/50">
                    {profil.logo || logoFile ? (
                         <div className="mb-3 relative">
                            {logoFile ? (
                                <img src={URL.createObjectURL(logoFile)} alt="Preview" className="h-24 w-24 object-contain bg-white rounded-full p-1"/>
                            ) : (
                                <img src={`${BASE_URL}/uploads/${profil.logo}`} alt="Current Logo" className="h-24 w-24 object-contain bg-white rounded-full p-1"/>
                            )}
                         </div>
                    ) : (
                        <ImageIcon size={40} className="text-slate-600 mb-2"/>
                    )}
                    
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 px-4 rounded-lg flex items-center gap-2 border border-slate-600 transition">
                        <Upload size={14}/> {profil.logo ? 'Ganti Logo' : 'Upload Logo'}
                        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-2">Format: JPG/PNG, Max 2MB</p>
                </div>

                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold md:col-span-2 shadow-lg shadow-blue-900/20 mt-2">
                    SIMPAN PENGATURAN
                </button>
            </form>
        </div>
      )}

      {/* --- FORM UTAMA & RIWAYAT --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Form Input Kwitansi */}
        <div className="md:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-xs text-slate-400 font-bold tracking-wider mb-1 block">TELAH TERIMA DARI</label>
                    <input required value={form.dari} onChange={e=>setForm({...form, dari:e.target.value})} className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-600 focus:border-blue-500 outline-none transition" placeholder="Nama Penyetor / Siswa"/>
                </div>
                
                {/* Input Kelas sudah dihapus */}
                
                <div>
                    <label className="text-xs text-slate-400 font-bold tracking-wider mb-1 block">JUMLAH UANG (RP)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-500 font-bold">Rp</span>
                        <input type="number" required value={form.nominal} onChange={e=>setForm({...form, nominal:e.target.value})} className="w-full p-3 pl-10 rounded-lg bg-slate-900 text-white font-bold text-lg border border-slate-600 focus:border-green-500 outline-none transition"/>
                    </div>
                    <p className="text-xs text-green-400 mt-1 italic bg-green-900/20 p-2 rounded border border-green-900/50">
                        Terbilang: {getTerbilang(form.nominal) || '-'}
                    </p>
                </div>
                <div>
                    <label className="text-xs text-slate-400 font-bold tracking-wider mb-1 block">UNTUK PEMBAYARAN</label>
                    <textarea required rows="2" value={form.untuk} onChange={e=>setForm({...form, untuk:e.target.value})} className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-600 focus:border-blue-500 outline-none transition" placeholder="Contoh: SPP Bulan Januari 2024"></textarea>
                </div>
                
                <button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-green-900/20 transition-all transform active:scale-95">
                    {loading ? 'Menyimpan...' : <><Printer size={20}/> CETAK BUKTI PEMBAYARAN</>}
                </button>
            </form>
        </div>

        {/* List Riwayat */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-fit">
            <h3 className="text-white font-bold mb-3 border-b border-slate-700 pb-2">Riwayat Terakhir</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {riwayat.map((item, i) => (
                    <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-sm hover:border-slate-500 transition">
                        <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                            <span>{item.no_kwitansi}</span>
                            <span>{item.tgl_kwitansi?.substring(0,10)}</span>
                        </div>
                        <div className="text-white font-bold truncate">{item.dari}</div>
                        <div className="text-green-400 font-mono text-xs mt-1">Rp {parseInt(item.nominal).toLocaleString('id-ID')}</div>
                        <button onClick={()=>doPrint(item)} className="w-full mt-2 bg-slate-800 text-blue-400 py-1.5 rounded-lg text-xs hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-1 border border-slate-700">
                            <Printer size={12}/> Cetak Ulang
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CetakKwitansi;