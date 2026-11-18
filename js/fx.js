/* ==========================================================
   FX BERSAMA: skala pentas, kekunci, rangkaian neural (canvas)
   Kekunci: F skrin penuh | S / Space / PageDown ke sesi | B ke Folder Bengkel | M / PageUp kembali ke utama
   ========================================================== */
(() => {
  const stage = document.getElementById("stage");

  // ?still=1 : matikan animasi CSS (untuk tangkapan skrin / semakan reka letak)
  if (new URLSearchParams(location.search).get("still")) {
    const st = document.createElement("style");
    st.textContent = "*{animation:none!important;transition:none!important}.ch{opacity:1!important}.rings{opacity:.55!important}";
    document.head.appendChild(st);
  }

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  addEventListener("resize", fit); fit();

  const page = location.pathname.endsWith("sesi.html") ? "sesi" : location.pathname.endsWith("folder.html") ? "folder" : location.pathname.endsWith("laman.html") ? "laman" : "index";

  // Butang navigasi: kekalkan parameter URL (cth. ?t=...) dan tunjuk kursor bila tetikus bergerak
  const nb = document.getElementById("navBtn");
  if (nb) nb.setAttribute("href", nb.getAttribute("href") + location.search);
  let hideT;
  addEventListener("mousemove", () => {
    document.body.classList.add("mouse-on");
    clearTimeout(hideT);
    hideT = setTimeout(() => document.body.classList.remove("mouse-on"), 3000);
  });
  addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "f") document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    else if ((k === "s" || k === " " || k === "pagedown") && page === "index") location.href = "sesi.html" + location.search;
    else if (k === "b" && page === "index") location.href = "folder.html" + location.search;
    else if (k === "l" && page === "index") location.href = "laman.html" + location.search;
    else if ((k === "m" || k === "pageup") && page !== "index") location.href = "index.html" + location.search;
  });

  /* ---------- Rangkaian neural dengan denyut data ---------- */
  const cv = document.createElement("canvas");
  cv.id = "fx"; cv.width = 1920; cv.height = 1080;
  stage.insertBefore(cv, stage.firstChild);
  const ctx = cv.getContext("2d");
  const N = 95, LINK = 190;
  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * 1920, y: Math.random() * 1080,
    vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6,
    r: Math.random() * 2.2 + .8, h: Math.random() < .5 ? 187 : 275,
  }));
  const pulses = [];

  function frame() {
    ctx.clearRect(0, 0, 1920, 1080);
    for (const a of pts) {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > 1920) a.vx *= -1;
      if (a.y < 0 || a.y > 1080) a.vy *= -1;
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `hsla(${pts[i].h},100%,70%,${(1 - d / LINK) * .35})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
    }
    // denyut data bergerak di sepanjang garisan
    if (pulses.length < 14 && Math.random() < .12) {
      const a = pts[(Math.random() * N) | 0];
      let best = null, bd = LINK;
      for (const b of pts) { if (b === a) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < bd) { bd = d; best = b; } }
      if (best) pulses.push({ a, b: best, t: 0, h: Math.random() < .5 ? 187 : 320 });
    }
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k]; p.t += .035;
      if (p.t >= 1) { pulses.splice(k, 1); continue; }
      const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 16);
      g.addColorStop(0, `hsla(${p.h},100%,85%,1)`); g.addColorStop(1, `hsla(${p.h},100%,60%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 16, 0, 6.283); ctx.fill();
    }
    for (const a of pts) {
      ctx.fillStyle = `hsla(${a.h},100%,78%,.9)`;
      ctx.shadowColor = `hsl(${a.h},100%,60%)`; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }
  frame();
})();
