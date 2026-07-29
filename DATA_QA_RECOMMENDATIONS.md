# DATA QA - Khuyen nghi xu ly du lieu liet si E33

- Nguon kiem tra: `data/normalized/martyrs.json` (3826 ho so), `data/reports/possible_duplicates.csv`
- Nguoi thuc hien: Data Agent (Claude)
- Nguyen tac: **khong sua du lieu goc**, **khong sua `DATA_SCHEMA.md`**. Tai lieu nay chi de xuat cach xu ly de admin/Codex/Kiro quyet dinh.
- Cach ap dung chung: uu tien danh dau `verification_status = needs_more_info` va ghi `notes_internal` cho cac ho so nghi ngo, thay vi chinh sua gia tri goc. Moi `record_code` deu on dinh nen co the tra cuu lai chinh xac.

---

## 1. Tong quan chat luong

| Truong quan trong | So ho so thieu | Ty le | Muc do |
| --- | --- | --- | --- |
| `full_name` | 0 | 0.0% | Tot |
| `death_year` | 4 | 0.1% | Tot |
| `death_date_raw` | 4 | 0.1% | Tot |
| `hometown_raw` | 6 | 0.2% | Tot |
| `province` (tach duoc) | 20 | 0.5% | Tot |
| `unit` | 23 | 0.6% | Chap nhan |
| `birth_year` (tach duoc) | 172 | 4.5% | Chap nhan |
| `initial_burial_place` | 3574 | **93.4%** | **Nghiem trong** |
| `current_burial_place` | 3806 | **99.5%** | **Nghiem trong** |
| Thieu ca 3 truong noi an tang/quy tap | 3567 | **93.2%** | **Nghiem trong** |

**Phat hien lon nhat:** gan nhu toan bo ho so **khong co thong tin noi hi sinh/an tang/quy tap**. Day chinh la thong tin ma than nhan can nhat. Du lieu goc trong Excel that su de trong o cac cot nay (khong phai loi map cot). Can lam ro voi ben cung cap du lieu: co nguon bo sung noi an tang khong. Neu khong co, frontend phai xu ly hien thi "chua co thong tin" mot cach trang trong va khong lam vo UI.

---

## 2. Ho so thieu thong tin quan trong

### 2.1. Ho so gan nhu trong (chi co ten)

Chi 2 ho so, va that ra la **1 nguoi** bi lap giua 2 sheet:

| record_code | full_name | sheet | Ghi chu |
| --- | --- | --- | --- |
| `6875-2877` | Vũ Xuân Kiên | 1968 - 1975 | Khong nam sinh/que/don vi/ngay hi sinh |
| `s1-6` | Vũ Xuân Kiên | Sheet1 | Trung nguoi voi tren |

**De xuat:** dat `verification_status = needs_more_info`, `public_status = draft` (an tam khoi public cho toi khi co them thong tin). Khong xoa.

### 2.2. Ten khong day du / kho nhan dang

Mot so ho so co ten bi cat cut hoac chi la mot tu:

| record_code | full_name goc | Ghi chu |
| --- | --- | --- |
| `6875-25` | (Liệt Sĩ ) Đào | Thieu ho + ten dem |
| `6875-1262` | Liệt Sĩ Điều | Chi con 1 tu |
| `6875-1891` | Mùi | Chi 1 tu, thieu que quan |

**De xuat:** danh dau `needs_more_info`; giu nguyen `full_name` goc (khong tu doan). `full_name_normalized` van dung duoc cho tim kiem.

### 2.3. Thieu que quan (6) / thieu don vi (23)

- Thieu `hometown_raw`: `6567-636`, `6875-661` (Bùi Lăng), `6875-1891` (Mùi), `6875-2877`/`s1-6` (Vũ Xuân Kiên), `6875-2879` (Nguyễn Văn Quân).
- Thieu `unit`: 23 ho so (vd `6875-25`, `6875-27`, `6875-1262`, `6875-1366`...).

**De xuat:** khong chan public chi vi thieu que quan/don vi (van co ten + nam hi sinh). Chi danh dau de admin bo sung dan. Frontend can chiu duoc gia tri rong.

---

