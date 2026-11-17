/**
 * Backend kehadiran BKPO KKM 2026 (Google Apps Script).
 * Tampal dalam projek Apps Script yang diikat pada Google Sheet. Lihat PANDUAN.md.
 */
const TZ = "Asia/Kuala_Lumpur";
const SLOT = 30;   // saat setiap token QR
const GRACE = 6;   // token masih sah 6 slot (3 minit) selepas dijana
const HARI = { "2026-11-18": 18, "2026-11-19": 19, "2026-11-20": 20 };

function P_() { return PropertiesService.getScriptProperties(); }
function secret_() {
  let s = P_().getProperty("SECRET");
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); P_().setProperty("SECRET", s); }
  return s;
}
function today_() {
  const o = P_().getProperty("DAY_OVERRIDE");           // untuk ujian sahaja
  if (o) return Number(o);
  return HARI[Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd")] || 0;
}
function slot_() { return Math.floor(Date.now() / 1000 / SLOT); }
function tokenFor_(day, slot) {
  const sig = Utilities.computeHmacSha256Signature(day + ":" + slot, secret_());
  return Utilities.base64EncodeWebSafe(sig).replace(/=/g, "").slice(0, 10);
}
function validToken_(day, t) {
  const now = slot_();
  for (let i = 0; i <= GRACE; i++) if (tokenFor_(day, now - i) === t) return true;
  return false;
}
function isAdmin_(key) {
  const k = P_().getProperty("ADMIN_KEY");
  return !!k && key === k;
}
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Rekod");
  if (!sh) { sh = ss.insertSheet("Rekod"); sh.appendRow(["Masa", "Hari", "ID", "Nama", "Organisasi"]); sh.setFrozenRows(1); }
  return sh;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = e.parameter || {};
  try {
    const day = today_();
    if (p.action === "token") {
      if (!isAdmin_(p.key)) return out_({ ok: false, err: "key" });
      if (!day) return out_({ ok: false, err: "bukan_hari_bengkel" });
      const ttl = SLOT - ((Date.now() / 1000) % SLOT);
      return out_({ ok: true, day: day, token: tokenFor_(day, slot_()), ttl: ttl });
    }
    if (p.action === "today") {
      return out_({ ok: true, day: day, ids: day ? recs_().filter(r => r.h === day).map(r => r.id) : [] });
    }
    if (p.action === "list") {
      if (!isAdmin_(p.key)) return out_({ ok: false, err: "key" });
      return out_({ ok: true, day: day, rec: recs_() });
    }
    if (p.action === "checkin") {
      if (!day) return out_({ ok: false, err: "bukan_hari_bengkel" });
      if (!/^P\d{2,3}$/.test(p.id || "")) return out_({ ok: false, err: "id" });
      if (!validToken_(day, p.t || "")) return out_({ ok: false, err: "token" });
      const lock = LockService.getScriptLock();
      lock.waitLock(10000);
      try {
        const old = recs_().find(r => r.h === day && r.id === p.id);
        if (old) return out_({ ok: true, already: true, day: day, masa: old.m });
        const masa = Utilities.formatDate(new Date(), TZ, "HH:mm");
        sheet_().appendRow([new Date(), day, p.id, String(p.nama || "").slice(0, 120), String(p.org || "").slice(0, 160)]);
        return out_({ ok: true, day: day, masa: masa });
      } finally { lock.releaseLock(); }
    }
    return out_({ ok: false, err: "action" });
  } catch (err) {
    return out_({ ok: false, err: String(err) });
  }
}

function recs_() {
  const v = sheet_().getDataRange().getValues();
  const r = [];
  for (let i = 1; i < v.length; i++) {
    r.push({ h: Number(v[i][1]), id: String(v[i][2]), m: Utilities.formatDate(new Date(v[i][0]), TZ, "HH:mm") });
  }
  return r;
}

/** Jalankan SEKALI dari editor untuk menetapkan kunci admin. */
function setAdminKey() {
  P_().setProperty("ADMIN_KEY", "UBAH-KATA-LALUAN-INI");   // <- tukar sebelum jalankan
}
