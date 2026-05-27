"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { LogIn, Mail, Lock, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = "https://uehkjsmiyyfvuyblwzau.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGtqc21peXlmdnV5Ymx3emF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MTI0MywiZXhwIjoyMDk0ODQ3MjQzfQ.ukwQf7Ch4_5bs_yFTu_s1mGHhYPKVyKorn55iwINRjw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post("http://localhost:3000/auth/login", formData);
      
      // Ambil token secara aman dari berbagai kemungkinan struktur respon backend
      const token = response.data?.session?.access_token || response.data?.access_token;
      const refreshToken = response.data?.session?.refresh_token;

      if (!token) {
        setErrorMsg("Login berhasil, tetapi token tidak ditemukan dalam respon server.");
        setIsLoading(false);
        return;
      }

      // DECODE TOKEN JWT SECARA AMAN
      let loggedInName = "User";
      let loggedInPhone = "";
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        loggedInName = payload.user_metadata?.full_name || payload.full_name || payload.name || "User";
        
        // Ambil nomor HP dari payload atau user_metadata
        loggedInPhone = payload.user_metadata?.phone || payload.phone || ""; 
      } catch (decodeError) {
        console.error("Gagal membaca nama dari token JWT:", decodeError);
      }

      // ALUR REDIRECT & ISOLASI DATA
      if (formData.email === "admin@johengaming.com") {
        localStorage.setItem("sb-token", token);
        window.location.href = "/admin"; 
      } else {
        localStorage.setItem("user-token", token);
        if (refreshToken) localStorage.setItem("user-refresh-token", refreshToken);
        localStorage.setItem("user-name", loggedInName);
        localStorage.setItem("user-email", formData.email);
        
        // Simpan nomor HP ke local storage jika ada
        if (loggedInPhone) localStorage.setItem("user-phone", loggedInPhone); 
        
        window.location.href = "/"; 
      }

    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Email atau kata sandi salah.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Arahkan kembali ke localhost kamu setelah sukses login Google
          redirectTo: 'http://localhost:3001/' 
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuka otentikasi Google.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <FadeIn>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--color-johen-cyan)] mb-6 transition group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> KEMBALI
        </Link>
        
        <div className="bg-[#0A0A1A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Efek Cahaya */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-[var(--color-johen-violet)]/20 blur-[60px] rounded-full pointer-events-none"></div>
          
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-johen-violet)] to-[var(--color-johen-cyan)] mb-4">
              <LogIn size={24} className="text-[#0A0A1A]" />
            </div>
            <h1 className="text-2xl font-black text-white">Selamat Datang</h1>
            <p className="text-sm text-gray-400 mt-2">Masuk ke akun kamu untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-bold">
                <AlertTriangle size={14} /> {errorMsg}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="email" name="email" autoComplete="off" required value={formData.email} onChange={handleChange} placeholder="Alamat Email" className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3.5 pl-12 text-sm focus:border-[var(--color-johen-cyan)] outline-none text-white transition" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="password" name="password" autoComplete="new-password" required value={formData.password} onChange={handleChange} placeholder="Kata Sandi" className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3.5 pl-12 text-sm focus:border-[var(--color-johen-cyan)] outline-none text-white transition" />
            </div>
            {/* TAUTAN LUPA PASSWORD */}
<div className="text-right mt-1.5">
  <Link 
    href="/forgot-password" 
    className="text-[11px] text-gray-400 hover:text-[var(--color-johen-cyan)] transition font-bold uppercase tracking-wider"
  >
    Lupa Kata Sandi?
  </Link>
</div>

            <button disabled={isLoading} type="submit" className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] font-black py-4 rounded-xl transition mt-2 disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Masuk Akun"}
            </button>
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0A0A1A] px-3 text-gray-500 font-bold uppercase tracking-widest">Atau</span>
              </div>
            </div>

            {/* Tombol Google OAuth */}
            <button 
    type="button" 
    onClick={handleGoogleLogin} 
    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl border border-white/10 transition duration-300 flex justify-center items-center gap-3"
  >
              {/* Icon SVG Google */}
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6 relative z-10">
            Belum punya akun? <Link href="/register" className="text-[var(--color-johen-cyan)] font-bold hover:underline">Daftar sekarang</Link>
          </p>
        </div>
      </FadeIn>
    </div>
    </div>
  );
}