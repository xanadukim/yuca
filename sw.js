// sw.js - YUCA v8.7.1 Service Worker (Network-first, offline fallback)
const CACHE = 'yuca-v8.7.1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/mascot.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // same-origin GET만 처리 (Firebase/gstatic 등 외부 요청은 통과)
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
