"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import axios from "axios";
// Gunakan useRouter untuk redirect setelah login sukses
import { useRouter } from "next/navigation"; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg("");

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      // Simpan token/sesi secara sederhana di localStorage untuk prototype ini
      if (res.data && res.data.session) {
        localStorage.setItem("sb-token", res.data.session.access_token);
        // Arahkan ke halaman Admin Dashboard
        router.push("/admin");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Email atau password salah.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-johen-violet)]/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-johen-cyan)]/10 blur-[100px] rounded-full pointer-events-none"></div>

      <FadeIn direction="up">
        <div className="bg-[#12122A]/60 backdrop-blur-xl border border-[var(--color-johen-violet)]/30 rounded-3xl w-full max-w-md p-8 md:p-10 shadow-[0_0_50px_rgba(124,58,237,0.1)] relative z-10">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-johen-violet)] to-[var(--color-johen-cyan)] mb-6 shadow-lg shadow-[var(--color-johen-cyan)]/20">
              <ShieldCheck size={32} className="text-[#0A0A1A]" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-wide mb-2">RESTRICTED ACCESS</h1>
            <p className="text-gray-400 text-sm">Silakan login untuk masuk ke Admin Dashboard Johen Gaming.</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                  placeholder="admin@johengaming.com" 
                  className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[var(--color-johen-cyan)] focus:ring-1 focus:ring-[var(--color-johen-cyan)] text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isProcessing}
                  placeholder="••••••••" 
                  className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[var(--color-johen-cyan)] focus:ring-1 focus:ring-[var(--color-johen-cyan)] text-sm transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full mt-8 bg-[var(--color-johen-violet)] hover:bg-[var(--color-johen-magenta)] text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "AUTHORIZE NOW"}
            </button>
          </form>

        </div>
      </FadeIn>
    </div>
  );
}