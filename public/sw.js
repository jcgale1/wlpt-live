// Service Worker — kills HTML/JSON cache so TV always pulls fresh code on reload
const VERSION = 'wlpt-sw-v1'

self.addEventListener('install', (event) => {
  // Activate immediately on first install
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Take control of all clients immediately
      await self.clients.claim()
      // Nuke all caches we ever created
      const keys = await caches.keys()
      await Promise.all(keys.map(k => caches.delete(k)))
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Same-origin only
  if (url.origin !== self.location.origin) return

  // Always bypass cache for HTML, version.json, and root
  const isDoc = event.request.mode === 'navigate' ||
                url.pathname === '/' ||
                url.pathname.endsWith('.html') ||
                url.pathname === '/version.json' ||
                url.pathname.startsWith('/api/')

  if (isDoc) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(event.request))
    )
  }
  // Hashed assets (dist/assets/*) — let browser handle normally (they're already content-hashed)
})
