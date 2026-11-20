/* Shop Bajan: puts the words and photos you change in the editor (Pages CMS) onto the page.
   Your edits live in /content/pages/<page>.json. Each editable item on the page has
   data-sb="t12:abcd1234": its name, then a fingerprint of the words written in the page.
   An item is only swapped when it still shows those original words, so a page script or a
   direct page edit always wins over an old saved value. */
(function () {
  var me = document.currentScript, page = me && me.getAttribute("data-page");
  if (!page || !window.fetch) return;

  function norm(t) { return String(t == null ? "" : t).replace(/\s+/g, " ").trim(); }
  function fp(t) {
    var h = 0x811c9dc5;
    for (var i = 0; i < t.length; i++) { h = Math.imul(h ^ t.charCodeAt(i), 16777619) >>> 0; }
    return ("0000000" + h.toString(16)).slice(-8);
  }

  var got = fetch("/content/pages/" + page + ".json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .catch(function () { return {}; });

  function apply(data) {
    var v = {};
    Object.keys(data || {}).forEach(function (s) {
      var sec = data[s];
      if (sec && typeof sec === "object") Object.keys(sec).forEach(function (k) { v[k] = sec[k]; });
    });
    var els = document.querySelectorAll("[data-sb]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], p = el.getAttribute("data-sb").split(":"), val = v[p[0]];
      if (typeof val !== "string" || !norm(val)) continue;
      if (el.tagName === "IMG") {
        var src = el.getAttribute("src") || "";
        if (fp(src) === p[1] && val !== src) el.setAttribute("src", val);
      } else {
        var cur = norm(el.textContent);
        if (fp(cur) === p[1] && norm(val) !== cur) el.textContent = val;
      }
    }
  }

  function go() { got.then(apply); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
