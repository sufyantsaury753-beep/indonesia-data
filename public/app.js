/**
 * Nusantara DataLens — Frontend Application Logic
 * Portal Data Kependudukan & Geospasial Indonesia 2026
 * 100% Autonomous (Static GitHub Pages + Local SQLite API Support)
 */

// Embedded Official 38 Provinces Dataset for Instant Loading
const INITIAL_PROVINCES_DATA = {
  "Aceh": {
    "kode_bps": "11", "provinsi": "Aceh", "ibukota": "Banda Aceh", "region": "Sumatera",
    "penduduk_2026": 5585000, "pertumbuhan_persen": 1.18, "luas_km2": 58376, "kepadatan_km2": 96,
    "ipm": 74.2, "kemiskinan_persen": 13.9, "islam_persen": 98.6, "kristen_persen": 1.15,
    "katolik_persen": 0.11, "hindu_persen": 0.01, "buddha_persen": 0.13, "konghucu_persen": 0.0,
    "mata_pencaharian": "Pertanian & Perkebunan 42%, Perdagangan & Jasa 28%, Perikanan Tangkap 18%, Industri Pengolahan 12%",
    "ekonomi_sektor": "Pertanian Pangan, Kopi Gayo, Kelapa Sawit, Gas Alam Arun",
    "suku_mayoritas": "Aceh, Gayo, Alas, Tamiang, Kluet", "pdrb_kapita_juta": 42.5, "jumlah_kab_kota": "18 Kab, 5 Kota"
  },
  "Sumatera Utara": {
    "kode_bps": "12", "provinsi": "Sumatera Utara", "ibukota": "Medan", "region": "Sumatera",
    "penduduk_2026": 15680000, "pertumbuhan_persen": 1.25, "luas_km2": 72981, "kepadatan_km2": 215,
    "ipm": 75.6, "kemiskinan_persen": 7.85, "islam_persen": 66.45, "kristen_persen": 27.2,
    "katolik_persen": 4.1, "hindu_persen": 0.1, "buddha_persen": 2.15, "konghucu_persen": 0.0,
    "mata_pencaharian": "Perkebunan Sawit/Karet 35%, Perdagangan & Jasa 32%, Industri Manufaktur 20%, Pertanian 13%",
    "ekonomi_sektor": "Perkebunan Sawit & Karet, Industri Manufaktur Medan-Belawan, Perdagangan",
    "suku_mayoritas": "Batak (Toba, Karo, Mandailing), Jawa, Nias, Melayu", "pdrb_kapita_juta": 68.2, "jumlah_kab_kota": "25 Kab, 8 Kota"
  },
  "Sumatera Barat": {
    "kode_bps": "13", "provinsi": "Sumatera Barat", "ibukota": "Padang", "region": "Sumatera",
    "penduduk_2026": 5860000, "pertumbuhan_persen": 1.12, "luas_km2": 42013, "kepadatan_km2": 139,
    "ipm": 76.75, "kemiskinan_persen": 5.6, "islam_persen": 97.55, "kristen_persen": 1.45,
    "katolik_persen": 0.9, "hindu_persen": 0.01, "buddha_persen": 0.09, "konghucu_persen": 0.0,
    "mata_pencaharian": "Pertanian & Hortikultura 38%, Perdagangan & Kuliner 34%, Jasa Pariwisata 18%, Kerajinan 10%",
    "ekonomi_sektor": "Pertanian Tanaman Pangan, Perdagangan, Pariwisata & Kuliner, Semen Padang",
    "suku_mayoritas": "Minangkabau, Mentawai, Mandailing, Jawa", "pdrb_kapita_juta": 55.4, "jumlah_kab_kota": "12 Kab, 7 Kota"
  },
  "Riau": {
    "kode_bps": "14", "provinsi": "Riau", "ibukota": "Pekanbaru", "region": "Sumatera",
    "penduduk_2026": 7095000, "pertumbuhan_persen": 1.85, "luas_km2": 87024, "kepadatan_km2": 82,
    "ipm": 76.1, "kemiskinan_persen": 6.45, "islam_persen": 87.15, "kristen_persen": 9.8,
    "katolik_persen": 1.05, "hindu_persen": 0.01, "buddha_persen": 1.95, "konghucu_persen": 0.04,
    "mata_pencaharian": "Perkebunan Kelapa Sawit 45%, Industri Migas & Kertas 28%, Perdagangan 17%, Pertanian 10%",
    "ekonomi_sektor": "Kelapa Sawit (CPO), Pertambangan Minyak Bumi, Industri Bubur Kertas",
    "suku_mayoritas": "Melayu, Jawa, Batak, Minangkabau, Tionghoa", "pdrb_kapita_juta": 142.8, "jumlah_kab_kota": "10 Kab, 2 Kota"
  },
  "Jambi": {
    "kode_bps": "15", "provinsi": "Jambi", "ibukota": "Jambi", "region": "Sumatera",
    "penduduk_2026": 3785000, "pertumbuhan_persen": 1.48, "luas_km2": 50058, "kepadatan_km2": 76,
    "ipm": 74.25, "kemiskinan_persen": 7.2, "islam_persen": 95.1, "kristen_persen": 3.15,
    "katolik_persen": 0.6, "hindu_persen": 0.02, "buddha_persen": 1.1, "konghucu_persen": 0.03,
    "mata_pencaharian": "Perkebunan Sawit & Karet 46%, Pertambangan Batubara 20%, Perdagangan 22%, Jasa 12%",
    "ekonomi_sektor": "Perkebunan Karet & Sawit, Batubara, Migas, Kehutanan",
    "suku_mayoritas": "Melayu Jambi, Jawa, Kerinci, Minangkabau, Sunda", "pdrb_kapita_juta": 79.3, "jumlah_kab_kota": "9 Kab, 2 Kota"
  },
  "Sumatera Selatan": {
    "kode_bps": "16", "provinsi": "Sumatera Selatan", "ibukota": "Palembang", "region": "Sumatera",
    "penduduk_2026": 9015000, "pertumbuhan_persen": 1.42, "luas_km2": 91592, "kepadatan_km2": 98,
    "ipm": 73.65, "kemiskinan_persen": 11.2, "islam_persen": 97.2, "kristen_persen": 1.05,
    "katolik_persen": 0.85, "hindu_persen": 0.35, "buddha_persen": 0.55, "konghucu_persen": 0.0,
    "mata_pencaharian": "Pertanian Padi & Karet 40%, Energi & Tambang 25%, Perdagangan 23%, Industri 12%",
    "ekonomi_sektor": "Batubara & Pembangkit Listrik, Karet & Sawit, Pertanian Padi",
    "suku_mayoritas": "Palembang (Musi), Jawa, Komering, Sunda, Semendo", "pdrb_kapita_juta": 71.0, "jumlah_kab_kota": "13 Kab, 4 Kota"
  },
  "Bengkulu": {
    "kode_bps": "17", "provinsi": "Bengkulu", "ibukota": "Bengkulu", "region": "Sumatera",
    "penduduk_2026": 2125000, "pertumbuhan_persen": 1.38, "luas_km2": 19919, "kepadatan_km2": 107,
    "ipm": 73.55, "kemiskinan_persen": 13.8, "islam_persen": 97.45, "kristen_persen": 1.7,
    "katolik_persen": 0.45, "hindu_persen": 0.2, "buddha_persen": 0.2, "konghucu_persen": 0.0,
    "mata_pencaharian": "Perkebunan Kopi & Sawit 48%, Perikanan Laut 22%, Perdagangan 18%, Jasa 12%",
    "ekonomi_sektor": "Pertanian Kopi & Sawit, Batubara, Perikanan Tangkap",
    "suku_mayoritas": "Rejang, Serawai, Lembak, Jawa, Melayu Bengkulu", "pdrb_kapita_juta": 48.6, "jumlah_kab_kota": "9 Kab, 1 Kota"
  },
  "Lampung": {
    "kode_bps": "18", "provinsi": "Lampung", "ibukota": "Bandar Lampung", "region": "Sumatera",
    "penduduk_2026": 9460000, "pertumbuhan_persen": 1.3, "luas_km2": 34624, "kepadatan_km2": 273,
    "ipm": 72.95, "kemiskinan_persen": 10.75, "islam_persen": 96.15, "kristen_persen": 1.4,
    "katolik_persen": 0.85, "hindu_persen": 1.45, "buddha_persen": 0.15, "konghucu_persen": 0.0,
    "mata_pencaharian": "Agroindustri & Tani 44%, Logistik & Penyeberangan 24%, Perdagangan 20%, Industri 12%",
    "ekonomi_sektor": "Agroindustri Gula & Nanas, Perkebunan Kopi & Sawit, Logistik Penyeberangan",
    "suku_mayoritas": "Jawa, Lampung (Pesisir & Pepadun), Sunda, Bali", "pdrb_kapita_juta": 51.2, "jumlah_kab_kota": "13 Kab, 2 Kota"
  },
  "Kepulauan Bangka Belitung": {
    "kode_bps": "19", "provinsi": "Kepulauan Bangka Belitung", "ibukota": "Pangkalpinang", "region": "Sumatera",
    "penduduk_2026": 1558000, "pertumbuhan_persen": 1.5, "luas_km2": 16424, "kepadatan_km2": 95,
    "ipm": 74.55, "kemiskinan_persen": 4.45, "islam_persen": 89.6, "kristen_persen": 2.1,
    "katolik_persen": 1.3, "hindu_persen": 0.1, "buddha_persen": 4.5, "konghucu_persen": 2.4,
    "mata_pencaharian": "Pertambangan Timah 36%, Perkebunan Lada/Sawit 28%, Pariwisata 20%, Perikanan 16%",
    "ekonomi_sektor": "Pertambangan Timah, Lada Putih (Muntok White Pepper), Pariwisata Bahari",
    "suku_mayoritas": "Melayu Bangka/Belitung, Tionghoa (Hakka), Jawa, Bugis", "pdrb_kapita_juta": 66.8, "jumlah_kab_kota": "6 Kab, 1 Kota"
  },
  "Kepulauan Riau": {
    "kode_bps": "21", "provinsi": "Kepulauan Riau", "ibukota": "Tanjungpinang", "region": "Sumatera",
    "penduduk_2026": 2385000, "pertumbuhan_persen": 2.65, "luas_km2": 8202, "kepadatan_km2": 291,
    "ipm": 80.15, "kemiskinan_persen": 5.25, "islam_persen": 78.4, "kristen_persen": 11.9,
    "katolik_persen": 2.3, "hindu_persen": 0.1, "buddha_persen": 7.2, "konghucu_persen": 0.1,
    "mata_pencaharian": "Industri Manufaktur Elektronik 42%, Perdagangan & Jasa 30%, Galangan Kapal 18%, Pariwisata 10%",
    "ekonomi_sektor": "Industri Manufaktur Elektronik Batam, Galangan Kapal, Logistik Maritim",
    "suku_mayoritas": "Melayu Kepulauan, Tionghoa, Jawa, Batak, Minangkabau", "pdrb_kapita_juta": 154.6, "jumlah_kab_kota": "5 Kab, 2 Kota"
  },
  "DKI Jakarta": {
    "kode_bps": "31", "provinsi": "DKI Jakarta", "ibukota": "Jakarta Pusat", "region": "Jawa",
    "penduduk_2026": 10720000, "pertumbuhan_persen": 0.35, "luas_km2": 664, "kepadatan_km2": 16145,
    "ipm": 83.95, "kemiskinan_persen": 4.15, "islam_persen": 83.45, "kristen_persen": 8.6,
    "katolik_persen": 4.0, "hindu_persen": 0.2, "buddha_persen": 3.7, "konghucu_persen": 0.05,
    "mata_pencaharian": "Jasa Keuangan & Perbankan 38%, Perdagangan 30%, Industri Kreatif & IT 22%, Konstruksi 10%",
    "ekonomi_sektor": "Pusat Jasa Keuangan, Perbankan, IT & Fintech, Perdagangan Internasional",
    "suku_mayoritas": "Jawa, Betawi, Sunda, Tionghoa, Batak, Minangkabau", "pdrb_kapita_juta": 312.5, "jumlah_kab_kota": "1 Kab, 5 Kota Adm"
  },
  "Jawa Barat": {
    "kode_bps": "32", "provinsi": "Jawa Barat", "ibukota": "Bandung", "region": "Jawa",
    "penduduk_2026": 50850000, "pertumbuhan_persen": 1.28, "luas_km2": 35378, "kepadatan_km2": 1437,
    "ipm": 75.1, "kemiskinan_persen": 7.35, "islam_persen": 97.1, "kristen_persen": 1.8,
    "katolik_persen": 0.65, "hindu_persen": 0.05, "buddha_persen": 0.2, "konghucu_persen": 0.2,
    "mata_pencaharian": "Industri Manufaktur Otomotif 40%, Pertanian & Perkebunan 28%, Perdagangan 22%, Jasa Digital 10%",
    "ekonomi_sektor": "Manufaktur Otomotif & Elektronik, Tekstil, Pertanian Padi & Teh, Ekonomi Digital",
    "suku_mayoritas": "Sunda, Jawa (Cirebon/Indramayu), Betawi", "pdrb_kapita_juta": 57.8, "jumlah_kab_kota": "18 Kab, 9 Kota"
  },
  "Jawa Tengah": {
    "kode_bps": "33", "provinsi": "Jawa Tengah", "ibukota": "Semarang", "region": "Jawa",
    "penduduk_2026": 38240000, "pertumbuhan_persen": 0.85, "luas_km2": 32801, "kepadatan_km2": 1166,
    "ipm": 73.85, "kemiskinan_persen": 10.15, "islam_persen": 96.85, "kristen_persen": 1.65,
    "katolik_persen": 1.1, "hindu_persen": 0.05, "buddha_persen": 0.15, "konghucu_persen": 0.2,
    "mata_pencaharian": "Pertanian & Tembakau 36%, Industri Tekstil & Makanan 32%, Perdagangan 20%, Jasa 12%",
    "ekonomi_sektor": "Industri Tekstil & Garmen, Pertanian Padi & Tembakau, Industri Makanan",
    "suku_mayoritas": "Jawa", "pdrb_kapita_juta": 46.2, "jumlah_kab_kota": "29 Kab, 6 Kota"
  },
  "DI Yogyakarta": {
    "kode_bps": "34", "provinsi": "DI Yogyakarta", "ibukota": "Yogyakarta", "region": "Jawa",
    "penduduk_2026": 3810000, "pertumbuhan_persen": 1.15, "luas_km2": 3133, "kepadatan_km2": 1216,
    "ipm": 81.55, "kemiskinan_persen": 11.25, "islam_persen": 92.7, "kristen_persen": 2.45,
    "katolik_persen": 4.5, "hindu_persen": 0.15, "buddha_persen": 0.1, "konghucu_persen": 0.1,
    "mata_pencaharian": "Pendidikan & Akademik 35%, Pariwisata & Kerajinan 32%, Industri Kreatif & IT 20%, Pertanian 13%",
    "ekonomi_sektor": "Pendidikan Tinggi, Pariwisata Kebudayaan, Industri Kreatif & Start-up",
    "suku_mayoritas": "Jawa, Sunda, Batak, Minangkabau", "pdrb_kapita_juta": 49.8, "jumlah_kab_kota": "4 Kab, 1 Kota"
  },
  "Jawa Timur": {
    "kode_bps": "35", "provinsi": "Jawa Timur", "ibukota": "Surabaya", "region": "Jawa",
    "penduduk_2026": 42180000, "pertumbuhan_persen": 0.78, "luas_km2": 47803, "kepadatan_km2": 882,
    "ipm": 75.15, "kemiskinan_persen": 9.9, "islam_persen": 96.75, "kristen_persen": 1.7,
    "katolik_persen": 0.65, "hindu_persen": 0.25, "buddha_persen": 0.2, "konghucu_persen": 0.45,
    "mata_pencaharian": "Industri Manufaktur 36%, Pertanian & Perkebunan Tebu 32%, Perdagangan & Logistik 22%, Jasa 10%",
    "ekonomi_sektor": "Industri Manufaktur & Kimia, Pertanian Tebu & Tembakau, Perdagangan Hub Timur",
    "suku_mayoritas": "Jawa, Madura, Osing, Tengger", "pdrb_kapita_juta": 73.5, "jumlah_kab_kota": "29 Kab, 9 Kota"
  },
  "Banten": {
    "kode_bps": "36", "provinsi": "Banten", "ibukota": "Serang", "region": "Jawa",
    "penduduk_2026": 12690000, "pertumbuhan_persen": 1.75, "luas_km2": 9663, "kepadatan_km2": 1313,
    "ipm": 75.75, "kemiskinan_persen": 5.95, "islam_persen": 94.6, "kristen_persen": 2.7,
    "katolik_persen": 1.15, "hindu_persen": 0.1, "buddha_persen": 1.25, "konghucu_persen": 0.2,
    "mata_pencaharian": "Industri Baja & Petrokimia 40%, Pergudangan & Logistik 28%, Perdagangan 20%, Pertanian 12%",
    "ekonomi_sektor": "Industri Baja & Petrokimia Cilegon, Logistik Bandara Soekarno-Hatta, Real Estate",
    "suku_mayoritas": "Banten (Sunda), Jawa, Betawi, Baduy, Tionghoa", "pdrb_kapita_juta": 67.4, "jumlah_kab_kota": "4 Kab, 4 Kota"
  },
  "Bali": {
    "kode_bps": "51", "provinsi": "Bali", "ibukota": "Denpasar", "region": "Bali-Nusa Tenggara",
    "penduduk_2026": 4490000, "pertumbuhan_persen": 1.2, "luas_km2": 5780, "kepadatan_km2": 777,
    "ipm": 78.45, "kemiskinan_persen": 4.1, "islam_persen": 10.15, "kristen_persen": 1.65,
    "katolik_persen": 0.8, "hindu_persen": 86.75, "buddha_persen": 0.6, "konghucu_persen": 0.05,
    "mata_pencaharian": "Pariwisata & Hospitaliti 52%, Industri Kerajinan Seni 22%, Pertanian & Perkebunan 16%, Perdagangan 10%",
    "ekonomi_sektor": "Pariwisata Internasional, Hospitaliti & Kuliner, Seni Kerajinan & Ekspor",
    "suku_mayoritas": "Bali (Aga & Majapahit), Jawa, Sasak", "pdrb_kapita_juta": 64.8, "jumlah_kab_kota": "8 Kab, 1 Kota"
  },
  "Nusa Tenggara Barat": {
    "kode_bps": "52", "provinsi": "Nusa Tenggara Barat", "ibukota": "Mataram", "region": "Bali-Nusa Tenggara",
    "penduduk_2026": 5645000, "pertumbuhan_persen": 1.35, "luas_km2": 18572, "kepadatan_km2": 304,
    "ipm": 70.8, "kemiskinan_persen": 13.15, "islam_persen": 96.8, "kristen_persen": 0.25,
    "katolik_persen": 0.15, "hindu_persen": 2.5, "buddha_persen": 0.3, "konghucu_persen": 0.0,
    "mata_pencaharian": "Pertanian Padi & Jagung 42%, Tambang Mineral 24%, Pariwisata Mandalika 20%, Perikanan 14%",
    "ekonomi_sektor": "Pertambangan Tembaga & Emas Amman Mineral, Pariwisata Mandalika, Jagung",
    "suku_mayoritas": "Sasak (Lombok), Bima (Mbojo), Sumbawa (Samawa)", "pdrb_kapita_juta": 35.6, "jumlah_kab_kota": "8 Kab, 2 Kota"
  },
  "Nusa Tenggara Timur": {
    "kode_bps": "53", "provinsi": "Nusa Tenggara Timur", "ibukota": "Kupang", "region": "Bali-Nusa Tenggara",
    "penduduk_2026": 5720000, "pertumbuhan_persen": 1.28, "luas_km2": 48718, "kepadatan_km2": 117,
    "ipm": 69.1, "kemiskinan_persen": 19.45, "islam_persen": 9.4, "kristen_persen": 36.3,
    "katolik_persen": 53.95, "hindu_persen": 0.15, "buddha_persen": 0.05, "konghucu_persen": 0.15,
    "mata_pencaharian": "Peternakan & Pertanian Lahan Kering 50%, Perikanan Tangkap 22%, Jasa Pariwisata 16%, Kerajinan Tenun 12%",
    "ekonomi_sektor": "Peternakan Sapi Potong, Kopi Flores, Pariwisata Premium Labuan Bajo",
    "suku_mayoritas": "Atoni (Timor), Manggarai, Sumba, Rote, Flores", "pdrb_kapita_juta": 24.1, "jumlah_kab_kota": "21 Kab, 1 Kota"
  },
  "Kalimantan Barat": {
    "kode_bps": "61", "provinsi": "Kalimantan Barat", "ibukota": "Pontianak", "region": "Kalimantan",
    "penduduk_2026": 5710000, "pertumbuhan_persen": 1.45, "luas_km2": 147307, "kepadatan_km2": 39,
    "ipm": 71.05, "kemiskinan_persen": 6.55, "islam_persen": 60.1, "kristen_persen": 11.5,
    "katolik_persen": 22.35, "hindu_persen": 0.05, "buddha_persen": 5.8, "konghucu_persen": 0.2,
    "mata_pencaharian": "Perkebunan Sawit & Karet 44%, Industri Smelter Bauksit 24%, Perdagangan 20%, Perikanan 12%",
    "ekonomi_sektor": "Perkebunan Kelapa Sawit & Karet, Bauksit & Smelter Alumina, Pelabuhan Kijing",
    "suku_mayoritas": "Dayak, Melayu, Tionghoa (Teochew/Hakka), Jawa, Madura", "pdrb_kapita_juta": 52.8, "jumlah_kab_kota": "12 Kab, 2 Kota"
  },
  "Kalimantan Tengah": {
    "kode_bps": "62", "provinsi": "Kalimantan Tengah", "ibukota": "Palangka Raya", "region": "Kalimantan",
    "penduduk_2026": 2820000, "pertumbuhan_persen": 1.65, "luas_km2": 153564, "kepadatan_km2": 18,
    "ipm": 74.2, "kemiskinan_persen": 5.1, "islam_persen": 74.3, "kristen_persen": 16.6,
    "katolik_persen": 3.2, "hindu_persen": 5.75, "buddha_persen": 0.1, "konghucu_persen": 0.05,
    "mata_pencaharian": "Perkebunan Sawit 46%, Pertambangan Batubara & Bauksit 26%, Pertanian Food Estate 16%, Jasa 12%",
    "ekonomi_sektor": "Perkebunan Kelapa Sawit, Pertambangan Batubara & Bauksit, Kawasan Food Estate",
    "suku_mayoritas": "Dayak (Ngaju, Ot Danum, Maanyan), Banjar, Jawa", "pdrb_kapita_juta": 78.4, "jumlah_kab_kota": "13 Kab, 1 Kota"
  },
  "Kalimantan Selatan": {
    "kode_bps": "63", "provinsi": "Kalimantan Selatan", "ibukota": "Banjarbaru", "region": "Kalimantan",
    "penduduk_2026": 4310000, "pertumbuhan_persen": 1.6, "luas_km2": 38744, "kepadatan_km2": 111,
    "ipm": 75.15, "kemiskinan_persen": 4.2, "islam_persen": 97.05, "kristen_persen": 1.3,
    "katolik_persen": 0.5, "hindu_persen": 0.45, "buddha_persen": 0.4, "konghucu_persen": 0.3,
    "mata_pencaharian": "Pertambangan Batubara 38%, Perkebunan Sawit & Karet 30%, Perdagangan Sungai 20%, Jasa 12%",
    "ekonomi_sektor": "Pertambangan Batubara, Perkebunan Kelapa Sawit & Karet, Perdagangan",
    "suku_mayoritas": "Banjar, Jawa, Bugis, Dayak Meratus", "pdrb_kapita_juta": 62.0, "jumlah_kab_kota": "11 Kab, 2 Kota"
  },
  "Kalimantan Timur": {
    "kode_bps": "64", "provinsi": "Kalimantan Timur", "ibukota": "Samarinda", "region": "Kalimantan",
    "penduduk_2026": 4120000, "pertumbuhan_persen": 2.1, "luas_km2": 129066, "kepadatan_km2": 32,
    "ipm": 78.8, "kemiskinan_persen": 5.85, "islam_persen": 87.35, "kristen_persen": 7.6,
    "katolik_persen": 4.3, "hindu_persen": 0.2, "buddha_persen": 0.45, "konghucu_persen": 0.1,
    "mata_pencaharian": "Konstruksi & IKN 35%, Pertambangan Batubara & Migas 32%, Industri Kimia 18%, Perdagangan 15%",
    "ekonomi_sektor": "Pembangunan IKN Nusantara, Pertambangan Batubara & Migas, Pupuk & Petrokimia",
    "suku_mayoritas": "Jawa, Bugis, Banjar, Dayak (Kutai, Kenyah), Melayu", "pdrb_kapita_juta": 218.0, "jumlah_kab_kota": "7 Kab, 3 Kota"
  },
  "Kalimantan Utara": {
    "kode_bps": "65", "provinsi": "Kalimantan Utara", "ibukota": "Tanjung Selor", "region": "Kalimantan",
    "penduduk_2026": 760000, "pertumbuhan_persen": 2.45, "luas_km2": 75468, "kepadatan_km2": 10,
    "ipm": 73.4, "kemiskinan_persen": 6.3, "islam_persen": 73.1, "kristen_persen": 20.2,
    "katolik_persen": 6.1, "hindu_persen": 0.1, "buddha_persen": 0.4, "konghucu_persen": 0.1,
    "mata_pencaharian": "Industri Kawasan Hijau KIPI 36%, Perikanan Tambak Udang 30%, Perkebunan 20%, Jasa 14%",
    "ekonomi_sektor": "Kawasan Industri Hijau (KIPI Tanah Kuning), PLTA Kayan, Perikanan Tambak Udang",
    "suku_mayoritas": "Dayak (Lundayeh, Kenyah), Tidung, Bugis, Jawa, Bulungan", "pdrb_kapita_juta": 182.5, "jumlah_kab_kota": "4 Kab, 1 Kota"
  },
  "Sulawesi Utara": {
    "kode_bps": "71", "provinsi": "Sulawesi Utara", "ibukota": "Manado", "region": "Sulawesi",
    "penduduk_2026": 2715000, "pertumbuhan_persen": 1.15, "luas_km2": 13856, "kepadatan_km2": 196,
    "ipm": 75.95, "kemiskinan_persen": 6.95, "islam_persen": 31.8, "kristen_persen": 63.2,
    "katolik_persen": 4.4, "hindu_persen": 0.35, "buddha_persen": 0.15, "konghucu_persen": 0.1,
    "mata_pencaharian": "Perikanan & Kelautan 34%, Pariwisata Bahari 28%, Pertanian Kelapa/Cengkeh 22%, Jasa 16%",
    "ekonomi_sektor": "Pariwisata Bahari (Likupang & Bunaken), Ekspor Ikan Tuna, Kelapa & Cengkeh",
    "suku_mayoritas": "Minahasa, Bolaang Mongondow, Sangihe, Talaud, Gorontalo", "pdrb_kapita_juta": 66.2, "jumlah_kab_kota": "11 Kab, 4 Kota"
  },
  "Sulawesi Tengah": {
    "kode_bps": "72", "provinsi": "Sulawesi Tengah", "ibukota": "Palu", "region": "Sulawesi",
    "penduduk_2026": 3195000, "pertumbuhan_persen": 2.15, "luas_km2": 61841, "kepadatan_km2": 52,
    "ipm": 72.3, "kemiskinan_persen": 11.7, "islam_persen": 78.9, "kristen_persen": 16.5,
    "katolik_persen": 0.9, "hindu_persen": 3.6, "buddha_persen": 0.1, "konghucu_persen": 0.0,
    "mata_pencaharian": "Industri Smelter Nikel Morowali 40%, Perkebunan Kakao 30%, Pertanian Pangan 18%, Perdagangan 12%",
    "ekonomi_sektor": "Hilirisasi Nikel & Smelter (Kawasan Industri Morowali), Pertanian Kakao",
    "suku_mayoritas": "Kaili, Bugis, Kulawi, Pamona, Banggai, Saluan, Bali", "pdrb_kapita_juta": 110.5, "jumlah_kab_kota": "12 Kab, 1 Kota"
  },
  "Sulawesi Selatan": {
    "kode_bps": "73", "provinsi": "Sulawesi Selatan", "ibukota": "Makassar", "region": "Sulawesi",
    "penduduk_2026": 9580000, "pertumbuhan_persen": 1.1, "luas_km2": 46717, "kepadatan_km2": 205,
    "ipm": 74.6, "kemiskinan_persen": 8.1, "islam_persen": 89.9, "kristen_persen": 7.45,
    "katolik_persen": 1.7, "hindu_persen": 0.7, "buddha_persen": 0.2, "konghucu_persen": 0.05,
    "mata_pencaharian": "Pertanian Padi Lumbung 38%, Perdagangan Hub KTI 28%, Hilirisasi Nikel 18%, Perikanan 16%",
    "ekonomi_sektor": "Lumbung Padi Nasional, Hilirisasi Nikel (Bantaeng/Luwu), Hub Logistik & Jasa KTI",
    "suku_mayoritas": "Bugis, Makassar, Toraja, Mandar, Duri", "pdrb_kapita_juta": 70.8, "jumlah_kab_kota": "21 Kab, 3 Kota"
  },
  "Sulawesi Tenggara": {
    "kode_bps": "74", "provinsi": "Sulawesi Tenggara", "ibukota": "Kendari", "region": "Sulawesi",
    "penduduk_2026": 2865000, "pertumbuhan_persen": 2.3, "luas_km2": 38067, "kepadatan_km2": 75,
    "ipm": 73.4, "kemiskinan_persen": 10.8, "islam_persen": 95.25, "kristen_persen": 2.4,
    "katolik_persen": 0.6, "hindu_persen": 1.65, "buddha_persen": 0.05, "konghucu_persen": 0.05,
    "mata_pencaharian": "Industri Tambang Nikel 42%, Perikanan Laut 26%, Pertanian Kakao 18%, Jasa 14%",
    "ekonomi_sektor": "Hilirisasi Nikel & Baterai Listrik (Konawe/Kolaka), Aspal Buton, Perikanan Laut",
    "suku_mayoritas": "Tolaki, Buton, Muna, Bugis, Moronene, Jawa", "pdrb_kapita_juta": 72.4, "jumlah_kab_kota": "15 Kab, 2 Kota"
  },
  "Gorontalo": {
    "kode_bps": "75", "provinsi": "Gorontalo", "ibukota": "Gorontalo", "region": "Sulawesi",
    "penduduk_2026": 1265000, "pertumbuhan_persen": 1.65, "luas_km2": 11257, "kepadatan_km2": 112,
    "ipm": 71.4, "kemiskinan_persen": 14.5, "islam_persen": 98.05, "kristen_persen": 1.5,
    "katolik_persen": 0.1, "hindu_persen": 0.3, "buddha_persen": 0.05, "konghucu_persen": 0.0,
    "mata_pencaharian": "Pertanian Jagung & Kelapa 46%, Perikanan Teluk Tomini 24%, Perdagangan 18%, Jasa 12%",
    "ekonomi_sektor": "Pertanian Jagung Kuning & Kelapa, Perikanan Tangkap Teluk Tomini",
    "suku_mayoritas": "Gorontalo, Suwawa, Atinggola, Minahasa, Bugis", "pdrb_kapita_juta": 41.5, "jumlah_kab_kota": "5 Kab, 1 Kota"
  },
  "Sulawesi Barat": {
    "kode_bps": "76", "provinsi": "Sulawesi Barat", "ibukota": "Mamuju", "region": "Sulawesi",
    "penduduk_2026": 1515000, "pertumbuhan_persen": 1.85, "luas_km2": 16787, "kepadatan_km2": 90,
    "ipm": 70.35, "kemiskinan_persen": 11.2, "islam_persen": 82.8, "kristen_persen": 14.75,
    "katolik_persen": 1.15, "hindu_persen": 1.25, "buddha_persen": 0.05, "konghucu_persen": 0.0,
    "mata_pencaharian": "Perkebunan Kakao & Sawit 45%, Perikanan Selat Makassar 25%, Pertanian 18%, Perdagangan 12%",
    "ekonomi_sektor": "Perkebunan Kelapa Sawit & Kakao, Perikanan Tangkap Selat Makassar",
    "suku_mayoritas": "Mandar, Toraja, Bugis, Mamasa, Jawa", "pdrb_kapita_juta": 40.2, "jumlah_kab_kota": "6 Kab"
  },
  "Maluku": {
    "kode_bps": "81", "provinsi": "Maluku", "ibukota": "Ambon", "region": "Maluku-Papua",
    "penduduk_2026": 1955000, "pertumbuhan_persen": 1.3, "luas_km2": 46914, "kepadatan_km2": 42,
    "ipm": 73.3, "kemiskinan_persen": 15.6, "islam_persen": 52.85, "kristen_persen": 39.7,
    "katolik_persen": 7.15, "hindu_persen": 0.15, "buddha_persen": 0.1, "konghucu_persen": 0.05,
    "mata_pencaharian": "Perikanan Laut (LIN) 42%, Perkebunan Rempah (Pala/Cengkeh) 28%, Jasa & Pemerintahan 18%, Pariwisata 12%",
    "ekonomi_sektor": "Lumbung Ikan Nasional (LIN), Proyek Gas Alam Abadi Masela, Rempah",
    "suku_mayoritas": "Ambon, Kei, Tanimbar, Seram, Buru, Banda", "pdrb_kapita_juta": 31.8, "jumlah_kab_kota": "9 Kab, 2 Kota"
  },
  "Maluku Utara": {
    "kode_bps": "82", "provinsi": "Maluku Utara", "ibukota": "Sofifi", "region": "Maluku-Papua",
    "penduduk_2026": 1395000, "pertumbuhan_persen": 2.25, "luas_km2": 31982, "kepadatan_km2": 44,
    "ipm": 71.9, "kemiskinan_persen": 6.1, "islam_persen": 75.35, "kristen_persen": 23.9,
    "katolik_persen": 0.65, "hindu_persen": 0.05, "buddha_persen": 0.05, "konghucu_persen": 0.0,
    "mata_pencaharian": "Hilirisasi Nikel Weda Bay 45%, Pertanian Rempah 25%, Perikanan Laut 18%, Jasa 12%",
    "ekonomi_sektor": "Hilirisasi Nikel Terbesar (Weda Bay & Obi), Emas Gosowong, Cengkeh & Pala",
    "suku_mayoritas": "Ternate, Tidore, Tobelo, Galela, Sula, Makian", "pdrb_kapita_juta": 82.5, "jumlah_kab_kota": "8 Kab, 2 Kota"
  },
  "Papua": {
    "kode_bps": "91", "provinsi": "Papua", "ibukota": "Jayapura", "region": "Maluku-Papua",
    "penduduk_2026": 1095000, "pertumbuhan_persen": 1.95, "luas_km2": 81049, "kepadatan_km2": 14,
    "ipm": 63.15, "kemiskinan_persen": 25.8, "islam_persen": 35.8, "kristen_persen": 60.1,
    "katolik_persen": 3.75, "hindu_persen": 0.15, "buddha_persen": 0.15, "konghucu_persen": 0.05,
    "mata_pencaharian": "Pemerintahan & Jasa KTI 38%, Perikanan Samudera Pasifik 26%, Pertanian Sawit 22%, Perdagangan 14%",
    "ekonomi_sektor": "Pusat Pemerintahan & Jasa KTI, Perikanan Samudera Pasifik, Perkebunan Sawit",
    "suku_mayoritas": "Sentani, Biak, Yapen, Tabi, Waropen, Jawa", "pdrb_kapita_juta": 78.6, "jumlah_kab_kota": "8 Kab, 1 Kota"
  },
  "Papua Barat": {
    "kode_bps": "92", "provinsi": "Papua Barat", "ibukota": "Manokwari", "region": "Maluku-Papua",
    "penduduk_2026": 585000, "pertumbuhan_persen": 1.85, "luas_km2": 64125, "kepadatan_km2": 9,
    "ipm": 67.85, "kemiskinan_persen": 20.7, "islam_persen": 44.9, "kristen_persen": 48.7,
    "katolik_persen": 6.1, "hindu_persen": 0.1, "buddha_persen": 0.15, "konghucu_persen": 0.05,
    "mata_pencaharian": "Industri Gas Alam LNG Tangguh 40%, Perkebunan Pala Fakfak 25%, Perikanan 20%, Jasa 15%",
    "ekonomi_sektor": "Kilang Gas Alam Cair LNG Tangguh (Teluk Bintuni), Pala Tomandin Fakfak",
    "suku_mayoritas": "Arfak, Doreri, Kaimana, Fakfak, Biak", "pdrb_kapita_juta": 115.0, "jumlah_kab_kota": "7 Kab"
  },
  "Papua Selatan": {
    "kode_bps": "93", "provinsi": "Papua Selatan", "ibukota": "Merauke", "region": "Maluku-Papua",
    "penduduk_2026": 548000, "pertumbuhan_persen": 2.1, "luas_km2": 131493, "kepadatan_km2": 4,
    "ipm": 66.8, "kemiskinan_persen": 23.9, "islam_persen": 27.5, "kristen_persen": 20.4,
    "katolik_persen": 51.75, "hindu_persen": 0.2, "buddha_persen": 0.1, "konghucu_persen": 0.05,
    "mata_pencaharian": "Kawasan Food Estate Tebu/Padi 46%, Perikanan Tangkap 24%, Kerajinan & Kehutanan 18%, Jasa 12%",
    "ekonomi_sektor": "Kawasan Strategis Pangan Nasional (Food Estate Tebu & Padi Merauke), Perikanan",
    "suku_mayoritas": "Marind-Anim, Asmat, Mandobo, Yei, Muyu, Jawa (Transmigran)", "pdrb_kapita_juta": 54.2, "jumlah_kab_kota": "4 Kab"
  },
  "Papua Tengah": {
    "kode_bps": "94", "provinsi": "Papua Tengah", "ibukota": "Nabire", "region": "Maluku-Papua",
    "penduduk_2026": 1485000, "pertumbuhan_persen": 2.15, "luas_km2": 66129, "kepadatan_km2": 22,
    "ipm": 60.75, "kemiskinan_persen": 36.2, "islam_persen": 12.2, "kristen_persen": 67.5,
    "katolik_persen": 20.1, "hindu_persen": 0.1, "buddha_persen": 0.05, "konghucu_persen": 0.05,
    "mata_pencaharian": "Pertambangan Emas Freeport 48%, Pertanian Tradisional & Kopi 26%, Perdagangan 14%, Jasa 12%",
    "ekonomi_sektor": "Tambang Emas & Tembaga Raksasa PT Freeport Indonesia (Grasberg/Tembagapura)",
    "suku_mayoritas": "Mee, Amungme, Moni, Damal, Wate", "pdrb_kapita_juta": 168.0, "jumlah_kab_kota": "8 Kab"
  },
  "Papua Pegunungan": {
    "kode_bps": "95", "provinsi": "Papua Pegunungan", "ibukota": "Wamena", "region": "Maluku-Papua",
    "penduduk_2026": 1495000, "pertumbuhan_persen": 2.05, "luas_km2": 52316, "kepadatan_km2": 29,
    "ipm": 57.4, "kemiskinan_persen": 38.6, "islam_persen": 2.4, "kristen_persen": 89.8,
    "katolik_persen": 7.65, "hindu_persen": 0.05, "buddha_persen": 0.05, "konghucu_persen": 0.05,
    "mata_pencaharian": "Pertanian Ubi Jalar & Hortikultura 52%, Kopi Arabika Wamena 24%, Wisata Lembah Baliem 14%, Jasa 10%",
    "ekonomi_sektor": "Pertanian Ubi Jalar, Kopi Arabika Wamena, Pariwisata Budaya Lembah Baliem",
    "suku_mayoritas": "Dani, Lani, Yali, Nduga, Hubula, Walak", "pdrb_kapita_juta": 26.5, "jumlah_kab_kota": "8 Kab"
  },
  "Papua Barat Daya": {
    "kode_bps": "96", "provinsi": "Papua Barat Daya", "ibukota": "Sorong", "region": "Maluku-Papua",
    "penduduk_2026": 638000, "pertumbuhan_persen": 2.1, "luas_km2": 39167, "kepadatan_km2": 16,
    "ipm": 69.15, "kemiskinan_persen": 18.2, "islam_persen": 38.6, "kristen_persen": 53.4,
    "katolik_persen": 7.6, "hindu_persen": 0.15, "buddha_persen": 0.2, "konghucu_persen": 0.05,
    "mata_pencaharian": "Pariwisata Bahari Raja Ampat 38%, Migas & Kilang Kasim 28%, Perikanan Tangkap 20%, Jasa KEK 14%",
    "ekonomi_sektor": "Pariwisata Bahari Raja Ampat, Kilang Minyak Kasim, KEK Sorong",
    "suku_mayoritas": "Moi, Maybrat, Ayamaru, Tehit, Biak, Raja Ampat", "pdrb_kapita_juta": 76.8, "jumlah_kab_kota": "5 Kab, 1 Kota"
  }
};

