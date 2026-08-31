/**
 * Server for Nusantara DataLens
 * Clean, lightweight, self-contained native Node.js HTTP Server
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const Database = require('./server/database.js');
const Auth = require('./server/auth.js');
const PDFParser = require('./server/pdfParser.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Helper to send JSON responses
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Parse request body as JSON or Buffer
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';

      if (contentType.includes('application/json')) {
        try {
          const text = buffer.toString('utf-8');
          resolve({ type: 'json', data: JSON.parse(text || '{}'), buffer });
        } catch (e) {
          resolve({ type: 'json', data: {}, buffer, error: e.message });
        }
      } else {
        resolve({ type: 'binary', buffer, data: null });
      }
    });
    req.on('error', err => reject(err));
  });
}

// Main HTTP Request Handler
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // ==========================================
  // API ROUTING
  // ==========================================

  // GET /api/stats/summary
  if (method === 'GET' && pathname === '/api/stats/summary') {
    try {
      const stats = Database.getSummaryStats();
      return sendJSON(res, 200, { success: true, stats });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // GET /api/provinces
  if (method === 'GET' && pathname === '/api/provinces') {
    try {
      const provinces = Database.getAllProvinces();
      return sendJSON(res, 200, { success: true, count: provinces.length, data: provinces });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // GET /api/provinces/:name_or_code
  if (method === 'GET' && pathname.startsWith('/api/provinces/')) {
    try {
      const param = decodeURIComponent(pathname.replace('/api/provinces/', '')).trim();
      let province = Database.getProvinceByCode(param);
      if (!province) {
        province = Database.getProvinceByName(param);
      }
      if (!province) {
        return sendJSON(res, 404, { success: false, error: 'Provinsi tidak ditemukan' });
      }
      return sendJSON(res, 200, { success: true, data: province });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // POST /api/auth/login
  if (method === 'POST' && pathname === '/api/auth/login') {
    try {
      const body = await getRequestBody(req);
      const { username, password } = body.data || {};
      const result = Auth.login(username, password);
      if (!result.success) {
        return sendJSON(res, 401, result);
      }
      return sendJSON(res, 200, result);
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // GET /api/auth/me
  if (method === 'GET' && pathname === '/api/auth/me') {
    const session = Auth.authenticateRequest(req);
    if (!session) {
      return sendJSON(res, 401, { success: false, authenticated: false, error: 'Sesi tidak valid atau telah berakhir' });
    }
    return sendJSON(res, 200, { success: true, authenticated: true, user: { username: session.username, role: session.role } });
  }

  // POST /api/auth/change-credentials
  if (method === 'POST' && pathname === '/api/auth/change-credentials') {
    try {
      const session = Auth.authenticateRequest(req);
      if (!session) {
        return sendJSON(res, 401, { success: false, error: 'Akses ditolak. Silakan login terlebih dahulu.' });
      }

      const body = await getRequestBody(req);
      const { currentPassword, newUsername, newPassword } = body.data || {};
      const result = Auth.changeCredentials(session.username, currentPassword, newUsername, newPassword);

      if (!result.success) {
        return sendJSON(res, 400, result);
      }
      return sendJSON(res, 200, result);
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // POST /api/auth/logout
  if (method === 'POST' && pathname === '/api/auth/logout') {
    const authHeader = req.headers['authorization'] || req.headers['x-auth-token'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader;
    Auth.logout(token);
    return sendJSON(res, 200, { success: true, message: 'Logout berhasil' });
  }

  // POST /api/upload-pdf (Supports PDF binary or extracted text payload)
  if (method === 'POST' && pathname === '/api/upload-pdf') {
    try {
      const session = Auth.authenticateRequest(req);
      if (!session) {
        return sendJSON(res, 401, { success: false, error: 'Akses ditolak. Hanya admin yang dapat memperbarui data.' });
      }

      const body = await getRequestBody(req);
      let textToParse = '';
      let filename = 'document.pdf';

      if (body.type === 'json' && body.data) {
        textToParse = body.data.text || '';
        filename = body.data.filename || 'uploaded_data.pdf';
      } else if (body.buffer && body.buffer.length > 0) {
        textToParse = PDFParser.extractTextFromPDFBuffer(body.buffer);
      }

      if (!textToParse || textToParse.trim().length === 0) {
        Database.logUpload(filename, session.username, 'REJECTED', [], 'File kosong atau tidak terbaca');
        return sendJSON(res, 400, {
          success: false,
          errors: ['Gagal mengekstrak teks dari file PDF. Pastikan file PDF memuat teks yang dapat dibaca dan sesuai template.']
        });
      }

      // Run strict schema validation
      const validation = PDFParser.parseAndValidateTemplate(textToParse);
      if (!validation.success) {
        Database.logUpload(filename, session.username, 'REJECTED', [], 'Format template tidak valid', validation.errors);
        return sendJSON(res, 400, {
          success: false,
          errors: validation.errors
        });
      }

      // Apply changes to database
      const updateResults = [];
      const affectedNames = [];

      for (const provData of validation.data) {
        const resUpd = Database.updateProvinceData(provData);
        if (resUpd.success) {
          affectedNames.push(provData.provinsi);
          updateResults.push({
            provinsi: provData.provinsi,
            previous: resUpd.previous,
            updated: resUpd.updated
          });
        }
      }

      Database.logUpload(
        filename,
        session.username,
        'SUCCESS',
        affectedNames,
        `Berhasil memperbarui data ${affectedNames.length} provinsi.`
      );

      return sendJSON(res, 200, {
        success: true,
        message: `Pembaruan data berhasil! Total ${affectedNames.length} provinsi telah diperbarui di database.`,
        affectedProvinces: affectedNames,
        updates: updateResults
      });
    } catch (err) {
      console.error('Upload PDF error:', err);
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // GET /api/template/pdf - Download official template PDF
  if (method === 'GET' && pathname === '/api/template/pdf') {
    try {
      const provinceQuery = parsedUrl.searchParams.get('provinsi') || 'Jawa Barat';
      const pdfBuffer = PDFParser.createOfficialTemplatePDF(provinceQuery);

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Template_Pembaruan_Data_${provinceQuery.replace(/\s+/g, '_')}.pdf"`,
        'Content-Length': pdfBuffer.length
      });
      return res.end(pdfBuffer);
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // GET /api/template/text - Download text format
  if (method === 'GET' && pathname === '/api/template/text') {
    try {
      const provinceQuery = parsedUrl.searchParams.get('provinsi') || 'Jawa Barat';
      const text = PDFParser.getOfficialTemplateText(provinceQuery);

      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="Format_Template_Provinsi.txt"`,
        'Content-Length': Buffer.byteLength(text, 'utf-8')
      });
      return res.end(text);
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // GET /api/logs
  if (method === 'GET' && pathname === '/api/logs') {
    try {
      const session = Auth.authenticateRequest(req);
      if (!session) {
        return sendJSON(res, 401, { success: false, error: 'Akses ditolak.' });
      }
      const logs = Database.getUploadLogs(30);
      return sendJSON(res, 200, { success: true, logs });
    } catch (err) {
      return sendJSON(res, 500, { success: false, error: err.message });
    }
  }

  // ==========================================
  // STATIC FILE SERVING (PUBLIC DIR)
  // ==========================================
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback to index.html if file doesn't exist
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
      });
      res.end(content);
    });
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Nusantara DataLens Server aktif di http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite Native (node:sqlite)`);
  console.log(`🔐 Default Admin: username 'admin', password 'admin123'`);
  console.log(`====================================================`);
});

module.exports = server;
