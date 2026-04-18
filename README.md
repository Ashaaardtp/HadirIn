# HadirIn

**Solusi Presensi Digital untuk Sekolah Masa
Depan**

---

## Deskripsi Project

HadirIn adalah aplikasi absensi siswa berbasis web
yang dibangun dengan Next.js dan Supabase.
Aplikasi ini memungkinkan guru wali kelas dan
sekretaris siswa untuk mencatat kehadiran dengan
efisien, melakukan rekap otomatis, dan
menganalisis data kehadiran dengan dashboard yang
interaktif.

Dengan sistem kode unik 6 karakter, guru dapat
membuat kelas yang aman dan sekretaris dapat
mengakses kelas tersebut tanpa perlu akun
terpisah. Semua data disimpan secara real-time ke
Supabase dengan fitur export Excel dan upload file
bukti.

---

## Permasalahan & Solusi

**Permasalahan:**

- Rekap absensi manual di akhir bulan memakan
  waktu dan rentan kesalahan
- Data absensi mudah tersesat atau hilang
- Tidak ada sistem analisis kehadiran yang mudah
  diakses
- Monitor siswa yang sering tidak hadir sulit
  dilakukan

**Solusi:**

- Input absensi digital langsung dari HP
  sekretaris
- Otomatis terkirim ke dashboard guru secara
  real-time
- Rekap data harian dengan 1 klik
- Upload bukti surat sakit (Sakit/Izin)
- Dashboard interaktif dengan chart dan export
  Excel terstruktur

---

## Fitur Utama

### 👥 Multi-Role System

- **Wali Kelas (Guru)**: Login via Supabase Auth,
  atur kelas, lihat semua laporan
- **Sekretaris (Siswa)**: Login via kode unik,
  catat kehadiran teman sekelas

### 🔐 Sistem Kode Unik Kelas

- Guru membuat kode 6 karakter (auto-generate atau
  manual)
- Kode disimpan satu kali dan terkunci
- Siswa pakai kode untuk mengakses kelas yang
  sesuai
- **Tidak ada akun terpisah** untuk sekretaris

### 📱 Dashboard Sekretaris

- Onboarding 3 langkah (nama → kode sekretaris →
  nama kelas)
- Pilih siswa daftar hadir, status
  (Sakit/Izin/Alpa)
- Input alasan untuk Sakit/Izin
- Upload bukti foto (surat sakit) - opsional
- Rekap antrean harian dengan edit & hapus
- Kirim semua data ke guru dengan 1 tombol
- Mobile-first UI dengan popup fullscreen

### 📊 Dashboard Wali Kelas

- Profil lengkap dengan upload avatar
- Atur nama kelas & kode unik (terkunci)
- Lihat laporan absensi real-time via Supabase
  Realtime
- Filter data per tanggal
- Chart analisis (Ringkasan, Harian, Mingguan,
  Persentase)
- Export ke Excel dengan styling (2 sheet: Data +
  Ringkasan)
- Kelola data sekretaris (buat akun baru)

### ☁️ Storage & File Management

- Upload surat sakit ke bucket `surat-sakit`
  (public read, auth upload)
- Upload avatar guru ke bucket `avatars` (auth
  upload/update)
- File disimpan dengan nama random, URL disimpan
  di database

### ⚡ Real-time Updates

- Data absensi langsung muncul di dashboard guru
  tanpa refresh
- Realtime listener pada tabel `absensi` dan
  `sekretaris`

---

## Tech Stack

| Komponen         | Teknologi                               |
| ---------------- | --------------------------------------- |
| **Framework**    | Next.js 16 (App Router)                 |
| **Styling**      | Tailwind CSS v4                         |
| **Database**     | Supabase PostgreSQL                     |
| **Auth**         | Supabase Auth (Email/Password)          |
| **Storage**      | Supabase Storage (surat-sakit, avatars) |
| **Realtime**     | Supabase Realtime (postgres_changes)    |
| **Charts**       | Recharts                                |
| **Excel Export** | ExcelJS + xlsx                          |
| **Animation**    | Framer Motion                           |
| **Icons**        | Lucide React, Phosphor Icons            |

