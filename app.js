// --- Мини-приложение "Фигурное катание" ---
// Управление страницами, переходами и отображением данных

const app = document.getElementById("app");
const backBtn = document.getElementById("backBtn");
const tBack = document.getElementById("t_back");
const NAV = [];

function go(view, params = {}) {
  if (NAV.length === 0 || NAV[NAV.length - 1].view !== view)
    NAV.push({ view, params });
  render();
}

function back() {
  NAV.pop();
  render();
}

backBtn.addEventListener("click", back);

function fmtDateRange(a, b) {
  const m = [
    "января","февраля","марта","апреля","мая","июня",
    "июля","августа","сентября","октября","ноября","декабря"
  ];
  const da = new Date(a), db = new Date(b);
  const sameDay = da.toDateString() === db.toDateString();
  if (sameDay) return `${da.getDate()} ${m[da.getMonth()]} ${da.getFullYear()}`;
  if (da.getMonth() === db.getMonth())
    return `${da.getDate()}–${db.getDate()} ${m[db.getMonth()]} ${db.getFullYear()}`;
  if (da.getFullYear() === db.getFullYear())
    return `${da.getDate()} ${m[da.getMonth()]} – ${db.getDate()} ${m[db.getMonth()]} ${db.getFullYear()}`;
  return `${da.getDate()} ${m[da.getMonth()]} ${da.getFullYear()} – ${db.getDate()} ${m[db.getMonth()]} ${db.getFullYear()}`;
}

function classify(it) {
  const n = (it.name || "").toLowerCase();
  if (n.includes("финал гран-при")) return "gpf";
  if (n.includes("гран-при")) return "gp";
  if (n.includes("мир")) return "worlds";
  if (n.includes("европ")) return "euros";
  if (n.includes("олимп")) return "oly";
  return "";
}

function colorForClass(cls) {
  return {
    gpf: "#2563eb", gp: "#0ea5e9", worlds: "#16a34a",
    euros: "#f59e0b", oly: "#ef4444"
  }[cls] || "#821130";
}

function normalizeCountry(n) {
  const map = {
    "япония": "japan", "франция": "france", "канада": "canada", "сша": "usa",
    "италия": "italy", "финляндия": "finland", "китай": "china",
    "германия": "germany", "великобритания": "uk", "грузия": "georgia", "россия": "russia"
  };
  return map[n?.toLowerCase()?.trim()] || "";
}

function flagEmoji(code) {
  const map = {
    japan: "🇯🇵", france: "🇫🇷", canada: "🇨🇦", usa: "🇺🇸",
    italy: "🇮🇹", finland: "🇫🇮", china: "🇨🇳", germany: "🇩🇪",
    uk: "🇬🇧", georgia: "🇬🇪"
  };
  return map[code] || "";
}
// --- Страница выбора календаря ---
function view_calendar_select() {
  backBtn.style.display = "inline-flex";
  return `
    <div class="card view fade-in">
      <div class="title">Календарь соревнований</div>
      <div class="grid" style="margin-top:20px;gap:36px;">
        <div class="card clickable" id="btnRus" style="padding:22px 16px;">
          <div class="title">🇷🇺 Российские старты</div>
          <p class="muted">Календарь ФФККР и всероссийские турниры</p>
        </div>
        <div class="card clickable" id="btnIntl" style="padding:22px 16px;">
          <div class="title">🌍 Зарубежные старты</div>
          <p class="muted">ISU: Гран-при, Чемпионаты, Олимпиада</p>
        </div>
      </div>
    </div>
  `;
}

// --- Списки соревнований ---
function chips(it) {
  const place = [it.city, it.country].filter(Boolean).join(", ");
  return `<div class="subtags" style="margin-top:8px;">
    <span class="subtag">📅 ${fmtDateRange(it.start, it.end)}</span>
    ${place ? `<span class="subtag">📍 ${place}</span>` : ""}
  </div>`;
}

