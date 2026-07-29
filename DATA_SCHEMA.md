# DATA SCHEMA - Du lieu liet si Trung doan 33

## 1. Nguyen tac thiet ke

- Giu nguyen du lieu goc tu Excel trong cac truong raw khi du lieu co the khong dong nhat.
- Tao them cac truong chuan hoa de tim kiem, loc va sap xep.
- Khong hien thi cac truong noi bo tren website cong khai.
- Khong lam mat thong tin goc khi import lai.
- Moi ho so can co mot ma dinh danh on dinh de tranh trung va ho tro cap nhat sau nay.

## 2. Collection chinh: `martyrs`

Collection nay luu moi ho so liet si.

| Field | Type | Public | Bat buoc | Mo ta |
| --- | --- | --- | --- | --- |
| `id` | uuid/integer | Co | Co | Khoa chinh |
| `record_code` | string | Khong | Co | Ma ho so on dinh, tao tu nguon hoac hash du lieu |
| `slug` | string | Co | Co | Duong dan chi tiet tren website |
| `full_name` | string | Co | Co | Ho va ten liet si |
| `full_name_normalized` | string | Khong | Co | Ten bo dau/lowercase de tim kiem |
| `birth_year` | integer | Co | Khong | Nam sinh neu tach duoc |
| `birth_year_raw` | string | Co | Khong | Gia tri nam sinh nguyen ban tu Excel |
| `hometown_raw` | text | Co | Khong | Que quan nguyen van |
| `hometown_normalized` | text | Khong | Khong | Que quan bo dau/lowercase de tim kiem |
| `province` | string | Co | Khong | Tinh/thanh tach tu que quan |
| `district` | string | Co | Khong | Quan/huyen tach tu que quan |
| `commune` | string | Co | Khong | Xa/phuong tach tu que quan |
| `enlistment_date_raw` | string | Co | Khong | Thoi gian nhap ngu nguyen van |
| `unit` | string | Co | Khong | Don vi nguyen van |
| `unit_normalized` | string | Khong | Khong | Don vi chuan hoa de tim/lap thong ke |
| `death_date_raw` | string | Co | Khong | Ngay/thang/nam hi sinh nguyen van |
| `death_year` | integer | Co | Khong | Nam hi sinh tach duoc |
| `initial_burial_place` | text | Co | Khong | Noi hi sinh va an tang ban dau |
| `initial_burial_place_normalized` | text | Khong | Khong | Ban bo dau de tim kiem |
| `initial_collection_place` | text | Co | Khong | Noi quy tap ban dau neu co |
| `current_burial_place` | text | Co | Khong | Noi an tang hien nay |
| `current_burial_place_normalized` | text | Khong | Khong | Ban bo dau de tim kiem |
| `portrait_url` | string | Co | Khong | URL anh chan dung liet si neu co |
| `relative_name` | string | Tuy chon | Khong | Ho ten than nhan neu quyet dinh public |
| `relative_address` | text | Tuy chon | Khong | Dia chi than nhan hien tai neu duoc phep luu/hien thi |
| `relative_phone` | string | Tuy chon | Khong | So dien thoai than nhan hien tai neu duoc phep luu/hien thi |
| `notes_public` | text | Co | Khong | Ghi chu duoc phep hien thi cong khai |
| `source_period` | string | Khong | Khong | Metadata noi bo ve giai doan/sheet nguon, de dung sau nay neu can loc/thong ke |
| `source_context` | string | Khong | Khong | Metadata noi bo ve chien truong/khu vuc theo sheet nguon |
| `public_status` | string | Khong | Co | `draft`, `published`, `hidden` |
| `verification_status` | string | Khong | Khong | `unreviewed`, `reviewing`, `verified`, `needs_more_info` |
| `notes_internal` | text | Khong | Khong | Ghi chu noi bo |
| `source_file` | string | Khong | Khong | Ten file Excel nguon |
| `source_sheet` | string | Khong | Khong | Sheet nguon |
| `source_row` | integer | Khong | Khong | Dong nguon trong Excel |
| `source_record_no` | string | Khong | Khong | So TT trong sheet nguon |
| `raw_payload` | json | Khong | Khong | Toan bo dong du lieu goc sau khi doc Excel |
| `created_at` | datetime | Khong | Co | Ngay tao |
| `updated_at` | datetime | Khong | Co | Ngay cap nhat |

## 3. Gia tri goi y cho enum

### `public_status`

- `draft`: ban nhap, chua hien thi.
- `published`: hien thi cong khai.
- `hidden`: an khoi website cong khai.

### `verification_status`

- `unreviewed`: chua kiem tra.
- `reviewing`: dang xac minh.
- `verified`: da xac minh.
- `needs_more_info`: can bo sung thong tin.

### `source_period`

