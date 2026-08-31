/**
 * PDF Parsing & Strict Template Validation Engine
 * Nusantara DataLens
 */

const zlib = require('node:zlib');

// List of official 38 Provinces in Indonesia
const OFFICIAL_PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi",
  "Sumatera Selatan", "Bengkulu", "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau",
  "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat",
  "Maluku", "Maluku Utara",
  "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya"
];

function normalizeProvinceName(raw) {
  if (!raw) return null;
  const clean = raw.trim().replace(/^Provinsi\s+/i, '').replace(/^Propinsi\s+/i, '').trim();
  const match = OFFICIAL_PROVINCES.find(p => p.toLowerCase() === clean.toLowerCase());
  if (match) return match;

  // Partial match fallback
  const partial = OFFICIAL_PROVINCES.find(p => p.toLowerCase().includes(clean.toLowerCase()) || clean.toLowerCase().includes(p.toLowerCase()));
  return partial || null;
}

/**
 * Extract raw plain text from PDF buffer
 */
function extractTextFromPDFBuffer(buffer) {
  try {
    const rawString = buffer.toString('binary');
    let extractedText = '';

    // Search for stream objects
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;

    while ((match = streamRegex.exec(rawString)) !== null) {
      let streamData = Buffer.from(match[1], 'binary');
      let textChunk = '';

      // Try inflating if it's FlateDecode
      try {
        const inflated = zlib.inflateSync(streamData);
        textChunk = inflated.toString('utf-8');
      } catch (e) {
        // Uncompressed stream fallback
        textChunk = streamData.toString('utf-8');
      }

      // Extract text within parenthesis ( ... ) Tj or [ ... ] TJ
      const textMatches = textChunk.match(/\((.*?)\)\s*Tj/g) || [];
      for (const tm of textMatches) {
        const cleaned = tm.replace(/^$$\s*/, '').replace(/\s*$$\s*Tj$/, '');
        extractedText += cleaned + '\n';
      }

      // Extract text in TJ array
      const tjMatches = textChunk.match(/\[(.*?)\]\s*TJ/g) || [];
      for (const tj of tjMatches) {
        const innerStrings = tj.match(/\((.*?)\)/g) || [];
        for (const s of innerStrings) {
          extractedText += s.slice(1, -1) + ' ';
        }
        extractedText += '\n';
      }
    }

    // If stream parsing extracted meaningful content, return it
    if (extractedText.trim().length > 30) {
      return extractedText;
    }

    // Fallback: extract ASCII characters from raw buffer
    const asciiClean = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    return asciiClean;
  } catch (err) {
    console.error('PDF stream extraction error:', err.message);
    return buffer.toString('utf-8');
  }
}

/**
 * Helper to parse numbers like "50 Juta", "50.850.000", "50,85 Juta", "50850000"
 */
function parseNumericValue(raw) {
  if (!raw) return null;
  let str = String(raw).trim().toLowerCase();

  const isJuta = str.includes('juta') || str.includes('jt') || str.includes('m');
  str = str.replace(/juta|jt|jiwa|km2|km²|%/g, '').trim();

  // If Indonesian decimal like 50,85 -> replace comma with dot
  if (str.includes(',') && !str.includes('.')) {
    str = str.replace(',', '.');
  } else if (str.includes('.') && str.includes(',')) {
    // e.g. 50.850.000,00
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes('.') && (str.match(/\./g) || []).length > 1) {
    // e.g. 50.850.000
    str = str.replace(/\./g, '');
  }

  let val = parseFloat(str);
  if (isNaN(val)) return null;

  if (isJuta && val < 1000) {
    val = Math.round(val * 1000000);
  }

  return val;
}

/**
 * Strict Template Parser and Validator
 */
