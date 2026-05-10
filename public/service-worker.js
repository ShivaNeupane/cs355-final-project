const CACHE_NAME = "expense-sharing-app";

const FILES_TO_CACHE = [
  "/",
  "/pages/login.html",
  "/pages/register.html",
  "/pages/dashboard.html",
  "/pages/group.html",
  "/css/style.css",
  "/js/auth.js",
  "/js/dashboard.js",
  "/js/group.js",
  "/manifest.json"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});