// Dinh nghia collection `martyrs` va danh sach field theo DATA_SCHEMA.md.
// Dung boi apply-schema.js. Danh dau field nao public de cau hinh permission.

const COLLECTION = 'martyrs';

// meta.interface/display de gon; type la kieu Directus.
// public: true nghia la public role duoc doc field nay.
const fields = [
  // Khoa chinh
  { field: 'id', type: 'integer', public: true, pk: true,
    meta: { hidden: true, readonly: true, interface: 'input' },
    schema: { is_primary_key: true, has_auto_increment: true } },

  { field: 'record_code', type: 'string', public: false,
    meta: { note: 'Ma ho so on dinh', interface: 'input', readonly: true },
    schema: { is_unique: true } },

  { field: 'slug', type: 'string', public: true,
    meta: { note: 'Duong dan chi tiet', interface: 'input' },
    schema: { is_unique: true } },

  { field: 'full_name', type: 'string', public: true,
    meta: { note: 'Ho va ten liet si', interface: 'input' } },
  { field: 'full_name_normalized', type: 'string', public: false,
    meta: { note: 'Ten bo dau de tim kiem', interface: 'input' } },

  { field: 'birth_year', type: 'integer', public: true,
    meta: { note: 'Nam sinh tach duoc', interface: 'input' } },
  { field: 'birth_year_raw', type: 'string', public: true,
    meta: { note: 'Nam sinh nguyen ban', interface: 'input' } },

  { field: 'hometown_raw', type: 'text', public: true,
    meta: { note: 'Que quan nguyen van', interface: 'input-multiline' } },
  { field: 'hometown_normalized', type: 'text', public: false,
    meta: { note: 'Que quan bo dau', interface: 'input-multiline' } },
  { field: 'province', type: 'string', public: true,
    meta: { note: 'Tinh/thanh', interface: 'input' } },
  { field: 'district', type: 'string', public: true,
    meta: { note: 'Quan/huyen', interface: 'input' } },
  { field: 'commune', type: 'string', public: true,
    meta: { note: 'Xa/phuong', interface: 'input' } },

  { field: 'enlistment_date_raw', type: 'string', public: true,
    meta: { note: 'Thoi gian nhap ngu nguyen van', interface: 'input' } },

  { field: 'unit', type: 'string', public: true,
    meta: { note: 'Don vi nguyen van', interface: 'input' } },
  { field: 'unit_normalized', type: 'string', public: false,
    meta: { note: 'Don vi chuan hoa', interface: 'input' } },

  { field: 'death_date_raw', type: 'string', public: true,
    meta: { note: 'Ngay hi sinh nguyen van', interface: 'input' } },
  { field: 'death_year', type: 'integer', public: true,
    meta: { note: 'Nam hi sinh tach duoc', interface: 'input' } },

  { field: 'initial_burial_place', type: 'text', public: true,
    meta: { note: 'Noi hi sinh va an tang ban dau', interface: 'input-multiline' } },
  { field: 'initial_burial_place_normalized', type: 'text', public: false,
    meta: { note: 'Ban bo dau', interface: 'input-multiline' } },
  { field: 'initial_collection_place', type: 'text', public: true,
    meta: { note: 'Noi quy tap ban dau', interface: 'input-multiline' } },
  { field: 'current_burial_place', type: 'text', public: true,
    meta: { note: 'Noi an tang hien nay', interface: 'input-multiline' } },
  { field: 'current_burial_place_normalized', type: 'text', public: false,
    meta: { note: 'Ban bo dau', interface: 'input-multiline' } },
  { field: 'portrait_url', type: 'string', public: true,
    meta: { note: 'URL anh chan dung liet si neu co', interface: 'input' } },

  { field: 'relative_name', type: 'string', public: true,
    meta: { note: 'Ho ten than nhan (chi public neu quyet dinh)', interface: 'input' } },
  { field: 'relative_address', type: 'text', public: true,
    meta: { note: 'Dia chi than nhan hien tai', interface: 'input-multiline' } },
  { field: 'relative_phone', type: 'string', public: true,
    meta: { note: 'So dien thoai than nhan hien tai', interface: 'input' } },
  { field: 'notes_public', type: 'text', public: true,
    meta: { note: 'Ghi chu cong khai', interface: 'input-multiline' } },

  // Metadata noi bo
  { field: 'source_period', type: 'string', public: false,
    meta: { note: 'Metadata noi bo: giai doan/sheet nguon', interface: 'select-dropdown',
      options: { choices: [
        { text: '1965-1967', value: '1965-1967' },
        { text: '1968-1975', value: '1968-1975' },
        { text: 'bien-gioi-tay-nam', value: 'bien-gioi-tay-nam' },
        { text: 'bo-sung', value: 'bo-sung' },
        { text: 'khac', value: 'khac' },
      ] } } },
  { field: 'source_context', type: 'string', public: false,
    meta: { note: 'Metadata noi bo: chien truong/khu vuc', interface: 'input' } },

  { field: 'public_status', type: 'string', public: false,
    meta: { note: 'draft/published/hidden', interface: 'select-dropdown',
      options: { choices: [
        { text: 'draft', value: 'draft' },
        { text: 'published', value: 'published' },
        { text: 'hidden', value: 'hidden' },
      ] } },
    schema: { default_value: 'draft' } },
  { field: 'verification_status', type: 'string', public: false,
    meta: { note: 'unreviewed/reviewing/verified/needs_more_info', interface: 'select-dropdown',
      options: { choices: [
        { text: 'unreviewed', value: 'unreviewed' },
        { text: 'reviewing', value: 'reviewing' },
        { text: 'verified', value: 'verified' },
        { text: 'needs_more_info', value: 'needs_more_info' },
      ] } },
    schema: { default_value: 'unreviewed' } },
  { field: 'notes_internal', type: 'text', public: false,
    meta: { note: 'Ghi chu noi bo', interface: 'input-multiline' } },

  { field: 'source_file', type: 'string', public: false,
    meta: { note: 'Ten file Excel nguon', interface: 'input' } },
  { field: 'source_sheet', type: 'string', public: false,
    meta: { note: 'Sheet nguon', interface: 'input' } },
  { field: 'source_row', type: 'integer', public: false,
    meta: { note: 'Dong nguon trong Excel', interface: 'input' } },
  { field: 'source_record_no', type: 'string', public: false,
    meta: { note: 'So TT trong sheet nguon', interface: 'input' } },
  { field: 'raw_payload', type: 'json', public: false,
    meta: { note: 'Toan bo dong du lieu goc', interface: 'input-code' } },

  { field: 'created_at', type: 'timestamp', public: false,
    meta: { note: 'Ngay tao', interface: 'datetime', readonly: true,
      special: ['date-created'] } },
  { field: 'updated_at', type: 'timestamp', public: false,
    meta: { note: 'Ngay cap nhat', interface: 'datetime', readonly: true,
      special: ['date-updated'] } },
];

// Field public duoc phep doc qua public API.
const publicFields = fields.filter((f) => f.public).map((f) => f.field);

// Filter: chi public ho so da published.
const publicPermissionFilter = { public_status: { _eq: 'published' } };

module.exports = { COLLECTION, fields, publicFields, publicPermissionFilter };
