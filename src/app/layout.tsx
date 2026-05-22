import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Johen Gaming",
  description: "Digital Marketplace Gaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-[var(--color-johen-space)] text-white min-h-screen flex flex-col antialiased">
        <Navbar />
        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--color-johen-violet)]/20 bg-[#05050D] py-8 mt-16 text-center text-xs text-gray-500">
          <p className="mb-2 uppercase tracking-widest text-[var(--color-johen-violet)] font-bold">Johen Sukses Abadi</p>
          © 2026. All rights reserved. <br/>
          <i className="opacity-50">Test Project - Fullstack Developer</i>
        </footer>

      </body>
    </html>
  );
}