/**
 * Database Module for Nusantara DataLens
 * Uses native Node.js 24 `node:sqlite` (zero npm native compilation needed)
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'portal_kependudukan.sqlite');
const db = new DatabaseSync(DB_PATH);

// Helper for password hashing with salt
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, storedHash, salt) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

// Initialize Database Schema
function initSchema() {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Provinces Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS provinces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode_bps TEXT UNIQUE NOT NULL,
      provinsi TEXT UNIQUE NOT NULL,
      ibukota TEXT NOT NULL,
      region TEXT NOT NULL,
      penduduk_2026 INTEGER NOT NULL,
      pertumbuhan_persen REAL DEFAULT 1.0,
      luas_km2 REAL NOT NULL,
      kepadatan_km2 REAL NOT NULL,
      ipm REAL NOT NULL,
      kemiskinan_persen REAL NOT NULL,
      islam_persen REAL DEFAULT 0,
      kristen_persen REAL DEFAULT 0,
      katolik_persen REAL DEFAULT 0,
      hindu_persen REAL DEFAULT 0,
      buddha_persen REAL DEFAULT 0,
      konghucu_persen REAL DEFAULT 0,
      mata_pencaharian TEXT,
      ekonomi_sektor TEXT,
      suku_mayoritas TEXT,
      pdrb_kapita_juta REAL DEFAULT 50.0,
      jumlah_kab_kota TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Upload Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS upload_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      status TEXT NOT NULL,
      affected_provinces TEXT,
      message TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default admin user if not exists
  const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!existingAdmin) {
    const { hash, salt } = hashPassword('admin123');
    db.prepare(`
      INSERT INTO users (username, password_hash, salt, role)
      VALUES (?, ?, ?, 'admin')
    `).run('admin', hash, salt);
    console.log('✅ Default admin user created (admin / admin123)');
  }

  // Seed provinces if table is empty
  const provinceCount = db.prepare('SELECT COUNT(*) as count FROM provinces').get();
  if (provinceCount.count === 0) {
    seedInitialProvinces();
  }
}

// Initial 38 Provinces Official Dataset
const INITIAL_PROVINCES = [
  {
    kode_bps: "11", provinsi: "Aceh", ibukota: "Banda Aceh", region: "Sumatera",
    penduduk_2026: 5585000, pertumbuhan_persen: 1.18, luas_km2: 58376, kepadatan_km2: 96,
    ipm: 74.2, kemiskinan_persen: 13.9, islam_persen: 98.6, kristen_persen: 1.15,
    katolik_persen: 0.11, hindu_persen: 0.01, buddha_persen: 0.13, konghucu_persen: 0.0,
    mata_pencaharian: "Pertanian & Perkebunan 42%, Perdagangan & Jasa 28%, Perikanan Tangkap 18%, Industri Pengolahan 12%",
    ekonomi_sektor: "Pertanian Pangan, Kopi Gayo, Kelapa Sawit, Gas Alam Arun",
    suku_mayoritas: "Aceh, Gayo, Alas, Tamiang, Kluet", pdrb_kapita_juta: 42.5, jumlah_kab_kota: "18 Kab, 5 Kota"
  },
  {
    kode_bps: "12", provinsi: "Sumatera Utara", ibukota: "Medan", region: "Sumatera",
    penduduk_2026: 15680000, pertumbuhan_persen: 1.25, luas_km2: 72981, kepadatan_km2: 215,
    ipm: 75.6, kemiskinan_persen: 7.85, islam_persen: 66.45, kristen_persen: 27.2,
    katolik_persen: 4.1, hindu_persen: 0.1, buddha_persen: 2.15, konghucu_persen: 0.0,
    mata_pencaharian: "Perkebunan Sawit/Karet 35%, Perdagangan & Jasa 32%, Industri Manufaktur 20%, Pertanian 13%",
    ekonomi_sektor: "Perkebunan Sawit & Karet, Industri Manufaktur Medan-Belawan, Perdagangan",
    suku_mayoritas: "Batak (Toba, Karo, Mandailing), Jawa, Nias, Melayu", pdrb_kapita_juta: 68.2, jumlah_kab_kota: "25 Kab, 8 Kota"
  },
  {
    kode_bps: "13", provinsi: "Sumatera Barat", ibukota: "Padang", region: "Sumatera",
    penduduk_2026: 5860000, pertumbuhan_persen: 1.12, luas_km2: 42013, kepadatan_km2: 139,
    ipm: 76.75, kemiskinan_persen: 5.6, islam_persen: 97.55, kristen_persen: 1.45,
    katolik_persen: 0.9, hindu_persen: 0.01, buddha_persen: 0.09, konghucu_persen: 0.0,
    mata_pencaharian: "Pertanian & Hortikultura 38%, Perdagangan & Kuliner 34%, Jasa Pariwisata 18%, Kerajinan 10%",
    ekonomi_sektor: "Pertanian Tanaman Pangan, Perdagangan, Pariwisata & Kuliner, Semen Padang",
    suku_mayoritas: "Minangkabau, Mentawai, Mandailing, Jawa", pdrb_kapita_juta: 55.4, jumlah_kab_kota: "12 Kab, 7 Kota"
  },
  {
    kode_bps: "14", provinsi: "Riau", ibukota: "Pekanbaru", region: "Sumatera",
    penduduk_2026: 7095000, pertumbuhan_persen: 1.85, luas_km2: 87024, kepadatan_km2: 82,
    ipm: 76.1, kemiskinan_persen: 6.45, islam_persen: 87.15, kristen_persen: 9.8,
    katolik_persen: 1.05, hindu_persen: 0.01, buddha_persen: 1.95, konghucu_persen: 0.04,
    mata_pencaharian: "Perkebunan Kelapa Sawit 45%, Industri Migas & Kertas 28%, Perdagangan 17%, Pertanian 10%",
    ekonomi_sektor: "Kelapa Sawit (CPO), Pertambangan Minyak Bumi, Industri Bubur Kertas",
    suku_mayoritas: "Melayu, Jawa, Batak, Minangkabau, Tionghoa", pdrb_kapita_juta: 142.8, jumlah_kab_kota: "10 Kab, 2 Kota"
  },
  {
    kode_bps: "15", provinsi: "Jambi", ibukota: "Jambi", region: "Sumatera",
    penduduk_2026: 3785000, pertumbuhan_persen: 1.48, luas_km2: 50058, kepadatan_km2: 76,
    ipm: 74.25, kemiskinan_persen: 7.2, islam_persen: 95.1, kristen_persen: 3.15,
    katolik_persen: 0.6, hindu_persen: 0.02, buddha_persen: 1.1, konghucu_persen: 0.03,
    mata_pencaharian: "Perkebunan Sawit & Karet 46%, Pertambangan Batubara 20%, Perdagangan 22%, Jasa 12%",
    ekonomi_sektor: "Perkebunan Karet & Sawit, Batubara, Migas, Kehutanan",
    suku_mayoritas: "Melayu Jambi, Jawa, Kerinci, Minangkabau, Sunda", pdrb_kapita_juta: 79.3, jumlah_kab_kota: "9 Kab, 2 Kota"
  },
  {
    kode_bps: "16", provinsi: "Sumatera Selatan", ibukota: "Palembang", region: "Sumatera",
    penduduk_2026: 9015000, pertumbuhan_persen: 1.42, luas_km2: 91592, kepadatan_km2: 98,
    ipm: 73.65, kemiskinan_persen: 11.2, islam_persen: 97.2, kristen_persen: 1.05,
    katolik_persen: 0.85, hindu_persen: 0.35, buddha_persen: 0.55, konghucu_persen: 0.0,
    mata_pencaharian: "Pertanian Padi & Karet 40%, Energi & Tambang 25%, Perdagangan 23%, Industri 12%",
    ekonomi_sektor: "Batubara & Pembangkit Listrik, Karet & Sawit, Pertanian Padi",
    suku_mayoritas: "Palembang (Musi), Jawa, Komering, Sunda, Semendo", pdrb_kapita_juta: 71.0, jumlah_kab_kota: "13 Kab, 4 Kota"
  },
  {
    kode_bps: "17", provinsi: "Bengkulu", ibukota: "Bengkulu", region: "Sumatera",
    penduduk_2026: 2125000, pertumbuhan_persen: 1.38, luas_km2: 19919, kepadatan_km2: 107,
    ipm: 73.55, kemiskinan_persen: 13.8, islam_persen: 97.45, kristen_persen: 1.7,
    katolik_persen: 0.45, hindu_persen: 0.2, buddha_persen: 0.2, konghucu_persen: 0.0,
    mata_pencaharian: "Perkebunan Kopi & Sawit 48%, Perikanan Laut 22%, Perdagangan 18%, Jasa 12%",
    ekonomi_sektor: "Pertanian Kopi & Sawit, Batubara, Perikanan Tangkap",
    suku_mayoritas: "Rejang, Serawai, Lembak, Jawa, Melayu Bengkulu", pdrb_kapita_juta: 48.6, jumlah_kab_kota: "9 Kab, 1 Kota"
  },
  {
    kode_bps: "18", provinsi: "Lampung", ibukota: "Bandar Lampung", region: "Sumatera",
    penduduk_2026: 9460000, pertumbuhan_persen: 1.3, luas_km2: 34624, kepadatan_km2: 273,
    ipm: 72.95, kemiskinan_persen: 10.75, islam_persen: 96.15, kristen_persen: 1.4,
    katolik_persen: 0.85, hindu_persen: 1.45, buddha_persen: 0.15, konghucu_persen: 0.0,
    mata_pencaharian: "Agroindustri & Tani 44%, Logistik & Penyeberangan 24%, Perdagangan 20%, Industri 12%",
    ekonomi_sektor: "Agroindustri Gula & Nanas, Perkebunan Kopi & Sawit, Logistik Penyeberangan",
    suku_mayoritas: "Jawa, Lampung (Pesisir & Pepadun), Sunda, Bali", pdrb_kapita_juta: 51.2, jumlah_kab_kota: "13 Kab, 2 Kota"
  },
  {
    kode_bps: "19", provinsi: "Kepulauan Bangka Belitung", ibukota: "Pangkalpinang", region: "Sumatera",
    penduduk_2026: 1558000, pertumbuhan_persen: 1.5, luas_km2: 16424, kepadatan_km2: 95,
    ipm: 74.55, kemiskinan_persen: 4.45, islam_persen: 89.6, kristen_persen: 2.1,
    katolik_persen: 1.3, hindu_persen: 0.1, buddha_persen: 4.5, konghucu_persen: 2.4,
    mata_pencaharian: "Pertambangan Timah 36%, Perkebunan Lada/Sawit 28%, Pariwisata 20%, Perikanan 16%",
    ekonomi_sektor: "Pertambangan Timah, Lada Putih (Muntok White Pepper), Pariwisata Bahari",
    suku_mayoritas: "Melayu Bangka/Belitung, Tionghoa (Hakka), Jawa, Bugis", pdrb_kapita_juta: 66.8, jumlah_kab_kota: "6 Kab, 1 Kota"
  },
  {
    kode_bps: "21", provinsi: "Kepulauan Riau", ibukota: "Tanjungpinang", region: "Sumatera",
    penduduk_2026: 2385000, pertumbuhan_persen: 2.65, luas_km2: 8202, kepadatan_km2: 291,
    ipm: 80.15, kemiskinan_persen: 5.25, islam_persen: 78.4, kristen_persen: 11.9,
    katolik_persen: 2.3, hindu_persen: 0.1, buddha_persen: 7.2, konghucu_persen: 0.1,
    mata_pencaharian: "Industri Manufaktur Elektronik 42%, Perdagangan & Jasa 30%, Galangan Kapal 18%, Pariwisata 10%",
    ekonomi_sektor: "Industri Manufaktur Elektronik Batam, Galangan Kapal, Logistik Maritim",
    suku_mayoritas: "Melayu Kepulauan, Tionghoa, Jawa, Batak, Minangkabau", pdrb_kapita_juta: 154.6, jumlah_kab_kota: "5 Kab, 2 Kota"
  },
  {
    kode_bps: "31", provinsi: "DKI Jakarta", ibukota: "Jakarta Pusat", region: "Jawa",
    penduduk_2026: 10720000, pertumbuhan_persen: 0.35, luas_km2: 664, kepadatan_km2: 16145,
    ipm: 83.95, kemiskinan_persen: 4.15, islam_persen: 83.45, kristen_persen: 8.6,
    katolik_persen: 4.0, hindu_persen: 0.2, buddha_persen: 3.7, konghucu_persen: 0.05,
    mata_pencaharian: "Jasa Keuangan & Perbankan 38%, Perdagangan 30%, Industri Kreatif & IT 22%, Konstruksi 10%",
    ekonomi_sektor: "Pusat Jasa Keuangan, Perbankan, IT & Fintech, Perdagangan Internasional",
    suku_mayoritas: "Jawa, Betawi, Sunda, Tionghoa, Batak, Minangkabau", pdrb_kapita_juta: 312.5, jumlah_kab_kota: "1 Kab, 5 Kota Adm"
  },
  {
    kode_bps: "32", provinsi: "Jawa Barat", ibukota: "Bandung", region: "Jawa",
    penduduk_2026: 50850000, pertumbuhan_persen: 1.28, luas_km2: 35378, kepadatan_km2: 1437,
    ipm: 75.1, kemiskinan_persen: 7.35, islam_persen: 97.1, kristen_persen: 1.8,
    katolik_persen: 0.65, hindu_persen: 0.05, buddha_persen: 0.2, konghucu_persen: 0.2,
    mata_pencaharian: "Industri Manufaktur Otomotif 40%, Pertanian & Perkebunan 28%, Perdagangan 22%, Jasa Digital 10%",
    ekonomi_sektor: "Manufaktur Otomotif & Elektronik, Tekstil, Pertanian Padi & Teh, Ekonomi Digital",
    suku_mayoritas: "Sunda, Jawa (Cirebon/Indramayu), Betawi", pdrb_kapita_juta: 57.8, jumlah_kab_kota: "18 Kab, 9 Kota"
  },
  {
    kode_bps: "33", provinsi: "Jawa Tengah", ibukota: "Semarang", region: "Jawa",
    penduduk_2026: 38240000, pertumbuhan_persen: 0.85, luas_km2: 32801, kepadatan_km2: 1166,
    ipm: 73.85, kemiskinan_persen: 10.15, islam_persen: 96.85, kristen_persen: 1.65,
    katolik_persen: 1.1, hindu_persen: 0.05, buddha_persen: 0.15, konghucu_persen: 0.2,
    mata_pencaharian: "Pertanian & Tembakau 36%, Industri Tekstil & Makanan 32%, Perdagangan 20%, Jasa 12%",
    ekonomi_sektor: "Industri Tekstil & Garmen, Pertanian Padi & Tembakau, Industri Makanan",
    suku_mayoritas: "Jawa", pdrb_kapita_juta: 46.2, jumlah_kab_kota: "29 Kab, 6 Kota"
  },
  {
    kode_bps: "34", provinsi: "DI Yogyakarta", ibukota: "Yogyakarta", region: "Jawa",
    penduduk_2026: 3810000, pertumbuhan_persen: 1.15, luas_km2: 3133, kepadatan_km2: 1216,
    ipm: 81.55, kemiskinan_persen: 11.25, islam_persen: 92.7, kristen_persen: 2.45,
    katolik_persen: 4.5, hindu_persen: 0.15, buddha_persen: 0.1, konghucu_persen: 0.1,
    mata_pencaharian: "Pendidikan & Akademik 35%, Pariwisata & Kerajinan 32%, Industri Kreatif & IT 20%, Pertanian 13%",
    ekonomi_sektor: "Pendidikan Tinggi, Pariwisata Kebudayaan, Industri Kreatif & Start-up",
    suku_mayoritas: "Jawa, Sunda, Batak, Minangkabau", pdrb_kapita_juta: 49.8, jumlah_kab_kota: "4 Kab, 1 Kota"
  },
  {
    kode_bps: "35", provinsi: "Jawa Timur", ibukota: "Surabaya", region: "Jawa",
    penduduk_2026: 42180000, pertumbuhan_persen: 0.78, luas_km2: 47803, kepadatan_km2: 882,
    ipm: 75.15, kemiskinan_persen: 9.9, islam_persen: 96.75, kristen_persen: 1.7,
    katolik_persen: 0.65, hindu_persen: 0.25, buddha_persen: 0.2, konghucu_persen: 0.45,
    mata_pencaharian: "Industri Manufaktur 36%, Pertanian & Perkebunan Tebu 32%, Perdagangan & Logistik 22%, Jasa 10%",
    ekonomi_sektor: "Industri Manufaktur & Kimia, Pertanian Tebu & Tembakau, Perdagangan Hub Timur",
    suku_mayoritas: "Jawa, Madura, Osing, Tengger", pdrb_kapita_juta: 73.5, jumlah_kab_kota: "29 Kab, 9 Kota"
  },
  {
    kode_bps: "36", provinsi: "Banten", ibukota: "Serang", region: "Jawa",
    penduduk_2026: 12690000, pertumbuhan_persen: 1.75, luas_km2: 9663, kepadatan_km2: 1313,
    ipm: 75.75, kemiskinan_persen: 5.95, islam_persen: 94.6, kristen_persen: 2.7,
    katolik_persen: 1.15, hindu_persen: 0.1, buddha_persen: 1.25, konghucu_persen: 0.2,
    mata_pencaharian: "Industri Baja & Petrokimia 40%, Pergudangan & Logistik 28%, Perdagangan 20%, Pertanian 12%",
    ekonomi_sektor: "Industri Baja & Petrokimia Cilegon, Logistik Bandara Soekarno-Hatta, Real Estate",
    suku_mayoritas: "Banten (Sunda), Jawa, Betawi, Baduy, Tionghoa", pdrb_kapita_juta: 67.4, jumlah_kab_kota: "4 Kab, 4 Kota"
  },
  {
    kode_bps: "51", provinsi: "Bali", ibukota: "Denpasar", region: "Bali-Nusa Tenggara",
    penduduk_2026: 4490000, pertumbuhan_persen: 1.2, luas_km2: 5780, kepadatan_km2: 777,
    ipm: 78.45, kemiskinan_persen: 4.1, islam_persen: 10.15, kristen_persen: 1.65,
    katolik_persen: 0.8, hindu_persen: 86.75, buddha_persen: 0.6, konghucu_persen: 0.05,
    mata_pencaharian: "Pariwisata & Hospitaliti 52%, Industri Kerajinan Seni 22%, Pertanian & Perkebunan 16%, Perdagangan 10%",
    ekonomi_sektor: "Pariwisata Internasional, Hospitaliti & Kuliner, Seni Kerajinan & Ekspor",
    suku_mayoritas: "Bali (Aga & Majapahit), Jawa, Sasak", pdrb_kapita_juta: 64.8, jumlah_kab_kota: "8 Kab, 1 Kota"
  },
  {
    kode_bps: "52", provinsi: "Nusa Tenggara Barat", ibukota: "Mataram", region: "Bali-Nusa Tenggara",
    penduduk_2026: 5645000, pertumbuhan_persen: 1.35, luas_km2: 18572, kepadatan_km2: 304,
    ipm: 70.8, kemiskinan_persen: 13.15, islam_persen: 96.8, kristen_persen: 0.25,
    katolik_persen: 0.15, hindu_persen: 2.5, buddha_persen: 0.3, konghucu_persen: 0.0,
    mata_pencaharian: "Pertanian Padi & Jagung 42%, Tambang Mineral 24%, Pariwisata Mandalika 20%, Perikanan 14%",
    ekonomi_sektor: "Pertambangan Tembaga & Emas Amman Mineral, Pariwisata Mandalika, Jagung",
    suku_mayoritas: "Sasak (Lombok), Bima (Mbojo), Sumbawa (Samawa)", pdrb_kapita_juta: 35.6, jumlah_kab_kota: "8 Kab, 2 Kota"
  },
  {
    kode_bps: "53", provinsi: "Nusa Tenggara Timur", ibukota: "Kupang", region: "Bali-Nusa Tenggara",
    penduduk_2026: 5720000, pertumbuhan_persen: 1.28, luas_km2: 48718, kepadatan_km2: 117,
    ipm: 69.1, kemiskinan_persen: 19.45, islam_persen: 9.4, kristen_persen: 36.3,
    katolik_persen: 53.95, hindu_persen: 0.15, buddha_persen: 0.05, konghucu_persen: 0.15,
    mata_pencaharian: "Peternakan & Pertanian Lahan Kering 50%, Perikanan Tangkap 22%, Jasa Pariwisata 16%, Kerajinan Tenun 12%",
    ekonomi_sektor: "Peternakan Sapi Potong, Kopi Flores, Pariwisata Premium Labuan Bajo",
    suku_mayoritas: "Atoni (Timor), Manggarai, Sumba, Rote, Flores", pdrb_kapita_juta: 24.1, jumlah_kab_kota: "21 Kab, 1 Kota"
  },
  {
    kode_bps: "61", provinsi: "Kalimantan Barat", ibukota: "Pontianak", region: "Kalimantan",
    penduduk_2026: 5710000, pertumbuhan_persen: 1.45, luas_km2: 147307, kepadatan_km2: 39,
    ipm: 71.05, kemiskinan_persen: 6.55, islam_persen: 60.1, kristen_persen: 11.5,
    katolik_persen: 22.35, hindu_persen: 0.05, buddha_persen: 5.8, konghucu_persen: 0.2,
    mata_pencaharian: "Perkebunan Sawit & Karet 44%, Industri Smelter Bauksit 24%, Perdagangan 20%, Perikanan 12%",
    ekonomi_sektor: "Perkebunan Kelapa Sawit & Karet, Bauksit & Smelter Alumina, Pelabuhan Kijing",
    suku_mayoritas: "Dayak, Melayu, Tionghoa (Teochew/Hakka), Jawa, Madura", pdrb_kapita_juta: 52.8, jumlah_kab_kota: "12 Kab, 2 Kota"
  },
  {
    kode_bps: "62", provinsi: "Kalimantan Tengah", ibukota: "Palangka Raya", region: "Kalimantan",
    penduduk_2026: 2820000, pertumbuhan_persen: 1.65, luas_km2: 153564, kepadatan_km2: 18,
    ipm: 74.2, kemiskinan_persen: 5.1, islam_persen: 74.3, kristen_persen: 16.6,
    katolik_persen: 3.2, hindu_persen: 5.75, buddha_persen: 0.1, konghucu_persen: 0.05,
    mata_pencaharian: "Perkebunan Sawit 46%, Pertambangan Batubara & Bauksit 26%, Pertanian Food Estate 16%, Jasa 12%",
    ekonomi_sektor: "Perkebunan Kelapa Sawit, Pertambangan Batubara & Bauksit, Kawasan Food Estate",
    suku_mayoritas: "Dayak (Ngaju, Ot Danum, Maanyan), Banjar, Jawa", pdrb_kapita_juta: 78.4, jumlah_kab_kota: "13 Kab, 1 Kota"
  },
  {
    kode_bps: "63", provinsi: "Kalimantan Selatan", ibukota: "Banjarbaru", region: "Kalimantan",
    penduduk_2026: 4310000, pertumbuhan_persen: 1.6, luas_km2: 38744, kepadatan_km2: 111,
    ipm: 75.15, kemiskinan_persen: 4.2, islam_persen: 97.05, kristen_persen: 1.3,
    katolik_persen: 0.5, hindu_persen: 0.45, buddha_persen: 0.4, konghucu_persen: 0.3,
    mata_pencaharian: "Pertambangan Batubara 38%, Perkebunan Sawit & Karet 30%, Perdagangan Sungai 20%, Jasa 12%",
    ekonomi_sektor: "Pertambangan Batubara, Perkebunan Kelapa Sawit & Karet, Perdagangan",
    suku_mayoritas: "Banjar, Jawa, Bugis, Dayak Meratus", pdrb_kapita_juta: 62.0, jumlah_kab_kota: "11 Kab, 2 Kota"
  },
  {
    kode_bps: "64", provinsi: "Kalimantan Timur", ibukota: "Samarinda", region: "Kalimantan",
    penduduk_2026: 4120000, pertumbuhan_persen: 2.1, luas_km2: 129066, kepadatan_km2: 32,
    ipm: 78.8, kemiskinan_persen: 5.85, islam_persen: 87.35, kristen_persen: 7.6,
    katolik_persen: 4.3, hindu_persen: 0.2, buddha_persen: 0.45, konghucu_persen: 0.1,
    mata_pencaharian: "Konstruksi & IKN 35%, Pertambangan Batubara & Migas 32%, Industri Kimia 18%, Perdagangan 15%",
    ekonomi_sektor: "Pembangunan IKN Nusantara, Pertambangan Batubara & Migas, Pupuk & Petrokimia",
    suku_mayoritas: "Jawa, Bugis, Banjar, Dayak (Kutai, Kenyah), Melayu", pdrb_kapita_juta: 218.0, jumlah_kab_kota: "7 Kab, 3 Kota"
  },
  {
    kode_bps: "65", provinsi: "Kalimantan Utara", ibukota: "Tanjung Selor", region: "Kalimantan",
    penduduk_2026: 760000, pertumbuhan_persen: 2.45, luas_km2: 75468, kepadatan_km2: 10,
    ipm: 73.4, kemiskinan_persen: 6.3, islam_persen: 73.1, kristen_persen: 20.2,
    katolik_persen: 6.1, hindu_persen: 0.1, buddha_persen: 0.4, konghucu_persen: 0.1,
    mata_pencaharian: "Industri Kawasan Hijau KIPI 36%, Perikanan Tambak Udang 30%, Perkebunan 20%, Jasa 14%",
    ekonomi_sektor: "Kawasan Industri Hijau (KIPI Tanah Kuning), PLTA Kayan, Perikanan Tambak Udang",
    suku_mayoritas: "Dayak (Lundayeh, Kenyah), Tidung, Bugis, Jawa, Bulungan", pdrb_kapita_juta: 182.5, jumlah_kab_kota: "4 Kab, 1 Kota"
  },
  {
    kode_bps: "71", provinsi: "Sulawesi Utara", ibukota: "Manado", region: "Sulawesi",
    penduduk_2026: 2715000, pertumbuhan_persen: 1.15, luas_km2: 13856, kepadatan_km2: 196,
    ipm: 75.95, kemiskinan_persen: 6.95, islam_persen: 31.8, kristen_persen: 63.2,
    katolik_persen: 4.4, hindu_persen: 0.35, buddha_persen: 0.15, konghucu_persen: 0.1,
    mata_pencaharian: "Perikanan & Kelautan 34%, Pariwisata Bahari 28%, Pertanian Kelapa/Cengkeh 22%, Jasa 16%",
    ekonomi_sektor: "Pariwisata Bahari (Likupang & Bunaken), Ekspor Ikan Tuna, Kelapa & Cengkeh",
    suku_mayoritas: "Minahasa, Bolaang Mongondow, Sangihe, Talaud, Gorontalo", pdrb_kapita_juta: 66.2, jumlah_kab_kota: "11 Kab, 4 Kota"
  },
  {
    kode_bps: "72", provinsi: "Sulawesi Tengah", ibukota: "Palu", region: "Sulawesi",
    penduduk_2026: 3195000, pertumbuhan_persen: 2.15, luas_km2: 61841, kepadatan_km2: 52,
    ipm: 72.3, kemiskinan_persen: 11.7, islam_persen: 78.9, kristen_persen: 16.5,
    katolik_persen: 0.9, hindu_persen: 3.6, buddha_persen: 0.1, konghucu_persen: 0.0,
    mata_pencaharian: "Industri Smelter Nikel Morowali 40%, Perkebunan Kakao 30%, Pertanian Pangan 18%, Perdagangan 12%",
    ekonomi_sektor: "Hilirisasi Nikel & Smelter (Kawasan Industri Morowali), Pertanian Kakao",
    suku_mayoritas: "Kaili, Bugis, Kulawi, Pamona, Banggai, Saluan, Bali", pdrb_kapita_juta: 110.5, jumlah_kab_kota: "12 Kab, 1 Kota"
  },
  {
    kode_bps: "73", provinsi: "Sulawesi Selatan", ibukota: "Makassar", region: "Sulawesi",
    penduduk_2026: 9580000, pertumbuhan_persen: 1.1, luas_km2: 46717, kepadatan_km2: 205,
    ipm: 74.6, kemiskinan_persen: 8.1, islam_persen: 89.9, kristen_persen: 7.45,
    katolik_persen: 1.7, hindu_persen: 0.7, buddha_persen: 0.2, konghucu_persen: 0.05,
    mata_pencaharian: "Pertanian Padi Lumbung 38%, Perdagangan Hub KTI 28%, Hilirisasi Nikel 18%, Perikanan 16%",
    ekonomi_sektor: "Lumbung Padi Nasional, Hilirisasi Nikel (Bantaeng/Luwu), Hub Logistik & Jasa KTI",
    suku_mayoritas: "Bugis, Makassar, Toraja, Mandar, Duri", pdrb_kapita_juta: 70.8, jumlah_kab_kota: "21 Kab, 3 Kota"
  },
  {
    kode_bps: "74", provinsi: "Sulawesi Tenggara", ibukota: "Kendari", region: "Sulawesi",
    penduduk_2026: 2865000, pertumbuhan_persen: 2.3, luas_km2: 38067, kepadatan_km2: 75,
    ipm: 73.4, kemiskinan_persen: 10.8, islam_persen: 95.25, kristen_persen: 2.4,
    katolik_persen: 0.6, hindu_persen: 1.65, buddha_persen: 0.05, konghucu_persen: 0.05,
    mata_pencaharian: "Industri Tambang Nikel 42%, Perikanan Laut 26%, Pertanian Kakao 18%, Jasa 14%",
    ekonomi_sektor: "Hilirisasi Nikel & Baterai Listrik (Konawe/Kolaka), Aspal Buton, Perikanan Laut",
    suku_mayoritas: "Tolaki, Buton, Muna, Bugis, Moronene, Jawa", pdrb_kapita_juta: 72.4, jumlah_kab_kota: "15 Kab, 2 Kota"
  },
  {
    kode_bps: "75", provinsi: "Gorontalo", ibukota: "Gorontalo", region: "Sulawesi",
    penduduk_2026: 1265000, pertumbuhan_persen: 1.65, luas_km2: 11257, kepadatan_km2: 112,
    ipm: 71.4, kemiskinan_persen: 14.5, islam_persen: 98.05, kristen_persen: 1.5,
    katolik_persen: 0.1, hindu_persen: 0.3, buddha_persen: 0.05, konghucu_persen: 0.0,
    mata_pencaharian: "Pertanian Jagung & Kelapa 46%, Perikanan Teluk Tomini 24%, Perdagangan 18%, Jasa 12%",
    ekonomi_sektor: "Pertanian Jagung Kuning & Kelapa, Perikanan Tangkap Teluk Tomini",
    suku_mayoritas: "Gorontalo, Suwawa, Atinggola, Minahasa, Bugis", pdrb_kapita_juta: 41.5, jumlah_kab_kota: "5 Kab, 1 Kota"
  },
  {
    kode_bps: "76", provinsi: "Sulawesi Barat", ibukota: "Mamuju", region: "Sulawesi",
    penduduk_2026: 1515000, pertumbuhan_persen: 1.85, luas_km2: 16787, kepadatan_km2: 90,
    ipm: 70.35, kemiskinan_persen: 11.2, islam_persen: 82.8, kristen_persen: 14.75,
    katolik_persen: 1.15, hindu_persen: 1.25, buddha_persen: 0.05, konghucu_persen: 0.0,
    mata_pencaharian: "Perkebunan Kakao & Sawit 45%, Perikanan Selat Makassar 25%, Pertanian 18%, Perdagangan 12%",
    ekonomi_sektor: "Perkebunan Kelapa Sawit & Kakao, Perikanan Tangkap Selat Makassar",
    suku_mayoritas: "Mandar, Toraja, Bugis, Mamasa, Jawa", pdrb_kapita_juta: 40.2, jumlah_kab_kota: "6 Kab"
  },
  {
    kode_bps: "81", provinsi: "Maluku", ibukota: "Ambon", region: "Maluku-Papua",
    penduduk_2026: 1955000, pertumbuhan_persen: 1.3, luas_km2: 46914, kepadatan_km2: 42,
    ipm: 73.3, kemiskinan_persen: 15.6, islam_persen: 52.85, kristen_persen: 39.7,
    katolik_persen: 7.15, hindu_persen: 0.15, buddha_persen: 0.1, konghucu_persen: 0.05,
    mata_pencaharian: "Perikanan Laut (LIN) 42%, Perkebunan Rempah (Pala/Cengkeh) 28%, Jasa & Pemerintahan 18%, Pariwisata 12%",
    ekonomi_sektor: "Lumbung Ikan Nasional (LIN), Proyek Gas Alam Abadi Masela, Rempah",
    suku_mayoritas: "Ambon, Kei, Tanimbar, Seram, Buru, Banda", pdrb_kapita_juta: 31.8, jumlah_kab_kota: "9 Kab, 2 Kota"
  },
  {
    kode_bps: "82", provinsi: "Maluku Utara", ibukota: "Sofifi", region: "Maluku-Papua",
    penduduk_2026: 1395000, pertumbuhan_persen: 2.25, luas_km2: 31982, kepadatan_km2: 44,
    ipm: 71.9, kemiskinan_persen: 6.1, islam_persen: 75.35, kristen_persen: 23.9,
    katolik_persen: 0.65, hindu_persen: 0.05, buddha_persen: 0.05, konghucu_persen: 0.0,
    mata_pencaharian: "Hilirisasi Nikel Weda Bay 45%, Pertanian Rempah 25%, Perikanan Laut 18%, Jasa 12%",
    ekonomi_sektor: "Hilirisasi Nikel Terbesar (Weda Bay & Obi), Emas Gosowong, Cengkeh & Pala",
    suku_mayoritas: "Ternate, Tidore, Tobelo, Galela, Sula, Makian", pdrb_kapita_juta: 82.5, jumlah_kab_kota: "8 Kab, 2 Kota"
  },
  {
    kode_bps: "91", provinsi: "Papua", ibukota: "Jayapura", region: "Maluku-Papua",
    penduduk_2026: 1095000, pertumbuhan_persen: 1.95, luas_km2: 81049, kepadatan_km2: 14,
    ipm: 63.15, kemiskinan_persen: 25.8, islam_persen: 35.8, kristen_persen: 60.1,
    katolik_persen: 3.75, hindu_persen: 0.15, buddha_persen: 0.15, konghucu_persen: 0.05,
    mata_pencaharian: "Pemerintahan & Jasa KTI 38%, Perikanan Samudera Pasifik 26%, Pertanian Sawit 22%, Perdagangan 14%",
    ekonomi_sektor: "Pusat Pemerintahan & Jasa KTI, Perikanan Samudera Pasifik, Perkebunan Sawit",
    suku_mayoritas: "Sentani, Biak, Yapen, Tabi, Waropen, Jawa", pdrb_kapita_juta: 78.6, jumlah_kab_kota: "8 Kab, 1 Kota"
  },
  {
    kode_bps: "92", provinsi: "Papua Barat", ibukota: "Manokwari", region: "Maluku-Papua",
    penduduk_2026: 585000, pertumbuhan_persen: 1.85, luas_km2: 64125, kepadatan_km2: 9,
    ipm: 67.85, kemiskinan_persen: 20.7, islam_persen: 44.9, kristen_persen: 48.7,
    katolik_persen: 6.1, hindu_persen: 0.1, buddha_persen: 0.15, konghucu_persen: 0.05,
    mata_pencaharian: "Industri Gas Alam LNG Tangguh 40%, Perkebunan Pala Fakfak 25%, Perikanan 20%, Jasa 15%",
    ekonomi_sektor: "Kilang Gas Alam Cair LNG Tangguh (Teluk Bintuni), Pala Tomandin Fakfak",
    suku_mayoritas: "Arfak, Doreri, Kaimana, Fakfak, Biak", pdrb_kapita_juta: 115.0, jumlah_kab_kota: "7 Kab"
  },
  {
    kode_bps: "93", provinsi: "Papua Selatan", ibukota: "Merauke", region: "Maluku-Papua",
    penduduk_2026: 548000, pertumbuhan_persen: 2.1, luas_km2: 131493, kepadatan_km2: 4,
    ipm: 66.8, kemiskinan_persen: 23.9, islam_persen: 27.5, kristen_persen: 20.4,
    katolik_persen: 51.75, hindu_persen: 0.2, buddha_persen: 0.1, konghucu_persen: 0.05,
    mata_pencaharian: "Kawasan Food Estate Tebu/Padi 46%, Perikanan Tangkap 24%, Kerajinan & Kehutanan 18%, Jasa 12%",
    ekonomi_sektor: "Kawasan Strategis Pangan Nasional (Food Estate Tebu & Padi Merauke), Perikanan",
    suku_mayoritas: "Marind-Anim, Asmat, Mandobo, Yei, Muyu, Jawa (Transmigran)", pdrb_kapita_juta: 54.2, jumlah_kab_kota: "4 Kab"
  },
  {
    kode_bps: "94", provinsi: "Papua Tengah", ibukota: "Nabire", region: "Maluku-Papua",
    penduduk_2026: 1485000, pertumbuhan_persen: 2.15, luas_km2: 66129, kepadatan_km2: 22,
    ipm: 60.75, kemiskinan_persen: 36.2, islam_persen: 12.2, kristen_persen: 67.5,
    katolik_persen: 20.1, hindu_persen: 0.1, buddha_persen: 0.05, konghucu_persen: 0.05,
    mata_pencaharian: "Pertambangan Emas Freeport 48%, Pertanian Tradisional & Kopi 26%, Perdagangan 14%, Jasa 12%",
    ekonomi_sektor: "Tambang Emas & Tembaga Raksasa PT Freeport Indonesia (Grasberg/Tembagapura)",
    suku_mayoritas: "Mee, Amungme, Moni, Damal, Wate", pdrb_kapita_juta: 168.0, jumlah_kab_kota: "8 Kab"
  },
  {
    kode_bps: "95", provinsi: "Papua Pegunungan", ibukota: "Wamena", region: "Maluku-Papua",
    penduduk_2026: 1495000, pertumbuhan_persen: 2.05, luas_km2: 52316, kepadatan_km2: 29,
    ipm: 57.4, kemiskinan_persen: 38.6, islam_persen: 2.4, kristen_persen: 89.8,
    katolik_persen: 7.65, hindu_persen: 0.05, buddha_persen: 0.05, konghucu_persen: 0.05,
    mata_pencaharian: "Pertanian Ubi Jalar & Hortikultura 52%, Kopi Arabika Wamena 24%, Wisata Lembah Baliem 14%, Jasa 10%",
    ekonomi_sektor: "Pertanian Ubi Jalar, Kopi Arabika Wamena, Pariwisata Budaya Lembah Baliem",
    suku_mayoritas: "Dani, Lani, Yali, Nduga, Hubula, Walak", pdrb_kapita_juta: 26.5, jumlah_kab_kota: "8 Kab"
  },
  {
    kode_bps: "96", provinsi: "Papua Barat Daya", ibukota: "Sorong", region: "Maluku-Papua",
    penduduk_2026: 638000, pertumbuhan_persen: 2.1, luas_km2: 39167, kepadatan_km2: 16,
    ipm: 69.15, kemiskinan_persen: 18.2, islam_persen: 38.6, kristen_persen: 53.4,
    katolik_persen: 7.6, hindu_persen: 0.15, buddha_persen: 0.2, konghucu_persen: 0.05,
    mata_pencaharian: "Pariwisata Bahari Raja Ampat 38%, Migas & Kilang Kasim 28%, Perikanan Tangkap 20%, Jasa KEK 14%",
    ekonomi_sektor: "Pariwisata Bahari Raja Ampat, Kilang Minyak Kasim, KEK Sorong",
    suku_mayoritas: "Moi, Maybrat, Ayamaru, Tehit, Biak, Raja Ampat", pdrb_kapita_juta: 76.8, jumlah_kab_kota: "5 Kab, 1 Kota"
  }
];

function seedInitialProvinces() {
  console.log('Seeding 38 Provinces to Database...');
  const stmt = db.prepare(`
    INSERT INTO provinces (
      kode_bps, provinsi, ibukota, region, penduduk_2026, pertumbuhan_persen,
      luas_km2, kepadatan_km2, ipm, kemiskinan_persen,
      islam_persen, kristen_persen, katolik_persen, hindu_persen, buddha_persen, konghucu_persen,
      mata_pencaharian, ekonomi_sektor, suku_mayoritas, pdrb_kapita_juta, jumlah_kab_kota
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  for (const p of INITIAL_PROVINCES) {
    stmt.run(
      p.kode_bps, p.provinsi, p.ibukota, p.region, p.penduduk_2026, p.pertumbuhan_persen,
      p.luas_km2, p.kepadatan_km2, p.ipm, p.kemiskinan_persen,
      p.islam_persen, p.kristen_persen, p.katolik_persen, p.hindu_persen, p.buddha_persen, p.konghucu_persen,
      p.mata_pencaharian, p.ekonomi_sektor, p.suku_mayoritas, p.pdrb_kapita_juta, p.jumlah_kab_kota
    );
  }
  console.log('✅ Seeded 38 Provinces successfully.');
}

// Database API Methods
const Database = {
  init: initSchema,

  // Users
  getUserByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  updateUserCredentials(currentUsername, newUsername, newPassword) {
    const user = this.getUserByUsername(currentUsername);
    if (!user) return { success: false, error: 'User tidak ditemukan' };

    let hash = user.password_hash;
    let salt = user.salt;
    if (newPassword) {
      const hashed = hashPassword(newPassword);
      hash = hashed.hash;
      salt = hashed.salt;
    }

    const finalUsername = newUsername || currentUsername;
    db.prepare(`
      UPDATE users
      SET username = ?, password_hash = ?, salt = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(finalUsername, hash, salt, user.id);

    return { success: true, username: finalUsername };
  },

  verifyLogin(username, password) {
    const user = this.getUserByUsername(username);
    if (!user) return { success: false, error: 'Username tidak ditemukan' };

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) return { success: false, error: 'Password salah' };

    return { success: true, user: { id: user.id, username: user.username, role: user.role } };
  },

  // Provinces
  getAllProvinces() {
    return db.prepare('SELECT * FROM provinces ORDER BY penduduk_2026 DESC').all();
  },

  getProvinceByName(name) {
    if (!name) return null;
    return db.prepare('SELECT * FROM provinces WHERE LOWER(provinsi) = LOWER(?) OR LOWER(provinsi) LIKE LOWER(?)').get(name, `%${name}%`);
  },

  getProvinceByCode(kode) {
    return db.prepare('SELECT * FROM provinces WHERE kode_bps = ?').get(kode);
  },

  updateProvinceData(provData) {
    const existing = this.getProvinceByName(provData.provinsi);
    if (!existing) {
      return { success: false, error: `Provinsi "${provData.provinsi}" tidak ditemukan dalam daftar 38 provinsi resmi.` };
    }

    // Auto-calculate density if needed
    const luas = provData.luas_km2 || existing.luas_km2;
    const penduduk = provData.penduduk_2026 || existing.penduduk_2026;
    const kepadatan = luas > 0 ? Math.round(penduduk / luas) : existing.kepadatan_km2;

    db.prepare(`
      UPDATE provinces
      SET 
        ibukota = COALESCE(?, ibukota),
        region = COALESCE(?, region),
        penduduk_2026 = COALESCE(?, penduduk_2026),
        pertumbuhan_persen = COALESCE(?, pertumbuhan_persen),
        luas_km2 = COALESCE(?, luas_km2),
        kepadatan_km2 = ?,
        ipm = COALESCE(?, ipm),
        kemiskinan_persen = COALESCE(?, kemiskinan_persen),
        islam_persen = COALESCE(?, islam_persen),
        kristen_persen = COALESCE(?, kristen_persen),
        katolik_persen = COALESCE(?, katolik_persen),
        hindu_persen = COALESCE(?, hindu_persen),
        buddha_persen = COALESCE(?, buddha_persen),
        konghucu_persen = COALESCE(?, konghucu_persen),
        mata_pencaharian = COALESCE(?, mata_pencaharian),
        ekonomi_sektor = COALESCE(?, ekonomi_sektor),
        suku_mayoritas = COALESCE(?, suku_mayoritas),
        pdrb_kapita_juta = COALESCE(?, pdrb_kapita_juta),
        jumlah_kab_kota = COALESCE(?, jumlah_kab_kota),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      provData.ibukota || null,
      provData.region || null,
      provData.penduduk_2026 || null,
      provData.pertumbuhan_persen || null,
      provData.luas_km2 || null,
      kepadatan,
      provData.ipm || null,
      provData.kemiskinan_persen || null,
      provData.islam_persen !== undefined ? provData.islam_persen : null,
      provData.kristen_persen !== undefined ? provData.kristen_persen : null,
      provData.katolik_persen !== undefined ? provData.katolik_persen : null,
      provData.hindu_persen !== undefined ? provData.hindu_persen : null,
      provData.buddha_persen !== undefined ? provData.buddha_persen : null,
      provData.konghucu_persen !== undefined ? provData.konghucu_persen : null,
      provData.mata_pencaharian || null,
      provData.ekonomi_sektor || null,
      provData.suku_mayoritas || null,
      provData.pdrb_kapita_juta || null,
      provData.jumlah_kab_kota || null,
      existing.id
    );

    const updated = db.prepare('SELECT * FROM provinces WHERE id = ?').get(existing.id);
    return { success: true, previous: existing, updated };
  },

  // Summary KPI Stats
  getSummaryStats() {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_provinsi,
        SUM(penduduk_2026) as total_penduduk,
        SUM(luas_km2) as total_luas,
        AVG(ipm) as rata_ipm,
        AVG(kemiskinan_persen) as rata_kemiskinan,
        AVG(kepadatan_km2) as rata_kepadatan
      FROM provinces
    `).get();

    return {
      total_provinsi: stats.total_provinsi,
      total_penduduk: stats.total_penduduk,
      total_luas_km2: stats.total_luas,
      rata_rata_ipm: parseFloat((stats.rata_ipm || 0).toFixed(2)),
      rata_rata_kemiskinan: parseFloat((stats.rata_kemiskinan || 0).toFixed(2)),
      kepadatan_nasional: parseFloat((stats.total_luas > 0 ? stats.total_penduduk / stats.total_luas : 0).toFixed(1))
    };
  },

  // Logs
  logUpload(filename, uploadedBy, status, affectedProvinces, message, details = '') {
    db.prepare(`
      INSERT INTO upload_logs (filename, uploaded_by, status, affected_provinces, message, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      filename,
      uploadedBy,
      status,
      Array.isArray(affectedProvinces) ? affectedProvinces.join(', ') : (affectedProvinces || ''),
      message || '',
      typeof details === 'object' ? JSON.stringify(details) : String(details)
    );
  },

  getUploadLogs(limit = 20) {
    return db.prepare('SELECT * FROM upload_logs ORDER BY id DESC LIMIT ?').all(limit);
  }
};

// Initialize schema on load
Database.init();

module.exports = Database;
