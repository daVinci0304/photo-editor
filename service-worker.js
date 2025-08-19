// 서비스 워커 시작 시 즉시 활성화
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // 공유 타겟 POST 요청을 가로챕니다.
  if (event.request.method === 'POST' && event.request.url.includes('index.html')) {
    event.respondWith(Response.redirect('./')); // 앱의 메인 페이지로 리다이렉트

    // waitUntil을 사용하여 서비스 워커가 종료되기 전에 비동기 작업을 완료합니다.
    event.waitUntil(async function () {
      const formData = await event.request.formData();
      const file = formData.get('image'); // 'manifest.json'에서 지정한 name 'image'
      const clients = await self.clients.matchAll();
      
      // 열려있는 모든 클라이언트(앱 창)에 파일을 보냅니다.
      if (clients && clients.length) {
        clients[0].postMessage({ file: file });
      }
    }());
    return;
  }

  // 일반적인 요청은 캐시 또는 네트워크에서 응답합니다.
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
