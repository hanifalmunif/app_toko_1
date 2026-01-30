import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, Printer, History, Settings, Save, X, Trash2 } from 'lucide-react';
import { BASE_URL } from '../config';

const TokenPln = () => {
  // --- STATE ---
  const [form, setForm] = useState({
    idPel: '', namaPel: '', tarif: 'R1', daya: '1300',
    nominal: '20000', admin: '3000', tglManual: ''
  });
  
  // State Toko Default
  const [toko, setToko] = useState({
    nama_toko: 'KONTER PULSA', 
    alamat_toko: 'Indonesia',
    no_hp: '-', 
    footer_struk: 'Terima Kasih'
  });
  
  const [showSetting, setShowSetting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [riwayat, setRiwayat] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load Riwayat
    axios.get(`${BASE_URL}/api_digital.php`)
         .then(res => {
             if(Array.isArray(res.data)) {
                 setRiwayat(res.data);
             }
         })
         .catch(err => console.error("Gagal load riwayat:", err));

    // Load Toko
    axios.get(`${BASE_URL}/api_digital.php?action=get_toko`)
         .then(res => {
             if(res.data && res.data.nama_toko) setToko(res.data);
         });
  };

  // --- FUNGSI FORMAT TANGGAL INDONESIA (ANTI ERROR) ---
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    try {
      // Ubah format MySQL "2026-01-30 15:59:20" jadi format ISO "2026-01-30T15:59:20"
      // agar bisa dibaca oleh JavaScript di semua browser
      const dateObj = new Date(tanggal.replace(" ", "T")); 
      
      // Cek apakah tanggal valid
      if (isNaN(dateObj.getTime())) return tanggal; // Kalau gagal, kembalikan teks aslinya
      
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return tanggal; 
    }
  };

  // --- FUNGSI CETAK STRUK (HTML) ---
  const doPrint = (dataPrint) => {
    try {
        const infoToko = dataPrint.toko || toko;
        
        const namatoko = infoToko.nama_toko || "KONTER PULSA";
        const alamattoko = infoToko.alamat_toko || "-";
        const hptoko = infoToko.no_hp || "-";
        const footertoko = infoToko.footer_struk || "Terima Kasih";

        const iframe = document.getElementById('printFrame');
        const doc = iframe.contentWindow.document;

        // Gunakan fungsi formatTanggal agar tidak "Invalid Date"
        const tglCetak = formatTanggal(dataPrint.tgl);
        const tglSekarang = new Date().toLocaleString('id-ID');

        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Struk PLN</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap');
                body { font-family: 'Inconsolata', monospace; font-size: 11px; margin: 0; padding: 10px; width: 58mm; }
                .c { text-align: center; } 
                .b { font-weight: bold; } 
                .r { text-align: right; }
                .dash { border-bottom: 1px dashed #000; margin: 5px 0; }
                .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                .token { font-size: 14px; font-weight: bold; margin: 10px 0; letter-spacing: 1px; word-break: break-all; }
              </style>
            </head>
            <body>
              <div class="c b" style="font-size:14px">${namatoko}</div>
              <div class="c" style="font-size:10px">${alamattoko}<br>HP: ${hptoko}</div>
              
              <div class="dash"></div>
              <div class="c b">STRUK PLN PRABAYAR</div>
              <div class="dash"></div>
              
              <div class="row"><span>Tgl:</span><span class="r">${tglCetak}</span></div>
              <div class="row"><span>ID Pel:</span><span class="r">${dataPrint.id_pel}</span></div>
              <div class="row"><span>Nama:</span><span class="r">${dataPrint.nama}</span></div>
              <div class="row"><span>Tarif/Daya:</span><span class="r">${dataPrint.tarif}/${dataPrint.daya}</span></div>
              <div class="row"><span>Nominal:</span><span class="r">Rp ${parseInt(dataPrint.nominal).toLocaleString('id-ID')}</span></div>
              <div class="row"><span>Kwh:</span><span class="r">${dataPrint.kwh}</span></div>
              
              <div class="dash"></div>
              <div class="row b" style="font-size:13px"><span>TOTAL:</span><span class="r">Rp ${parseInt(dataPrint.total).toLocaleString('id-ID')}</span></div>
              <div class="dash"></div>

              <div style="margin-top:5px">TOKEN STROOM:</div>
              <div class="token c">${dataPrint.token}</div>

              <div class="c" style="margin-top:10px; font-size:10px;">
                ${footertoko}<br>
                ${tglSekarang}
              </div>
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 500);

    } catch (err) {
        console.error(err);
        alert("Gagal mencetak: " + err.message);
    }
  };

  // --- FUNGSI CETAK ULANG (VERSI AMAN / ANTI ERROR) ---
  const handleReprint = (item) => {
    console.log("Data Item Raw:", item);

    try {
        let detail = {};
        let isJsonValid = false;
        
        // Ambil data mentah, prioritaskan nama_produk, lalu keterangan
        const rawData = item.nama_produk || item.keterangan || "";

        // 1. Coba Parse JSON Normal (Cara Benar)
        try {
            if (rawData && rawData.trim().startsWith('{')) {
                detail = JSON.parse(rawData);
                isJsonValid = true;
            }
        } catch (e) {
            console.warn("JSON Error, mencoba manual parsing...", e);
        }

        // 2. Jika JSON Gagal (Data Terpotong), Coba Ambil Manual (Regex)
        if (!isJsonValid) {
            const extract = (key) => {
                // Regex sederhana untuk mencari "key":"value" meskipun kurung kurawal hilang
                const match = rawData.match(new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`));
                return match ? match[1] : null;
            };

            detail = {
                id_pel: extract("id_pel") || extract("id") || extract("id_pelanggan"),
                nama: extract("nama") || extract("nama_pelanggan"),
                token: extract("token") || extract("token_stroom") || "DATA TERPOTONG",
                tarif: extract("tarif"),
                daya: extract("daya"),
                kwh: extract("kwh") || extract("jml_kwh")
            };
            
            // Beri notifikasi tapi JANGAN crash
            alert("PERINGATAN: Data struk ini rusak di database (Terpotong). Sistem mencoba menampilkan data seadanya.");
        }

        // 3. Mapping Data untuk Print
        const nominalFix = detail.nominal_asli 
            ? detail.nominal_asli 
            : (parseInt(item.total_belanja) - (parseInt(form.admin) || 3000)); 

        // Eksekusi Print
        doPrint({
            toko: toko, 
            tgl: item.tgl_transaksi,
            id_pel: detail.id_pel || detail.id || "-",
            nama: detail.nama || "Pelanggan",
            tarif: detail.tarif || "-", 
            daya: detail.daya || "-",
            nominal: nominalFix,
            total: item.total_belanja,
            kwh: detail.kwh || "-", 
            token: detail.token || "TOKEN HILANG"
        });

    } catch (e) {
        console.error("Error Reprint Fatal:", e);
        alert("Gagal memproses data: " + e.message);
    }
  };

  // --- HANDLE PROSES TRANSAKSI BARU ---
  const handleProses = (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
        id_pelanggan: form.idPel,
        nama_pelanggan: form.namaPel,
        tarif: form.tarif,
        daya: form.daya,
        nominal: form.nominal,
        admin: form.admin,
        tgl_manual: form.tglManual
    };

    axios.post(`${BASE_URL}/api_digital.php`, payload)
      .then(res => {
        setLoading(false);
        if(res.data.success) {
            // Sukses -> Cetak Langsung
            doPrint(res.data.data_cetak);
            loadData();
            // Reset form
            setForm(prev => ({...prev, idPel: '', namaPel: '', tglManual: ''}));
        } else {
            alert("Gagal: " + JSON.stringify(res.data));
        }
      })
      .catch(err => {
        setLoading(false);
        alert("Koneksi Error: " + err.message);
      });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-2">
      
      {/* IFRAME PRINT (HIDDEN) */}
      <iframe id="printFrame" style={{display:'none'}} title="struk"></iframe>

      {/* HEADER */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl text-white shadow">
         <div className="flex items-center gap-2 font-bold text-xl"><Zap className="text-yellow-500"/> PLN TOKEN</div>
         <button onClick={()=>setShowSetting(!showSetting)} className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded flex gap-2 text-sm transition"><Settings size={18}/> Atur Toko</button>
      </div>

      {/* PENGATURAN TOKO */}
      {showSetting && (
          <div className="bg-slate-700 p-4 rounded-xl space-y-3 border border-slate-600 animate-in fade-in slide-in-from-top-4">
              <input value={toko.nama_toko} onChange={e=>setToko({...toko, nama_toko:e.target.value})} placeholder="Nama Toko" className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600" />
              <input value={toko.alamat_toko} onChange={e=>setToko({...toko, alamat_toko:e.target.value})} placeholder="Alamat" className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600" />
              <div className="grid grid-cols-2 gap-2">
                 <input value={toko.no_hp} onChange={e=>setToko({...toko, no_hp:e.target.value})} placeholder="No HP" className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600" />
                 <input value={toko.footer_struk} onChange={e=>setToko({...toko, footer_struk:e.target.value})} placeholder="Footer Struk" className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600" />
              </div>
              <button onClick={()=>{
                  axios.post(`${BASE_URL}/api_digital.php?action=save_toko`, toko).then(()=>{ alert("Toko Disimpan!"); setShowSetting(false); });
              }} className="bg-green-600 hover:bg-green-500 text-white w-full py-2 rounded font-bold flex justify-center gap-2 transition"><Save size={18}/> SIMPAN PENGATURAN</button>
          </div>
      )}

      {/* FORM TRANSAKSI */}
      <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
        <form onSubmit={handleProses} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">ID PELANGGAN</label>
                    <input required value={form.idPel} onChange={e=>setForm({...form, idPel:e.target.value})} className="w-full p-3 rounded-lg bg-slate-900 text-white font-mono border border-slate-600 focus:border-yellow-500 outline-none" placeholder="Contoh: 12345678"/>
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">NAMA PELANGGAN</label>
                    <input required value={form.namaPel} onChange={e=>setForm({...form, namaPel:e.target.value})} className="w-full p-3 rounded-lg bg-slate-900 text-white uppercase border border-slate-600 focus:border-yellow-500 outline-none" placeholder="Contoh: BUDI"/>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="text-xs text-slate-400 mb-1 block">TARIF</label>
                    <select value={form.tarif} onChange={e=>setForm({...form, tarif:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600"><option>R1</option><option>R1M</option><option>B1</option></select>
                 </div>
                 <div>
                    <label className="text-xs text-slate-400 mb-1 block">DAYA</label>
                    <select value={form.daya} onChange={e=>setForm({...form, daya:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white border border-slate-600"><option>450</option><option>900</option><option>1300</option><option>2200</option><option>3500</option></select>
                 </div>
                 <div className="relative">
                    <label className="text-xs text-slate-400 mb-1 block">TGL MANUAL (OPSIONAL)</label>
                    <input type="datetime-local" value={form.tglManual} onChange={e=>setForm({...form, tglManual:e.target.value})} className="w-full p-2 rounded bg-slate-900 text-white text-xs border border-slate-600 h-[42px]"/>
                    {form.tglManual && <X size={16} className="absolute right-2 top-8 text-red-400 cursor-pointer hover:text-white" onClick={()=>setForm({...form, tglManual:''})}/>}
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-700">
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">NOMINAL TOKEN</label>
                    <select value={form.nominal} onChange={e=>setForm({...form, nominal:e.target.value})} className="w-full p-2 rounded bg-slate-800 text-white font-bold border border-slate-600">
                        <option value="20000">20.000</option>
                        <option value="50000">50.000</option>
                        <option value="100000">100.000</option>
                        <option value="200000">200.000</option>
                        <option value="500000">500.000</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">BIAYA ADMIN</label>
                    <input type="number" value={form.admin} onChange={e=>setForm({...form, admin:e.target.value})} className="w-full p-2 rounded bg-slate-800 text-white text-right font-bold border border-slate-600" placeholder="3000"/>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition active:scale-95 shadow-lg shadow-yellow-900/20">
                {loading ? 'Memproses Transaksi...' : <><Printer size={20}/> PROSES & CETAK STRUK</>}
            </button>
        </form>
      </div>

      {/* TABEL RIWAYAT */}
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md">
         <div className="p-4 bg-slate-900 text-white font-bold flex gap-2 items-center"><History size={18} className="text-blue-400"/> Riwayat Transaksi Terakhir</div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-300">
                <thead className="bg-slate-700/50 text-slate-200">
                    <tr>
                        <th className="p-3 text-left">Tanggal</th>
                        <th className="p-3 text-left">No Nota</th>
                        <th className="p-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {riwayat.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-700/30 transition">
                            <td className="p-3 whitespace-nowrap">{formatTanggal(item.tgl_transaksi)}</td>
                            <td className="p-3 font-mono text-yellow-500 font-bold">{item.no_nota}</td>
                            <td className="p-3 text-right space-x-2">
                                <button type="button" onClick={()=>handleReprint(item)} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded text-xs font-bold border border-blue-500/30 transition">CETAK ULANG</button>
                                <button type="button" onClick={()=>{ if(confirm('Hapus Data ini?')) axios.get(`${BASE_URL}/api_digital.php?action=delete&no_nota=${item.no_nota}`).then(loadData) }} className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-2 py-1 rounded text-xs border border-red-500/30 transition"><Trash2 size={14}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default TokenPln;