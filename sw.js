// Guarda la app en el celular para que abra rápido aunque la señal sea mala.
// Los envíos a la agenda nunca pasan por acá: siempre van directo a internet.
const CACHE = "agenda-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.webmanifest", "./icono-192.png", "./icono-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Primero la red (para tener siempre la última versión); si no hay señal, la copia guardada.
  // Al abrir desde "Compartir" la dirección trae ?text=..., así que se busca la página sin esos datos.
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && !url.search) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
