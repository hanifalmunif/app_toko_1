import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer, FileText, History, Trash2, Settings, X, Save } from 'lucide-react';
import { BASE_URL } from '../config'; 

const CetakKwitansi = () => {
  // State Form
  const [form, setForm] = useState({
    dari: '', kelas: '', untuk: '', nominal: '', tglManual: ''
  });

  // State Profil
  const [profil, setProfil] = useState({
    yayasan: '', nama_sekolah: '', alamat: ''
  });

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

  const handleUpdateProfil = (e) => {
    e.preventDefault();
    axios.post(`${BASE_URL}/api_kwitansi.php`, { action: 'update_profil', ...profil })
      .then(() => { alert('Kop Update!'); setShowSettings(false); });
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
                border: 1px solid #ccc; /* Border luar tipis buat guide */
                display: flex;
                margin: auto;
                position: relative;
            }

            /* --- SIDEBAR KIRI (VERTICAL TEXT) --- */
            .sidebar {
                width: 80px;
                border: 2px solid #333;
                border-radius: 15px;
                margin: 5px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                background: white;
                z-index: 2;
            }
            .sidebar-logo {
                width: 50px; height: 50px;
                border-radius: 50%;
                background: #ddd; /* Placeholder Logo */
                display: flex; align-items: center; justify-content: center;
                font-size: 8px; text-align: center;
                border: 1px solid #333;
                margin-top: 10px;
            }
            .text-vertical {
                writing-mode: vertical-rl;
                transform: rotate(180deg);
                text-align: center;
            }
            .sekolah-nama { font-weight: bold; font-size: 16px; margin-left: 5px; text-transform: uppercase; letter-spacing: 1px;}
            .yayasan-nama { font-size: 10px; margin-left: 2px; }
            .alamat-sekolah { font-size: 8px; margin-left: 2px; }

            /* --- KONTEN KANAN --- */
            .content {
                flex: 1;
                padding: 10px 20px;
                position: relative;
            }

            /* Watermark Logo Tengah */
            .watermark {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                font-size: 150px; font-weight: bold;
                color: rgba(0, 128, 0, 0.05); /* Hijau transparan */
                z-index: 0; pointer-events: none;
            }

            .header-title {
                text-align: right;
                font-size: 28px;
                font-weight: bold;
                font-style: italic;
                margin-bottom: 20px;
                font-family: 'Times New Roman', serif;
            }

            .no-surat {
                font-weight: bold; font-size: 18px; margin-bottom: 10px;
            }

            .row { display: flex; align-items: baseline; margin-bottom: 6px; position: relative; z-index: 1; }
            .label { width: 130px; font-weight: bold; font-size: 14px; }
            .separator { width: 10px; }
            .value { flex: 1; border-bottom: 1px solid #000; padding-left: 5px; font-size: 14px; position: relative;}

            /* Strip Abu-abu untuk Terbilang & Jumlah */
            .bg-strip {
                background: #e0e0e0;
                display: inline-block;
                width: 100%;
                padding: 2px 5px;
                /* Efek miring di ujung seperti gambar */
                transform: skewX(-15deg);
                margin-left: -5px;
            }
            .bg-strip span {
                display: inline-block;
                transform: skewX(15deg); /* Balikin teks biar tegak */
                font-style: italic;
                font-weight: bold;
            }

            .footer {
                margin-top: 25px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                z-index: 1; position: relative;
            }
            .checkbox-area { font-size: 12px; display: flex; gap: 15px; border: 1px solid #333; padding: 5px; border-radius: 5px; }
            .ttd-area { text-align: center; width: 200px; }
        
          </style>
        </head>
        <body>
          <div class="container">
            
            <div class="sidebar">
                <div class="sidebar-logo">LOGO</div>
                <div class="text-vertical sekolah-nama">${profil.nama_sekolah}</div>
                <div class="text-vertical yayasan-nama">${profil.yayasan}</div>
                <div class="text-vertical alamat-sekolah">${profil.alamat}</div>
            </div>

            <div class="content">
                <div class="watermark">LOGO</div>
                
                <div class="header-title">BUKTI PEMBAYARAN</div>

                <div class="no-surat">No. ${data.no_kwitansi || '..........'}</div>

                <div class="row">
                    <div class="label">Telah Terima Dari</div><div class="separator">:</div>
                    <div class="value">${data.dari}</div>
                </div>
                
                <div class="row">
                    <div class="label">Kelas</div><div class="separator">:</div>
                    <div class="value">${data.kelas || '-'}</div>
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
                 <div class="row">
                    <div class="label"></div><div class="separator"></div>
                    <div class="value"></div>
                </div>

                <div class="row" style="margin-top:10px;">
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
            setForm({...form, dari:'', kelas:'', untuk:'', nominal:''});
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
         <button onClick={() => setShowSettings(!showSettings)} className="bg-slate-700 p-2 rounded-lg">
            <Settings size={20} className={showSettings ? "text-blue-400 animate-spin" : "text-slate-300"}/>
         </button>
      </div>

      {showSettings && (
        <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-xl animate-in fade-in">
            <h3 className="text-blue-400 font-bold mb-3">Edit Kop Samping (Vertical)</h3>
            <form onSubmit={handleUpdateProfil} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input required value={profil.yayasan} onChange={e=>setProfil({...profil, yayasan:e.target.value})} className="p-2 rounded bg-slate-900 text-white border border-slate-700" placeholder="Yayasan (Teks Kecil)"/>
                <input required value={profil.nama_sekolah} onChange={e=>setProfil({...profil, nama_sekolah:e.target.value})} className="p-2 rounded bg-slate-900 text-white border border-slate-700" placeholder="Nama Sekolah (Teks Besar)"/>
                <input required value={profil.alamat} onChange={e=>setProfil({...profil, alamat:e.target.value})} className="p-2 rounded bg-slate-900 text-white border border-slate-700" placeholder="Alamat (Teks Bawah)"/>
                <button type="submit" className="bg-blue-600 text-white py-2 rounded font-bold md:col-span-3">SIMPAN</button>
            </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400">TELAH TERIMA DARI</label>
                        <input required value={form.dari} onChange={e=>setForm({...form, dari:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600" placeholder="Nama Siswa"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400">KELAS</label>
                        <input required value={form.kelas} onChange={e=>setForm({...form, kelas:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600" placeholder="Contoh: XII IPA 1"/>
                    </div>
                </div>
                
                <div>
                    <label className="text-xs text-slate-400">JUMLAH UANG (RP)</label>
                    <input type="number" required value={form.nominal} onChange={e=>setForm({...form, nominal:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white font-bold text-lg border border-slate-600"/>
                    <p className="text-xs text-green-400 mt-1 italic">{getTerbilang(form.nominal)}</p>
                </div>
                <div>
                    <label className="text-xs text-slate-400">UNTUK PEMBAYARAN</label>
                    <textarea required rows="2" value={form.untuk} onChange={e=>setForm({...form, untuk:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600"></textarea>
                </div>
                
                <button disabled={loading} className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2">
                    {loading ? 'Menyimpan...' : <><Printer size={20}/> CETAK BUKTI PEMBAYARAN</>}
                </button>
            </form>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-fit">
            <h3 className="text-white font-bold mb-3">Riwayat</h3>
            <div className="space-y-2">
                {riwayat.map((item, i) => (
                    <div key={i} className="bg-slate-900 p-3 rounded border border-slate-700 text-sm">
                        <div className="flex justify-between text-slate-400 text-xs">
                            <span>{item.no_kwitansi}</span>
                            <span>{item.tgl_kwitansi?.substring(0,10)}</span>
                        </div>
                        <div className="text-white font-bold">{item.dari} ({item.kelas})</div>
                        <div className="text-green-400">Rp {parseInt(item.nominal).toLocaleString('id-ID')}</div>
                        <button onClick={()=>doPrint(item)} className="w-full mt-2 bg-blue-900/30 text-blue-400 py-1 rounded text-xs hover:bg-blue-600 hover:text-white">Cetak Ulang</button>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CetakKwitansi;