function parseAndValidateTemplate(inputText) {
  if (!inputText || typeof inputText !== 'string') {
    return {
      success: false,
      errors: ['File kosong atau format teks tidak dapat dibaca dari PDF.']
    };
  }

  const text = inputText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Group lines into province blocks (starting each block strictly with PROVINSI:)
  const provinceBlocks = [];
  let currentBlockLines = null;

  for (const line of lines) {
    if (/^(?:PROVINSI|Provinsi)\s*[:=]/i.test(line)) {
      if (currentBlockLines && currentBlockLines.length > 0) {
        provinceBlocks.push(currentBlockLines);
      }
      currentBlockLines = [line];
    } else if (currentBlockLines !== null) {
      currentBlockLines.push(line);
    }
  }
  if (currentBlockLines && currentBlockLines.length > 0) {
    provinceBlocks.push(currentBlockLines);
  }

  if (provinceBlocks.length === 0) {
    return {
      success: false,
      errors: [
        'Template tidak valid: Baris "PROVINSI: <Nama Provinsi>" tidak ditemukan.',
        'Pastikan file PDF mengikuti format template resmi yang dapat diunduh pada panel Admin.'
      ]
    };
  }

  const validatedData = [];
  const allErrors = [];

  for (let i = 0; i < provinceBlocks.length; i++) {
    const block = provinceBlocks[i];
    const blockText = block.join('\n');
    const blockNum = provinceBlocks.length > 1 ? ` (Blok #${i + 1})` : '';

    const errors = [];
    const record = {};

    // 1. Validate PROVINCE NAME
    const provMatch = blockText.match(/(?:PROVINSI|Provinsi)\s*[:=]\s*([^\n,;]+)/i);
    if (!provMatch) {
      errors.push(`Field "PROVINSI" wajib dicantumkan${blockNum}.`);
    } else {
      const rawName = provMatch[1].trim();
      const normalizedName = normalizeProvinceName(rawName);
      if (!normalizedName) {
        errors.push(`Provinsi "${rawName}" tidak valid / tidak termasuk dalam 38 provinsi resmi Indonesia${blockNum}.`);
      } else {
        record.provinsi = normalizedName;
      }
    }

    // 2. Validate POPULATION (JUMLAH_PENDUDUK)
    const popMatch = blockText.match(/(?:JUMLAH_PENDUDUK|JUMLAH PENDUDUK|Jumlah Penduduk|Penduduk)\s*[:=]\s*([^\n,;]+)/i);
    if (!popMatch) {
      errors.push(`Field "JUMLAH_PENDUDUK" wajib diisi${blockNum}.`);
    } else {
      const popVal = parseNumericValue(popMatch[1]);
      if (!popVal || popVal < 100000 || popVal > 150000000) {
        errors.push(`Nilai Jumlah Penduduk "${popMatch[1]}" tidak valid (harus angka positif rasional)${blockNum}.`);
      } else {
        record.penduduk_2026 = Math.round(popVal);
      }
    }

    // 3. Validate RELIGIONS (ISLAM, KRISTEN, KATOLIK, HINDU, BUDDHA, KONGHUCU)
    const islamMatch = blockText.match(/(?:ISLAM|Islam)\s*[:=]\s*([0-9.,]+)%?/i);
    const kristenMatch = blockText.match(/(?:KRISTEN|Kristen|Protestan)\s*[:=]\s*([0-9.,]+)%?/i);
    const katolikMatch = blockText.match(/(?:KATOLIK|Katolik)\s*[:=]\s*([0-9.,]+)%?/i);
    const hinduMatch = blockText.match(/(?:HINDU|Hindu)\s*[:=]\s*([0-9.,]+)%?/i);
    const buddhaMatch = blockText.match(/(?:BUDDHA|BUDHA|Buddha|Budha)\s*[:=]\s*([0-9.,]+)%?/i);
    const konghucuMatch = blockText.match(/(?:KONGHUCU|KHONGHUCU|Konghucu|Khonghucu)\s*[:=]\s*([0-9.,]+)%?/i);

    if (!islamMatch) errors.push(`Persentase agama "ISLAM" wajib diisi${blockNum}.`);
    if (!kristenMatch) errors.push(`Persentase agama "KRISTEN" wajib diisi${blockNum}.`);
    if (!katolikMatch) errors.push(`Persentase agama "KATOLIK" wajib diisi${blockNum}.`);
    if (!hinduMatch) errors.push(`Persentase agama "HINDU" wajib diisi${blockNum}.`);
    if (!buddhaMatch) errors.push(`Persentase agama "BUDDHA" wajib diisi${blockNum}.`);
    if (!konghucuMatch) errors.push(`Persentase agama "KONGHUCU" wajib diisi${blockNum}.`);

    if (islamMatch && kristenMatch && katolikMatch && hinduMatch && buddhaMatch && konghucuMatch) {
      const islam = parseFloat(islamMatch[1].replace(',', '.')) || 0;
      const kristen = parseFloat(kristenMatch[1].replace(',', '.')) || 0;
      const katolik = parseFloat(katolikMatch[1].replace(',', '.')) || 0;
      const hindu = parseFloat(hinduMatch[1].replace(',', '.')) || 0;
      const buddha = parseFloat(buddhaMatch[1].replace(',', '.')) || 0;
      const konghucu = parseFloat(konghucuMatch[1].replace(',', '.')) || 0;

      const totalAgama = parseFloat((islam + kristen + katolik + hindu + buddha + konghucu).toFixed(2));
      if (totalAgama < 98.0 || totalAgama > 102.0) {
        errors.push(`Total persentase agama (${totalAgama}%) tidak seimbang (harus berjumlah 100% ± toleransi 2%)${blockNum}.`);
      } else {
        record.islam_persen = islam;
        record.kristen_persen = kristen;
        record.katolik_persen = katolik;
        record.hindu_persen = hindu;
        record.buddha_persen = buddha;
        record.konghucu_persen = konghucu;
      }
    }

    // 4. Validate LIVELIHOOD / ECONOMY (MATA_PENCAHARIAN & SEKTOR_UNGGULAN)
    const mataPencaharianMatch = blockText.match(/(?:MATA_PENCAHARIAN|MATA PENCAHARIAN|Mata Pencaharian|Pekerjaan Utama)\s*[:=]\s*([^\n;]+)/i);
    if (!mataPencaharianMatch || mataPencaharianMatch[1].trim().length < 5) {
      errors.push(`Field "MATA_PENCAHARIAN" wajib diisi dengan rincian sektor (min. 5 karakter)${blockNum}.`);
    } else {
      record.mata_pencaharian = mataPencaharianMatch[1].trim();
    }

    // Optional fields with sensible defaults & validation
    const ibukotaMatch = blockText.match(/(?:IBUKOTA|Ibukota)\s*[:=]\s*([^\n,;]+)/i);
    if (ibukotaMatch) record.ibukota = ibukotaMatch[1].trim();

    const regionMatch = blockText.match(/(?:REGION|Region|Wilayah Pulau)\s*[:=]\s*([^\n,;]+)/i);
    if (regionMatch) record.region = regionMatch[1].trim();

    const luasMatch = blockText.match(/(?:LUAS_KM2|LUAS WILAYAH|Luas)\s*[:=]\s*([^\n,;]+)/i);
    if (luasMatch) {
      const lVal = parseNumericValue(luasMatch[1]);
      if (lVal && lVal > 10) record.luas_km2 = lVal;
    }

    const ipmMatch = blockText.match(/(?:IPM|Indeks Pembangunan Manusia)\s*[:=]\s*([0-9.,]+)/i);
    if (ipmMatch) {
      const ipmVal = parseFloat(ipmMatch[1].replace(',', '.'));
      if (ipmVal >= 40.0 && ipmVal <= 100.0) {
        record.ipm = parseFloat(ipmVal.toFixed(2));
      } else {
        errors.push(`Nilai IPM "${ipmMatch[1]}" di luar batas wajar (40.0 - 100.0)${blockNum}.`);
      }
    }

    const kemiskinanMatch = blockText.match(/(?:KEMISKINAN_PERSEN|TINGKAT KEMISKINAN|Kemiskinan)\s*[:=]\s*([0-9.,]+)%?/i);
    if (kemiskinanMatch) {
      const povVal = parseFloat(kemiskinanMatch[1].replace(',', '.'));
      if (povVal >= 0.0 && povVal <= 100.0) {
        record.kemiskinan_persen = parseFloat(povVal.toFixed(2));
      } else {
        errors.push(`Nilai persentase kemiskinan "${kemiskinanMatch[1]}" tidak valid (0 - 100%)${blockNum}.`);
      }
    }

    const sektorMatch = blockText.match(/(?:SEKTOR_UNGGULAN|Sektor Unggulan|Komoditas)\s*[:=]\s*([^\n;]+)/i);
    if (sektorMatch) record.ekonomi_sektor = sektorMatch[1].trim();

    const sukuMatch = blockText.match(/(?:SUKU_MAYORITAS|Suku Mayoritas|Etnis)\s*[:=]\s*([^\n;]+)/i);
    if (sukuMatch) record.suku_mayoritas = sukuMatch[1].trim();

    const pdrbMatch = blockText.match(/(?:PDRB_KAPITA_JUTA|PDRB Per Kapita)\s*[:=]\s*([0-9.,]+)/i);
    if (pdrbMatch) record.pdrb_kapita_juta = parseFloat(pdrbMatch[1].replace(',', '.'));

    const kabKotaMatch = blockText.match(/(?:JUMLAH_KAB_KOTA|Jumlah Kab Kota)\s*[:=]\s*([^\n;]+)/i);
    if (kabKotaMatch) record.jumlah_kab_kota = kabKotaMatch[1].trim();

    if (errors.length > 0) {
      allErrors.push(...errors);
    } else {
      validatedData.push(record);
    }
  }

  if (allErrors.length > 0) {
    return {
      success: false,
      errors: allErrors,
      parsedCount: 0
    };
  }

  return {
    success: true,
    data: validatedData,
    parsedCount: validatedData.length
  };
}

