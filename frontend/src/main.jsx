import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || '';
const PAGE_SIZE = 24;
const INITIAL_FILTERS = {
  query: '',
  hometownQuery: '',
  deathPlaceQuery: '',
  province: '',
  unit: '',
  birthYear: '',
  deathYear: '',
};
const ADVANCED_FILTER_KEYS = ['hometownQuery', 'deathPlaceQuery', 'province', 'unit', 'birthYear', 'deathYear'];
const FILTER_LABELS = {
  hometownQuery: 'Quê quán',
  deathPlaceQuery: 'Nơi hy sinh',
  province: 'Tỉnh',
  unit: 'Đơn vị',
  birthYear: 'Năm sinh',
  deathYear: 'Hy sinh',
};

const publicFields = [
  'id',
  'slug',
  'full_name',
  'birth_year',
  'birth_year_raw',
  'hometown_raw',
  'province',
  'district',
  'commune',
  'enlistment_date_raw',
  'unit',
  'death_date_raw',
  'death_year',
  'initial_burial_place',
  'initial_collection_place',
  'current_burial_place',
  'portrait_url',
  'relative_name',
  'relative_address',
  'relative_phone',
  'notes_public',
];

function stripMarks(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function printable(value) {
  if (value === null || value === undefined || value === '') return 'Chưa rõ';
  return String(value);
}

function compact(value) {
  return value ? String(value).trim() : '';
}

function normalizeUnitForDisplay(value) {
  const raw = compact(value);
  if (!raw) return '';
  const cleaned = raw
    .toUpperCase()
    .replace(/TRUNG\s*ĐOÀN\s*33|TRUNG\s*DOAN\s*33/g, ' ')
    .replace(/[,;./\\_-]+/g, ' ')
    .replace(/\bE\s*33\b/g, ' ')
    .replace(/E33\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned === 'E33' ? '' : cleaned;
}

function unitKey(value) {
  return normalizeUnitForDisplay(value).replace(/\s+/g, '');
}

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [name, slug] = hash.split('/');
  if (name === 'liet-si' && slug) return { page: 'detail', slug: decodeURIComponent(slug) };
  if (name === 'lien-lac') return { page: 'contact' };
  return { page: 'list' };
}

function parseSpecificDeathDate(value) {
  const raw = compact(value);
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function daysBetween(a, b) {
  return Math.abs(a.getTime() - b.getTime()) / 86400000;
}

function sameHometown(a, b) {
  if (compact(a.hometown_raw) && compact(b.hometown_raw)) {
    return stripMarks(a.hometown_raw) === stripMarks(b.hometown_raw);
  }
  if (compact(a.commune) && compact(a.district) && compact(a.province)) {
    return a.commune === b.commune && a.district === b.district && a.province === b.province;
  }
  if (compact(a.district) && compact(a.province)) {
    return a.district === b.district && a.province === b.province;
  }
  return compact(a.province) && a.province === b.province;
}

function shortPlace(record) {
  return [record.district, record.province].filter(Boolean).join(', ') || printable(record.hometown_raw);
}

function isMissing(value) {
  return !compact(value) || compact(value) === 'Chưa rõ';
}

function uniqueOptions(records, field, limit = 500) {
  const values = new Set();
  records.forEach((record) => {
    const value = compact(record[field]);
    if (value) values.add(value);
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b, 'vi')).slice(0, limit);
}

function buildSearchText(record) {
  return stripMarks([
    record.full_name,
    record.hometown_raw,
    record.province,
    record.district,
    record.commune,
    record.unit,
    normalizeUnitForDisplay(record.unit),
    record.death_date_raw,
    record.death_year,
    record.initial_burial_place,
    record.initial_collection_place,
    record.current_burial_place,
    record.relative_name,
    record.notes_public,
  ].filter(Boolean).join(' '));
}

async function loadRecords() {
  if (DIRECTUS_URL) {
    try {
      const fields = publicFields.join(',');
      const response = await fetch(`${DIRECTUS_URL.replace(/\/$/, '')}/items/martyrs?limit=-1&fields=${fields}`);
      if (response.ok) {
        const payload = await response.json();
        return { records: payload.data || [], source: 'directus' };
      }
    } catch {
      // Fallback to local data below.
    }
  }

  const local = await fetch('/data/martyrs.json');
  const payload = await local.json();
  const records = Array.isArray(payload) ? payload : payload.records || payload.martyrs || [];
  return { records, source: 'local' };
}

function useMartyrs() {
  const [state, setState] = useState({ status: 'loading', records: [], source: 'local', error: '' });

  useEffect(() => {
    let mounted = true;
    loadRecords()
      .then(({ records, source }) => {
        if (!mounted) return;
        const visible = records
          .filter((record) => !record.public_status || record.public_status === 'published')
          .map((record) => ({
            ...record,
            _unitDisplay: normalizeUnitForDisplay(record.unit),
            _unitKey: unitKey(record.unit),
            _searchText: buildSearchText(record),
          }));
        setState({ status: 'ready', records: visible, source, error: '' });
      })
      .catch((error) => {
        if (mounted) setState({ status: 'error', records: [], source: 'local', error: error.message });
      });
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

function applyFilters(records, filters) {
  const query = stripMarks(filters.query);
  const hometownQuery = stripMarks(filters.hometownQuery);
  const deathPlaceQuery = stripMarks(filters.deathPlaceQuery);
  return records.filter((record) => {
    if (query && !record._searchText.includes(query)) return false;
    if (hometownQuery && !stripMarks(record.hometown_raw).includes(hometownQuery)) return false;
    if (deathPlaceQuery && !stripMarks(record.initial_burial_place).includes(deathPlaceQuery)) return false;
    if (filters.province && record.province !== filters.province) return false;
    if (filters.unit && record._unitDisplay !== filters.unit) return false;
    if (filters.birthYear && String(record.birth_year || '') !== filters.birthYear) return false;
    if (filters.deathYear && String(record.death_year || '') !== filters.deathYear) return false;
    return true;
  });
}

function countAdvancedFilters(filters) {
  return ADVANCED_FILTER_KEYS.filter((key) => compact(filters[key])).length;
}

function activeFilterChips(filters) {
  return ADVANCED_FILTER_KEYS
    .filter((key) => compact(filters[key]))
    .map((key) => ({ key, label: FILTER_LABELS[key], value: filters[key] }));
}

function getSortValue(record, key) {
  if (key === 'name') return stripMarks(record.full_name);
  if (key === 'birthYear') return Number(record.birth_year) || Number(record.birth_year_raw) || 0;
  if (key === 'deathDate') return Number(record.death_year) || Number(String(record.death_date_raw || '').match(/\d{4}/)?.[0]) || 0;
  return '';
}

function sortRecords(records, sort) {
  if (!sort.key) return records;
  const direction = sort.direction === 'asc' ? 1 : -1;
  return [...records].sort((a, b) => {
    const aValue = getSortValue(a, sort.key);
    const bValue = getSortValue(b, sort.key);
    if (typeof aValue === 'number' && typeof bValue === 'number') return (aValue - bValue) * direction;
    return String(aValue).localeCompare(String(bValue), 'vi') * direction;
  });
}

function calcStats(records) {
  const withCurrentBurial = records.filter((record) => compact(record.current_burial_place)).length;
  const withInitialPlace = records.filter((record) => compact(record.initial_burial_place)).length;
  const provinces = uniqueOptions(records, 'province').length;
  const years = records
    .map((record) => Number(record.death_year))
    .filter(Boolean)
    .sort((a, b) => a - b);
  return {
    total: records.length,
    withCurrentBurial,
    withInitialPlace,
    provinces,
    firstYear: years[0],
    lastYear: years[years.length - 1],
  };
}

function useRoute() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

function App() {
  const { status, records, error } = useMartyrs();
  const route = useRoute();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sort, setSort] = useState({ key: '', direction: 'asc' });
  const [page, setPage] = useState(1);

  const selected = useMemo(
    () => records.find((record) => record.slug === route.slug) || null,
    [records, route.slug]
  );

  const options = useMemo(() => ({
    provinces: uniqueOptions(records, 'province'),
    units: uniqueOptions(records, '_unitDisplay'),
    birthYears: uniqueOptions(records, 'birth_year', 120).filter(Boolean).sort((a, b) => Number(a) - Number(b)),
    years: uniqueOptions(records, 'death_year', 100).filter(Boolean).sort((a, b) => Number(a) - Number(b)),
  }), [records]);

  const filtered = useMemo(() => applyFilters(records, filters), [records, filters]);
  const sortedRecords = useMemo(() => sortRecords(filtered, sort), [filtered, sort]);
  const draftCount = useMemo(() => applyFilters(records, draftFilters).length, [records, draftFilters]);
  const advancedCount = countAdvancedFilters(filters);
  const filterChips = activeFilterChips(filters);
  const stats = useMemo(() => calcStats(records), [records]);
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / PAGE_SIZE));
  const pageRecords = sortedRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (!filterSheetOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [filterSheetOpen]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const updateDraftFilter = (key, value) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters(INITIAL_FILTERS);
  const openFilterSheet = () => {
    setDraftFilters(filters);
    setFilterSheetOpen(true);
  };
  const applyDraftFilters = () => {
    setFilters(draftFilters);
    setFilterSheetOpen(false);
  };
  const clearDraftAdvancedFilters = () => {
    setDraftFilters((current) => ({
      ...current,
      hometownQuery: '',
      deathPlaceQuery: '',
      province: '',
      unit: '',
      birthYear: '',
      deathYear: '',
    }));
  };
  const removeFilterChip = (key) => {
    setFilters((current) => ({ ...current, [key]: '' }));
  };
  const toggleSort = (key) => {
    setSort((current) => (
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    ));
  };
  const openDetail = (record) => {
    window.location.hash = `/liet-si/${encodeURIComponent(record.slug)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (route.page === 'contact') {
    return (
      <SiteShell records={records} stats={stats}>
        <ContactPage />
      </SiteShell>
    );
  }

  if (route.page === 'detail') {
    return (
      <SiteShell records={records} stats={stats}>
        {status === 'loading' && <div className="workspace"><div className="notice">Đang tải dữ liệu...</div></div>}
        {status === 'ready' && selected && <DetailPage record={selected} records={records} />}
        {status === 'ready' && !selected && (
          <section className="workspace">
            <div className="notice">Không tìm thấy hồ sơ. <a href="#records">Quay lại danh sách</a></div>
          </section>
        )}
      </SiteShell>
    );
  }

  return (
    <SiteShell records={records} stats={stats}>
      <section className="workspace" id="records">
        <section className="content">
          {status === 'loading' && <div className="notice">Đang tải dữ liệu...</div>}
          {status === 'error' && <div className="notice error">Không tải được dữ liệu: {error}</div>}
          {status === 'ready' && filtered.length === 0 && (
            <div className="notice">
              Không tìm thấy hồ sơ phù hợp. Hãy thử nhập ít từ hơn hoặc bỏ bớt bộ lọc.
            </div>
          )}

          <div className="mobileFilterBar" aria-label="Tìm kiếm và lọc nhanh">
            <label className="mobileSearchField">
              <span>Tìm kiếm</span>
              <input
                id="search"
                value={filters.query}
                onChange={(event) => updateFilter('query', event.target.value)}
                placeholder="Nhập tên, quê quán, đơn vị..."
                autoComplete="off"
              />
            </label>
            <button className="mobileFilterBtn" type="button" onClick={openFilterSheet}>
              <span aria-hidden="true">≡</span>
              Bộ lọc{advancedCount > 0 ? ` (${advancedCount})` : ''}
            </button>
            {filterChips.length > 0 && (
              <div className="filterChips" aria-label="Bộ lọc đang chọn">
                {filterChips.map((chip) => (
                  <button
                    className="filterChip"
                    type="button"
                    key={chip.key}
                    onClick={() => removeFilterChip(chip.key)}
                    aria-label={`Xóa bộ lọc ${chip.label}: ${chip.value}`}
                  >
                    <span>{chip.label}: {chip.value}</span>
                    <b aria-hidden="true">×</b>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filterPanel desktopFilterPanel" aria-label="Bộ lọc tra cứu">
            <h3>Thông tin liệt sĩ</h3>
            <div className="filterGrid">
              <label className="searchField compactSelect nameField">
                <span>Từ khóa</span>
                <input
                  value={filters.query}
                  onChange={(event) => updateFilter('query', event.target.value)}
                  placeholder="Nhập tên, quê quán, đơn vị..."
                  autoComplete="off"
                />
              </label>
              <Select label="Năm sinh" value={filters.birthYear} options={options.birthYears} onChange={(value) => updateFilter('birthYear', value)} compact />
              <label className="searchField compactSelect hometownField">
                <span>Quê quán</span>
                <input
                  value={filters.hometownQuery}
                  onChange={(event) => updateFilter('hometownQuery', event.target.value)}
                  placeholder="Nhập quê quán..."
                  autoComplete="off"
                />
              </label>
              <Select label="Tỉnh quê quán" value={filters.province} options={options.provinces} onChange={(value) => updateFilter('province', value)} compact />
              <Select label="Năm hy sinh" value={filters.deathYear} options={options.years} onChange={(value) => updateFilter('deathYear', value)} compact />
              <label className="searchField compactSelect deathPlaceField">
                <span>Nơi hy sinh</span>
                <input
                  value={filters.deathPlaceQuery}
                  onChange={(event) => updateFilter('deathPlaceQuery', event.target.value)}
                  placeholder="Nhập nơi hy sinh..."
                  autoComplete="off"
                />
              </label>
              <Select label="Đơn vị" value={filters.unit} options={options.units} onChange={(value) => updateFilter('unit', value)} compact />
              <div className="filterActions">
                <button className="plainBtn toolbarSearch" type="button">Tìm kiếm</button>
                <button className="filterResetBtn" type="button" onClick={resetFilters}>Đặt lại</button>
              </div>
            </div>
          </div>

          {filterSheetOpen && (
            <div className="filterSheetLayer open">
              <button className="sheetScrim" type="button" aria-label="Đóng bộ lọc" onClick={() => setFilterSheetOpen(false)} />
              <section className="filterSheet" role="dialog" aria-modal="true" aria-labelledby="filterSheetTitle">
                <div className="sheetHandle" aria-hidden="true" />
                <header className="sheetHeader">
                  <h3 id="filterSheetTitle">Bộ lọc nâng cao</h3>
                  <button className="sheetClose" type="button" onClick={() => setFilterSheetOpen(false)} aria-label="Đóng bộ lọc">×</button>
                </header>

                <div className="sheetBody">
                  <section className="sheetGroup">
                    <h4>Tiêu chí phổ biến</h4>
                    <Select label="Tỉnh quê quán" value={draftFilters.province} options={options.provinces} onChange={(value) => updateDraftFilter('province', value)} compact />
                    <Select label="Năm hy sinh" value={draftFilters.deathYear} options={options.years} onChange={(value) => updateDraftFilter('deathYear', value)} compact />
                  </section>

                  <section className="sheetGroup">
                    <h4>Tiêu chí chi tiết</h4>
                    <Select label="Năm sinh" value={draftFilters.birthYear} options={options.birthYears} onChange={(value) => updateDraftFilter('birthYear', value)} compact />
                    <label className="searchField compactSelect">
                      <span>Nơi hy sinh</span>
                      <input
                        value={draftFilters.deathPlaceQuery}
                        onChange={(event) => updateDraftFilter('deathPlaceQuery', event.target.value)}
                        placeholder="Nhập nơi hy sinh..."
                        autoComplete="off"
                      />
                    </label>
                    <SearchableFilterInput
                      label="Đơn vị"
                      value={draftFilters.unit}
                      options={options.units}
                      onChange={(value) => updateDraftFilter('unit', value)}
                    />
                  </section>
                </div>

                <footer className="sheetActions">
                  <button className="sheetReset" type="button" onClick={clearDraftAdvancedFilters}>Xóa lọc</button>
                  <button className="sheetApply" type="button" onClick={applyDraftFilters}>
                    Áp dụng ({draftCount.toLocaleString('vi-VN')})
                  </button>
                </footer>
              </section>
            </div>
          )}

          <div className="tableStatus">
            Tìm thấy <strong>{filtered.length.toLocaleString('vi-VN')}</strong> hồ sơ liệt sĩ Trung đoàn 33
          </div>

          <div className="tablePanel">
            <div className="tableWrap">
              <table className="recordsTable">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>
                      <button className="sortHeaderBtn" type="button" onClick={() => toggleSort('name')}>
                        Họ và tên <span>{sort.key === 'name' ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                      </button>
                    </th>
                    <th>
                      <button className="sortHeaderBtn" type="button" onClick={() => toggleSort('birthYear')}>
                        Năm sinh <span>{sort.key === 'birthYear' ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                      </button>
                    </th>
                    <th>Quê quán</th>
                    <th>
                      <button className="sortHeaderBtn" type="button" onClick={() => toggleSort('deathDate')}>
                        Ngày hy sinh <span>{sort.key === 'deathDate' ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                      </button>
                    </th>
                    <th>Nơi hy sinh</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRecords.map((record, index) => (
                    <RecordRow
                      key={record.slug || record.id}
                      index={(page - 1) * PAGE_SIZE + index + 1}
                      record={record}
                      onOpen={() => openDetail(record)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="bottomPager">
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          )}
        </section>
      </section>
    </SiteShell>
  );
}

function SiteShell({ children, stats }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const route = useRoute();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const isMobile = window.matchMedia('(max-width: 680px)').matches;
      setHeaderHidden(isMobile && currentY > 96 && currentY > lastY + 8);
      lastY = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const navItems = [
    { href: '#records', label: 'Tra cứu', active: route.page === 'list' || route.page === 'detail' },
    { href: '#data', label: 'Dữ liệu', active: false },
    { href: '#about', label: 'Giới thiệu', active: false },
    { href: '#/lien-lac', label: 'Liên lạc', active: route.page === 'contact' },
  ];

  return (
    <main>
      <header className={headerHidden ? 'topbar topbarHidden' : 'topbar'}>
        <a className="brand" href="#records">
          <div className="brandMark">E33</div>
          <div>
            <p className="eyebrow">Trung đoàn 33</p>
            <h1>Danh sách liệt sĩ</h1>
            <span className="brandSlogan">TƯỞNG NHỚ - TRI ÂN - LƯU DẤU</span>
          </div>
        </a>
        <nav className="mainNav" aria-label="Điều hướng chính">
          <a className={route.page === 'list' || route.page === 'detail' ? 'active' : ''} href="#records">Tra cứu</a>
          <a href="#data">Dữ liệu</a>
          <a href="#about">Giới thiệu</a>
          <a className={route.page === 'contact' ? 'active' : ''} href="#/lien-lac">Liên lạc</a>
        </nav>
        <div className="summaryText">{stats.total.toLocaleString('vi-VN')} hồ sơ</div>
        <button className="menuToggle" type="button" onClick={() => setMenuOpen(true)} aria-label="Mở menu">☰</button>
      </header>

      {menuOpen && (
        <div className="mobileMenuLayer">
          <button className="mobileMenuScrim" type="button" aria-label="Đóng menu" onClick={closeMenu} />
          <aside className="mobileMenuDrawer" role="dialog" aria-modal="true" aria-labelledby="mobileMenuTitle">
            <header className="mobileMenuHead">
              <div className="mobileMenuBrand">
                <div className="mobileMenuLogo">E33</div>
                <div>
                  <h2 id="mobileMenuTitle">TRUNG ĐOÀN 33</h2>
                  <p>Cổng thông tin Tra cứu Liệt sĩ</p>
                </div>
              </div>
              <button className="mobileMenuClose" type="button" onClick={closeMenu} aria-label="Đóng menu">×</button>
            </header>
            <nav className="mobileMenuNav" aria-label="Menu di động">
              {navItems.map((item, index) => (
                <a className={item.active ? 'active' : ''} href={item.href} onClick={closeMenu} key={item.href}>
                  <span className="menuLabel">{item.label}</span>
                  <span className="menuNumber">{String(index + 1).padStart(2, '0')}</span>
                </a>
              ))}
            </nav>
            <footer className="mobileMenuMeta">
              <span>Hồ sơ</span>
              <strong>{stats.total.toLocaleString('vi-VN')}</strong>
              <span>Tưởng nhớ - Tri ân - Lưu dấu</span>
            </footer>
          </aside>
        </div>
      )}

      {children}
    </main>
  );
}

function Select({ label, value, options, onChange, compact: isCompact }) {
  return (
    <label className={isCompact ? 'selectField compactSelect' : 'selectField'}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Tất cả</option>
        {options.map((option) => {
          const item = typeof option === 'string' || typeof option === 'number'
            ? { label: option, value: option }
            : option;
          return <option key={item.value} value={item.value}>{item.label}</option>;
        })}
      </select>
    </label>
  );
}

function SearchableFilterInput({ label, value, options, onChange }) {
  return (
    <label className="searchField compactSelect">
      <span>{label}</span>
      <input
        list="unit-filter-options"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Nhập hoặc chọn đơn vị..."
        autoComplete="off"
      />
      <datalist id="unit-filter-options">
        {options.map((option) => (
          <option value={option} key={option} />
        ))}
      </datalist>
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="pager" aria-label="Phân trang">
      <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Trang trước">‹</button>
      <span>{page} / {totalPages}</span>
      <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} aria-label="Trang sau">›</button>
    </div>
  );
}

function RecordRow({ index, record, onOpen }) {
  const deathPlace = printable(record.initial_burial_place);
  const deathPlaceMissing = isMissing(record.initial_burial_place);
  return (
    <tr>
      <td className="stt" data-label="STT">{index}</td>
      <td data-label="Họ tên">
        <button className="nameBtn" onClick={onOpen}>{record.full_name}</button>
      </td>
      <td data-label="Năm sinh">{printable(record.birth_year_raw || record.birth_year)}</td>
      <td data-label="Quê quán">{printable(record.hometown_raw)}</td>
      <td data-label="Ngày hy sinh">{printable(record.death_date_raw || record.death_year)}</td>
      <td className={deathPlaceMissing ? 'mutedCell' : ''} data-label="Nơi hy sinh">{deathPlace}</td>
    </tr>
  );
}

function DetailPage({ record, records }) {
  const related = useMemo(() => {
    const others = records.filter((item) => item.slug !== record.slug);
    const sameHome = others.filter((item) => sameHometown(record, item)).slice(0, 8);
    const sameUnit = compact(record._unitKey)
      ? others.filter((item) => item._unitKey === record._unitKey).slice(0, 8)
      : [];
    const deathDate = parseSpecificDeathDate(record.death_date_raw);
    const sameTime = deathDate
      ? others
        .map((item) => ({ item, date: parseSpecificDeathDate(item.death_date_raw) }))
        .filter(({ date }) => date && daysBetween(deathDate, date) <= 7)
        .sort((a, b) => daysBetween(deathDate, a.date) - daysBetween(deathDate, b.date))
        .map(({ item }) => item)
        .slice(0, 8)
      : [];
    return { sameHome, sameUnit, sameTime };
  }, [record, records]);

  const unitLabel = printable(record._unitDisplay);

  return (
    <>
      <section className="detailPage">
        <div className="detailMain">
          <a className="backLink" href="#records">← Quay lại danh sách</a>
          <section className={compact(record.portrait_url) ? 'soldierHeader hasPortrait' : 'soldierHeader'}>
            <div className="watermarkStar" aria-hidden="true" />
            <div className="soldierHeroText">
              <p className="eyebrow">Hồ sơ liệt sĩ</p>
              <h2>{record.full_name}</h2>
              <div className="detailSummary">
                <span><b>◷</b> Năm sinh: {printable(record.birth_year_raw || record.birth_year)}</span>
                <span><b>★</b> Hi sinh: {printable(record.death_date_raw || record.death_year)}</span>
                <span><b>▣</b> Đơn vị: {unitLabel}</span>
              </div>
            </div>
            {compact(record.portrait_url) && (
              <div className="portraitSlot" aria-label="Ảnh chân dung liệt sĩ">
                <img src={record.portrait_url} alt={`Ảnh chân dung ${record.full_name}`} />
              </div>
            )}
          </section>

          <section className="detailPanel mergedInfo">
            <div className="sectionTitle">THÔNG TIN LIỆT SĨ</div>
            <div className="detailGrid">
              <Info label="HỌ VÀ TÊN" value={record.full_name} />
              <Info label="NĂM SINH" value={record.birth_year_raw || record.birth_year} />
              <Info label="QUÊ QUÁN" value={record.hometown_raw} />
              <Info label="NHẬP NGŨ" value={record.enlistment_date_raw} />
              <Info label="ĐƠN VỊ" value={record._unitDisplay} />
              <Info label="NGÀY HI SINH" value={record.death_date_raw || record.death_year} />
              <Info label="NƠI HI SINH" value={record.initial_burial_place} />
              <Info label="NƠI QUY TẬP BAN ĐẦU" value={record.initial_collection_place} />
              <Info label="NƠI AN TÁNG HIỆN NAY" value={record.current_burial_place} />
              <Info label="GHI CHÚ" value={record.notes_public} />
            </div>

            <div className="sectionTitle familyTitle">THÔNG TIN THÂN NHÂN HIỆN TẠI</div>
            <div className="detailGrid">
              <Info label="TÊN THÂN NHÂN" value={record.relative_name} />
              <Info label="SỐ ĐIỆN THOẠI" value={record.relative_phone} />
              <Info label="ĐIẠ CHỈ" value={record.relative_address} />
            </div>
          </section>
        </div>

        <aside className="detailSidebar">
          <div className="relatedGroupTitle">LIỆT SĨ LIÊN QUAN</div>
          <RelatedSection title="Liệt sĩ cùng quê" records={related.sameHome} />
          <RelatedSection title={`Liệt sĩ cùng đơn vị (${unitLabel})`} records={related.sameUnit} />
          <RelatedSection title="Hi sinh trong khoảng 1 tuần" records={related.sameTime} />
        </aside>
      </section>
    </>
  );
}

function RelatedSection({ title, records }) {
  return (
    <div className="detailPanel relatedPanel">
      <div className="sectionTitle">{title}</div>
      {records.length === 0 ? (
        <div className="emptyRelated">Chưa có hồ sơ phù hợp.</div>
      ) : (
        <div className="relatedList">
          {records.map((record) => (
            <a key={record.slug} href={`#/liet-si/${encodeURIComponent(record.slug)}`} className="relatedItem">
              <span className="profileIcon" aria-hidden="true">◖</span>
              <span>
                <strong>{record.full_name}</strong>
                <small>Năm sinh: {printable(record.birth_year_raw || record.birth_year)}</small>
                <small>Đơn vị: {printable(record._unitDisplay)}</small>
                <em>{shortPlace(record)}</em>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value, wide }) {
  const missing = isMissing(value);
  return (
    <div className={wide ? 'info wide' : 'info'}>
      <span>{label}</span>
      <strong className={missing ? 'missingValue' : ''}>{printable(value)}</strong>
    </div>
  );
}

const CONTACT_GROUPS = [
  {
    id: 'ban-lien-lac',
    title: 'Ban Liên lạc Trung đoàn 33',
    note: 'Quân khu 7 - Quân đội Nhân dân Việt Nam',
    people: [
      { name: 'Bác Văn Ba', role: 'Ba Lộc, E phó E33', phone: '0916765532' },
      { name: 'Bác Ninh', role: 'D8 - E33', phone: '0907443320' },
      { name: 'Bác Giáp', role: 'D7 - E33', phone: '0917519258' },
      { name: 'Bác Kỳ', role: 'D7 - E33', phone: '0918657937' },
      { name: 'Bác Thuấn', role: 'D9 - E33', phone: '0909262020' },
      { name: 'Bác Phiêu', role: 'C19 - D9 - E33', phone: '0363925597' },
      { name: 'Bác Vinh', role: 'E33', phone: '0915583380' },
      { name: 'Bác Bính', role: 'C23 - E33', phone: '0365977682' },
      { name: 'Bác Chất', role: 'E33', phone: '0358659737' },
      { name: 'Bác Gia', role: 'E33', phone: '0904398167' },
      { name: 'Bác Phụng', role: 'K76 - E33', phone: '0365612795' },
      { name: 'Bác Vinh', role: 'E33', phone: '0912411303' },
    ],
  },
  {
    id: 'nguon-tin',
    title: 'Đầu mối nắm thông tin liệt sĩ',
    note: 'Quản trang, chính quyền địa phương và các nguồn hỗ trợ',
    people: [
      { name: 'Chương trình Trở về từ ký ức', role: 'Đầu mối truyền hình', phone: '0862605555' },
      { name: 'Anh Linh', role: 'CSXH Long Khánh', phone: '0917436511' },
      { name: 'Bác Chính', role: 'Quản trang Trảng Bom', phone: '0335064659' },
      { name: 'Xã đội xã Trà Tân', role: 'Gia Huynh', phone: '0966171757' },
      { name: 'Chú Dự', role: 'UB xã Xuân Thành', phone: '0983555045' },
      { name: 'Bác Nguyễn Sỹ Hồ', role: 'Người đưa đò', phone: '0988847715' },
      { name: 'Bác Cam', role: 'Thông tin liệt sĩ đã quy tập', phone: '0988268992' },
      { name: 'Chú Tư', role: 'Quản trang Đức Linh', phone: '0937398211' },
      { name: 'Anh Nhơn', role: 'Quản trang Bình Thuận', phone: '0984367617' },
    ],
  },
];

const CONTACT_NOTICE =
  'Các thông tin chỉ phục vụ hỗ trợ cho thân nhân liệt sĩ tìm kiếm và hiểu về người thân của mình. '
  + 'Nghiêm cấm sử dụng để trục lợi hay quảng cáo sai lệch dưới bất kỳ hình thức nào.';

function formatPhone(phone) {
  return phone.replace(/(\d{4})(\d{3})(\d{3,})/, '$1 $2 $3');
}

function ContactPage() {
  const [accepted, setAccepted] = useState(() => sessionStorage.getItem('contact_accepted') === '1');

  const acceptNotice = () => {
    sessionStorage.setItem('contact_accepted', '1');
    setAccepted(true);
  };

  return (
    <section className="contactPage workspace">
      <header className="contactHead">
        <p className="eyebrow">Thông tin liên lạc</p>
        <h2>Hỗ trợ xác minh thông tin liệt sĩ</h2>
        <p className="contactDesc">
          Danh sách số điện thoại phục vụ xác minh thông tin liệt sĩ E33 và các đơn vị khác hy sinh tại
          Phước Tuy, Bình Tuy, Long Khánh, Phước Long, Biên Hoà (bản đồ 1956–1975). Nay là
          Bà Rịa, Đồng Nai, Bình Thuận, Lâm Đồng, Bình Phước.
        </p>
      </header>

      {accepted && (
        <>
          {CONTACT_GROUPS.map((group) => (
            <section className="contactGroup" key={group.id}>
              <div className="contactGroupHead">
                <h3>{group.title}</h3>
                <span>{group.note}</span>
              </div>
              <ul className="contactList">
                {group.people.map((person) => (
                  <li className="contactRow" key={`${group.id}-${person.phone}-${person.name}`}>
                    <span className="contactAvatar" aria-hidden="true">{group.id === 'nguon-tin' ? '📺' : '🎖️'}</span>
                    <span className="contactWho">
                      <strong>{person.name}</strong>
                      <small>{person.role} <span aria-hidden="true">•</span> {formatPhone(person.phone)}</small>
                    </span>
                    <span className="contactActions">
                      <a className="phoneLink" href={`tel:${person.phone}`} aria-label={`Gọi ${person.name}`}>📞 Gọi</a>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="contactFootNote">{CONTACT_NOTICE}</p>
        </>
      )}

      {!accepted && <ContactNoticeDialog onAccept={acceptNotice} />}
    </section>
  );
}

function ContactNoticeDialog({ onAccept }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="noticeBackdrop">
      <div className="noticeDialog" role="dialog" aria-modal="true" aria-labelledby="noticeTitle">
        <p className="eyebrow">Trước khi xem thông tin</p>
        <h3 id="noticeTitle">Cam kết sử dụng đúng mục đích</h3>
        <p>{CONTACT_NOTICE}</p>
        <div className="noticeActions">
          <a className="plainBtn" href="#records">Quay lại tra cứu</a>
          <button type="button" className="acceptBtn" onClick={onAccept} autoFocus>Tôi đồng ý</button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