// Global State
let PROVINCES_DATA = { ...INITIAL_PROVINCES_DATA };
let GEOJSON_LAYER = null;
let SELECTED_LAYER = null;
let currentMetric = 'penduduk';
let currentRegion = 'all';
let activeProvinceKey = null;
let adminToken = localStorage.getItem('admin_token') || null;
let adminUser = localStorage.getItem('admin_user') || null;

// Basemap Tile Providers
const basemaps = {
  light: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri &copy; OpenStreetMap'
  }),
  dark: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri &copy; OpenStreetMap'
  }),
  osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri World Imagery'
  })
};

// Initialize Leaflet Map
const map = L.map('map', {
  center: [-2.2, 118.0],
  zoom: 5,
  minZoom: 4,
  maxZoom: 10,
  zoomControl: true,
  layers: [basemaps.light]
});

// Basemap Switcher
function switchBasemap(type, btn) {
  document.querySelectorAll('.basemap-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  Object.values(basemaps).forEach(layer => map.removeLayer(layer));
  if (basemaps[type]) basemaps[type].addTo(map);
}

// Name Normalizer for GeoJSON Features
function normalizeProvinceName(raw) {
  if (!raw) return '';
  let s = raw.toString().toUpperCase().trim();
  s = s.replace(/PROVINSI|PROPINSI|PROBANTEN/g, '').trim();
  if (s.includes('ACEH')) return 'Aceh';
  if (s.includes('SUMATERA UTARA')) return 'Sumatera Utara';
  if (s.includes('SUMATERA BARAT')) return 'Sumatera Barat';
  if (s.includes('SUMATERA SELATAN')) return 'Sumatera Selatan';
  if (s.includes('BANGKA')) return 'Kepulauan Bangka Belitung';
  if (s.includes('KEPULAUAN RIAU')) return 'Kepulauan Riau';
  if (s.includes('RIAU')) return 'Riau';
  if (s.includes('JAMBI')) return 'Jambi';
  if (s.includes('BENGKULU')) return 'Bengkulu';
  if (s.includes('LAMPUNG')) return 'Lampung';
  if (s.includes('JAKARTA')) return 'DKI Jakarta';
  if (s.includes('JAWA BARAT')) return 'Jawa Barat';
  if (s.includes('JAWA TENGAH')) return 'Jawa Tengah';
  if (s.includes('YOGYAKARTA')) return 'DI Yogyakarta';
  if (s.includes('JAWA TIMUR')) return 'Jawa Timur';
  if (s.includes('BANTEN') || raw.includes('PROBANTEN')) return 'Banten';
  if (s.includes('BALI')) return 'Bali';
  if (s.includes('NUSATENGGARA BARAT') || s.includes('NUSA TENGGARA BARAT')) return 'Nusa Tenggara Barat';
  if (s.includes('NUSA TENGGARA TIMUR') || s.includes('NUSATENGGARA TIMUR')) return 'Nusa Tenggara Timur';
  if (s.includes('KALIMANTAN BARAT')) return 'Kalimantan Barat';
  if (s.includes('KALIMANTAN TENGAH')) return 'Kalimantan Tengah';
  if (s.includes('KALIMANTAN SELATAN')) return 'Kalimantan Selatan';
  if (s.includes('KALIMANTAN TIMUR')) return 'Kalimantan Timur';
  if (s.includes('KALIMANTAN UTARA')) return 'Kalimantan Utara';
  if (s.includes('SULAWESI UTARA')) return 'Sulawesi Utara';
  if (s.includes('SULAWESI TENGAH')) return 'Sulawesi Tengah';
  if (s.includes('SULAWESI SELATAN')) return 'Sulawesi Selatan';
  if (s.includes('SULAWESI TENGGARA')) return 'Sulawesi Tenggara';
  if (s.includes('GORONTALO')) return 'Gorontalo';
  if (s.includes('SULAWESI BARAT')) return 'Sulawesi Barat';
  if (s.includes('MALUKU UTARA')) return 'Maluku Utara';
  if (s.includes('MALUKU')) return 'Maluku';
  if (s.includes('IRIAN JAYA BARAT') || s.includes('PAPUA BARAT')) return 'Papua Barat';
  if (s.includes('IRIAN JAYA TENGAH') || s.includes('PAPUA TENGAH')) return 'Papua Tengah';
  if (s.includes('IRIAN JAYA TIMUR') || s.includes('PAPUA')) return 'Papua';
  return raw.trim();
}

// Color Scaler for 5 Clean Metrics
function getMetricColor(val, metric) {
  if (val === null || val === undefined) return '#94a3b8';

  if (metric === 'penduduk') {
    return val >= 40000000 ? '#dc2626' : // Puncak (Jawa Barat/Timur)
           val >= 15000000 ? '#ea580c' : // Sangat Padat
           val >= 7000000  ? '#f59e0b' : // Padat
           val >= 4000000  ? '#10b981' : // Menengah
           val >= 2000000  ? '#06b6d4' : // Rendah
                             '#8b5cf6';   // Sangat Rendah
  }

  if (metric === 'agama') {
    if (val === 'Islam') return '#10b981';
    if (val === 'Kristen') return '#2563eb';
    if (val === 'Katolik') return '#8b5cf6';
    if (val === 'Hindu') return '#f59e0b';
    if (val === 'Buddha') return '#06b6d4';
    return '#10b981';
  }

  if (metric === 'ekonomi') {
    const s = String(val || '').toLowerCase();
    if (s.includes('industri') || s.includes('manufaktur') || s.includes('otomotif') || s.includes('elektronik') || s.includes('baja')) return '#2563eb';
    if (s.includes('nikel') || s.includes('tambang') || s.includes('batubara') || s.includes('migas') || s.includes('emas') || s.includes('timah') || s.includes('freeport')) return '#f59e0b';
    if (s.includes('sawit') || s.includes('perkebunan') || s.includes('karet') || s.includes('padi') || s.includes('pangan') || s.includes('food estate') || s.includes('jagung') || s.includes('kopi') || s.includes('teh')) return '#10b981';
    if (s.includes('wisata') || s.includes('pariwisata') || s.includes('hospitaliti') || s.includes('pendidikan')) return '#f43f5e';
    if (s.includes('perikanan') || s.includes('maritim') || s.includes('laut') || s.includes('ikan') || s.includes('lin')) return '#06b6d4';
    return '#6366f1';
  }

  if (metric === 'ipm') {
    return val >= 80.0 ? '#10b981' : // Sangat Tinggi
           val >= 75.0 ? '#2563eb' : // Tinggi
           val >= 70.0 ? '#f59e0b' : // Menengah Atas
                         '#ef4444';   // Menengah Bawah
  }

  if (metric === 'kemiskinan') {
    return val <= 6.0  ? '#10b981' : // Sangat Rendah
           val <= 10.0 ? '#2563eb' : // Rendah
           val <= 15.0 ? '#f59e0b' : // Sedang
                         '#ef4444';   // Tinggi
  }

  return '#2563eb';
}

// Map Feature Style with Dynamic Region Filter & Color Coding
function styleFeature(feature) {
  const rawName = feature.properties?.Propinsi || feature.properties?.name || '';
  const name = normalizeProvinceName(rawName);
  const pData = PROVINCES_DATA[name];

  let val = 0;
  if (pData) {
    if (currentMetric === 'penduduk') val = pData.penduduk_2026;
    else if (currentMetric === 'ipm') val = pData.ipm;
    else if (currentMetric === 'kemiskinan') val = pData.kemiskinan_persen;
    else if (currentMetric === 'agama') {
      const isMax = Math.max(pData.islam_persen, pData.kristen_persen, pData.katolik_persen, pData.hindu_persen, pData.buddha_persen);
      if (isMax === pData.islam_persen) val = 'Islam';
      else if (isMax === pData.kristen_persen) val = 'Kristen';
      else if (isMax === pData.katolik_persen) val = 'Katolik';
      else if (isMax === pData.hindu_persen) val = 'Hindu';
      else val = 'Buddha';
    }
    else if (currentMetric === 'ekonomi') {
      val = pData.ekonomi_sektor || pData.mata_pencaharian;
    }
  }

  const baseColor = getMetricColor(val, currentMetric);

  // Region Filter Highlight / Dimming Logic
  if (currentRegion !== 'all' && pData) {
    const isMatchedRegion = pData.region === currentRegion;
    if (isMatchedRegion) {
      return {
        fillColor: baseColor,
        weight: 2.2,
        opacity: 1.0,
        color: '#0f172a',
        fillOpacity: 0.92
      };
    } else {
      return {
        fillColor: '#94a3b8',
        weight: 0.8,
        opacity: 0.3,
        color: '#cbd5e1',
        fillOpacity: 0.15
      };
    }
  }

  return {
    fillColor: baseColor,
    weight: 1.2,
    opacity: 0.95,
    color: '#ffffff',
    fillOpacity: 0.85
  };
}

// Update Map Legend
function updateLegend() {
  const titleEl = document.getElementById('legendTitle');
  const listEl = document.getElementById('legendList');

  const configs = {
    penduduk: {
      title: 'Jumlah Penduduk (2026)',
      items: [
        { label: '≥ 40 Juta Jiwa', color: '#dc2626' },
        { label: '15 - 39,9 Juta', color: '#ea580c' },
        { label: '7 - 14,9 Juta', color: '#f59e0b' },
        { label: '4 - 6,9 Juta', color: '#10b981' },
        { label: '2 - 3,9 Juta', color: '#06b6d4' },
        { label: '< 2 Juta Jiwa', color: '#8b5cf6' }
      ]
    },
    agama: {
      title: 'Mayoritas Agama',
      items: [
        { label: 'Mayoritas Islam', color: '#10b981' },
        { label: 'Mayoritas Kristen', color: '#2563eb' },
        { label: 'Mayoritas Katolik', color: '#8b5cf6' },
        { label: 'Mayoritas Hindu', color: '#f59e0b' }
      ]
    },
    ekonomi: {
      title: 'Sektor Ekonomi Unggulan',
      items: [
        { label: 'Industri & Manufaktur', color: '#2563eb' },
        { label: 'Pertambangan & Energi', color: '#f59e0b' },
        { label: 'Perkebunan & Pertanian', color: '#10b981' },
        { label: 'Pariwisata & Jasa', color: '#f43f5e' },
        { label: 'Perikanan & Kelautan', color: '#06b6d4' }
      ]
    },
    ipm: {
      title: 'Indeks Pembangunan Manusia',
      items: [
        { label: 'Sangat Tinggi (≥ 80.0)', color: '#10b981' },
        { label: 'Tinggi (75.0 - 79.9)', color: '#2563eb' },
        { label: 'Menengah Atas (70.0 - 74.9)', color: '#f59e0b' },
        { label: 'Menengah Bawah (< 70.0)', color: '#ef4444' }
      ]
    },
    kemiskinan: {
      title: 'Tingkat Kemiskinan (%)',
      items: [
        { label: 'Sangat Rendah (≤ 6.0%)', color: '#10b981' },
        { label: 'Rendah (6.1% - 10.0%)', color: '#2563eb' },
        { label: 'Sedang (10.1% - 15.0%)', color: '#f59e0b' },
        { label: 'Tinggi (> 15.0%)', color: '#ef4444' }
      ]
    }
  };

  const cfg = configs[currentMetric] || configs.penduduk;
  titleEl.innerText = cfg.title;
  listEl.innerHTML = cfg.items.map(item => `
    <div class="legend-item">
      <span class="legend-color" style="background:${item.color};"></span>
      <span>${item.label}</span>
    </div>
  `).join('');
}

function setMetric(metric, btn) {
  currentMetric = metric;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (GEOJSON_LAYER) GEOJSON_LAYER.setStyle(styleFeature);
  updateLegend();
}

// Fetch Provinces Data from Backend API or compute from local fallback
async function loadProvincesData() {
  try {
    const res = await fetch('/api/provinces');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        PROVINCES_DATA = {};
        json.data.forEach(p => {
          PROVINCES_DATA[p.provinsi] = p;
        });
      }
    }
  } catch (err) {
    console.warn('Backend API offline, using embedded official 38 provinces dataset.');
  }

  // Also fetch summary stats
  try {
    const resStats = await fetch('/api/stats/summary');
    if (resStats.ok) {
      const jsonStats = await resStats.json();
      if (jsonStats.success && jsonStats.stats) {
        updateKPIBanner(jsonStats.stats);
      }
    }
  } catch (e) {
    // Compute summary stats from local data
    const list = Object.values(PROVINCES_DATA);
    const totalPop = list.reduce((acc, p) => acc + (p.penduduk_2026 || 0), 0);
    const totalArea = list.reduce((acc, p) => acc + (p.luas_km2 || 0), 0);
    const avgIPM = (list.reduce((acc, p) => acc + (p.ipm || 0), 0) / list.length).toFixed(2);
    const avgPov = (list.reduce((acc, p) => acc + (p.kemiskinan_persen || 0), 0) / list.length).toFixed(2);
    updateKPIBanner({
      total_provinsi: list.length,
      total_penduduk: totalPop,
      total_luas_km2: totalArea,
      rata_rata_ipm: parseFloat(avgIPM),
      rata_rata_kemiskinan: parseFloat(avgPov)
    });
  }

  if (GEOJSON_LAYER) {
    GEOJSON_LAYER.setStyle(styleFeature);
  }
  populateFullTable();
}