- `1965-1967`
- `1968-1975`
- `bien-gioi-tay-nam`
- `bo-sung`
- `khac`

## 4. Mapping tu Excel hien co

### Sheet `1965 - 1967`

| Excel | Field |
| --- | --- |
| `TT` | `source_record_no` |
| `HỌ VÀ TÊN` | `full_name` |
| `NĂM SINH` | `birth_year_raw`, `birth_year` |
| `QUÊ QUÁN` | `hometown_raw` |
| `NHẬP NGŨ` | `enlistment_date_raw` |
| `ĐƠN VỊ` | `unit` |
| `NGÀY HY SINH` | `death_date_raw`, `death_year` |
| `NƠI HI SINH VÀ AN TÁNG BAN ĐẦU` | `initial_burial_place` |
| `NƠI AN TÁNG HIỆN NAY` | `current_burial_place` |
| `GHI CHÚ` | `notes_public` hoac `notes_internal` tuy noi dung |

Gia tri mac dinh:

- `source_period`: `1965-1967`
- `source_context`: `Tay Nguyen`

### Sheet `1968 - 1975`

| Excel | Field |
| --- | --- |
| `TT` | `source_record_no` |
| `HỌ VÀ TÊN` | `full_name` |
| `NĂM SINH` | `birth_year_raw`, `birth_year` |
| `QUÊ QUÁN` | `hometown_raw` |
| `NHẬP NGŨ` | `enlistment_date_raw` |
| `ĐƠN VỊ` | `unit` |
| `NGÀY HY SINH` | `death_date_raw`, `death_year` |
| `NƠI HI SINH VÀ AN TÁNG BAN ĐẦU` | `initial_burial_place` |
| `NƠI AN TÁNG HIỆN NAY` | `current_burial_place` |
| `HỌ TÊN THÂN NHÂN` | `relative_name` |
| `GHI CHÚ` | `notes_public` hoac `notes_internal` tuy noi dung |

Gia tri mac dinh:

- `source_period`: `1968-1975`
- `source_context`: `Mien Dong Nam Bo`

### Sheet `Biên giới tây nam`

| Excel | Field |
| --- | --- |
| `TT` | `source_record_no` |
| `HỌ VÀ TÊN` | `full_name` |
| `NĂM SINH` | `birth_year_raw`, `birth_year` |
| `QUÊ QUÁN` | `hometown_raw` |
| `NHẬP NGŨ` | `enlistment_date_raw` |
| `ĐƠN VỊ` | `unit` |
| `NGÀY HY SINH` | `death_date_raw`, `death_year` |
| `NƠI HI SINH VÀ AN TÁNG BAN ĐẦU` | `initial_burial_place` |
| `NƠI QUY TẬP BAN ĐẦU` | `initial_collection_place` |
| `NƠI AN TÁNG HIỆN NAY` | `current_burial_place` |
| `GHI CHÚ` | `notes_public` hoac `notes_internal` tuy noi dung |

Gia tri mac dinh:

- `source_period`: `bien-gioi-tay-nam`
- `source_context`: `Bien gioi Tay Nam`

### Sheet `Sheet2`

| Excel | Field |
| --- | --- |
| `STT` | `source_record_no` |
| `Họ Và Tên` | `full_name` |
| `Năm Sinh` | `birth_year_raw`, `birth_year` |
| `Nguyên Quán` | `hometown_raw` |
| `Nhập Ngũ` | `enlistment_date_raw` |
| `Đơn Vị` | `unit` |
| `Ngày tháng năm HS` | `death_date_raw`, `death_year` |

Gia tri mac dinh:

- `source_period`: `1968-1975`
- `source_context`: `Mien Dong Nam Bo`
- `notes_internal`: `Nguon Sheet2 - DS LS E33 HS thang 03, 04 va 05/1974`

### Sheet `Sheet1`

Sheet nay khong co header ro rang trong cac dong dau. Can xu ly rieng bang mapping theo vi tri cot sau khi xac nhan lai.

Mapping tam thoi theo quan sat:

| Cot | Field |
| --- | --- |
| B | `full_name` |
| C | `birth_year_raw`, `birth_year` |
| D | `hometown_raw` |
| E | `enlistment_date_raw` |
| F | `unit` |
| G | `death_date_raw`, `death_year` |
| H | `initial_burial_place` |
| I | `current_burial_place` |
| K | `notes_internal` hoac `verification_status` |

Gia tri mac dinh:

- `source_period`: `bo-sung`
- `source_context`: `Chua xac dinh`

## 5. Truong public tren website

Nen hien thi:

