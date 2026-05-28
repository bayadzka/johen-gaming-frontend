"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

// Import CSS bawaan Swiper
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PromoCarousel() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        // Logika Smart Timer: Hanya ambil promo yang expired_at nya lebih besar dari waktu SEKARANG
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from("promos")
          .select("*")
          .gt("expired_at", now) 
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPromos(data || []);
      } catch (error) {
        console.error("Gagal mengambil data promo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-40 md:h-72 bg-[#12122A] rounded-2xl animate-pulse flex items-center justify-center border border-white/5 mb-8">
        <Loader2 className="animate-spin text-[var(--color-johen-cyan)]" size={32} />
      </div>
    );
  }

  // Fallback: Jika tidak ada promo aktif, tampilkan Banner Default
  if (promos.length === 0) {
    return (
      <div className="w-full h-40 md:h-72 bg-gradient-to-r from-[#12122A] to-[#1E1E3F] rounded-2xl flex flex-col items-center justify-center border border-[var(--color-johen-violet)]/30 mb-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--color-johen-cyan)]/10 blur-[100px] rounded-full"></div>
        <h2 className="text-2xl md:text-4xl font-black text-white z-10 tracking-widest drop-shadow-lg">
          JOHEN <span className="text-[var(--color-johen-cyan)]">GAMING</span>
        </h2>
        <p className="text-gray-400 text-xs md:text-sm mt-2 z-10 font-bold uppercase tracking-widest">
          Platform Top-Up & Akun Terpercaya
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl group">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={promos.length > 1} // Loop hanya jalan kalau promo lebih dari 1
        className="w-full h-40 md:h-72"
      >
        {promos.map((promo) => (
          <SwiperSlide key={promo.id}>
            {promo.target_url ? (
              <Link href={promo.target_url} className="w-full h-full block">
                <img
                  src={promo.image_url}
                  alt="Promo Banner"
                  className="w-full h-full object-cover object-center transform transition duration-700 group-hover:scale-105"
                />
              </Link>
            ) : (
              <img
                src={promo.image_url}
                alt="Promo Banner"
                className="w-full h-full object-cover object-center transform transition duration-700 group-hover:scale-105"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Kustomisasi titik navigasi (Pagination) biar warnanya sesuai tema Johen */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #4b5563 !important;
          opacity: 0.7 !important;
        }
        .swiper-pagination-bullet-active {
          background-color: var(--color-johen-cyan) !important;
          opacity: 1 !important;
          box-shadow: 0 0 10px var(--color-johen-cyan);
        }
      `}</style>
    </div>
  );
}