---

## Struktur Folder

```
hadirin/
├── .env.local                          # Environment variables (Supabase)
├── .next/                              # Build output
├── node_modules/
├── public/                             # Static assets (bg.png, icons)
├── src/
│   ├── app/
│   │   ├── (auth)/                     # Auth pages (route groups)
│   │   │   ├── login-siswa/            # Login sekretaris via code
│   │   │   ├── login-walas/            # Login guru (Supabase Auth)
│   │   │   └── signup-walas/           # Signup guru
│   │   ├── (dashboard)/               # Dashboard pages (route groups)
│   │   │   ├── layout.jsx             # Dashboard layout wrapper
│   │   │   ├── siswa/                 # Dashboard sekretaris
│   │   │   └── walikelas/             # Dashboard guru
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── callback/          # Auth callback (OAuth placeholder)
│   │   ├── favicon.ico
│   │   ├── globals.css                # Global styles (Tailwind + custom vars)
│   │   ├── layout.jsx                 # Root layout (fonts, analytics)
│   │   └── page.jsx                   # Landing page
│   ├── components/
│   │   ├── Alur.jsx                   # Flow section (landing)
│   │   ├── BackgroundSection.jsx      # Background image section
│   │   ├── Bantuan.jsx                # Call-to-action bantuan
│   │   ├── Footer.jsx                 # Footer with social links
│   │   ├── Hero.jsx                   # Hero landing with login buttons
│   │   ├── Keunggulan.jsx             # Features highlights
│   │   └── Navbar.jsx                 # Sticky navigation
│   └── utils/
│       └── supabase/
│           └── client.js              # Supabase client singleton
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── SEKRETARIS_LOGIN_SYSTEM.md         # Detail onboarding sekretaris
├── SEKRETARIS_TABLE_SETUP.md         # SQL tabel sekretaris
├── SUPABASE_STORAGE_SETUP.md         # Setup storage buckets
├── eslint.config.mjs
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── jsconfig.json
```

---

## Alur Aplikasi

### 1. Landing Page (`/`)

Tampilan awal dengan navbar, hero section, alur
kerja, keunggulan, bantuan, dan footer. Tampilan
tombol masking:

- **Guru** (Belum login) → tombol "Wali Kelas"
- **Sekretaris** (Ada localStorage
  `sekretaris_profile`) → tombol "Siswa"
- **Belum login sama sekali** → dua tombol: Wali
  Kelas & Siswa

### 2. Login Guru - Wali Kelas (`/login-walas`)

- Input email + password (Supabase Auth)
- Fitur show/hide password
- Link ke halaman signup
- Berhasil → redirect ke `/walikelas`

### 3. Signup Guru - Wali Kelas (`/signup-walas`)

- Input nama lengkap, email, password
- Supabase signUp dengan metadata `nama_lengkap`
- Trigger SQL di Supabase menyimpan nama ke tabel
  `profiles`
- Email verifikasi dikirim (Supabase default)
- Berhasil → redirect ke `/login-walas` dengan
  alert

### 4. Dashboard Guru - Wali Kelas (`/walikelas`)

**Setup Awal:**

1. Upload avatar (optional) → ke bucket `avatars`
2. Masukkan nama kelas (misal: "XII IPA 1") →
   simpan ke `profiles.nama_kelas`
3. Buat kode unik kelas:
   - Auto-generate (6 char random) atau manual
   - Simpan ke `profiles.kode_kelas` (terkunci,
     tidak bisa diubah)
4. **Buat akun sekretaris** (tombol aktif setelah
   kode kelas disimpan)
   - Input: nama, kode sekretaris (unik)
   - Disimpan ke tabel `sekretaris`
5. Bagikan kode kelas & kode sekretaris ke siswa

**Fitur Utama:**

- Tampilkan semua absensi masuk (real-time)
- Filter data per tanggal
- Chart analisis (Ringkasan, Harian, Mingguan,
  Persentase)
- Export ke Excel (2 sheet: detail + ringkasan)
- Lihat daftar semua sekretaris yang terdaftar
- Logout → hapus sesi Supabase, kembali ke landing

