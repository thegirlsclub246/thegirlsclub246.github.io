/* Shop Bajan home-screen app.
   Always asks the website for the newest version first, so every site update shows straight away.
   A saved copy is only used when the phone is offline. */
var CACHE = "shopbajan-v1";

self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  var url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return; /* payments, sign-ins, data: untouched */
  if (url.pathname.indexOf("/brain-basket/") === 0 || url.pathname.indexOf("/admin") === 0) return;
  e.respondWith(
    fetch(req, { cache: url.pathname.indexOf("/vendor/") > -1 ? "default" : "no-store" }).then(function (res) {
      if (res && res.ok && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (req.mode !== "navigate") return Response.error();
        return caches.match("/").then(function (home) { return home || Response.error(); });
      });
    })
  );
});
