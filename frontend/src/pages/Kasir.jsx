import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Trash2, Printer, DollarSign, Calendar } from 'lucide-react';
import { BASE_URL } from '../config';

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [bayar, setBayar] = useState('');
  
  // State Tanggal Manual (Default hari ini)
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(`${BASE_URL}/api_produk.php`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  const addToCart = (product) => {
    if (product.stok <= 0) return alert("Stok Habis!");
    const existItem = cart.find(x => x.id === product.id);
    if (existItem) {
        if (existItem.qty >= product.stok) return alert("Stok tidak cukup!");
        setCart(cart.map(x => x.id === product.id ? { ...existItem, qty: existItem.qty + 1 } : x));
    } else {
        setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (product) => {
    const existItem = cart.find(x => x.id === product.id);
    if (existItem.qty === 1) {
        setCart(cart.filter(x => x.id !== product.id));
    } else {
        setCart(cart.map(x => x.id === product.id ? { ...existItem, qty: existItem.qty - 1 } : x));
    }
  };

  const grandTotal = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
  const kembalian = bayar - grandTotal;
  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // --- FUNGSI CETAK STRUK THERMAL ---
  const handlePrint = (noNota, tgl, items, total, bayar, kembali) => {
    const printWindow = window.open('', '', 'height=600,width=400');
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Belanja - ${noNota}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; color: #000; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="bold" style="font-size: 16px;">TOKO KOMPUTER</div>
            <div>Jl. Teknologi Digital No. 99</div>
          </div>
          <div class="line"></div>
          <div>No Nota: ${noNota}</div>
          <div>Tanggal: ${tgl}</div>
          <div class="line"></div>
          ${items.map(item => `
            <div>${item.nama_produk}</div>
            <div class="flex">
              <span>${item.qty} x ${parseInt(item.harga).toLocaleString()}</span>
              <span>${(item.qty * item.harga).toLocaleString()}</span>
            </div>
          `).join('')}
          <div class="line"></div>
          <div class="flex bold"><span>TOTAL</span><span>Rp ${parseInt(total).toLocaleString()}</span></div>
          <div class="flex"><span>TUNAI</span><span>Rp ${parseInt(bayar).toLocaleString()}</span></div>
          <div class="flex"><span>KEMBALI</span><span>Rp ${parseInt(kembali).toLocaleString()}</span></div>
          <div class="line"></div>
          <div class="center">Terima Kasih & Selamat Belanja Kembali</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    // Tunggu render selesai baru print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
  };

  const handleCheckout = () => {
    if (cart.length === 0 || bayar < grandTotal) return alert("Cek Keranjang / Uang Kurang!");

    axios.post(`${BASE_URL}/api_kasir.php`, {
        tanggal: tanggal, // Kirim tanggal manual
        total: grandTotal,
        bayar: parseInt(bayar),
        kembalian: kembalian,
        keranjang: cart
    }).then((res) => {
        // Cetak Struk setelah sukses
        handlePrint(res.data.no_nota, tanggal, cart, grandTotal, bayar, kembalian);
        
        // Reset
        setCart([]);
        setBayar('');
        fetchProducts();
        alert("Transaksi Berhasil!");
    }).catch(err => alert("Gagal transaksi"));
  };

  const filteredProducts = products.filter(p => p.nama_produk.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      
      {/* KIRI: DAFTAR BARANG */}
      <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
         <div className="p-4 bg-[#0f172a] border-b border-slate-700 sticky top-0 z-10">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
                <input type="text" placeholder="Cari Barang..." className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500" onChange={(e) => setSearch(e.target.value)}/>
            </div>
         </div>
         <div className="p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
            {filteredProducts.map((item) => (
                <div key={item.id} onClick={() => addToCart(item)} className="bg-[#0f172a] border border-slate-700 p-4 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-slate-800 transition-all flex flex-col justify-between h-32">
                    <div>
                        <h4 className="font-bold text-white text-sm line-clamp-2">{item.nama_produk}</h4>
                        <span className="text-xs text-slate-500">{item.merk}</span>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-blue-400 font-bold text-sm">{formatRupiah(item.harga)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${item.stok > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>Stok: {item.stok}</span>
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* KANAN: KERANJANG & CHECKOUT */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 flex flex-col h-full">
         <div className="p-4 border-b border-slate-700 bg-[#0f172a] space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2"><ShoppingCart className="text-blue-500"/> Kasir</h3>
            
            {/* INPUT TANGGAL MANUAL */}
            <div>
                <label className="text-xs text-slate-500 block mb-1">Tanggal Transaksi</label>
                <div className="flex items-center gap-2 bg-[#1e293b] p-2 rounded border border-slate-700">
                    <Calendar size={16} className="text-slate-400"/>
                    <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="bg-transparent text-white text-sm outline-none w-full"/>
                </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? <div className="text-center text-slate-500 mt-10">Keranjang Kosong</div> : cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-[#0f172a] p-3 rounded-lg border border-slate-700">
                    <div className="flex-1">
                        <div className="text-white text-sm font-bold">{item.nama_produk}</div>
                        <div className="text-blue-400 text-xs">{formatRupiah(item.harga)} x {item.qty}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-white font-bold text-sm">{formatRupiah(item.harga * item.qty)}</div>
                        <button onClick={() => removeFromCart(item)} className="text-red-500"><Trash2 size={16}/></button>
                    </div>
                </div>
            ))}
         </div>

         <div className="p-4 border-t border-slate-700 bg-[#0f172a] space-y-3">
            <div className="flex justify-between text-white text-xl font-bold"><span>Total</span><span>{formatRupiah(grandTotal)}</span></div>
            <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-slate-500" size={18}/>
                <input type="number" placeholder="Uang Tunai..." className="w-full bg-[#1e293b] border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white text-lg font-bold focus:outline-none focus:border-green-500" value={bayar} onChange={(e) => setBayar(e.target.value)}/>
            </div>
            {bayar >= grandTotal && grandTotal > 0 && (
                <div className="text-center bg-green-900/20 py-2 rounded border border-green-900/50">
                    <span className="text-green-400 block text-xs">Kembalian</span>
                    <span className="text-green-400 font-bold text-lg">{formatRupiah(kembalian)}</span>
                </div>
            )}
            <button onClick={handleCheckout} disabled={cart.length === 0 || bayar < grandTotal} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${cart.length > 0 && bayar >= grandTotal ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                <Printer size={20}/> Bayar & Cetak
            </button>
         </div>
      </div>
    </div>
  );
};

export default Kasir;