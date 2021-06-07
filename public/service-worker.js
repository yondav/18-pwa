const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/styles.css',
  '/index.js',
  '/db.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// install
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Success - Files pre-cached');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('Removing old cache data', key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// fetch
self.addEventListener('fetch', (evt) => {
  if (evt.request.url.includes('/api/transaction ')) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(async (cache) => {
          try {
            const response = await fetch(evt.request);
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          } catch (err) {
            return await cache.match(evt.request);
          }
        })
        .catch((err) => console.log(err))
    );

    return;
  }

  evt.respondWith(caches.match(evt.request).then((response) => response || fetch(evt.request)));
});