/**
 * Generates official text template
 */
function getOfficialTemplateText(provinceName = 'Jawa Barat') {
  return `=======================================================
FORMAT RESMI PEMBARUAN DATA SOSIO-DEMOGRAFI PROVINSI
PORTAL KEPENDUDUKAN INDONESIA 2026
=======================================================
PROVINSI: ${provinceName}
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
* PETUNJUK PENGISIAN:
1. Pastikan nama provinsi sesuai dengan 38 provinsi resmi di Indonesia.
2. Jumlah penduduk diisi dengan angka bulat atau dengan akhiran 'Juta' (misal: 50.85 Juta).
3. Total persentase seluruh agama (Islam, Kristen, Katolik, Hindu, Buddha, Konghucu) harus berjumlah 100%.
4. Field MATA_PENCAHARIAN dan SEKTOR_UNGGULAN wajib diisi deskripsinya.
5. Anda dapat menyalin blok di atas beberapa kali dalam 1 file untuk memperbarui banyak provinsi sekaligus.
=======================================================`;
}

/**
 * Generates a clean standalone PDF file for the template
 */
function createOfficialTemplatePDF(provinceName = 'Jawa Barat') {
  const contentText = getOfficialTemplateText(provinceName);
  const escapedText = contentText
    .split('\n')
    .map(line => `(${line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj T*`)
    .join('\n');

  const streamContent = `BT
/F1 9 Tf
40 760 Td
13 TL
${escapedText}
ET`;

  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
380
%%EOF`;

  return Buffer.from(pdfBody, 'utf-8');
}

module.exports = {
  extractTextFromPDFBuffer,
  parseAndValidateTemplate,
  getOfficialTemplateText,
  createOfficialTemplatePDF,
  OFFICIAL_PROVINCES,
  normalizeProvinceName
};
