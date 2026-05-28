"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Komponen inti yang membaca URL
function InvoiceCatcherContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      router.push(`/invoice/${orderId}`);
    } else {
      router.push("/");
    }
  }, [orderId, router]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-white">
      <Loader2 className="animate-spin text-[var(--color-johen-cyan)] mb-4" size={40} />
      <p className="text-gray-400 font-bold tracking-widest uppercase">Mengarahkan ke tagihan...</p>
    </div>
  );
}

// Komponen utama yang dibungkus Suspense (Wajib untuk Next.js Vercel)
export default function InvoiceCatcher() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-white">
          <Loader2 className="animate-spin text-[var(--color-johen-cyan)] mb-4" size={40} />
          <p className="text-gray-400 font-bold tracking-widest uppercase">Memuat...</p>
        </div>
      }
    >
      <InvoiceCatcherContent />
    </Suspense>
  );
}