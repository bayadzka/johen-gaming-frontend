"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { CheckCircle2, Clock, FileText, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  
  // Ambil memory lokal jika webhook belum bekerja di localhost
  const [isPaid, setIsPaid] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem(`paid-${id}`) === 'true';
    return false;
  });

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = "MASUKKAN_CLIENT_KEY_MIDTRANS_DISINI"; 
    const script = document.createElement("script");
    script.src = snapScript; script.setAttribute("data-client-key", clientKey); script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/orders/${id}`);
        setOrder(res.data.data); setLoading(false);
        if (res.data.data.payment_status === 'success') {
          setIsPaid(true); localStorage.setItem(`paid-${id}`, 'true');
        }
      } catch (err) { console.error(err); }
    };
    fetchOrder();
    const interval = setInterval(() => { if (!isPaid) fetchOrder(); }, 3000);
    return () => clearInterval(interval);
  }, [id, isPaid]);

  useEffect(() => {
    if (!order || isPaid) return;
    const interval = setInterval(() => {
      const distance = (new Date(order.created_at).getTime() + (24 * 60 * 60 * 1000)) - new Date().getTime();
      if (distance < 0) {
        clearInterval(interval); setTimeLeft("KADALUARSA");
      } else {
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [order, isPaid]);

  const handlePayNow = () => {
    if ((window as any).snap && order.snap_token) {
      (window as any).snap.pay(order.snap_token, {
        onSuccess: function(result: any) {
          setIsPaid(true);
          localStorage.setItem(`paid-${id}`, 'true'); // Memori lokal mencegah reset
        }
      });
    } else {
      alert("Sistem pembayaran belum siap, tunggu sebentar.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[var(--color-johen-cyan)]" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[80vh]">
      <FadeIn>
        <div className="bg-[#12122A] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className={`p-8 md:p-10 border-b border-white/5 relative overflow-hidden transition-all duration-500 ${isPaid ? 'bg-green-500/10' : 'bg-[var(--color-johen-violet)]/10'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-300 mb-4"><FileText size={14} /> INVOICE #{order.id.split('-')[0].toUpperCase()}</div>
                <h1 className="text-3xl md:text-4xl font-black text-white">{isPaid ? 'Pembayaran Berhasil!' : 'Menunggu Pembayaran'}</h1>
              </div>
              <div className={`px-6 py-4 rounded-2xl border flex flex-col items-center justify-center min-w-[180px] ${isPaid ? 'bg-green-500/20 border-green-500/30' : 'bg-black/40 border-white/10'}`}>
                {isPaid ? (<><CheckCircle2 size={32} className="text-green-400 mb-2" /><span className="font-black text-green-400 tracking-widest uppercase">LUNAS</span></>) : (<><Clock size={24} className="text-[var(--color-johen-cyan)] mb-2 animate-pulse" /><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Batas Waktu</span><span className="font-black text-xl text-[var(--color-johen-cyan)] font-mono">{timeLeft}</span></>)}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Informasi Pesanan</h3>
                <div className="bg-[#0A0A1A] p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm text-gray-400">Total Tagihan</span><span className="text-2xl font-black text-[var(--color-johen-cyan)]">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span></div>
                  <div className="h-px bg-white/5"></div>
                  {/* DETAIL PRODUK DAN QTY */}
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Item Produk</span><span className="text-xs font-bold text-white max-w-[50%] text-right">{order.game_credentials?.product_name || '-'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Kuantitas</span><span className="text-xs font-bold text-[var(--color-johen-cyan)]">{order.game_credentials?.quantity || 1}x</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Nomor WhatsApp</span><span className="text-xs font-bold text-white">{order.customer_phone}</span></div>
                </div>
              </div>

              {order.order_type === 'topup' && order.game_credentials && (
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Detail Akun Tujuan</h3>
                  <div className="bg-[#0A0A1A] p-5 rounded-2xl border border-white/5 flex gap-4">
                    <div className="flex-1"><p className="text-[10px] text-gray-500 uppercase">User ID</p><p className="font-bold text-white">{order.game_credentials.id}</p></div>
                    {order.game_credentials.server && (<div className="flex-1"><p className="text-[10px] text-gray-500 uppercase">Server</p><p className="font-bold text-white">{order.game_credentials.server}</p></div>)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Aksi Pembayaran</h3>
              <div className="bg-[#0A0A1A] flex-1 p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
                {!isPaid ? (
                  <>
                    <ShieldCheck size={48} className="text-[var(--color-johen-violet)] mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">Selesaikan Transaksi</h4>
                    <p className="text-xs text-gray-400 mb-6">Klik tombol di bawah untuk menampilkan pilihan metode pembayaran resmi.</p>
                    <button onClick={handlePayNow} className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] font-black py-4 rounded-xl transition duration-300 uppercase tracking-widest shadow-[0_0_20px_rgba(0,200,240,0.2)]">Buka Portal Pembayaran</button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30"><CheckCircle2 size={40} className="text-green-400" /></div>
                    <h4 className="text-lg font-bold text-white mb-2">Transaksi Selesai</h4>
                    <p className="text-xs text-gray-400 mb-6">Pesanan kamu sedang diproses. Simpan nomor Invoice untuk keperluan bantuan.</p>
                    <button onClick={() => router.push("/")} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition">Kembali ke Beranda</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}