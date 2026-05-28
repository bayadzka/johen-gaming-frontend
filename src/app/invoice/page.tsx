"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function InvoiceCatcher() {
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
    <div className="min-h-screen flex items-center justify-center text-white">
      <Loader2 className="animate-spin mr-2" /> Mengarahkan ke invoice...
    </div>
  );
}