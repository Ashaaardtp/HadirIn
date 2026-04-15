# Sistem Login Kode Sekretaris

## Overview

Sistem telah diupdate untuk mendukung flow login
yang lebih baik:

- **Pertama kali**: Onboarding 3 step (Nama → Kode
  Sekretaris → Nama Kelas)
- **Login kembali**: Verifikasi dengan kode
  sekretaris yang sudah dibuat

## SQL Tabel Sekretaris (UPDATED)

```sql
-- Buat tabel sekretaris
CREATE TABLE sekretaris (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_sekretaris VARCHAR(255) NOT NULL,
  kode_sekretaris VARCHAR(255) NOT NULL UNIQUE,
  nama_kelas VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sekretaris_kode_sekretaris ON sekretaris(kode_sekretaris);
CREATE INDEX idx_sekretaris_nama_kelas ON sekretaris(nama_kelas);

ALTER TABLE sekretaris ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sekretaris SELECT Policy" ON sekretaris FOR SELECT USING (true);
CREATE POLICY "Sekretaris INSERT Policy" ON sekretaris FOR INSERT WITH CHECK (true);
CREATE POLICY "Sekretaris UPDATE Policy" ON sekretaris FOR UPDATE USING (true);
CREATE POLICY "Sekretaris DELETE Policy" ON sekretaris FOR DELETE USING (true);
```

## Kolom Tabel (UPDATED)

| Kolom             | Tipe         | Keterangan                     |
| ----------------- | ------------ | ------------------------------ |
| `id`              | UUID         | Primary key                    |
| `nama_sekretaris` | VARCHAR(255) | Nama sekretaris                |
| `kode_sekretaris` | VARCHAR(255) | Kode unik untuk login (UNIQUE) |
| `nama_kelas`      | VARCHAR(255) | Nama kelas                     |
| `created_at`      | TIMESTAMPTZ  | Waktu pembuatan                |
| `updated_at`      | TIMESTAMPTZ  | Waktu update terakhir          |

**Catatan**: Kolom `kode_kelas` TIDAK ada di
tabel. `kode_kelas` disimpan di localStorage saja.

## Flow Onboarding (Pertama Kali)

### Step 1: Input Nama Sekretaris

- User memasukkan nama lengkap
- Validasi: Harus diisi
- Tombol: "Lanjut →"

### Step 2: Input Kode Sekretaris

- User membuat kode unik (minimal 4 karakter)
- Validasi:
  - Tidak boleh kosong
  - Minimal 4 karakter
  - Harus unik di database
- Error jika kode sudah digunakan: "Kode
  sekretaris sudah digunakan. Gunakan kode lain."
- Tombol: "← Kembali" dan "Lanjut →"

### Step 3: Input Nama Kelas

- User memasukkan nama kelas sesuai data di tabel
  `profiles`
- Validasi:
  - Harus cocok dengan kode_kelas (dari login
    sebelumnya)
  - Nama kelas harus ada di database
- Data disimpan ke:
  - **Tabel `sekretaris`**: nama_sekretaris,
    kode_sekretaris, nama_kelas
  - **localStorage**: Semua data + kode_kelas
- Tombol: "← Kembali" dan "Mulai Absensi →"

## Flow Login (Login Kembali)

### Step 5: Verifikasi Kode Sekretaris

- Sistem menampilkan nama sekretaris yang
  tersimpan
- User diminta memasukkan kode sekretaris untuk
  verifikasi
- Validasi:
  - Kode tidak boleh kosong
  - Kode harus cocok dengan yang tersimpan di
    localStorage
- Error jika kode salah: "Kode sekretaris tidak
  sesuai. Coba lagi."
- Tombol: "Logout" dan "Masuk →"

### Logout

- Hapus semua data dari localStorage
- Kembali ke Step 1 (Onboarding)
- Data di database tetap tersimpan

## Data yang Tersimpan

### Tabel `sekretaris` (Supabase)

```json
{
  "id": "uuid",
  "nama_sekretaris": "Budi Santoso",
  "kode_sekretaris": "BUD123",
  "nama_kelas": "XII IPA 1",
  "created_at": "2024-04-15T10:30:00Z",
  "updated_at": "2024-04-15T10:30:00Z"
}
```

### localStorage (Browser)

**Key**: `sekretaris_profile`

```json
{
  "nama_sekretaris": "Budi Santoso",
  "kode_sekretaris": "BUD123",
  "nama_kelas": "XII IPA 1",
  "kode_kelas": "ABC123"
}
```

## Testing Checklist

- [ ] Create table SQL di Supabase
- [ ] Buka `/dashboard/siswa` (clear localStorage
      terlebih dahulu)
- [ ] Test Onboarding:
  - [ ] Step 1: Input nama
  - [ ] Step 2: Input kode sekretaris (test
        validation minimal 4 karakter)
  - [ ] Step 2: Test kode tidak boleh duplikat
  - [ ] Step 3: Input nama kelas
  - [ ] Verify data di tabel `sekretaris`
- [ ] Test Login Kembali:
  - [ ] Refresh halaman
  - [ ] Verifikasi muncul Step 5 (Login)
  - [ ] Input kode yang benar
  - [ ] Verify masuk ke dashboard
- [ ] Test Kode Salah:
  - [ ] Refresh halaman
  - [ ] Input kode yang salah
  - [ ] Verify error message
- [ ] Test Logout:
  - [ ] Klik tombol "Logout" di banner dashboard
  - [ ] Verify kembali ke Step 1
  - [ ] Verify localStorage kosong
  - [ ] Verify data di database tetap ada

## Architecture Changes

### Before

- Step 0: Loading
- Step 1-2: Onboarding (nama → nama kelas)
- Step 3: Dashboard

### After

- Step 0: Loading
- Step 1-3: Onboarding (nama → kode sekretaris →
  nama kelas)
- Step 4: Dashboard
- Step 5: Login Verification

### New Handlers

- `handleSimpanKode()`: Validasi & simpan kode
  sekretaris
- `handleVerifyLoginKode()`: Verifikasi kode saat
  login kembali
- `handleLogout()`: Logout & clear localStorage

### New State

- `loginKodeInput`: Input kode untuk verifikasi
  login
- Onboarding step comments updated untuk clarity
