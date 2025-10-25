// --- Мини-приложение "Фигурное катание" ---
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

// --- Форматирование дат и утилиты ---
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

// --- Поиск событий ---
function findCurrentEvents() {
  const today = new Date();
  const all = [...(DATA.international || []), ...(DATA.russian || [])];
  return all.filter(ev => {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    return today >= start && today <= end;
  });
}
function findNextEvent() {
  const today = new Date();
  const all = [...(DATA.international || []), ...(DATA.russian || [])];
  const future = all.filter(ev => new Date(ev.start) > today);
  return future.sort((a, b) => new Date(a.start) - new Date(b.start))[0] || null;
}

// --- Главная страница ---
function view_menu() {
  backBtn.style.display = "none";
  const currents = findCurrentEvents();
  const nextEvents = [];

  const today = new Date();
  const all = [...(DATA.international || []), ...(DATA.russian || [])];
  const future = all.filter(ev => new Date(ev.start) > today)
                    .sort((a, b) => new Date(a.start) - new Date(b.start));
  nextEvents.push(...future.slice(0, 2)); // два ближайших старта

  let currentBlocks = "";

  // функция определения, что сейчас идёт по расписанию
  function getCurrentScheduleText(ev) {
    if (!ev.schedule_text) return null;
    const now = new Date();
    const nowHM = now.getHours() * 60 + now.getMinutes();
    for (const day of ev.schedule_text) {
      for (const item of day.items) {
        const match = item.match(/^(\d{1,2}):(\d{2})/);
        if (match) {
          const startM = +match[1] * 60 + +match[2];
          const endMatch = item.match(/–\s*(\d{1,2}):(\d{2})/);
          if (endMatch) {
            const endM = +endMatch[1] * 60 + +endMatch[2];
            if (nowHM >= startM && nowHM <= endM) {
              return `${day.date}: ${item.split("—").pop().trim()}`;
            }
          }
        }
      }
    }
    return null;
  }

  // 🔹 Если сейчас идут соревнования
  if (currents.length > 0) {
    currentBlocks = currents.map(ev => {
      const kind = DATA.international.includes(ev) ? "international" : "russian";
      const idx = DATA[kind].indexOf(ev);
      const place = [ev.city, ev.country].filter(Boolean).join(", ");
      const currentItem = getCurrentScheduleText(ev);
      const subtitle = currentItem
        ? `Сейчас идёт: ${currentItem}`
        : "Сейчас идёт старт";
      return `
        <div class="card current clickable" data-kind="${kind}" data-idx="${idx}">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="pulse"></span>
            <div class="title">Сейчас идёт</div>
          </div>
          <div style="font-weight:600;margin:6px 0 4px;color:var(--accent);">${ev.name}</div>
          <p class="muted">${place}<br>${fmtDateRange(ev.start, ev.end)}</p>
          <div style="margin-top:6px;font-size:14px;color:var(--accent);font-weight:500;">${subtitle}</div>
        </div>`;
    }).join("");
  } 
  // 🔹 Если ничего не идёт — показываем два ближайших
  else if (nextEvents.length > 0) {
    currentBlocks = nextEvents.map(next => {
      const kind = DATA.international.includes(next) ? "international" : "russian";
      const idx = DATA[kind].indexOf(next);
      const place = [next.city, next.country].filter(Boolean).join(", ");
      return `
        <div class="card upcoming clickable" data-kind="${kind}" data-idx="${idx}">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="pulse upcoming"></span>
            <div class="title">Ближайший старт</div>
          </div>
          <div style="font-weight:600;margin:6px 0 4px;color:var(--accent);">${next.name}</div>
          <p class="muted">${place}<br>${fmtDateRange(next.start, next.end)}</p>
        </div>`;
    }).join("");
  }

  // --- возвращаем разметку ---
  return `
    <div class="grid view fade-in">
      ${currentBlocks}

      <div class="card">
        <div class="title">Календарь соревнований</div>
        <p class="muted" style="margin-bottom:18px;">Выбери раздел и смотри даты, ссылки и составы</p>
        <button class="btn" id="btnCalendar">Открыть</button>
      </div>

      <!-- 🔹 Плашка настольной игры ПРО!КАТ ЖИЗНИ -->
      <a href="https://t.me/obsudiim_fk/15054" target="_blank"
         class="card clickable"
         style="text-align:center; padding:36px 20px; text-decoration:none; cursor:pointer;">
        <div style="font-size:16px; color:var(--muted); margin-bottom:6px; letter-spacing:0.5px;">
          настольная игра
        </div>
        <div style="font-family:'Unbounded', sans-serif; font-weight:700;
                    font-size:26px; color:var(--accent); letter-spacing:1px;">
          ПРО!КАТ ЖИЗНИ
        </div>
      </a>

      <!-- ❤️ Поддержать канал (Tinkoff) -->
      <div class="card" id="btnSupport"
           style="text-align:center;padding:24px;border:1px solid var(--accent);
                  background:linear-gradient(180deg,#fff,#ffe5ec);
                  box-shadow:0 4px 20px rgba(130,17,48,0.15); cursor:pointer;">
        <div style="font-size:36px;margin-bottom:8px;color:var(--accent);">❤️</div>
        <div class="title" style="font-size:18px;">Поддержать канал</div>
        <p class="muted" style="font-size:14px;">Нажми, чтобы сделать доброе дело</p>
      </div>
    </div>`;
}

