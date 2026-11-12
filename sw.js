/* Lalalık Paneli — Service Worker (v2)
   Tek dosyalık uygulama tüm içeriği kendi içinde taşır; bu SW çevrimdışı garantisi verir.
   Strateji: önce ağ (güncel sürüm), ağ yoksa önbellek. Böylece dosya güncellemeleri
   çevrimiçiyken anında görünür, çevrimdışıyken son sürüm çalışmaya devam eder. */
'use strict';

const CACHE = 'lalalik-v2';
const ASSETS = [
  './',
  './index.html',
  './LALALIK GEMİNİ Taşınabilir.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Önce ağ, ağa ulaşılamazsa önbellek; başarılı ağ yanıtları önbelleği tazeler. */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then((resp) => {
      if (resp && resp.ok) {
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return resp;
    }).catch(() =>
      caches.match(event.request, { ignoreSearch: true })
        .then((cached) => cached || caches.match('./index.html'))
    )
  );
});
