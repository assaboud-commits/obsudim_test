// Мини-приложение ФК — календарь и участники
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
    gpf:"#2563eb",gp:"#0ea5e9",worlds:"#16a34a",euros:"#f59e0b",oly:"#ef4444"
  }[cls] || "#821130";
}

function normalizeCountry(n) {
  const map = {
    "япония":"japan","франция":"france","канада":"canada","сша":"usa",
    "италия":"italy","финляндия":"finland","китай":"china",
    "германия":"germany","великобритания":"uk","грузия":"georgia","россия":"russia"
  };
  return map[n?.toLowerCase()?.trim()] || "";
}

function flagEmoji(code) {
  const map = {
    japan: "🇯🇵",
    france: "🇫🇷",
    canada: "🇨🇦",
    usa: "🇺🇸",
    italy: "🇮🇹",
    finland: "🇫🇮",
    china: "🇨🇳",
    germany: "🇩🇪",
    uk: "🇬🇧",
    georgia: "🇬🇪"
  };
  return map[code] || "";
}

function chips(it) {
  const cls = classify(it), place = [it.city, it.country].filter(Boolean).join(", ");
  return `<div class="subtags" style="margin-top:8px;">
    <span class="subtag">📅 ${fmtDateRange(it.start,it.end)}</span>
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
            ${((kind === "international" && flag) || kind === "russian") ? `<div class="flag-bg">${kind === "russian" ? "🇷🇺" : flagEmoji(flag)}</div>` : ""}
          </div>`;
      }).join("")}
  </div>`;
}

function view_intro() {
  backBtn.style.display = "none";
  return `
    <div class="intro-overlay" style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;text-align:center;height:100svh;height:100dvh;min-height:100vh;padding:env(safe-area-inset-top) 16px env(safe-area-inset-bottom);animation:fadeIn 0.9s ease-in-out;z-index:1000;background:linear-gradient(180deg,var(--bg1) 0%, var(--bg2) 100%);">
      <img src="./brand.png" alt="logo" style="width:65px;height:auto;object-fit:contain;opacity:0.95;"/>
      <div class="card" style="background:#ffffff;border:1px solid var(--border);border-radius:20px;padding:18px 26px;box-shadow:0 4px 16px rgba(130,17,48,0.08);">
        <div style="font-size:22px;font-weight:400;letter-spacing:0.2px;font-family:'Inter',sans-serif;color:var(--accent);white-space:nowrap;">
          Привет, будем рады тебе помочь
        </div>
      </div>
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:15px;color:var(--accent);opacity:0.9;margin-top:2px;">
        Команда О!БСУДИМ
      </div>
    </div>
    <style>@keyframes fadeIn {from { opacity:0; transform:translateY(20px); }to { opacity:1; transform:translateY(0); }}</style>`;
}

function view_menu() {
  backBtn.style.display = "none";
  return `<div class="grid view">
    <div class="card">
      <div class="title">Календарь соревнований</div>
      <p class="muted" style="margin-bottom:18px;">Выбери раздел и смотри даты, ссылки и составы.</p>
      <button class="btn" id="btnCalendar">Открыть</button>
    </div>
    <div class="card">
      <div class="title">Правила</div>
      <p class="muted" style="margin-bottom:18px;">Скоро тут будут правила и полезные материалы.</p>
      <button class="btn" disabled>Скоро</button>
    </div>
  </div>`;
}

function view_calendar_select() {
  backBtn.style.display = "inline-flex";
  return `<div class="card view">
    <div class="title">Календарь — выбери раздел</div>
    <div class="grid" style="margin-top:18px;gap:36px;">
      <div class="card russian">
        <div class="title">Российские старты</div>
        <p class="muted" style="margin-bottom:18px;">Календарь ФФККР и всероссийские турниры</p>
        <button class="btn" id="btnRus">Открыть</button>
      </div>
      <div class="card international">
        <div class="title">Зарубежные старты</div>
        <p class="muted" style="margin-bottom:18px;">ISU: Гран-при, ЧМ, ЧЕ, Олимпиада и др.</p>
        <button class="btn" id="btnIntl">Открыть</button>
      </div>
    </div>
  </div>`;
}

function columnList(title, arr) {
  if (!arr?.length) return "";
  return `<div class="card" style="min-width:220px">
    <div class="title category">${title}</div>
    <ul style="margin:8px 0 0 16px; padding:0;">
      ${arr.map(n=>`<li style="margin:6px 0">${n}</li>`).join("")}
    </ul>
  </div>`;
}

function view_event_details(kind, idx) {
  const items = kind === "international" ? DATA.international : DATA.russian;
  const it = items[idx];
  const p = it.participants || { men: [], women: [], pairs: [], dance: [] };
  const c = colorForClass(classify(it));
  backBtn.style.display = "inline-flex";
  return `<div class="card view" style="border-top:4px solid ${c};">
    <div class="title" style="margin-bottom:18px;">${it.name}</div>
    ${chips(it)}
    <div style="margin-top:18px;">
      ${it.url ? `<a class="btn" href="${it.url}" target="_blank">🌐 Официальная страница</a>` : ""}
      ${it.entries ? `<a class="btn" href="${it.entries}" target="_blank">📝 Заявки</a>` : ""}
    </div>
    <div class="grid" style="margin-top:28px;gap:36px;">
      ${columnList("Мужчины", p.men)}
      ${columnList("Женщины", p.women)}
      ${columnList("Пары", p.pairs)}
      ${columnList("Танцы на льду", p.dance)}
    </div>
  </div>`;
}

function render() {
  const top = NAV.at(-1) || { view: "intro" };
  let html = "";

  if (top.view === "intro") html = view_intro();
  if (top.view === "menu") html = view_menu();
  if (top.view === "calendar_select") html = view_calendar_select();
  if (top.view === "calendar_list") {
    const kind = top.params.kind;
    const items = kind === "international" ? DATA.international : DATA.russian;
    html = `<div class="card view" style="padding-bottom:24px;">
      <div class="title" style="margin-bottom:18px;">
        ${kind === "international" ? "Зарубежные старты" : "Российские старты"}
      </div>
      <div style="margin-top:18px;">${listView(items, kind)}</div>
    </div>`;
  }
  if (top.view === "event_details")
    html = view_event_details(top.params.kind, top.params.idx);

  app.innerHTML = html;

  if (top.view === "menu")
    document.getElementById("btnCalendar")?.addEventListener("click", () => go("calendar_select"));
  if (top.view === "calendar_select") {
    document.getElementById("btnRus")?.addEventListener("click", () => go("calendar_list", { kind: "russian" }));
    document.getElementById("btnIntl")?.addEventListener("click", () => go("calendar_list", { kind: "international" }));
  }
  if (top.view === "calendar_list")
    document.querySelectorAll(".event-card").forEach(e => e.addEventListener("click", () =>
      go("event_details", { kind: e.dataset.kind, idx: +e.dataset.idx })
    ));

  backBtn.style.display = NAV.length > 1 ? "inline-flex" : "none";
  tBack.textContent = "Назад";
}

async function load() {
  try {
    const r = await fetch("calendar.json", { cache: "no-store" });
    window.DATA = await r.json();
  } catch {
    window.DATA = { season: "2025–2026", international: [], russian: [] };
  }
}

(async () => {
  await load();
  const header = document.querySelector("header.top");
  header.classList.remove("visible");
  go("intro");
  render();
  setTimeout(() => {
    go("menu");
    header.classList.add("visible");
  }, 2000);
})();
