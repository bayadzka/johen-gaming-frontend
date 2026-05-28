# 🎮 Johen Gaming Store - Frontend (Client)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Frontend dari **Johen Gaming Store**, sebuah platform *e-commerce* dan *top-up game* berbasis *microservices*. Proyek ini dikembangkan dengan metodologi **prototype-based**, memungkinkan iterasi antarmuka yang cepat dan responsif berdasarkan interaksi pengguna.

## 🚀 Fitur Utama
- **Katalog Dinamis:** Menampilkan akun game dan layanan top-up secara real-time.
- **Sistem Keranjang & Checkout:** Manajemen *cart* lokal yang terintegrasi dengan Payment Gateway.
- **Autentikasi Pengguna:** Login dan Register yang aman.
- **Dashboard Admin:** Antarmuka khusus admin untuk manajemen inventaris akun dan game.

---

## 🛠️ Panduan Instalasi Lokal (Local Setup)

Jika kamu ingin menjalankan proyek ini di komputer lokal (localhost) untuk tahap *development* atau *testing*, ikuti langkah-langkah berikut:

### 1. Persiapan
Pastikan kamu sudah menginstal **Node.js** (versi 18+) dan **npm** / **yarn**.

### 2. Kloning Repositori
\`\`\`bash
git clone https://github.com/username-kamu/johen-frontend.git
cd johen-frontend
\`\`\`

### 3. Instalasi Dependencies
\`\`\`bash
npm install
# atau
yarn install
\`\`\`

### ⚠️ 4. MENGUBAH URL API (SANGAT PENTING)
Saat ini, kodingan diatur untuk menembak API Production di Railway. Jika kamu ingin mengetesnya dengan Backend lokal kamu, kamu **wajib** mengubah URL API-nya.

Gunakan fitur **Search (CTRL + SHIFT + F)** di VSCode kamu, lalu cari URL berikut:
\`https://johen-gaming-backend-production.up.railway.app\`

**Ubah semua URL tersebut menjadi URL localhost Backend kamu:**
\`http://localhost:3000\` *(atau port berapapun backend NestJS kamu berjalan)*

> *Tips Pro: Untuk ke depannya, sangat disarankan untuk menggunakan file `.env.local` dan memanggil API dengan `process.env.NEXT_PUBLIC_API_URL` agar tidak perlu mengubah URL satu per satu.*

### 5. Jalankan Aplikasi
\`\`\`bash
npm run dev
# atau
yarn dev
\`\`\`
Buka [http://localhost:3000](http://localhost:3000) di browser kamu untuk melihat hasilnya.
