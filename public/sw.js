const CACHE = "sequence-v1";

// Cache only static shell assets on install
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE).then((cache) =>
			cache.addAll(["/", "/manifest.json", "/icon-192.png", "/icon-512.png"])
		)
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	// Remove old caches
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
		)
	);
	self.clients.claim();
});

// Network-first: always try the network, fall back to cache
// Socket.io and API traffic is never cached
self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	// Skip non-GET and cross-origin requests (socket server, etc.)
	if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

	event.respondWith(
		fetch(event.request)
			.then((res) => {
				const copy = res.clone();
				caches.open(CACHE).then((cache) => cache.put(event.request, copy));
				return res;
			})
			.catch(() => caches.match(event.request))
	);
});
