// Мини-приложение ФК — календарь и участники
const TG = window.Telegram ? window.Telegram.WebApp : null;
const app = document.getElementById('app');
const backBtn = document.getElementById('backBtn');
const tBack = document.getElementById('t_back');

const NAV = [];

// --- Навигация ---
function go(view, params = {}) {
  if (
    NAV.length === 0 ||
    NAV[NAV.length - 1].view !== view ||
    JSON.stringify(NAV[NAV.length - 1].params) !== JSON.stringify(params)
  ) {
    NAV.push({ view, params });
  }
  render();
}

function back() {
  NAV.pop();
  render();
}

backBtn.addEventListener('click', back);

// --- Форматирование даты с названиями месяцев ---
function fmtDateRange(a, b) {
  const monthNames = [
    "января", "февраля", "марта", "апреля",
    "мая", "июня", "июля", "августа",
    "сентября", "октября", "ноября", "декабря"
  ];

  const da = new Date(a);
  const db = new Date(b);

  const sameDay = da.toDateString() === db.toDateString();
  const sameMonth = da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear();

  if (sameDay) return `${da.getDate()} ${monthNames[da.getMonth()]} ${da.getFullYear()}`;
  if (sameMonth) return `${da.getDate()}–${db.getDate()} ${monthNames[db.getMonth()]} ${db.getFullYear()}`;
  if (da.getFullYear() === db.getFullYear())
    return `${da.getDate()} ${monthNames[da.getMonth()]} – ${db.getDate()} ${monthNames[db.getMonth()]} ${db.getFullYear()}`;

  return `${da.getDate()} ${monthNames[da.getMonth()]} ${da.getFullYear()} – ${db.getDate()} ${monthNames[db.getMonth()]} ${db.getFullYear()}`;
}

// --- Классификация турниров ---
function classify(it) {
  const name = (it.name || '').toLowerCase();
  if (name.includes('финал гран-при')) return 'gpf';
  if (name.includes('гран-при')) return 'gp';
  if (name.includes('мир')) return 'worlds';
  if (name.includes('европ')) return 'euros';
  if (name.includes('олимп')) return 'oly';
  return '';
}

// --- Цвета для разных типов турниров ---
function colorForClass(cls) {
  return cls === 'gpf'
    ? '#2563eb'
    : cls === 'gp'
    ? '#0ea5e9'
    : cls === 'worlds'
    ? '#16a34a'
    : cls === 'euros'
    ? '#f59e0b'
    : cls === 'oly'
    ? '#ef4444'
    : '#821130';
}

// --- Преобразование названия страны в класс флага ---
function normalizeCountry(name) {
  if (!name) return '';
  const map = {
    'япония': 'japan', 'франция': 'france', 'канада': 'canada', 'сша': 'usa',
    'италия': 'italy', 'финляндия': 'finland', 'китай': 'china', 'германия': 'germany',
    'великобритания': 'uk', 'россия': 'russia', 'грузия': 'georgia',
    'польша': 'poland', 'чехия': 'czech', 'южная корея': 'korea', 'армения': 'armenia'
  };
  const key = name.toLowerCase().trim();
  return map[key] || key.replace(/\s+/g, '-');
}

// --- Формирование меток с датой и местом ---
function chips(it) {
  const cls = classify(it);
  const base = colorForClass(cls);
  const light = base + 'cc';
  const place = [it.city, it.country].filter(Boolean).join(', ');
  return `
    <div class="subtags" style="margin-top:8px;">
      <span class="subtag" style="background:${light}">📅 ${fmtDateRange(it.start, it.end)}</span>
      ${place ? `<span class="subtag" style="background:${light}">📍 ${place}</span>` : ''}
    </div>
  `;
}

// --- Список стартов ---
function listView(items, kind) {
  const sorted = items.slice().sort((a, b) => new Date(a.start) - new Date(b.start));
  return `
    <div class="list">
      ${sorted.map((it, i) => {
        const cls = classify(it);
        const map = { gp: 'is-gp', gpf: 'is-gpf', worlds: 'is-worlds', euros: 'is-euros', oly: 'is-oly' };
        const cssc = map[cls] || '';
        const country = normalizeCountry(it.country || '');
        const flagClass = country ? `flag-${country}` : '';
        const labelMap = {
          gp: 'Гран-при',
          gpf: 'Финал Гран-при',
          worlds: 'Чемпионат мира',
          euros: 'Чемпионат Европы',
          oly: 'Олимпиада',
        };
        const label = labelMap[cls] || '';
        return `
          <a class="event ${cssc} ${flagClass}" data-kind="${kind}" data-idx="${i}">
            <div><strong>${it.name}</strong> ${
              label
                ? `<span class="subtag" style="background:${colorForClass(cls)}33;color:#000;border:1px solid ${colorForClass(cls)}55">${label}</span>`
                : ''
            }</div>
            <div class="emeta">${fmtDateRange(it.start, it.end)}</div>
            ${chips(it)}
          </a>
        `;
      }).join('')}
    </div>
  `;
}

