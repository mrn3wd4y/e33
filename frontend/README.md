# Frontend - Website tra cuu liet si Trung doan 33

ReactJS + Vite frontend cho website tra cuu cong khai.

## Chay local

```bash
npm install
npm run dev
```

Mac dinh app doc du lieu mock tu:

```text
public/data/martyrs.json
```

## Ket noi Directus

Tao file `.env.local` trong thu muc `frontend/`:

```text
VITE_DIRECTUS_URL=http://localhost:8055
```

Khi bien nay co gia tri, app se thu doc:

```text
/items/martyrs?limit=-1
```

Neu Directus chua san sang, app tu fallback ve du lieu mock local.

## Pham vi hien tai

- Gop tat ca ho so thanh mot danh sach tra cuu duy nhat.
- Tim kiem tong hop, ho tro khong dau.
- Loc theo tinh que quan, don vi, nam hi sinh, noi an tang hien nay.
- Danh sach ket qua co phan trang.
- Chi tiet ho so trong dialog.
- Nut in ho so.
- Khong hien thi cac field noi bo nhu source sheet, source row, verification status, raw payload.