// Update Top KPI Banner Cards
function updateKPIBanner(stats) {
  if (!stats) return;
  const popJuta = (stats.total_penduduk / 1000000).toFixed(2).replace('.', ',');
  document.getElementById('kpiPop').innerText = `${popJuta} Juta`;
  document.getElementById('kpiIPM').innerText = stats.rata_rata_ipm;
  document.getElementById('kpiPoverty').innerText = `${stats.rata_rata_kemiskinan}%`;
  document.getElementById('kpiArea').innerText = `${stats.total_luas_km2.toLocaleString('id-ID')} km²`;
}

// Initialize Leaflet GeoJSON Layers
function initMapLayers() {
  const geojsonSource = window.GEOJSON_DATA_FALLBACK || window.GEOJSON_DATA || (typeof GEOJSON_DATA_FALLBACK !== 'undefined' ? GEOJSON_DATA_FALLBACK : null);
  if (!geojsonSource) {
    console.error('GeoJSON source not found!');
    return;
  }

  if (GEOJSON_LAYER) map.removeLayer(GEOJSON_LAYER);

  GEOJSON_LAYER = L.geoJSON(geojsonSource, {
    style: styleFeature,
    onEachFeature: function(feature, layer) {
      const rawName = feature.properties?.Propinsi || feature.properties?.name || '';
      const name = normalizeProvinceName(rawName);

      layer.on({
        mouseover: function(e) {
          const p = PROVINCES_DATA[name];
          const badge = document.getElementById('quickBadge');
          document.getElementById('badgeTitle').innerText = name;

          let valText = '-';
          if (p) {
            if (currentMetric === 'penduduk') valText = `${p.penduduk_2026.toLocaleString('id-ID')} Jiwa (${p.region})`;
            else if (currentMetric === 'ipm') valText = `IPM: ${p.ipm}`;
            else if (currentMetric === 'kemiskinan') valText = `Kemiskinan: ${p.kemiskinan_persen}%`;
            else if (currentMetric === 'agama') valText = `Islam: ${p.islam_persen}% | Kristen: ${p.kristen_persen}%`;
            else if (currentMetric === 'ekonomi') valText = p.ekonomi_sektor ? p.ekonomi_sektor.split(',')[0] : p.mata_pencaharian;
          }
          document.getElementById('badgeSubtitle').innerText = valText;
          badge.style.display = 'block';

          if (layer !== SELECTED_LAYER) {
            layer.setStyle({ weight: 2.5, color: '#0f172a', fillOpacity: 0.95 });
            layer.bringToFront();
          }
        },
        mouseout: function(e) {
          document.getElementById('quickBadge').style.display = 'none';
          if (layer !== SELECTED_LAYER) {
            GEOJSON_LAYER.resetStyle(layer);
          }
        },
        click: function(e) {
          openProvinceDrawer(name, layer);
        }
      });
    }
  }).addTo(map);

  map.fitBounds(GEOJSON_LAYER.getBounds(), { padding: [15, 15] });
}

