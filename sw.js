const CACHE = 'triply-v2';

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

  // Alleen same-origin requests cachen, CDN requests direct doorlaten
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(cached =>
        cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
      ))
  );
});
