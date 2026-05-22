"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import FadeIn from "@/components/FadeIn";
import { 
  Package, ShoppingCart, LogOut, ShieldAlert, Loader2, 
  X, Save, Plus, ChevronUp, ChevronDown, CheckCircle2, 
  Gamepad2, CheckSquare, Database, Settings, Bell, ChevronDown as ChevronDownIcon, User, Edit, Trash2, CheckCircle, XCircle
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<any[]>([]);
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

  // Meta MLBB
  const [accountTitle, setAccountTitle] = useState("");
  const [accountImages, setAccountImages] = useState<string[]>([""]); // State Gambar
  const [currentRank, setCurrentRank] = useState("");
  const [highestRank, setHighestRank] = useState("");
  const [winRate, setWinRate] = useState<number>(50.0);
  const [totalMatch, setTotalMatch] = useState<number>(100);
  const [maxEmblem, setMaxEmblem] = useState<number>(0);
  const [adminMargin, setAdminMargin] = useState<number>(0);
  const [selectedSkins, setSelectedSkins] = useState<string[]>([]);
  const [activeSkinCategory, setActiveSkinCategory] = useState<string | null>(null);

  // Form Basic & Tambah Game
  const [basicPrice, setBasicPrice] = useState<number>(0);
  const [basicDesc, setBasicDesc] = useState("");
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [newGameName, setNewGameName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("sb-token");
    if (!token) router.push("/login");
    else {
      fetchData();
      fetchMasterData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const resProducts = await axios.get("http://localhost:3000/accounts/admin-list");
      setProducts(resProducts.data.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchMasterData = async () => {
    try {
      const [resVal, resGames] = await Promise.all([
        axios.get("http://localhost:3000/accounts/valuation-master"),
        axios.get("http://localhost:3000/accounts/games")
      ]);
      setValuationMaster(resVal.data.data || []);
      setGames(resGames.data.data || []);
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => {
    localStorage.removeItem("sb-token");
    router.push("/login");
  };

  // --- CRUD HANDLERS ---
  const handleOpenAddModal = () => {
    setEditModeId(null);
    setAccountTitle(""); setAccountImages([""]); setSelectedGameId(""); setCurrentRank(""); setHighestRank("");
    setWinRate(50.0); setTotalMatch(100); setMaxEmblem(0); setSelectedSkins([]); setAdminMargin(0); setBasicPrice(0); setBasicDesc("");
    setShowAddModal(true);
  };

  const handleEdit = (product: any) => {
    setEditModeId(product.id);
    setSelectedGameId(product.game_id);
    setAccountTitle(product.title);
    setAdminMargin(Number(product.admin_margin));

    const isMLBB = games.find(g => g.id === product.game_id)?.name.toLowerCase().includes('mobile legends');
    if (isMLBB && product.account_details) {
      setAccountImages(product.account_details.images || [""]);
      setCurrentRank(product.account_details.current_rank || "");
      setHighestRank(product.account_details.highest_rank || "");
      setWinRate(product.account_details.win_rate || 50.0);
      setTotalMatch(product.account_details.total_match || 100);
      setMaxEmblem(product.account_details.max_emblem || 0);
      setSelectedSkins(product.account_details.skins?.map((s: any) => s.id) || []);
    } else {
      setBasicPrice(Number(product.calculated_price));
      setBasicDesc(product.account_details?.description || "");
    }
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus akun ini secara permanen?")) {
      try {
        await axios.delete(`http://localhost:3000/accounts/${id}`);
        fetchData();
      } catch (error) { alert("Gagal menghapus data."); }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    try {
      await axios.patch(`http://localhost:3000/accounts/${id}/status`, { status: newStatus });
      fetchData();
    } catch (error) { alert("Gagal merubah status."); }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const isMLBB = games.find(g => g.id === selectedGameId)?.name.toLowerCase().includes('mobile legends');
    
    try {
      let payload: any;
      if (isMLBB) {
        const skinDetails = selectedSkins.map(id => {
          const s = valuationMaster.find(v => v.id === id);
          return { id: s.id, name: s.item_name, category: s.group_category, image: s.image_url };
        });
        payload = {
          game_id: selectedGameId, title: accountTitle, calculated_price: calculatedBasePrice(), admin_margin: Number(adminMargin), final_price: finalPrice, status: 'available',
          account_details: { 
            images: accountImages.filter(url => url.trim() !== ""), 
            current_rank: currentRank, highest_rank: highestRank, win_rate: winRate, total_match: totalMatch, max_emblem: maxEmblem, skins: skinDetails, total_collection_points: calculatedPoints() 
          }
        };
      } else {
        payload = {
          game_id: selectedGameId, title: accountTitle, calculated_price: basicPrice, admin_margin: 0, final_price: basicPrice, status: 'available',
          account_details: { description: basicDesc }
        };
      }

      if (editModeId) {
        const { status, ...updatePayload } = payload; 
        await axios.put(`http://localhost:3000/accounts/${editModeId}`, updatePayload);
      } else {
        await axios.post("http://localhost:3000/accounts", payload);
      }
      
      setShowAddModal(false);
      fetchData(); 
    } catch (error) { alert("Gagal menyimpan akun."); } finally { setIsSaving(false); }
  };

  const handleAddNewGame = async () => {
    if(!newGameName) return;
    try {
      await axios.post("http://localhost:3000/accounts/games", { name: newGameName, publisher: 'General', input_type: 'id_only' });
      setShowAddGameModal(false); setNewGameName(""); fetchMasterData();
    } catch(err) { alert("Gagal menambah game."); }
  };

  // --- Logika Helper & Pricing ---
  const handleCounter = (setter: any, current: number, step: number, min: number, max: number) => {
    let newVal = current + step;
    if (newVal < min) newVal = min;
    if (newVal > max) newVal = max;
    setter(parseFloat(newVal.toFixed(1)));
  };

  const toggleSkinSelection = (skinId: string) => {
    setSelectedSkins(prev => prev.includes(skinId) ? prev.filter(id => id !== skinId) : [...prev, skinId]);
  };

  const handleSelectAllSkins = (category: string) => {
    const categorySkins = valuationMaster.filter(v => v.group_category === category).map(v => v.id);
    const allSelected = categorySkins.every(id => selectedSkins.includes(id));
    if (allSelected) {
      setSelectedSkins(prev => prev.filter(id => !categorySkins.includes(id)));
    } else {
      setSelectedSkins(prev => Array.from(new Set([...prev, ...categorySkins])));
    }
  };

  const calculatedBasePrice = () => {
    let total = 0;
    const cRank = valuationMaster.find(v => v.id === currentRank);
    const hRank = valuationMaster.find(v => v.id === highestRank);
    if (cRank) total += Number(cRank.base_value);
    if (hRank) total += Number(hRank.base_value);
    selectedSkins.forEach(id => {
      const skin = valuationMaster.find(v => v.id === id);
      if (skin) total += Number(skin.base_value);
    });
    total += (maxEmblem * 15000);

    let wrMultiplier = 0;
    if (winRate >= 70 && totalMatch >= 1000) wrMultiplier = 150000; 
    else if (winRate < 50 && totalMatch >= 1000) wrMultiplier = -50000; 
    
    total += wrMultiplier;
    return Math.max(0, total);
  };

  const calculatedPoints = () => selectedSkins.reduce((acc, id) => acc + Number(valuationMaster.find(v => v.id === id)?.collection_points || 0), 0);
  const finalPrice = calculatedBasePrice() + Number(adminMargin);

  // UI Helpers
  const currentRankOptions = valuationMaster.filter(v => v.group_category === 'Rank Saat Ini');
  const highestRankOptions = valuationMaster.filter(v => v.group_category === 'Rank Tertinggi');
  const skinCategories = Array.from(new Set(valuationMaster.filter(v => ['skin_tier', 'other'].includes(v.item_type)).map(v => v.group_category)));
  const selectedGameData = games.find(g => g.id === selectedGameId);
  const isMLBB = selectedGameData?.name.toLowerCase().includes('mobile legends');
  const [filterStatus, setFilterStatus] = useState("all");

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
            <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${activeTab === "settings" ? "bg-[var(--color-johen-violet)]/10 text-[var(--color-johen-violet)]" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}><Settings size={18} /> <span className="font-semibold text-sm">Pengaturan</span></button>
          </nav>
        </div>
      </aside>

      {/* --- MAIN WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* --- TOPBAR / HEADER ADMIN --- */}
        <header className="h-16 bg-[#0A0A1A]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm font-medium">Dashboard</span><span className="text-gray-600">/</span>
            <span className="text-[var(--color-johen-cyan)] text-sm font-bold capitalize">{activeTab === 'products' ? 'Katalog' : activeTab === 'orders' ? 'Transaksi' : activeTab}</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0A1A] animate-pulse"></span>
            </button>
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
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm text-white font-bold">Admin Johen</p>
                    <p className="text-xs text-gray-400 truncate">admin@johengaming.com</p>
                  </div>
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
                <h1 className="text-2xl font-extrabold mb-1">
                  {activeTab === "products" ? "Katalog Akun E-Commerce" : activeTab === "orders" ? "Daftar Pesanan Masuk" : activeTab === "master" ? "Pengelolaan Master Data" : "Pengaturan Sistem"}
                </h1>
                <p className="text-gray-400 text-sm">Kelola inventaris dan pantau aktivitas marketplace.</p>
              </div>
              {activeTab === "products" && (
                <button onClick={handleOpenAddModal} className="bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] transition px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(0,200,240,0.3)]">
                  <Plus size={18} /> Tambah Akun
                </button>
              )}
            </div>

            {activeTab === "products" && (
              <div className="bg-[#12122A]/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex gap-2">
                  <button onClick={() => setFilterStatus("all")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === "all" ? "bg-[var(--color-johen-cyan)] text-[#0A0A1A]" : "bg-white/5 text-gray-400 hover:text-white"}`}>Semua</button>
                  <button onClick={() => setFilterStatus("available")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === "available" ? "bg-green-500 text-[#0A0A1A]" : "bg-white/5 text-gray-400 hover:text-white"}`}>Tersedia</button>
                  <button onClick={() => setFilterStatus("sold")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === "sold" ? "bg-red-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>Terjual</button>
                </div>

                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#1E1E3F]/50 text-xs uppercase tracking-wider text-gray-400 border-b border-white/5">
                      <th className="p-5 font-semibold">Judul Etalase</th>
                      <th className="p-5 font-semibold">Game</th>
                      <th className="p-5 font-semibold">Harga Jual</th>
                      <th className="p-5 font-semibold text-center">Status</th>
                      <th className="p-5 font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {products.filter(p => filterStatus === "all" || p.status === filterStatus).map((product) => (
                      <tr key={product.id} className="hover:bg-white/5 transition">
                        <td className="p-5"><p className="font-bold text-white">{product.title}</p></td>
                        <td className="p-5 text-gray-400">{product.games?.name}</td>
                        <td className="p-5 font-bold text-[var(--color-johen-cyan)]">Rp {Number(product.final_price).toLocaleString('id-ID')}</td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => handleToggleStatus(product.id, product.status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 mx-auto transition-all ${
                              product.status === 'available' ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            }`}
                          >
                            {product.status === 'available' ? <CheckCircle size={14}/> : <XCircle size={14}/>} {product.status}
                          </button>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-[var(--color-johen-cyan)] bg-white/5 hover:bg-[var(--color-johen-cyan)]/10 rounded-lg transition" title="Edit Akun"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition" title="Hapus Akun"><Trash2 size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab !== "products" && (
               <div className="bg-[#12122A]/50 border border-white/5 rounded-2xl p-10 text-center text-gray-500 border-dashed">
                 <Database size={40} className="mx-auto mb-4 opacity-50" />
                 <p>Modul {activeTab} sedang dalam tahap pengembangan.</p>
               </div>
            )}
          </FadeIn>

          {/* ===================================================================================== */}
          {/* MODAL 1: TAMBAH/EDIT AKUN & PILIH GAME */}
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
                        
                        {/* INPUT JUDUL ETALASE */}
                        <div className="mb-5">
                          <label className="block text-xs text-gray-400 mb-2">Judul Etalase</label>
                          <input type="text" value={accountTitle} onChange={e => setAccountTitle(e.target.value)} placeholder="Contoh: Akun MLBB Sultan..." className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none" required />
                        </div>

                        {/* INPUT GAMBAR URL */}
                        <div className="mb-5">
                          <label className="block text-xs text-gray-400 mb-2">Galeri Foto Akun (Link URL / Imgur)</label>
                          {accountImages.map((img, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                              <input 
                                type="text" value={img} placeholder="https://..."
                                onChange={(e) => {
                                  const newImgs = [...accountImages];
                                  newImgs[idx] = e.target.value;
                                  setAccountImages(newImgs);
                                }}
                                className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-2.5 text-sm focus:border-[var(--color-johen-cyan)] outline-none"
                              />
                              <button type="button" onClick={() => setAccountImages(accountImages.filter((_, i) => i !== idx))} className="p-2 bg-red-500/10 text-red-400 rounded-lg transition"><X size={16}/></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => setAccountImages([...accountImages, ""])} className="text-[10px] text-[var(--color-johen-cyan)] font-bold flex items-center gap-1 mt-2 hover:underline"><Plus size={12}/> Tambah Gambar Lain</button>
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
                       <div><label className="block text-xs text-gray-400 mb-2">Harga Jual (Rp)</label><input type="number" value={basicPrice || ''} onChange={e => setBasicPrice(Number(e.target.value))} className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm focus:border-[var(--color-johen-cyan)] outline-none font-bold text-[var(--color-johen-cyan)]" required /></div>
                    </div>
                  )}
                </div>

                {selectedGameId && (
                  <div className="p-6 border-t border-white/5 bg-[#12122A] rounded-b-2xl flex justify-end">
                    <button onClick={handleSaveAccount} disabled={isSaving || !accountTitle} className="bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] px-8 py-3 rounded-xl font-extrabold text-sm flex gap-2 disabled:opacity-50">
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {editModeId ? 'SIMPAN PERUBAHAN' : 'SIMPAN PRODUK'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- MODAL 2: TAMBAH GAME KECIL --- */}
          {showAddGameModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
               <div className="bg-[#12122A] border border-white/10 p-6 rounded-2xl w-full max-w-sm">
                  <h3 className="font-bold text-lg mb-4">Tambah Kategori Game</h3>
                  <input type="text" value={newGameName} onChange={e => setNewGameName(e.target.value)} placeholder="Contoh: Valorant, PUBG..." className="w-full bg-[#0A0A1A] border border-white/10 rounded-lg p-3 text-sm mb-4 outline-none focus:border-[var(--color-johen-cyan)]" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowAddGameModal(false)} className="px-4 py-2 text-sm text-gray-400">Batal</button>
                    <button onClick={handleAddNewGame} className="px-4 py-2 bg-[var(--color-johen-violet)] text-white text-sm font-bold rounded-lg">Simpan Game</button>
                  </div>
               </div>
            </div>
          )}

          {/* --- MODAL 3: VISUAL SKIN GALLERY --- */}
          {activeSkinCategory && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <div className="bg-[#05050D] border border-[var(--color-johen-cyan)]/30 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                  <div>
                    <h3 className="text-2xl font-black text-white">{activeSkinCategory}</h3>
                    <button onClick={() => handleSelectAllSkins(activeSkinCategory)} className="mt-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition">
                      <CheckSquare size={14} /> Pilih Semua di Kategori Ini
                    </button>
                  </div>
                  <button onClick={() => setActiveSkinCategory(null)} className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-xl transition"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    {valuationMaster.filter(v => v.group_category === activeSkinCategory).map(skin => {
                      const isSelected = selectedSkins.includes(skin.id);
                      return (
                        <div key={skin.id} onClick={() => toggleSkinSelection(skin.id)} className={`relative rounded-xl overflow-hidden cursor-pointer transition-all border-2 group ${isSelected ? 'border-[var(--color-johen-cyan)] scale-105' : 'border-transparent bg-[#12122A]'}`}>
                          <div className="aspect-square bg-[#1E1E3F] w-full relative">
                            <img src={skin.image_url} alt={skin.item_name} className="w-full h-full object-cover opacity-80" />
                            {isSelected && <div className="absolute top-2 right-2 bg-[var(--color-johen-cyan)] rounded-full p-0.5"><CheckCircle2 size={20} className="text-[#0A0A1A]" /></div>}
                          </div>
                          <div className="p-3 text-center bg-[#0A0A1A]"><p className="font-bold text-xs line-clamp-2">{skin.item_name}</p></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 flex justify-between items-center bg-[#0A0A1A] rounded-b-2xl">
                  <button onClick={() => setActiveSkinCategory(null)} className="bg-[var(--color-johen-cyan)] text-[#0A0A1A] px-8 py-3 rounded-xl font-bold text-sm ml-auto">Selesai Memilih</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}