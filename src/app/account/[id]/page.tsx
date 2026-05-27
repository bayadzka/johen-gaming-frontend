"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { 
  Gamepad2, ShieldCheck, ShoppingCart, ArrowLeft, 
  Award, BarChart2, Zap, Percent, Maximize2, X, ChevronDown, ChevronUp,
  Package, Lock
} from "lucide-react";

export default function AccountDetailPage() {
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
  
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>('Koleksi Skin');
  
  const [toastMsg, setToastMsg] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMsg(message); setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  useEffect(() => {
    if (id) {
      axios.get(`https://johen-gaming-backend-production.up.railway.app/accounts/${id}`)
        .then((res) => {
          // Memastikan data yang masuk benar-benar objek, bukan undefined
          setAccount(res.data.data || null);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          // Menghapus router.push dari sini untuk mencegah Next.js Error
          setAccount(null); 
          setLoading(false);
        });
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!cekApakahSudahLogin()) return;
    if (!account) return;
    const userEmail = localStorage.getItem("user-email");
    const cartKey = userEmail ? `johen-cart-${userEmail}` : "johen-cart-guest";
    
    const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const isExist = currentCart.some((item: any) => item.id === account.id);
    if (isExist) {
      showToast("Akun ini sudah ada di dalam keranjang belanjamu!");
      return;
    }
    const cartItem = { id: account.id, name: account.title, category: account.games?.name || 'Akun Game', price: account.final_price };
    currentCart.push(cartItem);
    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cartUpdated"));
    showToast("Berhasil menambahkan akun ke keranjang!");
  };

  const handleBeliSekarang = () => {
    if (!cekApakahSudahLogin()) return;
    if (!account) return;
    const checkoutItem = { 
      id: account.id, 
      name: account.title, 
      category: account.games?.name || 'Akun Game', 
      price: account.final_price 
    };
    localStorage.setItem("checkout-item", JSON.stringify(checkoutItem));
    router.push("/checkout"); 
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-[var(--color-johen-cyan)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Jika akun kosong/gagal dimuat, UI dialihkan dengan aman ke sini
  if (!account) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-white">
      <h2 className="text-2xl font-bold mb-2">Akun Tidak Ditemukan</h2>
      <p className="text-gray-400 mb-6">Mungkin akun ini sudah dihapus atau terjual.</p>
      <button onClick={() => router.push("/")} className="bg-[var(--color-johen-cyan)] text-[#0A0A1A] font-bold px-6 py-2 rounded-lg transition hover:bg-[#22D3EE]">Kembali ke Beranda</button>
    </div>
  );

  const details = account.account_details || {};
  const rawSkins = details.skins || [];
  
  const images = details.images && details.images.length > 0 
    ? details.images 
    : ['https://placehold.co/800x500/12122A/00C8F0?text=No+Image+Provided'];

  const skinOrder = ['Legend Limit', 'Legend Shop', 'Grand', 'Exquisite', 'Deluxe'];
  const itemOrder = ['Efek Recall Limited', 'Avatar Border Limited'];

  const koleksiSkin = rawSkins
    .filter((s: any) => skinOrder.includes(s.category))
    .sort((a: any, b: any) => skinOrder.indexOf(a.category) - skinOrder.indexOf(b.category));
  
  const itemLangka = rawSkins
    .filter((s: any) => itemOrder.includes(s.category) || !skinOrder.includes(s.category))
    .sort((a: any, b: any) => itemOrder.indexOf(a.category) - itemOrder.indexOf(b.category));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <button onClick={() => router.push("/")} className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--color-johen-cyan)] mb-6 transition group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> KEMBALI KE ETALASE
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-7 space-y-6">
          <FadeIn>
            <div className="bg-[#0A0A1A] aspect-[16/10] rounded-2xl border border-white/5 relative overflow-hidden group shadow-2xl">
              <img 
                src={images[activeImageIndex]} 
                alt="Account Showcase" 
                className="w-full h-full object-cover cursor-zoom-in transition duration-500 hover:scale-105"
                onClick={() => setIsZoomOpen(true)}
              />
              <button 
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-4 right-4 bg-black/60 backdrop-blur p-2 rounded-lg border border-white/10 text-white hover:text-[var(--color-johen-cyan)] transition opacity-0 group-hover:opacity-100"
              >
                <Maximize2 size={20} />
              </button>
              <div className="absolute top-4 left-4 bg-[#05050D]/80 backdrop-blur px-3 py-1 rounded-md border border-white/10 text-[10px] font-bold text-gray-400 tracking-widest">
                #{account?.id?.substring(0,8)}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-[var(--color-johen-cyan)] shadow-[0_0_10px_rgba(0,200,240,0.5)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="bg-[#12122A]/40 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 bg-[#12122A]">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Detail Koleksi Aset</h3>
              </div>

              <div className="border-b border-white/5">
                <button 
                  onClick={() => setOpenCategory(openCategory === 'Koleksi Skin' ? null : 'Koleksi Skin')}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition"
                >
                  <span className="font-bold text-sm text-[var(--color-johen-cyan)]">Koleksi Skin ({koleksiSkin.length})</span>
                  {openCategory === 'Koleksi Skin' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {openCategory === 'Koleksi Skin' && (
                  <div className="p-5 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-in slide-in-from-top-2">
                    {koleksiSkin.length === 0 ? (
                      <p className="text-xs text-gray-500 col-span-full">Tidak ada skin premium yang dicatat.</p>
                    ) : (
                      koleksiSkin.map((skin: any, idx: number) => (
                        <div key={idx} className="bg-[#0A0A1A] border border-white/5 rounded-xl overflow-hidden group hover:border-[var(--color-johen-cyan)]/30 transition">
                          <div className="aspect-square bg-[#1E1E3F] w-full relative overflow-hidden">
                            <img src={skin.image} alt={skin.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition" />
                            <span className="absolute bottom-2 left-2 text-[8px] font-black bg-[var(--color-johen-violet)] text-white px-1.5 py-0.5 rounded uppercase">{skin.category}</span>
                          </div>
                          <div className="p-2 text-center bg-[#0A0A1A]"><p className="font-bold text-[11px] text-gray-200 line-clamp-1">{skin.name}</p></div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <button 
                  onClick={() => setOpenCategory(openCategory === 'Item Langka' ? null : 'Item Langka')}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition"
                >
                  <span className="font-bold text-sm text-[var(--color-johen-magenta)]">Item Langka Lainnya ({itemLangka.length})</span>
                  {openCategory === 'Item Langka' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {openCategory === 'Item Langka' && (
                  <div className="p-5 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-in slide-in-from-top-2">
                    {itemLangka.length === 0 ? (
                      <p className="text-xs text-gray-500 col-span-full">Tidak ada item langka (Recall/Border) yang dicatat.</p>
                    ) : (
                      itemLangka.map((item: any, idx: number) => (
                        <div key={idx} className="bg-[#0A0A1A] border border-white/5 rounded-xl overflow-hidden group hover:border-[var(--color-johen-magenta)]/30 transition">
                          <div className="aspect-square bg-[#1E1E3F] w-full relative overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition" />
                            <span className="absolute bottom-2 left-2 text-[8px] font-black bg-gray-700 text-white px-1.5 py-0.5 rounded uppercase">{item.category}</span>
                          </div>
                          <div className="p-2 text-center bg-[#0A0A1A]"><p className="font-bold text-[11px] text-gray-200 line-clamp-1">{item.name}</p></div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <FadeIn direction="left">
            <div className="bg-[#12122A]/60 border border-white/5 rounded-2xl p-6 mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[var(--color-johen-cyan)]/10 border border-[var(--color-johen-cyan)]/20 text-[10px] font-black text-[var(--color-johen-cyan)] tracking-widest uppercase mb-3">{account?.games?.name}</div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">{account?.title}</h1>
              <div className={`flex items-center gap-1.5 text-xs font-bold mt-2 ${
  account.status === 'sold'
    ? 'text-red-400'
    : 'text-gray-400'
}`}>
  <Package size={16} />

  {account.status === 'sold'
    ? 'Akun Sudah Terjual'
    : 'Stok Tersedia: 1 (Akun Unik)'}
</div>
            </div>
            {/* --- BLOK DESKRIPSI TAMBAHAN --- */}
            {account.account_details?.description && (
              <div className="mt-6 p-5 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-johen-cyan)]"></div>
                <h3 className="text-xs font-bold text-[var(--color-johen-cyan)] uppercase tracking-widest mb-2">Catatan Tambahan</h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {account.account_details.description}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#12122A]/30 border border-white/5 p-4 rounded-xl">
                <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Award size={12}/> Rank Tertinggi</div>
                <p className="text-sm font-bold text-white truncate">Mythical Glory</p>
              </div>
              <div className="bg-[#12122A]/30 border border-white/5 p-4 rounded-xl">
                <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Zap size={12}/> Max Emblem</div>
                <p className="text-sm font-bold text-[var(--color-johen-cyan)]">{details.max_emblem || 0} / 7 Set</p>
              </div>
              <div className="bg-[#12122A]/30 border border-white/5 p-4 rounded-xl">
                <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><Percent size={12}/> Win Rate</div>
                <p className="text-sm font-bold text-white">{details.win_rate || '0.0'}%</p>
              </div>
              <div className="bg-[#12122A]/30 border border-white/5 p-4 rounded-xl">
                <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1"><BarChart2 size={12}/> Total Match</div>
                <p className="text-sm font-bold text-white">{details.total_match || 0} Match</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#12122A] to-[#1E1E3F]/50 border border-[var(--color-johen-cyan)]/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--color-johen-cyan)]/5 blur-[40px] rounded-full"></div>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">Total Harga Akun</p>
                  <p className="text-3xl font-black text-[var(--color-johen-cyan)]">Rp {Number(account?.final_price || 0).toLocaleString('id-ID')}</p>
                </div>
                {details.total_collection_points > 0 && (
                  <div className="text-right">
                    <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-0.5">Poin Koleksi</p>
                    <span className="text-xs font-black text-white bg-white/10 px-2 py-1 rounded border border-white/5">{details.total_collection_points} Pts</span>
                  </div>
                )}
              </div>
              <div className="space-y-3 relative z-10">

  <button
    onClick={() => {
      if (!cekApakahSudahLogin()) return; 
      
      // Jika lolos, baru jalankan fungsi keranjangnya
      handleAddToCart(); 
    }}
    disabled={account.status === 'sold'}
    className={`w-full font-bold py-3 rounded-xl border transition flex items-center justify-center gap-2 text-sm ${
      account.status === 'sold'
        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-white/5'
        : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
    }`}
  >
    <ShoppingCart size={18} />
    {account.status === 'sold'
      ? 'AKUN SUDAH TERJUAL'
      : 'TAMBAH KE KERANJANG'}
  </button>

  <button
    onClick={() => {
      if (!cekApakahSudahLogin()) return; 
      
      // Jika lolos, baru jalankan fungsi keranjangnya
      handleBeliSekarang(); 
    }}
    disabled={account.status === 'sold'}
    className={`w-full py-3.5 rounded-xl transition text-sm tracking-wide uppercase font-black ${
      account.status === 'sold'
        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
        : 'bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A]'
    }`}
  >
    {account.status === 'sold'
      ? 'STOK HABIS (SOLD OUT)'
      : 'BELI SEKARANG'}
  </button>

</div>
            </div>
          </FadeIn>
        </div>
      </div>

      {isZoomOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <button onClick={() => setIsZoomOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition"><X size={32} /></button>
          <img src={images[activeImageIndex]} className="max-w-full max-h-[90vh] object-contain rounded-xl" alt="Zoomed View" />
        </div>
      )}
      
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${isToastVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md bg-[var(--color-johen-cyan)]/90 border border-[var(--color-johen-cyan)] text-[#0A0A1A]">
          <ShoppingCart size={18} />
          <span className="text-sm font-bold tracking-wide">{toastMsg}</span>
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
            <p className="text-sm text-gray-400 mb-6">Halo! Kamu wajib Masuk atau Daftar akun terlebih dahulu sebelum bisa memborong akun sultan.</p>
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