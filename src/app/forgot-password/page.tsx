"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import FadeIn from "@/components/FadeIn";
import { Mail, ArrowLeft, Loader2, ShieldCheck, CheckCircle } from "lucide-react";

const supabaseUrl = "https://uehkjsmiyyfvuyblwzau.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGtqc21peXlmdnV5Ymx3emF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MTI0MywiZXhwIjoyMDk0ODQ3MjQzfQ.ukwQf7Ch4_5bs_yFTu_s1mGHhYPKVyKorn55iwINRjw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Nanti setelah deploy ke Vercel, ubah localhost ini jadi domain aslimu!
        redirectTo: 'http://localhost:3001/reset-password', 
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage("Tautan pemulihan kata sandi telah dikirim. Silakan cek Inbox atau folder Spam email kamu.");
    } catch (error: any) {
      setMessage(error.message || "Gagal mengirim email pemulihan. Pastikan email terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <FadeIn>
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--color-johen-cyan)] mb-6 transition group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> KEMBALI KE LOGIN
          </Link>
          
          <div className="bg-[#0A0A1A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-johen-cyan)]/20 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-johen-cyan)] to-[var(--color-johen-violet)] mb-4">
                <ShieldCheck size={24} className="text-[#0A0A1A]" />
              </div>
              <h1 className="text-2xl font-black text-white">Lupa Kata Sandi?</h1>
              <p className="text-sm text-gray-400 mt-2">Masukkan email kamu dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.</p>
            </div>

            {isSuccess ? (
              <div className="text-center bg-green-500/10 border border-green-500/20 p-6 rounded-xl relative z-10">
                <CheckCircle className="text-green-400 mx-auto mb-3" size={32} />
                <p className="text-sm font-bold text-green-400">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 relative z-10">
                {message && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 font-bold">
                    {message}
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Alamat Email Terdaftar" 
                    required
                    className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3.5 pl-12 text-sm focus:border-[var(--color-johen-cyan)] outline-none text-white transition" 
                  />
                </div>

                <button 
                  disabled={loading || !email.includes('@')} 
                  type="submit" 
                  className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] font-black py-4 rounded-xl transition mt-2 disabled:opacity-50 flex justify-center items-center gap-2 uppercase tracking-widest"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Kirim Tautan"}
                </button>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}