// --- Страница выбора календаря соревнований ---
function view_calendar_select() {
  backBtn.style.display = "inline-flex";
  return `
    <div class="card view fade-in" style="text-align:center; padding:40px 20px;">
      <div class="title" style="margin-bottom:18px;">📅 Календарь соревнований</div>
      <p class="muted" style="margin-bottom:24px;">
        Выбери раздел и смотри даты, составы и ссылки на результаты
      </p>

      <div class="grid" style="gap:24px;justify-content:center;">
        <div id="btnIntl" class="card clickable"
             style="cursor:pointer; padding:26px 18px; text-align:center;">
          <div class="title" style="margin-bottom:8px;">🌍 Зарубежные старты</div>
          <p class="muted" style="font-size:14px;">Этапы Гран-при и международные турниры ISU</p>
        </div>

        <div id="btnRus" class="card clickable"
             style="cursor:pointer; padding:26px 18px; text-align:center;">
          <div class="title" style="margin-bottom:8px;">🇷🇺 Российские старты</div>
          <p class="muted" style="font-size:14px;">Этапы Кубка России и внутренние соревнования</p>
        </div>
      </div>
    </div>`;
}

// --- Список стартов (плашки турниров) ---
function view_calendar_list(kind) {
  backBtn.style.display = "inline-flex";
  const arr = DATA[kind] || [];
  if (!arr.length) {
    return `<div class="card view fade-in"><div class="title">Нет данных</div></div>`;
  }

  const title = kind === "international" ? "Международные старты" : "Российские старты";

  const events = arr.map((it, idx) => {
    const color = colorForClass(classify(it));
    return `
      <div class="event-card clickable" data-kind="${kind}" data-idx="${idx}"
           style="border-top:4px solid ${color}; text-align:left;">
        <div class="title" style="margin-bottom:6px;">${it.name}</div>
        <div class="muted" style="margin-bottom:4px;">📍 ${it.city}, ${it.country}</div>
        <div class="muted" style="font-size:14px;">📅 ${fmtDateRange(it.start, it.end)}</div>
      </div>`;
  }).join("");

  return `
    <div class="card view fade-in" style="padding-bottom:24px;">
      <div class="title" style="margin-bottom:18px;">${title}</div>
      <div class="grid" style="margin-top:16px;">${events}</div>
    </div>`;
}


// --- Участники + результаты ---
function columnList(title, arr, kind, idx) {
  if (!arr?.length) return "";
  const catKey = title.toLowerCase();
  return `
    <div class="card" style="min-width:220px; position:relative;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div class="title category">${title}</div>
        <button class="btn-mini"
          data-kind="${kind}" data-idx="${idx}" data-cat="${catKey}"
          style="display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:600;
                 padding:6px 10px;border-radius:999px;background:linear-gradient(180deg,#fff,#ffe9f0);
                 border:1px solid #ffb7c7;cursor:pointer;transition:.25s;">📊</button>
      </div>
      <ul style="margin:8px 0 0 16px; padding:0;">
        ${arr.map(n => `<li style="margin:6px 0">${n}</li>`).join("")}
      </ul>
    </div>`;
}
// --- Страница результатов ---
function view_results(kind, idx, category) {
  backBtn.style.display = "inline-flex";
  const items = kind === "international" ? DATA.international : DATA.russian;
  const it = items[idx];
  const res = it.results?.[category] || {};
  const shortUrl = res["короткая"];
  const freeUrl = res["произвольная"];

  return `
    <div class="card view fade-in" style="text-align:center;">
      <div class="title" style="margin-bottom:16px;">${it.name}</div>
      <div class="muted" style="margin-bottom:20px;">📊 Результаты — ${category}</div>

      <div class="grid" style="gap:24px;justify-content:center;max-width:600px;margin:0 auto;">
        <a class="results-card ${shortUrl ? "clickable" : "disabled"}"
           ${shortUrl ? `href="${shortUrl}" target="_blank"` : ""}
           style="text-decoration:none;">
          <div class="title category" style="font-size:16px;margin-bottom:6px;">
            Короткая программа
          </div>
          ${shortUrl
            ? `<p class="muted" style="font-size:14px;">Открыть протокол</p>`
            : `<p class="muted" style="font-size:14px;">⏳ Нет ссылки</p>`}
        </a>

        <a class="results-card ${freeUrl ? "clickable" : "disabled"}"
           ${freeUrl ? `href="${freeUrl}" target="_blank"` : ""}
           style="text-decoration:none;">
          <div class="title category" style="font-size:16px;margin-bottom:6px;">
            Произвольная программа
          </div>
          ${freeUrl
            ? `<p class="muted" style="font-size:14px;">Открыть протокол</p>`
            : `<p class="muted" style="font-size:14px;">⏳ Нет ссылки</p>`}
        </a>
      </div>
    </div>`;
}

