/**
 * Automated Verification & Test Suite
 * Nusantara DataLens
 */

const http = require('node:http');
const server = require('./server.js');
const Database = require('./server/database.js');
const Auth = require('./server/auth.js');
const PDFParser = require('./server/pdfParser.js');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (bodyData && typeof bodyData === 'object') {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        let parsed = null;
        try {
          parsed = JSON.parse(raw);
        } catch (e) {
          parsed = raw;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', err => reject(err));

    if (bodyData) {
      req.write(typeof bodyData === 'object' ? JSON.stringify(bodyData) : String(bodyData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 MEMULAI TEST SUITE: PORTAL KEPENDUDUKAN 2026');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  }

  try {
    // 1. Test GET /api/stats/summary
    const resSummary = await makeRequest('/api/stats/summary');
    assert(resSummary.status === 200, 'GET /api/stats/summary returns 200');
    assert(resSummary.body?.stats?.total_provinsi === 38, 'Database has 38 provinces');
    assert(resSummary.body?.stats?.total_penduduk > 280000000, 'Total national population > 280 Juta');

    // 2. Test GET /api/provinces
    const resProvinces = await makeRequest('/api/provinces');
    assert(resProvinces.status === 200, 'GET /api/provinces returns 200');
    assert(resProvinces.body?.data?.length === 38, 'List contains all 38 provinces');

    // 3. Test GET /api/provinces/Jawa%20Barat
    const resJabar = await makeRequest('/api/provinces/Jawa%20Barat');
    assert(resJabar.status === 200, 'GET /api/provinces/Jawa Barat returns 200');
    assert(resJabar.body?.data?.provinsi === 'Jawa Barat', 'Province name is Jawa Barat');

    // 4. Test Admin Login (Default admin / admin123)
    const resLogin = await makeRequest('/api/auth/login', { method: 'POST' }, { username: 'admin', password: 'admin123' });
    assert(resLogin.status === 200 && resLogin.body?.success === true, 'Admin login with default credentials succeeds');
    const adminToken = resLogin.body?.token;
    assert(!!adminToken, 'Admin token issued upon login');

    // 5. Test Auth Verification with Token
    const resMe = await makeRequest('/api/auth/me', { headers: { 'Authorization': `Bearer ${adminToken}` } });
    assert(resMe.status === 200 && resMe.body?.user?.username === 'admin', 'Auth session verified for admin');

    // 6. Test Change Credentials
    const resChangeCred = await makeRequest('/api/auth/change-credentials', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }, {
      currentPassword: 'admin123',
      newUsername: 'superadmin',
      newPassword: 'newpassword123'
    });
    assert(resChangeCred.status === 200 && resChangeCred.body?.success === true, 'Change username to "superadmin" & new password succeeds');
    const newToken = resChangeCred.body?.token;

    // Test old credentials fail
    const resOldLogin = await makeRequest('/api/auth/login', { method: 'POST' }, { username: 'admin', password: 'admin123' });
    assert(resOldLogin.status === 401, 'Old credentials are now rejected');

    // Test new credentials succeed
    const resNewLogin = await makeRequest('/api/auth/login', { method: 'POST' }, { username: 'superadmin', password: 'newpassword123' });
    assert(resNewLogin.status === 200 && resNewLogin.body?.success === true, 'New credentials (superadmin / newpassword123) succeed');

    // Change back to admin / admin123 for convenience
    await makeRequest('/api/auth/change-credentials', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resNewLogin.body?.token}` }
    }, {
      currentPassword: 'newpassword123',
      newUsername: 'admin',
      newPassword: 'admin123'
    });
    const finalLogin = await makeRequest('/api/auth/login', { method: 'POST' }, { username: 'admin', password: 'admin123' });
    const finalToken = finalLogin.body?.token;
    assert(!!finalToken, 'Reset admin credentials verified');

    // 7. Test Download Template PDF & Text
    const resTplPdf = await makeRequest('/api/template/pdf');
    assert(resTplPdf.status === 200 && resTplPdf.headers['content-type'] === 'application/pdf', 'GET /api/template/pdf serves valid PDF stream');

    const resTplTxt = await makeRequest('/api/template/text');
    assert(resTplTxt.status === 200 && typeof resTplTxt.body === 'string' && resTplTxt.body.includes('PROVINSI:'), 'GET /api/template/text serves valid template structure');

    // 8. Test PDF Upload with INVALID FORMAT (Rejected)
    const invalidText = `
      PROVINSI: Jawa Barat
      JUMLAH_PENDUDUK: 50 Juta
      ISLAM: 50%
      KRISTEN: 10%
      KATOLIK: 5%
      HINDU: 5%
      BUDDHA: 5%
      KONGHUCU: 5%
      MATA_PENCAHARIAN: Industri
    `; // Total religion = 80% (mismatch with 100%)
    const resUploadInvalid = await makeRequest('/api/upload-pdf', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${finalToken}` }
    }, {
      filename: 'invalid_data.pdf',
      text: invalidText
    });
    assert(resUploadInvalid.status === 400 && resUploadInvalid.body?.success === false, 'Invalid format with wrong religion sum is strictly rejected');
    assert(resUploadInvalid.body?.errors?.length > 0, 'Error diagnostics returned to admin');

    // 9. Test PDF Upload with VALID FORMAT (Accepted & Database Updated)
    const validUpdateText = `
      =======================================================
      FORMAT RESMI PEMBARUAN DATA SOSIO-DEMOGRAFI PROVINSI
      =======================================================
      PROVINSI: Jawa Barat
      IBUKOTA: Bandung
      REGION: Jawa
      JUMLAH_PENDUDUK: 52000000
      LUAS_KM2: 35378
      IPM: 76.50
      KEMISKINAN_PERSEN: 6.80

      [KOMPOSISI_AGAMA]
      ISLAM: 96.50%
      KRISTEN: 2.00%
      KATOLIK: 0.80%
      HINDU: 0.20%
      BUDDHA: 0.30%
      KONGHUCU: 0.20%

      [SOSIO_EKONOMI]
      MATA_PENCAHARIAN: Industri Manufaktur & Otomotif 50%, Agroindustri Pertanian & Teh 30%, Perdagangan & Digital 20%
      SEKTOR_UNGGULAN: Otomotif Cikarang-Karawang, Tekstil Majalaya, Teh Preanger
      SUKU_MAYORITAS: Sunda, Jawa, Betawi
      PDRB_KAPITA_JUTA: 62.5
      JUMLAH_KAB_KOTA: 18 Kab, 9 Kota
      =======================================================
    `;
    const resUploadValid = await makeRequest('/api/upload-pdf', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${finalToken}` }
    }, {
      filename: 'pembaruan_jabar_2026.pdf',
      text: validUpdateText
    });
    assert(resUploadValid.status === 200 && resUploadValid.body?.success === true, 'Valid PDF upload accepted and applied to database');

    // Verify database update reflected in API
    const resCheckUpdated = await makeRequest('/api/provinces/Jawa%20Barat');
    assert(resCheckUpdated.body?.data?.penduduk_2026 === 52000000, 'Database reflected updated population: 52.000.000');
    assert(resCheckUpdated.body?.data?.ipm === 76.50, 'Database reflected updated IPM: 76.50');
    assert(resCheckUpdated.body?.data?.islam_persen === 96.50, 'Database reflected updated Islam %: 96.50%');

    // 10. Test Logs
    const resLogs = await makeRequest('/api/logs', { headers: { 'Authorization': `Bearer ${finalToken}` } });
    assert(resLogs.status === 200 && resLogs.body?.logs?.length >= 2, 'Audit logs recorded both rejected and successful transactions');

    console.log('\n====================================================');
    console.log(`🎉 HASIL TEST: ${passed} PASSED / ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
