const SHARED_CACHE_NAME = 'shared-image-cache-v1';
const SHARED_IMAGE_KEY = 'shared-image';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // --- 공유 타겟 로직 ---
  if (event.request.method === 'POST' && event.request.url.includes('index.html')) {
    event.respondWith(Response.redirect('./', 303)); // POST 리다이렉션을 위한 표준 응답

    event.waitUntil(async function () {
      const formData = await event.request.formData();
      const file = formData.get('image');
      if (!file) return;

      // 공유된 파일을 '보관함(Cache)'에 저장합니다.
      const cache = await caches.open(SHARED_CACHE_NAME);
      const response = new Response(file); // 파일을 Response 객체로 감싸서 저장
      await cache.put(SHARED_IMAGE_KEY, response);
    }());
    return;
  }

  // --- 일반 오프라인 로직 ---
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
