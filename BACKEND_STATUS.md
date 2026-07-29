# BACKEND STATUS - Website tra cuu liet si E33

Cap nhat: 2026-07-29
Owner: Kiro (Backend/Infrastructure Agent)

## Tom tat

Backend runtime da chay end-to-end thanh cong: Directus + PostgreSQL len bang
Docker Compose, schema `martyrs` da ap dung, 3826 ho so da import, public API
kiem tra khong lo field noi bo.

## Moi truong

| Thanh phan | Gia tri |
| --- | --- |
| Docker | 28.3.0 |
| Docker Compose | v2.38.1 |
| Node.js | v22.13.1 |
| Directus | image `directus/directus:11` |
| PostgreSQL | image `postgres:16-alpine` |
| Directus URL | http://localhost:8055 |

`.env` da tao tu `.env.example` voi secret ngau nhien. File `.env` nam trong
`.gitignore`, khong commit len git.

## Cac buoc da chay

1. Tao `.env` (secret, mat khau DB, admin sinh ngau nhien).
2. `docker compose up -d` -> database Healthy, directus Started, `/server/health` = ok.
3. `npm run schema` -> tao collection `martyrs` + 35 field + public read permission.
4. `npm run import:dry` -> 3826 tao moi, 0 loi.
5. `npm run import` -> 3826 tao moi, 0 cap nhat, 0 bo qua, 0 that bai.
6. Kiem tra public API `GET /items/martyrs?limit=2`.
7. Kiem tra field noi bo khong lo.

## Ket qua import

| Chi so | Gia tri |
| --- | --- |
| Ban ghi trong file | 3826 |
| Tao moi | 3826 |
| Cap nhat | 0 |
| That bai | 0 |
| total_count trong Directus | 3826 |
| Public thay (filter_count, `published`) | 3826 |

Tat ca ho so co `public_status = published` (theo data normalized) nen public
API thay du 3826.

## Kiem tra public API

`GET http://localhost:8055/items/martyrs?limit=2` chi tra ve cac field public:

```
birth_year, birth_year_raw, commune, current_burial_place, death_date_raw,
death_year, district, enlistment_date_raw, full_name, hometown_raw, id,
initial_burial_place, initial_collection_place, notes_public, province,
relative_name, slug, unit
```

Kiem tra tim kiem: `?search=nho` -> 24 ket qua (search khong dau hoat dong).

## Xac nhan bao mat - field noi bo KHONG lo

Da kiem tra danh sach cam, khong field nao xuat hien tren public API:

- source_sheet - an
- source_row - an
- source_period - an
- source_context - an
- verification_status - an
- notes_internal - an
- raw_payload - an

Ngoai ra cung an: record_code, full_name_normalized, hometown_normalized,
unit_normalized, public_status, source_file, source_record_no,
initial_burial_place_normalized, current_burial_place_normalized.

## Thay doi so voi ban giao truoc

- Them `scripts/load-env.js` de nap `.env` vao process khi chay npm script.
- Cap nhat npm scripts dung `node -r ./scripts/load-env.js`.
- Sua `apply-schema.js`: nhan dien policy public theo ten `$t:public_label`
  (Directus 11) ben canh `$public` (ban cu). Truoc do permission bi bo qua.
- KHONG doi `DATA_SCHEMA.md`.

## Diem can luu y / rui ro con lai

- Email admin: Directus tu choi TLD `.local`. Da dung `admin@example.com`.
  Nen doi email/mat khau admin truoc khi len production.
- PostgreSQL khong publish port ra host (an trong network Docker) de an toan.
- 2 field trong file normalized (`possible_duplicate_group`,
  `possible_duplicate_confidence`) khong co trong schema; import script tu dong
  bo qua. Neu muon luu de admin xem trung lap, can bo sung field (hoi truoc khi
  doi DATA_SCHEMA.md).
- Import idempotent theo `record_code`: chay lai se cap nhat, khong nhan doi.

## Lenh van hanh nhanh

```bash
docker compose up -d        # chay
docker compose ps           # trang thai
npm run schema              # ap dung schema (chay lai duoc)
npm run import:dry          # kiem tra truoc
npm run import              # import that
docker compose down         # dung (giu data)
docker compose down -v      # dung + xoa data
```

## De xuat buoc tiep theo

- Frontend Agent xay ReactJS/Vite ket noi public API (Phase 3).
- QA Agent kiem thu filter (province, unit, death_year, current_burial_place),
  phan trang, trang chi tiet theo slug.
