"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, LogOut, X, Trash2, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Sembunyikan Navbar ini jika di halaman Admin
  if (pathname.startsWith("/admin")) return null;

  // Cek Status Login & Ambil Keranjang saat komponen dimuat
  useEffect(() => {
    const token = localStorage.getItem("user-token"); // Beda dengan sb-token admin
    if (token) setIsLoggedIn(true);

    const savedCart = localStorage.getItem("johen-cart");
    if (savedCart) setCartItems(JSON.parse(savedCart));

    // Custom event listener untuk update keranjang dari halaman lain
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem("johen-cart");
      if (updatedCart) setCartItems(JSON.parse(updatedCart));
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user-token");
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    router.push("/");
  };

  const removeFromCart = (indexToRemove: number) => {
    const newCart = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(newCart);
    localStorage.setItem("johen-cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <>
      <nav className="border-b border-[var(--color-johen-violet)]/30 bg-[#0A0A1A]/80 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(124,58,237,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="font-extrabold text-xl md:text-2xl tracking-widest flex items-center gap-1 drop-shadow-[0_0_8px_rgba(0,200,240,0.5)]">
            <span className="text-[var(--color-johen-cyan)]">JOHEN</span>
            <span className="text-white">GAMING</span>
          </Link>

          {/* Navigasi / Auth Area */}
          <div className="flex items-center gap-3 md:gap-4">
            {!isLoggedIn ? (
              // TAMPILAN GUEST (BELUM LOGIN)
              <>
                <Link href="/login" className="hidden md:block text-xs font-bold text-gray-300 hover:text-white transition">Masuk</Link>
                <Link href="/register" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition border border-white/10">Daftar</Link>
                {/* Tombol simulasi login cepat untuk testing */}
                <button onClick={() => { localStorage.setItem("user-token", "dummy-token"); setIsLoggedIn(true); }} className="text-[10px] text-[var(--color-johen-cyan)] underline ml-2">Simulasi Login</button>
              </>
            ) : (
              // TAMPILAN USER LOGIN
              <>
                {/* Tombol Keranjang */}
                <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-400 hover:text-[var(--color-johen-cyan)] transition duration-300">
                  <ShoppingCart size={22} />
                  {cartItems.length > 0 && (
                    <span className="absolute 0 right-0 top-0 w-4 h-4 bg-[var(--color-johen-magenta)] text-white text-[9px] font-black flex items-center justify-center rounded-full border border-[#0A0A1A]">
                      {cartItems.length}
                    </span>
                  )}
                </button>

                <div className="h-5 w-px bg-white/10 mx-1"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-lg transition">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-johen-cyan)] to-[var(--color-johen-violet)] flex items-center justify-center border border-white/10 overflow-hidden">
                      <User size={16} className="text-[#0A0A1A] font-bold" />
                    </div>
                    <span className="hidden md:block text-sm font-bold text-white">Bayu Azka</span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#12122A] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm text-white font-bold">Bayu Azka</p>
                        <p className="text-xs text-gray-400 truncate">Member Resmi</p>
                      </div>
                      <Link href="/transaksi" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition block">Riwayat Transaksi</Link>
                      <Link href="/profil" className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition block">Pengaturan Akun</Link>
                      <div className="border-t border-white/5 my-1"></div>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2">
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- CART DRAWER (SIDEBAR KERANJANG) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="w-full md:w-96 bg-[#05050D] border-l border-[var(--color-johen-cyan)]/30 h-full relative z-10 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300">
            
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0A0A1A]">
              <h2 className="text-lg font-black flex items-center gap-2">
                <ShoppingCart size={20} className="text-[var(--color-johen-cyan)]" /> Keranjang Belanja
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p className="text-sm">Keranjang kamu masih kosong.</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={index} className="bg-[#12122A] border border-white/5 rounded-xl p-3 flex items-start gap-3 relative group">
                    <div className="w-12 h-12 bg-[#0A0A1A] rounded-lg border border-white/5 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck size={20} className="text-[var(--color-johen-violet)]" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p className="text-[9px] text-[var(--color-johen-cyan)] font-bold uppercase tracking-widest">{item.category}</p>
                      <p className="font-bold text-sm text-white truncate">{item.name}</p>
                      <p className="text-sm font-black text-[var(--color-johen-cyan)] mt-1">Rp {Number(item.price).toLocaleString('id-ID')}</p>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="absolute right-3 top-3 p-1.5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 rounded-md transition opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-white/10 bg-[#0A0A1A]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Total Harga</span>
                <span className="text-xl font-black text-[var(--color-johen-cyan)]">Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
              <button 
                disabled={cartItems.length === 0}
                className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A1A] font-black py-3.5 rounded-xl transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(0,200,240,0.3)]"
              >
                Checkout Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}