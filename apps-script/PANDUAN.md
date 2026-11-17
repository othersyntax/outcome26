# Panduan pemasangan (±10 minit, percuma)

1. Buka Google Sheets baharu, namakan "Rekod Kehadiran BKPO".
2. Menu **Extensions > Apps Script**. Padam kod asal, tampal isi `Code.gs`.
3. Dalam `setAdminKey()`, tukar `UBAH-KATA-LALUAN-INI` kepada kata laluan anda. Pilih fungsi `setAdminKey` dan tekan **Run** (beri kebenaran bila diminta).
4. **Deploy > New deployment > Web app**. Execute as: **Me**. Who has access: **Anyone**. Salin URL yang berakhir `/exec`.
5. Dalam `laman/js/config.js`, letak URL itu pada `API_URL`.
6. Letak folder `laman/` di hosting statik (GitHub Pages, Netlify atau Cloudflare Pages) supaya telefon peserta boleh buka. Letak alamatnya pada `BASE_URL`.
7. Buka `papan.html`, masukkan kata laluan admin. QR akan muncul.

## Ujian sebelum 18hb
Server hanya menerima kehadiran pada 18, 19 dan 20 Nov 2026 (waktu Malaysia). Untuk uji lebih awal, tambah Script Property `DAY_OVERRIDE` = `18` (Project Settings > Script properties). **Padam sebelum hari bengkel**, dan kosongkan sheet `Rekod` selepas ujian.

## Selepas ubah Code.gs
Pilih **Deploy > Manage deployments > Edit > New version**, supaya URL kekal sama.
