"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { ShieldCheck, Mail, Lock, User, Phone, Loader2, AlertTriangle, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  
  // PERBAIKAN: Ubah 'name' menjadi 'full_name' agar sesuai dengan DTO NestJS
  const [formData, setFormData] = useState({ full_name: "", phone: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // STATE BARU: Untuk fitur intip password
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // VALIDASI REAL-TIME
  const isPasswordValid = formData.password.length === 0 || formData.password.length >= 6;
  const isFormValid = 
    formData.full_name.trim().length > 2 && 
    formData.phone.length >= 9 && 
    formData.email.includes("@") && 
    formData.password.length >= 6;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      await axios.post("http://localhost:3000/auth/register", formData);
      
      // Menggunakan custom alert atau bisa diganti toast nanti
      alert("Registrasi berhasil! Silakan masuk dengan akun kamu.");
      router.push("/login");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Gagal melakukan registrasi. Email mungkin sudah terdaftar.");
    } finally {
      setIsLoading(false);
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
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-johen-cyan)]/20 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-johen-cyan)] to-[var(--color-johen-violet)] mb-4">
                <ShieldCheck size={24} className="text-[#0A0A1A]" />
              </div>
              <h1 className="text-2xl font-black text-white">Daftar Akun Baru</h1>
              <p className="text-sm text-gray-400 mt-2">Bergabunglah untuk melakukan transaksi dengan aman.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 relative z-10">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-bold">
                  <AlertTriangle size={14} /> {errorMsg}
                </div>
              )}

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nama Lengkap" className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3.5 pl-12 text-sm focus:border-[var(--color-johen-cyan)] outline-none text-white transition" />
              </div>
              
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nomor WhatsApp" className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3.5 pl-12 text-sm focus:border-[var(--color-johen-cyan)] outline-none text-white transition" />
              </div>
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="email" name="email" autoComplete="off" value={formData.email} onChange={handleChange} placeholder="Alamat Email" className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3.5 pl-12 text-sm focus:border-[var(--color-johen-cyan)] outline-none text-white transition" />
              </div>
              
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    autoComplete="new-password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Kata Sandi (Min. 6 Karakter)" 
                    className={`w-full bg-[#12122A] border ${!isPasswordValid ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-[var(--color-johen-cyan)]'} rounded-xl p-3.5 pl-12 pr-12 text-sm outline-none text-white transition`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--color-johen-cyan)] transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Peringatan Real-time */}
                {!isPasswordValid && (
                  <p className="text-red-500 text-[10px] mt-1.5 ml-2 font-bold">Kata sandi minimal 6 karakter.</p>
                )}
              </div>

              {/* Tombol Buat Akun yang Cerdas */}
              <button 
                disabled={isLoading || !isFormValid} 
                type="submit" 
                className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] font-black py-4 rounded-xl transition mt-2 disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-2 uppercase tracking-widest"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Buat Akun"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6 relative z-10">
              Sudah punya akun? <Link href="/login" className="text-[var(--color-johen-cyan)] font-bold hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}