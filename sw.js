const CACHE = 'triply-v3';

// Alleen HTML en JS cachen, niet .shortcut of andere bestanden
const CACHEABLE = /\.(html|js|css|svg|json|png|ico|woff2?)$/;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  const url = new URL(e.request.url);

  // API routes nooit cachen
  if (url.pathname.startsWith('/api/')) return;

  e.respondWith(
    fetch(e.request)
      .then(r => {
        // Alleen succesvolle cacheable responses opslaan
        if (r.ok && CACHEABLE.test(url.pathname)) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return r;
      })
      .catch(() =>
        // Alleen terugvallen op cache bij echte netwerkfout (offline)
        caches.match(e.request).then(cached =>
          cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
        )
      )
  );
});
