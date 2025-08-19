self.addEventListener('install', () => {
  self.skipWaiting();
});

// 이 함수는 열려있는 모든 앱 창을 찾아서 파일을 보내주는 역할을 합니다.
async function sendFileToClients(file) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });
  if (clients && clients.length) {
    clients.forEach(client => {
      client.postMessage({ file: file });
    });
  }
}

self.addEventListener('fetch', (event) => {
  // 공유를 통해 POST 요청이 들어오면 가로챕니다.
  if (event.request.method === 'POST' && event.request.url.includes('index.html')) {
    event.respondWith(Response.redirect('./'));

    // 파일 처리가 끝날 때까지 서비스 워커가 종료되지 않도록 합니다.
    event.waitUntil(async function () {
      const formData = await event.request.formData();
      const file = formData.get('image');
      await sendFileToClients(file); // 파일을 받으면 즉시 앱으로 전달
    }());
    return;
  }

  // 그 외의 경우는 캐시에서 파일을 찾거나 네트워크 요청을 보냅니다.
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