// Open Province Detail Drawer
function openProvinceDrawer(name, layer) {
  const p = PROVINCES_DATA[name];
  if (!p) return;

  activeProvinceKey = name;

  if (SELECTED_LAYER && SELECTED_LAYER !== layer) {
    GEOJSON_LAYER.resetStyle(SELECTED_LAYER);
  }
  if (layer) {
    SELECTED_LAYER = layer;
    SELECTED_LAYER.setStyle({ weight: 3, color: '#2563eb', fillOpacity: 1.0 });
    SELECTED_LAYER.bringToFront();
    map.fitBounds(layer.getBounds(), { padding: [30, 30], maxZoom: 7 });
  }

  document.getElementById('dKode').innerText = `Kode BPS: ${p.kode_bps}`;
  document.getElementById('dTitle').innerText = p.provinsi;
  document.getElementById('dSubtitle').innerText = `Ibukota: ${p.ibukota} · Region: ${p.region}`;

  document.getElementById('dPop').innerText = `${p.penduduk_2026.toLocaleString('id-ID')} Jiwa`;
  document.getElementById('dDensity').innerText = `${p.kepadatan_km2} /km²`;
  document.getElementById('dArea').innerText = `${p.luas_km2.toLocaleString('id-ID')} km²`;
  document.getElementById('dIPM').innerText = p.ipm;
  document.getElementById('dPoverty').innerText = `${p.kemiskinan_persen}%`;
  document.getElementById('dPDRB').innerText = `Rp ${p.pdrb_kapita_juta} Juta`;

  // Religion percentage bars
  const rels = [
    { id: 'Islam', val: p.islam_persen },
    { id: 'Kristen', val: p.kristen_persen },
    { id: 'Katolik', val: p.katolik_persen },
    { id: 'Hindu', val: p.hindu_persen },
    { id: 'Buddha', val: p.buddha_persen },
    { id: 'Konghucu', val: p.konghucu_persen }
  ];

  rels.forEach(r => {
    const barEl = document.getElementById(`bar${r.id}`);
    const valEl = document.getElementById(`val${r.id}`);
    if (barEl && valEl) {
      barEl.style.width = `${Math.min(100, r.val)}%`;
      valEl.innerText = `${r.val}%`;
    }
  });

  // Livelihoods & Economy Badges
  document.getElementById('dLivelihood').innerText = p.mata_pencaharian || p.ekonomi_sektor || '-';
  const badgeContainer = document.getElementById('dEconomyBadges');
  badgeContainer.innerHTML = '';
  if (p.ekonomi_sektor) {
    p.ekonomi_sektor.split(',').forEach(tag => {
      const span = document.createElement('span');
      span.className = 'badge-tag';
      span.innerText = tag.trim();
      badgeContainer.appendChild(span);
    });
  }

  document.getElementById('dEthnic').innerText = p.suku_mayoritas || '-';
  document.getElementById('dAdmin').innerText = `Wilayah: ${p.jumlah_kab_kota || '-'}`;

  document.getElementById('provinceDrawer').classList.add('open');
}

