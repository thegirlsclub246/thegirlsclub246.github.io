/* Shop Bajan apps (Hustle Kit, Hustle Cut, DepositProof): home screen + always up to date.
   Use:  <script src="/app-pwa.js" data-name="Hustle Cut" data-icon="icons/icon-192.png" defer></script>
   data-bar="off" hides the "Add to home screen" bar (Hustle Kit has its own guide).

   1. Registers the site's service worker (/sw.js). It always asks the website first,
      so every site update shows straight away, and only uses saved copies when offline.
   2. On the home screen, phones resume the old page instead of reloading it. Each time the
      app comes back on screen we check the page and its own files; if anything changed,
      the app reloads itself (never while someone is typing). */
(function () {
  "use strict";
  var me = document.currentScript || {};
  var NAME = (me.dataset && me.dataset.name) || "this app";
  var ICON = (me.dataset && me.dataset.icon) || "/icon-192.png";
  var BAR = !(me.dataset && me.dataset.bar === "off");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  if (standalone) { keepFresh(); return; }
  if (BAR) installBar();

  function keepFresh() {
    var base = null, busy = false;
    function files() {
      var list = [location.pathname + location.search];
      document.querySelectorAll("script[src],link[rel=stylesheet][href]").forEach(function (el) {
        try { var u = new URL(el.src || el.href, location.href); if (u.origin === location.origin) list.push(u.pathname + u.search); } catch (e) {}
      });
      return list;
    }
    function sig(t) { var h = 0; for (var i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) | 0; } return t.length + ":" + h; }
    function text(u) { return fetch(u, { cache: "no-store", credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : ""; }).catch(function () { return null; }); }
    function get() {
      return Promise.all(files().map(text)).then(function (a) {
        if (a.some(function (t) { return t === null; })) return null; /* offline: don't compare */
        return sig(a.join("\u0000"));
      });
    }
    function typing() { var a = document.activeElement; return !!a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); }
    function check() {
      if (busy || document.visibilityState !== "visible") return;
      busy = true;
      try { navigator.serviceWorker && navigator.serviceWorker.getRegistration().then(function (r) { r && r.update(); }); } catch (e) {}
      get().then(function (now) {
        busy = false;
        if (!now) return;
        if (base === null) { base = now; return; }
        if (now !== base && !typing()) location.reload();
      });
    }
    window.addEventListener("load", function () { get().then(function (s) { if (base === null) base = s; }); });
    document.addEventListener("visibilitychange", check);
    window.addEventListener("pageshow", function (e) { if (e.persisted) check(); });
    window.addEventListener("focus", check);
  }

  function installBar() {
    var KEY = "sb-a2hs-off:" + location.pathname.split("/")[1];
    try { if (localStorage.getItem(KEY)) return; } catch (e) {}
    var ua = navigator.userAgent || "";
    var isIOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    var deferred = null, shown = false;
    var css = ".sba2hs{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);transform:translate(-50%,180%);z-index:2147483000;display:flex;align-items:center;gap:10px;width:min(440px,calc(100vw - 24px));background:#00267F;color:#fff;border-radius:18px;padding:10px 12px;box-shadow:0 10px 26px rgba(0,20,71,.3);font:600 14px/1.35 Quicksand,'Segoe UI',system-ui,sans-serif;transition:transform .3s}" +
      ".sba2hs.on{transform:translate(-50%,0)}" +
      ".sba2hs img{width:40px;height:40px;border-radius:10px;flex:none}" +
      ".sba2hs b{display:block;font-weight:800}" +
      ".sba2hs .t{flex:1;min-width:0}" +
      ".sba2hs .go{flex:none;min-height:40px;padding:0 14px;border-radius:999px;border:2px solid #FFC72C;background:#FFC72C;color:#00267F;font:800 14px Quicksand,system-ui,sans-serif;cursor:pointer}" +
      ".sba2hs .x{flex:none;width:34px;height:34px;border:0;background:none;color:#fff;font-size:20px;cursor:pointer;border-radius:50%}" +
      "@media(prefers-reduced-motion:reduce){.sba2hs{transition:none}}@media(min-width:900px){.sba2hs{display:none}}";
    function show(text, withButton) {
      if (shown) return; shown = true;
      var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
      var bar = document.createElement("div"); bar.className = "sba2hs"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-label", "Add " + NAME + " to your home screen");
      bar.innerHTML = '<img src="' + ICON + '" alt=""><span class="t"><b></b>' + text + '</span>' +
        (withButton ? '<button type="button" class="go">Add</button>' : '') + '<button type="button" class="x" aria-label="Not now">&times;</button>';
      bar.querySelector("b").textContent = "Add " + NAME + " to your home screen";
      document.body.appendChild(bar);
      function close() { bar.classList.remove("on"); try { localStorage.setItem(KEY, "1"); } catch (e) {} }
      bar.querySelector(".x").addEventListener("click", close);
      var go = bar.querySelector(".go");
      if (go) go.addEventListener("click", function () {
        if (!deferred) return close();
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; close(); });
      });
      setTimeout(function () { bar.classList.add("on"); }, 6000);
    }
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; show("One tap to open it like an app.", true); });
    if (isIOS) window.addEventListener("load", function () { show('Tap <b style="display:inline">Share</b> then <b style="display:inline">Add to Home Screen</b>.', false); });
  }
})();
