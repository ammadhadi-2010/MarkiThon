const CACHE_NAME = 'markithon-pwa-v2';
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/app',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/views/public/marketplace.html',
    '/views/public/css/mp-shell.css',
    '/views/public/js/mp-app.js',
    '/css/theme.css',
    '/js/offline-sync.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await Promise.all(CORE_ASSETS.map((url) => cache.add(url).catch(() => null)));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
        await self.clients.claim();
    })());
});

function isApiRequest(url) {
    return url.pathname.startsWith('/api/');
}

function isNavigation(request, url) {
    return request.mode === 'navigate'
        || url.pathname === '/'
        || url.pathname === '/app'
        || url.pathname.endsWith('.html');
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin || isApiRequest(url)) return;

    event.respondWith((async () => {
        if (isNavigation(request, url)) {
            try {
                const fresh = await fetch(request, { cache: 'no-store' });
                if (fresh.ok && url.pathname !== '/sw.js') {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, fresh.clone());
                }
                return fresh;
            } catch (error) {
                const cached = await caches.match(request)
                    || await caches.match('/')
                    || await caches.match('/views/public/marketplace.html')
                    || await caches.match('/app')
                    || await caches.match('/index.html');
                if (cached) return cached;
                throw error;
            }
        }

        const cached = await caches.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, fresh.clone());
        }
        return fresh;
    })());
});
