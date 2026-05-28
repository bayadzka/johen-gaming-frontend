"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { 
  Package, ShoppingCart, LogOut, ShieldAlert, Loader2, 
  X, Save, Plus, ChevronUp, ChevronDown, CheckCircle2, 
  Gamepad2, CheckSquare, Database, Settings, Bell, ChevronDown as ChevronDownIcon, User, Edit, Trash2, CheckCircle, XCircle, Eye, ShieldCheck, Clock,
  AlertTriangle, Ticket
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uehkjsmiyyfvuyblwzau.supabase.co"; 
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGtqc21peXlmdnV5Ymx3emF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3MTI0MywiZXhwIjoyMDk0ODQ3MjQzfQ.ukwQf7Ch4_5bs_yFTu_s1mGHhYPKVyKorn55iwINRjw";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // --- Master Data ---
  const [valuationMaster, setValuationMaster] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);

  // --- State Form CRUD Akun ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModeId, setEditModeId] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [accountTitle, setAccountTitle] = useState("");
  const [accountDesc, setAccountDesc] = useState("");
  const [accountImages, setAccountImages] = useState<string[]>([""]); 
  const [currentRank, setCurrentRank] = useState("");
  const [highestRank, setHighestRank] = useState("");
  const [winRate, setWinRate] = useState<number>(50.0);
  const [totalMatch, setTotalMatch] = useState<number>(100);
  const [maxEmblem, setMaxEmblem] = useState<number>(0);
  const [adminMargin, setAdminMargin] = useState<number>(0);
  const [selectedSkins, setSelectedSkins] = useState<string[]>([]);
  const [activeSkinCategory, setActiveSkinCategory] = useState<string | null>(null);
  const [basicPrice, setBasicPrice] = useState<number>(0);
  const [basicDesc, setBasicDesc] = useState("");
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [newGameName, setNewGameName] = useState("");

  // --- State Modul Pesanan ---
  const [selectedOrder, setSelectedOrder] = useState<any>(null); // State Modal Detail Order
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [cancelModalOrder, setCancelModalOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [successModalOrder, setSuccessModalOrder] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [vCode, setVCode] = useState("");
  const [vDiscount, setVDiscount] = useState<number>(5);
  const [vMaxUsage, setVMaxUsage] = useState<number>(50);
  const [vExpiredAt, setVExpiredAt] = useState("");
  const [isSavingVoucher, setIsSavingVoucher] = useState(false);
  const [editVoucherId, setEditVoucherId] = useState<string | null>(null);
  // --- State Form Master Data (Skin MLBB) ---
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [mItemName, setMItemName] = useState("");
  const [mCategory, setMCategory] = useState("Legend Limit"); 
  const [mBaseValue, setMBaseValue] = useState<number>(0);
  const [mPoints, setMPoints] = useState<number>(0);
  const [mImageUrl, setMImageUrl] = useState("");
  const [isSavingMaster, setIsSavingMaster] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editMasterId, setEditMasterId] = useState<string | null>(null);
  const [viewMasterItem, setViewMasterItem] = useState<any>(null);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isUploadingAccImage, setIsUploadingAccImage] = useState(false);
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<any>(null);
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [deliveryPassword, setDeliveryPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("sb-token");
    if (!token) router.push("/login");
    else { fetchData(); fetchMasterData(); }
  }, [router]);

  const fetchData = async () => {
    try {
      // Tambahkan timestamp agar browser tidak membaca cache lama (Anti-Ghosting)
      const t = new Date().getTime();
      const [resProducts, resOrders] = await Promise.all([
        axios.get(`https://johen-gaming-backend-production.up.railway.app/accounts/admin-list?t=${t}`),
        axios.get(`https://johen-gaming-backend-production.up.railway.app/orders?t=${t}`)
      ]);
      setProducts(resProducts.data.data || []);
      const sortedOrders = (resOrders.data.data || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(sortedOrders);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchMasterData = async () => {
    try {
      const [resVal, resGames] = await Promise.all([
        axios.get("https://johen-gaming-backend-production.up.railway.app/accounts/valuation-master"),
        axios.get("https://johen-gaming-backend-production.up.railway.app/accounts/games")
      ]);
      setValuationMaster(resVal.data.data || []); 
      setGames(resGames.data.data || []);

      // FETCH VOUCHERS DARI SUPABASE
      const { data: voucherData } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
      setVouchers(voucherData || []);
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => { localStorage.removeItem("sb-token"); router.push("/login"); };

  // --- CRUD HANDLERS AKUN ---
  const handleOpenAddModal = () => {
    setEditModeId(null); setAccountTitle(""); setAccountImages([""]); setSelectedGameId(""); setCurrentRank(""); setHighestRank("");
    setWinRate(50.0); setTotalMatch(100); setMaxEmblem(0); setSelectedSkins([]); setAdminMargin(0); setBasicPrice(0); setBasicDesc("");
    setAccountDesc("");
    setShowAddModal(true);
  };

  const handleEdit = (product: any) => {
    setEditModeId(product.id); setSelectedGameId(product.game_id); setAccountTitle(product.title); setAdminMargin(Number(product.admin_margin));
    const isMLBB = games.find(g => g.id === product.game_id)?.name.toLowerCase().includes('mobile legends');
    if (isMLBB && product.account_details) {
      setAccountDesc(product.account_details?.description || "");
      setAccountImages(product.account_details.images || [""]); setCurrentRank(product.account_details.current_rank || ""); setHighestRank(product.account_details.highest_rank || "");
      setWinRate(product.account_details.win_rate || 50.0); setTotalMatch(product.account_details.total_match || 100); setMaxEmblem(product.account_details.max_emblem || 0); setSelectedSkins(product.account_details.skins?.map((s: any) => s.id) || []);
    } else { setBasicPrice(Number(product.calculated_price)); setBasicDesc(product.account_details?.description || ""); }
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus akun ini secara permanen?")) {
      try { await axios.delete(`https://johen-gaming-backend-production.up.railway.app/accounts/${id}`); fetchData(); } catch (error) { alert("Gagal menghapus data."); }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    try { await axios.patch(`https://johen-gaming-backend-production.up.railway.app/accounts/${id}/status`, { status: newStatus }); fetchData(); } catch (error) { alert("Gagal merubah status."); }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const isMLBB = games.find(g => g.id === selectedGameId)?.name.toLowerCase().includes('mobile legends');
    try {
      let payload: any;
      if (isMLBB) {
        const skinDetails = selectedSkins.map(id => { const s = valuationMaster.find(v => v.id === id); return { id: s.id, name: s.item_name, category: s.group_category, image: s.image_url }; });
        payload = {
          game_id: selectedGameId, title: accountTitle, calculated_price: calculatedBasePrice(), admin_margin: Number(adminMargin), final_price: finalPrice, status: 'available',
          account_details: { description: accountDesc, images: accountImages.filter(url => url.trim() !== ""), current_rank: currentRank, highest_rank: highestRank, win_rate: winRate, total_match: totalMatch, max_emblem: maxEmblem, skins: skinDetails, total_collection_points: calculatedPoints() }
        };
      } else {
        payload = { game_id: selectedGameId, title: accountTitle, calculated_price: basicPrice, admin_margin: 0, final_price: basicPrice, status: 'available', account_details: { description: basicDesc } };
      }
      if (editModeId) { const { status, ...updatePayload } = payload; await axios.put(`https://johen-gaming-backend-production.up.railway.app/accounts/${editModeId}`, updatePayload); } 
      else { await axios.post("https://johen-gaming-backend-production.up.railway.app/accounts", payload); }
      setShowAddModal(false); fetchData(); 
    } catch (error) { alert("Gagal menyimpan akun."); } finally { setIsSaving(false); }
  };

  const handleAddNewGame = async () => {
    if(!newGameName) return;
    try { await axios.post("https://johen-gaming-backend-production.up.railway.app/accounts/games", { name: newGameName, publisher: 'General', input_type: 'id_only' }); setShowAddGameModal(false); setNewGameName(""); fetchMasterData(); } catch(err) { alert("Gagal menambah game."); }
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode || vDiscount <= 0 || vMaxUsage <= 0 || !vExpiredAt) return;
    setIsSavingVoucher(true);

    try {
      const payload = {
        code: vCode.toUpperCase().trim(),
        discount_percent: Number(vDiscount),
        max_usage: Number(vMaxUsage),
        expired_at: new Date(vExpiredAt).toISOString()
      };

      if (editVoucherId) {
        // Mode UPDATE
        const { error } = await supabase.from('vouchers').update(payload).eq('id', editVoucherId);
        if (error) throw error;
      } else {
        // Mode CREATE
        const { error } = await supabase.from('vouchers').insert([{ ...payload, current_usage: 0 }]);
        if (error) throw error;
      }

      setShowVoucherModal(false);
      setVCode(""); setVDiscount(5); setVMaxUsage(50); setVExpiredAt(""); setEditVoucherId(null);
      
      const { data: voucherData } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
      setVouchers(voucherData || []);
    } catch (error: any) {
      alert(error.message || "Gagal menyimpan voucher.");
    } finally {
      setIsSavingVoucher(false);
    }
  };

  const handleEditVoucher = (v: any) => {
    setEditVoucherId(v.id);
    setVCode(v.code);
    setVDiscount(v.discount_percent);
    setVMaxUsage(v.max_usage);
    setVExpiredAt(new Date(v.expired_at).toISOString().split('T')[0]); // Format YYYY-MM-DD
    setShowVoucherModal(true);
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus kode voucher ini?")) return;
    try {
      await supabase.from('vouchers').delete().eq('id', id);
      setVouchers(vouchers.filter(v => v.id !== id));
    } catch (error) {
      alert("Gagal menghapus voucher.");
    }
  };

  // --- FUNGSI CRUD MASTER DATA (SKIN MLBB) ---
  const handleSaveMasterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mItemName || !mCategory || !mImageUrl) return;
    setIsSavingMaster(true);

    try {
      const payload = {
        item_name: mItemName,
        group_category: mCategory,
        base_value: Number(mBaseValue),
        collection_points: Number(mPoints),
        image_url: mImageUrl,
        item_type: 'skin_tier' 
      };

      if (editMasterId) {
        // Mode UPDATE (Perbaikan Nama Tabel)
        const { error } = await supabase.from('mlbb_valuation_master').update(payload).eq('id', editMasterId);
        if (error) throw error;
      } else {
        // Mode CREATE (Perbaikan Nama Tabel)
        const { error } = await supabase.from('mlbb_valuation_master').insert([payload]);
        if (error) throw error;
      }

      setShowAddMasterModal(false);
      setMItemName(""); setMBaseValue(0); setMPoints(0); setMImageUrl(""); setEditMasterId(null);
      fetchMasterData(); // Refresh data tabel secara otomatis
      alert(editMasterId ? "Item Master berhasil diperbarui!" : "Item Master baru berhasil ditambahkan!");
    } catch (error: any) {
      alert(error.message || "Gagal menyimpan item master.");
    } finally {
      setIsSavingMaster(false);
    }
  };

  const handleEditMaster = (item: any) => {
    setEditMasterId(item.id);
    setMItemName(item.item_name);
    setMCategory(item.group_category);
    setMBaseValue(item.base_value);
    setMPoints(item.collection_points);
    setMImageUrl(item.image_url);
    setShowAddMasterModal(true);
  };

  const handleDeleteMasterItem = async (id: string) => {
    if (!window.confirm("Peringatan: Menghapus data master bisa berdampak pada kalkulasi akun yang sudah memakai item ini. Yakin ingin menghapus?")) return;
    try {
      // Perbaikan Nama Tabel
      await supabase.from('mlbb_valuation_master').delete().eq('id', id);
      setValuationMaster(valuationMaster.filter((v: any) => v.id !== id));
    } catch (error) {
      alert("Gagal menghapus item master.");
    }
  };

  // --- FUNGSI UPLOAD GAMBAR KE SUPABASE STORAGE ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // 1. Buat nama file unik agar tidak bentrok
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `master-skins/${fileName}`;

      // 2. Upload file ke bucket 'johen-storage'
      const { error: uploadError } = await supabase.storage
        .from('johen-storage')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Ambil URL Publik dari gambar yang baru diupload
      const { data } = supabase.storage
        .from('johen-storage')
        .getPublicUrl(filePath);

      // 4. Masukkan URL ke state agar tersimpan ke database saat disubmit
      setMImageUrl(data.publicUrl);
    } catch (error: any) {
      alert(error.message || "Gagal mengunggah gambar ke Storage.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAccImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAccImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `account-images/${fileName}`; // Beda folder dengan skin

      const { error: uploadError } = await supabase.storage
        .from('johen-storage')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('johen-storage')
        .getPublicUrl(filePath);

      // Tambahkan URL gambar baru ke dalam array accountImages
      setAccountImages(prev => {
        const filtered = prev.filter(url => url.trim() !== ""); // Buang string kosong
        return [...filtered, data.publicUrl];
      });
    } catch (error: any) {
      alert(error.message || "Gagal mengunggah gambar akun.");
    } finally {
      setIsUploadingAccImage(false);
    }
  };

  const handleCounter = (setter: any, current: number, step: number, min: number, max: number) => { let newVal = current + step; if (newVal < min) newVal = min; if (newVal > max) newVal = max; setter(parseFloat(newVal.toFixed(1))); };
  const toggleSkinSelection = (skinId: string) => { setSelectedSkins(prev => prev.includes(skinId) ? prev.filter(id => id !== skinId) : [...prev, skinId]); };
  const handleSelectAllSkins = (category: string) => { const categorySkins = valuationMaster.filter(v => v.group_category === category).map(v => v.id); const allSelected = categorySkins.every(id => selectedSkins.includes(id)); if (allSelected) { setSelectedSkins(prev => prev.filter(id => !categorySkins.includes(id))); } else { setSelectedSkins(prev => Array.from(new Set([...prev, ...categorySkins]))); } };
  const calculatedBasePrice = () => { let total = 0; const cRank = valuationMaster.find(v => v.id === currentRank); const hRank = valuationMaster.find(v => v.id === highestRank); if (cRank) total += Number(cRank.base_value); if (hRank) total += Number(hRank.base_value); selectedSkins.forEach(id => { const skin = valuationMaster.find(v => v.id === id); if (skin) total += Number(skin.base_value); }); total += (maxEmblem * 15000); let wrMultiplier = 0; if (winRate >= 70 && totalMatch >= 1000) wrMultiplier = 150000; else if (winRate < 50 && totalMatch >= 1000) wrMultiplier = -50000; total += wrMultiplier; return Math.max(0, total); };
  const calculatedPoints = () => selectedSkins.reduce((acc, id) => acc + Number(valuationMaster.find(v => v.id === id)?.collection_points || 0), 0);
  const finalPrice = calculatedBasePrice() + Number(adminMargin);

  // --- HANDLER MANUAL UPDATE STATUS PESANAN ---
  const handleUpdateManualStatus = async (orderId: string, newStatus: string, reason: string = "") => {
    // Kalau mau diset sukses, tetap konfirmasi pakai bawaan browser (karena simple)
    if (newStatus !== 'failed') {
      if (!window.confirm(`Yakin merubah status pesanan ini menjadi ${newStatus.toUpperCase()}?`)) return;
    }

    setIsUpdatingStatus(true);
    try {
      await axios.patch(`https://johen-gaming-backend-production.up.railway.app/orders/${orderId}/status`, { status: newStatus, reason: reason });
      fetchData(); 
      setSelectedOrder(null);
      setCancelModalOrder(null); // Pastikan modal input tertutup
      setCancelReason("");       // Reset teks alasan
    } catch (error) { 
      alert("Gagal merubah status pesanan."); 
    } finally { 
      setIsUpdatingStatus(false); 
    }
  };

  const currentRankOptions = valuationMaster.filter(v => v.group_category === 'Rank Saat Ini');
  const highestRankOptions = valuationMaster.filter(v => v.group_category === 'Rank Tertinggi');
  const skinCategories = Array.from(new Set(valuationMaster.filter(v => ['skin_tier', 'other'].includes(v.item_type)).map(v => v.group_category)));
  const selectedGameData = games.find(g => g.id === selectedGameId);
  const isMLBB = selectedGameData?.name.toLowerCase().includes('mobile legends');
  
  const [filterStatus, setFilterStatus] = useState("all");
  
  // State Filter Pesanan
  const [orderFilterStatus, setOrderFilterStatus] = useState("all");
  const [orderFilterType, setOrderFilterType] = useState("all"); 
  const [productGameFilter, setProductGameFilter] = useState("all");
const [orderGameFilter, setOrderGameFilter] = useState("all");

  // Logika Filter Pesanan
  const filteredOrders = orders.filter(o => {
    if (!o) return false; // Sabuk pengaman 1: Buang data gaib
    
    const matchStatus = orderFilterStatus === "all" || o?.payment_status === orderFilterStatus;
    const matchType = orderFilterType === "all" || o?.order_type === orderFilterType;
    
    const productDetail = products.find(p => p?.id === o?.product_ref_id);
    const matchGame = orderGameFilter === "all" || productDetail?.game_id === orderGameFilter;
    
    return matchStatus && matchType && matchGame;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[var(--color-johen-cyan)]" size={40} /></div>;

  return (
    <div className="min-h-screen flex bg-[#05050D] overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#0A0A1A] border-r border-white/5 flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-johen-violet)] to-[var(--color-johen-cyan)] flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.3)]"><ShieldAlert size={16} className="text-[#0A0A1A]" /></div>
            <span className="font-extrabold tracking-widest text-sm text-white">JOHEN ADMIN</span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">E-Commerce</p>
          <nav className="space-y-1 mb-8">
            <button onClick={() => setActiveTab("products")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === "products" ? "bg-[var(--color-johen-cyan)]/10 text-[var(--color-johen-cyan)]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}><Package size={18} /> <span className="font-semibold text-sm">Katalog Akun</span></button>
            <button onClick={() => setActiveTab("orders")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === "orders" ? "bg-[var(--color-johen-cyan)]/10 text-[var(--color-johen-cyan)]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}><ShoppingCart size={18} /> <span className="font-semibold text-sm">Pesanan Masuk</span></button>
          </nav>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Sistem</p>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab("master")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === "master" ? "bg-[var(--color-johen-violet)]/10 text-[var(--color-johen-violet)]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}><Database size={18} /> <span className="font-semibold text-sm">Master Data</span></button>
            <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === "settings" ? "bg-[var(--color-johen-violet)]/10 text-[var(--color-johen-violet)]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
  <Ticket size={18} /> <span className="font-semibold text-sm">Voucher & Promo</span>
</button>
          </nav>
        </div>
      </aside>

      {/* --- MAIN WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* --- TOPBAR / HEADER ADMIN --- */}
        <header className="h-16 bg-[#0A0A1A]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm font-medium">Dashboard</span><span className="text-gray-600">/</span>
            <span className="text-[var(--color-johen-cyan)] text-sm font-bold capitalize">{activeTab === 'products' ? 'Katalog' : activeTab === 'orders' ? 'Transaksi' : activeTab}</span>
          </div>

          <div className="flex items-center gap-6">
            {/* --- MODUL NOTIFIKASI DINAMIS --- */}
            <div className="relative">
              <button onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }} className="text-gray-400 hover:text-white transition relative p-2">
                <Bell size={20} />
                {orders.filter(o => o.payment_status === 'pending' || (o.payment_status === 'success' && o.order_type === 'account')).length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border border-[#0A0A1A] animate-pulse">
                    {orders.filter(o => o.payment_status === 'pending' || (o.payment_status === 'success' && o.order_type === 'account')).length}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-[#12122A] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#0A0A1A]">
                    <span className="text-sm text-white font-bold">Pusat Tugas Admin</span>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {/* TUGAS 1: KIRIM AKUN LUNAS */}
                    {orders.filter(o => o.payment_status === 'success' && o.order_type === 'account').map(order => (
                      <button key={order.id} onClick={() => { setShowNotifMenu(false); setActiveTab("orders"); setSelectedOrder(order); }} className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5 transition flex flex-col gap-1.5 group bg-green-500/5">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10}/> PERLU DIKIRIM</span>
                          <span className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</span>
                        </div>
                        <span className="text-sm font-bold text-white leading-tight mt-1">{order.game_credentials?.product_name || 'Akun Game'}</span>
                        <span className="text-xs text-gray-400">Ke: {order.customer_name}</span>
                      </button>
                    ))}

                    {/* TUGAS 2: PESANAN PENDING */}
                    {orders.filter(o => o.payment_status === 'pending').map(order => (
                      <button key={order.id} onClick={() => { setShowNotifMenu(false); setActiveTab("orders"); setSelectedOrder(order); }} className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5 transition flex flex-col gap-1.5 group">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> Menunggu Bayar</span>
                          <span className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</span>
                        </div>
                        <span className="text-sm font-bold text-white leading-tight">INV-#{order.id.split('-')[0].toUpperCase()}</span>
                        <span className="text-xs font-black text-[var(--color-johen-cyan)]">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                      </button>
                    ))}
                    
                    {orders.filter(o => o.payment_status === 'pending' || (o.payment_status === 'success' && o.order_type === 'account')).length === 0 && (
                      <div className="p-6 text-center text-xs text-gray-500">Semua tugas sudah diselesaikan. Santai dulu! ☕</div>
                    )}
                  </div>
                  
                  <div className="p-2 border-t border-white/5 bg-[#0A0A1A]">
                    <button onClick={() => { setShowNotifMenu(false); setActiveTab("orders"); }} className="w-full text-center text-xs text-[var(--color-johen-cyan)] hover:text-white bg-[var(--color-johen-cyan)]/10 hover:bg-[var(--color-johen-cyan)]/20 py-2.5 rounded-lg transition font-bold tracking-wider">
                      Kelola Semua Transaksi
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 hover:bg-white/5 p-1.5 rounded-lg transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-johen-violet)] to-[var(--color-johen-cyan)] flex items-center justify-center border border-white/10 overflow-hidden"><User size={16} className="text-[#0A0A1A]" /></div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold text-white leading-tight">Admin Johen</p>
                  <p className="text-[10px] text-[var(--color-johen-cyan)] font-bold tracking-wider uppercase">Super Admin</p>
                </div>
                <ChevronDownIcon size={16} className="text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#12122A] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
                  <div className="px-4 py-3 border-b border-white/5"><p className="text-sm text-white font-bold">Admin Johen</p><p className="text-xs text-gray-400 truncate">admin@johengaming.com</p></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"><LogOut size={14} /> Keluar</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT SCROLL AREA --- */}
        <main className="flex-1 p-8 overflow-y-auto relative">
          <FadeIn>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-extrabold mb-1">{activeTab === "products" ? "Katalog Akun E-Commerce" : activeTab === "orders" ? "Daftar Pesanan Masuk" : activeTab === "master" ? "Pengelolaan Master Data" : "Pengaturan Sistem"}</h1>
                <p className="text-gray-400 text-sm">Kelola inventaris dan pantau aktivitas marketplace.</p>
              </div>
              {activeTab === "products" && (<button onClick={handleOpenAddModal} className="bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] transition px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(0,200,240,0.3)]"><Plus size={18} /> Tambah Akun</button>)}
            </div>

            {/* TAB: KATALOG PRODUK */}
            {activeTab === "products" && (
              <div className="bg-[#12122A]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex gap-2">
                  <button onClick={() => setFilterStatus("all")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === "all" ? "bg-[var(--color-johen-cyan)] text-[#0A0A1A]" : "bg-white/5 text-gray-400 hover:text-white"}`}>Semua</button>
                  <button onClick={() => setFilterStatus("available")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === "available" ? "bg-green-500 text-[#0A0A1A]" : "bg-white/5 text-gray-400 hover:text-white"}`}>Tersedia</button>
                  <button onClick={() => setFilterStatus("sold")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === "sold" ? "bg-red-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>Terjual</button>
                </div>
                {/* FILTER GAME (KATALOG) */}
<div className="px-5 pb-4 border-b border-white/5 flex gap-2 overflow-x-auto custom-scrollbar">
  <button
    onClick={() => setProductGameFilter("all")}
    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
      productGameFilter === "all"
        ? "bg-[var(--color-johen-violet)] text-white"
        : "bg-white/5 text-gray-400 hover:text-white"
    }`}
  >
    Semua Game
  </button>

  {games.map(game => (
    <button
      key={game.id}
      onClick={() => setProductGameFilter(game.id)}
      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
        productGameFilter === game.id
          ? "bg-[var(--color-johen-violet)] text-white"
          : "bg-white/5 text-gray-400 hover:text-white"
      }`}
    >
      {game.name}
    </button>
  ))}
</div>
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#1E1E3F]/50 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5"><th className="p-5 font-semibold">Judul Etalase</th><th className="p-5 font-semibold">Game</th><th className="p-5 font-semibold">Harga Jual</th><th className="p-5 font-semibold text-center">Stok</th><th className="p-5 font-semibold text-center">Status</th><th className="p-5 font-semibold text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {products.filter(p => (filterStatus === "all" || p.status === filterStatus) && (productGameFilter === "all" || p.game_id === productGameFilter)).map((product) => (
                      <tr key={product.id} className="hover:bg-white/5 transition">
                        <td className="p-5"><p className="font-bold text-white">{product.title}</p></td>
                        <td className="p-5 text-gray-400">{product.games?.name}</td>
                        <td className="p-5 font-bold text-[var(--color-johen-cyan)]">Rp {Number(product.final_price).toLocaleString('id-ID')}</td>
                        <td className="p-5 text-center font-extrabold text-gray-300">
    {product.status === 'available' ? '1' : '0'}
  </td>
                        <td className="p-5 text-center"><button onClick={() => handleToggleStatus(product.id, product.status)} className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 mx-auto transition-all ${product.status === 'available' ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'}`}>{product.status === 'available' ? <CheckCircle size={14}/> : <XCircle size={14}/>} {product.status}</button></td>
                        <td className="p-5"><div className="flex items-center justify-center gap-2"><button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-[var(--color-johen-cyan)] bg-white/5 hover:bg-[var(--color-johen-cyan)]/10 rounded-lg transition" title="Edit Akun"><Edit size={16}/></button><button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition" title="Hapus Akun"><Trash2 size={16}/></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: PESANAN MASUK (ORDERS) */}
            {activeTab === "orders" && (
              <div className="bg-[#12122A]/50 border border-white/5 rounded-2xl overflow-hidden">
                
                {/* FILTER PESANAN (UI/UX MODERN) - SUDAH DIPERBAIKI */}
                <div className="p-5 border-b border-white/5 bg-[#12122A] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  
                  {/* Primary Filter: Status (Pill Tabs) */}
                  <div className="flex flex-wrap bg-[#0A0A1A] p-1 rounded-xl border border-white/10 w-full xl:w-auto">
                    <button onClick={() => setOrderFilterStatus("all")} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${orderFilterStatus === "all" ? "bg-white text-[#0A0A1A] shadow-md" : "text-gray-500 hover:text-white"}`}>Semua</button>
                    <button onClick={() => setOrderFilterStatus("pending")} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${orderFilterStatus === "pending" ? "bg-yellow-500 text-[#0A0A1A] shadow-md" : "text-gray-500 hover:text-white"}`}>Menunggu</button>
                    <button onClick={() => setOrderFilterStatus("success")} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${orderFilterStatus === "success" ? "bg-green-500 text-[#0A0A1A] shadow-md" : "text-gray-500 hover:text-white"}`}>Lunas</button>
                    <button onClick={() => setOrderFilterStatus("completed")} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${orderFilterStatus === "completed" ? "bg-[var(--color-johen-cyan)] text-[#0A0A1A] shadow-md" : "text-gray-500 hover:text-white"}`}>Selesai</button>
                    <button onClick={() => setOrderFilterStatus("failed")} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${orderFilterStatus === "failed" ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:text-white"}`}>Batal</button>
                  </div>

                  {/* Secondary Filter: Dropdowns (Akan otomatis terdorong mentok ke Kanan) */}
                  <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    <select 
                      value={orderFilterType} 
                      onChange={(e) => setOrderFilterType(e.target.value)}
                      className="bg-[#0A0A1A] border border-white/10 text-gray-300 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:border-[var(--color-johen-cyan)] cursor-pointer"
                    >
                      <option value="all">🕹️ Semua Tipe</option>
                      <option value="topup">💎 Top Up</option>
                      <option value="account">🛒 Beli Akun</option>
                    </select>

                    <select 
                      value={orderGameFilter} 
                      onChange={(e) => setOrderGameFilter(e.target.value)}
                      className="bg-[#0A0A1A] border border-white/10 text-gray-300 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:border-[var(--color-johen-cyan)] cursor-pointer max-w-[200px]"
                    >
                      <option value="all">🎮 Semua Game</option>
                      {games.map(game => (
                        <option key={game.id} value={game.id}>{game.name}</option>
                      ))}
                    </select>
                  </div>

                </div>

                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#1E1E3F]/50 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                      <th className="p-5 font-semibold">Invoice & Waktu</th>
                      <th className="p-5 font-semibold">Tipe & Item</th>
                      <th className="p-5 font-semibold">Kontak (WA)</th>
                      <th className="p-5 font-semibold">Total Tagihan</th>
                      <th className="p-5 font-semibold text-center">Status</th>
                      <th className="p-5 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">Tidak ada pesanan ditemukan.</td></tr>
                    ) : (
                      filteredOrders.map((order) => {
                        if (!order) return null; // Sabuk pengaman 2: Lewati render jika data kosong
                        
                        return (
                          <tr key={order?.id} className="hover:bg-white/5 transition">
                            <td className="p-5">
                              <p className="font-bold text-white">#{order?.id?.split('-')[0].toUpperCase()}</p>
                              <p className="text-[10px] text-gray-500 mt-1">{new Date(order?.created_at).toLocaleString('id-ID')}</p>
                            </td>
                            <td className="p-5">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${order?.order_type === 'topup' ? 'bg-[var(--color-johen-cyan)]/10 text-[var(--color-johen-cyan)]' : 'bg-[var(--color-johen-violet)]/10 text-[var(--color-johen-violet)]'}`}>{order?.order_type}</span>
                              <p className="text-gray-300 mt-1.5 line-clamp-1 text-xs font-medium">{order?.game_credentials?.product_name || order?.product_ref_id}</p>
                            </td>
                            <td className="p-5 text-gray-400 text-xs">{order?.customer_phone}</td>
                            <td className="p-5 font-black text-white">Rp {Number(order?.total_amount).toLocaleString('id-ID')}</td>
                            <td className="p-5 text-center">
                              {/* Warna Cyan untuk DONE sudah terpasang aman di sini */}
                              <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                order?.payment_status === 'completed' ? 'bg-[var(--color-johen-cyan)]/10 text-[var(--color-johen-cyan)] border border-[var(--color-johen-cyan)]/30' :
                                order?.payment_status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                order?.payment_status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}>
                                {order?.payment_status}
                              </span>
                            </td>
                            <td className="p-5 text-center">
                              <button onClick={() => setSelectedOrder(order)} className="bg-white/5 hover:bg-[var(--color-johen-cyan)] hover:text-[#0A0A1A] text-gray-400 p-2 rounded-lg transition" title="Lihat Detail & Proses">
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB: MANAJEMEN VOUCHER (MENGGANTIKAN SETTINGS) */}
            {activeTab === "settings" && (
              <div className="bg-[#12122A]/50 border border-white/5 rounded-2xl overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black text-white">Daftar Voucher Diskon</h2>
                  <button onClick={() => { setEditVoucherId(null); setVCode(""); setVDiscount(5); setVMaxUsage(50); setVExpiredAt(""); setShowVoucherModal(true); }} className="bg-[var(--color-johen-violet)] hover:bg-[#8B5CF6] text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2">
                    <Plus size={16} /> Buat Voucher
                  </button>
                </div>
                <table className="w-full text-left border-collapse min-w-[600px]">
  <thead>
    <tr className="bg-[#1E1E3F]/50 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
      <th className="p-4 font-semibold">Kode Voucher</th>
      <th className="p-4 font-semibold text-center">Diskon</th>
      <th className="p-4 font-semibold text-center">Terpakai / Kuota</th>
      <th className="p-4 font-semibold">Berakhir Pada</th>
      <th className="p-4 font-semibold text-center">Aksi</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-white/5 text-sm">
    {vouchers.map(v => (
      <tr key={v.id} className="hover:bg-white/5 transition">
        <td className="p-4 font-black text-[var(--color-johen-cyan)] tracking-widest">{v.code}</td>
        <td className="p-4 font-bold text-white text-center">{v.discount_percent}%</td>
        <td className="p-4 text-center">
          <span className={`px-2 py-1 rounded text-xs font-bold ${v.current_usage >= v.max_usage ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {v.current_usage} / {v.max_usage}
          </span>
        </td>
        <td className="p-4 text-gray-400 text-xs">{new Date(v.expired_at).toLocaleDateString('id-ID')}</td>
        <td className="p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEditVoucher(v)}
              className="p-1.5 text-gray-400 hover:text-[var(--color-johen-cyan)] bg-white/5 hover:bg-[var(--color-johen-cyan)]/10 rounded-md transition"
              title="Edit"
            >
              <Edit size={14}/>
            </button>
            <button
              onClick={() => handleDeleteVoucher(v.id)}
              className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-md transition"
              title="Hapus"
            >
              <Trash2 size={14}/>
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
              </div>
            )}

            {/* TAB: MASTER DATA (MANAJEMEN SKIN MLBB) */}
            {activeTab === "master" && (
              <div className="bg-[#12122A]/50 border border-white/5 rounded-2xl overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-white">Database Master Skin & Item</h2>
                    <p className="text-xs text-gray-400 mt-1">Total {valuationMaster.length} item tercatat di sistem.</p>
                  </div>
                  <button 
  onClick={() => {
    setEditMasterId(null); setMItemName(""); setMBaseValue(0); setMPoints(0); setMImageUrl("");
    setShowAddMasterModal(true);
  }} 
  className="bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,200,240,0.3)]"
>
  <Plus size={16} /> Tambah Item Baru
</button>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar border border-white/5 rounded-xl">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-[#1E1E3F] sticky top-0 z-10">
                      <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                        <th className="p-4 font-semibold">Nama Item / Skin</th>
                        <th className="p-4 font-semibold text-center">Kategori</th>
                        <th className="p-4 font-semibold text-right">Value (Rp)</th>
                        <th className="p-4 font-semibold text-center">Poin</th>
                        <th className="p-4 font-semibold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm bg-[#0A0A1A]">
                      {valuationMaster.filter(item => !['Rank Saat Ini', 'Rank Tertinggi'].includes(item.group_category))
                        .slice(0, 50)
                        .map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition">
                          <td className="p-4 flex items-center gap-3">
                            <img src={item.image_url} alt={item.item_name} className="w-10 h-10 rounded-md object-cover border border-white/10" />
                            <span className="font-bold text-white text-xs">{item.item_name}</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-gray-300 uppercase tracking-wider">{item.group_category}</span>
                          </td>
                          <td className="p-4 text-right font-bold text-[var(--color-johen-cyan)]">Rp {Number(item.base_value).toLocaleString('id-ID')}</td>
                          <td className="p-4 text-center font-black text-[var(--color-johen-violet)]">{item.collection_points}</td>
                          <td className="p-4 text-center">
    <div className="flex items-center justify-center gap-2">
      <button onClick={() => setViewMasterItem(item)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition" title="Lihat Detail">
        <Eye size={14}/>
      </button>
      <button onClick={() => handleEditMaster(item)} className="p-1.5 text-gray-400 hover:text-[var(--color-johen-cyan)] bg-white/5 hover:bg-[var(--color-johen-cyan)]/10 rounded-md transition" title="Edit Item">
        <Edit size={14}/>
      </button>
      <button onClick={() => handleDeleteMasterItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-md transition" title="Hapus Item">
        <Trash2 size={14}/>
      </button>
    </div>
  </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </FadeIn>

          {/* ===================================================================================== */}
          {/* MODAL 1: TAMBAH/EDIT AKUN */}
          {/* ===================================================================================== */}
          {showAddModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
              <div className="bg-[#0A0A1A] border border-[var(--color-johen-violet)]/30 rounded-2xl w-full max-w-4xl my-8 shadow-2xl relative flex flex-col max-h-[90vh]">
                <div className="flex justify-between p-6 border-b border-white/5 bg-[#12122A] sticky top-0 z-10 rounded-t-2xl">
                  <div>
                    <h3 className="font-extrabold text-xl text-white">{editModeId ? 'Edit Akun' : 'Tambah Akun Baru'}</h3>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                  {/* KATEGORI GAME */}
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Pilih Game</label>
                      {!editModeId && <button onClick={() => setShowAddGameModal(true)} className="text-xs text-[var(--color-johen-cyan)] hover:underline flex items-center gap-1"><Plus size={14}/> Tambah Kategori</button>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {games.map(game => (
                        <button key={game.id} disabled={!!editModeId} onClick={() => setSelectedGameId(game.id)} className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${selectedGameId === game.id ? 'bg-[var(--color-johen-violet)]/20 border-[var(--color-johen-violet)] text-white' : 'bg-[#12122A] border-white/5 text-gray-500'} ${editModeId ? 'cursor-not-allowed opacity-50' : 'hover:border-white/20'}`}>
                          <Gamepad2 size={32} className={selectedGameId === game.id ? 'text-[var(--color-johen-violet)]' : ''} />
                          <span className="font-bold text-sm text-center line-clamp-1">{game.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FORM MLBB KOMPLEKS */}
                  {selectedGameId && isMLBB && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <section className="bg-[#12122A] p-6 rounded-xl border border-white/5">
                        
                        <div className="mb-5">
                          <label className="block text-xs text-gray-400 mb-2">Judul Etalase</label>
                          <input type="text" value={accountTitle} onChange={e => setAccountTitle(e.target.value)} placeholder="Contoh: Akun MLBB Sultan..." className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none" required />
                        </div>
                        <div className="mb-5">
                          <label className="block text-xs text-gray-400 mb-2">Deskripsi / Catatan Tambahan (Opsional)</label>
                          <textarea 
                            value={accountDesc} 
                            onChange={e => setAccountDesc(e.target.value)} 
                            placeholder="Contoh: Akun aman 100%, login montoon sepaket email, minus..." 
                            className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none min-h-[100px] resize-y" 
                          />
                        </div>
                        <div className="mb-5">
  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Jumlah Stok (Dikunci Sistem)</label>
  <input 
    type="number" 
    value={editModeId && products.find(p => p.id === editModeId)?.status === 'sold' ? 0 : 1} 
    disabled 
    className="w-full bg-[#05050D] border border-white/5 rounded-lg p-3 text-sm text-gray-500 cursor-not-allowed outline-none font-bold" 
  />
  <p className="text-[10px] text-gray-500 mt-1.5">*Sistem mendeteksi ini sebagai akun unik, stok otomatis 1 saat tersedia dan 0 saat terjual.</p>
</div>

                        <div className="mb-5">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Galeri Foto Akun</label>
                          <div className="bg-[#12122A] border border-white/10 rounded-xl p-3 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleAccImageUpload} 
                                disabled={isUploadingAccImage}
                                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[var(--color-johen-cyan)] file:text-[#0A0A1A] hover:file:bg-[#22D3EE] transition" 
                              />
                              {isUploadingAccImage && <Loader2 size={18} className="animate-spin text-[var(--color-johen-cyan)]" />}
                            </div>
                            
                            {/* Preview Gambar (Bisa banyak) */}
                            <div className="flex flex-wrap gap-3 mt-2">
                              {accountImages.filter(url => url.trim() !== "").map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-lg border border-white/10 overflow-hidden group">
                                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                                  <button 
                                    type="button" 
                                    onClick={() => setAccountImages(accountImages.filter((_, i) => i !== idx))} 
                                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
                                  >
                                    <Trash2 size={16}/>
                                  </button>
                                </div>
                              ))}
                              {accountImages.filter(url => url.trim() !== "").length === 0 && (
                                <p className="text-[10px] text-gray-500">Belum ada gambar yang diunggah.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                          <div><label className="block text-xs text-gray-400 mb-2">Rank Saat Ini</label><select value={currentRank} onChange={e => setCurrentRank(e.target.value)} className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none"><option value="">-- Pilih --</option>{currentRankOptions.map(r => <option key={r.id} value={r.id}>{r.item_name}</option>)}</select></div>
                          <div><label className="block text-xs text-gray-400 mb-2">Rank Tertinggi</label><select value={highestRank} onChange={e => setHighestRank(e.target.value)} className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none"><option value="">-- Pilih --</option>{highestRankOptions.map(r => <option key={r.id} value={r.id}>{r.item_name}</option>)}</select></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="bg-[#0A0A1A] border border-white/5 rounded-lg p-3"><label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 text-center">WR All Season (%)</label><div className="flex items-center justify-between bg-[#12122A] rounded-md border border-white/10"><button type="button" onClick={() => handleCounter(setWinRate, winRate, -0.1, 0, 100)} className="p-2 hover:bg-white/10"><ChevronDown size={16}/></button><input type="number" value={winRate} onChange={e => setWinRate(Number(e.target.value))} className="w-16 bg-transparent text-center font-bold text-sm outline-none" /><button type="button" onClick={() => handleCounter(setWinRate, winRate, 0.1, 0, 100)} className="p-2 hover:bg-white/10"><ChevronUp size={16}/></button></div></div>
                          <div className="bg-[#0A0A1A] border border-white/5 rounded-lg p-3"><label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 text-center">Total Match</label><div className="flex items-center justify-between bg-[#12122A] rounded-md border border-white/10"><button type="button" onClick={() => handleCounter(setTotalMatch, totalMatch, -10, 0, 100000)} className="p-2 hover:bg-white/10"><ChevronDown size={16}/></button><input type="number" value={totalMatch} onChange={e => setTotalMatch(Number(e.target.value))} className="w-16 bg-transparent text-center font-bold text-sm outline-none" /><button type="button" onClick={() => handleCounter(setTotalMatch, totalMatch, 10, 0, 100000)} className="p-2 hover:bg-white/10"><ChevronUp size={16}/></button></div></div>
                          <div className="bg-[#0A0A1A] border border-white/5 rounded-lg p-3"><label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 text-center">Emblem Max</label><div className="flex items-center justify-between bg-[#12122A] rounded-md border border-white/10"><button type="button" onClick={() => handleCounter(setMaxEmblem, maxEmblem, -1, 0, 7)} className="p-2 hover:bg-white/10"><ChevronDown size={16}/></button><input type="number" value={maxEmblem} onChange={e => setMaxEmblem(Number(e.target.value))} className="w-12 bg-transparent text-center font-bold text-[var(--color-johen-cyan)] text-sm outline-none" /><button type="button" onClick={() => handleCounter(setMaxEmblem, maxEmblem, 1, 0, 7)} className="p-2 hover:bg-white/10"><ChevronUp size={16}/></button></div></div>
                        </div>
                      </section>

                      <section className="bg-[#12122A] p-6 rounded-xl border border-[var(--color-johen-cyan)]/30">
                        <div className="flex justify-between mb-4"><h4 className="text-sm font-bold text-[var(--color-johen-cyan)] uppercase tracking-wider">Koleksi Skin Visual</h4></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {skinCategories.map((category) => (
                            <button key={category} type="button" onClick={() => setActiveSkinCategory(category)} className="bg-[#0A0A1A] hover:bg-white/5 border border-white/10 hover:border-[var(--color-johen-cyan)]/50 rounded-xl p-4 text-left transition h-24 flex flex-col justify-between">
                              <span className="text-xs font-bold text-gray-300">{category}</span>
                              <span className="text-xs font-black text-[var(--color-johen-cyan)]">{valuationMaster.filter(v => v.group_category === category && selectedSkins.includes(v.id)).length} Dipilih</span>
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="bg-[#12122A] p-6 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Estimasi Sistem</p>
                          <p className="text-2xl font-bold text-white mb-2">Rp {calculatedBasePrice().toLocaleString('id-ID')}</p>
                          <input type="number" value={adminMargin || ''} onChange={e => setAdminMargin(parseInt(e.target.value) || 0)} placeholder="Margin Admin (Rp)" className="bg-[#0A0A1A] border border-[var(--color-johen-violet)]/50 rounded-lg p-2 text-sm text-green-400 font-bold outline-none" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[var(--color-johen-cyan)] font-bold">Harga Jual</p>
                          <p className="text-4xl font-extrabold text-[var(--color-johen-cyan)]">Rp {finalPrice.toLocaleString('id-ID')}</p>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* 3. FORM BASIC KHUSUS NON-MLBB */}
                  {selectedGameId && !isMLBB && (
                    <div className="space-y-5 animate-in fade-in duration-500 bg-[#12122A] p-6 rounded-xl border border-white/5">
                       <div><label className="block text-xs text-gray-400 mb-2">Judul Akun</label><input type="text" value={accountTitle} onChange={e => setAccountTitle(e.target.value)} className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none" required /></div>
                       <div><label className="block text-xs text-gray-400 mb-2">Deskripsi / Spesifikasi Singkat</label><textarea value={basicDesc} onChange={e => setBasicDesc(e.target.value)} className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none h-24" /></div>
                       <div>
     <label className="block text-xs text-gray-400 mb-2">Jumlah Stok</label>
     <input 
       type="number" 
       value={editModeId && products.find(p => p.id === editModeId)?.status === 'sold' ? 0 : 1} 
       disabled 
       className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm text-gray-500 cursor-not-allowed outline-none font-bold" 
     />
   </div>
                       <div><label className="block text-xs text-gray-400 mb-2">Harga Jual (Rp)</label><input type="number" value={basicPrice || ''} onChange={e => setBasicPrice(Number(e.target.value))} className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none font-bold text-[var(--color-johen-cyan)]" required /></div>
                    </div>
                  )}
                </div>

                {selectedGameId && (
                  <div className="p-6 border-t border-white/5 bg-[#12122A] rounded-b-2xl flex justify-end">
                    <button 
                      onClick={handleSaveAccount} 
                      disabled={isSaving || accountTitle.length < 5 || (isMLBB ? calculatedBasePrice() === 0 : basicPrice === 0)} 
                      className="bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] px-8 py-3 rounded-xl font-extrabold text-sm flex gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {editModeId ? 'SIMPAN PERUBAHAN' : 'SIMPAN PRODUK'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- MODAL 2: DETAIL PESANAN & AKSI MANUAL --- */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#0A0A1A] border border-[var(--color-johen-cyan)]/30 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header Modal */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#12122A]">
                  <div>
                    <h3 className="font-black text-xl text-white">Detail Pesanan</h3>
                    <p className="text-xs text-gray-400 mt-1">Invoice #{selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition"><X size={20} /></button>
                </div>

                {/* Konten Modal (Scrollable) */}
                <div className="p-6 overflow-y-auto space-y-6">
                  
                  {/* Status & Total Tagihan */}
                  <div className="flex items-center justify-between bg-[#12122A] p-5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status Saat Ini</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
  selectedOrder.payment_status === 'completed' ? 'bg-[var(--color-johen-cyan)]/10 text-[var(--color-johen-cyan)] border border-[var(--color-johen-cyan)]/30' :
  selectedOrder.payment_status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
  selectedOrder.payment_status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
  'bg-red-500/10 text-red-400 border border-red-500/20'
}`}>
  {selectedOrder.payment_status === 'completed' ? 'DONE' : selectedOrder.payment_status}
</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Dibayar</p>
                      <p className="text-2xl font-black text-[var(--color-johen-cyan)]">Rp {Number(selectedOrder.total_amount).toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Informasi Pelanggan */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Data Pelanggan</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#05050D] p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Kontak WhatsApp</p>
                        <p className="text-sm font-bold text-white">{selectedOrder.customer_phone}</p>
                      </div>
                      <div className="bg-[#05050D] p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] text-gray-500 uppercase mb-1">Nama / Nickname</p>
                        <p className="text-sm font-bold text-white">{selectedOrder.customer_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Informasi Spesifik Produk (Beda Top-up vs Akun) */}
                  <div>
                    <h4 className="text-xs font-bold text-[var(--color-johen-cyan)] uppercase tracking-widest mb-3 border-b border-[var(--color-johen-cyan)]/20 pb-2 flex items-center gap-2">
                      <Gamepad2 size={14} /> Detail Eksekusi {selectedOrder.order_type.toUpperCase()}
                    </h4>
                    <div className="bg-[#05050D] p-4 rounded-xl border border-white/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-500">Nama Produk</span>
                        <span className="text-sm font-bold text-white text-right max-w-[60%]">{selectedOrder.game_credentials?.product_name || selectedOrder.product_ref_id}</span>
                      </div>
                      
                      {/* Logika Tampilan Top-Up */}
                      {selectedOrder.order_type === 'topup' && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Kuantitas</span>
                            <span className="text-sm font-bold text-[var(--color-johen-cyan)]">{selectedOrder.game_credentials?.quantity || 1}x</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg mt-2 border border-white/10">
                            <span className="text-xs font-bold text-gray-400">Target ID & Server</span>
                            <span className="text-lg font-black text-white tracking-wider text-right">
                              {selectedOrder.game_credentials?.id} {selectedOrder.game_credentials?.server ? `(${selectedOrder.game_credentials.server})` : ''}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Logika Tampilan Beli Akun */}
                      {selectedOrder.order_type === 'account' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mt-2">
                          <p className="text-xs text-yellow-400 font-bold mb-1 flex items-center gap-1"><ShieldCheck size={14} /> Instruksi Admin:</p>
                          <p className="text-[11px] text-gray-300">Hubungi pembeli melalui WhatsApp di atas untuk menyerahkan email dan password akun game jika status pembayaran sudah "SUCCESS".</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Modal: Aksi / Status Akhir */}
                {selectedOrder?.payment_status === 'completed' ? (
                  <div className="p-6 border-t border-white/5 bg-[#12122A] text-center">
                    <p className="text-sm font-black text-[var(--color-johen-cyan)] uppercase tracking-widest flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Transaksi Selesai
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Data telah dikirim dan tidak ada aksi lanjutan yang diperlukan.</p>
                  </div>
                ) : (
                  <div className="p-6 border-t border-white/5 bg-[#12122A] flex flex-col gap-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mb-1">Aksi Darurat (Manual Override)</p>
                    <div className="flex gap-3">
                     {selectedOrder.payment_status !== 'success' && (
                        <button 
                          disabled={isUpdatingStatus}
                          onClick={() => setSuccessModalOrder(selectedOrder)}
                          className="flex-1 bg-green-500/10 hover:bg-green-500 hover:text-black text-green-400 border border-green-500/30 font-bold py-3 rounded-xl transition text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                          Set Lunas
                        </button>
                      )}
                      
                      {/* Tombol Kirim Data (Hanya Muncul Jika Success & Akun) */}
                      {selectedOrder.payment_status === 'success' && selectedOrder.order_type === 'account' && (
                        <button 
                          disabled={isUpdatingStatus}
                          onClick={() => setDeliveryModalOrder(selectedOrder)}
                          className="flex-1 bg-[var(--color-johen-cyan)]/10 hover:bg-[var(--color-johen-cyan)] hover:text-[#0A0A1A] text-[var(--color-johen-cyan)] border border-[var(--color-johen-cyan)]/30 font-bold py-3 rounded-xl transition text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          Kirim Data
                        </button>
                      )}

                      {/* Tombol Batal (Hanya Muncul Jika Belum Batal/Expired) */}
                      {selectedOrder.payment_status !== 'failed' && selectedOrder.payment_status !== 'expired' && (
                        <button 
                          disabled={isUpdatingStatus}
                          onClick={() => setCancelModalOrder(selectedOrder)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/30 font-bold py-3 rounded-xl transition text-xs uppercase tracking-widest disabled:opacity-50"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* CUSTOM MODAL: INPUT ALASAN PEMBATALAN */}
          {cancelModalOrder && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-200">
              <div className="bg-[#12122A] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                <div className="flex items-center gap-3 mb-4 text-red-400">
                  <AlertTriangle size={24} />
                  <h3 className="font-black text-lg text-white">Konfirmasi Pembatalan</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">Silakan masukkan alasan spesifik mengapa pesanan ini dibatalkan. Alasan ini akan ditampilkan di halaman invoice pelanggan.</p>
                <textarea 
                  className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl p-4 text-sm text-white mb-6 outline-none focus:border-red-500 transition resize-none h-28"
                  placeholder="Contoh: Maaf, stok diamond sedang gangguan dari pusat..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <div className="flex gap-3">
                  <button onClick={() => { setCancelModalOrder(null); setCancelReason(""); }} className="flex-1 py-3 text-sm text-gray-400 hover:bg-white/5 rounded-xl transition font-bold">Tutup</button>
                  <button 
                    disabled={cancelReason.trim() === "" || isUpdatingStatus}
                    onClick={() => handleUpdateManualStatus(cancelModalOrder.id, 'failed', cancelReason)}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Batalkan Pesanan
                  </button>
                </div>
              </div>
            </div>
          )}
{/* --- MODAL 3: TAMBAH GAME KECIL --- */}
          {showAddGameModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <div className="bg-[#12122A] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                  <h3 className="font-bold text-lg mb-4 text-white">Tambah Kategori Game</h3>
                  <input type="text" value={newGameName} onChange={e => setNewGameName(e.target.value)} placeholder="Contoh: Valorant, PUBG..." className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm mb-4 outline-none focus:border-[var(--color-johen-cyan)] text-white" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowAddGameModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Batal</button>
                    <button onClick={handleAddNewGame} disabled={!newGameName} className="px-4 py-2 bg-[var(--color-johen-violet)] hover:bg-[#8B5CF6] text-white text-sm font-bold rounded-lg transition disabled:opacity-50">Simpan Game</button>
                  </div>
               </div>
            </div>
          )}

          {/* --- MODAL 4: VISUAL SKIN GALLERY --- */}
          {activeSkinCategory && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <div className="bg-[#05050D] border border-[var(--color-johen-cyan)]/30 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                  <div>
                    <h3 className="text-2xl font-black text-white">{activeSkinCategory}</h3>
                    <button onClick={() => handleSelectAllSkins(activeSkinCategory)} className="mt-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition">
                      <CheckSquare size={14} /> Pilih Semua di Kategori Ini
                    </button>
                  </div>
                  <button onClick={() => setActiveSkinCategory(null)} className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-xl transition"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    {valuationMaster.filter(v => v.group_category === activeSkinCategory).map(skin => {
                      const isSelected = selectedSkins.includes(skin.id);
                      return (
                        <div key={skin.id} onClick={() => toggleSkinSelection(skin.id)} className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 group ${isSelected ? 'border-[var(--color-johen-cyan)] scale-105 shadow-[0_0_15px_rgba(0,200,240,0.3)]' : 'border-transparent bg-[#12122A] hover:border-white/10'}`}>
                          <div className="aspect-square bg-[#1E1E3F] w-full relative">
                            <img src={skin.image_url} alt={skin.item_name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                            {isSelected && <div className="absolute top-2 right-2 bg-[var(--color-johen-cyan)] rounded-full p-0.5"><CheckCircle2 size={20} className="text-[#0A0A1A]" /></div>}
                          </div>
                          <div className="p-3 text-center bg-[#0A0A1A]"><p className="font-bold text-xs line-clamp-2 text-gray-200">{skin.item_name}</p></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between items-center bg-[#0A0A1A] rounded-b-2xl">
                  <button onClick={() => setActiveSkinCategory(null)} className="bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] px-8 py-3 rounded-xl font-bold text-sm ml-auto transition">Selesai Memilih</button>
                </div>
              </div>
            </div>
          )}
          {/* CUSTOM MODAL: KONFIRMASI SET LUNAS */}
          {successModalOrder && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-200">
              <div className="bg-[#12122A] border border-green-500/30 rounded-2xl w-full max-w-md p-6 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                <div className="flex items-center gap-3 mb-4 text-green-400">
                  <CheckCircle2 size={24} />
                  <h3 className="font-black text-lg text-white">Konfirmasi Lunas</h3>
                </div>
                <p className="text-xs text-gray-400 mb-6">Yakin ingin mengubah status pesanan <span className="font-bold text-white">#{successModalOrder.id.split('-')[0].toUpperCase()}</span> menjadi Lunas (Success)? Pastikan kamu sudah menerima pembayaran yang sah.</p>
                <div className="flex gap-3">
                  <button onClick={() => setSuccessModalOrder(null)} className="flex-1 py-3 text-sm text-gray-400 hover:bg-white/5 rounded-xl transition font-bold">Tutup</button>
                  <button 
                    disabled={isUpdatingStatus}
                    onClick={() => {
  handleUpdateManualStatus(successModalOrder.id, 'success');
  setSuccessModalOrder(null);
}}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUpdatingStatus ? <Loader2 size={16} className="animate-spin" /> : 'Ya, Set Lunas'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ===================================================================================== */}
          {/* CUSTOM MODAL: TAMBAH VOUCHER BARU */}
          {/* ===================================================================================== */}
          {showVoucherModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#0A0A1A] border border-[var(--color-johen-violet)]/30 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#12122A]">
                  <h3 className="font-black text-lg text-white">Terbitkan Voucher Baru</h3>
                  <button onClick={() => setShowVoucherModal(false)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition"><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveVoucher} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Kode Voucher</label>
                    <input 
                      type="text" required value={vCode} onChange={e => setVCode(e.target.value)} 
                      placeholder="Contoh: JOHENCUAN" 
                      className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none uppercase" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Diskon (%)</label>
                      <input 
                        type="number" required min={1} max={100} value={vDiscount} onChange={e => setVDiscount(Number(e.target.value))} 
                        placeholder="10" 
                        className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Kuota Kupon</label>
                      <input 
                        type="number" required min={1} value={vMaxUsage} onChange={e => setVMaxUsage(Number(e.target.value))} 
                        placeholder="50" 
                        className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tanggal Kadaluarsa</label>
                    <input 
                      type="date" required value={vExpiredAt} onChange={e => setVExpiredAt(e.target.value)} 
                      className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none text-gray-300" 
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowVoucherModal(false)} className="flex-1 py-3 text-sm text-gray-400 hover:bg-white/5 rounded-xl transition font-bold">Batal</button>
                    <button 
                      type="submit" disabled={isSavingVoucher}
                      className="flex-1 py-3 bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                    >
                      {isSavingVoucher ? <Loader2 className="animate-spin" size={16} /> : "Simpan Voucher"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* ===================================================================================== */}
          {/* CUSTOM MODAL: TAMBAH MASTER DATA (SKIN MLBB) */}
          {/* ===================================================================================== */}
          {showAddMasterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#0A0A1A] border border-[var(--color-johen-cyan)]/30 rounded-2xl w-full max-w-md shadow-2xl relative flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#12122A]">
                  <h3 className="font-black text-lg text-white">Tambah Master Item</h3>
                  <button onClick={() => setShowAddMasterModal(false)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition"><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveMasterItem} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Skin / Item</label>
                    <input 
                      type="text" required value={mItemName} onChange={e => setMItemName(e.target.value)} 
                      placeholder="Contoh: Gusion KOF..." 
                      className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Grup Kategori</label>
                    <select 
                      value={mCategory} onChange={e => setMCategory(e.target.value)}
                      className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none"
                    >
                      <option value="Legend Limit">Legend Limit</option>
                      <option value="Legend Shop">Legend Shop</option>
                      <option value="Grand">Grand</option>
                      <option value="Exquisite">Exquisite</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Efek Recall Limited">Efek Recall Limited</option>
                      <option value="Avatar Border Limited">Avatar Border Limited</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nilai Harga (Rp)</label>
                      <input 
                        type="number" required min={0} value={mBaseValue} onChange={e => setMBaseValue(Number(e.target.value))} 
                        placeholder="Contoh: 150000" 
                        className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Poin Koleksi</label>
                      <input 
                        type="number" required min={0} value={mPoints} onChange={e => setMPoints(Number(e.target.value))} 
                        placeholder="Contoh: 200" 
                        className="w-full bg-[#12122A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none" 
                      />
                    </div>
                  </div>

                  {/* UPLOAD GAMBAR SUPER CANGGIH */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gambar Skin</label>
                    <div className="bg-[#12122A] border border-white/10 rounded-xl p-3 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          disabled={isUploadingImage}
                          className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[var(--color-johen-cyan)] file:text-[#0A0A1A] hover:file:bg-[#22D3EE] transition" 
                        />
                        {isUploadingImage && <Loader2 size={18} className="animate-spin text-[var(--color-johen-cyan)]" />}
                      </div>
                      
                      {/* Tampilkan Preview Jika URL sudah ada */}
                      {mImageUrl && (
                        <div className="mt-2 flex items-center gap-3 bg-[#0A0A1A] p-2 rounded-lg border border-white/5">
                          <img src={mImageUrl} alt="Preview" className="w-12 h-12 rounded object-cover border border-white/10" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Berhasil Diunggah</p>
                            <p className="text-[10px] text-gray-500 truncate">{mImageUrl}</p>
                          </div>
                          <button type="button" onClick={() => setMImageUrl("")} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowAddMasterModal(false)} className="flex-1 py-3 text-sm text-gray-400 hover:bg-white/5 rounded-xl transition font-bold">Batal</button>
                    <button 
                      type="submit" disabled={isSavingMaster}
                      className="flex-1 py-3 bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
                    >
                      {isSavingMaster ? <Loader2 className="animate-spin" size={16} /> : "Simpan Item"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* ===================================================================================== */}
          {/* CUSTOM MODAL: LIHAT DETAIL MASTER ITEM (VIEW) */}
          {/* ===================================================================================== */}
          {viewMasterItem && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-200">
              <div className="bg-[#12122A] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                
                {/* Area Gambar */}
                <div className="relative aspect-square w-full bg-[#05050D]">
                  <img src={viewMasterItem.image_url} alt={viewMasterItem.item_name} className="w-full h-full object-cover" />
                  <button onClick={() => setViewMasterItem(null)} className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500 hover:text-white rounded-full text-gray-300 transition backdrop-blur-md">
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-[var(--color-johen-violet)] text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg">
                      {viewMasterItem.group_category}
                    </span>
                  </div>
                </div>

                {/* Area Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-black text-xl text-white leading-tight">{viewMasterItem.item_name}</h3>
                    <p className="text-xs text-gray-400 mt-1">ID: {viewMasterItem.id.substring(0,8)}...</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <div className="bg-[#0A0A1A] p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Nilai Harga</p>
                      <p className="font-bold text-[var(--color-johen-cyan)] text-sm">Rp {Number(viewMasterItem.base_value).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="bg-[#0A0A1A] p-3 rounded-xl border border-white/5">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Poin Koleksi</p>
                      <p className="font-bold text-[var(--color-johen-magenta)] text-sm">{viewMasterItem.collection_points} Pts</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
          {/* CUSTOM MODAL: KIRIM DATA AKUN KE PEMBELI */}
          {deliveryModalOrder && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in-95 duration-200">
              <div className="bg-[#12122A] border border-[var(--color-johen-cyan)]/30 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-[#0A0A1A] flex justify-between items-center">
                  <h3 className="font-black text-lg text-white">Kirim Data Akun</h3>
                  <button onClick={() => setDeliveryModalOrder(null)} className="text-gray-400 hover:text-white"><X size={18}/></button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="bg-[var(--color-johen-cyan)]/10 border border-[var(--color-johen-cyan)]/20 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Penerima (Sesuai Profil Login)</p>
                    {/* Catatan: Di backend nanti akan mengambil email berdasarkan user_id. Untuk UI admin, kita tampilkan namanya saja */}
                    <p className="text-sm font-bold text-[var(--color-johen-cyan)]">{deliveryModalOrder.customer_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email / Username Game</label>
                    <input 
                      type="text" value={deliveryEmail} onChange={e => setDeliveryEmail(e.target.value)}
                      placeholder="contoh: player123@gmail.com"
                      className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password Game</label>
                    <input 
                      type="text" value={deliveryPassword} onChange={e => setDeliveryPassword(e.target.value)}
                      placeholder="Masukkan password akun game"
                      className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none" 
                    />
                  </div>

                  <button 
                    disabled={isUpdatingStatus || !deliveryEmail || !deliveryPassword}
                    onClick={async () => {
                      setIsUpdatingStatus(true);
                      
                      // 1. Tembak API Email (Jika error, kita lanjut saja ubah status)
                      try {
                        await axios.post(`https://johen-gaming-backend-production.up.railway.app/orders/${deliveryModalOrder.id}/deliver`, {
                          game_email: deliveryEmail,
                          game_password: deliveryPassword
                        });
                      } catch (apiErr) {
                        console.warn("API Email gagal:", apiErr);
                      }

                      // 2. GANTI BYPASS DENGAN API RESMI BACKEND (Dijamin Permanen)
                      try {
                        await axios.patch(`https://johen-gaming-backend-production.up.railway.app/orders/${deliveryModalOrder.id}/status`, { 
                          status: 'completed',
                          reason: 'Data akun telah dikirim ke email pembeli.' 
                        });

                        // 3. Paksa ubah memori UI
                        setOrders(prevOrders => 
                          prevOrders.map(o => 
                            o.id === deliveryModalOrder.id ? { ...o, payment_status: 'completed' } : o
                          )
                        );

                        alert("Data diproses! Status pesanan resmi menjadi DONE.");
                        setDeliveryModalOrder(null); 
                        setDeliveryEmail(""); 
                        setDeliveryPassword(""); 
                        setSelectedOrder(null);
                        
                      } catch (err) { 
                        alert("Gagal merubah status di database."); 
                        console.error(err);
                      } finally { 
                        setIsUpdatingStatus(false); 
                      }
                    }}
                    className="w-full py-4 bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] rounded-xl font-extrabold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {isUpdatingStatus ? <Loader2 size={16} className="animate-spin" /> : 'Kirim Email Sekarang'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}