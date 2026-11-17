(() => {
  const $ = (id) => document.getElementById(id);
  const token = new URLSearchParams(location.search).get("t");
  const SAVED = "hadir_saved_v1";
  const ERR = {
    token: "QR sudah tamat tempoh atau tidak sah. Sila imbas semula QR di skrin dewan.",
    bukan_hari_bengkel: "Pengesahan hanya dibuka pada 18, 19 dan 20 November 2026.",
    id: "Nama tidak sah."
  };
  let day = 0, done = new Set(), chosen = null;

  function msg(t, warn) { const m = $("msg"); m.textContent = t; m.hidden = !t; m.className = "msg" + (warn ? " warn" : ""); }
  function showDone(p, masa, already) {
    $("pick").hidden = true; $("msg").hidden = true; $("done").hidden = false;
    $("dName").textContent = p.nama;
    $("dInfo").textContent = "Hari " + day + " Nov 2026, pukul " + masa + (already ? " (sudah disahkan sebelum ini)" : "");
    const s = JSON.parse(localStorage.getItem(SAVED) || "{}"); s[day] = { id: p.id, m: masa };
    localStorage.setItem(SAVED, JSON.stringify(s));
  }
  function render() {
    const q = $("q").value.trim().toLowerCase(), box = $("list");
    box.innerHTML = "";
    let org = null;
    window.PESERTA.forEach((p) => {
      if (q && !(p.nama + " " + p.org + " " + p.jawatan).toLowerCase().includes(q)) return;
      if (p.org !== org) { org = p.org; const g = document.createElement("div"); g.className = "grp"; g.textContent = org; box.appendChild(g); }
      const b = document.createElement("button");
      b.className = "p" + (done.has(p.id) ? " ok" : "");
      const d = document.createElement("div");
      const n = document.createElement("b"), j = document.createElement("small");
      n.textContent = p.nama; j.textContent = p.jawatan; d.append(n, j); b.appendChild(d);
      b.onclick = () => { chosen = p; $("cName").textContent = p.nama; $("cOrg").textContent = p.jawatan + " · " + p.org; $("sheet").hidden = false; };
      box.appendChild(b);
    });
    if (!box.children.length) box.innerHTML = '<p class="hint">Tiada padanan.</p>';
  }

  async function init() {
    if (!token) return msg("Sila imbas kod QR yang dipaparkan di dewan bengkel untuk mengesahkan kehadiran.", true);
    try {
      const r = await API.today();
      if (!r.ok) throw 0;
      day = r.day; done = new Set(r.ids);
      if (!day) return msg(ERR.bukan_hari_bengkel, true);
    } catch (e) { return msg("Tidak dapat berhubung dengan pelayan. Semak sambungan internet anda."); }
    const saved = (JSON.parse(localStorage.getItem(SAVED) || "{}"))[day];
    if (saved) { const p = window.PESERTA.find((x) => x.id === saved.id); if (p) return showDone(p, saved.m, true); }
    $("pick").hidden = false; render();
  }

  $("q").oninput = render;
  $("no").onclick = () => { $("sheet").hidden = true; };
  $("yes").onclick = async () => {
    const b = $("yes"); b.disabled = true; b.textContent = "Mengesahkan...";
    try {
      const r = await API.checkin(chosen, token);
      $("sheet").hidden = true;
      if (r.ok) { day = r.day; showDone(chosen, r.masa, r.already); }
      else { msg(ERR[r.err] || "Gagal mengesahkan. Cuba lagi."); window.scrollTo(0, 0); }
    } catch (e) { $("sheet").hidden = true; msg("Sambungan terputus. Cuba lagi."); }
    b.disabled = false; b.textContent = "Ya, sahkan kehadiran";
  };
  init();
})();
