"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Mengecek apakah user memiliki kunci akses admin (sb-token)
    const adminToken = localStorage.getItem("sb-token");

    if (!adminToken) {
      // Jika tidak ada token dan sedang berada di area admin, tendang ke beranda
      if (pathname.startsWith("/admin")) {
        window.location.replace("/"); 
      }
    } else {
      // Jika aman, izinkan halaman dirender
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Tampilkan layar hitam / loading singkat saat sedang mengecek kunci
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#05050D] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-johen-cyan)]" size={40} />
      </div>
    );
  }

  // Jika lolos pengecekan, tampilkan antarmuka Admin
  return <>{children}</>;
}