// --- Страница расписания ---
function view_schedule(kind, idx) {
  const items = kind === "international" ? DATA.international : DATA.russian;
  const it = items[idx];
  backBtn.style.display = "inline-flex";
  const schedule = it.schedule;
  const scheduleText = it.schedule_text;

  if (scheduleText?.length) {
    return `
      <div class="card view fade-in" style="text-align:center;">
        <div class="title" style="margin-bottom:16px;">${it.name}</div>
        <div class="muted" style="margin-bottom:20px;">🕒 Расписание соревнований</div>
        <div class="grid" style="gap:20px;justify-content:center;max-width:600px;margin:0 auto;">
          ${scheduleText.map(day => `
            <div class="card" style="background:var(--card-bg);border:1px solid var(--border);
              border-radius:18px;padding:18px 20px;box-shadow:0 4px 16px rgba(130,17,48,0.1);
              text-align:left;">
              <div class="title" style="font-size:16px;margin-bottom:10px;">${day.date}</div>
              <ul style="list-style:none;padding:0;margin:0;">
                ${day.items.map(t => `
                  <li style="margin:6px 0;padding:8px 12px;
                             background:rgba(138,17,56,0.05);
                             border-radius:10px;
                             font-size:14px;">${t}</li>`).join("")}
              </ul>
            </div>`).join("")}
        </div>
      </div>`;
  }

  if (schedule) {
    return `
      <div class="card view fade-in" style="text-align:center;">
        <div class="title" style="margin-bottom:16px;">${it.name}</div>
        <div class="muted" style="margin-bottom:20px;">🕒 Расписание соревнований</div>
        <a href="${schedule}" target="_blank" class="btn" style="margin-top:10px;">Открыть расписание</a>
      </div>`;
  }

  return `
    <div class="card view fade-in" style="text-align:center;">
      <div class="title" style="margin-bottom:16px;">${it.name}</div>
      <div class="muted" style="font-size:15px;">⏳ Скоро тут будет расписание</div>
    </div>`;
}

