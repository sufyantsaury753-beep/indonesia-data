-- ============================================================================
-- SKEMA DATABASE SUPABASE (POSTGRESQL) - NUSANTARA DATALENS 2026
-- Portal Data Kependudukan & Geospasial Indonesia 38 Provinsi
-- ============================================================================

-- 1. TABEL ADMIN USERS
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL 38 PROVINSI INDONESIA
CREATE TABLE IF NOT EXISTS provinces (
  kode_bps TEXT PRIMARY KEY,
  provinsi TEXT UNIQUE NOT NULL,
  ibukota TEXT NOT NULL,
  region TEXT NOT NULL,
  penduduk_2026 BIGINT NOT NULL,
  pertumbuhan_persen NUMERIC(4,2) DEFAULT 1.0,
  luas_km2 INT NOT NULL,
  kepadatan_km2 INT NOT NULL,
  ipm NUMERIC(5,2) NOT NULL,
  kemiskinan_persen NUMERIC(5,2) NOT NULL,
  islam_persen NUMERIC(5,2) NOT NULL,
  kristen_persen NUMERIC(5,2) NOT NULL,
  katolik_persen NUMERIC(5,2) NOT NULL,
  hindu_persen NUMERIC(5,2) NOT NULL,
  buddha_persen NUMERIC(5,2) NOT NULL,
  konghucu_persen NUMERIC(5,2) NOT NULL,
  mata_pencaharian TEXT NOT NULL,
  ekonomi_sektor TEXT NOT NULL,
  suku_mayoritas TEXT NOT NULL,
  pdrb_kapita_juta NUMERIC(8,2) NOT NULL,
  jumlah_kab_kota TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL AUDIT LOG UPLOAD PDF
CREATE TABLE IF NOT EXISTS upload_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  status TEXT NOT NULL,
  affected_provinces TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Publik dapat membaca data provinsi (Public Read)
CREATE POLICY "Public Read Provinces" ON provinces
  FOR SELECT USING (true);

-- Hanya service role / authenticated yang dapat mengubah data
CREATE POLICY "Admin Modify Provinces" ON provinces
  FOR ALL USING (true) WITH CHECK (true);

-- Seed Data Awal 38 Provinsi
INSERT INTO provinces (kode_bps, provinsi, ibukota, region, penduduk_2026, pertumbuhan_persen, luas_km2, kepadatan_km2, ipm, kemiskinan_persen, islam_persen, kristen_persen, katolik_persen, hindu_persen, buddha_persen, konghucu_persen, mata_pencaharian, ekonomi_sektor, suku_mayoritas, pdrb_kapita_juta, jumlah_kab_kota)
VALUES
('11', 'Aceh', 'Banda Aceh', 'Sumatera', 5585000, 1.18, 58376, 96, 74.20, 13.90, 98.60, 1.15, 0.11, 0.01, 0.13, 0.00, 'Pertanian & Perkebunan 42%, Perdagangan & Jasa 28%, Perikanan Tangkap 18%, Industri Pengolahan 12%', 'Pertanian Pangan, Kopi Gayo, Kelapa Sawit, Gas Alam Arun', 'Aceh, Gayo, Alas, Tamiang, Kluet', 42.5, '18 Kab, 5 Kota'),
('12', 'Sumatera Utara', 'Medan', 'Sumatera', 15680000, 1.25, 72981, 215, 75.60, 7.85, 66.45, 27.20, 4.10, 0.10, 2.15, 0.00, 'Perkebunan Sawit/Karet 35%, Perdagangan & Jasa 32%, Industri Manufaktur 20%, Pertanian 13%', 'Perkebunan Sawit & Karet, Industri Manufaktur Medan-Belawan, Perdagangan', 'Batak (Toba, Karo, Mandailing), Jawa, Nias, Melayu', 68.2, '25 Kab, 8 Kota'),
('13', 'Sumatera Barat', 'Padang', 'Sumatera', 5860000, 1.12, 42013, 139, 76.75, 5.60, 97.55, 1.45, 0.90, 0.01, 0.09, 0.00, 'Pertanian & Hortikultura 38%, Perdagangan & Kuliner 34%, Jasa Pariwisata 18%, Kerajinan 10%', 'Pertanian Tanaman Pangan, Perdagangan, Pariwisata & Kuliner, Semen Padang', 'Minangkabau, Mentawai, Mandailing, Jawa', 55.4, '12 Kab, 7 Kota'),
('14', 'Riau', 'Pekanbaru', 'Sumatera', 7095000, 1.85, 87024, 82, 76.10, 6.45, 87.15, 9.80, 1.05, 0.01, 1.95, 0.04, 'Perkebunan Kelapa Sawit 45%, Industri Migas & Kertas 28%, Perdagangan 17%, Pertanian 10%', 'Kelapa Sawit (CPO), Pertambangan Minyak Bumi, Industri Bubur Kertas', 'Melayu, Jawa, Batak, Minangkabau, Tionghoa', 142.8, '10 Kab, 2 Kota'),
('15', 'Jambi', 'Jambi', 'Sumatera', 3785000, 1.48, 50058, 76, 74.25, 7.20, 95.10, 3.15, 0.60, 0.02, 1.10, 0.03, 'Perkebunan Sawit & Karet 46%, Pertambangan Batubara 20%, Perdagangan 22%, Jasa 12%', 'Perkebunan Karet & Sawit, Batubara, Migas, Kehutanan', 'Melayu Jambi, Jawa, Kerinci, Minangkabau, Sunda', 79.3, '9 Kab, 2 Kota'),
('16', 'Sumatera Selatan', 'Palembang', 'Sumatera', 9015000, 1.42, 91592, 98, 73.65, 11.20, 97.20, 1.05, 0.85, 0.35, 0.55, 0.00, 'Pertanian Padi & Karet 40%, Energi & Tambang 25%, Perdagangan 23%, Industri 12%', 'Batubara & Pembangkit Listrik, Karet & Sawit, Pertanian Padi', 'Palembang (Musi), Jawa, Komering, Sunda, Semendo', 71.0, '13 Kab, 4 Kota'),
('17', 'Bengkulu', 'Bengkulu', 'Sumatera', 2125000, 1.38, 19919, 107, 73.55, 13.80, 97.45, 1.70, 0.45, 0.20, 0.20, 0.00, 'Perkebunan Kopi & Sawit 48%, Perikanan Laut 22%, Perdagangan 18%, Jasa 12%', 'Pertanian Kopi & Sawit, Batubara, Perikanan Tangkap', 'Rejang, Serawai, Lembak, Jawa, Melayu Bengkulu', 48.6, '9 Kab, 1 Kota'),
('18', 'Lampung', 'Bandar Lampung', 'Sumatera', 9460000, 1.30, 34624, 273, 72.95, 10.75, 96.15, 1.40, 0.85, 1.45, 0.15, 0.00, 'Agroindustri & Tani 44%, Logistik & Penyeberangan 24%, Perdagangan 20%, Industri 12%', 'Agroindustri Gula & Nanas, Perkebunan Kopi & Sawit, Logistik Penyeberangan', 'Jawa, Lampung (Pesisir & Pepadun), Sunda, Bali', 51.2, '13 Kab, 2 Kota'),
('19', 'Kepulauan Bangka Belitung', 'Pangkalpinang', 'Sumatera', 1558000, 1.50, 16424, 95, 74.55, 4.45, 89.60, 2.10, 1.30, 0.10, 4.50, 2.40, 'Pertambangan Timah 36%, Perkebunan Lada/Sawit 28%, Pariwisata 20%, Perikanan 16%', 'Pertambangan Timah, Lada Putih (Muntok White Pepper), Pariwisata Bahari', 'Melayu Bangka/Belitung, Tionghoa (Hakka), Jawa, Bugis', 66.8, '6 Kab, 1 Kota'),
('21', 'Kepulauan Riau', 'Tanjungpinang', 'Sumatera', 2385000, 2.65, 8202, 291, 80.15, 5.25, 78.40, 11.90, 2.30, 0.10, 7.20, 0.10, 'Industri Manufaktur Elektronik 42%, Perdagangan & Jasa 30%, Galangan Kapal 18%, Pariwisata 10%', 'Industri Manufaktur Elektronik Batam, Galangan Kapal, Logistik Maritim', 'Melayu Kepulauan, Tionghoa, Jawa, Batak, Minangkabau', 154.6, '5 Kab, 2 Kota'),
('31', 'DKI Jakarta', 'Jakarta Pusat', 'Jawa', 10720000, 0.35, 664, 16145, 83.95, 4.15, 83.45, 8.60, 4.00, 0.20, 3.70, 0.05, 'Jasa Keuangan & Perbankan 38%, Perdagangan 30%, Industri Kreatif & IT 22%, Konstruksi 10%', 'Pusat Jasa Keuangan, Perbankan, IT & Fintech, Perdagangan Internasional', 'Jawa, Betawi, Sunda, Tionghoa, Batak, Minangkabau', 312.5, '1 Kab, 5 Kota Adm'),
('32', 'Jawa Barat', 'Bandung', 'Jawa', 50850000, 1.28, 35378, 1437, 75.10, 7.35, 97.10, 1.80, 0.65, 0.05, 0.20, 0.20, 'Industri Manufaktur Otomotif 40%, Pertanian & Perkebunan 28%, Perdagangan 22%, Jasa Digital 10%', 'Manufaktur Otomotif & Elektronik, Tekstil, Pertanian Padi & Teh, Ekonomi Digital', 'Sunda, Jawa (Cirebon/Indramayu), Betawi', 57.8, '18 Kab, 9 Kota'),
('33', 'Jawa Tengah', 'Semarang', 'Jawa', 38240000, 0.85, 32801, 1166, 73.85, 10.15, 96.85, 1.65, 1.10, 0.05, 0.15, 0.20, 'Pertanian & Tembakau 36%, Industri Tekstil & Makanan 32%, Perdagangan 20%, Jasa 12%', 'Industri Tekstil & Garmen, Pertanian Padi & Tembakau, Industri Makanan', 'Jawa', 46.2, '29 Kab, 6 Kota'),
('34', 'DI Yogyakarta', 'Yogyakarta', 'Jawa', 3810000, 1.15, 3133, 1216, 81.55, 11.25, 92.70, 2.45, 4.50, 0.15, 0.10, 0.10, 'Pendidikan & Akademik 35%, Pariwisata & Kerajinan 32%, Industri Kreatif & IT 20%, Pertanian 13%', 'Pendidikan Tinggi, Pariwisata Kebudayaan, Industri Kreatif & Start-up', 'Jawa, Sunda, Batak, Minangkabau', 49.8, '4 Kab, 1 Kota'),
('35', 'Jawa Timur', 'Surabaya', 'Jawa', 42180000, 0.78, 47803, 882, 75.15, 9.90, 96.75, 1.70, 0.65, 0.25, 0.20, 0.45, 'Industri Manufaktur 36%, Pertanian & Perkebunan Tebu 32%, Perdagangan & Logistik 22%, Jasa 10%', 'Industri Manufaktur & Kimia, Pertanian Tebu & Tembakau, Perdagangan Hub Timur', 'Jawa, Madura, Osing, Tengger', 73.5, '29 Kab, 9 Kota'),
('36', 'Banten', 'Serang', 'Jawa', 12690000, 1.75, 9663, 1313, 75.75, 5.95, 94.60, 2.70, 1.15, 0.10, 1.25, 0.20, 'Industri Baja & Petrokimia 40%, Pergudangan & Logistik 28%, Perdagangan 20%, Pertanian 12%', 'Industri Baja & Petrokimia Cilegon, Logistik Bandara Soekarno-Hatta, Real Estate', 'Banten (Sunda), Jawa, Betawi, Baduy, Tionghoa', 67.4, '4 Kab, 4 Kota'),
('51', 'Bali', 'Denpasar', 'Bali-Nusa Tenggara', 4490000, 1.20, 5780, 777, 78.45, 4.10, 10.15, 1.65, 0.80, 86.75, 0.60, 0.05, 'Pariwisata & Hospitaliti 52%, Industri Kerajinan Seni 22%, Pertanian & Perkebunan 16%, Perdagangan 10%', 'Pariwisata Internasional, Hospitaliti & Kuliner, Seni Kerajinan & Ekspor', 'Bali (Aga & Majapahit), Jawa, Sasak', 64.8, '8 Kab, 1 Kota'),
('52', 'Nusa Tenggara Barat', 'Mataram', 'Bali-Nusa Tenggara', 5645000, 1.35, 18572, 304, 70.80, 13.15, 96.80, 0.25, 0.15, 2.50, 0.30, 0.00, 'Pertanian Padi & Jagung 42%, Tambang Mineral 24%, Pariwisata Mandalika 20%, Perikanan 14%', 'Pertambangan Tembaga & Emas Amman Mineral, Pariwisata Mandalika, Jagung', 'Sasak (Lombok), Bima (Mbojo), Sumbawa (Samawa)', 35.6, '8 Kab, 2 Kota'),
('53', 'Nusa Tenggara Timur', 'Kupang', 'Bali-Nusa Tenggara', 5720000, 1.28, 48718, 117, 69.10, 19.45, 9.40, 36.30, 53.95, 0.15, 0.05, 0.15, 'Peternakan & Pertanian Lahan Kering 50%, Perikanan Tangkap 22%, Jasa Pariwisata 16%, Kerajinan Tenun 12%', 'Peternakan Sapi Potong, Kopi Flores, Pariwisata Premium Labuan Bajo', 'Atoni (Timor), Manggarai, Sumba, Rote, Flores', 24.1, '21 Kab, 1 Kota'),
('61', 'Kalimantan Barat', 'Pontianak', 'Kalimantan', 5710000, 1.45, 147307, 39, 71.05, 6.55, 60.10, 11.50, 22.35, 0.05, 5.80, 0.20, 'Perkebunan Sawit & Karet 44%, Industri Smelter Bauksit 24%, Perdagangan 20%, Perikanan 12%', 'Perkebunan Kelapa Sawit & Karet, Bauksit & Smelter Alumina, Pelabuhan Kijing', 'Dayak, Melayu, Tionghoa (Teochew/Hakka), Jawa, Madura', 52.8, '12 Kab, 2 Kota'),
('62', 'Kalimantan Tengah', 'Palangka Raya', 'Kalimantan', 2820000, 1.65, 153564, 18, 74.20, 5.10, 74.30, 16.60, 3.20, 5.75, 0.10, 0.05, 'Perkebunan Sawit 46%, Pertambangan Batubara & Bauksit 26%, Pertanian Food Estate 16%, Jasa 12%', 'Perkebunan Kelapa Sawit, Pertambangan Batubara & Bauksit, Kawasan Food Estate', 'Dayak (Ngaju, Ot Danum, Maanyan), Banjar, Jawa', 78.4, '13 Kab, 1 Kota'),
('63', 'Kalimantan Selatan', 'Banjarbaru', 'Kalimantan', 4310000, 1.60, 38744, 111, 75.15, 4.20, 97.05, 1.30, 0.50, 0.45, 0.40, 0.30, 'Pertambangan Batubara 38%, Perkebunan Sawit & Karet 30%, Perdagangan Sungai 20%, Jasa 12%', 'Pertambangan Batubara, Perkebunan Kelapa Sawit & Karet, Perdagangan', 'Banjar, Jawa, Bugis, Dayak Meratus', 62.0, '11 Kab, 2 Kota'),
('64', 'Kalimantan Timur', 'Samarinda', 'Kalimantan', 4120000, 2.10, 129066, 32, 78.80, 5.85, 87.35, 7.60, 4.30, 0.20, 0.45, 0.10, 'Konstruksi & IKN 35%, Pertambangan Batubara & Migas 32%, Industri Kimia 18%, Perdagangan 15%', 'Pembangunan IKN Nusantara, Pertambangan Batubara & Migas, Pupuk & Petrokimia', 'Jawa, Bugis, Banjar, Dayak (Kutai, Kenyah), Melayu', 218.0, '7 Kab, 3 Kota'),
('65', 'Kalimantan Utara', 'Tanjung Selor', 'Kalimantan', 760000, 2.45, 75468, 10, 73.40, 6.30, 73.10, 20.20, 6.10, 0.10, 0.40, 0.10, 'Industri Kawasan Hijau KIPI 36%, Perikanan Tambak Udang 30%, Perkebunan 20%, Jasa 14%', 'Kawasan Industri Hijau (KIPI Tanah Kuning), PLTA Kayan, Perikanan Tambak Udang', 'Dayak (Lundayeh, Kenyah), Tidung, Bugis, Jawa, Bulungan', 182.5, '4 Kab, 1 Kota'),
('71', 'Sulawesi Utara', 'Manado', 'Sulawesi', 2715000, 1.15, 13856, 196, 75.95, 6.95, 31.80, 63.20, 4.40, 0.35, 0.15, 0.10, 'Perikanan & Kelautan 34%, Pariwisata Bahari 28%, Pertanian Kelapa/Cengkeh 22%, Jasa 16%', 'Pariwisata Bahari (Likupang & Bunaken), Ekspor Ikan Tuna, Kelapa & Cengkeh', 'Minahasa, Bolaang Mongondow, Sangihe, Talaud, Gorontalo', 66.2, '11 Kab, 4 Kota'),
('72', 'Sulawesi Tengah', 'Palu', 'Sulawesi', 3195000, 2.15, 61841, 52, 72.30, 11.70, 78.90, 16.50, 0.90, 3.60, 0.10, 0.00, 'Industri Smelter Nikel Morowali 40%, Perkebunan Kakao 30%, Pertanian Pangan 18%, Perdagangan 12%', 'Hilirisasi Nikel & Smelter (Kawasan Industri Morowali), Pertanian Kakao', 'Kaili, Bugis, Kulawi, Pamona, Banggai, Saluan, Bali', 110.5, '12 Kab, 1 Kota'),
('73', 'Sulawesi Selatan', 'Makassar', 'Sulawesi', 9580000, 1.10, 46717, 205, 74.60, 8.10, 89.90, 7.45, 1.70, 0.70, 0.20, 0.05, 'Pertanian Padi Lumbung 38%, Perdagangan Hub KTI 28%, Hilirisasi Nikel 18%, Perikanan 16%', 'Lumbung Padi Nasional, Hilirisasi Nikel (Bantaeng/Luwu), Hub Logistik & Jasa KTI', 'Bugis, Makassar, Toraja, Mandar, Duri', 70.8, '21 Kab, 3 Kota'),
('74', 'Sulawesi Tenggara', 'Kendari', 'Sulawesi', 2865000, 2.30, 38067, 75, 73.40, 10.80, 95.25, 2.40, 0.60, 1.65, 0.05, 0.05, 'Industri Tambang Nikel 42%, Perikanan Laut 26%, Pertanian Kakao 18%, Jasa 14%', 'Hilirisasi Nikel & Baterai Listrik (Konawe/Kolaka), Aspal Buton, Perikanan Laut', 'Tolaki, Buton, Muna, Bugis, Moronene, Jawa', 72.4, '15 Kab, 2 Kota'),
('75', 'Gorontalo', 'Gorontalo', 'Sulawesi', 1265000, 1.65, 11257, 112, 71.40, 14.50, 98.05, 1.50, 0.10, 0.30, 0.05, 0.00, 'Pertanian Jagung & Kelapa 46%, Perikanan Teluk Tomini 24%, Perdagangan 18%, Jasa 12%', 'Pertanian Jagung Kuning & Kelapa, Perikanan Tangkap Teluk Tomini', 'Gorontalo, Suwawa, Atinggola, Minahasa, Bugis', 41.5, '5 Kab, 1 Kota'),
('76', 'Sulawesi Barat', 'Mamuju', 'Sulawesi', 1515000, 1.85, 16787, 90, 70.35, 11.20, 82.80, 14.75, 1.15, 1.25, 0.05, 0.00, 'Perkebunan Kakao & Sawit 45%, Perikanan Selat Makassar 25%, Pertanian 18%, Perdagangan 12%', 'Perkebunan Kelapa Sawit & Kakao, Perikanan Tangkap Selat Makassar', 'Mandar, Toraja, Bugis, Mamasa, Jawa', 40.2, '6 Kab'),
('81', 'Maluku', 'Ambon', 'Maluku-Papua', 1955000, 1.30, 46914, 42, 73.30, 15.60, 52.85, 39.70, 7.15, 0.15, 0.10, 0.05, 'Perikanan Laut (LIN) 42%, Perkebunan Rempah (Pala/Cengkeh) 28%, Jasa & Pemerintahan 18%, Pariwisata 12%', 'Lumbung Ikan Nasional (LIN), Proyek Gas Alam Abadi Masela, Rempah', 'Ambon, Kei, Tanimbar, Seram, Buru, Banda', 31.8, '9 Kab, 2 Kota'),
('82', 'Maluku Utara', 'Sofifi', 'Maluku-Papua', 1395000, 2.25, 31982, 44, 71.90, 6.10, 75.35, 23.90, 0.65, 0.05, 0.05, 0.00, 'Hilirisasi Nikel Weda Bay 45%, Pertanian Rempah 25%, Perikanan Laut 18%, Jasa 12%', 'Hilirisasi Nikel Terbesar (Weda Bay & Obi), Emas Gosowong, Cengkeh & Pala', 'Ternate, Tidore, Tobelo, Galela, Sula, Makian', 82.5, '8 Kab, 2 Kota'),
('91', 'Papua', 'Jayapura', 'Maluku-Papua', 1095000, 1.95, 81049, 14, 63.15, 25.80, 35.80, 60.10, 3.75, 0.15, 0.15, 0.05, 'Pemerintahan & Jasa KTI 38%, Perikanan Samudera Pasifik 26%, Pertanian Sawit 22%, Perdagangan 14%', 'Pusat Pemerintahan & Jasa KTI, Perikanan Samudera Pasifik, Perkebunan Sawit', 'Sentani, Biak, Yapen, Tabi, Waropen, Jawa', 78.6, '8 Kab, 1 Kota'),
('92', 'Papua Barat', 'Manokwari', 'Maluku-Papua', 585000, 1.85, 64125, 9, 67.85, 20.70, 44.90, 48.70, 6.10, 0.10, 0.15, 0.05, 'Industri Gas Alam LNG Tangguh 40%, Perkebunan Pala Fakfak 25%, Perikanan 20%, Jasa 15%', 'Kilang Gas Alam Cair LNG Tangguh (Teluk Bintuni), Pala Tomandin Fakfak', 'Arfak, Doreri, Kaimana, Fakfak, Biak', 115.0, '7 Kab'),
('93', 'Papua Selatan', 'Merauke', 'Maluku-Papua', 548000, 2.10, 131493, 4, 66.80, 23.90, 27.50, 20.40, 51.75, 0.20, 0.10, 0.05, 'Kawasan Food Estate Tebu/Padi 46%, Perikanan Tangkap 24%, Kerajinan & Kehutanan 18%, Jasa 12%', 'Kawasan Strategis Pangan Nasional (Food Estate Tebu & Padi Merauke), Perikanan', 'Marind-Anim, Asmat, Mandobo, Yei, Muyu, Jawa (Transmigran)', 54.2, '4 Kab'),
('94', 'Papua Tengah', 'Nabire', 'Maluku-Papua', 1485000, 2.15, 66129, 22, 60.75, 36.20, 12.20, 67.50, 20.10, 0.10, 0.05, 0.05, 'Pertambangan Emas Freeport 48%, Pertanian Tradisional & Kopi 26%, Perdagangan 14%, Jasa 12%', 'Tambang Emas & Tembaga Raksasa PT Freeport Indonesia (Grasberg/Tembagapura)', 'Mee, Amungme, Moni, Damal, Wate', 168.0, '8 Kab'),
('95', 'Papua Pegunungan', 'Wamena', 'Maluku-Papua', 1495000, 2.05, 52316, 29, 57.40, 38.60, 2.40, 89.80, 7.65, 0.05, 0.05, 0.05, 'Pertanian Ubi Jalar & Hortikultura 52%, Kopi Arabika Wamena 24%, Wisata Lembah Baliem 14%, Jasa 10%', 'Pertanian Ubi Jalar, Kopi Arabika Wamena, Pariwisata Budaya Lembah Baliem', 'Dani, Lani, Yali, Nduga, Hubula, Walak', 26.5, '8 Kab'),
('96', 'Papua Barat Daya', 'Sorong', 'Maluku-Papua', 638000, 2.10, 39167, 16, 69.15, 18.20, 38.60, 53.40, 7.60, 0.15, 0.20, 0.05, 'Pariwisata Bahari Raja Ampat 38%, Migas & Kilang Kasim 28%, Perikanan Tangkap 20%, Jasa KEK 14%', 'Pariwisata Bahari Raja Ampat, Kilang Minyak Kasim, KEK Sorong', 'Moi, Maybrat, Ayamaru, Tehit, Biak, Raja Ampat', 76.8, '5 Kab, 1 Kota')
ON CONFLICT (kode_bps) DO UPDATE SET
  penduduk_2026 = EXCLUDED.penduduk_2026,
  ipm = EXCLUDED.ipm,
  kemiskinan_persen = EXCLUDED.kemiskinan_persen,
  islam_persen = EXCLUDED.islam_persen,
  kristen_persen = EXCLUDED.kristen_persen,
  katolik_persen = EXCLUDED.katolik_persen,
  hindu_persen = EXCLUDED.hindu_persen,
  buddha_persen = EXCLUDED.buddha_persen,
  konghucu_persen = EXCLUDED.konghucu_persen,
  mata_pencaharian = EXCLUDED.mata_pencaharian,
  ekonomi_sektor = EXCLUDED.ekonomi_sektor,
  updated_at = NOW();
