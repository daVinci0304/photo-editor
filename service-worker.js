const SHARED_CACHE_NAME = 'shared-image-cache-v1';
const SHARED_IMAGE_KEY = 'shared-image';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // 공유 전용 주소(share-target.html)로 오는 POST 요청만 감시합니다.
  if (event.request.method === 'POST' && event.request.url.includes('share-target.html')) {
    event.respondWith(Response.redirect('./', 303));

    event.waitUntil(async function () {
      const formData = await event.request.formData();
      const file = formData.get('image');
      if (!file) return;

      const cache = await caches.open(SHARED_CACHE_NAME);
      const response = new Response(file);
      await cache.put(SHARED_IMAGE_KEY, response);
    }());
    return;
  }

  // 그 외의 경우는 캐시 우선 전략을 사용합니다.
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
