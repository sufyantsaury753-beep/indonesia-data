/**
 * Nusantara DataLens — Frontend Application Logic
 * Portal Data Kependudukan & Geospasial Indonesia 2026
 */

// Global State
let PROVINCES_DATA = {};
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

// Initialize Map
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

// Name Normalizer
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

// Color Scaler for 5 Clean Public Metrics
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
    if (s.includes('industri') || s.includes('manufaktur') || s.includes('otomotif') || s.includes('elektronik')) return '#2563eb';
    if (s.includes('nikel') || s.includes('tambang') || s.includes('batubara') || s.includes('migas') || s.includes('emas')) return '#f59e0b';
    if (s.includes('sawit') || s.includes('perkebunan') || s.includes('karet') || s.includes('padi') || s.includes('pangan') || s.includes('food estate')) return '#10b981';
    if (s.includes('wisata') || s.includes('pariwisata') || s.includes('hospitaliti')) return '#f43f5e';
    if (s.includes('perikanan') || s.includes('maritim') || s.includes('laut')) return '#06b6d4';
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

// Map Feature Style
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

  return {
    fillColor: getMetricColor(val, currentMetric),
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

// Fetch Provinces Data from Backend API
async function loadProvincesData() {
  try {
    const res = await fetch('/api/provinces');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      PROVINCES_DATA = {};
      json.data.forEach(p => {
        PROVINCES_DATA[p.provinsi] = p;
      });
    }
  } catch (err) {
    console.warn('API fetch failed, checking memory data...', err);
  }

  // Also fetch summary stats
  try {
    const resStats = await fetch('/api/stats/summary');
    const jsonStats = await resStats.json();
    if (jsonStats.success && jsonStats.stats) {
      updateKPIBanner(jsonStats.stats);
    }
  } catch (e) {}

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

// Initialize Leaflet GeoJSON
function initMapLayers() {
  const geojsonSource = window.GEOJSON_DATA_FALLBACK || window.GEOJSON_DATA;
  if (!geojsonSource) return;

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
            if (currentMetric === 'penduduk') valText = `${p.penduduk_2026.toLocaleString('id-ID')} Jiwa`;
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
    map.fitBounds(group.getBounds(), { padding: [25, 25] });
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
    alertBox.className = 'alert danger';
    alertBox.innerHTML = `<strong>Error:</strong> Gagal terhubung ke server: ${err.message}`;
    alertBox.style.display = 'block';
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

    // If it's a PDF and PDF.js is loaded, extract text client-side for 100% accuracy
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
      // Plain text fallback
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

      // Render Diff
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
      if (activeProvinceKey && json.affectedProvinces.includes(activeProvinceKey)) {
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
  try {
    const res = await fetch('/api/template/text');
    const text = await res.text();
    await navigator.clipboard.writeText(text);
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
  await loadProvincesData();
  initMapLayers();
  checkAdminAuth();
});
