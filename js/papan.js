(() => {
  const $ = (id) => document.getElementById(id);
  const P = window.PESERTA, HARI = [18, 19, 20];
  const hari = { 18: "Rabu 18 Nov", 19: "Khamis 19 Nov", 20: "Jumaat 20 Nov" };
  let tab = "18", rec = { 18: {}, 19: {}, 20: {} }, today = 0, seen = null, key = sessionStorage.getItem("hadir_key") || "";
  let tokenTimer = null, qr = null, lastToken = "";

  $("mode").textContent = API.live ? "LIVE" : "MOD DEMO";
  $("mode").className = "badge" + (API.live ? " live" : "");

  async function ensureKey() {
    if (!API.live || key) return;
    key = prompt("Kata laluan admin:") || "";
    sessionStorage.setItem("hadir_key", key);
  }
  function badKey() { key = ""; sessionStorage.removeItem("hadir_key"); }

  /* ---------- QR dinamik ---------- */
  async function refreshToken() {
    clearTimeout(tokenTimer);
    let ttl = 5;
    try {
      await ensureKey();
      const r = await API.token(key);
      if (!r.ok) {
        if (r.err === "key") { badKey(); $("qNote").textContent = "Kata laluan salah. Muat semula halaman."; }
        else $("qNote").textContent = r.err === "bukan_hari_bengkel" ? "Bukan hari bengkel (18-20 Nov 2026). QR tidak aktif." : "Ralat: " + r.err;
        $("qNote").className = "qrnote bad"; return;
      }
      today = r.day; $("qDay").textContent = "(" + hari[today] + ")";
      const base = (window.CFG.BASE_URL || location.href.replace(/[^/]*([?#].*)?$/, ""));
      const url = base + "hadir.html?t=" + r.token;
      if (r.token !== lastToken) {
        lastToken = r.token; $("qr").innerHTML = "";
        qr = new QRCode($("qr"), { text: url, width: 480, height: 480, correctLevel: QRCode.CorrectLevel.M });
      }
      const local = /^(file:|http:\/\/(localhost|127\.|192\.168\.|10\.))/.test(base);
      $("qNote").className = "qrnote" + (local ? " bad" : "");
      $("qNote").textContent = local ? "Amaran: alamat ini tidak boleh dicapai telefon peserta. Letak laman di hosting dan isi BASE_URL. " + url : url;
      ttl = r.ttl;
      animateRing(ttl);
    } catch (e) { $("qNote").textContent = "Tiada sambungan ke pelayan."; $("qNote").className = "qrnote bad"; }
    tokenTimer = setTimeout(refreshToken, Math.max(1, ttl) * 1000 + 200);
  }
  function animateRing(ttl) {
    const c = $("ringc"); c.style.transition = "none"; c.style.strokeDashoffset = 301.6 * (1 - ttl / API.SLOT);
    void c.getBoundingClientRect(); c.style.transition = "stroke-dashoffset " + ttl + "s linear"; c.style.strokeDashoffset = 301.6;
  }

  /* ---------- Data ---------- */
  async function load() {
    try {
      await ensureKey();
      const r = await API.list(key);
      if (!r.ok) { if (r.err === "key") badKey(); return; }
      const n = { 18: {}, 19: {}, 20: {} };
      r.rec.forEach((x) => { if (n[x.h]) n[x.h][x.id] = x.m; });
      const fresh = [];
      if (seen) HARI.forEach((h) => Object.keys(n[h]).forEach((id) => { if (!seen.has(h + id)) fresh.push({ h, id, m: n[h][id] }); }));
      seen = new Set(); HARI.forEach((h) => Object.keys(n[h]).forEach((id) => seen.add(h + id)));
      rec = n; render(new Set(fresh.map((f) => f.h + f.id)));
      fresh.forEach(announce);
    } catch (e) { /* cuba lagi pada pusingan seterusnya */ }
  }
  function announce(f) {
    const p = P.find((x) => x.id === f.id); if (!p) return;
    const t = $("toast"); t.textContent = "✔ " + p.nama; t.hidden = false; setTimeout(() => (t.hidden = true), 3500);
    const d = document.createElement("div"); d.innerHTML = "<span></span><i></i>";
    d.firstChild.textContent = f.m; d.lastChild.textContent = p.nama; $("ticker").prepend(d);
    while ($("ticker").children.length > 8) $("ticker").lastChild.remove();
  }

  /* ---------- Paparan ---------- */
  const initials = (n) => n.replace(/^(Puan|Encik|Dr\.?|Dato'?|Datin|Tuan|Cik|Ir\.?|Ts\.?|Prof\.?)\s+/i, "").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  function render(fresh = new Set()) {
    const q = $("q").value.trim().toLowerCase(), f = $("flt").value, days = tab === "all" ? HARI : [+tab];
    const okCount = (p) => days.filter((h) => rec[h][p.id]).length;
    const isOk = (p) => (tab === "all" ? okCount(p) === 3 : !!rec[+tab][p.id]);
    const total = P.length, ok = P.filter(isOk).length;
    $("sOk").textContent = ok; $("sNo").textContent = total - ok; $("sAll").textContent = total;
    const pct = total ? Math.round((ok / total) * 100) : 0;
    $("pct").textContent = pct + "%";
    $("donut").style.background = "conic-gradient(var(--mint) " + pct * 3.6 + "deg, rgba(255,255,255,.12) 0)";
    const t = today && rec[today] ? Object.keys(rec[today]).length : 0;
    $("wCount").textContent = t; $("wTotal").textContent = total;
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.t === tab));

    const box = $("orgs"); box.innerHTML = "";
    const orgs = [...new Set(P.map((p) => p.org))];
    orgs.forEach((o) => {
      const all = P.filter((p) => p.org === o), n = all.filter(isOk).length;
      const shown = all.filter((p) => (!q || (p.nama + " " + p.jawatan).toLowerCase().includes(q)) && (f === "all" || (f === "ok") === isOk(p)));
      if (!shown.length) return;
      const el = document.createElement("div"); el.className = "org";
      const h = document.createElement("div"); h.className = "oh";
      h.innerHTML = "<b></b><span></span><div class='bar'><i></i></div>";
      h.children[0].textContent = o; h.children[1].textContent = n + " / " + all.length;
      h.querySelector("i").style.width = (n / all.length) * 100 + "%"; el.appendChild(h);
      shown.forEach((p) => {
        const r = document.createElement("div"); r.className = "row" + (days.some((d) => fresh.has(d + p.id)) ? " baru" : "");
        r.innerHTML = "<div class='av'></div><div><b></b><small></small></div><div class='chips'></div>";
        r.children[0].textContent = initials(p.nama); r.querySelector("b").textContent = p.nama; r.querySelector("small").textContent = p.jawatan;
        const chips = r.lastChild;
        days.forEach((d) => {
          const c = document.createElement("span"), m = rec[d][p.id];
          c.className = "chip" + (m ? " ok" : d > today && today ? " na" : "");
          c.textContent = (tab === "all" ? d + ": " : "") + (m ? "✔ " + m : "Belum");
          chips.appendChild(c);
        });
        el.appendChild(r);
      });
      box.appendChild(el);
    });
    if (!box.children.length) box.innerHTML = "<div class='empty'>Tiada rekod untuk dipaparkan.</div>";
  }

  function csv() {
    const days = tab === "all" ? HARI : [+tab];
    const rows = [["Bil", "Nama", "Jawatan", "Organisasi", ...days.flatMap((d) => ["Status " + d + "/11", "Masa " + d + "/11"])]];
    P.forEach((p, i) => rows.push([i + 1, p.nama, p.jawatan, p.org, ...days.flatMap((d) => [rec[d][p.id] ? "HADIR" : "BELUM", rec[d][p.id] || ""])]));
    const text = "\ufeff" + rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    a.download = "kehadiran-" + (tab === "all" ? "18-20" : tab) + "-nov-2026.csv"; a.click();
  }

  document.querySelectorAll("#tabs button").forEach((b) => (b.onclick = () => { tab = b.dataset.t; render(); }));
  $("q").oninput = () => render(); $("flt").onchange = () => render();
  $("csvBtn").onclick = csv;
  $("wallBtn").onclick = () => { document.body.classList.add("wall"); if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); };
  $("wallClose").onclick = () => { document.body.classList.remove("wall"); if (document.fullscreenElement) document.exitFullscreen(); };

  // Pilih tab hari semasa selepas token diperoleh
  refreshToken().then(() => { if (today && tab === "18") { tab = String(today); render(); } });
  load(); setInterval(load, 4000);
})();
