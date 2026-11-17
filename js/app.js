/* ==========================================================
   LIVE BACKDROP - BKPO KKM 2026
   Kawalan papan kekunci:
     F  : skrin penuh   M : halaman utama
     D  : hidup/mati mod demo (masa dipercepat dari 18 Nov 13:58)
     ←/→: lompat ke sesi sebelum/seterusnya (mod demo, masa biasa)
     R  : kembali ke masa sebenar
   URL: ?demo=1&speed=240   atau   ?t=2026-11-19T08:25:00+08:00&speed=1
   ========================================================== */
(() => {
  const $ = (id) => document.getElementById(id);
  const stage = $("stage");

  /* ---------- Jam (sebenar / maya) ---------- */
  const clock = { virtual: false, base: 0, realBase: 0, speed: 1 };
  const realNow = () => Date.now();
  function setVirtual(ms, speed) {
    clock.virtual = true; clock.base = ms; clock.realBase = realNow(); clock.speed = speed;
  }
  const now = () => clock.virtual ? clock.base + (realNow() - clock.realBase) * clock.speed : realNow();

  const q = new URLSearchParams(location.search);
  const qSpeed = parseFloat(q.get("speed")) || 240;
  if (q.get("t")) setVirtual(new Date(q.get("t")).getTime(), parseFloat(q.get("speed")) || 1);
  else if (q.get("demo")) setVirtual(SCHEDULE[0].start.getTime() - 2 * 60000, qSpeed);

  addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "d") { clock.virtual ? (clock.virtual = false) : setVirtual(SCHEDULE[0].start.getTime() - 2 * 60000, qSpeed); lastId = null; }
    else if (k === "r") { clock.virtual = false; lastId = null; }
    else if (k === "arrowright" || k === "arrowleft") {
      const t = now();
      let idx = SCHEDULE.findIndex((i) => t < i.end.getTime());
      if (idx < 0) idx = SCHEDULE.length;
      const cur = SCHEDULE[idx];
      const inside = cur && t >= cur.start.getTime();
      let target = k === "arrowright" ? (inside ? idx + 1 : idx) : (inside ? idx - 1 : idx - 1);
      target = Math.max(0, Math.min(SCHEDULE.length - 1, target));
      setVirtual(SCHEDULE[target].start.getTime() + 3000, 1);
      lastId = null;
    }
  });

  /* ---------- Format ---------- */
  const p2 = (n) => String(n).padStart(2, "0");
  // Semua paparan ikut waktu Malaysia (UTC+8) walaupun peranti di zon lain
  const myt = (ms) => new Date(ms + 8 * 3600000);
  function t12(date) {
    const m = myt(date.getTime());
    const h = m.getUTCHours(), mi = m.getUTCMinutes();
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const suf = h === 12 ? "tgh" : h < 12 ? "pg" : h < 19 ? "ptg" : "mlm";
    return `${p2(h12)}.${p2(mi)} ${suf}`;
  }
  const range = (it) => `${t12(it.start)} - ${t12(it.end)}`;
  function dur(ms) {
    ms = Math.max(0, Math.ceil(ms / 1000));
    const d = Math.floor(ms / 86400), h = Math.floor(ms % 86400 / 3600), m = Math.floor(ms % 3600 / 60), s = ms % 60;
    return (d ? `${d} hari ` : "") + `${p2(h)}:${p2(m)}:${p2(s)}`;
  }
  const MONTHS = ["JANUARI","FEBRUARI","MAC","APRIL","MEI","JUN","JULAI","OGOS","SEPTEMBER","OKTOBER","NOVEMBER","DISEMBER"];
  const WEEK = ["AHAD","ISNIN","SELASA","RABU","KHAMIS","JUMAAT","SABTU"];

  /* ---------- Ticker ---------- */
  const tk = TICKER.map((t) => `<span>${t}</span>`).join("");
  $("tickerMove").innerHTML = tk + tk;

  /* ---------- Senarai atur cara ---------- */
  let renderedDay = null, rowEls = [];
  function buildAgenda(dayNo) {
    renderedDay = dayNo;
    const d = DAYS[dayNo - 1];
    $("dayTitle").textContent = `${d.label} · ${d.name} · ${d.display.replace(" 2026", "")}`;
    $("dayDots").innerHTML = DAYS.map((x) => `<i class="${x.day === dayNo ? "on" : ""}"></i>`).join("");
    const list = $("agendaList");
    list.innerHTML = '<div class="agenda-inner" id="agendaInner"></div>';
    const inner = $("agendaInner");
    rowEls = [];
    SCHEDULE.filter((i) => i.day === dayNo).forEach((it) => {
      const r = document.createElement("div");
      r.className = "row";
      r.innerHTML = `<div class="t">${t12(it.start)}</div><div class="n"><b>${it.tag}</b><span>${it.title}</span></div><div class="c"></div>`;
      inner.appendChild(r);
      rowEls.push({ it, el: r });
    });
  }

  function updateAgenda(t, cur, next) {
    let focus = null;
    rowEls.forEach(({ it, el }) => {
      const past = t >= it.end.getTime();
      const isCur = cur === it;
      el.className = "row" + (isCur ? " current" : past ? " past" : "");
      if (isCur || (!focus && !past && !cur)) focus = el;
    });
    // Tatal supaya baris semasa berada di tengah
    const box = $("agendaList"), inner = $("agendaInner");
    if (!inner) return;
    const target = focus || rowEls[rowEls.length - 1]?.el;
    let y = 0;
    if (target) {
      y = target.offsetTop + target.offsetHeight / 2 - box.clientHeight / 2;
      y = Math.max(0, Math.min(y, inner.offsetHeight - box.clientHeight));
    }
    inner.style.transform = `translateY(${-y}px)`;
  }

  /* ---------- Kad "sedang berlangsung" ---------- */
  let lastId = null;
  function setNowCard(o) {
    $("nowLabel").textContent = o.label;
    $("nowTag").textContent = o.tag || "";
    $("nowTag").dataset.type = o.type || "";
    $("nowTag").style.display = o.tag ? "" : "none";
    const h = $("nowTitle");
    h.textContent = o.title;
    h.classList.toggle("long", o.title.length > 70);
    $("nowSpeaker").innerHTML = o.speaker ? `Penceramah: <b>${o.speaker}</b>` : (o.sub || "");
    $("nowTime").textContent = o.time || "";
    $("nowCard").classList.toggle("idle", !!o.idle);
    const body = $("nowBody");
    body.classList.remove("enter"); void body.offsetWidth; body.classList.add("enter");
  }

  /* ---------- Kitaran kemas kini ---------- */
  function tick() {
    const t = now();
    const d = myt(t);
    $("clockTime").textContent = `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`;
    $("clockDate").textContent = `${WEEK[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    $("demoBadge").hidden = !clock.virtual;

    const first = SCHEDULE[0], last = SCHEDULE[SCHEDULE.length - 1];
    const cur = SCHEDULE.find((i) => t >= i.start.getTime() && t < i.end.getTime()) || null;
    const next = SCHEDULE.find((i) => i.start.getTime() > t) || null;

    let state, id;
    if (cur) { state = "live"; id = "c" + SCHEDULE.indexOf(cur); }
    else if (t < first.start.getTime()) { state = "before"; id = "before"; }
    else if (!next) { state = "after"; id = "after"; }
    else { state = "gap"; id = "g" + SCHEDULE.indexOf(next); }

    const dayNo = (cur || next || last).day;
    if (dayNo !== renderedDay) buildAgenda(dayNo);

    const changed = id !== lastId;
    if (changed) {
      lastId = id;
      if (state === "live") setNowCard({ label: "SEDANG BERLANGSUNG", tag: cur.tag, type: cur.type, title: cur.title, speaker: cur.speaker, time: range(cur) });
      else if (state === "before") setNowCard({ label: "BENGKEL AKAN BERMULA", tag: first.tag, type: first.type, title: first.title, sub: "18 November 2026 · " + range(first), time: "", idle: true });
      else if (state === "gap") setNowCard({ label: "REHAT / PERALIHAN SESI", tag: "SETERUSNYA: " + next.tag, type: next.type, title: next.title, speaker: next.speaker, time: range(next), idle: true });
      else setNowCard({ label: "TERIMA KASIH", tag: "", title: "Bengkel Telah Tamat. Sehingga bertemu lagi.", sub: "BKPO KKM 2026 · Concorde Hotel, Shah Alam", time: "", idle: true });
    }

    // Bahagian bawah kad
    const fill = $("barFill");
    if (state === "live") {
      const total = cur.end - cur.start, el = t - cur.start.getTime();
      fill.style.width = (el / total * 100).toFixed(2) + "%";
      $("remainLabel").textContent = "Berakhir dalam";
      $("remainValue").textContent = dur(cur.end.getTime() - t);
      const nx = SCHEDULE[SCHEDULE.indexOf(cur) + 1];
      $("nextLine").innerHTML = nx ? `Seterusnya (${t12(nx.start)}): <b>${nx.title}</b>` : "";
    } else if (state === "before" || state === "gap") {
      fill.style.width = "0%";
      $("remainLabel").textContent = state === "before" ? "Bermula dalam" : "Sesi bermula dalam";
      $("remainValue").textContent = dur(next.start.getTime() - t);
      $("nextLine").textContent = "";
    } else {
      fill.style.width = "100%";
      $("remainLabel").textContent = "";
      $("remainValue").textContent = "";
      $("nextLine").textContent = "";
    }

    updateAgenda(t, cur, next);
  }
  tick();
  setInterval(tick, 1000);

})();
