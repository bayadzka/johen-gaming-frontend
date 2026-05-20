"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { Search, Gamepad2, Zap, ShieldCheck, X, Loader2 } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Checkout
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3000/products")
      .then((res) => {
        setProducts(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil produk:", err);
        setLoading(false);
      });
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCheckoutError("");

    try {
      const payload = {
        product_id: selectedProduct.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        voucher_code: voucherCode || undefined,
      };

      const res = await axios.post("http://localhost:3000/orders/checkout", payload);
      
      // Jika sukses, arahkan user ke URL Midtrans
      if (res.data && res.data.order_summary && res.data.order_summary.payment_url) {
        window.location.href = res.data.order_summary.payment_url;
      } else {
        throw new Error("URL Pembayaran tidak ditemukan");
      }
    } catch (err: any) {
      console.error("Checkout gagal:", err);
      setCheckoutError(err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran.");
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    if (!isProcessing) {
      setSelectedProduct(null);
      setCustomerName("");
      setCustomerPhone("");
      setVoucherCode("");
      setCheckoutError("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
      
      {/* --- HERO SECTION --- */}
      <FadeIn direction="down">
        <div className="bg-[#12122A]/40 backdrop-blur-sm rounded-3xl p-8 md:p-14 mb-16 border border-[var(--color-johen-violet)]/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-johen-cyan)]/10 border border-[var(--color-johen-cyan)]/30 text-[var(--color-johen-cyan)] text-xs font-bold tracking-wide mb-6">
                <ShieldCheck size={14} /> 100% AMAN & TERPERCAYA
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                Level Up <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-johen-cyan)] to-[var(--color-johen-magenta)] drop-shadow-lg">
                  Permainanmu!
                </span>
              </h1>
              <p className="text-gray-400 mb-8 max-w-md text-sm md:text-base leading-relaxed">
                Marketplace digital terpercaya. Temukan akun impian atau top up saldo dengan proses instan dan harga yang nggak bikin dompet jebol.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Cari akun atau diamond..." className="w-full bg-[#0A0A1A] border border-[var(--color-johen-violet)]/30 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[var(--color-johen-cyan)] focus:ring-1 focus:ring-[var(--color-johen-cyan)] text-sm transition-all shadow-inner" />
                </div>
                <button className="bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] transition-all px-8 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,200,240,0.4)] hover:shadow-[0_0_30px_rgba(0,200,240,0.6)] hover:-translate-y-0.5">
                  <Zap size={18} className="fill-[#0A0A1A]" /> GAS SEKARANG
                </button>
              </div>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--color-johen-violet)]/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[var(--color-johen-cyan)]/10 blur-[100px] rounded-full pointer-events-none"></div>
        </div>
      </FadeIn>

      {/* --- KATALOG PRODUK --- */}
      <FadeIn delay={0.2}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <h2 className="text-2xl font-extrabold flex items-center gap-3 tracking-wide">
            <span className="w-2 h-8 bg-gradient-to-b from-[var(--color-johen-cyan)] to-[var(--color-johen-violet)] rounded-full shadow-[0_0_15px_var(--color-johen-cyan)]"></span>
            KATALOG PRODUK
          </h2>
          <div className="flex gap-2 bg-[#12122A] p-1.5 rounded-xl border border-white/5">
             <button className="text-xs font-bold px-5 py-2 rounded-lg bg-[var(--color-johen-violet)] text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]">Semua</button>
             <button className="text-xs font-bold px-5 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">Akun</button>
             <button className="text-xs font-bold px-5 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">Top Up</button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-[#12122A]/50 rounded-2xl animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-gray-500 border border-dashed border-[var(--color-johen-violet)]/30 rounded-2xl bg-[#12122A]/20">
            Belum ada produk yang tersedia hari ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-[#12122A]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-[var(--color-johen-cyan)]/50 transition-all duration-500 group flex flex-col h-full hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,200,240,0.1)]">
                <div className="bg-gradient-to-br from-[#1E1E3F] to-[#0A0A1A] h-40 rounded-xl mb-5 flex items-center justify-center border border-white/5 group-hover:border-[var(--color-johen-cyan)]/30 transition duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[var(--color-johen-cyan)]/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <Gamepad2 size={40} className="text-gray-600 group-hover:text-[var(--color-johen-cyan)] group-hover:scale-110 transition-all duration-500 drop-shadow-md" />
                </div>
                <div className="text-[9px] text-[var(--color-johen-cyan)] mb-3 font-extrabold tracking-widest uppercase px-2.5 py-1 bg-[var(--color-johen-cyan)]/10 rounded-md w-fit border border-[var(--color-johen-cyan)]/20">
                  {product.category === 'game_account' ? 'AKUN GAME' : 'TOP UP'}
                </div>
                <h3 className="font-bold text-lg leading-snug line-clamp-2 mb-2 flex-grow group-hover:text-white text-gray-200 transition">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Harga</div>
                    <div className="font-extrabold text-[var(--color-johen-cyan)] text-lg">
                      Rp {product.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                  {/* Pemicu Modal */}
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white/5 border border-white/10 text-white text-xs font-bold px-5 py-2.5 rounded-lg group-hover:bg-[var(--color-johen-cyan)] group-hover:border-[var(--color-johen-cyan)] group-hover:text-[#0A0A1A] group-hover:shadow-[0_0_15px_rgba(0,200,240,0.4)] transition-all duration-300"
                  >
                    Beli
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </FadeIn>

      {/* --- MODAL CHECKOUT --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12122A] border border-[var(--color-johen-violet)]/30 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(124,58,237,0.15)] relative">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#0A0A1A]/50">
              <h3 className="font-bold text-lg">Selesaikan Pembayaran</h3>
              <button onClick={closeModal} disabled={isProcessing} className="text-gray-400 hover:text-white transition disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-5">
              <div className="bg-[var(--color-johen-space)] border border-white/5 rounded-xl p-4 mb-6 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Produk</p>
                  <p className="font-semibold text-sm line-clamp-1">{selectedProduct.name}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-400 mb-1">Total</p>
                  <p className="font-bold text-[var(--color-johen-cyan)] whitespace-nowrap">Rp {selectedProduct.price.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {checkoutError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg mb-4">
                  {checkoutError}
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 ml-1">Nama Lengkap</label>
                  <input required type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={isProcessing} placeholder="Masukkan nama..." className="w-full bg-[var(--color-johen-space)] border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-[var(--color-johen-violet)] text-sm transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 ml-1">Nomor WhatsApp Aktif</label>
                  <input required type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} disabled={isProcessing} placeholder="081234567890" className="w-full bg-[var(--color-johen-space)] border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-[var(--color-johen-violet)] text-sm transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 ml-1">Kode Voucher <span className="opacity-50">(Opsional)</span></label>
                  <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} disabled={isProcessing} placeholder="Ketik JOHENUNTUNG" className="w-full bg-[var(--color-johen-space)] border border-white/10 rounded-lg py-2.5 px-4 focus:outline-none focus:border-[var(--color-johen-cyan)] text-sm transition uppercase" />
                </div>
                
                <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-gradient-to-r from-[var(--color-johen-violet)] to-[var(--color-johen-cyan)] hover:opacity-90 text-white font-bold py-3 rounded-xl transition flex items-center justify-center shadow-lg disabled:opacity-50">
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Bayar Sekarang"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}