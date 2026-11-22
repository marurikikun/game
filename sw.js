// ゲーム：電波がなくても開けるようにするしくみ（Service Worker）
// 開くたびに新しいものを取りにいき、届かないときは保存しておいた写しを使う。
// 進み具合の記録はもともとiPhoneの中だけにあるので、電波がなくても続きから遊べる。
const SHELL = "game-shell-v4";
const FILES = ["./", "index.html", "manifest.json", "icon-180.png", "icon-512.png", "iwakuzushi.html", "hori.html", "robo.html", "zangou.html", "kirisaka.html", "sagimiya.html", "takkyu.html", "rhythm.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith("game-shell") && k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(r => {
        if (r.ok) { const cp = r.clone(); caches.open(SHELL).then(c => c.put(req, cp)); }
        return r;
      })
      .catch(() =>
        caches.open(SHELL)
          .then(c => c.match(req, { ignoreSearch: true }).then(r => r || c.match("index.html")))
          .then(r => r || Response.error())
      )
  );
});
