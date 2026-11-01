/* Formkurve – Service Worker
   Offline zuerst: Alle Dateien liegen im Cache und werden sofort ausgeliefert.
   Im Hintergrund wird geprüft, ob es eine neuere Version gibt (stale-while-revalidate);
   die neue Version ist dann beim nächsten Öffnen aktiv.
   Bei Änderungen an der App: VERSION erhöhen. */
const VERSION = 'formkurve-1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/favicon-32.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('formkurve-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function revalidate(request, cacheKey) {
  return fetch(request, { cache: 'no-cache' }).then(response => {
    if (response && response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(VERSION).then(cache => cache.put(cacheKey || request, copy));
    }
    return response;
  });
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Seitenaufrufe (auch mit ?param) → immer die App-Shell
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => {
        const network = revalidate(request, './index.html');
        if (cached) { event.waitUntil(network.catch(() => {})); return cached; }
        return network.catch(() => caches.match('./'));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cached => {
      const network = revalidate(request);
      if (cached) { event.waitUntil(network.catch(() => {})); return cached; }
      return network;
    })
  );
});
