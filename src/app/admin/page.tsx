"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { 
  LayoutDashboard, Package, ShoppingCart, LogOut, 
  Plus, Trash2, Edit, ShieldAlert, Loader2 
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Verifikasi sesi login sederhana
  useEffect(() => {
    const token = localStorage.getItem("sb-token");
    if (!token) {
      router.push("/login");
    } else {
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProducts, resOrders] = await Promise.all([
        axios.get("http://localhost:3000/products"),
        axios.get("http://localhost:3000/orders")
      ]);
      setProducts(resProducts.data.data);
      setOrders(resOrders.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sb-token");
    router.push("/login");
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await axios.delete(`http://localhost:3000/products/${id}`);
        fetchData(); // Refresh data setelah menghapus
      } catch (error) {
        alert("Gagal menghapus produk");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-johen-cyan)] mb-4" size={40} />
        <p className="text-gray-400 animate-pulse">Memuat sistem dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#05050D]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0A0A1A] border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-johen-violet)] to-[var(--color-johen-cyan)] flex items-center justify-center">
            <ShieldAlert size={16} className="text-[#0A0A1A]" />
          </div>
          <span className="font-extrabold tracking-widest">ADMIN PANEL</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "products" 
                ? "bg-[var(--color-johen-cyan)]/10 text-[var(--color-johen-cyan)] border border-[var(--color-johen-cyan)]/20" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Package size={18} />
            <span className="font-semibold text-sm">Manajemen Produk</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "orders" 
                ? "bg-[var(--color-johen-cyan)]/10 text-[var(--color-johen-cyan)] border border-[var(--color-johen-cyan)]/20" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <ShoppingCart size={18} />
            <span className="font-semibold text-sm">Pesanan Masuk</span>
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <FadeIn>
          {/* Header */}
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">
                {activeTab === "products" ? "Manajemen Produk" : "Daftar Pesanan"}
              </h1>
              <p className="text-gray-400 text-sm">
                Kendali penuh atas marketplace Johen Gaming.
              </p>
            </div>
            
            {activeTab === "products" && (
              <button className="bg-[var(--color-johen-violet)] hover:bg-[var(--color-johen-magenta)] transition px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                <Plus size={16} /> Tambah Produk
              </button>
            )}
          </header>

          {/* TAB: PRODUK */}
          {activeTab === "products" && (
            <div className="bg-[#12122A]/50 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E1E3F]/50 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                    <th className="p-5 font-semibold">Nama Produk</th>
                    <th className="p-5 font-semibold">Kategori</th>
                    <th className="p-5 font-semibold">Harga</th>
                    <th className="p-5 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition">
                      <td className="p-5 font-medium">{product.name}</td>
                      <td className="p-5">
                        <span className="px-2.5 py-1 bg-[var(--color-johen-cyan)]/10 text-[var(--color-johen-cyan)] rounded text-xs border border-[var(--color-johen-cyan)]/20">
                          {product.category === 'game_account' ? 'Akun Game' : 'Top Up'}
                        </span>
                      </td>
                      <td className="p-5 font-bold">Rp {product.price.toLocaleString('id-ID')}</td>
                      <td className="p-5 flex justify-center gap-3">
                        <button className="p-2 text-gray-400 hover:text-[var(--color-johen-cyan)] transition bg-white/5 rounded-lg">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-400 transition bg-white/5 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-10 text-gray-500">Belum ada data produk.</div>
              )}
            </div>
          )}

          {/* TAB: PESANAN */}
          {activeTab === "orders" && (
            <div className="bg-[#12122A]/50 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E1E3F]/50 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                    <th className="p-5 font-semibold">Pembeli</th>
                    <th className="p-5 font-semibold">No HP</th>
                    <th className="p-5 font-semibold">Total Harga</th>
                    <th className="p-5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition">
                      <td className="p-5">
                        <p className="font-bold">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.products?.name}</p>
                      </td>
                      <td className="p-5 text-gray-300">{order.customer_phone}</td>
                      <td className="p-5 font-bold text-[var(--color-johen-cyan)]">
                        Rp {order.total_price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          order.payment_status === 'success' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : order.payment_status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {order.payment_status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-10 text-gray-500">Belum ada pesanan masuk.</div>
              )}
            </div>
          )}

        </FadeIn>
      </main>
    </div>
  );
}