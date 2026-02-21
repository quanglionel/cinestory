const CACHE_NAME = 'cinestory-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/comic.html',
    '/pages/anime.html',
    '/pages/comic-detail.html',
    '/pages/anime-detail.html',
    '/pages/read.html',
    '/pages/watch.html',
    '/assets/css/styles.css',
    '/assets/css/modules/global.css',
    '/assets/css/modules/header.css',
    '/assets/css/modules/hero.css',
    '/assets/css/modules/components.css',
    '/assets/css/modules/responsive.css',
    '/assets/js/main.js',
    '/assets/js/detail.js',
    '/assets/js/anime-detail.js',
    '/assets/js/reader.js',
    '/assets/js/watch.js',
    '/assets/js/modules/config.js',
    '/assets/js/modules/storage.js',
    '/assets/js/modules/content.js',
    '/assets/js/modules/renderer.js',
    '/assets/js/modules/search.js',
    '/assets/js/modules/mode.js',
    '/assets/js/modules/pwa.js',
    '/assets/js/modules/utils.js'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Cleaning old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Bỏ qua các yêu cầu không phải GET hoặc API (để server xử lý cache API riêng)
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Cache các file tĩnh mới nếu cần (nhưng ở đây đã liệt kê đủ ASSETS_TO_CACHE)
                return networkResponse;
            }).catch(() => {
                // Fallback cho navigation nếu mất mạng
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
