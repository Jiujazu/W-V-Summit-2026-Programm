var CACHE = "wuv26-v6";
var ASSETS = ["/", "/index.html", "/music01.mp3", "/nyan-cat.gif"];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e) {
  // Only cache GET requests
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.type === "basic") {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          }).catch(function() { /* quota exceeded — ignore */ });
        }
        return response;
      }).catch(function() {
        // Only serve index.html fallback for navigation requests (not images/audio)
        if (e.request.mode === "navigate") return caches.match("/index.html");
      });
    })
  );
});
