# AGENT WORKFLOW - Phan viec cho Codex, Kiro va Claude

## 1. Nguyen tac lam viec chung

- Tat ca agent bam theo `PROJECT_PLAN.md` va `DATA_SCHEMA.md`.
- Khong tu y doi schema neu chua cap nhat lai `DATA_SCHEMA.md`.
- Moi agent lam tren mot pham vi ro rang de tranh sua cung mot file.
- Moi thay doi lon can ghi lai vao tai lieu lien quan.
- Du lieu public khong hien thi source sheet, source row, verification status.
- Website public gop tat ca du lieu thanh mot danh sach duy nhat.
- Cac field `source_period` va `source_context` chi la metadata noi bo de dung sau nay.

## 2. Vai tro tong quan

### Codex - Lead / Integration Agent

Phu trach:

- Giu kien truc tong the.
- Tao va cap nhat tai lieu dieu phoi.
- Review output cua Kiro va Claude.
- Ghep cac phan code voi nhau.
- Xu ly xung dot schema/API/frontend.
- Chay kiem thu cuoi.
- Dam bao project chay duoc end-to-end.

### Kiro - Backend / Infrastructure Agent

Phu trach:

- Dung Directus + PostgreSQL.
- Tao Docker Compose.
- Tao schema Directus.
- Cau hinh roles/permissions.
- Viet script import vao Directus/PostgreSQL.
- Viet huong dan chay local.

### Claude - Data / Frontend Support Agent

Phu trach:

- Phan tich Excel.
- Chuan hoa du lieu.
- Tao file normalized JSON/CSV.
- Bao cao chat luong du lieu.
- Ho tro frontend UI copy/layout neu can.
- De xuat cac edge case tim kiem va loc.

## 3. Phan viec cu the

## Phase 1 - Data normalization

Owner chinh: Claude

Input:

- `Danh Sách Liệt Sĩ E33 Đầy Đủ.xlsx`
- `DATA_SCHEMA.md`

Output can co:

- `data/normalized/martyrs.json`
- `data/normalized/martyrs.csv` neu tien cho import
- `data/reports/data_quality_report.md`
- `data/reports/possible_duplicates.csv`

Viec can lam:

- Doc toan bo 5 sheet.
- Map cot theo `DATA_SCHEMA.md`.
- Gop tat ca sheet thanh mot danh sach duy nhat.
- Tao cac field normalized:
  - `full_name_normalized`
  - `hometown_normalized`
  - `unit_normalized`
  - `initial_burial_place_normalized`
  - `current_burial_place_normalized`
- Tao `death_year` tu `death_date_raw`.
- Tao `birth_year` tu `birth_year_raw`.
- Tao `source_period` va `source_context` theo sheet nguon.
- Tao `record_code` on dinh.
- Tao `slug`.
- Bao cao du lieu thieu va nghi ngo trung.

Prompt goi y cho Claude:

```text
Ban la Data Agent cho du an website tra cuu liet si Trung doan 33.

Hay doc `PROJECT_PLAN.md` va `DATA_SCHEMA.md` truoc. Sau do phan tich file Excel `Danh Sách Liệt Sĩ E33 Đầy Đủ.xlsx`, gom tat ca sheet thanh mot danh sach duy nhat theo schema `martyrs`.

Yeu cau:
- Giu du lieu goc trong cac field raw.
- Tao cac field normalized de tim kiem khong dau.
- Tao `birth_year`, `death_year`, `record_code`, `slug`.
- Luu `source_period` va `source_context` chi nhu metadata noi bo.
- Khong xoa dong nghi ngo trung; chi bao cao.
- Xuat `data/normalized/martyrs.json`.
- Tao `data/reports/data_quality_report.md` va `data/reports/possible_duplicates.csv`.

Khong thay doi schema neu khong ghi ro ly do va de xuat trong report.
```

## Phase 2 - Backend, Directus, database

Owner chinh: Kiro

Input:

- `PROJECT_PLAN.md`
- `DATA_SCHEMA.md`
- `data/normalized/martyrs.json` sau khi Claude tao xong

Output can co:

- `docker-compose.yml`
- `.env.example`
- `backend/` hoac `directus/` neu can cau hinh rieng
- `scripts/import-martyrs.js`
- `scripts/README.md`
- Directus schema/permissions reproducible

Viec can lam:

