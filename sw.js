const CACHE_NAME = 'planner-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com'
];

// 安裝 Service Worker 並快取基礎資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 啟動時清理舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 攔截請求：先讀取快取，失敗則發送網路請求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // 只快取同源或必要的第三方資源
          if (event.request.url.startsWith(self.location.origin) || event.request.url.includes('lucide')) {
             cache.put(event.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // 離線且無快取時的備案
      return caches.match('./index.html');
    })
  );
});
