# Jokothread

Sebuah aplikasi web *social media* modern yang terinspirasi dari Threads & X (Twitter). Proyek ini dirancang dengan arsitektur monorepo/terpisah yang efisien,  dan tampilan antarmuka gelap (*dark mode*), menggunakan ekosistem React dan Supabase.

# Frontend

Ini adalah bagian Frontend web Jokothread, untuk backendnya, bisa ke repository ini: https://github.com/FrenzY8/Jokothread-Backend

## Fitur Utama

- **Autentikasi Pengguna**: Pendaftaran dan masuk akun aman berbasis JWT yang terintegrasi dengan manajemen sesi global.
- **Home Feed Dinamis**: Menampilkan kiriman (*threads*) terbaru secara *real-time* lengkap dengan fitur *infinite scroll* otomatis menggunakan `IntersectionObserver`.
- **Interaksi Kiriman**: Kemampuan membuat *thread* baru, menyukai (*like*), dan sistem komentar/balasan.
- **Sistem Profil & Hubungan**: Halaman profil kustom untuk tiap pengguna, manajemen bio, pengaturan avatar, serta fitur ikuti/ikuti balik (*follow/unfollow system*).
- **Pencarian Pintar**: Fitur pencarian terpadu menggunakan *tabbed interface* untuk menyaring hasil berdasarkan kategori *Threads* atau *Users*.

## Tech Stack & Tools

### Frontend
- **[React](https://react.dev/)** - Library JavaScript utama untuk membangun komponen antarmuka deklaratif.
- **[Vite](https://vitejs.dev/)** - Build tool super cepat untuk pengembangan modul *frontend* modern.
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS berbasis utilitas untuk kustomisasi desain yang cepat dan responsif.
- **[TanStack Query (React Query)](https://tanstack.com/query/latest)** - Manajemen *state* server, *caching*, dan sinkronisasi data asinkronus yang optimal.
- **[Zustand](https://github.com/pmndrs/zustand)** - Manajemen *state* global lokal yang ringan untuk menyimpan data sesi login pengguna.

### Backend & Database
- **[Supabase](https://supabase.com/)** - Penyedia layanan Backend-as-a-Service (BaaS) berbasis PostgreSQL untuk pengelolaan database relasional, skema tabel, fungsi penyimpanan (*stored procedures*), dan autentikasi aman.

---

## Persiapan Instalasi

Pastikan komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) atau [yarn](https://yarnpkg.com/)

### Langkah-Langkah

1. **Clone Repositori**
   ```bash
   git clone [https://github.com/username/jokothread.git](https://github.com/username/jokothread.git)
   cd jokothread
   ```

2. Instalasi Dependensi

```bash
npm install
```

3. Konfigurasi Environment Variables
Buat sebuah file bernama .env atau .env.local di direktori utama (root), lalu lengkapi variabel berikut sesuai dengan kredensial penyedia layanan Anda:
```env
VITE_BACKEND=http://localhost:5000
VITE_SUPABASE_URL=[https://your-supabase-project-url.supabase.co](https://your-supabase-project-url.supabase.co)
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

## 4. Setup Supabase

### Buat Project Supabase
1. Buka : [Supabase](https://supabase.com)
2. Login atau daftar akun
3. Klik **New Project**
4. Isi:
   - Project Name
   - Database Password
   - Region
5. Tunggu hingga project selesai dibuat

---

### Ambil Kredensial Supabase
Setelah project berhasil dibuat:

1. Masuk ke menu **Project Settings**
2. Pilih **API**
3. Salin:
   - **Project URL**
   - **anon public key**

---

### Konfigurasi Environment Variables
Buat file `.env` atau `.env.local` di root project, lalu isi:

```env
VITE_BACKEND=http://localhost:5000
VITE_SUPABASE_URL=https://your-supabase-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

---

### Install Dependency Supabase
Install package Supabase:

```bash
npm install @supabase/supabase-js
```

---

### 5. Jalankan Project

```bash
npm run dev
```

### 6. Struktur Folder
```
└── 📁Jokothread-Frontend
    └── 📁public
        ├── favicon.svg
        ├── icons.svg
    └── 📁src
        └── 📁assets
            ├── hero.png
            ├── react.svg
            ├── vite.svg
        └── 📁components
            └── 📁auth
                ├── Login.jsx
                ├── Register.jsx
            └── 📁elements
                ├── CreatePostCard.jsx
                ├── PostCard.jsx
            └── 📁page
                ├── About.jsx
                ├── BlockedAccount.jsx
                ├── Messages.jsx
                ├── Notifications.jsx
                ├── PersonalSettings.jsx
                ├── Profile.jsx
                ├── SearchResults.jsx
                ├── SecuritySettings.jsx
                ├── ThreadDetail.jsx
            └── 📁ui
                ├── alert.jsx
                ├── aurora.jsx
                ├── button.jsx
                ├── floating-lines.jsx
                ├── input.jsx
                ├── label.jsx
                ├── light-rays.jsx
                ├── skeleton.jsx
                ├── sonner.jsx
            ├── Explore.jsx
            ├── Home.jsx
            ├── Settings.jsx
        └── 📁lib
            ├── client.js
            ├── server.js
            ├── utils.js
        └── 📁store
            ├── useAuthStore.js
        └── 📁utils
            ├── base64.js
            ├── ProtectedRoute.jsx
        ├── App.jsx
        ├── index.css
        ├── main.jsx
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── components.json
    ├── eslint.config.js
    ├── index.html
    ├── jsconfig.json
    ├── package-lock.json
    ├── package.json
    ├── README.md
    ├── skills-lock.json
    ├── vercel.json
    └── vite.config.js
```