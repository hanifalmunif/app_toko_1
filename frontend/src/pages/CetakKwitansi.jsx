import React, { useState, useEffect } from 'react';
import axios from 'axios';
// UPDATE: Menambahkan Trash2 ke import
import { Printer, FileText, Settings, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { BASE_URL } from '../config'; 

const CetakKwitansi = () => {
  // State Form
  const [form, setForm] = useState({
    dari: '', untuk: '', nominal: '', tglManual: ''
  });

  // State Profil
  const [profil, setProfil] = useState({
    yayasan: '', nama_sekolah: '', alamat: '', logo: ''
  });

  const [logoFile, setLogoFile] = useState(null);
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

  // --- UPDATE: FUNGSI HAPUS DATA ---
  const handleDelete = (noKwitansi) => {
    if(window.confirm(`Yakin ingin menghapus kwitansi No: ${noKwitansi}?`)) {
        axios.get(`${BASE_URL}/api_kwitansi.php?action=delete&no_kwitansi=${noKwitansi}`)
            .then(res => {
                // Reload data apapun responsenya (kadang sukses tapi status code beda)
                loadData(); 
                if(!res.data.success) {
                    console.warn("Info Server:", res.data);
                }
            })
            .catch(err => {
                console.error(err);
                loadData(); // Tetap reload untuk memastikan data sinkron
            });
    }
  };

  const handleUpdateProfil = (e) => {
    e.preventDefault();
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
          loadData();
      })
      .catch(() => alert('Gagal update profil'));
  }

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
    
    // Logo logic
    const logoHtml = profil.logo 
        ? `<img src="${BASE_URL}/uploads/${profil.logo}" style="height: 60px; object-fit: contain;" />`
        : `<div style="font-weight:bold; font-size:20px;">LOGO</div>`;

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Kuitansi</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500;700&display=swap');
            
            body { 
                font-family: 'Roboto', sans-serif; 
                margin: 0; padding: 20px; 
                background-color: #fff;
                -webkit-print-color-adjust: exact; 
            }
            
            .receipt-box {
                width: 100%; max-width: 850px;
                height: 400px;
                margin: auto;
                background-color: #FAF9F6; /* Cream color */
                padding: 40px;
                position: relative;
                box-sizing: border-box;
                border-radius: 8px;
                overflow: hidden;
            }

            /* Decorative Circle Bottom Left */
            .deco-circle-bl {
                position: absolute; bottom: -50px; left: -50px;
                width: 150px; height: 150px;
                border: 2px dashed #EE6F57;
                border-radius: 50%; opacity: 0.5;
                pointer-events: none;
            }
             .deco-circle-bl-2 {
                position: absolute; bottom: -40px; left: -40px;
                width: 130px; height: 130px;
                border: 2px dashed #EE6F57;
                border-radius: 50%; opacity: 0.5;
                pointer-events: none;
            }

            /* Decorative Circle Right */
            .deco-circle-r {
                position: absolute; top: 50%; right: -50px; transform: translateY(-50%);
                width: 120px; height: 120px;
                border: 2px dashed #EE6F57;
                border-radius: 50%; opacity: 0.5;
                pointer-events: none;
            }
             .deco-circle-r-2 {
                position: absolute; top: 50%; right: -40px; transform: translateY(-50%);
                width: 100px; height: 100px;
                border: 2px dashed #EE6F57;
                border-radius: 50%; opacity: 0.5;
                pointer-events: none;
            }

            .header {
                display: flex; justify-content: space-between; align-items: flex-end;
                margin-bottom: 10px;
                position: relative; z-index: 2;
            }
            
            .company-info { display: flex; align-items: center; gap: 15px; }
            .company-text h2 { margin: 0; font-size: 18px; color: #333; }
            .company-text p { margin: 0; font-size: 12px; color: #666; }

            .title {
                font-family: 'Playfair Display', serif;
                font-size: 48px;
                font-weight: 700;
                color: #222;
                margin: 0;
                line-height: 1;
            }

            .divider {
                width: 100%; height: 2px; background-color: #EE6F57; /* Salmon color */
                margin-bottom: 25px;
                position: relative; z-index: 2;
            }

            .content { position: relative; z-index: 2; }

            .row-nomor { font-weight: bold; font-size: 14px; margin-bottom: 20px; color: #000; }

            .form-row {
                display: flex; align-items: baseline;
                margin-bottom: 15px;
                font-size: 14px;
            }
            
            .label { width: 160px; color: #444; font-weight: 400; }
            
            .value { 
                flex: 1; 
                border-bottom: 1px solid #EE6F57; /* Salmon underline */
                padding-bottom: 2px;
                font-weight: 700;
                color: #000;
            }

            .amount-container {
                margin-top: 25px;
                display: inline-block;
                background-color: #EE6F57;
                color: white;
                padding: 10px 20px;
                font-weight: bold;
                font-size: 18px;
                border-radius: 2px;
            }

            .footer-row {
                display: flex; justify-content: flex-end;
                margin-top: -40px; /* Pull up to align with amount box area */
                position: relative; z-index: 2;
            }

            .signature-block {
                text-align: left;
                width: 200px;
            }
            
            .date-place { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
            .sign-label { font-size: 14px; margin-bottom: 60px; color: #444; }
            
            .sign-name {
                font-weight: 400;
                border-bottom: 1px solid #EE6F57;
                display: inline-block;
                min-width: 150px;
                padding-bottom: 2px;
            }

          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="deco-circle-bl"></div><div class="deco-circle-bl-2"></div>
            <div class="deco-circle-r"></div><div class="deco-circle-r-2"></div>

            <div class="header">
                <div class="company-info">
                    ${logoHtml}
                    <div class="company-text">
                        <h2>${profil.nama_sekolah || 'Nama Sekolah/Hotel'}</h2>
                        <p>${profil.alamat || 'Alamat Lengkap Instansi'}</p>
                    </div>
                </div>
                <h1 class="title">Kuitansi</h1>
            </div>

            <div class="divider"></div>

            <div class="content">
                <div class="row-nomor">Nomor: ${data.no_kwitansi || '....'}</div>

                <div class="form-row">
                    <div class="label">Sudah terima dari:</div>
                    <div class="value">${data.dari}</div>
                </div>

                <div class="form-row">
                    <div class="label">Banyaknya uang:</div>
                    <div class="value" style="font-style:italic;">${teksTerbilang}</div>
                </div>

                <div class="form-row">
                    <div class="label">Untuk pembayaran:</div>
                    <div class="value">${data.untuk}</div>
                </div>

                <div class="amount-container">
                    Rp${parseInt(data.nominal).toLocaleString('id-ID')},-
                </div>

                <div class="footer-row">
                    <div class="signature-block">
                        <div class="date-place">Bali, ${tglIndo}</div>
                        <div class="sign-label">Penerima,</div>
                        <div class="sign-name">Latif Mulya</div>
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
            setForm({...form, dari:'', untuk:'', nominal:''}); 
        } else { alert('Gagal simpan'); }
    }).catch(err => { setLoading(false); alert('Gagal koneksi'); });
  };

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-4">
      <iframe id="printFrameKwitansi" style={{display:'none'}} title="print"></iframe>

      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl text-white shadow-lg">
         <div className="flex items-center gap-3">
             <FileText className="text-[#EE6F57]" size={32}/>
             <div>
                <h1 className="text-xl font-bold">CETAK KWITANSI</h1>
                <p className="text-xs text-slate-400">Model: Clean Coral Style</p>
             </div>
         </div>
         <button onClick={() => setShowSettings(!showSettings)} className="bg-slate-700 p-2 rounded-lg hover:bg-slate-600 transition">
            <Settings size={20} className={showSettings ? "text-blue-400 animate-spin" : "text-slate-300"}/>
         </button>
      </div>

      {/* --- FORM PENGATURAN --- */}
      {showSettings && (
        <div className="bg-blue-900/20 border border-blue-800 p-6 rounded-xl animate-in fade-in">
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
                <Settings size={18}/> Pengaturan Kop & Logo
            </h3>
            <form onSubmit={handleUpdateProfil} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-400">Nama Sekolah/Instansi</label>
                        <input required value={profil.nama_sekolah} onChange={e=>setProfil({...profil, nama_sekolah:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">Alamat Lengkap</label>
                        <textarea required rows="2" value={profil.alamat} onChange={e=>setProfil({...profil, alamat:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700"></textarea>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-4 bg-slate-900/50">
                    {profil.logo || logoFile ? (
                          <div className="mb-3 relative">
                             <img src={logoFile ? URL.createObjectURL(logoFile) : `${BASE_URL}/uploads/${profil.logo}`} alt="Preview" className="h-24 w-24 object-contain bg-white rounded-full p-1"/>
                          </div>
                    ) : (
                        <ImageIcon size={40} className="text-slate-600 mb-2"/>
                    )}
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 px-4 rounded-lg flex items-center gap-2 border border-slate-600 transition">
                        <Upload size={14}/> {profil.logo ? 'Ganti Logo' : 'Upload Logo'}
                        <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="hidden" />
                    </label>
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold md:col-span-2 mt-2">
                    SIMPAN PENGATURAN
                </button>
            </form>
        </div>
      )}

      {/* --- FORM UTAMA & RIWAYAT --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-xs text-slate-400 font-bold tracking-wider mb-1 block">TELAH TERIMA DARI</label>
                    <input required value={form.dari} onChange={e=>setForm({...form, dari:e.target.value})} className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-600 focus:border-[#EE6F57] outline-none transition" placeholder="Nama Penyetor"/>
                </div>
                <div>
                    <label className="text-xs text-slate-400 font-bold tracking-wider mb-1 block">JUMLAH UANG (RP)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-500 font-bold">Rp</span>
                        <input type="number" required value={form.nominal} onChange={e=>setForm({...form, nominal:e.target.value})} className="w-full p-3 pl-10 rounded-lg bg-slate-900 text-white font-bold text-lg border border-slate-600 focus:border-[#EE6F57] outline-none transition"/>
                    </div>
                    <p className="text-xs text-[#EE6F57] mt-1 italic bg-red-900/20 p-2 rounded border border-red-900/50">
                        Terbilang: {getTerbilang(form.nominal) || '-'}
                    </p>
                </div>
                <div>
                    <label className="text-xs text-slate-400 font-bold tracking-wider mb-1 block">UNTUK PEMBAYARAN</label>
                    <textarea required rows="2" value={form.untuk} onChange={e=>setForm({...form, untuk:e.target.value})} className="w-full p-3 rounded-lg bg-slate-900 text-white border border-slate-600 focus:border-[#EE6F57] outline-none transition" placeholder="Keterangan pembayaran..."></textarea>
                </div>
                <button disabled={loading} className="w-full bg-[#EE6F57] hover:bg-[#d65f49] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-red-900/20 transition-all">
                    {loading ? 'Menyimpan...' : <><Printer size={20}/> CETAK BUKTI PEMBAYARAN</>}
                </button>
            </form>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-fit">
            <h3 className="text-white font-bold mb-3 border-b border-slate-700 pb-2">Riwayat Terakhir</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {riwayat.map((item, i) => (
                    <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-sm hover:border-[#EE6F57] transition group">
                        <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                            <span>{item.no_kwitansi}</span>
                            <span>{item.tgl_kwitansi?.substring(0,10)}</span>
                        </div>
                        <div className="text-white font-bold truncate">{item.dari}</div>
                        <div className="text-[#EE6F57] font-mono text-xs mt-1">Rp {parseInt(item.nominal).toLocaleString('id-ID')}</div>
                        
                        {/* UPDATE: MEMISAHKAN TOMBOL CETAK & HAPUS */}
                        <div className="flex gap-2 mt-2">
                            <button onClick={()=>doPrint(item)} className="flex-1 bg-slate-800 text-slate-300 py-1.5 rounded-lg text-xs group-hover:bg-[#EE6F57] group-hover:text-white transition flex items-center justify-center gap-1 border border-slate-700">
                                <Printer size={12}/> Cetak
                            </button>
                            <button onClick={()=>handleDelete(item.no_kwitansi)} className="w-8 bg-slate-800 text-red-400 py-1.5 rounded-lg text-xs hover:bg-red-600 hover:text-white transition flex items-center justify-center border border-slate-700/50 hover:border-red-500" title="Hapus">
                                <Trash2 size={12}/>
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CetakKwitansi;