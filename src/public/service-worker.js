const CACHE_NAME = 'brewly-cache-v1';
const PRECACHE_URLS = [
    '/',                          // HTML shell
    '/styles.css',                // CSS
    '/manifest.json',             // PWA manifest
    '/offline',                   // HBS‐rendered offline page
    // icons
    '/icons/favicon-16x16.png',
    '/icons/favicon-32x32.png',
    '/icons/apple-touch-icon.png',
    '/icons/android-chrome-192x192.png',
    '/icons/android-chrome-512x512.png'
];

// Install: cache the application shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: serve from cache → network → offline HBS route
self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(resp => {
                    const copy = resp.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    return resp;
                })
                .catch(() =>
                    caches.match(request)
                        .then(cached => cached || fetch('/offline'))
                )
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cached =>
            cached || fetch(request).then(resp => resp)
        )
    );
});