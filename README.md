# RBC Group Super App (prototipe)

Prototipe satu aplikasi pelanggan untuk **Robucca, Kalm dan Zumma**. Pelanggan cukup memasang satu aplikasi untuk memesan dari ketiga brand.

Ini **prototipe**, bukan aplikasi produksi. Tidak ada backend, login atau pembayaran sungguhan. Semua state hanya ada di browser.

## Membuka

Buka `index.html` di browser. `data.js` harus berada di folder yang sama. Prototipe ini paling pas dilihat di lebar HP (375–460px). Di desktop (≥1000px) ada panel "Coba alurnya" di sebelah kiri.

React 18.3.1 dan htm 3.1.1 dimuat dari CDN (cdnjs dan unpkg), jadi perlu koneksi internet.

## Pasang di HP

Situs publik: https://robucca-it.github.io/rbc-super-app/

Situs ini bisa dipasang ke layar utama HP seperti PWA robucca.id. Setelah dipasang, ia terbuka layar penuh dengan ikon dan splash RBC Group, dan tetap bisa dibuka saat sinyal hilang.

- **iPhone (Safari):** ketuk tombol Bagikan, lalu pilih **Tambah ke Layar Utama**.
- **Android (Chrome):** ketuk **Pasang** di kartu Beranda, atau buka menu ⋮ lalu pilih **Tambahkan ke layar utama**.

Isinya mengikuti PWA robucca.id (`apps/pwa/app/manifest.ts`, `public/sw.js`, layout `(app)`): `manifest.webmanifest`, `sw.js`, ikon dan splash di `assets/`, kelas `ios`/`standalone` untuk ruang aman layar, kartu "Pasang" di Beranda, dan baris "Pasang di layar utama" di Akun. Splash iPhone dibuat dari logo RBC di atas warna #152D22.

## Struktur

| Path | Isi |
|---|---|
| `src/styles/pwa.css`, `src/styles/extra.css` | Salinan CSS PWA Robucca (`apps/pwa/app/styles/` di repo robucca-coffee) |
| `src/template.html` | Kerangka halaman dan override tema per brand (`html[data-brand="kalm" \| "zumma"]`) |
| `src/icons.js` | Ikon SVG, disalin dari `Icon.tsx` PWA |
| `src/app.js` | Aplikasi (React + htm): Beranda, Menu, Keranjang, Bayar, Status, Reservasi, Pesanan, Akun |
| `data.js` | Menu dan foto (data URI) Robucca, Kalm, Zumma, serta logo RBC Group |
| `index.html` | Hasil rakitan. Jangan diedit langsung |
| `manifest.webmanifest`, `sw.js`, `assets/` | Pemasangan di HP: manifes, service worker offline, ikon dan splash |
| `docs/screenshots/` | Tangkapan layar v3 |

Setelah mengubah file di `src/`, rakit ulang dengan:

```bash
python3 build.py
```

## Konsep

- **Kerangka Robucca.** Kelas, tata letak dan tab bawah (Beranda, Menu, Reservasi, Pesanan, Akun) sama dengan PWA robucca.id.
- **Tema ikut brand.** Warna dan huruf berganti sesuai brand yang dipilih. Tokennya diambil dari tema POS Kalm dan Zumma.
- **Satu keranjang, sekali bayar.** Item dari ketiga brand masuk ke satu keranjang dan dibayar sekali lewat DOKU. Di checkout, pesanan dipecah per cabang, dan tiap cabang memberi kode ambilnya sendiri.
- **Lintas brand.** Pencarian, formulir reservasi, RBC Poin dan kode member berlaku untuk ketiga brand.

## Data

- Nama menu, harga, opsi dan foto memakai data asli:
  - Robucca: `packages/db/seed-data/menu-lama.js`.
  - Kalm dan Zumma: migrasi menu `20261029100000_menu_kalm` dan `20261029130000_menu_zumma`.
- Promo, poin, jarak, ongkir, nomor VA dan riwayat pesanan masih **contoh**. Data contoh ditandai label "contoh" di layar.
- Metode bayar yang tampil adalah yang sudah live di DOKU: VA BRI, BNI dan Mandiri. QRIS masih menunggu aktivasi.

## Keputusan yang masih terbuka

1. Ongkir untuk pesanan delivery dari beberapa cabang. Contoh di prototipe: Rp12.000 per cabang.
2. Aturan RBC Poin. Contoh di prototipe: 1 poin tiap Rp1.000, 1 poin = Rp10.
3. Domain: tetap robucca.id atau memakai domain RBC Group.
