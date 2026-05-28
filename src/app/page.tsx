"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { Search, Gamepad2, ShieldCheck, Flame, ShoppingCart, Lock, Zap, Star } from "lucide-react";

export default function Home() {
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
  
  const [games, setGames] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMsg(message);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 3000);
  };

  useEffect(() => {
    axios.get("https://johen-gaming-backend-production.up.railway.app/accounts/games")
      .then((resGames) => {
        if (resGames.data && resGames.data.data) setGames(resGames.data.data);
      })
      .catch((err) => console.error("Gagal ambil game:", err))
      .finally(() => setLoading(false));

    const token = localStorage.getItem("user-token");
    const config = (token && token !== "null" && token !== "undefined")
      ? { headers: { Authorization: `Bearer ${token}` } } : {};

    axios.get("https://johen-gaming-backend-production.up.railway.app/accounts/admin-list", config)
      .then((resAccounts) => {
        if (resAccounts.data && resAccounts.data.data) setAccounts(resAccounts.data.data);
      })
      .catch((err) => console.error("Gagal ambil akun:", err));
  }, []);

  const filteredGames = games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAccounts = accounts.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.games?.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const availableAccounts = filteredAccounts.filter(a => a.status === 'available');
  const soldAccounts = filteredAccounts.filter(a => a.status === 'sold');

  const addToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    if (!cekApakahSudahLogin()) return;
    const userEmail = localStorage.getItem("user-email");
    const cartKey = userEmail ? `johen-cart-${userEmail}` : "johen-cart-guest";
    const currentCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const isExist = currentCart.some((item: any) => item.id === product.id);
    if (isExist) { showToast("Item ini sudah ada di keranjangmu!"); return; }
    currentCart.push({ id: product.id, name: product.title, category: product.games?.name || 'Akun Game', price: product.final_price });
    localStorage.setItem(cartKey, JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cartUpdated"));
    showToast(`${product.title} ditambahkan ke keranjang!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 min-h-[80vh]">
      
      {/* ====== HERO SECTION ====== */}
      <FadeIn direction="down">
        <div className="relative rounded-2xl p-6 md:p-12 mb-10 overflow-hidden border border-[var(--color-johen-violet)]/20"
          style={{ background: 'linear-gradient(135deg, #12122A 0%, #1E1E3F 50%, #0D0D2E 100%)' }}>
          
          {/* Background decorative orbs */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }}></div>
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,200,240,0.08) 0%, transparent 70%)' }}></div>
          <div className="absolute right-1/3 top-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.07) 0%, transparent 70%)' }}></div>

          <div className="relative z-10 max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(0,200,240,0.1)', border: '1px solid rgba(0,200,240,0.3)' }}>
              <ShieldCheck size={13} className="text-[var(--color-johen-cyan)]" />
              <span className="text-[var(--color-johen-cyan)] text-[11px] font-black tracking-widest">100% LEGAL & AMANAH</span>
            </div>

            <h1 className="text-2xl md:text-5xl font-black mb-3 leading-tight">
              JOHEN GAMING{' '}
              <br className="hidden md:block" />
              <span className="gradient-text-johen">STORE OFFICIAL</span>
            </h1>

            <p className="text-[var(--color-johen-text-soft)] text-xs md:text-sm mb-8 max-w-md leading-relaxed">
              Platform top up game tercepat dan marketplace akun terlengkap di Indonesia. Otomatis, murah, dan terpercaya 24 jam.
            </p>

            {/* Stats row */}
            <div className="flex gap-6 mb-8">
              {[
                { val: '11.500+', label: 'Transaksi' },
                { val: '24 Jam', label: 'Layanan' },
                { val: '100%', label: 'Terpercaya' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[var(--color-johen-cyan)] font-black text-base md:text-lg">{stat.val}</p>
                  <p className="text-[var(--color-johen-text-muted)] text-[11px] uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
            
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari game atau spesifikasi akun..."
                className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm transition-all shadow-inner placeholder:text-gray-600 focus:outline-none"
                style={{
                  background: 'rgba(5,5,13,0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-johen-cyan)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,200,240,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {searchQuery && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 rounded"
                  style={{ background: 'rgba(0,200,240,0.15)', color: 'var(--color-johen-cyan)' }}>
                  Mencari...
                </span>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ====== SECTION 1: KATALOG TOP-UP ====== */}
      <FadeIn delay={0.1}>
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ background: 'var(--color-johen-magenta)' }}></div>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Flame size={20} className="text-[var(--color-johen-magenta)]" style={{ filter: 'drop-shadow(0 0 6px rgba(217,70,239,0.6))' }} />
              Layanan Top-Up
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-24 rounded-xl animate-pulse border border-white/5"
                  style={{ background: 'rgba(18,18,42,0.6)' }}></div>
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="p-4 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
              Game "{searchQuery}" tidak ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {filteredGames.map((game) => (
                <Link
                  href={`/game/${game.id}`}
                  key={game.id}
                  className="group rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'rgba(18,18,42,0.6)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,200,240,0.35)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,200,240,0.08)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition"
                    style={{ background: 'rgba(5,5,13,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Gamepad2 size={20} className="text-gray-500 group-hover:text-[var(--color-johen-cyan)] transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-200 group-hover:text-white transition truncate">{game.name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--color-johen-text-muted)' }}>{game.publisher}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {/* ====== SECTION 2: MARKETPLACE AKUN ====== */}
      <FadeIn delay={0.2}>
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: 'var(--color-johen-cyan)', boxShadow: '0 0 10px rgba(0,200,240,0.5)' }}></div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white">Akun Game Ready</h2>
              {!loading && availableAccounts.length > 0 && (
                <span className="badge-cyan">{availableAccounts.length} tersedia</span>
              )}
            </div>
          </div>

          {/* Akun Available */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 rounded-2xl animate-pulse border border-white/5"
                  style={{ background: 'rgba(18,18,42,0.6)' }}></div>
              ))}
            </div>
          ) : availableAccounts.length === 0 ? (
            <div className="text-center py-16 rounded-xl text-sm"
              style={{ border: '1px dashed rgba(255,255,255,0.08)', background: 'rgba(18,18,42,0.3)', color: '#6B7280' }}>
              {searchQuery ? `Tidak ada akun ready yang cocok dengan "${searchQuery}".` : "Belum ada akun game yang ter-posting."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              {availableAccounts.map((account) => (
                <Link
                  href={`/account/${account.id}`}
                  key={account.id}
                  className="group flex flex-col h-full rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1.5 relative"
                  style={{
                    background: 'rgba(18,18,42,0.5)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,200,240,0.25)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,200,240,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.05)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Image area */}
                  <div className="h-36 rounded-xl mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1E1E3F, #0A0A1A)' }}>
                    {account.account_details?.images?.[0] ? (
                      <img src={account.account_details.images[0]} alt={account.title} className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 size={36} className="text-gray-600 group-hover:text-[var(--color-johen-cyan)] transition-all duration-300" />
                    )}
                    {/* Top-right glow badge */}
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                      style={{ background: 'var(--color-johen-cyan)', boxShadow: '0 0 8px var(--color-johen-cyan)' }}></div>
                  </div>

                  {/* Game badge */}
                  <span className="badge-cyan mb-2 w-fit">{account.games?.name}</span>

                  <h3 className="font-bold text-sm md:text-base text-gray-200 line-clamp-2 mb-1 group-hover:text-white transition flex-grow">
                    {account.title}
                  </h3>

                  {account.account_details?.total_collection_points > 0 && (
                    <p className="text-[11px] mb-4 flex items-center gap-1" style={{ color: 'var(--color-johen-text-muted)' }}>
                      <Star size={10} className="text-yellow-500" />
                      Poin Koleksi: <span className="text-gray-300 font-semibold ml-1">{account.account_details.total_collection_points}</span>
                    </p>
                  )}

                  {/* Price & cart */}
                  <div className="flex items-end justify-between pt-3 mt-auto"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-johen-text-muted)' }}>Harga Jual</p>
                      <p className="font-extrabold text-base" style={{ color: 'var(--color-johen-cyan)' }}>
                        Rp {Number(account.final_price).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => addToCart(e, account)}
                      className="p-2 rounded-lg transition duration-300 z-10"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--color-johen-cyan)';
                        (e.currentTarget as HTMLElement).style.color = '#0A0A1A';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-johen-cyan)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 12px rgba(0,200,240,0.4)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                        (e.currentTarget as HTMLElement).style.color = '#9CA3AF';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Akun Sold Out */}
          {!loading && soldAccounts.length > 0 && (
            <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3 mb-6 opacity-70">
                <div className="w-1 h-6 rounded-full bg-red-600"></div>
                <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-gray-500">
                  Histori Terjual (Sold Out)
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
                {soldAccounts.map((account) => (
                  <Link
                    href={`/account/${account.id}`}
                    key={account.id}
                    className="flex flex-col h-full rounded-2xl p-4 transition-all duration-300 relative"
                    style={{ background: 'rgba(18,18,42,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="h-36 rounded-xl mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #1E1E3F, #0A0A1A)' }}>
                      {account.account_details?.images?.[0] ? (
                        <img src={account.account_details.images[0]} alt={account.title} className="w-full h-full object-cover" />
                      ) : (
                        <Gamepad2 size={36} className="text-gray-600" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center z-10"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}>
                        <span className="text-white font-black px-4 py-2 rounded-lg transform -rotate-12 border-2 border-[#0A0A1A] shadow-2xl tracking-widest text-lg"
                          style={{ background: '#DC2626' }}>
                          SOLD OUT
                        </span>
                      </div>
                    </div>
                    <span className="badge-cyan mb-2 w-fit">{account.games?.name}</span>
                    <h3 className="font-bold text-sm text-gray-400 line-clamp-2 mb-1 flex-grow">{account.title}</h3>
                    <div className="flex items-end justify-between pt-3 mt-auto"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <p className="font-extrabold text-base" style={{ color: 'var(--color-johen-cyan)' }}>
                        Rp {Number(account.final_price).toLocaleString('id-ID')}
                      </p>
                      <button disabled className="p-2 rounded-lg cursor-not-allowed"
                        style={{ background: '#1F2937', color: '#6B7280', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {/* ====== TOAST ====== */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${isToastVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md"
          style={{
            background: 'rgba(0,200,240,0.92)',
            border: '1px solid var(--color-johen-cyan)',
            color: '#0A0A1A',
            boxShadow: '0 0 30px rgba(0,200,240,0.4)',
          }}>
          <ShoppingCart size={18} />
          <span className="text-sm font-bold tracking-wide">{toastMsg}</span>
        </div>
      </div>

      {/* ====== MODAL: BELUM LOGIN ====== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in zoom-in-95 duration-200"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-sm p-6 rounded-2xl text-center"
            style={{
              background: 'var(--color-johen-navy)',
              border: '1px solid rgba(0,200,240,0.25)',
              boxShadow: '0 0 60px rgba(0,200,240,0.1)',
            }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(0,200,240,0.1)', border: '1px solid rgba(0,200,240,0.3)' }}>
              <Lock size={32} className="text-[var(--color-johen-cyan)]" />
            </div>
            <h3 className="font-black text-xl text-white mb-2">Akses Terkunci</h3>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              Halo! Kamu wajib Masuk atau Daftar akun terlebih dahulu sebelum bisa menambahkan item ke keranjang.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 py-3 text-sm font-bold rounded-xl transition"
                style={{ color: '#9CA3AF' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Batal
              </button>
              <button
                onClick={() => router.push('/login')}
                className="flex-1 py-3 rounded-xl font-extrabold text-sm transition"
                style={{ background: 'var(--color-johen-cyan)', color: '#0A0A1A' }}
                onMouseEnter={e => { (e.currentTarget.style.background = 'var(--color-johen-cyan-light)'); (e.currentTarget.style.boxShadow = '0 0 20px rgba(0,200,240,0.4)'); }}
                onMouseLeave={e => { (e.currentTarget.style.background = 'var(--color-johen-cyan)'); (e.currentTarget.style.boxShadow = 'none'); }}
              >
                Masuk / Daftar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}