function listView(items, kind) {
  return `<div class="list">
    ${items
      .sort((a,b)=>new Date(a.start)-new Date(b.start))
      .map((it,i)=>{
        const flag = normalizeCountry(it.country);
        return `
          <div class="event-card flag-${flag}" data-kind="${kind}" data-idx="${i}">
            <div class="event-title"><strong>${it.name}</strong></div>
            ${chips(it)}
            ${
              (kind==="international"&&flag)||kind==="russian"
                ? `<div class="flag-bg">${kind==="russian"?"🇷🇺":flagEmoji(flag)}</div>`
                : ""
            }
          </div>`;
      }).join("")}
  </div>`;
}

// --- Страница "Мерч" ---
function view_merch() {
  backBtn.style.display = "inline-flex";
  return `
    <div class="card view fade-in" style="padding:32px 20px; text-align:center;">
      <div style="
        background:#fff;
        border-radius:18px;
        padding:40px 20px;
        box-shadow:0 4px 14px rgba(130,17,48,0.1);
        border:1px solid var(--border);
      ">
        <div style="
          font-family:'Unbounded',sans-serif;
          font-weight:700;
          font-size:22px;
          line-height:1.4;
          color:var(--accent,#8A1538);
          margin-bottom:24px;
        ">
          Настольная игра<br>
          <span style="font-weight:800;">ПРО!КАТ&nbsp;ЖИЗНИ</span>
        </div>
        <a href="https://t.me/obsudiim_fk/15054" target="_blank"
          style="
            display:inline-block;
            background:#8A1538;
            color:#fff;
            text-decoration:none;
            font-family:'Unbounded',sans-serif;
            font-weight:700;
            padding:14px 26px;
            border-radius:12px;
            transition:0.3s;
          "
          onmouseover="this.style.background='#a71a44'"
          onmouseout="this.style.background='#8A1538'"
        >
          Перейти к игре
        </a>
      </div>
    </div>
  `;
}

// --- Стили для пульсирующего кружка со свечением ---
const stylePulse = document.createElement("style");
stylePulse.textContent = `
.pulse {
  width:10px;
  height:10px;
  border-radius:50%;
  animation:glow 1.4s ease-in-out infinite;
}

/* Эффект дыхания и свечения */
@keyframes glow {
  0% {
    box-shadow:0 0 0px rgba(138,21,56,0);
    transform:scale(0.9);
    opacity:0.7;
  }
  50% {
    box-shadow:0 0 12px rgba(138,21,56,0.6);
    transform:scale(1.05);
    opacity:1;
  }
  100% {
    box-shadow:0 0 0px rgba(138,21,56,0);
    transform:scale(0.9);
    opacity:0.7;
  }
}

/* Цвета для разных тем */
[data-theme="light"] .pulse { background:#8A1538; }
[data-theme="dark"] .pulse { background:#fff; }

[data-theme="light"] .pulse.upcoming {
  background:#bfbfbf;
  box-shadow:0 0 4px rgba(0,0,0,0.15);
}
[data-theme="dark"] .pulse.upcoming {
  background:#888;
  box-shadow:0 0 4px rgba(255,255,255,0.15);
}

.fade-in{animation:fadeIn .8s ease-in-out;}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
`;
document.head.appendChild(stylePulse);
// --- Отображение деталей соревнования ---
function columnList(title, arr) {
  if (!arr?.length) return "";
  return `<div class="card" style="min-width:220px">
    <div class="title category">${title}</div>
    <ul style="margin:8px 0 0 16px; padding:0;">
      ${arr.map(n => `<li style="margin:6px 0">${n}</li>`).join("")}
    </ul>
  </div>`;
}

