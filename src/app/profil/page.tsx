"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import FadeIn from "@/components/FadeIn";
import { User, Mail, Phone, Save, Loader2, ArrowLeft, ShieldCheck, CheckCircle } from "lucide-react";

const supabaseUrl = "https://uehkjsmiyyfvuyblwzau.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGtqc21peXlmdnV5Ymx3emF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MTI0MywiZXhwIjoyMDk0ODQ3MjQzfQ.ukwQf7Ch4_5bs_yFTu_s1mGHhYPKVyKorn55iwINRjw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ProfilePage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    // 1. Ambil data dari Local Storage saat halaman dimuat
    const savedName = localStorage.getItem("user-name") || "";
    const savedEmail = localStorage.getItem("user-email") || "";
    const savedPhone = localStorage.getItem("user-phone") || "";
    
    // 2. Tendang ke halaman login jika tidak ada sesi email
    if (!savedEmail) {
      router.push("/login");
      return;
    }

    setFullName(savedName);
    setEmail(savedEmail);
    
    // Bersihkan format nomor HP (hilangkan 62 atau 0 di depan jika ada)
    let cleanPhone = savedPhone;
    if (cleanPhone.startsWith("62")) cleanPhone = cleanPhone.slice(2);
    else if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.slice(1);
    setPhone(cleanPhone);
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", isError: false });

    try {
      const token = localStorage.getItem("user-token");
      const refreshToken = localStorage.getItem("user-refresh-token"); // <-- TARIK REFRESH TOKEN
      
      if (!token) throw new Error("Sesi tidak valid, silakan login ulang.");

      // Set sesi Supabase menggunakan pasangan token yang sah dan lengkap
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken || "", // <-- GUNAKAN DI SINI
      });

      // Update metadata di Supabase
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          phone: `0${phone}` 
        }
      });

      if (error) throw error;

      // Update memori lokal browser agar Navbar langsung berubah
      localStorage.setItem("user-name", fullName);
      localStorage.setItem("user-phone", `0${phone}`);
      window.dispatchEvent(new Event("loginUpdated")); 

      setMessage({ text: "Profil berhasil diperbarui!", isError: false });
    } catch (error: any) {
      setMessage({ text: error.message || "Gagal memperbarui profil.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--color-johen-cyan)] mb-6 transition group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> KEMBALI KE BERANDA
          </Link>

          <div className="bg-[#0A0A1A] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[var(--color-johen-cyan)]/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-white/5 pb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-johen-cyan)] to-[var(--color-johen-violet)] flex items-center justify-center border border-white/10 flex-shrink-0">
                <User size={32} className="text-[#0A0A1A]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white leading-tight">Pengaturan Profil</h1>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-green-400" /> Member Terverifikasi
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
              {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${message.isError ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'}`}>
                  {message.isError ? <User size={18} /> : <CheckCircle size={18} />}
                  {message.text}
                </div>
              )}

              {/* Form Email (Disabled - Tidak bisa diubah sembarangan) */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Alamat Email (Permanen)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 pl-12 text-sm text-gray-500 outline-none cursor-not-allowed" 
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">*Email digunakan sebagai identitas utama dan tidak dapat diubah.</p>
              </div>

              {/* Form Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Lengkap / Panggilan</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required
                    placeholder="Masukkan nama lengkap kamu"
                    className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3.5 pl-12 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none transition" 
                  />
                </div>
              </div>

              {/* Form Nomor WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nomor WhatsApp Aktif</label>
                <div className="relative flex">
                  <div className="bg-white/5 border border-white/10 rounded-l-xl px-4 flex items-center justify-center text-sm font-bold text-gray-400 border-r-0">
                    +62
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="number" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      required
                      placeholder="81234567890"
                      className="w-full bg-[#12122A] border border-white/10 rounded-r-xl p-3.5 pl-10 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none transition" 
                    />
                  </div>
                </div>
                <p className="text-[10px] text-[var(--color-johen-cyan)] mt-1.5">*Nomor ini akan otomatis terisi saat kamu melakukan Checkout atau Top-Up.</p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button 
                  type="submit" 
                  disabled={isSaving || !fullName || !phone}
                  className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] font-black py-4 rounded-xl transition flex justify-center items-center gap-2 uppercase tracking-widest disabled:opacity-50 shadow-[0_0_15px_rgba(0,200,240,0.2)]"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Simpan Perubahan Profil</>}
                </button>
              </div>
            </form>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}