# PROJECT PLAN - Website tra cuu liet si Trung doan 33

## 1. Muc tieu

Xay dung website cong khai de tra cuu thong tin cac chien si, liet si cua Trung doan 33 da hi sinh, ho tro gia dinh tim kiem thong tin, noi hi sinh, noi an tang ban dau, noi quy tap va noi an tang hien nay.

Du an uu tien tinh chinh xac du lieu, kha nang tra cuu de dung, giao dien trang trong va kha nang quan tri du lieu lau dai.

## 2. Pham vi giai doan dau

### Co trong MVP

- Import du lieu tu file Excel nhieu sheet.
- Chuan hoa du lieu ve mot schema chung.
- Website cong khai bang ReactJS.
- Admin/backend bang Directus.
- Database bang PostgreSQL.
- Tim kiem tong hop.
- Tim kiem tieng Viet co dau va khong dau.
- Loc theo que quan.
- Loc theo don vi.
- Loc theo nam hi sinh.
- Loc theo noi an tang hien nay.
- Gop tat ca cac sheet/giai doan thanh mot danh sach tra cuu duy nhat.
- Luu truong metadata noi bo ve nguon/giai doan de dung sau nay neu can thong ke hoac loc nang cao.
- Danh sach ket qua co phan trang.
- Trang chi tiet tung liet si.
- Trang thong ke co ban.
- Nut in ho so.

### Chua lam trong MVP

- Khong can SEO web.
- Khong lam form de gia dinh gui bo sung thong tin.
- Khong hien thi nguon du lieu sheet/dong Excel tren website cong khai.
- Khong hien thi trang thai xac minh tren website cong khai.
- Khong lam ban do trong giai doan dau neu chua co toa do ro rang.

## 3. Kien truc de xuat

```text
Excel goc
  -> Script chuan hoa du lieu
  -> PostgreSQL
  -> Directus Admin/API
  -> ReactJS frontend
```

### Thanh phan

- Frontend: Vite + ReactJS.
- Backend/Admin: Directus.
- Database: PostgreSQL.
- Import/ETL: Node.js script doc Excel, chuan hoa va import.
- Deploy: Docker Compose.

## 4. Cac giai doan trien khai

### Giai doan 1: Phan tich va chuan hoa du lieu

Viec can lam:

- Doc toan bo file Excel hien co.
- Xac dinh sheet, cot, so dong va cac bat thuong du lieu.
- Map cac cot khac nhau ve mot schema chung.
- Giu lai du lieu goc trong cac truong raw.
- Tao truong phu phuc vu tim kiem va loc.
- Phat hien ho so co kha nang trung.
- Tao file trung gian `data/normalized/martyrs.json` hoac `data/normalized/martyrs.csv`.

Ket qua can co:

- Bao cao tong so ho so.
- Bao cao so ho so thieu thong tin quan trong.
- Bao cao cac dong nghi ngo trung lap.
- File du lieu da chuan hoa.

### Giai doan 2: Thiet ke Directus va database

Viec can lam:

- Tao collection `martyrs`.
- Tao cac collection phu neu can: `documents`, `cemeteries`, `units`.
- Cau hinh role admin/editor/public.
- Cau hinh quyen public chi doc cac truong duoc phep.
- An cac truong noi bo khoi public API.

Ket qua can co:

- Schema database.
- Directus chay duoc.
- Public API doc duoc danh sach liet si.
- Admin co the them/sua/xoa ho so.

### Giai doan 3: Import du lieu

Viec can lam:

- Viet script import du lieu da chuan hoa vao Directus/PostgreSQL.
- Dam bao import lap lai duoc.
- Dam bao khong ghi de cac truong admin da chinh sua neu khong co chu y.
- Kiem tra so dong import khop voi du lieu nguon.

Ket qua can co:

- Script import.
- Du lieu co trong Directus.
- Bao cao import thanh cong/that bai.

### Giai doan 4: Xay frontend ReactJS

Trang can co:

- Trang chu kiem trang tim kiem chinh.
- Trang danh sach ket qua.
- Trang chi tiet liet si.
- Trang thong ke co ban.

