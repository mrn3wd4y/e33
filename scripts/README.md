# Backend / Infra - Website tra cuu liet si E33

Huong dan dung Directus + PostgreSQL bang Docker Compose, ap dung schema `martyrs`, va import du lieu.

## 1. Yeu cau

- Docker + Docker Compose.
- Node.js >= 18 (dung fetch san co, khong can them thu vien).

## 2. Cau hinh moi truong

```bash
cp .env.example .env
```

Sua `.env`:

- `DB_PASSWORD`: mat khau PostgreSQL.
- `DIRECTUS_SECRET`: chuoi ngau nhien, tao bang `openssl rand -hex 32`.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: tai khoan admin Directus dau tien.
- `DIRECTUS_URL`: mac dinh `http://localhost:8055` cho local.

Luu y bao mat: `.env` chua bi mat, khong commit len git.

## 3. Chay Directus + PostgreSQL

```bash
docker compose up -d
```

- Directus: http://localhost:8055
- PostgreSQL khong publish port ra ngoai (an trong network noi bo) de tranh lo database.

Kiem tra da san sang:

```bash
docker compose ps
```

Dang nhap Directus bang `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env`.

## 4. Ap dung schema

Tao collection `martyrs`, toan bo field theo `DATA_SCHEMA.md`, va cau hinh
quyen public (chi doc field public, chi ho so `public_status = published`).

```bash
npm run schema
```

Script chay lai duoc: cai da ton tai se bo qua, chi them cai con thieu.

Field public duoc mo (theo `DATA_SCHEMA.md` muc 5). Cac field noi bo bi an khoi
public API:

- `record_code`, `full_name_normalized`, `hometown_normalized`,
  `unit_normalized`, `initial_burial_place_normalized`,
  `current_burial_place_normalized`
- `public_status`, `verification_status`, `notes_internal`
- `source_file`, `source_sheet`, `source_row`, `source_record_no`
- `source_period`, `source_context`, `raw_payload`

## 5. Import du lieu

Can file `data/normalized/martyrs.json` do Data Agent (Claude) tao o Phase 1.

Kiem tra truoc khi ghi:

```bash
npm run import:dry
```

Import that:

```bash
npm run import
```

Cac tuy chon:

- `--file <path>`: chi dinh file khac.
- `--dry-run`: chi bao cao, khong ghi.
- `--safe`: khong ghi de ban ghi da ton tai (chi them moi).

Import lap lai (idempotent) dua tren `record_code`:

- `record_code` chua co -> tao moi.
- `record_code` da co -> cap nhat.

Neu co ban ghi thieu `record_code`, script se dung va bao loi vi khong the
import lap lai an toan.

## 6. Dinh dang file JSON mong doi

Mang cac object, hoac object co field `records`/`martyrs`:

```json
[
  {
    "record_code": "abc123",
    "slug": "bui-si-nho-1946-abc123",
    "full_name": "Bui Si Nho",
    "full_name_normalized": "bui si nho",
    "birth_year": 1946,
    "birth_year_raw": "1946",
    "unit": "C3 D1 E33",
    "death_year": 1974,
    "public_status": "published",
    "source_period": "1968-1975"
  }
]
```

Script chi nhan cac field co trong schema; field la se bi bo qua.

## 7. Xac thuc cho script

Script dung REST API Directus. Chon 1 trong 2 cach xac thuc qua env:

- `ADMIN_EMAIL` + `ADMIN_PASSWORD` (login lay token), hoac
- `DIRECTUS_TOKEN` (static token cua admin).

## 8. Kiem tra public API

Sau khi import, thu goi public (khong can token):

```bash
curl "http://localhost:8055/items/martyrs?limit=2"
```

Ket qua chi tra ve field public va chi ho so `published`. Neu thay field noi bo
nhu `verification_status` hay `source_sheet`, permission dang sai.

## 9. Reset (can than)

Xoa toan bo container va volume (mat het du lieu database):

```bash
docker compose down -v
```
