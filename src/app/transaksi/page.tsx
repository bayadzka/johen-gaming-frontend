"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { Search, FileText, ArrowRight, Loader2 } from "lucide-react";

export default function TransaksiPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true); setHasSearched(true);
    
    try {
      // Karena kita butuh endpoint custom, untuk prototype ini kita ambil semua orders lalu difilter di sisi frontend.
      // Di real case, backend NestJS yang melakukan filter ini dengan Query `WHERE customer_phone = phone`.
      const res = await axios.get("http://localhost:3000/orders");
      const userOrders = res.data.data.filter((o: any) => o.customer_phone === phone);
      setOrders(userOrders);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[80vh]">
      <FadeIn>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-3">Lacak Pesanan Kamu</h1>
          <p className="text-sm text-gray-400">Masukkan nomor WhatsApp yang kamu gunakan saat melakukan Top-Up.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="081234567890" className="w-full bg-[#12122A] border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--color-johen-cyan)] transition" />
          </div>
          <button type="submit" disabled={loading || !phone} className="bg-[var(--color-johen-cyan)] text-[#0A0A1A] font-bold px-8 rounded-xl disabled:opacity-50 flex items-center justify-center w-32">
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'CARI'}
          </button>
        </form>

        {hasSearched && !loading && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-10 bg-[#12122A]/50 border border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-500 text-sm">Tidak ada riwayat transaksi untuk nomor tersebut.</p>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} onClick={() => router.push(`/invoice/${order.id}`)} className="bg-[#12122A] border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer hover:border-[var(--color-johen-cyan)]/30 transition group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.payment_status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}><FileText size={20} /></div>
                    <div>
                      <p className="font-bold text-white text-sm">Invoice #{order.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString('id-ID')} • {order.game_credentials?.product_name || 'Pembelian Akun'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-black text-[var(--color-johen-cyan)]">Rp {Number(order.total_amount).toLocaleString('id-ID')}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${order.payment_status === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>{order.payment_status}</span>
                    </div>
                    <ArrowRight className="text-gray-600 group-hover:text-white transition" size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </FadeIn>
    </div>
  );
}