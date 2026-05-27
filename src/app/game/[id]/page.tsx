"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { Gamepad2, ArrowLeft, Diamond, Zap, Search, UserCheck, ShieldCheck, CheckCircle2, Plus, Minus, Tag, AlertTriangle, Info, CheckCircle, Loader2, Lock } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uehkjsmiyyfvuyblwzau.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGtqc21peXlmdnV5Ymx3emF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MTI0MywiZXhwIjoyMDk0ODQ3MjQzfQ.ukwQf7Ch4_5bs_yFTu_s1mGHhYPKVyKorn55iwINRjw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TopupGamePage() {
  const { id } = useParams();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const cekApakahSudahLogin = () => {
    const userName = localStorage.getItem("user-name"); 
    if (!userName) {
      setShowAuthModal(true);
      return false; 
    }
    return true; 
  };
  
  const [game, setGame] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ELEGANT TOAST NOTIFICATION STATE ---
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<'error'|'success'|'info'>('info');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string, type: 'error'|'success'|'info' = 'info') => {
    setToastMsg(message); setToastType(type); setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  // --- FORM STATES ---
  const [zoneId, setZoneId] = useState("");
  const [serverId, setServerId] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [whatsapp, setWhatsapp] = useState("");

  const [nickname, setNickname] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // --- REAL-TIME VALIDATION STATES ---
  const [errors, setErrors] = useState<any>({});
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherMsg, setVoucherMsg] = useState({ text: "", isError: false });
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        axios.get("https://johen-gaming-backend-production.up.railway.app/accounts/games"),
        axios.get(`https://johen-gaming-backend-production.up.railway.app/accounts/topup/${id}`)
      ])
      .then(([resGames, resPackages]) => {
        const foundGame = resGames.data.data.find((g: any) => g.id === id);
        if(!foundGame) router.push("/");
        setGame(foundGame); setPackages(resPackages.data.data || []); setLoading(false);
      }).catch((err) => { console.error(err); router.push("/"); });
    }
    // --- PENANGKAP AUTO-FILL NO WA ---
    const savedPhone = localStorage.getItem("user-phone");
    if (savedPhone && savedPhone !== "undefined" && savedPhone !== "") {
      let cleanPhone = savedPhone;
      if (cleanPhone.startsWith("62")) cleanPhone = cleanPhone.slice(2);
      else if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.slice(1);
      setWhatsapp(cleanPhone); // setWhatsapp untuk top-up
    }
  }, [id, router]);

  // Real-time Validation Effect
  useEffect(() => {
    const newErrors: any = {};
    if (zoneId && (zoneId.length < 5 || zoneId.length > 15)) newErrors.zoneId = "User ID harus 5-15 angka.";
    if (game?.input_type === 'id_server' && serverId && (serverId.length < 4 || serverId.length > 6)) newErrors.serverId = "Server ID harus 4-6 angka.";
    if (whatsapp && (whatsapp.length < 9 || whatsapp.length > 14)) newErrors.whatsapp = "No. WhatsApp harus 9-14 angka.";
    setErrors(newErrors);
  }, [zoneId, serverId, whatsapp, game]);

  // Validation Checkers for Buttons
  const isAccountIdValid = zoneId.length >= 5 && zoneId.length <= 15 && (game?.input_type !== 'id_server' || (serverId.length >= 4 && serverId.length <= 6));
  const isCheckoutReady = isAccountIdValid && whatsapp.length >= 9 && whatsapp.length <= 14 && selectedPackage;

  const handleSelectPackage = (pkg: any) => {
    // Validasi: Cegah klik jika ID belum valid
    if (!isAccountIdValid) {
      showToast("Harap isi User ID dan Server dengan benar terlebih dahulu!", "error");
      return;
    }
    // Jika valid, baru set paketnya
    setSelectedPackage(selectedPackage?.id === pkg.id ? null : pkg);
  };

  const handleCheckNickname = () => {
    setIsChecking(true); setNickname(null);
    setTimeout(() => { setNickname("JOHEN_SLAYER_99"); setIsChecking(false); }, 1500);
  };

  const handleApplyPromo = () => {
    if (!promoCode) return showToast("Masukkan kode promo terlebih dahulu.", "info");
    if (promoCode.toUpperCase() === "JOHENUNTUNG") {
      setPromoDiscount(10000); showToast("Berhasil! Kamu mendapat potongan Rp 10.000", "success");
    } else {
      setPromoDiscount(0); showToast("Kode promo tidak valid atau kadaluarsa.", "error");
    }
  };

  const handleCheckout = async () => {
    if (!cekApakahSudahLogin()) return;
    setIsCheckoutLoading(true);
    showToast(`Membuat invoice pesanan...`, "info");

    try {
      const payload = {
        order_type: 'topup',
        product_ref_id: selectedPackage.id,
        customer_name: nickname || "Guest",
        customer_phone: whatsapp,
        game_credentials: { id: zoneId, server: serverId || "", product_name: selectedPackage.name, quantity: quantity },
        voucher_code: promoDiscount > 0 ? promoCode : undefined
      };

      const response = await axios.post("https://johen-gaming-backend-production.up.railway.app/orders/checkout", payload);
      const orderId = response.data.order_summary?.order_id;
      
      if (orderId) {
         showToast("Berhasil! Mengarahkan ke invoice...", "success");
         router.push(`/invoice/${orderId}`);
      } else {
         showToast("Gagal membuat pesanan di server.", "error");
         setIsCheckoutLoading(false);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "Terjadi kesalahan saat checkout.", "error");
      setIsCheckoutLoading(false);
    }
  };

  const subtotal = selectedPackage ? Number(selectedPackage.price) * quantity : 0;
  const voucherDiscountAmount = appliedVoucher ? (subtotal * appliedVoucher.discount_percent) / 100 : 0;
  const totalPayment = Math.max(0, subtotal - promoDiscount - voucherDiscountAmount);

  const handleCekVoucher = async () => {
    if (!voucherInput) return;
    setIsCheckingVoucher(true);
    setVoucherMsg({ text: "", isError: false });

    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherInput.toUpperCase())
        .single();

      if (error || !data) {
        setVoucherMsg({ text: "Kode voucher tidak ditemukan.", isError: true });
        return;
      }

      if (data.current_usage >= data.max_usage) {
        setVoucherMsg({ text: "Kuota voucher ini sudah habis (Limit).", isError: true });
        return;
      }

      if (new Date(data.expired_at) < new Date()) {
        setVoucherMsg({ text: "Masa berlaku voucher sudah kadaluarsa.", isError: true });
        return;
      }

      setAppliedVoucher(data);
      setVoucherMsg({ text: `Voucher diskon ${data.discount_percent}% berhasil diterapkan!`, isError: false });
    } catch (err) {
      setVoucherMsg({ text: "Terjadi kesalahan sistem.", isError: true });
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-[var(--color-johen-magenta)] animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 relative">
      
      {/* Toast Notification */}
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${isToastVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border ${toastType === 'error' ? 'bg-red-500/90 border-red-400 text-white' : toastType === 'success' ? 'bg-green-500/90 border-green-400 text-white' : 'bg-[var(--color-johen-cyan)]/90 border-[var(--color-johen-cyan)] text-[#0A0A1A]'}`}>
          {toastType === 'error' ? <AlertTriangle size={18} /> : toastType === 'success' ? <CheckCircle size={18} /> : <Info size={18} />}
          <span className="text-sm font-bold tracking-wide">{toastMsg}</span>
        </div>
      </div>

      <button onClick={() => router.push("/")} className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--color-johen-magenta)] mb-6 transition group"><ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> KEMBALI</button>

      {/* HERO BANNER */}
      <div className="bg-[#12122A] h-40 md:h-56 rounded-3xl relative overflow-hidden mb-10 border border-white/5 flex items-center px-8 md:px-16">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[var(--color-johen-violet)]/20 to-transparent blur-[80px]"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-[#0A0A1A] to-[#1E1E3F] rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl"><Gamepad2 size={40} className="text-[var(--color-johen-cyan)]" /></div>
          <div><h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">{game.name}</h1><p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest">PUBLISHER: <span className="text-white">{game.publisher}</span></p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <div className="lg:col-span-8 space-y-8">
          <FadeIn>
            
            {/* STEP 1: DATA AKUN */}
            <div className="bg-transparent">
              <h2 className="text-xl font-black flex items-center gap-3 text-white mb-4"><span className="w-8 h-8 rounded-xl bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] flex items-center justify-center text-sm border border-[var(--color-johen-cyan)]/30">1</span>Masukkan Data Akun</h2>
              <div className="bg-[#12122A] p-6 rounded-2xl border border-white/5 shadow-lg">
                <div className="flex flex-col md:flex-row gap-5 mb-4">
                  <div className="flex-1">
                    <input type="number" value={zoneId} onChange={e => setZoneId(e.target.value)} placeholder="Ketikkan User ID" className={`w-full bg-[#0A0A1A] border ${errors.zoneId ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-sm focus:border-[var(--color-johen-cyan)] outline-none transition`} />
                    {errors.zoneId && <p className="text-red-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertTriangle size={10} /> {errors.zoneId}</p>}
                  </div>
                  {game.input_type === 'id_server' && (
                    <div className="flex-1">
                      <input type="number" value={serverId} onChange={e => setServerId(e.target.value)} placeholder="Ketikkan Server ID" className={`w-full bg-[#0A0A1A] border ${errors.serverId ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-sm focus:border-[var(--color-johen-cyan)] outline-none transition`} />
                      {errors.serverId && <p className="text-red-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertTriangle size={10} /> {errors.serverId}</p>}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <div className="flex items-center gap-3">{isChecking ? <span className="text-xs text-[var(--color-johen-cyan)] animate-pulse font-bold flex items-center gap-2"><Search size={14}/> Mengecek Database...</span> : nickname ? <span className="text-sm text-green-400 font-bold flex items-center gap-2"><UserCheck size={16}/> Nickname: <span className="text-white">{nickname}</span></span> : <span className="text-xs text-gray-500">*Pastikan ID sudah benar.</span>}</div>
                  <button onClick={handleCheckNickname} disabled={isChecking || !isAccountIdValid} className="bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-white/5 text-xs font-bold px-4 py-2 rounded-lg transition border border-white/10">Cek Nickname</button>
                </div>
              </div>
            </div>

            {/* STEP 2: NOMINAL ITEM */}
            <div className="bg-transparent mt-12">
              <h2 className="text-xl font-black flex items-center gap-3 text-white mb-4"><span className="w-8 h-8 rounded-xl bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] flex items-center justify-center text-sm border border-[var(--color-johen-cyan)]/30">2</span>Pilih Nominal Item</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {packages.map((pkg) => (
                  <button key={pkg.id} onClick={() => handleSelectPackage(pkg)} className={`text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${selectedPackage?.id === pkg.id ? 'border-[var(--color-johen-cyan)] bg-[#12122A] shadow-[0_0_20px_rgba(0,200,240,0.15)] scale-[1.02]' : 'border-white/5 bg-[#12122A]/50 hover:border-white/20'}`}>
                    {selectedPackage?.id === pkg.id && <div className="absolute top-3 right-3 text-[var(--color-johen-cyan)]"><CheckCircle2 size={20} className="fill-[var(--color-johen-cyan)]/20" /></div>}
                    <div className="flex items-center gap-2 mb-3"><Diamond size={18} className={selectedPackage?.id === pkg.id ? 'text-[var(--color-johen-cyan)]' : 'text-gray-500'} /><p className="font-black text-sm md:text-base text-white leading-snug pr-4">{pkg.name}</p></div>
                    <p className="font-black text-[var(--color-johen-cyan)] text-lg mb-1">Rp {Number(pkg.price).toLocaleString('id-ID')}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 3: JUMLAH PEMBELIAN */}
            <div className="bg-transparent mt-12">
              <h2 className="text-xl font-black flex items-center gap-3 text-white mb-4"><span className="w-8 h-8 rounded-xl bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] flex items-center justify-center text-sm border border-[var(--color-johen-cyan)]/30">3</span>Jumlah Pembelian</h2>
              <div className="bg-[#12122A] p-4 rounded-2xl border border-white/5 shadow-lg flex items-center justify-between">
                <span className="text-sm font-bold text-gray-400 pl-2">Kuantitas Item:</span>
                <div className="flex items-center gap-4 bg-[#0A0A1A] p-1.5 rounded-xl border border-white/10">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition"><Minus size={16}/></button>
                  <span className="font-black text-lg w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-[var(--color-johen-cyan)]/20 hover:bg-[var(--color-johen-cyan)]/40 text-[var(--color-johen-cyan)] rounded-lg transition"><Plus size={16}/></button>
                </div>
              </div>
            </div>

            {/* STEP 4: VOUCHER SUPABASE */}
<div className="bg-transparent mt-12">
  <h2 className="text-xl font-black flex items-center gap-3 text-white mb-4">
    <span className="w-8 h-8 rounded-xl bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] flex items-center justify-center text-sm border border-[var(--color-johen-cyan)]/30">4</span>
    Kode Voucher (Opsional)
  </h2>
  <div className="bg-[#12122A] p-4 rounded-2xl border border-white/5 shadow-lg">
    <div className="flex gap-2">
      <input
        type="text"
        value={voucherInput}
        onChange={(e) => setVoucherInput(e.target.value)}
        disabled={!!appliedVoucher}
        placeholder="Masukkan kode voucher..."
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
</div>

            {/* STEP 5: KONTAK */}
            <div className="bg-transparent mt-12 mb-20">
              <h2 className="text-xl font-black flex items-center gap-3 text-white mb-4"><span className="w-8 h-8 rounded-xl bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] flex items-center justify-center text-sm border border-[var(--color-johen-cyan)]/30">5</span>Detail Kontak</h2>
              <div className="bg-[#12122A] p-6 rounded-2xl border border-white/5 shadow-lg">
                <div className="flex">
                  <span className="bg-[#0A0A1A] border border-white/10 border-r-0 rounded-l-xl px-4 flex items-center justify-center text-sm font-bold text-gray-400">+62</span>
                  <input type="number" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="81234567890" className={`flex-1 bg-[#0A0A1A] border ${errors.whatsapp ? 'border-red-500' : 'border-white/10'} rounded-r-xl p-4 text-sm focus:border-[var(--color-johen-cyan)] outline-none transition`} />
                </div>
                {errors.whatsapp && <p className="text-red-500 text-[10px] mt-1.5 font-bold flex items-center gap-1"><AlertTriangle size={10} /> {errors.whatsapp}</p>}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* STICKY CHECKOUT & GARANSI LAYANAN */}
        <div className="lg:col-span-4 h-fit lg:sticky lg:top-24 space-y-6">
          <FadeIn direction="left">
            <div className="bg-[#0A0A1A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl mb-6">
              <div className="p-6 border-b border-white/5"><h3 className="text-base font-black text-white flex items-center justify-between mb-1">Detail Pembayaran{selectedPackage && <span className="bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] text-[10px] px-2 py-1 rounded">Qty: {quantity}x</span>}</h3></div>
              <div className="p-6 bg-[#12122A]/50 space-y-4">
                <div className="flex justify-between items-start"><span className="text-xs font-bold text-gray-400">Item Produk</span><span className="text-sm font-bold text-white text-right max-w-[60%]">{selectedPackage ? selectedPackage.name : '-'}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">ID Tujuan</span><span className="text-sm font-bold text-white">{zoneId ? `${zoneId} ${serverId ? `(${serverId})` : ''}` : '-'}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">Nickname</span><span className="text-sm font-bold text-green-400">{nickname ? nickname : '-'}</span></div>
                {promoDiscount > 0 && (<div className="flex justify-between items-center pt-2 border-t border-white/5"><span className="text-xs font-bold text-[var(--color-johen-magenta)]">Diskon Promo</span><span className="text-sm font-bold text-[var(--color-johen-magenta)]">- Rp {promoDiscount.toLocaleString('id-ID')}</span></div>)}
                {voucherDiscountAmount > 0 && (
  <div className="flex justify-between items-center pt-2 border-t border-white/5">
    <span className="text-xs font-bold text-[var(--color-johen-cyan)]">Diskon Voucher ({appliedVoucher.discount_percent}%)</span>
    <span className="text-sm font-bold text-[var(--color-johen-cyan)]">- Rp {voucherDiscountAmount.toLocaleString('id-ID')}</span>
  </div>
)}
              </div>
              <div className="p-6 border-t border-white/5 bg-[#12122A]">
                <div className="flex justify-between items-end mb-5"><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Bayar</p><p className="text-3xl font-black text-[var(--color-johen-cyan)]">Rp {totalPayment.toLocaleString('id-ID')}</p></div>
                <button onClick={handleCheckout} disabled={!isCheckoutReady || isCheckoutLoading} className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] disabled:opacity-30 text-[#0A0A1A] font-black py-4 rounded-xl transition duration-300 uppercase tracking-widest shadow-[0_0_20px_rgba(0,200,240,0.2)] flex justify-center items-center gap-2">
                  {isCheckoutLoading ? <Loader2 size={18} className="animate-spin"/> : <Zap size={18} />} {isCheckoutLoading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                </button>
              </div>
            </div>

            {/* Custom Info Box (Restored) */}
            <div className="bg-[#12122A] border border-white/5 rounded-2xl p-5">
               <h4 className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <ShieldCheck size={16} className="text-[var(--color-johen-magenta)]" /> Garansi Layanan
               </h4>
               <ul className="text-xs text-gray-500 space-y-2">
                 <li className="flex items-start gap-2">
                   <span className="text-[var(--color-johen-cyan)] font-bold">•</span>
                   Proses top-up berjalan instan 1-3 detik setelah pembayaran berhasil dikonfirmasi.
                 </li>
                 <li className="flex items-start gap-2">
                   <span className="text-[var(--color-johen-cyan)] font-bold">•</span>
                   Diamond legal 100% langsung dari publisher resmi, anti minus.
                 </li>
               </ul>
            </div>
          </FadeIn>
        </div>
      </div>
      {/* CUSTOM MODAL: PERINGATAN BELUM LOGIN */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="bg-[#12122A] border border-[var(--color-johen-cyan)]/30 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(0,200,240,0.15)] text-center">
            <div className="w-16 h-16 bg-[var(--color-johen-cyan)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-johen-cyan)]/30">
              <Lock size={32} className="text-[var(--color-johen-cyan)]" />
            </div>
            <h3 className="font-black text-xl text-white mb-2">Akses Terkunci</h3>
            <p className="text-sm text-gray-400 mb-6">Halo! Kamu wajib Masuk atau Daftar akun terlebih dahulu sebelum bisa menambahkan item ke keranjang.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAuthModal(false)} className="flex-1 py-3 text-sm text-gray-400 hover:bg-white/5 rounded-xl transition font-bold">Batal</button>
              <button onClick={() => router.push('/login')} className="flex-1 py-3 bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] rounded-xl font-extrabold text-sm transition">
                Masuk / Daftar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}