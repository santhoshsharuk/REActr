const CACHE_NAME = 'billing-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo192.png',
    '/logo512.png',
    '/static/js/main.b0a94c64.js', // ✅ Your React app JS
    '/static/css/main.[your-css-file].css' // ✅ Add your CSS file too
];



// Install event: cache app shell
self.addEventListener('install', event => {
    console.log('[Service Worker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event: clean old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                          .map(name => caches.delete(name))
            );
        })
    );
});

// Fetch event: respond with cache first, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Cache hit - return the response
                    return response;
                }
                // Cache miss - fetch from network
                return fetch(event.request).then(networkResponse => {
                    // Optional: cache the new file dynamically here if needed
                    return networkResponse;
                });
            }).catch(() => {
                // Optional: fallback page for offline (if needed)
                // return caches.match('/offline.html');
            })
    );
});
