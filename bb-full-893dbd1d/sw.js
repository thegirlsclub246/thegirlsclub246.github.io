// Brain Basket service worker: offline app shell + daily reminder.
const CACHE = 'bb-shell-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
const NUDGES = [
  'Give your keys one home. Same bowl, every time, no thinking needed.',
  'You don’t need to do it all today. You need to do the next tiny thing.',
  'Stuck starting? Set a timer for 5 minutes. You’re allowed to stop when it rings.',
  'Forgetting something doesn’t make you lazy. Your brain files things differently.',
  'Put the thing you need tomorrow in front of the door tonight.',
  'Half done is still more than not started. Count it.',
  'Body doubling works: call a friend or play a “study with me” video while you clean.',
  'Write the thought down, then let it go. The app holds it so you don’t have to.',
  'Rest is part of the plan, not a break from it.',
  'Pair a boring job with something fun: dishes plus your favourite podcast.'
];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('bb-shell') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});

async function settings() {
  try { const c = await caches.open('bb-settings'); const r = await c.match('/settings.json'); return r ? await r.json() : null; } catch (e) { return null; }
}
async function markShown(day) { const c = await caches.open('bb-settings'); await c.put('/last.json', new Response(JSON.stringify({ day }))); }
async function lastShown() { try { const c = await caches.open('bb-settings'); const r = await c.match('/last.json'); return r ? (await r.json()).day : null; } catch (e) { return null; } }

// Shows today's nudge once, after the chosen time.
async function maybeNudge() {
  const s = await settings(); if (!s || !s.on) return;
  const now = new Date(); const day = now.toDateString();
  const [h, m] = (s.time || '08:00').split(':').map(Number);
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
  if ((await lastShown()) === day) return;
  const n = Math.floor(Date.now() / 864e5);
  let body = NUDGES[n % NUDGES.length];
  if (n % 3 === 2 && s.top && s.top.length) body = 'Today’s top ' + s.top.length + ': ' + s.top.join(', ');
  await self.registration.showNotification('Brain Basket', { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'daily-nudge' });
  await markShown(day);
}
self.addEventListener('periodicsync', e => { if (e.tag === 'daily-nudge') e.waitUntil(maybeNudge()); });
self.addEventListener('message', e => { if (e.data && e.data.type === 'check') e.waitUntil(maybeNudge()); });

// Ready for server-sent push (phase 2): payload {title, body}.
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Brain Basket', { body: d.body || NUDGES[0], icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'daily-nudge' }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