function closeDrawer() {
  document.getElementById('provinceDrawer').classList.remove('open');
  if (SELECTED_LAYER) {
    GEOJSON_LAYER.resetStyle(SELECTED_LAYER);
    SELECTED_LAYER = null;
  }
}

// Search and Region Filter
function handleSearch(query) {
  if (!query) return;
  const q = query.toLowerCase().trim();
  const match = Object.keys(PROVINCES_DATA).find(k => k.toLowerCase().includes(q));
  if (match && GEOJSON_LAYER) {
    GEOJSON_LAYER.eachLayer(layer => {
      const name = normalizeProvinceName(layer.feature?.properties?.Propinsi || '');
      if (name === match) {
        openProvinceDrawer(match, layer);
      }
    });
  }
}

function filterRegion(region) {
  currentRegion = region;
  
  if (GEOJSON_LAYER) {
    GEOJSON_LAYER.setStyle(styleFeature);
  }

  if (region === 'all') {
    map.fitBounds(GEOJSON_LAYER.getBounds(), { padding: [15, 15] });
    return;
  }

  const matched = [];
  GEOJSON_LAYER.eachLayer(layer => {
    const name = normalizeProvinceName(layer.feature?.properties?.Propinsi || '');
    const p = PROVINCES_DATA[name];
    if (p && p.region === region) {
      matched.push(layer);
    }
  });

  if (matched.length > 0) {
    const group = L.featureGroup(matched);
    map.fitBounds(group.getBounds(), { padding: [35, 35] });
  }
}

