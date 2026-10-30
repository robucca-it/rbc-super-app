/* Service worker prototipe RBC Group: aplikasi tetap terbuka saat sinyal hilang.
   - Halaman: jaringan dulu, cadangan dari cache bila offline.
   - File sendiri (data.js, ikon, splash): tampilkan dari cache, perbarui di latar.
   - Skrip CDN & font (versinya tetap): cache dulu.
   Naikkan VERSION bila struktur cache berubah. */
const VERSION = 'v1';
const CACHE = `rbc-proto-${VERSION}`;
const SHELL = ['./', 'data.js', 'manifest.webmanifest', 'assets/icon-192.png', 'assets/apple-touch-icon.png'];
const CDN = /^https:\/\/(cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('rbc-proto-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const ok = (res) => res && (res.ok || res.type === 'opaque');
/** Salinan respons dibuat sebelum aslinya dibaca halaman. */
const save = (key, copy) => caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) save('./', res.clone());
          return res;
        })
        .catch(() => caches.match('./')),
    );
    return;
  }

  if (CDN.test(req.url)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (ok(res)) save(req, res.clone());
            return res;
          }),
      ),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => {
            if (res.ok) save(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || net;
      }),
    );
  }
});
