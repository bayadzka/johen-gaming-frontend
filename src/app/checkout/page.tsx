"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { ArrowLeft, ShieldCheck, ShoppingCart, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uehkjsmiyyfvuyblwzau.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGtqc21peXlmdnV5Ymx3emF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MTI0MywiZXhwIjoyMDk0ODQ3MjQzfQ.ukwQf7Ch4_5bs_yFTu_s1mGHhYPKVyKorn55iwINRjw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function CheckoutPage() {
  const router = useRouter();
  
  // State diubah untuk menampung 1 item saja
  const [checkoutItem, setCheckoutItem] = useState<any>(null);
  const [waNumber, setWaNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherMsg, setVoucherMsg] = useState({ text: "", isError: false });
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  useEffect(() => {
    // Mengecek memori kasir ('checkout-item'), bukan keranjang ('johen-cart')
    const savedCheckout = localStorage.getItem("checkout-item");
    if (savedCheckout) {
      setCheckoutItem(JSON.parse(savedCheckout));
    } else {
      router.push("/"); // Kalau kosong, lempar balik ke beranda
    }
    // --- PENANGKAP AUTO-FILL NO WA ---
    const savedPhone = localStorage.getItem("user-phone");
    if (savedPhone && savedPhone !== "undefined" && savedPhone !== "") {
      let cleanPhone = savedPhone;
      if (cleanPhone.startsWith("62")) cleanPhone = cleanPhone.slice(2);
      else if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.slice(1);
      setWaNumber(cleanPhone); // setWaNumber untuk checkout
    }
  }, [router]);
  const handleCekVoucher = async () => {
    if (!voucherInput) return;
    setIsCheckingVoucher(true);
    setVoucherMsg({ text: "", isError: false });

    try {
      // Cari voucher di Supabase berdasarkan inputan user (huruf besar semua)
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherInput.toUpperCase())
        .single();

      if (error || !data) {
        setVoucherMsg({ text: "Kode voucher tidak ditemukan.", isError: true });
        return;
      }

      // Cek Limit Kuota
      if (data.current_usage >= data.max_usage) {
        setVoucherMsg({ text: "Kuota voucher ini sudah habis (Limit).", isError: true });
        return;
      }

      // Cek Masa Berlaku
      if (new Date(data.expired_at) < new Date()) {
        setVoucherMsg({ text: "Masa berlaku voucher sudah kadaluarsa.", isError: true });
        return;
      }

      // Jika lulus semua cek, terapkan diskon!
      setAppliedVoucher(data);
      setVoucherMsg({ text: `Voucher diskon ${data.discount_percent}% berhasil diterapkan!`, isError: false });
    } catch (err) {
      setVoucherMsg({ text: "Terjadi kesalahan saat mengecek voucher.", isError: true });
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  // Logika Matematika Diskon
  const basePrice = checkoutItem ? Number(checkoutItem.price) : 0;
  const discountAmount = appliedVoucher ? (basePrice * appliedVoucher.discount_percent) / 100 : 0;
  const finalPriceToPay = basePrice - discountAmount;

  const handleBuatPesanan = async () => {
    if (waNumber.length < 9) {
      setErrorMsg("Nomor WhatsApp tidak valid. Minimal 9 angka.");
      return;
    }
    
    setIsProcessing(true);
    setErrorMsg("");

    try {
      const loggedInName = localStorage.getItem("user-name") || "Guest";
      const loggedInEmail = localStorage.getItem("user-email") || "";
      const payload = {
        order_type: 'account',
        product_ref_id: checkoutItem.id,
        customer_name: loggedInName, 
        customer_phone: waNumber,
        customer_email: loggedInEmail,
        game_credentials: { 
          product_name: checkoutItem.name,
          final_discounted_price: finalPriceToPay 
        },
        total_amount: finalPriceToPay,
        voucher_code: appliedVoucher ? appliedVoucher.code : null
      };

      const response = await axios.post("http://localhost:3000/orders/checkout", payload);
      const orderId = response.data.order_summary?.order_id;
      
      if (orderId) {
        // Jika transaksi berhasil dan menggunakan voucher, update kuota pemakaian di Supabase
        if (appliedVoucher) {
          await supabase
            .from('vouchers')
            .update({ current_usage: appliedVoucher.current_usage + 1 })
            .eq('id', appliedVoucher.id);
        }

        // Hapus item dari keranjang (kalau user checkout dari keranjang)
        const currentCart = JSON.parse(localStorage.getItem("johen-cart") || "[]");
        const newCart = currentCart.filter((item: any) => item.id !== checkoutItem.id);
        localStorage.setItem("johen-cart", JSON.stringify(newCart));
        window.dispatchEvent(new Event("cartUpdated"));

        // Bersihkan meja kasir
        localStorage.removeItem("checkout-item"); 
        
        // Pindah ke invoice
        router.push(`/invoice/${orderId}`);
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Terjadi kesalahan saat membuat pesanan.");
      setIsProcessing(false);
    }
  };

  // Mencegah layar berkedip saat mengecek localstorage
  if (!checkoutItem) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-[var(--color-johen-cyan)]" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[80vh]">
      <FadeIn>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--color-johen-cyan)] mb-6 transition group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> KEMBALI
        </button>

        <h1 className="text-3xl font-black text-white mb-8">Checkout Pesanan</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ringkasan Item */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">Ringkasan Item</h2>
            <div className="bg-[#12122A] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 bg-[#0A0A1A] rounded-xl flex items-center justify-center border border-white/5">
                <ShieldCheck className="text-[var(--color-johen-violet)]" />
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-johen-cyan)] font-bold uppercase tracking-widest mb-1">{checkoutItem.category}</p>
                <p className="font-bold text-white text-sm mb-2">{checkoutItem.name}</p>
                <p className="text-lg font-black text-[var(--color-johen-cyan)]">Rp {Number(checkoutItem.price).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Form Data Pelanggan */}
          <div className="bg-[#12122A]/50 border border-white/5 rounded-3xl p-6 md:p-8 h-fit">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-6">Data Kontak</h2>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-300 mb-2">Nomor WhatsApp Pelanggan</label>
              <p className="text-[10px] text-gray-500 mb-3">Mohon masukkan nomor yang aktif. Admin kami akan mengirimkan detail Email & Password akun ke nomor ini setelah pembayaran lunas.</p>
              <div className="flex">
                <span className="bg-[#0A0A1A] border border-white/10 border-r-0 rounded-l-xl px-4 flex items-center justify-center text-sm font-bold text-gray-400">+62</span>
                <input 
                  type="number" 
                  value={waNumber} 
                  onChange={(e) => setWaNumber(e.target.value)} 
                  placeholder="81234567890" 
                  className={`flex-1 bg-[#0A0A1A] border ${errorMsg ? 'border-red-500' : 'border-white/10'} rounded-r-xl p-4 text-sm focus:border-[var(--color-johen-cyan)] outline-none transition text-white`} 
                />
              </div>
              {errorMsg && <p className="text-red-500 text-[10px] mt-2 font-bold flex items-center gap-1"><AlertTriangle size={12}/> {errorMsg}</p>}
            </div>
            
            {/* --- KOTAK INPUT VOUCHER --- */}
            <div className="mb-6 pt-6 border-t border-white/10">
              <label className="block text-xs font-bold text-gray-300 mb-2">Punya Kode Voucher?</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={voucherInput} 
                  onChange={(e) => setVoucherInput(e.target.value)} 
                  disabled={!!appliedVoucher}
                  placeholder="Masukkan kode..." 
                  className="flex-1 bg-[#0A0A1A] border border-white/10 rounded-xl p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none transition text-white uppercase" 
                />
                {!appliedVoucher ? (
                  <button 
                    type="button"
                    onClick={handleCekVoucher}
                    disabled={isCheckingVoucher || !voucherInput}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 rounded-xl font-bold text-xs transition disabled:opacity-50"
                  >
                    {isCheckingVoucher ? "Cek..." : "Terapkan"}
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => { setAppliedVoucher(null); setVoucherInput(""); setVoucherMsg({ text: "", isError: false }); }}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-5 rounded-xl font-bold text-xs transition"
                  >
                    Batal
                  </button>
                )}
              </div>
              {voucherMsg.text && (
                <p className={`text-[10px] mt-2 font-bold ${voucherMsg.isError ? 'text-red-400' : 'text-green-400'}`}>
                  {voucherMsg.text}
                </p>
              )}
            </div>

            {/* --- TOTAL PEMBAYARAN FINAL --- */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Harga Item</span>
                <span className="text-sm font-bold text-white">Rp {basePrice.toLocaleString('id-ID')}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[var(--color-johen-cyan)]">Diskon ({appliedVoucher.discount_percent}%)</span>
                  <span className="text-sm font-bold text-[var(--color-johen-cyan)]">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-6 mt-4 pt-4 border-t border-white/5">
                <span className="text-sm font-bold text-gray-300">Total Tagihan</span>
                <span className="text-3xl font-black text-[var(--color-johen-cyan)]">Rp {finalPriceToPay.toLocaleString('id-ID')}</span>
              </div>
              </div>
            <div className="border-t border-white/10 pt-6">
              <button 
                disabled={isProcessing || !waNumber}
                onClick={handleBuatPesanan}
                className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] font-black py-4 rounded-xl transition duration-300 uppercase tracking-widest shadow-[0_0_20px_rgba(0,200,240,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />} 
                {isProcessing ? "Membuat Pesanan..." : "Buat Pesanan"}
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}