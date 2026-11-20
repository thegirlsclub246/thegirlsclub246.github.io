/* Shop Bajan: add to home screen.
   Registers the always-fresh service worker and shows a small, dismissible "Add to home screen" bar. */
(function () {
  "use strict";
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
  }
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone;
  if (standalone) return;
  var KEY = "sb-a2hs-off";
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}
  if (/\/vendors(\.html)?$/.test(location.pathname)) return; /* keep the vendor portal clean */

  var ua = navigator.userAgent || "";
  var isIOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  var deferred = null;

  var css = ".sba2hs{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 10px);transform:translate(-50%,-160%);z-index:90;display:flex;align-items:center;gap:10px;width:min(440px,calc(100vw - 24px));background:#00267F;color:#fff;border-radius:18px;padding:10px 12px;box-shadow:0 10px 26px rgba(0,20,71,.3);font:600 14px/1.35 Quicksand,'Segoe UI',system-ui,sans-serif;transition:transform .3s}" +
    ".sba2hs.on{transform:translate(-50%,0)}" +
    ".sba2hs img{width:40px;height:40px;border-radius:10px;flex:none}" +
    ".sba2hs b{display:block;font-weight:800}" +
    ".sba2hs .t{flex:1;min-width:0}" +
    ".sba2hs .go{flex:none;min-height:40px;padding:0 14px;border-radius:999px;border:2px solid #FFC72C;background:#FFC72C;color:#00267F;font:800 14px Quicksand,system-ui,sans-serif;cursor:pointer}" +
    ".sba2hs .x{flex:none;width:34px;height:34px;border:0;background:none;color:#fff;font-size:20px;cursor:pointer;border-radius:50%}" +
    "@media(prefers-reduced-motion:reduce){.sba2hs{transition:none}}@media(min-width:900px){.sba2hs{display:none}}";

  function show(text, withButton) {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var bar = document.createElement("div"); bar.className = "sba2hs"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-label", "Add Shop Bajan to your home screen");
    bar.innerHTML = '<img src="/icon-192.png" alt=""><span class="t"><b>Add Shop Bajan to your home screen</b>' + text + '</span>' +
      (withButton ? '<button type="button" class="go">Add</button>' : '') + '<button type="button" class="x" aria-label="Not now">&times;</button>';
    document.body.appendChild(bar);
    function close() { bar.classList.remove("on"); try { localStorage.setItem(KEY, "1"); } catch (e) {} }
    bar.querySelector(".x").addEventListener("click", close);
    var go = bar.querySelector(".go");
    if (go) go.addEventListener("click", function () {
      if (!deferred) return close();
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; close(); });
    });
    setTimeout(function () { bar.classList.add("on"); }, 4000);
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferred = e;
    show("One tap to open it like an app.", true);
  });
  if (isIOS) {
    window.addEventListener("load", function () { show('Tap <b style="display:inline">Share</b> then <b style="display:inline">Add to Home Screen</b>.', false); });
  }
})();
