// Service Worker — bypass HTML/JSON cache only, leave everything else alone
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  // Only intercept HTML navigations and version.json — leave images/JS/CSS alone
  const isNavigate = event.request.mode === 'navigate'
  const isVersion = url.pathname === '/version.json'

  if (isNavigate || isVersion) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => caches.match(event.request))
    )
  }
  // Everything else: pass through, browser handles it
})
