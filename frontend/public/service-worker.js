// Minimal Service Worker - Non-aggressive caching
const CACHE_NAME = 'tea-hack-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/LOGO1.png'
];

// Install event - cache only essential static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first strategy (no interference with API calls)
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip API calls to Render backend - always go to network
    if (request.url.includes('/api/') || request.url.includes('render.com')) {
        return;
    }

    // Network first, fallback to cache for static assets only
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone response before caching
                const responseToCache = response.clone();

                // Only cache successful responses for static assets
                if (response.status === 200 && request.url.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff|woff2)$/)) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }

                return response;
            })
            .catch(() => {
                // Only return from cache if network fails
                return caches.match(request);
            })
    );
});