### 5. Login Sekretaris - Siswa (`/login-siswa`)

**Tidak pakai password!** Hanya 3 field:

- `namaSekretaris` (nama lengkap)
- `kodeSekretaris` (kode yang dibuat guru)
- `kodeKelas` (kode kelas 6 karakter)

**Validasi di DB:**

1. Cek di tabel `sekretaris` → `kode_sekretaris` +
   `kode_kelas`
2. Cocokkan `nama_sekretaris` (case-insensitive)
3. Berhasil → simpan ke
   `localStorage.sekretaris_profile` + redirect ke
   `/siswa`

### 6. Onboarding Sekretaris (`/siswa`)

**Jika belum ada `sekretaris_profile` di
localStorage**, jalankan 3-step:

**Step 1 - Input Nama:**

- Masukkan nama lengkap → simpan state, lanjut ke
  step 2

**Step 2 - Buat Kode Sekretaris:**

- Buat kode unik (min 4 karakter)
- Validasi: tidak boleh duplikat di tabel
  `sekretaris`
- Tampilkan toggle show/hide password

**Step 3 - Validasi Nama Kelas:**

- Input `nama_kelas` sesuai data di tabel
  `profiles` (dengan `kode_kelas` yang login)
- Validasi: harus cocok dengan `kode_kelas` dari
  login sebelumnya
- Insert data ke tabel `sekretaris`
  (nama_sekretaris, kode_sekretaris, nama_kelas,
  kode_kelas)
- Simpan profil lengkap ke localStorage → masuk
  dashboard

**Dashboard Sekretaris (Desktop):**

- 3 kolom grid:
  1. **Cari & Pilih Siswa** - list semua siswa
     (filter by search) dari tabel `siswa`
     berdasarkan `kode_kelas`
  2. **Input Absensi** - pilih status
     (Sakit/Izin/Alpa), alasan, upload Bukti file
     (Sakit/Izin)
  3. **Antrean Harian** - list siswa yang akan
     dikirim, edit, hapus, Kirim Semua

**Dashboard Sekretaris (Mobile):**

- Layout 1 kolom
- Tombol floating action (FAB) buka popup
  fullscreen
- 3 tab: Daftar | Form | Rekap

**Kirim Data:**

- Upload file ke `bucket surat-sakit` (jika ada
  bukti)
- Insert semua data ke tabel `absensi` (bulk
  insert)
- Clear antrean local, tampilkan alert sukses
- Data langsung muncul di dashboard guru
  (realtime)

---

## Roadmap / Pengembangan Lanjutan

**Prioritas Tinggi:**

- [ ] Import data siswa dari Excel/CSV (bulk
      insert)
- [ ] Edit data absensi yang sudah dikirim (dari
      guru)
- [ ] Hapus data absensi (dengan konfirmasi)
- [ ] Notifikasi WhatsApp/Siswa radio untuk
      laporan harian
- [ ] Role-based access control (RBAC) untuk admin
      sekolah

**Prioritas Sedang:**

- [ ] Mobile app (React Native / Expo) untuk
      offline-first
- [ ] Print laporan PDF (dengan header sekolah)
- [ ] Statistik tren absensi 30 hari terakhir
- [ ] Multi-kelas dalam satu project (sekolah
      besar)
- [ ] Backup database ke Google Drive otomatis

**Prioritas Rendah:**

- [ ] Dark/Light mode toggle
- [ ] Multi-bahasa (Indonesia/English)
- [ ] QR code scanning untuk absensi cepat
- [ ] Face recognition (integrasi OpenFace)
- [ ] Webhook untuk LMS (Moodle, Google Classroom)

---

Lihat demo langsung:

- [Demo Live](https://hadir-in.vercel.app)

---

## Author

**Pasha Raditya Putra**

- 📧 Email: pshhaaa04@gmail.com
- 🐙 GitHub:
  [@Ashaaardtp](https://github.com/Ashaaardtp)
- 💼 LinkedIn:
  [Pasha Raditya Putra](https://linkedin.com/in/pasha-raditya-putra-8221093a2)
- 📷 Instagram:
  [@Ashaaardtp](https://instagram.com/Ashaaardtp)
