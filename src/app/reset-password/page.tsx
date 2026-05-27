"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import FadeIn from "@/components/FadeIn";
import { Lock, Loader2, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";

const supabaseUrl = "https://uehkjsmiyyfvuyblwzau.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGtqc21peXlmdnV5Ymx3emF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MTI0MywiZXhwIjoyMDk0ODQ3MjQzfQ.ukwQf7Ch4_5bs_yFTu_s1mGHhYPKVyKorn55iwINRjw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Mengecek apakah ada token keamanan dari email di URL
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      setErrorMsg("Tautan pemulihan tidak valid atau sudah kadaluarsa. Silakan minta tautan baru.");
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      // Mengirimkan password baru ke Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage("Kata sandi berhasil diubah! Mengalihkan ke halaman login...");
      
      // Tendang ke halaman login setelah 3 detik
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      setErrorMsg(error.message || "Gagal mengubah kata sandi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <FadeIn>
          <div className="bg-[#0A0A1A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-johen-magenta)]/20 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-johen-violet)] to-[var(--color-johen-magenta)] mb-4">
                <ShieldCheck size={24} className="text-[#0A0A1A]" />
              </div>
              <h1 className="text-2xl font-black text-white">Buat Sandi Baru</h1>
              <p className="text-sm text-gray-400 mt-2">Silakan masukkan kata sandi baru untuk akun kamu.</p>
            </div>

            {isSuccess ? (
              <div className="text-center bg-green-500/10 border border-green-500/20 p-6 rounded-xl relative z-10">
                <CheckCircle className="text-green-400 mx-auto mb-3" size={32} />
                <p className="text-sm font-bold text-green-400">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4 relative z-10">
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-bold">
                    <AlertTriangle size={14} className="flex-shrink-0" /> {errorMsg}
                  </div>
                )}

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Kata Sandi Baru (Min. 6 Karakter)" 
                    required
                    disabled={!!errorMsg && errorMsg.includes("tidak valid")}
                    className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3.5 pl-12 text-sm focus:border-[var(--color-johen-cyan)] outline-none text-white transition disabled:opacity-50" 
                  />
                </div>

                <button 
                  disabled={loading || password.length < 6 || (!!errorMsg && errorMsg.includes("tidak valid"))} 
                  type="submit" 
                  className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] font-black py-4 rounded-xl transition mt-2 disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Simpan Sandi Baru"}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}