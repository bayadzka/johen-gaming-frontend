"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { FileText, ArrowRight, Loader2, Clock, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function TransaksiPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Filter
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const res = await axios.get("http://localhost:3000/orders");
        const sortedOrders = res.data.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Gagal mengambil data riwayat transaksi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  // Logika Penyaringan
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.payment_status === activeFilter;
  });

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-12 h-12 text-[var(--color-johen-cyan)] animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[80vh]">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-3">Riwayat Transaksi</h1>
          <p className="text-sm text-gray-400">Pantau seluruh status pesanan Top-Up dan pembelian akun kamu di sini.</p>
        </div>

        {/* --- FITUR FILTER KATEGORI --- */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeFilter === 'all' ? 'bg-[var(--color-johen-cyan)] text-[#0A0A1A]' : 'bg-[#12122A] text-gray-400 border border-white/5'}`}>Semua Transaksi</button>
          <button onClick={() => setActiveFilter('pending')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-[#12122A] text-gray-400 border border-white/5'}`}><Clock size={14}/> Menunggu</button>
          <button onClick={() => setActiveFilter('success')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#12122A] text-gray-400 border border-white/5'}`}><CheckCircle2 size={14}/> Lunas</button>
          <button onClick={() => setActiveFilter('failed')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#12122A] text-gray-400 border border-white/5'}`}><XCircle size={14}/> Gagal/Batal</button>
          <button onClick={() => setActiveFilter('expired')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === 'expired' ? 'bg-gray-800/80 text-gray-300 border border-gray-600' : 'bg-[#12122A] text-gray-400 border border-white/5'}`}><AlertTriangle size={14}/> Kadaluarsa</button>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 bg-[#12122A]/50 border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-500 text-sm">Tidak ada transaksi dalam kategori ini.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} onClick={() => router.push(`/invoice/${order.id}`)} className="bg-[#12122A] border border-white/5 p-5 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:border-[var(--color-johen-cyan)]/30 transition group shadow-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${order.payment_status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : order.payment_status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : order.payment_status === 'expired' ? 'bg-gray-800 text-gray-400 border-gray-600' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {order.payment_status === 'success' ? <CheckCircle2 size={24} /> : order.payment_status === 'pending' ? <Clock size={24} /> : order.payment_status === 'expired' ? <AlertTriangle size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">Invoice #{order.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm font-bold text-gray-300 mt-2">{order.game_credentials?.product_name || 'Pembelian Akun'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto md:gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className="font-black text-xl text-[var(--color-johen-cyan)]">Rp {Number(order.total_amount).toLocaleString('id-ID')}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${order.payment_status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : order.payment_status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : order.payment_status === 'expired' ? 'bg-gray-800 text-gray-400 border-gray-600' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {order.payment_status === 'success' ? 'Berhasil' : order.payment_status === 'pending' ? 'Menunggu Pembayaran' : order.payment_status === 'expired' ? 'Kadaluarsa' : 'Dibatalkan'}
                    </span>
                  </div>
                  <ArrowRight className="text-gray-600 group-hover:text-[var(--color-johen-cyan)] transition hidden md:block" size={20} />
                </div>
              </div>
            ))
          )}
        </div>
      </FadeIn>
    </div>
  );
}