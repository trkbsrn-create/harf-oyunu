// Telefona uygulama olarak eklenebilsin diye (manifest.webmanifest). Hiçbir şeyi önbelleğe almaz:
// oyun her açılışta internetten en yeni sürümü yükler (sürüm numarası ?s= ile güncellenir).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
