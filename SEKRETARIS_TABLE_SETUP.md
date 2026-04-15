# Setup Tabel Sekretaris

## SQL untuk membuat tabel di Supabase

Jalankan query SQL ini di Supabase SQL Editor
untuk membuat tabel `sekretaris`:

```sql
-- Buat tabel sekretaris
CREATE TABLE sekretaris (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_sekretaris VARCHAR(255) NOT NULL,
  kode_sekretaris VARCHAR(255) NOT NULL UNIQUE,
  nama_kelas VARCHAR(255) NOT NULL,
  kode_kelas VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Buat index untuk performa query
CREATE INDEX idx_sekretaris_kode_sekretaris ON sekretaris(kode_sekretaris);
CREATE INDEX idx_sekretaris_kode_kelas ON sekretaris(kode_kelas);
CREATE INDEX idx_sekretaris_nama_kelas ON sekretaris(nama_kelas);

-- Enable RLS
ALTER TABLE sekretaris ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk SELECT (bisa diakses semua)
CREATE POLICY "Sekretaris SELECT Policy" ON sekretaris
FOR SELECT USING (true);

-- Buat policy untuk INSERT (hanya user yang authenticated)
CREATE POLICY "Sekretaris INSERT Policy" ON sekretaris
FOR INSERT WITH CHECK (true);

-- Buat policy untuk UPDATE (user bisa update data mereka sendiri)
CREATE POLICY "Sekretaris UPDATE Policy" ON sekretaris
FOR UPDATE USING (true);

-- Buat policy untuk DELETE (user bisa delete data mereka sendiri)
CREATE POLICY "Sekretaris DELETE Policy" ON sekretaris
FOR DELETE USING (true);
```

## Kolom Tabel

| Kolom             | Tipe         | Keterangan                    |
| ----------------- | ------------ | ----------------------------- |
| `id`              | UUID         | Primary key (auto-generated)  |
| `nama_sekretaris` | VARCHAR(255) | Nama lengkap sekretaris       |
| `kode_sekretaris` | VARCHAR(255) | Kode unik sekretaris (UNIQUE) |
| `nama_kelas`      | VARCHAR(255) | Nama kelas (misal: XII IPA 1) |
| `kode_kelas`      | VARCHAR(255) | Kode kelas dari login         |
| `created_at`      | TIMESTAMPTZ  | Waktu pembuatan data          |
| `updated_at`      | TIMESTAMPTZ  | Waktu update terakhir         |

## Fitur Onboarding

Setelah tabel dibuat, pengguna akan melalui 3
tahap onboarding:

1. **Step 1: Nama Sekretaris**
   - Input nama lengkap sekretaris
   - Tombol: "Lanjut →"

2. **Step 2: Kode Sekretaris**
   - Input kode unik (minimal 4 karakter)
   - Sistem akan validasi kode harus unik di tabel
   - Jika sudah digunakan, muncul error: "Kode
     sekretaris sudah digunakan. Gunakan kode
     lain."
   - Tombol: "← Kembali" dan "Lanjut →"

3. **Step 3: Nama Kelas**
   - Input nama kelas sesuai data di tabel
     `profiles`
   - Nama kelas harus cocok dengan `kode_kelas`
     (dari login)
   - Data akan disimpan ke tabel `sekretaris`
   - Tombol: "← Kembali" dan "Mulai Absensi →"

## Data yang Tersimpan

Setelah onboarding selesai, data akan tersimpan
di:

1. **Tabel `sekretaris` (Supabase)**
   - Menyimpan: nama_sekretaris, kode_sekretaris,
     nama_kelas, kode_kelas

2. **localStorage**
   - Key: `sekretaris_profile`
   - Struktur:
   ```json
   {
     "nama_sekretaris": "...",
     "kode_sekretaris": "...",
     "nama_kelas": "...",
     "kode_kelas": "..."
   }
   ```

## Testing

1. Buka `/dashboard/siswa`
2. Isi nama sekretaris (misal: "Budi Santoso")
3. Isi kode sekretaris (misal: "BUD123")
4. Isi nama kelas (misal: "XII IPA 1")
5. Klik "Mulai Absensi"
6. Verifikasi data tersimpan di tabel `sekretaris`
   di Supabase
