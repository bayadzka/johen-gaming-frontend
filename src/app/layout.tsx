import type { Metadata } from "next";
import "./globals.css";
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
        
        {/* Navbar - Efek Glassmorphism dengan border glow bawah */}
        <nav className="border-b border-[var(--color-johen-violet)]/30 bg-[#0A0A1A]/70 backdrop-blur-xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(124,58,237,0.1)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-2xl tracking-widest flex items-center gap-1 drop-shadow-[0_0_8px_rgba(0,200,240,0.5)]">
              <span className="text-[var(--color-johen-cyan)]">JOHEN</span>
              <span className="text-white">GAMING</span>
            </Link>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-[var(--color-johen-cyan)] transition duration-300">
                <ShoppingCart size={22} />
              </button>
              <button className="p-2 text-gray-400 hover:text-[var(--color-johen-cyan)] transition duration-300">
                <User size={22} />
              </button>
            </div>
          </div>
        </nav>

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