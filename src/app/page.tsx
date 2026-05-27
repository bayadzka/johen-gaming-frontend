"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { Search, Gamepad2, ShieldCheck, Flame, ShoppingCart } from "lucide-react";

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- STATE TOAST NOTIFICATION ---
  const [toastMsg, setToastMsg] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMsg(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:3000/accounts/games"),
      axios.get("http://localhost:3000/accounts/admin-list")
    ])
      .then(([resGames, resAccounts]) => {
  setGames(resGames.data.data || []);
  setAccounts(resAccounts.data.data || []);
  setLoading(false);
})
      .catch((err) => {
        console.error("Gagal memuat data toko:", err);
        setLoading(false);
      });
  }, []);

  const filteredGames = games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAccounts = accounts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.games?.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- FUNGSI TAMBAH KERANJANG (ANTI DUPLIKAT & TOAST) ---
  const addToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    
    // Tentukan kunci keranjang berdasarkan email user yang sedang login
    const userEmail = localStorage.getItem("user-email");
    const cartKey = userEmail ? `johen-cart-${userEmail}` : "johen-cart-guest";
    
    const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    
    const isExist = currentCart.some((item: any) => item.id === product.id);
    if (isExist) {
      showToast("Item ini sudah ada di keranjangmu!");
      return;
    }
    
    const cartItem = {
      id: product.id,
      name: product.title,
      category: product.games?.name || 'Akun Game',
      price: product.final_price,
    };

    currentCart.push(cartItem);
    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cartUpdated"));
    
    showToast(`${product.title} ditambahkan ke keranjang!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 min-h-[80vh]">
      
      {/* --- HERO SECTION --- */}
      <FadeIn direction="down">
        <div className="bg-gradient-to-br from-[#12122A] to-[#1E1E3F] rounded-2xl p-6 md:p-12 mb-10 border border-[var(--color-johen-violet)]/20 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-johen-cyan)]/10 border border-[var(--color-johen-cyan)]/30 text-[var(--color-johen-cyan)] text-[11px] font-bold tracking-wide mb-4">
              <ShieldCheck size={14} /> 100% LEGAL & AMANAH
            </div>
            <h1 className="text-2xl md:text-5xl font-black mb-3 leading-tight">
              JOHEN GAMING <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-johen-cyan)] to-[var(--color-johen-magenta)]">
                STORE OFFICIAL
              </span>
            </h1>
            <p className="text-gray-400 text-xs md:text-sm mb-6 max-w-md leading-relaxed">
              Platform top up game tercepat dan marketplace akun terlengkap di Indonesia. Otomatis, murah, dan terpercaya 24 jam.
            </p>
            
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari game atau spesifikasi akun..."
                className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[var(--color-johen-cyan)] focus:ring-1 focus:ring-[var(--color-johen-cyan)] text-sm transition-all shadow-inner placeholder:text-gray-600"
              />
              {searchQuery && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-[var(--color-johen-cyan)]/20 text-[var(--color-johen-cyan)] px-2 py-1 rounded font-bold">
                  Mencari...
                </span>
              )}
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--color-johen-violet)]/10 blur-[100px] rounded-full pointer-events-none"></div>
        </div>
      </FadeIn>

      {/* --- SECTION 1: KATALOG TOP-UP --- */}
      <FadeIn delay={0.1}>
        <div className="mb-12">
          <h2 className="text-lg md:text-xl font-black flex items-center gap-2 mb-6 uppercase tracking-wider text-white">
            <Flame size={20} className="text-[var(--color-johen-magenta)] fill-[var(--color-johen-magenta)] animate-pulse" />
            Layanan Top-Up
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5].map((n) => <div key={n} className="h-24 bg-[#12122A] rounded-xl animate-pulse border border-white/5"></div>)}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold">Game "{searchQuery}" tidak ditemukan.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {filteredGames.map((game) => (
                <Link 
                  href={`/game/${game.id}`} 
                  key={game.id}
                  className="bg-[#12122A]/60 backdrop-blur-sm border border-white/5 rounded-xl p-4 hover:border-[var(--color-johen-cyan)]/40 transition-all duration-300 flex items-center gap-3 group hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--color-johen-cyan)]/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0A0A1A] flex items-center justify-center border border-white/5 group-hover:border-[var(--color-johen-cyan)]/30 transition flex-shrink-0">
                    <Gamepad2 size={20} className="text-gray-500 group-hover:text-[var(--color-johen-cyan)] transition" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-200 group-hover:text-white transition truncate">{game.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{game.publisher}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* --- SECTION 2: MARKETPLACE JUAL BELI AKUN --- */}
      <FadeIn delay={0.2}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-black flex items-center gap-2 uppercase tracking-wider text-white">
              <span className="w-1.5 h-6 bg-[var(--color-johen-cyan)] rounded-full shadow-[0_0_10px_var(--color-johen-cyan)]"></span>
              Akun Game Ready
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((n) => <div key={n} className="h-64 bg-[#12122A] rounded-2xl animate-pulse border border-white/5"></div>)}
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border border-dashed border-white/5 rounded-xl bg-[#12122A]/10 text-sm">
              {searchQuery ? `Tidak ada akun yang cocok dengan kata kunci "${searchQuery}".` : "Belum ada akun game yang ter-posting."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredAccounts.map((account) => (
                <Link 
                  href={`/account/${account.id}`} 
                  key={account.id}
                  className="bg-[#12122A]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-4 hover:border-[var(--color-johen-cyan)]/30 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1.5 hover:shadow-lg relative"
                >
                  <div className="bg-gradient-to-br from-[#1E1E3F] to-[#0A0A1A] h-36 rounded-xl mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden">

  {/* GAMBAR ACCOUNT */}
  {account.account_details?.images?.[0] ? (
    <img
      src={account.account_details.images[0]}
      alt={account.title}
      className="w-full h-full object-cover"
    />
  ) : (
    <Gamepad2
      size={36}
      className="text-gray-600 group-hover:text-[var(--color-johen-cyan)] transition-all duration-300"
    />
  )}

  {/* OVERLAY SOLD OUT */}
  {account.status === 'sold' && (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-[2px]">
      <span className="bg-red-600 text-white font-black px-4 py-2 rounded-lg transform -rotate-12 border-2 border-[#0A0A1A] shadow-2xl tracking-widest text-lg">
        SOLD OUT
      </span>
    </div>
  )}

</div>
                  
                  <div className="text-[9px] text-[var(--color-johen-cyan)] mb-2 font-extrabold tracking-widest uppercase px-2 py-0.5 bg-[var(--color-johen-cyan)]/10 rounded border border-[var(--color-johen-cyan)]/20 w-fit">
                    {account.games?.name}
                  </div>
                  
                  <h3 className="font-bold text-sm md:text-base text-gray-200 line-clamp-2 mb-1 group-hover:text-white transition flex-grow">
                    {account.title}
                  </h3>

                  {account.account_details?.total_collection_points > 0 && (
                    <p className="text-[11px] text-gray-500 mb-4">Poin Koleksi: <span className="text-gray-300 font-semibold">{account.account_details.total_collection_points}</span></p>
                  )}
                  
                  <div className="flex items-end justify-between pt-3 border-t border-white/5 mt-auto">
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest">Harga Jual</p>
                      <p className="font-extrabold text-[var(--color-johen-cyan)] text-base">Rp {Number(account.final_price).toLocaleString('id-ID')}</p>
                    </div>
                    
                   <button
  onClick={(e) => addToCart(e, account)}
  disabled={account.status === 'sold'}
                      className={`p-2 rounded-lg transition duration-300 z-10 border ${
  account.status === 'sold'
    ? 'bg-gray-800 text-gray-500 border-white/5 cursor-not-allowed'
    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-[var(--color-johen-cyan)] hover:text-[#0A0A1A] hover:border-[var(--color-johen-cyan)]'
}`}
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* --- TOAST UI --- */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${isToastVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md bg-[var(--color-johen-cyan)]/90 border border-[var(--color-johen-cyan)] text-[#0A0A1A]">
          <ShoppingCart size={18} />
          <span className="text-sm font-bold tracking-wide">{toastMsg}</span>
        </div>
      </div>
    </div>
  );
}