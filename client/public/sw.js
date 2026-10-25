/* Bismillah Chicken Center — service worker.
   - Offline: keeps a copy of the website so it opens without internet
     (data comes from the app's own saved copies; saving needs internet).
   - Push: shows alerts from the server even when the website is closed,
     with sound, and opens the right page when one is tapped. */

const CACHE = 'bcc-shell-v2';
const SHELL = ['/', '/index.html', '/logo.png', '/icon-192.png', '/favicon-32.png', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('bcc-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // API, fonts: handled by the page

  // Pages: always try the network first so a new deploy shows up at once;
  // fall back to the saved copy when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put('/index.html', fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match('/index.html')) || (await cache.match('/')) || Response.error();
        }
      })()
    );
    return;
  }

  // Built files have a content hash in their name, so a saved copy is
  // always correct: serve from cache, fetch and save on first use.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      })()
    );
    return;
  }

  // Other files (logo, icons): show the saved copy, refresh it in the background.
  if (/\.(png|ico|svg|webp|jpg|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(request);
        const network = fetch(request)
          .then((fresh) => {
            if (fresh.ok) cache.put(request, fresh.clone());
            return fresh;
          })
          .catch(() => hit);
        return hit || network;
      })()
    );
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Bismillah Chicken Center', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Bismillah Chicken Center';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    tag: data.tag || data.type || 'bcc',
    renotify: true,
    silent: false, // play the device's notification sound
    requireInteraction: false,
    data: { link: data.link || '/' },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      // Let open tabs refresh their bell (and play the in-app chime).
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((c) => c.postMessage({ type: 'bcc-notification' }));
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.link || '/', self.location.origin).href;

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();
          if ('navigate' in client) return client.navigate(target);
          return undefined;
        }
      }
      return self.clients.openWindow(target);
    })()
  );
});
