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

  // State untuk Live Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:3000/accounts/games"),
      axios.get("http://localhost:3000/accounts")
    ])
      .then(([resGames, resAccounts]) => {
        setGames(resGames.data.data || []);
        // Pastikan hanya memuat akun yang 'available'
        const availableAccounts = (resAccounts.data.data || []).filter((a: any) => a.status === 'available');
        setAccounts(availableAccounts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat data toko:", err);
        setLoading(false);
      });
  }, []);

  // Logika Filter Pencarian
  const filteredGames = games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAccounts = accounts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.games?.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Fungsi Tambah ke Keranjang
  const addToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); // Mencegah pindah halaman saat tombol diklik
    const currentCart = JSON.parse(localStorage.getItem("johen-cart") || "[]");
    
    const cartItem = {
      id: product.id,
      name: product.title,
      category: product.games?.name || 'Akun Game',
      price: product.final_price,
    };

    currentCart.push(cartItem);
    localStorage.setItem("johen-cart", JSON.stringify(currentCart));
    
    // Trigger event agar Navbar langsung update angka keranjangnya
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Opsional: Bisa pasang toast notification di sini
    alert(`${product.title} ditambahkan ke keranjang!`);
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
            
            {/* Live Search Input */}
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
                    <Gamepad2 size={36} className="text-gray-600 group-hover:text-[var(--color-johen-cyan)] transition-all duration-300" />
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
                    
                    {/* Tombol Add to Cart (Mencegah navigasi Link Utama) */}
                    <button 
                      onClick={(e) => addToCart(e, account)}
                      className="bg-white/5 border border-white/10 text-gray-400 p-2 rounded-lg hover:bg-[var(--color-johen-cyan)] hover:text-[#0A0A1A] hover:border-[var(--color-johen-cyan)] transition duration-300 z-10"
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
    </div>
  );
}