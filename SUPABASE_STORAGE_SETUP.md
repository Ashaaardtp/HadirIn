# Setup Supabase Storage untuk Surat Sakit

Fitur download surat sakit di dashboard guru
memerlukan konfigurasi Supabase Storage bucket.

## Langkah Setup

### 1. Buat Bucket "surat-sakit"

1. Login ke
   [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Ke menu **Storage**
4. Klik **Create a new bucket**
5. Masukkan nama: `surat-sakit`
6. Terapkan konfigurasi sebagai berikut:

### 2. Set Bucket Policies (Important!)

Agar file dapat diakses publik untuk download, set
policies sebagai berikut:

**Policy 1: Public Read Access** (Guru bisa
download file)

```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'surat-sakit');
```

**Policy 2: Authenticated Insert** (Siswa bisa
upload file)

```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'surat-sakit');
```

### 3. Verifikasi di Supabase Dashboard

1. Buka bucket `surat-sakit`
2. Klik tab **Policies**
3. Pastikan sudah ada 2 policies di atas
4. Jika tidak, klik **Add Policy** dan manual
   input SQL di atas

## Bagaimana Sistemnya Bekerja

### Flow Siswa (Upload):

1. Siswa masuk ke dashboard siswa
2. Pilih siswa dan status "Sakit"
3. Upload file surat dokter (opsional)
4. File diupload ke bucket `surat-sakit` dengan
   nama random
5. URL public disimpan di field `bukti_file` di
   tabel `absensi`

### Flow Guru (Download):

1. Guru masuk ke dashboard guru
2. Lihat laporan absensi masuk (Live update via
   realtime)
3. Klik "Download Surat" untuk file yang ada
4. Browser otomatis download file

## Notes

- Hanya file untuk status "Sakit" yang diupload
- File tersimpan dengan nama random untuk keamanan
- URL sudah public jadi bisa diakses siapa saja
  (yang punya link)
- Untuk setting storage lebih detail, lihat:
  https://supabase.com/docs/guides/storage

## Troubleshooting

**Q: File tidak bisa didownload**

- Cek apakah bucket `surat-sakit` sudah dibuat
- Verifikasi policies sudah benar di dashboard
  Supabase

**Q: Upload file error**

- Pastikan user sudah terauthentikasi (login)
- Check console browser untuk error message

**Q: File tidak muncul di dashboard guru**

- Refresh halaman
- Pastikan data absensi sudah insert ke tabel
  (check di Supabase SQL Editor)
