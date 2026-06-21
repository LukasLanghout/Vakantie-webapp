const CACHE = 'triply-v1';

self.addEventListener('install', e => {
  console.log('SW: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('SW: Activating...');
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(cached => cached || new Response('Offline', { status: 503 })))
  );
});