- `full_name`
- `birth_year`
- `birth_year_raw`
- `hometown_raw`
- `province`
- `district`
- `commune`
- `enlistment_date_raw`
- `unit`
- `death_date_raw`
- `death_year`
- `initial_burial_place`
- `initial_collection_place`
- `current_burial_place`
- `portrait_url`
- `relative_name` neu duoc phep public
- `relative_address` neu duoc phep public
- `relative_phone` neu duoc phep public
- `notes_public`

Khong hien thi:

- `record_code`
- `full_name_normalized`
- `hometown_normalized`
- `unit_normalized`
- `initial_burial_place_normalized`
- `current_burial_place_normalized`
- `public_status`
- `verification_status`
- `notes_internal`
- `source_file`
- `source_sheet`
- `source_row`
- `source_record_no`
- `source_period`
- `source_context`
- `raw_payload`

## 6. Quy tac chuan hoa

### Ten

- `full_name`: giu nguyen dau tieng Viet va chinh ta tu Excel.
- `full_name_normalized`: lowercase, bo dau, xoa khoang trang thua.

### Nam sinh

- Neu gia tri la `1946`, luu `birth_year = 1946`.
- Neu gia tri la `1946.0`, luu `birth_year = 1946`, `birth_year_raw = "1946.0"`.
- Neu gia tri rong hoac khong ro, de `birth_year = null`.

### Ngay hi sinh

- `death_date_raw`: luu nguyen van.
- `death_year`: tach nam tu cac dinh dang nhu `1965`, `01/04/1974`, `04/1974`, `04/74` neu duoc.
- Khong nen ep tat ca thanh date vi nhieu dong chi co nam hoac thang/nam.

### Que quan

- `hometown_raw`: luu nguyen van.
- `province`: tach tinh/thanh bang rule va danh sach tinh lich su/hien tai.
- Neu khong chac chan, khong gan bua; de rong va dua vao bao cao can xem lai.

### Don vi

- `unit`: luu nguyen van.
- `unit_normalized`: bo dau, xoa dau cach thua, chuan hoa mot so bien the nhu `C3D1E33`, `C3 D1 E33`.

### Slug

Goi y format:

```text
{full-name-normalized}-{birth-year-or-unknown}-{short-record-code}
```

Vi du:

```text
bui-si-nho-1946-a1b2c3
```

## 7. Phat hien trung lap

Can gan co `possible_duplicate_group` o buoc chuan hoa neu gap:

- Trung `full_name_normalized` va `birth_year`.
- Trung `full_name_normalized`, gan giong `hometown_raw`.
- Trung ten, trung don vi, trung nam hi sinh.

Khong tu dong xoa trung lap trong giai doan dau. Chi bao cao de admin xem lai.

## 8. Collection phu de xuat

### `documents`

Dung cho giai doan sau neu co anh/tai lieu.

| Field | Type | Mo ta |
| --- | --- | --- |
| `id` | uuid/integer | Khoa chinh |
| `martyr_id` | relation | Lien ket ho so liet si |
| `file` | file | Anh/tai lieu |
| `title` | string | Tieu de |
| `document_type` | string | Bia mo, giay bao tu, so do, khac |
| `public_status` | string | Cong khai/an |
| `notes_internal` | text | Ghi chu noi bo |

### `cemeteries`

Dung cho giai doan sau neu chuan hoa noi an tang.

| Field | Type | Mo ta |
| --- | --- | --- |
| `id` | uuid/integer | Khoa chinh |
| `name` | string | Ten nghia trang |
| `province` | string | Tinh/thanh |
| `district` | string | Quan/huyen |
| `address` | text | Dia chi |
| `latitude` | decimal | Vi do |
| `longitude` | decimal | Kinh do |

### `units`

Dung cho giai doan sau neu muon thong ke don vi tot hon.

| Field | Type | Mo ta |
| --- | --- | --- |
| `id` | uuid/integer | Khoa chinh |
| `code` | string | Ma don vi |
| `name` | string | Ten day du |
| `parent_unit` | relation | Don vi cap tren |
| `notes` | text | Ghi chu |

## 9. Chi muc tim kiem goi y

Neu dung PostgreSQL:

- Index cho `full_name_normalized`.
- Index cho `death_year`.
- Index cho `province`.
- Index cho `source_period` neu sau nay can loc/thong ke theo giai doan nguon.
- Index cho `unit_normalized`.
- Full-text hoac trigram index cho cac truong normalized neu can tim gan dung.

## 10. API public goi y

Frontend chi can doc cac truong public.

Danh sach:

```text
GET /items/martyrs
```

Bo loc can ho tro:

- `search`
- `province`
- `unit`
- `death_year`
- `current_burial_place`
- `page`
- `limit`

Chi tiet:

```text
GET /items/martyrs/{id-or-slug}
```

Thong ke:

Co the tinh o frontend tu API trong MVP, sau nay neu cham thi lam endpoint rieng.
