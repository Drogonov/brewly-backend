const CACHE_NAME = 'brewly-static-v2';
const PRECACHE_URLS = [
    '/',
    '/manifest.json',
    '/offline',
    '/icons/favicon-16x16.png',
    '/icons/favicon-32x32.png',
    '/icons/apple-touch-icon.png',
    '/icons/android-chrome-192x192.png',
    '/icons/android-chrome-512x512.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const req = e.request;

    // Navigation: try network first, fallback to cache/offline
    if (req.mode === 'navigate') {
        e.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(req, copy));
                    return res;
                })
                .catch(() =>
                    caches.match(req).then(match => match || caches.match('/offline'))
                )
        );
        return;
    }

    // CSS: network-first so updates get pulled
    if (req.destination === 'style') {
        e.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    // Everything else: cache-first
    e.respondWith(
        caches.match(req).then(match => match || fetch(req))
    );
});