// --- Приветствие ---
function view_intro() {
  backBtn.style.display = "none";
  return `
    <div style="display:flex;flex-direction:column;align-items:center;
                justify-content:center;height:70vh;text-align:center;animation:fadeIn 1s;">
      <img src="./brand.png" style="width:100px;height:auto;margin-bottom:45px;opacity:0.95;">
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;
                  font-size:22px;color:var(--accent);line-height:1.4;
                  margin-bottom:45px;white-space:pre-line;">
        Привет!\nБудем рады тебе помочь
      </div>
      <div style="font-family:'Unbounded',sans-serif;font-weight:700;
                  font-size:18px;color:var(--accent);opacity:0.9;">
        Команда О!БСУДИМ
      </div>
    </div>`;
}
// --- Страница события ---
function view_event_details(kind, idx) {
  const items = kind === "international" ? DATA.international : DATA.russian;
  const it = items[idx];
  if (!it) return `<div class="card"><div class="title">Ошибка загрузки события</div></div>`;
  const p = it.participants || { men: [], women: [], pairs: [], dance: [] };
  const c = colorForClass(classify(it));
  backBtn.style.display = "inline-flex";

  // 🔧 теперь пьедестал показывается всегда, независимо от даты
  const now = new Date();
  const end = new Date(it.end);
  const showSchedule = true;

  function podiumBlock(title, arr) {
    if (!arr || arr.length < 3) return "";
    return `
      <div class="podium-card" style="margin-bottom:20px;">
        <div class="title category" style="margin-bottom:8px;">${title}</div>
        <div class="podium">
          <div class="place"><span class="medal">🥇</span>${arr[0]}</div>
          <div class="place"><span class="medal">🥈</span>${arr[1]}</div>
          <div class="place"><span class="medal">🥉</span>${arr[2]}</div>
        </div>
      </div>`;
  }

  const top3 = it.results_top3 || {};
  const podiumHTML = Object.keys(top3).length
    ? `
      <div class="card" style="margin-top:28px;">
        <div class="title" style="margin-bottom:14px;">🏆 Итоги соревнования</div>
        ${podiumBlock("Мужчины", top3["мужчины"])}
        ${podiumBlock("Женщины", top3["женщины"])}
        ${podiumBlock("Пары", top3["пары"])}
        ${podiumBlock("Танцы на льду", top3["танцы на льду"])}
      </div>`
    : "";

  return `
    <div class="card view fade-in" style="border-top:4px solid ${c};">
      <div class="title" style="margin-bottom:18px;">${it.name}</div>
      <div style="margin-bottom:8px;">📅 ${fmtDateRange(it.start, it.end)}</div>
      <div class="muted">📍 ${[it.city, it.country].filter(Boolean).join(", ")}</div>

      <div class="card clickable schedule-btn" data-kind="${kind}" data-idx="${idx}"
           style="margin-top:28px; text-align:center; padding:22px;">
        <div class="title" style="margin-bottom:8px;">🕒 Расписание соревнований</div>
        <p class="muted" style="font-size:14px;">Открыть расписание этапа</p>
      </div>

      ${podiumHTML}

      <div class="grid" style="margin-top:28px;gap:36px;">
        ${columnList("Мужчины", p.men, kind, idx)}
        ${columnList("Женщины", p.women, kind, idx)}
        ${columnList("Пары", p.pairs, kind, idx)}
        ${columnList("Танцы на льду", p.dance, kind, idx)}
      </div>
    </div>`;
}
// --- Рендер ---
function render() {
  const top = NAV.at(-1) || { view: "intro" };
  let html = "";

  if (top.view === "intro") html = view_intro();
  if (top.view === "menu") html = view_menu();
  if (top.view === "calendar_select") html = view_calendar_select();
  if (top.view === "calendar_list") html = view_calendar_list(top.params.kind);
  if (top.view === "event_details") html = view_event_details(top.params.kind, top.params.idx);
  if (top.view === "results") html = view_results(top.params.kind, top.params.idx, top.params.category);
  if (top.view === "schedule") html = view_schedule(top.params.kind, top.params.idx);
  if (top.view === "merch") html = view_merch();

  app.innerHTML = html;

  // --- обработчики ---
   // --- обработчики ---
  if (top.view === "menu") {
    document.getElementById("btnCalendar")?.addEventListener("click",()=>go("calendar_select"));
    
    // 🔹 Кнопка ПРО!КАТ ЖИЗНИ — сразу ведёт в Telegram
    document.getElementById("btnMerch")?.addEventListener("click",()=>{
      window.open("https://t.me/obsudiim_fk/15054","_blank");
    });

    // ❤️ Поддержать канал — ссылка на Tinkoff
    document.getElementById("btnSupport")?.addEventListener("click",()=> {
      window.open("https://tbank.ru/cf/A3o7MPogyVI", "_blank");
    });

    document.querySelectorAll(".card.clickable").forEach(c =>
      c.addEventListener("click",()=>{
        const kind=c.dataset.kind;
        const idx=+c.dataset.idx;
        go("event_details",{kind,idx});
      }));
  }

  if (top.view === "calendar_select") {
    document.getElementById("btnRus")?.addEventListener("click",()=>go("calendar_list",{kind:"russian"}));
    document.getElementById("btnIntl")?.addEventListener("click",()=>go("calendar_list",{kind:"international"}));
  }

  if (top.view === "calendar_list") {
    document.querySelectorAll(".event-card").forEach(e =>
      e.addEventListener("click", () => {
        go("event_details", { kind: e.dataset.kind, idx: +e.dataset.idx });
      })
    );
  }


  if (top.view === "event_details") {
    document.querySelectorAll(".schedule-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const kind = btn.dataset.kind;
        const idx = +btn.dataset.idx;
        go("schedule", { kind, idx });
      });
    });
    document.querySelectorAll(".btn-mini").forEach(btn => {
      btn.addEventListener("click", () => {
        const kind = btn.dataset.kind;
        const idx = +btn.dataset.idx;
        const category = btn.dataset.cat;
        go("results", { kind, idx, category });
      });
    });
  }

  const hideBackOn = ["intro", "menu"];
  backBtn.style.display = hideBackOn.includes(top.view) ? "none" : "inline-flex";
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

// --- Страница настольной игры ---
function view_merch() {
  backBtn.style.display = "inline-flex";
  return `
    <div class="card view fade-in clickable" 
         onclick="window.open('https://t.me/obsudiim_fk/15054','_blank')" 
         style="text-align:center; padding:40px 20px; cursor:pointer;">
      <div style="font-family:'Unbounded', sans-serif; font-weight:700;
                  font-size:28px; color:var(--accent); letter-spacing:1px;">
        Настольная игра ПРО!КАТ ЖИЗНИ
      </div>
    </div>`;
}

