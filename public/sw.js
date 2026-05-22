const CACHE_PREFIX = "momo-moon-forest";
const CACHE_NAME = `${CACHE_PREFIX}-v20260522-pwa-6`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/apple-touch-icon-moon-v4.png",
  "./icons/icon-192.png",
  "./icons/icon-192-moon-v4.png",
  "./icons/icon-512.png",
  "./icons/icon-512-moon-v4.png",
  "./icons/maskable-512.png",
  "./icons/maskable-512-moon-v4.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) return caches.match(fallbackUrl);
    throw new Error("Network unavailable and no cache match.");
  }
}

function isStaticAsset(url) {
  return /\.(?:css|js|png|jpg|jpeg|webp|gif|svg|woff2?|otf|ttf|json|webmanifest|txt)$/i.test(url.pathname);
}