- Dung PostgreSQL.
- Dung Directus.
- Tao collection `martyrs`.
- Tao cac field theo `DATA_SCHEMA.md`.
- Cau hinh public role chi doc truong public.
- Admin role co day du quyen.
- Import du lieu normalized.
- Import co the chay lai.
- Khong public cac field noi bo.

Prompt goi y cho Kiro:

```text
Ban la Backend/Infrastructure Agent cho du an website tra cuu liet si Trung doan 33.

Hay doc `PROJECT_PLAN.md`, `DATA_SCHEMA.md`, va file normalized data neu da co. Hay dung Directus + PostgreSQL bang Docker Compose.

Yeu cau:
- Tao `docker-compose.yml` va `.env.example`.
- Tao collection `martyrs` theo `DATA_SCHEMA.md`.
- Public API chi doc cac field duoc phep public.
- Khong public `source_sheet`, `source_row`, `verification_status`, `notes_internal`, `raw_payload`, cac field normalized noi bo.
- Viet script import `scripts/import-martyrs.js` doc `data/normalized/martyrs.json`.
- Script import can co kha nang chay lai dua tren `record_code`.
- Viet huong dan chay local trong `scripts/README.md`.

Khong xay frontend trong phase nay.
```

## Phase 3 - Frontend ReactJS

Owner chinh: Codex hoac Kiro/Claude neu can chia tiep

Input:

- Directus API da chay.
- Public fields tu `DATA_SCHEMA.md`.

Output can co:

- ReactJS frontend bang Vite.
- Trang tim kiem/danh sach.
- Trang chi tiet.
- Trang thong ke co ban.

Viec can lam:

- Giao dien trang trong, de doc.
- Mot o tim kiem tong hop.
- Tim kiem khong dau.
- Loc theo:
  - que quan/tinh
  - don vi
  - nam hi sinh
  - noi an tang hien nay
- Khong hien thi source sheet/source row/verification status.
- Khong chia danh sach theo giai doan.
- Co phan trang.
- Co nut in ho so.
- Mobile de dung.

Prompt goi y neu giao frontend cho Claude:

```text
Ban la Frontend Agent cho website tra cuu liet si Trung doan 33.

Hay doc `PROJECT_PLAN.md` va `DATA_SCHEMA.md`. Xay frontend ReactJS bang Vite, ket noi Directus public API.

Yeu cau:
- Website public gop tat ca ho so thanh mot danh sach duy nhat.
- Co tim kiem tong hop, ho tro khong dau.
- Co loc theo que quan/tinh, don vi, nam hi sinh, noi an tang hien nay.
- Co trang chi tiet ho so.
- Co nut in ho so.
- Khong hien thi source sheet, source row, verification status, notes_internal.
- Giao dien trang trong, ro rang, de dung tren mobile.
```

## Phase 4 - QA and integration

Owner chinh: Codex

Input:

- Data normalized.
- Directus running.
- Frontend running.

Output can co:

- `QA_REPORT.md`
- Danh sach loi can sua.
- Ban chay local end-to-end.

Checklist:

- So dong import khop voi file normalized.
- Tim kiem co dau/khong dau dung.
- Bo loc dung.
- Trang chi tiet dung.
- Du lieu thieu khong lam vo UI.
- Public API khong lo field noi bo.
- Mobile layout on.
- Admin sua du lieu thi frontend doc duoc thay doi.

## 4. Thu tu de lam nhanh

1. Claude lam Phase 1: data normalization.
2. Kiro lam song song phan khung Docker/Directus theo schema.
3. Codex review output cua Claude va Kiro.
4. Kiro ket noi import voi data normalized.
5. Codex hoac Claude lam frontend.
6. Codex kiem thu end-to-end va sua loi tich hop.

## 5. Quy uoc ban giao

Khi mot agent hoan thanh, can bao gom:

- Files da tao/sua.
- Cach chay/kiem tra.
- Nhung diem chua chac.
- Loi hoac rui ro con lai.
- De xuat buoc tiep theo.

## 6. Nhung file khong nen sua lung tung

- `DATA_SCHEMA.md`: chi sua khi co ly do ro rang.
- `PROJECT_PLAN.md`: chi sua khi thay doi scope.
- File Excel goc: khong sua truc tiep.

## 7. Quyet dinh da chot

- Website public khong can SEO.
- Khong lam form gia dinh gui bo sung trong MVP.
- Khong hien thi source sheet/source row/trang thai xac minh tren website public.
- Gop tat ca cac sheet/giai doan thanh mot danh sach tra cuu duy nhat.
- Van luu `source_period` va `source_context` de phuc vu admin/thong ke sau nay.
