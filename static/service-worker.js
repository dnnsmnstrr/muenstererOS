self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	clients.claim();
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	// Skip interception for API calls or other origins
	if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
		return;
	}

	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				return response || fetch(event.request);
			})
			.catch(() => {
				// Fallback to network if cache match fails or network fetch fails
				return fetch(event.request);
			})
	);
});