## 3. Nam hi sinh bat thuong

Chuong trinh phat hien 6 ho so co `death_year` ngoai khoang chien tranh 1965-1979:

| record_code | full_name | death_date_raw | death_year | Chan doan | De xuat |
| --- | --- | --- | --- | --- | --- |
| `6875-28` | Bùi Xuân Quế | 17/01/1964 | 1964 | Som hon giai doan chinh nhung **co the dung** (nhap ngu truoc, hi sinh dau 1964) | Giu, khong can sua. Coi la bien. |
| `6567-756` | Nguyễn Đức Lộc | 31/05/1996 | 1996 | Nghi la ngay **quy tap/cai tang** hoac loi nhap, khong phai ngay hi sinh | `needs_more_info`; khong dung 1996 cho bo loc nam hi sinh |
| `6875-2862` | Nguyễn Đức Lộc | 31/05/1996 | 1996 | **Trung nguoi** voi `6567-756` (cung don vi C15E33, cung que) | Nhu tren; xu ly cung nhom trung |
| `6875-2860` | Nguyễn Khắc Cương | 23/06/1982 | 1982 | Sau chien tranh; nghi ngay dang ky/cai tang hoac loi | `needs_more_info` |
| `6875-2861` | Nông Hồng Quảng | 10/09/1986 | 1986 | Sau chien tranh; nghi ngay dang ky/cai tang hoac loi | `needs_more_info` |
| `6875-2868` | Nguyễn Hữu Phốn | 26/10/**1698** | 1998 (parser) | **Loi go** (1698 khong ton tai). Nhieu kha nang la **1968** | Sua parser + `needs_more_info` (xem 3.1) |

### 3.1. Loi parser can sua (khong sua du lieu goc)

`death_date_raw = "26/10/1698"` bi `parse_death_year` suy ra **1998** do quy tac du phong lay 2 chu so cuoi ("98"). Day la ket qua sai.

**De xuat sua trong `scripts/normalize-excel.py`:** neu chuoi da chua mot cum 4 chu so (vd `1698`) nhung khong khop `19xx/20xx`, coi la **nam khong hop le -> `death_year = null`** + danh dau can xem lai, thay vi lay 2 chu so cuoi. Sau khi sua, chay lai script se cho `death_year = null` cho `6875-2868` (an toan hon la doan sai 1998). Toi co the ap dung sua nay neu duoc dong y.

---

## 4. Nam sinh bat thuong

26 ho so co nam sinh nghi ngo (do tuoi khi hi sinh < 15, hoac sinh sau khi hi sinh, hoac > 1962). Vi la du lieu lap giua 2 sheet nen thuc chat khoang **17 nguoi**. Cac mau tieu bieu:

| record_code | full_name | birth_year | death_year | Van de |
| --- | --- | --- | --- | --- |
| `6567-460` / `6875-472` | Tư Vũ Hồng | 1974 | 1966 | Sinh **sau** khi hi sinh -> chac chan loi |
| `6875-1207` | Nguyễn Đức Chính | 1973 | 1969 | Sinh sau khi hi sinh -> loi |
| `bgtn-50` | Đặng Như Luyến | 1985 | 1979 | Sinh sau khi hi sinh -> loi |
| `6875-885` | Ma Văn Khai | 1964 | 1968 | Tuoi 4 khi hi sinh -> loi |
| `6875-2761` | Nguyễn Văn Đặng | 1973 | 1975 | Tuoi 2 -> loi |
| `bgtn-5` | Lê Văn Lạc | 1969 | 1975 | Tuoi 6 -> loi (co the 1949) |
| `6567-24` / `6875-24` | Trần Trọng Rằng | 1954 | 1965 | Tuoi 11 -> nghi ngo |

Phan lon la **loi go nam sinh** (vd `1974` le ra `1947`/`1949`, `1969` le ra `1949`). 

**De xuat:**
- Khong tu dong sua nam sinh (khong doan so goc).
- Sinh ra quy tac kiem tra tu dong khi import/admin: neu `birth_year > death_year` hoac `death_year - birth_year < 15` -> gan `verification_status = needs_more_info` va ghi `notes_internal` (vd "nam sinh nghi loi go"). Danh sach 26 record_code o tren dung lam viec kiem tra thu cong.
- Bo loc "nam hi sinh" tren web khong bi anh huong; nhung neu sau nay hien "tuoi", phai bo qua cac gia tri nghi loi.

---

## 5. Xu ly trung lap (khong xoa du lieu)

### 5.1. Buc tranh trung lap

- 901 nhom nghi trung, 2048 ho so bi gan co (53.5%).
- Phan bo do tin cay: **high 1407, medium 97, low 544**.
- Ban chat trung:

| To hop sheet cua nhom trung | So nhom |
| --- | --- |
| `1965 - 1967` + `1968 - 1975` | 703 |
| Chi trong `1968 - 1975` (trung noi bo) | 123 |
| `1968 - 1975` + `Sheet2` | 40 |
| `1968 - 1975` + `Biên giới tây nam` | 16 |
| Ba sheet tro len | 12 |

**Ket luan:** sheet `1965 - 1967` gan nhu la **tap con duoc liet ke lai** trong `1968 - 1975` (703/755 ho so cua sheet 1965-1967 trung ten+nam sinh voi sheet 1968-1975). Day khong phai loi chuan hoa ma la ban chat file nguon.

### 5.2. Rui ro neu de nguyen

Neu hien tat ca 3826 ho so cong khai, than nhan se thay **2 ban ghi giong het nhau** cho cung mot liet si -> gay hoang mang, giam tin cay.

### 5.3. De xuat (khong xoa, uu tien theo thu tu)

1. **Chon ban ghi dai dien (canonical) theo nhom `high`** (trung `full_name_normalized` + `birth_year`):
   - Trong moi nhom, chon ban ghi **day du thong tin nhat** (nhieu truong khac rong nhat; uu tien sheet `1968 - 1975` vi co them than nhan/noi an tang).
   - Them field noi bo (vd `is_canonical` / `duplicate_of`) **o tang backend hoac tang hien thi**, KHONG xoa cac ban con lai.
   - Web public chi hien ban canonical; cac ban trung van con trong Directus cho admin doi chieu.
2. **Nhom `medium`/`low` (chi trung ten, khac nam sinh/que):** **khong** gop tu dong (nhieu kha nang la nguoi khac nhau, vd "Nguyễn Văn Quang" 9 ban ghi khac que). Chi liet ke trong `possible_duplicates.csv` de admin xem tay.
3. **Neu chua kip lam bo canonical cho MVP:** giai phap tam la gop hien thi o frontend theo khoa `full_name_normalized + birth_year + unit_normalized`, gop cac ban giong nhau thanh 1 the va gop cac truong khong rong. Van giu nguyen du lieu trong DB.
4. Field `possible_duplicate_group` + `possible_duplicate_confidence` da co san trong `martyrs.json`/CSV de ho tro cac buoc tren (import script bo qua field nay, khong anh huong DB).

**Khong** thuc hien xoa cung o bat ky buoc nao.

---

## 6. Tinh/que quan tach sai hoac chua tach

### 6.1. Chua tach duoc tinh (14 ho so co que quan)

| Vi du | Ly do | De xuat |
| --- | --- | --- |
| `Quảng Đông, Trung Quốc` (`6567-37`, `6875-42`) | Que o **nuoc ngoai** | Dung: de `province` rong |
| `Nhật Trực, Kim Bảng` | Chi co xa + huyen (Kim Bảng thuoc Hà Nam), thieu ten tinh | Co the suy tinh tu huyen bang bang huyen->tinh (giai doan sau) |
| `Hữu Lâm, Chi Lăng`; `Thanh Tương, Na Hang`; `... Chợ Đồn` | Chi den cap huyen | Nhu tren |
| `Bắc Trạch - Bố Trạch`; `... Bố Trạch Quảng Bình` | Tinh dinh lien token (`Bố Trạch Quảng Bình`) | Cai thien tach: neu token cuoi chua ten tinh o cuoi chuoi thi tach ra |
| `Kiến Thụy - Kiến An 451/19 Hai Bà Trưng Tân Định Sài Gòn` | Chuoi ghep 2 dia chi | Xem tay |

**De xuat:** giai doan sau bo sung **bang tra huyen -> tinh** de vot them cac ho so chi ghi den cap huyen. Con 20/3826 (0.5%) chua tach duoc la muc rat tot cho MVP; khong chan.

### 6.2. Tach `district`/`commune` sai voi dia chi do thi (20+ ho so)

Voi dia chi thanh pho (co so nha), viec tach theo dau phay bi lech:

| record_code | province | district (sai) | commune (sai) | hometown_raw |
| --- | --- | --- | --- | --- |
| `bgtn-14` | TP.HCM | `7 Vườn Chuối P.6 Q.3` | `48` | `48/7 Vườn Chuối P.6 Q.3 - TP.HCM` |
| `6875-1479` | Hà Nội | `Khối 7 Khu 3 Sơn Tây` | `49 B Hoàng Diệu` | `49 B Hoàng Diệu - Khối 7 Khu 3 Sơn Tây - Hà Nội` |
| `6875-2551` | Nghệ Tĩnh | `Kp2` | `Tp Vinh` | `Tp Vinh - Kp2 - Nghệ Tỉnh` |

`province` van **dung**; chi `district`/`commune` bi nhieu. 20 ho so `district` chua so, 78 ho so `commune` chua so.

**De xuat:**
- `province` la bo loc chinh -> **giu, dang tin cay**.
- `district`/`commune` chi la best-effort. De xuat: **khong hien** `district`/`commune` rieng le tren web MVP (chi hien `hometown_raw` day du + loc theo `province`). Nhu vay tranh lo cac gia tri tach sai. Tang admin van thay va sua dan.
- Neu can hien district: bo sung quy tac "neu token chua chu so hoac tien to duong pho (`P.`, `Q.`, `Tổ`, `Khối`, `ấp`, `/`) thi khong coi la district/commune".

### 6.3. Ghi chu chinh ta nguon

Co ban ghi ghi `Nghệ Tỉnh` (dung la `Nghệ Tĩnh`), `Hải phòng` (thuong `Hải Phòng`). `province_normalized` da xu ly nho bo dau + lowercase nen tim kiem/loc **khong bi anh huong**. Khong can sua goc.

---

## 7. Bang hanh dong de xuat (uu tien)

| # | Van de | Muc do | Hanh dong de xuat | Sua du lieu goc? |
| --- | --- | --- | --- | --- |
| 1 | Thieu noi an tang/hi sinh (93-99%) | Cao | Hoi ben cung cap du lieu; frontend hien "chua co thong tin" gon gang | Khong |
| 2 | Trung lap 53% (cross-sheet) | Cao | Chon ban canonical cho nhom `high`; gop hien thi; giu nguyen DB | Khong (them field noi bo) |
| 3 | Nam sinh nghi loi (26 rec) | Trung | Quy tac kiem tra tu dong -> `needs_more_info`; xem tay | Khong |
| 4 | Nam hi sinh > 1980 (5 rec) + loi parser `1698` | Trung | Sua parser (year 4 so khong hop le -> null); `needs_more_info` | Khong (chi sua script + flag) |
| 5 | Ho so chi co ten (2) / ten cut (3) | Trung | `needs_more_info`, `public_status = draft` | Khong |
| 6 | district/commune tach sai do thi | Thap | An district/commune tren web MVP; loc theo `province` | Khong |
| 7 | 14 que quan chua tach tinh (cap huyen/nuoc ngoai) | Thap | Bang huyen->tinh o giai doan sau | Khong |

---

## 8. Ghi chu ban giao

- Tat ca `record_code` trong tai lieu nay tra cuu truc tiep duoc trong `martyrs.json` va Directus sau khi import.
- Cac de xuat "flag" deu dung `verification_status` / `public_status` / `notes_internal` (deu la field noi bo, khong public) -> khong lam lo thong tin ra web.
- Rieng muc **3.1 (loi parser 1698)** va **6.2 (quy tac district/commune)** neu duoc dong y, toi co the cap nhat `scripts/normalize-excel.py` va chay lai (khong dung toi Excel goc).
- Khong co thay doi nao doi voi `DATA_SCHEMA.md` hay file Excel goc.
