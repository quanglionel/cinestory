const CACHE_NAME = 'cinestory-cache-v3';
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

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Sử dụng addAll nhưng bọc trong Promise.all để tránh 1 file lỗi làm hỏng cả cache
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => cache.add(url))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Sửa lỗi redirect mode: Nếu response bị redirect, tạo một response mới từ blob
                if (networkResponse.redirected) {
                    return networkResponse.blob().then(blob => {
                        return new Response(blob, {
                            headers: networkResponse.headers,
                            status: networkResponse.status,
                            statusText: networkResponse.statusText
                        });
                    });
                }
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
