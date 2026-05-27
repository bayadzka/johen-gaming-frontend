"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { CheckCircle2, Clock, FileText, ArrowLeft, Loader2, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

export default function InvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

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
        setOrder(res.data.data); 
      } catch (err) { 
        alert("Invoice tidak ditemukan."); router.push("/transaksi");
      } finally { setLoading(false); }
    };
    fetchOrder();
    const interval = setInterval(() => { 
      if (order?.payment_status === 'pending') fetchOrder(); 
    }, 3000);
    return () => clearInterval(interval);
  }, [id, order?.payment_status, router]);

  useEffect(() => {
    if (!order || order.payment_status !== 'pending') return;
    const interval = setInterval(() => {
      const distance = (new Date(order.created_at).getTime() + (24 * 60 * 60 * 1000)) - new Date().getTime();
      if (distance < 0) {
        clearInterval(interval); setTimeLeft("00:00:00");
      } else {
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const handlePayNow = () => {
    if ((window as any).snap && order.snap_token) {
      (window as any).snap.pay(order.snap_token, {
        onSuccess: function() { setOrder({...order, payment_status: 'success'}); }
      });
    } else alert("Sistem pembayaran belum siap.");
  };

  if (loading || !order) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[var(--color-johen-cyan)]" size={40} /></div>;

  const isSuccess = order.payment_status === 'success';
  const isFailed = order.payment_status === 'failed';
  const isExpired = order.payment_status === 'expired';
  const isPending = order.payment_status === 'pending';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-12 min-h-[80vh]">
      <FadeIn>
        <button onClick={() => router.push("/transaksi")} className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[var(--color-johen-cyan)] mb-6 transition group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> KEMBALI KE RIWAYAT TRANSAKSI
        </button>

        <div className="bg-[#12122A] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          {/* HEADER BERUBAH WARNA SESUAI STATUS */}
          <div className={`p-8 md:p-10 border-b border-white/5 relative overflow-hidden transition-all duration-500 ${isSuccess ? 'bg-green-500/10' : isFailed ? 'bg-red-500/10' : isExpired ? 'bg-gray-500/10' : 'bg-[var(--color-johen-violet)]/10'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-300 mb-4"><FileText size={14} /> INVOICE #{order.id.split('-')[0].toUpperCase()}</div>
                <h1 className="text-3xl md:text-4xl font-black text-white">
                  {isSuccess ? 'Pembayaran Berhasil!' : isFailed ? 'Pesanan Dibatalkan' : isExpired ? 'Invoice Kadaluarsa' : 'Menunggu Pembayaran'}
                </h1>
              </div>
              <div className={`px-6 py-4 rounded-2xl border flex flex-col items-center justify-center min-w-[180px] ${isSuccess ? 'bg-green-500/20 border-green-500/30' : isFailed ? 'bg-red-500/20 border-red-500/30' : isExpired ? 'bg-gray-800/50 border-gray-600/30' : 'bg-black/40 border-white/10'}`}>
                {isSuccess && <><CheckCircle2 size={32} className="text-green-400 mb-2" /><span className="font-black text-green-400 tracking-widest uppercase">LUNAS</span></>}
                {isFailed && <><XCircle size={32} className="text-red-400 mb-2" /><span className="font-black text-red-400 tracking-widest uppercase">BATAL</span></>}
                {isExpired && <><AlertTriangle size={32} className="text-gray-400 mb-2" /><span className="font-black text-gray-400 tracking-widest uppercase">KADALUARSA</span></>}
                {isPending && <><Clock size={24} className="text-[var(--color-johen-cyan)] mb-2 animate-pulse" /><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Batas Waktu</span><span className="font-black text-xl text-[var(--color-johen-cyan)] font-mono">{timeLeft}</span></>}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Informasi Pesanan</h3>
                <div className="bg-[#0A0A1A] p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
  <span className="text-sm text-gray-400">Total Tagihan</span>
  <span className="text-2xl font-black text-[var(--color-johen-cyan)]">
    {/* Logika Pintar: Ambil harga titipan, jika tidak ada baru pakai harga dari database */}
    Rp {Number(order.game_credentials?.final_discounted_price || order.total_amount).toLocaleString('id-ID')}
  </span>
</div>
                  <div className="h-px bg-white/5"></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Item Produk</span><span className="text-xs font-bold text-white max-w-[50%] text-right">{order.game_credentials?.product_name || '-'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Kuantitas</span><span className="text-xs font-bold text-[var(--color-johen-cyan)]">{order.game_credentials?.quantity || 1}x</span></div>
                  {order.voucher_code && (
  <div className="flex justify-between items-center text-xs text-[var(--color-johen-cyan)] font-bold mt-1">
    <span>Voucher Digunakan:</span>
    <span>{order.voucher_code}</span>
  </div>
)}
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
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Status & Keterangan</h3>
              <div className="bg-[#0A0A1A] flex-1 p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
                {isPending && (
                  <>
                    <ShieldCheck size={48} className="text-[var(--color-johen-violet)] mb-4" />
                    <h4 className="text-lg font-bold text-white mb-2">Selesaikan Transaksi</h4>
                    <p className="text-xs text-gray-400 mb-6">Pilih metode pembayaran resmi Midtrans sebelum waktu habis.</p>
                    <button onClick={handlePayNow} className="w-full bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] font-black py-4 rounded-xl transition shadow-[0_0_20px_rgba(0,200,240,0.2)]">Buka Portal Pembayaran</button>
                  </>
                )}
                {isSuccess && (
                  <>
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30"><CheckCircle2 size={40} className="text-green-400" /></div>
                    <h4 className="text-lg font-bold text-white mb-2">Pesanan Diproses</h4>
                    <p className="text-xs text-gray-400">Terima kasih. Item digital kamu akan segera dikirimkan oleh sistem.</p>
                  </>
                )}
                {isFailed && (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 border border-red-500/30"><XCircle size={40} className="text-red-400" /></div>
                    <h4 className="text-lg font-bold text-white mb-2">Pesanan Dibatalkan</h4>
                    <p className="text-xs text-gray-400 mb-4">Transaksi ini dibatalkan oleh Admin Johen Gaming.</p>
                    {order.cancel_reason && (
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl w-full text-left">
                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Alasan Pembatalan:</p>
                        <p className="text-sm text-white italic">"{order.cancel_reason}"</p>
                      </div>
                    )}
                  </>
                )}
                {isExpired && (
                  <>
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-600"><AlertTriangle size={40} className="text-gray-400" /></div>
                    <h4 className="text-lg font-bold text-white mb-2">Waktu Habis</h4>
                    <p className="text-xs text-gray-400">Pembayaran tidak diterima dalam kurun waktu 24 jam. Silakan buat pesanan baru.</p>
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