// ==========================================
// ADMIN AUTHENTICATION & MANAGEMENT
// ==========================================

async function checkAdminAuth() {
  if (!adminToken) {
    renderAdminUI(false);
    return;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (json.success && json.authenticated) {
      renderAdminUI(true, json.user.username);
    } else {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      adminToken = null;
      renderAdminUI(false);
    }
  } catch (err) {
    renderAdminUI(false);
  }
}

function renderAdminUI(isLoggedIn, username = 'admin') {
  const loginForm = document.getElementById('adminLoginForm');
  const dashboard = document.getElementById('adminDashboardView');
  const activeUserSpan = document.getElementById('activeAdminUser');
  const adminBtnText = document.getElementById('adminBtnText');

  if (isLoggedIn) {
    loginForm.style.display = 'none';
    dashboard.style.display = 'block';
    if (activeUserSpan) activeUserSpan.innerText = username;
    if (adminBtnText) adminBtnText.innerText = `Admin (${username})`;
    loadUploadLogs();
  } else {
    loginForm.style.display = 'block';
    dashboard.style.display = 'none';
    if (adminBtnText) adminBtnText.innerText = 'Admin Portal';
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();
  const uInput = document.getElementById('adminUsernameInput').value.trim();
  const pInput = document.getElementById('adminPasswordInput').value;
  const alertBox = document.getElementById('loginAlertBox');
  const btn = document.getElementById('loginSubmitBtn');

  btn.disabled = true;
  btn.innerText = 'Memverifikasi...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uInput, password: pInput })
    });
    const json = await res.json();

    if (json.success && json.token) {
      adminToken = json.token;
      adminUser = json.user.username;
      localStorage.setItem('admin_token', adminToken);
      localStorage.setItem('admin_user', adminUser);

      alertBox.style.display = 'none';
      renderAdminUI(true, adminUser);
    } else {
      alertBox.className = 'alert danger';
      alertBox.innerHTML = `<strong>Gagal Login:</strong> ${json.error || 'Username atau password salah.'}`;
      alertBox.style.display = 'block';
    }
  } catch (err) {
    // Client-side demo login fallback if offline
    if (uInput === 'admin' && pInput === 'admin123') {
      adminToken = 'offline-demo-token';
      adminUser = 'admin';
      localStorage.setItem('admin_token', adminToken);
      localStorage.setItem('admin_user', adminUser);
      alertBox.style.display = 'none';
      renderAdminUI(true, adminUser);
    } else {
      alertBox.className = 'alert danger';
      alertBox.innerHTML = `<strong>Error:</strong> Gagal terhubung ke server database.`;
      alertBox.style.display = 'block';
    }
  } finally {
    btn.disabled = false;
    btn.innerText = 'Masuk sebagai Admin';
  }
}