Tinh nang can co:

- Tim kiem tong hop.
- Tim khong dau.
- Loc theo que quan, don vi, nam hi sinh, noi an tang.
- Phan trang.
- Trang chi tiet hien thi day du thong tin cong khai.
- Nut in ho so.
- Giao dien mobile de dung.

### Giai doan 5: Kiem thu

Can kiem tra:

- Tim kiem tieng Viet co dau va khong dau.
- Bo loc hoat dong dung.
- Trang chi tiet khong vo khi thieu du lieu.
- Du lieu import tu cac sheet khop so luong.
- Quyen public khong lo truong noi bo.
- Giao dien desktop/mobile.
- Admin cap nhat du lieu va frontend hien thi dung.

### Giai doan 6: Trien khai va van hanh

Viec can lam:

- Dong goi bang Docker Compose.
- Cau hinh moi truong production.
- Cau hinh backup PostgreSQL dinh ky.
- Cau hinh HTTPS neu public internet.
- Viet huong dan van hanh ngan gon.

## 5. Yeu cau phi chuc nang

- Giao dien trang trong, ro rang, khong mau me.
- Tim kiem nhanh voi khoang 4.000 ho so va co the mo rong.
- Ho tro tieng Viet co dau.
- Ho tro nguoi dung lon tuoi: chu de doc, nut ro, it thao tac.
- Du lieu nhay cam chi hien thi neu da quyet dinh public.
- Co kha nang backup va khoi phuc du lieu.

## 6. Cach phoi hop voi AI Agent khac

### Lead Agent

Phu trach:

- Giu kien truc tong the.
- Review ket qua cac agent.
- Dam bao schema, import, backend va frontend khop nhau.
- Chay kiem thu cuoi.

### Data Agent

Phu trach:

- Doc Excel.
- Chuan hoa du lieu.
- Tao truong tim kiem.
- Tach nam hi sinh, tinh que quan neu co the.
- Phat hien trung lap.
- Tao bao cao chat luong du lieu.

Prompt goi y:

```text
Ban la Data Agent. Hay phan tich file Excel danh sach liet si nhieu sheet, chuan hoa thanh mot schema thong nhat, giu nguyen du lieu goc, tao them cac truong phuc vu tim kiem/loc, va bao cao cac van de du lieu thieu/trung/sai dinh dang.
```

### Backend Agent

Phu trach:

- Thiet ke Directus + PostgreSQL.
- Tao collections, fields, roles, permissions.
- Viet Docker Compose.
- Viet import script.

Prompt goi y:

```text
Ban la Backend Agent. Hay thiet ke Directus + PostgreSQL cho website tra cuu liet si. Tao collections, roles, permissions, Docker Compose, va script import du lieu da chuan hoa.
```

### Frontend Agent

Phu trach:

- Xay ReactJS frontend.
- Ket noi Directus API.
- Lam trang tim kiem, danh sach, chi tiet, thong ke.
- Dam bao mobile de dung.

Prompt goi y:

```text
Ban la Frontend Agent. Hay xay ReactJS frontend cho website tra cuu liet si, ket noi Directus API, co tim kiem khong dau, loc du lieu, danh sach ket qua, trang chi tiet, va giao dien trang trong de dung.
```

### QA Agent

Phu trach:

- Kiem thu import du lieu.
- Kiem thu tim kiem va bo loc.
- Kiem thu quyen public/private.
- Kiem thu giao dien mobile.
- Kiem thu cac truong hop du lieu thieu.

Prompt goi y:

```text
Ban la QA Agent. Hay kiem thu he thong tra cuu liet si: du lieu import, tim kiem tieng Viet, bo loc, trang chi tiet, quyen public/private, mobile layout, va cac truong hop du lieu thieu.
```

## 7. Thu tu uu tien gan nhat

1. Chuan hoa Excel thanh file du lieu trung gian.
2. Hoan thien schema Directus.
3. Dung Docker Compose cho Directus + PostgreSQL.
4. Import thu du lieu.
5. Xay frontend ReactJS.
6. Kiem thu va sua loi.
7. Trien khai ban dau.
