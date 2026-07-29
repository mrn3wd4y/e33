#!/usr/bin/env node
// Tao/cap nhat collection `martyrs` va cau hinh public permission.
// Chay lai duoc: bo qua cai da ton tai, chi them cai con thieu.
//
// Cach dung:
//   node scripts/apply-schema.js
// Can env: DIRECTUS_URL, va (ADMIN_EMAIL + ADMIN_PASSWORD) hoac DIRECTUS_TOKEN.

const { api } = require('./lib/directus');
const { COLLECTION, fields, publicFields, publicPermissionFilter } = require('./schema');

async function collectionExists() {
  try {
    await api('GET', `/collections/${COLLECTION}`);
    return true;
  } catch (err) {
    if (err.status === 403 || err.status === 404) return false;
    throw err;
  }
}

async function ensureCollection() {
  if (await collectionExists()) {
    console.log(`- Collection "${COLLECTION}" da ton tai, bo qua.`);
    return;
  }
  const pk = fields.find((f) => f.pk);
  await api('POST', '/collections', {
    collection: COLLECTION,
    meta: {
      icon: 'military_tech',
      note: 'Ho so liet si Trung doan 33',
      display_template: '{{full_name}} ({{death_year}})',
    },
    schema: {},
    fields: [
      {
        field: pk.field,
        type: pk.type,
        meta: pk.meta,
        schema: pk.schema,
      },
    ],
  });
  console.log(`+ Da tao collection "${COLLECTION}".`);
}

async function existingFieldNames() {
  const res = await api('GET', `/fields/${COLLECTION}`);
  return new Set((res.data || []).map((f) => f.field));
}

async function ensureFields() {
  const existing = await existingFieldNames();
  for (const f of fields) {
    if (existing.has(f.field)) continue;
    if (f.pk) continue; // da tao cung collection
    await api('POST', `/fields/${COLLECTION}`, {
      field: f.field,
      type: f.type,
      meta: f.meta || {},
      schema: f.schema || {},
    });
    console.log(`+ Field: ${f.field}`);
  }
}

// Directus 11: public access qua policy "Public".
// Ten policy public co the la '$public' (ban cu) hoac '$t:public_label' (ban moi).
async function getPublicPolicyId() {
  const all = await api('GET', '/policies?limit=-1');
  const list = all.data || [];
  const pub = list.find((p) => p.name === '$public' || p.name === '$t:public_label');
  return pub ? pub.id : null;
}

async function ensurePublicReadPermission() {
  const policyId = await getPublicPolicyId();
  if (!policyId) {
    console.log('! Khong tim thay public policy. Bo qua cau hinh permission.');
    console.log('  Ban co the cau hinh thu cong trong Settings > Access Policies > Public.');
    return;
  }

  // Kiem tra permission read da co chua
  const check = await api(
    'GET',
    `/permissions?filter[policy][_eq]=${policyId}&filter[collection][_eq]=${COLLECTION}&filter[action][_eq]=read&limit=1`
  );
  const payload = {
    policy: policyId,
    collection: COLLECTION,
    action: 'read',
    fields: publicFields,
    permissions: publicPermissionFilter,
  };
  if (check.data && check.data.length) {
    await api('PATCH', `/permissions/${check.data[0].id}`, payload);
    console.log('~ Cap nhat public read permission.');
  } else {
    await api('POST', '/permissions', payload);
    console.log('+ Tao public read permission (chi field public, chi ho so published).');
  }
}

async function main() {
  console.log('== Ap dung schema Directus ==');
  await ensureCollection();
  await ensureFields();
  await ensurePublicReadPermission();
  console.log('== Xong ==');
}

main().catch((err) => {
  console.error('Loi ap dung schema:', err.message);
  if (err.body) console.error(JSON.stringify(err.body, null, 2));
  process.exit(1);
});