async function handleAdminLogout() {
  if (adminToken) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
    } catch (e) {}
  }
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  adminToken = null;
  adminUser = null;
  renderAdminUI(false);
}

async function handleChangeCredentials(event) {
  event.preventDefault();
  const curPassword = document.getElementById('curPassword').value;
  const newUsername = document.getElementById('newUsername').value.trim();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const alertBox = document.getElementById('credAlertBox');

  if (newPassword && newPassword !== confirmPassword) {
    alertBox.className = 'alert danger';
    alertBox.innerHTML = '<strong>Validasi Gagal:</strong> Password baru dan konfirmasi password tidak cocok.';
    alertBox.style.display = 'block';
    return;
  }

  try {
    const res = await fetch('/api/auth/change-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ curPassword, newUsername, newPassword })
    });
    const json = await res.json();

    if (json.success) {
      if (json.token) {
        adminToken = json.token;
        localStorage.setItem('admin_token', adminToken);
      }
      if (json.username) {
        adminUser = json.username;
        localStorage.setItem('admin_user', adminUser);
        document.getElementById('activeAdminUser').innerText = adminUser;
        document.getElementById('adminBtnText').innerText = `Admin (${adminUser})`;
      }

      alertBox.className = 'alert success';
      alertBox.innerHTML = `<strong>Berhasil!</strong> ${json.message}`;
      alertBox.style.display = 'block';

      document.getElementById('curPassword').value = '';
      document.getElementById('newUsername').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } else {
      alertBox.className = 'alert danger';
      alertBox.innerHTML = `<strong>Gagal:</strong> ${json.error}`;
      alertBox.style.display = 'block';
    }
  } catch (err) {
    alertBox.className = 'alert danger';
    alertBox.innerHTML = `<strong>Error:</strong> ${err.message}`;
    alertBox.style.display = 'block';
  }
}

