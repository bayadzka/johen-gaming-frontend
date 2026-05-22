"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { Gamepad2, ArrowLeft, Diamond, Zap, Search, UserCheck, ShieldCheck, CheckCircle2, Plus, Minus, Tag, AlertTriangle, Info, CheckCircle, Loader2 } from "lucide-react";

export default function TopupGamePage() {
  const { id } = useParams();
  const router = useRouter();
  
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

  useEffect(() => {
    if (id) {
      Promise.all([
        axios.get("http://localhost:3000/accounts/games"),
        axios.get(`http://localhost:3000/accounts/topup/${id}`)
      ])
      .then(([resGames, resPackages]) => {
        const foundGame = resGames.data.data.find((g: any) => g.id === id);
        if(!foundGame) router.push("/");
        setGame(foundGame); setPackages(resPackages.data.data || []); setLoading(false);
      }).catch((err) => { console.error(err); router.push("/"); });
    }
  }, [id, router]);

  const handleSelectPackage = (pkg: any) => {
    if (!zoneId) return showToast("Harap isi User ID kamu terlebih dahulu!", "error");
    if (game.input_type === 'id_server' && !serverId) return showToast("Harap isi Server ID kamu terlebih dahulu!", "error");
    setSelectedPackage(selectedPackage?.id === pkg.id ? null : pkg);
  };

  const handleCheckNickname = () => {
    if (!zoneId) return showToast("Isi User ID dulu ya!", "error");
    if (game.input_type === 'id_server' && !serverId) return showToast("Isi Server ID dulu ya!", "error");
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
    // VALIDASI KETAT
    if(!zoneId || zoneId.length < 5 || zoneId.length > 15) return showToast("User ID tidak valid (5-15 angka)!", "error");
    if(game?.input_type === 'id_server' && (!serverId || serverId.length < 4 || serverId.length > 6)) return showToast("Server ID tidak valid (4-6 angka)!", "error");
    if(!selectedPackage) return showToast("Pilih nominal top-up terlebih dahulu!", "error");
    if(!whatsapp || whatsapp.length < 9 || whatsapp.length > 14) return showToast("Nomor WhatsApp tidak valid (9-14 angka)!", "error");

    setIsCheckoutLoading(true);
    showToast(`Membuat invoice pesanan...`, "info");

    try {
      const payload = {
        order_type: 'topup',
        product_ref_id: selectedPackage.id,
        customer_name: nickname || "Guest",
        customer_phone: whatsapp,
        // Menyisipkan nama produk dan qty agar bisa dibaca di Invoice nanti
        game_credentials: { id: zoneId, server: serverId || "", product_name: selectedPackage.name, quantity: quantity },
        voucher_code: promoDiscount > 0 ? promoCode : undefined
      };

      const response = await axios.post("http://localhost:3000/orders/checkout", payload);
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
  const totalPayment = Math.max(0, subtotal - promoDiscount);

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
                  <div className="flex-1"><input type="number" value={zoneId} onChange={e => setZoneId(e.target.value)} placeholder="Ketikan User ID" className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl p-4 text-sm focus:border-[var(--color-johen-cyan)] outline-none transition" /></div>
                  {game.input_type === 'id_server' && (<div className="flex-1"><input type="number" value={serverId} onChange={e => setServerId(e.target.value)} placeholder="Ketikan Server ID" className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl p-4 text-sm focus:border-[var(--color-johen-cyan)] outline-none transition" /></div>)}
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <div className="flex items-center gap-3">{isChecking ? <span className="text-xs text-[var(--color-johen-cyan)] animate-pulse font-bold flex items-center gap-2"><Search size={14}/> Mengecek Database...</span> : nickname ? <span className="text-sm text-green-400 font-bold flex items-center gap-2"><UserCheck size={16}/> Nickname: <span className="text-white">{nickname}</span></span> : <span className="text-xs text-gray-500">*Pastikan ID sudah benar.</span>}</div>
                  <button onClick={handleCheckNickname} disabled={isChecking} className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg transition border border-white/10">Cek Nickname</button>
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

            {/* STEP 4: PROMO */}
            <div className="bg-transparent mt-12">
              <h2 className="text-xl font-black flex items-center gap-3 text-white mb-4"><span className="w-8 h-8 rounded-xl bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] flex items-center justify-center text-sm border border-[var(--color-johen-cyan)]/30">4</span>Kode Promo (Opsional)</h2>
              <div className="bg-[#12122A] p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col md:flex-row gap-3">
                <div className="relative flex-1"><Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Masukkan kode promo..." className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl p-4 pl-11 text-sm focus:border-[var(--color-johen-cyan)] outline-none uppercase" /></div>
                <button onClick={handleApplyPromo} className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition">Gunakan</button>
              </div>
            </div>

            {/* STEP 5: KONTAK */}
            <div className="bg-transparent mt-12 mb-20">
              <h2 className="text-xl font-black flex items-center gap-3 text-white mb-4"><span className="w-8 h-8 rounded-xl bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] flex items-center justify-center text-sm border border-[var(--color-johen-cyan)]/30">5</span>Detail Kontak</h2>
              <div className="bg-[#12122A] p-6 rounded-2xl border border-white/5 shadow-lg">
                <div className="flex"><span className="bg-[#0A0A1A] border border-white/10 border-r-0 rounded-l-xl px-4 flex items-center justify-center text-sm font-bold text-gray-400">+62</span><input type="number" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="81234567890" className="flex-1 bg-[#0A0A1A] border border-white/10 rounded-r-xl p-4 text-sm focus:border-[var(--color-johen-cyan)] outline-none transition" /></div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* STICKY CHECKOUT */}
        <div className="lg:col-span-4 h-fit lg:sticky lg:top-24 space-y-6">
          <FadeIn direction="left">
            <div className="bg-[#0A0A1A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5"><h3 className="text-base font-black text-white flex items-center justify-between mb-1">Detail Pembayaran{selectedPackage && <span className="bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] text-[10px] px-2 py-1 rounded">Qty: {quantity}x</span>}</h3></div>
              <div className="p-6 bg-[#12122A]/50 space-y-4">
                <div className="flex justify-between items-start"><span className="text-xs font-bold text-gray-400">Item Produk</span><span className="text-sm font-bold text-white text-right max-w-[60%]">{selectedPackage ? selectedPackage.name : '-'}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">ID Tujuan</span><span className="text-sm font-bold text-white">{zoneId ? `${zoneId} ${serverId ? `(${serverId})` : ''}` : '-'}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-bold text-gray-400">Nickname</span><span className="text-sm font-bold text-green-400">{nickname ? nickname : '-'}</span></div>
                {promoDiscount > 0 && (<div className="flex justify-between items-center pt-2 border-t border-white/5"><span className="text-xs font-bold text-[var(--color-johen-magenta)]">Diskon Promo</span><span className="text-sm font-bold text-[var(--color-johen-magenta)]">- Rp {promoDiscount.toLocaleString('id-ID')}</span></div>)}
              </div>
              <div className="p-6 border-t border-white/5 bg-[#12122A]">
                <div className="flex justify-between items-end mb-5"><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Bayar</p><p className="text-3xl font-black text-[var(--color-johen-cyan)]">Rp {totalPayment.toLocaleString('id-ID')}</p></div>
                <button onClick={handleCheckout} disabled={!selectedPackage || !whatsapp || isCheckoutLoading} className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] disabled:opacity-30 text-[#0A0A1A] font-black py-4 rounded-xl transition duration-300 uppercase tracking-widest shadow-[0_0_20px_rgba(0,200,240,0.2)] flex justify-center items-center gap-2">
                  {isCheckoutLoading ? <Loader2 size={18} className="animate-spin"/> : <Zap size={18} />} {isCheckoutLoading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}