function view_event_details(kind, idx) {
  const items = kind === "international" ? DATA.international : DATA.russian;
  const it = items[idx];
  if (!it) return `<div class="card"><div class="title">Ошибка загрузки события</div></div>`;
  const p = it.participants || { men: [], women: [], pairs: [], dance: [] };
  const c = colorForClass(classify(it));
  backBtn.style.display = "inline-flex";
  return `<div class="card view fade-in" style="border-top:4px solid ${c};">
    <div class="title" style="margin-bottom:18px;">${it.name}</div>
    <div style="margin-bottom:8px;">📅 ${fmtDateRange(it.start, it.end)}</div>
    <div class="muted">📍 ${[it.city, it.country].filter(Boolean).join(", ")}</div>
    <div class="grid" style="margin-top:28px;gap:36px;">
      ${columnList("Мужчины", p.men)}
      ${columnList("Женщины", p.women)}
      ${columnList("Пары", p.pairs)}
      ${columnList("Танцы на льду", p.dance)}
    </div>
  </div>`;
}

// --- Приветствие ---
function view_intro() {
  backBtn.style.display = "none";
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
      height:70vh;text-align:center;animation:fadeIn 1s;">
      <img src="./brand.png" style="width:80px;height:auto;margin-bottom:20px;opacity:0.95;">
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:20px;color:var(--accent);">
        Привет! Будем рады тебе помочь<br><span style="font-size:16px;">Команда О!БСУДИМ</span>
      </div>
    </div>
  `;
}

// --- Рендер и навигация ---
function render() {
  const top = NAV.at(-1) || { view: "intro" };
  let html = "";

  if (top.view === "intro") html = view_intro();
  if (top.view === "menu") html = view_menu();
  if (top.view === "calendar_select") html = view_calendar_select();
  if (top.view === "calendar_list") {
    const kind = top.params.kind;
    const items = kind === "international" ? DATA.international : DATA.russian;
    html = `<div class="card view fade-in" style="padding-bottom:24px;">
      <div class="title" style="margin-bottom:18px;">
        ${kind === "international" ? "Зарубежные старты" : "Российские старты"}
      </div>
      <div style="margin-top:18px;">${listView(items, kind)}</div>
    </div>`;
  }
  if (top.view === "event_details") html = view_event_details(top.params.kind, top.params.idx);
  if (top.view === "merch") html = view_merch();

  app.innerHTML = html;

  // --- Обработчики ---
  if (top.view === "menu") {
    document.getElementById("btnCalendar")?.addEventListener("click", () => go("calendar_select"));
    document.getElementById("btnMerch")?.addEventListener("click", () => go("merch"));
    document.querySelectorAll(".card.clickable").forEach(c =>
      c.addEventListener("click", () => {
        const kind = c.dataset.kind;
        const idx = +c.dataset.idx;
        go("event_details", { kind, idx });
      })
    );
  }

  if (top.view === "calendar_select") {
    document.getElementById("btnRus")?.addEventListener("click", () => go("calendar_list", { kind: "russian" }));
    document.getElementById("btnIntl")?.addEventListener("click", () => go("calendar_list", { kind: "international" }));
  }

  if (top.view === "calendar_list")
    document.querySelectorAll(".event-card").forEach(e =>
      e.addEventListener("click", () =>
        go("event_details", { kind: e.dataset.kind, idx: +e.dataset.idx })
      )
    );

  backBtn.style.display = NAV.length > 1 ? "inline-flex" : "none";
  tBack.textContent = "Назад";
}

// --- Загрузка календаря и запуск ---
async function load() {
  try {
    const r = await fetch("calendar.json", { cache: "no-store" });
    window.DATA = await r.json();
  } catch {
    window.DATA = { international: [], russian: [] };
  }
}

(async () => {
  await load();
  if (!DATA.international) DATA.international = [];
  if (!DATA.russian) DATA.russian = [];

  const header = document.querySelector("header.top");
  header.classList.remove("visible");

  go("intro");
  render();

  setTimeout(() => {
    go("menu");
    header.classList.add("visible");
  }, 2000);
})();