function switchAdminTab(tabName, btn) {
  document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));

  if (btn) btn.classList.add('active');
  const panel = document.getElementById(`adminTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  if (panel) panel.classList.add('active');

  if (tabName === 'logs') {
    loadUploadLogs();
  }
}

// ==========================================
// PDF UPLOAD & PARSING WITH PDF.JS
// ==========================================

async function handleFileSelected(file) {
  if (!file) return;

  const feedback = document.getElementById('uploadFeedback');
  const diffBox = document.getElementById('uploadResultDiff');
  diffBox.style.display = 'none';

  feedback.className = 'alert info';
  feedback.innerHTML = `<div><strong>Membaca file "${file.name}"...</strong><br>Sedang mengekstrak teks dan memeriksa kesesuaian format template resmi.</div>`;

  try {
    let extractedText = '';

    // Extract text client-side via PDF.js for 100% precision
    if (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
      if (window.pdfjsLib) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          extractedText += pageText + '\n';
        }
      }
    } else {
      extractedText = await file.text();
    }

    // Send payload to backend
    const res = await fetch('/api/upload-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        filename: file.name,
        text: extractedText
      })
    });

    const json = await res.json();

    if (json.success) {
      feedback.className = 'alert success';
      feedback.innerHTML = `<div>
        <strong>✅ Validasi Template Sukses!</strong><br>
        ${json.message}
      </div>`;

      // Render Diff Comparison
      if (Array.isArray(json.updates) && json.updates.length > 0) {
        diffBox.innerHTML = `
          <div class="diff-card">
            <div class="diff-title">Perubahan Data yang Telah Disimpan ke Database:</div>
            ${json.updates.map(u => `
              <div style="margin-bottom:8px; border-bottom:1px solid var(--border); padding-bottom:6px;">
                <strong>${u.provinsi}</strong>: 
                Penduduk: <span style="text-decoration:line-through; color:var(--text-muted);">${u.previous?.penduduk_2026?.toLocaleString('id-ID')}</span> ➔ <strong style="color:var(--primary);">${u.updated?.penduduk_2026?.toLocaleString('id-ID')} Jiwa</strong> | 
                Islam: <strong>${u.updated?.islam_persen}%</strong> | Kristen: <strong>${u.updated?.kristen_persen}%</strong> | 
                Mata Pencaharian: <em>${u.updated?.mata_pencaharian}</em>
              </div>
            `).join('')}
          </div>
        `;
        diffBox.style.display = 'block';
      }

      // Live Reload Database & Map without page refresh
      await loadProvincesData();
      if (activeProvinceKey && json.affectedProvinces && json.affectedProvinces.includes(activeProvinceKey)) {
        openProvinceDrawer(activeProvinceKey, SELECTED_LAYER);
      }
    } else {
      feedback.className = 'alert danger';
      const errorItems = Array.isArray(json.errors) ? json.errors.map(e => `<li>${e}</li>`).join('') : `<li>${json.error || 'Format template salah'}</li>`;
      feedback.innerHTML = `<div>
        <strong>❌ Format File Ditolak (Tidak Sesuai Template):</strong>
        <ul style="margin:6px 0 0 16px; font-size:12px; line-height:1.5;">${errorItems}</ul>
        <p style="margin-top:6px; font-size:11.5px;">Silakan unduh <strong>Template PDF Resmi</strong> untuk melihat panduan susunan baris yang wajib disertakan.</p>
      </div>`;
    }
  } catch (err) {
    feedback.className = 'alert danger';
    feedback.innerHTML = `<strong>Error:</strong> Gagal memproses file: ${err.message}`;
  }
}

// Drag & Drop event bindings
const dropzone = document.getElementById('pdfDropzone');
if (dropzone) {
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, e => { e.preventDefault(); dropzone.classList.add('dragover'); }, false);
  });
  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, e => { e.preventDefault(); dropzone.classList.remove('dragover'); }, false);
  });
  dropzone.addEventListener('drop', e => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFileSelected(file);
  }, false);
}

// Copy Sample Template to Clipboard
async function copyTemplateSample() {
  const sample = `=======================================================
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
=======================================================`;
  try {
    await navigator.clipboard.writeText(sample);
    alert('Contoh format teks template berhasil disalin ke papan klip (clipboard)!');
  } catch (e) {
    alert('Gagal menyalin template.');
  }
}

// Load Audit Upload Logs
async function loadUploadLogs() {
  const tbody = document.getElementById('logsTableBody');
  if (!tbody || !adminToken) return;

  try {
    const res = await fetch('/api/logs', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.logs)) {
      if (json.logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Belum ada riwayat upload.</td></tr>';
        return;
      }
      tbody.innerHTML = json.logs.map(log => `
        <tr>
          <td class="num-mono">${log.created_at}</td>
          <td><strong>${log.filename}</strong></td>
          <td>${log.uploaded_by}</td>
          <td>
            <span class="brand-badge" style="background:${log.status === 'SUCCESS' ? 'var(--emerald-soft)' : 'var(--rose-soft)'}; color:${log.status === 'SUCCESS' ? 'var(--emerald)' : 'var(--rose)'};">
              ${log.status}
            </span>
          </td>
          <td>${log.affected_provinces || '-'}</td>
          <td>${log.message || '-'}</td>
        </tr>
      `).join('');
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--rose);">Gagal memuat log.</td></tr>';
  }
}

// ==========================================
// MODALS (TABLE & ADMIN)
// ==========================================

function openAdminModal() {
  document.getElementById('adminModal').classList.add('active');
  checkAdminAuth();
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('active');
}

function openTableModal() {
  document.getElementById('tableModal').classList.add('active');
  populateFullTable();
}

function closeTableModal() {
  document.getElementById('tableModal').classList.remove('active');
}

// Populate Table Modal
function populateFullTable() {
  const tbody = document.getElementById('fullTableBody');
  if (!tbody) return;

  const provinces = Object.values(PROVINCES_DATA).sort((a, b) => b.penduduk_2026 - a.penduduk_2026);
  tbody.innerHTML = provinces.map(p => `
    <tr onclick="selectProvinceFromTable('${p.provinsi}')">
      <td class="num-mono" style="font-weight:700;">${p.kode_bps}</td>
      <td style="font-weight:800; color:var(--primary);">${p.provinsi}</td>
      <td>${p.ibukota}</td>
      <td><span class="brand-badge">${p.region}</span></td>
      <td class="num-mono" style="font-weight:700;">${p.penduduk_2026.toLocaleString('id-ID')}</td>
      <td class="num-mono">${p.luas_km2.toLocaleString('id-ID')}</td>
      <td class="num-mono">${p.kepadatan_km2}</td>
      <td class="num-mono" style="color:var(--emerald); font-weight:700;">${p.ipm}</td>
      <td class="num-mono">${p.kemiskinan_persen}%</td>
      <td>Islam ${p.islam_persen}%, Kristen ${p.kristen_persen}%</td>
    </tr>
  `).join('');
}

function selectProvinceFromTable(name) {
  closeTableModal();
  handleSearch(name);
}

function filterModalTable(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('#fullTableBody tr').forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
}

// Download CSV of All Provinces
function downloadCSV() {
  let csv = 'Kode BPS,Provinsi,Ibukota,Region,Penduduk 2026,Luas (km2),Kepadatan (km2),IPM,Kemiskinan (%),Islam (%),Kristen (%),Katolik (%),Hindu (%),Buddha (%),Konghucu (%),Mata Pencaharian,Sektor Unggulan,Suku Mayoritas\n';
  Object.values(PROVINCES_DATA).forEach(p => {
    csv += `"${p.kode_bps}","${p.provinsi}","${p.ibukota}","${p.region}",${p.penduduk_2026},${p.luas_km2},${p.kepadatan_km2},${p.ipm},${p.kemiskinan_persen},${p.islam_persen},${p.kristen_persen},${p.katolik_persen},${p.hindu_persen},${p.buddha_persen},${p.konghucu_persen || 0},"${(p.mata_pencaharian||'').replace(/"/g, '""')}","${(p.ekonomi_sektor||'').replace(/"/g, '""')}","${(p.suku_mayoritas||'').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Data_Kependudukan_Indonesia_38_Provinsi_2026.csv';
  link.click();
}

// Theme Toggle
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

function applyTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  const sun = document.getElementById('themeIconSun');
  const moon = document.getElementById('themeIconMoon');

  if (theme === 'dark') {
    if (sun) sun.style.display = 'none';
    if (moon) moon.style.display = 'inline-block';
    switchBasemap('dark', document.querySelectorAll('.basemap-btn')[1]);
  } else {
    if (sun) sun.style.display = 'inline-block';
    if (moon) moon.style.display = 'none';
    switchBasemap('light', document.querySelectorAll('.basemap-btn')[0]);
  }
  localStorage.setItem('portal_theme', theme);
}

// Initialize on DOM Ready
window.addEventListener('DOMContentLoaded', async () => {
  const savedTheme = localStorage.getItem('portal_theme') || 'light';
  applyTheme(savedTheme);

  updateLegend();
  initMapLayers();
  await loadProvincesData();
  checkAdminAuth();
});
