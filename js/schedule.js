/* ==========================================================
   DATA ATUR CARA - BKPO KKM 2026
   Semua masa ialah waktu Malaysia (+08:00).
   Ubah fail ini sahaja jika atur cara berubah.
   type: session | group | break | admin | share | present | close
   ========================================================== */

const EVENT = {
  title1: "BENGKEL KAJIAN PENILAIAN",
  title1Em: "OUTCOME",
  title2: "KEMENTERIAN KESIHATAN MALAYSIA TAHUN 2026",
  dateText: "18 - 20 NOVEMBER 2026 (RABU - JUMAAT)",
  venue: "CONCORDE HOTEL, SHAH ALAM",
  org: "KEMENTERIAN KESIHATAN MALAYSIA",
  shortName: "BKPO KKM 2026",
};

const DAYS = [
  { day: 1, date: "2026-11-18", label: "HARI 1", name: "RABU", display: "18 NOVEMBER 2026" },
  { day: 2, date: "2026-11-19", label: "HARI 2", name: "KHAMIS", display: "19 NOVEMBER 2026" },
  { day: 3, date: "2026-11-20", label: "HARI 3", name: "JUMAAT", display: "20 NOVEMBER 2026" },
];

const SPEAKER = "Puan Atikah binti Mohamad Sahar";

// Pembantu: s("2026-11-18","14:00") -> Date
const at = (d, t) => new Date(`${d}T${t}:00+08:00`);

function item(day, from, to, type, tag, title, extra = {}) {
  const d = DAYS[day - 1].date;
  return { day, start: at(d, from), end: at(d, to), type, tag, title, ...extra };
}

const SCHEDULE = [
  // ---------- 18 NOVEMBER 2026 (RABU) ----------
  item(1, "14:00", "17:00", "admin", "PENDAFTARAN",
       "Daftar Masuk Penginapan & Taklimat Pentadbiran Bengkel"),
  item(1, "18:30", "20:30", "break", "REHAT", "Rehat dan Makan Malam"),
  item(1, "20:30", "21:45", "session", "SESI 1",
       "Pengenalan kepada Kajian Penilaian Outcome dalam Projek Pembangunan KKM",
       { speaker: SPEAKER }),
  item(1, "21:45", "22:30", "session", "SESI 2",
       "Format Laporan Kajian Penilaian Outcome dan Skema Pemarkahan",
       { speaker: SPEAKER }),

  // ---------- 19 NOVEMBER 2026 (KHAMIS) ----------
  item(2, "07:00", "08:30", "break", "REHAT", "Sarapan Pagi"),
  item(2, "08:30", "09:30", "session", "SESI 3",
       "Pembentukan Kerangka Keberhasilan (Objektif Program/Projek, Strategic Framework dan Result Framework)",
       { speaker: SPEAKER }),
  item(2, "09:30", "10:15", "group", "KUMPULAN", "Perbincangan Dalam Kumpulan berkaitan Sesi 3"),
  item(2, "10:30", "11:00", "group", "KUMPULAN", "[Sambungan] Perbincangan Dalam Kumpulan berkaitan Sesi 3"),
  item(2, "11:00", "12:00", "session", "SESI 4",
       "Penyediaan Slaid Pembentangan Laporan Kajian Outcome",
       { speaker: SPEAKER }),
  item(2, "12:00", "14:45", "break", "REHAT", "Rehat dan Makan Tengah Hari"),
  item(2, "14:45", "15:45", "group", "KUMPULAN", "Perbincangan Dalam Kumpulan berkaitan Sesi 4"),
  item(2, "15:45", "16:00", "break", "X-BREAK", "X-Break"),
  item(2, "16:00", "17:30", "present", "PEMBENTANGAN",
       "Pembentangan Laporan Kajian Penilaian Outcome oleh setiap Pasukan Kajian",
       { speaker: SPEAKER }),
  item(2, "17:30", "20:30", "break", "REHAT", "Rehat dan Makan Malam"),
  item(2, "20:30", "22:30", "session", "SESI 5",
       "Pengenalan Modul Penilaian Outcome (MPO) di dalam Sistem MyProjek",
       { speaker: SPEAKER }),

  // ---------- 20 NOVEMBER 2026 (JUMAAT) ----------
  item(3, "07:00", "08:30", "break", "REHAT", "Sarapan Pagi"),
  item(3, "08:30", "09:30", "share", "PERKONGSIAN", "Sesi Perkongsian: Kajian Penilaian Outcome Terbaik Tahun 2025"),
  item(3, "09:30", "10:30", "share", "PERKONGSIAN", "Sesi Perkongsian: Kajian Penilaian Outcome KKM Tahun 2025"),
  item(3, "10:30", "11:00", "session", "RUMUSAN", "Rumusan Bengkel", { speaker: SPEAKER }),
  item(3, "11:00", "11:30", "admin", "PENILAIAN", "Penilaian Bengkel"),
  item(3, "11:30", "12:00", "close", "PENUTUPAN",
       "Majlis Penutupan Bengkel Kajian Penilaian Outcome KKM Tahun 2026 (BKPO KKM 2026)"),
  // Atur cara hanya menyatakan "12.00 tgh" sebagai permulaan. Waktu tamat 13:00 ialah andaian.
  item(3, "12:00", "13:00", "break", "REHAT", "Makan Tengah Hari dan Bersurai"),
];

// Mesej bergerak di bahagian bawah. Edit sesuka hati.
const TICKER = [
  "SELAMAT DATANG KE BENGKEL KAJIAN PENILAIAN OUTCOME KKM TAHUN 2026",
  "18 - 20 NOVEMBER 2026 (RABU - JUMAAT)",
  "CONCORDE HOTEL, SHAH ALAM",
  "SILA SENYAPKAN TELEFON BIMBIT SEMASA SESI BERLANGSUNG",
  "PENILAIAN BENGKEL PADA 20 NOVEMBER 2026, 11.00 PAGI",
  "UNIT PROGRAM STRATEGIK, BAHAGIAN PEMBANGUNAN, KKM",
];
