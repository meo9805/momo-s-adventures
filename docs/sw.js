const CACHE_PREFIX = "momo-moon-forest";
const CACHE_NAME = `${CACHE_PREFIX}-v20260522-pwa-3`;

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./assets/kenney-tiny-town/License.txt",
  "./assets/kenney-tiny-town/tilemap_packed.png",
  "./fonts/fusion-pixel/LICENSE-OFL.txt",
  "./fonts/fusion-pixel/fusion-pixel-12px-proportional-latin.otf.woff2",
  "./fonts/fusion-pixel/fusion-pixel-12px-proportional-zh_hans.otf.woff2",
  "./images/recraft/animal-cat-xiaomi.png",
  "./images/recraft/animal-cat-xiaoxiaomi.png",
  "./images/recraft/animal-glider-meimei.png",
  "./images/recraft/animal-glider-zizi.png",
  "./images/recraft/animal-nico.png",
  "./images/recraft/animal-pigeon-1.png",
  "./images/recraft/animal-pigeon-2.png",
  "./images/recraft/animal-pigeon-3.png",
  "./images/recraft/animal-pigeon-4.png",
  "./images/recraft/animal-pigeon-5.png",
  "./images/recraft/animal-pigeon-6.png",
  "./images/recraft/animal-pigeon-7.png",
  "./images/recraft/animal-rabbit-dudu.png",
  "./images/recraft/animal-rabbit-tutu.png",
  "./images/recraft/moon-forest-shell.png",
  "./images/recraft/prop-carrot-lantern.png",
  "./images/recraft/prop-envelope.png",
  "./images/recraft/prop-final-moon.png",
  "./images/recraft/prop-moon-shard.png",
  "./images/recraft/prop-open-letter.png",
  "./images/recraft/prop-photo-folder-nico.png",
  "./images/recraft/prop-photo-folder-xiaomi.png",
  "./images/recraft/prop-photo-folder-xiaoxiaomi.png",
  "./images/recraft/prop-photo-folder.png",
  "./photos/README.md"
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
