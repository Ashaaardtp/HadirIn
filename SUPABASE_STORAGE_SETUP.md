# Setup Supabase Storage

Aplikasi ini memerlukan 2 storage bucket: satu
untuk surat sakit dan satu untuk avatar profil.

## Fitur Kode Unik Kelas

**Penting**: Sistem ini menggunakan **kode unik 6
karakter** untuk identifikasi kelas yang aman.

### Cara Kerja Kode:

1. **Guru** membuat/generate kode unik di
   dashboard walikelas
2. Kode disimpan ke Supabase (tabel `profiles`,
   field `kode_kelas`)
3. Kode **hanya bisa disimpan 1 kali** dan akan
   terkunci
4. Guru berbagi kode ke siswa
5. Siswa masukkan kode saat login pertama kali
6. Sistem match kode siswa dengan kode guru untuk
   akses kelas

### Yang Perlu Dipersiapkan di Supabase:

- Pastikan tabel `profiles` memiliki field
  `kode_kelas` (string, nullable)
- Field ini sudah ada di skema default Supabase
  Auth

## Langkah Setup Storage

### 1. Buat Bucket "surat-sakit"

1. Login ke
   [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Ke menu **Storage**
4. Klik **Create a new bucket**
5. Masukkan nama: `surat-sakit`
6. Terapkan konfigurasi sebagai berikut:

### 2. Set Bucket Policies untuk "surat-sakit"

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

### 3. Buat Bucket "avatars"

1. Klik **Create a new bucket**
2. Masukkan nama: `avatars`

### 4. Set Bucket Policies untuk "avatars"

**Policy 1: Public Read Access** (Semua orang bisa
lihat avatar)

```sql
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');
```

**Policy 2: Authenticated Upload** (Guru bisa
upload avatar mereka sendiri)

```sql
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

**Policy 3: Authenticated Update** (Guru bisa
replace avatar mereka)

```sql
CREATE POLICY "Allow authenticated users to update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');
```

### 5. Verifikasi di Supabase Dashboard

1. Buka bucket `surat-sakit` dan `avatars`
2. Klik tab **Policies**
3. Pastikan semua policies sudah ada
4. Jika tidak, klik **Add Policy** dan manual
   input SQL di atas

## Bagaimana Sistemnya Bekerja

### Flow Siswa (Upload Surat)

1. Siswa masuk ke dashboard siswa
2. Pilih siswa dan status "Sakit"
3. Upload file surat dokter (opsional)
4. File diupload ke bucket `surat-sakit` dengan
   nama random
5. URL public disimpan di field `bukti_file` di
   tabel `absensi`

### Flow Guru (Download Surat)

1. Guru masuk ke dashboard guru
2. Lihat laporan absensi masuk (Live update via
   realtime)
3. Klik "Download Surat" untuk file yang ada
4. Browser otomatis download file

### Flow Guru (Upload Avatar)

1. Guru masuk ke dashboard guru
2. Hover ke bagian foto profil di atas
3. Klik foto untuk membuka file picker
4. Pilih foto dari komputer Anda
5. Foto otomatis terupload dan ditampilkan
6. Foto dinamis update di setiap halaman GUI

### Flow Guru (Buat Kode Unik Kelas)

1. Guru masuk ke dashboard guru (bagian Identitas
   Kelas)
2. Lihat input kode (belum terkunci)
3. **Pilih salah satu:**
   - **Auto-Generate**: Klik tombol
     "Auto-Generate" untuk buat kode 6 karakter
     random (format: XXX000)
   - **Manual**: Ketik kode sendiri (maksimal 6
     karakter, huruf besar & angka)
4. Klik tombol "✓ Simpan Kode" untuk menyimpan ke
   Supabase
5. Kode akan **terkunci** dan tidak bisa diubah
   lagi
6. Bagikan kode ini ke siswa-siswa Anda
7. Siswa gunakan kode saat login untuk mengakses
   kelas Anda

### Flow Siswa (Gunakan Kode Kelas)

1. Siswa buka halaman login-siswa
2. Masukkan kode kelas yang diberikan guru
   (format: XXXXXX)
3. Sistem validasi kode ke tabel `profiles` (field
   `kode_kelas`)
4. Jika cocok, siswa masuk ke dashboard siswa
   dengan akses ke kelas guru tersebut
5. Kode disimpan di localStorage sebagai session
   siswa

## Notes

- Hanya file untuk status "Sakit" yang diupload di
  siswa dashboard
- File tersimpan dengan nama random untuk keamanan
- Avatar disimpan dengan nama:
  `avatars/{user_id}.{ext}`
- **Kode kelas** disimpan di `profiles.kode_kelas`
  dan **hanya bisa disimpan 1 kali**
- Jika perlu ubah kode, hubungi admin untuk reset
  field `kode_kelas` di database
- URL sudah public jadi bisa diakses siapa saja
  (yang punya link)
- Avatar cached dengan timestamp query saat upload
  agar refresh otomatis
- Untuk setting storage lebih detail, lihat:
  https://supabase.com/docs/guides/storage

## Troubleshooting

**Q: File surat tidak bisa didownload**

- Cek apakah bucket `surat-sakit` sudah dibuat
- Verifikasi policies sudah benar di dashboard
  Supabase
- Pastikan URL di field `bukti_file` tidak kosong

**Q: Upload file surat error**

- Pastikan user (siswa) sudah terauthentikasi
  (login)
- Check console browser untuk error message
- Verifikasi bucket policy untuk INSERT sudah
  benar

**Q: File surat tidak muncul di dashboard guru**

- Refresh halaman
- Pastikan data absensi sudah insert ke tabel
  (check di Supabase SQL Editor)
- Verifikasi field `bukti_file` berisi URL yang
  valid

**Q: Avatar tidak bisa diupload**

- Pastikan bucket `avatars` sudah dibuat
- Verifikasi policies untuk INSERT dan UPDATE
  sudah benar
- Check console browser untuk error message
- Pastikan user sudah login

**Q: Avatar tidak muncul setelah upload**

- Hard refresh halaman (Ctrl+Shift+R)
- Cek di Supabase dashboard apakah file sudah
  terupload ke bucket `avatars`
- Pastikan URL di field `avatar_url` di tabel
  profiles berisi path yang benar
- Clear browser cache untuk file storage

**Q: Foto saya muncul di profil tapi tidak bisa
diubah**

- Reload halaman untuk refresh state
- Coba upload foto dengan ukuran lebih kecil (<
  5MB)
- Verifikasi policy UPDATE di bucket avatars sudah
  benar

**Q: Kode kelas tidak bisa disimpan**

- Pastikan user (guru) sudah login &
  terautentikasi
- Check console browser untuk error message
- Pastikan field `kode_kelas` di tabel `profiles`
  ada
- Verifikasi akses database user ke tabel profiles

**Q: Kode sudah terisi tapi tidak bisa diubah**

- **Ini normal!** Kode hanya bisa disimpan 1 kali
  untuk keamanan
- Jika perlu ubah kode, hubungi admin untuk:
  - Masuk ke Supabase SQL Editor
  - Run:
    `UPDATE profiles SET kode_kelas = NULL WHERE id = '[user_id]'`
  - Guru bisa input kode baru setelah itu

**Q: Siswa tidak bisa login dengan kode**

- Verifikasi kode yang diberikan guru sudah
  disimpan (lihat dashboard guru - harus ada
  checkmark ✓)
- Pastikan siswa mengetik kode dengan benar (huruf
  besar)
- Cek di Supabase SQL: query tabel siswa untuk
  verifikasi kode
- Pastikan nama kelas siswa cocok dengan nama
  kelas guru

**Q: Siswa login dengan kode tapi langsung error**

- Refresh halaman
- Clear localStorage browser (Ctrl+Shift+Delete →
  Cookies and Cached Files)
- Coba login ulang
- Check console browser untuk error detail
