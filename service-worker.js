let sharedFile = null;

// 앱(클라이언트)이 준비되었다고 메시지를 보내면, 보관중인 파일을 전달합니다.
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'get-shared-file') {
    if (sharedFile) {
      event.source.postMessage({ file: sharedFile });
      sharedFile = null; // 전달 후에는 비워줍니다.
    }
  }
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // 공유를 통해 앱이 실행되었을 때 POST 요청을 가로챕니다.
  if (event.request.method === 'POST' && event.request.url.includes('index.html')) {
    event.respondWith(Response.redirect('./')); // 앱 메인 페이지로 이동시키고,

    // 파일 처리가 끝날 때까지 서비스워커가 종료되지 않도록 합니다.
    event.waitUntil(async function () {
      const formData = await event.request.formData();
      sharedFile = formData.get('image'); // 파일을 변수에 임시 저장합니다.
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
