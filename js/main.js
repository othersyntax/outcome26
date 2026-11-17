/* Halaman utama: pecah tajuk kepada huruf + kesan "decode" AI yang berulang */
(() => {
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\{}[]#%&*+=";
  const t1 = document.getElementById("t1"), t2 = document.getElementById("t2");

  function split(el, hueFrom, hueTo) {
    const text = el.textContent;
    el.textContent = "";
    const chars = [];
    [...text].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "ch" + (c === " " ? " sp" : "");
      s.style.setProperty("--i", i);
      s.style.setProperty("--h", hueFrom + (hueTo - hueFrom) * (i / Math.max(1, text.length - 1)));
      s.textContent = c === " " ? "\u00a0" : c;
      s.dataset.c = c;
      el.appendChild(s);
      if (c !== " ") chars.push(s);
    });
    return chars;
  }

  const a = split(t1, 0, 0);
  const b = split(t2, 185, 320);   // cyan -> magenta
  const all = [...a, ...b];

  // Kunci lebar setiap huruf supaya susun atur tidak bergegar semasa scramble
  function lock() { all.forEach((s) => { s.style.minWidth = s.getBoundingClientRect().width / currentScale() + "px"; }); }
  function currentScale() { const m = document.getElementById("stage").style.transform.match(/scale\(([\d.]+)\)/); return m ? parseFloat(m[1]) : 1; }

  function scramble(round) {
    all.forEach((s, idx) => {
      const final = s.dataset.c;
      const start = performance.now() + idx * 35;
      const dur = 500 + idx * 25;
      s.classList.add("scr");
      // Jaminan: huruf sentiasa kembali ke asal walaupun animasi frame tersekat
      setTimeout(() => { s.textContent = final; s.classList.remove("scr"); }, idx * 35 + dur + 80);
      (function step(now) {
        const t = now - start;
        if (t < 0) return requestAnimationFrame(step);
        if (t >= dur) return;
        s.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        requestAnimationFrame(step);
      })(performance.now());
    });
  }

  setTimeout(lock, 2600);                       // selepas animasi masuk selesai
  setTimeout(() => { scramble(); setInterval(scramble, 22000); }, 4500);
})();