// --- Главная ---
function view_menu() {
  backBtn.style.display = 'none';
  return `
    <div class="grid view">
      <div class="card">
        <div class="title">Календарь соревнований</div>
        <p class="muted" style="margin-bottom:18px;">Выбери раздел и смотри даты, ссылки и составы.</p>
        <button class="btn primary" id="btnCalendar">Открыть</button>
      </div>
      <div class="card">
        <div class="title">Правила</div>
        <p class="muted" style="margin-bottom:18px;">Скоро тут будут правила и полезные материалы.</p>
        <button class="btn" id="btnRules" disabled>Скоро</button>
      </div>
    </div>
  `;
}

// --- Выбор календаря ---
function view_calendar_select() {
  backBtn.style.display = 'inline-flex';
  return `
    <div class="card view">
      <div class="title">Календарь — выбери раздел</div>
      <div class="grid" style="margin-top:18px;gap:28px;">
        <div class="card russian">
          <div class="title">Российские старты</div>
          <p class="muted" style="margin-bottom:18px;">Календарь ФФККР и всероссийские турниры</p>
          <button class="btn primary" id="btnRus">Открыть</button>
        </div>
        <div class="card international">
          <div class="title">Зарубежные старты</div>
          <p class="muted" style="margin-bottom:18px;">ISU: Гран-при, ЧМ, ЧЕ, Олимпиада и др.</p>
          <button class="btn primary" id="btnIntl">Открыть</button>
        </div>
      </div>
    </div>
  `;
}

// --- Колонки участников ---
function columnList(title, arr) {
  if (!arr || arr.length === 0) return '';
  return `
    <div class="card" style="min-width:220px">
      <div class="title category">${title}</div>
      <ul style="margin:8px 0 0 16px; padding:0">
        ${arr.map((n) => `<li style="margin:6px 0">${n}</li>`).join('')}
      </ul>
    </div>
  `;
}

// --- Детали события ---
function view_event_details(kind, idx) {
  backBtn.style.display = 'inline-flex';
  let items = [];
  if (DATA.international || DATA.russian) {
    items = kind === 'international' ? DATA.international : DATA.russian;
  } else if (Array.isArray(DATA)) items = DATA;
  const it = items[idx];
  if (!it) return `<div class="card view"><div class="title">Ошибка данных</div></div>`;
  const cls = classify(it);
  const topBorder = colorForClass(cls);
  const p = it.participants || { men: [], women: [], pairs: [], dance: [] };
  return `
    <div class="card view" style="border-top:4px solid ${topBorder};">
      <div class="title" style="margin-bottom:18px;">${it.name}</div>
      ${chips(it)}
      <div style="margin-top:18px;">
        ${it.url ? `<a class="btn" href="${it.url}" target="_blank">🌐 Официальная страница</a>` : ''}
        ${it.entries ? `<a class="btn" href="${it.entries}" target="_blank">📝 Заявки</a>` : ''}
      </div>
      <div class="grid" style="margin-top:18px;gap:18px;">
        ${columnList('Мужчины', p.men)}
        ${columnList('Женщины', p.women)}
        ${columnList('Пары', p.pairs)}
        ${columnList('Танцы на льду', p.dance)}
      </div>
    </div>
  `;
}

// --- Отрисовка ---
function render() {
  const top = NAV[NAV.length - 1];
  const view = top ? top.view : 'menu';
  let html = '';

  if (view === 'menu') html = view_menu();
  if (view === 'calendar_select') html = view_calendar_select();
  if (view === 'calendar_list') {
    const kind = top.params.kind;
    let items = [];
    if (DATA.international || DATA.russian) {
      items = kind === 'international' ? DATA.international : DATA.russian;
    } else if (Array.isArray(DATA)) items = DATA;
    html = `
      <div class="card view" style="padding-bottom:24px;">
        <div class="title" style="margin-bottom:18px;">
          ${kind === 'international' ? 'Зарубежные старты' : 'Российские старты'}
        </div>
        <div style="margin-top:18px;">
          ${listView(items, kind)}
        </div>
      </div>
    `;
  }
  if (view === 'event_details') html = view_event_details(top.params.kind, top.params.idx);
  app.innerHTML = html;

  if (view === 'menu') {
    document.getElementById('btnCalendar')?.addEventListener('click', () => go('calendar_select'));
  }
  if (view === 'calendar_select') {
    document.getElementById('btnIntl')?.addEventListener('click', () => go('calendar_list', { kind: 'international' }));
    document.getElementById('btnRus')?.addEventListener('click', () => go('calendar_list', { kind: 'russian' }));
  }
  if (view === 'calendar_list') {
    document.querySelectorAll('.event').forEach((el) => {
      el.addEventListener('click', () => {
        const kind = el.getAttribute('data-kind');
        const idx = Number(el.getAttribute('data-idx'));
        go('event_details', { kind, idx });
      });
    });
  }

  backBtn.style.display = NAV.length > 1 ? 'inline-flex' : 'none';
  tBack.textContent = 'Назад';
}

// --- Загрузка данных ---
async function load() {
  try {
    const res = await fetch('calendar.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    window.DATA = data;
  } catch (e) {
    console.error('Ошибка загрузки calendar.json', e);
    window.DATA = { season: '2025–2026', international: [], russian: [] };
  }
}

// --- Запуск ---
(async () => {
  await load();
  go('menu');
  render();
})();
