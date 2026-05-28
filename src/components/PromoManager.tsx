"use client";

import { useState, createRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Loader2, Image as ImageIcon, Upload, Calendar, Link as LinkIcon } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Pastikan key ini sesuai dengan .env.local kamu
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""; 
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PromoManager() {
  const cropperRef = createRef<ReactCropperElement>();
  const [image, setImage] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [expiredAt, setExpiredAt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  // 1. Menangkap File Gambar yang Dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    // Langsung ambil dari target karena ini ChangeEvent
    const files = e.target.files;
    
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as any);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // 2. Mengeksekusi Upload ke Supabase
  const handleUpload = async () => {
    if (!expiredAt) {
      setMessage({ text: "Tanggal expired wajib diisi!", isError: true });
      return;
    }

    if (typeof cropperRef.current?.cropper !== "undefined") {
      setIsUploading(true);
      setMessage({ text: "", isError: false });
      
      // Ambil hasil crop dalam bentuk canvas
      const canvas = cropperRef.current?.cropper.getCroppedCanvas();
      
      // Ubah canvas menjadi file Blob agar bisa di-upload
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        try {
          const fileName = `promo-${Date.now()}.jpg`;

          // A. Upload ke Supabase Storage (Bucket: promo_banners)
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("promo_banners")
            .upload(fileName, blob, { contentType: 'image/jpeg' });

          if (uploadError) throw uploadError;

          // Dapatkan Public URL
          const { data: publicUrlData } = supabase.storage
            .from("promo_banners")
            .getPublicUrl(fileName);

          // B. Simpan data lengkapnya ke Tabel promos
          const { error: dbError } = await supabase
            .from("promos")
            .insert([
              {
                image_url: publicUrlData.publicUrl,
                target_url: targetUrl || null,
                expired_at: new Date(expiredAt).toISOString(),
              }
            ]);

          if (dbError) throw dbError;

          setMessage({ text: "Promo berhasil dipublikasikan!", isError: false });
          // Reset Form
          setImage(null);
          setTargetUrl("");
          setExpiredAt("");

        } catch (error: any) {
          setMessage({ text: error.message || "Gagal mengunggah promo.", isError: true });
        } finally {
          setIsUploading(false);
        }
      }, 'image/jpeg', 0.8); // Kompresi gambar 80% agar web tetap cepat
    }
  };

  return (
    <div className="bg-[#12122A] border border-white/10 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-black text-white flex items-center gap-2 mb-6">
        <ImageIcon className="text-[var(--color-johen-cyan)]" /> Tambah Banner Promo
      </h2>

      {/* Input File */}
      {!image && (
        <div className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center hover:border-[var(--color-johen-cyan)]/50 transition cursor-pointer relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
          <Upload className="mx-auto text-gray-500 mb-3" size={32} />
          <p className="text-gray-400 font-bold text-sm">Klik atau tarik gambar ke sini</p>
          <p className="text-gray-500 text-xs mt-1">Rekomendasi rasio memanjang (Landscape)</p>
        </div>
      )}

      {/* Area Editor & Form (Muncul jika gambar sudah dipilih) */}
      {image && (
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
            <Cropper
              ref={cropperRef}
              src={image}
              style={{ height: 300, width: "100%" }}
              // Rasio 21:9 memaksa potongan gambar menjadi banner landscape yang rapi
              aspectRatio={21 / 9} 
              guides={true}
              viewMode={1}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><LinkIcon size={14}/> URL Tujuan (Opsional)</label>
              <input 
                type="text" 
                placeholder="https://..." 
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 flex items-center gap-1.5"><Calendar size={14}/> Batas Waktu Expired</label>
              <input 
                type="datetime-local" 
                value={expiredAt}
                onChange={(e) => setExpiredAt(e.target.value)}
                className="w-full bg-[#0A0A1A] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--color-johen-cyan)] outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {message.text && (
            <p className={`text-sm font-bold p-3 rounded-xl border ${message.isError ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
              {message.text}
            </p>
          )}

          <div className="flex gap-3">
            <button 
              onClick={() => setImage(null)} 
              disabled={isUploading}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition text-sm disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="flex-[2] py-3 bg-[var(--color-johen-cyan)] hover:bg-[#22D3EE] text-[#0A0A1A] rounded-xl font-black transition text-sm flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              {isUploading ? "Memproses..." : "Potong & Publikasikan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}