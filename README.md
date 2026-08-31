# Portal Data Kependudukan & Geospasial Indonesia 2026

Aplikasi Web GIS & Sistem Manajemen Sosio-Demografi 38 Provinsi Indonesia dengan Database SQLite, Autentikasi Admin, Pembaruan Otomatis via PDF, dan Antarmuka Publik yang Simpel dan Modern.

---

## 🚀 Fitur Utama yang Telah Dirombak

### 1. 👥 Tampilan Publik Simpel & Tidak Bikin Pusing
- **Desain Bersih & Elegan**: Visual bertema *Executive GovTech* dengan tipografi yang nyaman dibaca dan tidak membingungkan masyarakat umum.
- **4 Banner KPI Nasional**: Ringkasan Total Penduduk Indonesia, Rata-Rata IPM, Tingkat Kemiskinan, dan Total Luas Wilayah.
- **Peta Interaktif 38 Provinsi**: Peta beresolusi tinggi dengan 5 mode metrik yang jelas:
  - 👥 **Jumlah Penduduk**
  - 🕌 **Mayoritas Agama**
  - 💼 **Mata Pencaharian & Sektor Ekonomi**
  - 📈 **Indeks Pembangunan Manusia (IPM)**
  - 📉 **Tingkat Kemiskinan (%)**
- **Pencarian Cerdas & Filter Pulau**: Pencarian otomatis ke seluruh 38 provinsi dengan zoom instan.
- **Profil Detail Provinsi**: Menampilkan persentase agama lengkap (Islam, Kristen, Katolik, Hindu, Buddha, Konghucu), mata pencaharian, komoditas unggulan, suku bangsa, dan indikator pembangunan.
- **Mode Terang & Gelap**: Tombol switch tema instan.

### 2. 🔐 Sistem Admin Login & Ganti Kredensial
- **Autentikasi Aman**: Menggunakan enkripsi PBKDF2 / SHA-512 dengan salt dinamis dan manajemen token sesi.
- **Kredensial Default Awal**:
  - **Username**: `admin`
  - **Password**: `admin123`
- **Fitur Ubah Kredensial**: Admin dapat mengganti username dan password kapan saja di menu *Ubah Username & Password* dengan verifikasi password lama.

### 3. 💾 Database SQLite Persisten
- Menggunakan database native `node:sqlite` (`server/data/portal_kependudukan.sqlite`).
- Menyimpan seluruh data 38 provinsi secara permanen, akun admin, serta riwayat log audit upload.

### 4. 📄 Pembaruan Data Otomatis via Upload PDF (Validasi Ketat)
- **Tombol Unduh Template PDF Resmi**: Admin dapat mengunduh file template PDF resmi (`Template_Pembaruan_Data_Jawa_Barat.pdf`) sebagai panduan.
- **Tombol Salin Format Teks**: Memudahkan penyalinan struktur format langsung ke clipboard.
- **Validasi Format Ketat**:
  - Validasi nama provinsi resmi dari 38 provinsi Indonesia.
  - Validasi total persentase seluruh agama = 100%.
  - Validasi keberadaan deskripsi mata pencaharian & sektor ekonomi.
  - Validasi nilai numerik (Jumlah penduduk, luas, IPM, kemiskinan).
  - Jika format tidak sesuai, sistem otomatis **menolak file** dan menampilkan daftar kesalahan baris demi baris.
- **Real-Time Live Sync**: Saat data berhasil diunggah, peta dan seluruh angka KPI otomatis diperbarui tanpa perlu memuat ulang halaman.

---

## 📋 Format Baku Template PDF

Dokumen PDF harus memuat blok data dengan struktur berikut:

```text
=======================================================
FORMAT RESMI PEMBARUAN DATA SOSIO-DEMOGRAFI PROVINSI
PORTAL KEPENDUDUKAN INDONESIA 2026
=======================================================
PROVINSI: Jawa Barat
IBUKOTA: Bandung
REGION: Jawa
JUMLAH_PENDUDUK: 50850000
LUAS_KM2: 35378
IPM: 75.10
KEMISKINAN_PERSEN: 7.35

[KOMPOSISI_AGAMA]
ISLAM: 97.10%
KRISTEN: 1.80%
KATOLIK: 0.65%
HINDU: 0.05%
BUDDHA: 0.20%
KONGHUCU: 0.20%

[SOSIO_EKONOMI]
MATA_PENCAHARIAN: Industri Manufaktur 45%, Pertanian & Perkebunan 30%, Perdagangan & Jasa 25%
SEKTOR_UNGGULAN: Manufaktur Otomotif & Elektronik, Tekstil, Agroindustri Teh & Padi
SUKU_MAYORITAS: Sunda, Jawa (Cirebon/Indramayu), Betawi
PDRB_KAPITA_JUTA: 57.8
JUMLAH_KAB_KOTA: 18 Kab, 9 Kota
=======================================================
```

---

## 💻 Cara Menjalankan Aplikasi

### Menjalankan Server Web & Database (Direkomendasikan):
Buka terminal pada direktori proyek dan jalankan:
```bash
node server.js
```
Akses aplikasi melalui browser di: **`http://localhost:3000`**

### Menjalankan Test Otomatis:
```bash
node test_system.js
```
