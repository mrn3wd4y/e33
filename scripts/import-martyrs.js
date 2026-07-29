#!/usr/bin/env node
// Import du lieu tu data/normalized/martyrs.json vao Directus.
// Chay lai duoc (idempotent) dua tren `record_code`:
//   - record_code chua co  -> tao moi
//   - record_code da co     -> cap nhat (khong ghi de field admin da sua neu bat --safe)
//
// Cach dung:
//   node scripts/import-martyrs.js
//   node scripts/import-martyrs.js --file data/normalized/martyrs.json
//   node scripts/import-martyrs.js --safe      (khong ghi de field da co gia tri admin sua)
//   node scripts/import-martyrs.js --dry-run   (chi bao cao, khong ghi)
//
// Can env: DIRECTUS_URL, va (ADMIN_EMAIL + ADMIN_PASSWORD) hoac DIRECTUS_TOKEN.

const fs = require('fs');
const path = require('path');
const { api } = require('./lib/directus');
const { COLLECTION, fields } = require('./schema');

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const hasFlag = (name) => args.includes(name);

const FILE = getArg('--file', path.join('data', 'normalized', 'martyrs.json'));
const SAFE = hasFlag('--safe');
const DRY_RUN = hasFlag('--dry-run');
const BATCH = 100;

// Chi cho phep import cac field co trong schema (tru field auto).
const AUTO_FIELDS = new Set(['id', 'created_at', 'updated_at']);
const ALLOWED = new Set(fields.map((f) => f.field).filter((f) => !AUTO_FIELDS.has(f)));

function loadRecords() {
  if (!fs.existsSync(FILE)) {
    throw new Error(
      `Khong tim thay ${FILE}. Can Claude tao data normalized truoc (Phase 1).`
    );
  }
  const raw = fs.readFileSync(FILE, 'utf8');
  const data = JSON.parse(raw);
  const list = Array.isArray(data) ? data : data.records || data.martyrs;
  if (!Array.isArray(list)) {
    throw new Error('File JSON phai la mang, hoac object co field "records"/"martyrs".');
  }
  return list;
}

function cleanRecord(rec) {
  const out = {};
  for (const [k, v] of Object.entries(rec)) {
    if (ALLOWED.has(k)) out[k] = v;
  }
  return out;
}

// Lay map record_code -> row hien co (chi field can de quyet dinh).
async function fetchExisting() {
  const map = new Map();
  let page = 1;
  for (;;) {
    const res = await api(
      'GET',
      `/items/${COLLECTION}?limit=${BATCH}&page=${page}&fields=id,record_code`
    );
    const rows = res.data || [];
    for (const r of rows) if (r.record_code) map.set(r.record_code, r);
    if (rows.length < BATCH) break;
    page += 1;
  }
  return map;
}

async function main() {
  console.log('== Import martyrs ==');
  console.log(`File: ${FILE}`);
  if (DRY_RUN) console.log('Che do: DRY RUN (khong ghi)');
  if (SAFE) console.log('Che do: SAFE (khong ghi de ban ghi da co)');

  const records = loadRecords();
  console.log(`Doc ${records.length} ban ghi tu file.`);

  const missingCode = records.filter((r) => !r.record_code).length;
  if (missingCode > 0) {
    throw new Error(`${missingCode} ban ghi thieu record_code. Can co de import lap lai.`);
  }

  const existing = await fetchExisting();
  console.log(`Directus dang co ${existing.size} ban ghi (theo record_code).`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const rec of records) {
    const clean = cleanRecord(rec);
    const found = existing.get(rec.record_code);
    try {
      if (found) {
        if (SAFE) {
          skipped += 1;
          continue;
        }
        if (!DRY_RUN) await api('PATCH', `/items/${COLLECTION}/${found.id}`, clean);
        updated += 1;
      } else {
        if (!DRY_RUN) await api('POST', `/items/${COLLECTION}`, clean);
        created += 1;
      }
    } catch (err) {
      failed += 1;
      console.error(`  Loi record_code=${rec.record_code}: ${err.message}`);
      if (err.body) console.error('   ', JSON.stringify(err.body));
    }
  }

  console.log('--- Ket qua ---');
  console.log(`Tao moi : ${created}`);
  console.log(`Cap nhat: ${updated}`);
  console.log(`Bo qua  : ${skipped}`);
  console.log(`That bai: ${failed}`);
  console.log(`Tong doc: ${records.length}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Loi import:', err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
