/* Lapisan data kehadiran: Google Apps Script (live) atau localStorage (demo). */
(() => {
  const C = window.CFG, SLOT = 30, GRACE = 6;
  const live = !!C.API_URL;
  const KEY = "hadir_demo_v1";
  const store = () => JSON.parse(localStorage.getItem(KEY) || '{"r":[]}');
  const slot = () => Math.floor(Date.now() / 1000 / SLOT);
  const hhmm = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  function demoDay() {
    if (C.HARI_UJI) return C.HARI_UJI;
    const d = new Date();
    if (d.getFullYear() === 2026 && d.getMonth() === 10 && d.getDate() >= 18 && d.getDate() <= 20) return d.getDate();
    return 18;
  }
  async function get(params) {
    const u = new URL(C.API_URL);
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
    const r = await fetch(u.toString());
    return r.json();
  }

  window.API = {
    live, SLOT,
    async token(key) {
      if (!live) return { ok: true, day: demoDay(), token: "D" + slot(), ttl: SLOT - ((Date.now() / 1000) % SLOT) };
      return get({ action: "token", key });
    },
    async today() {
      if (!live) { const d = demoDay(); return { ok: true, day: d, ids: store().r.filter((x) => x.h === d).map((x) => x.id) }; }
      return get({ action: "today" });
    },
    async checkin(p, t) {
      if (!live) {
        const day = demoDay(), s = store();
        if (!/^D\d+$/.test(t || "") || slot() - parseInt(t.slice(1), 10) > GRACE) return { ok: false, err: "token" };
        const old = s.r.find((x) => x.h === day && x.id === p.id);
        if (old) return { ok: true, already: true, day, masa: old.m };
        const rec = { h: day, id: p.id, m: hhmm() };
        s.r.push(rec); localStorage.setItem(KEY, JSON.stringify(s));
        return { ok: true, day, masa: rec.m };
      }
      return get({ action: "checkin", id: p.id, nama: p.nama, org: p.org, t });
    },
    async list(key) {
      if (!live) return { ok: true, day: demoDay(), rec: store().r };
      return get({ action: "list", key });
    },
    resetDemo() { localStorage.removeItem(KEY); }
  };
})();
