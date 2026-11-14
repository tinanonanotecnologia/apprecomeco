const scope = self.registration.scope
const entry = new URL('./', scope).href
const cachePrefix = `recomeco-app:${scope}:`
const cacheName = `${cachePrefix}__BUILD_VERSION__`
const artwork = [] /* ARTE_OFFLINE */

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    const page = await fetch(entry, { cache: 'reload' })
    if (!page.ok) throw new Error('A página inicial não pôde ser carregada.')
    const html = await page.clone().text()
    const bundles = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g), ([, path]) => path)
      .map((path) => new URL(path, entry).href)
      .filter((url) => url.startsWith(new URL('./assets/', entry).href))
    const styles = await Promise.all(bundles.filter((url) => url.endsWith('.css')).map(async (url) => {
      const css = await (await fetch(url)).text()
      return Array.from(css.matchAll(/url\(([^)]+)\)/g), ([, path]) => new URL(path.replace(/["']/g, ''), url).href)
        .filter((asset) => asset.startsWith(new URL('./assets/', entry).href))
    }))
    await cache.addAll([...new Set([...bundles, ...styles.flat(), ...[
      'icone.svg', 'icone-192.png', 'icone-512.png', 'manifest.webmanifest', ...artwork,
    ].map((path) => new URL(path, entry).href)])])
    await cache.put(entry, page)
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const oldCaches = (await caches.keys()).filter((name) => name.startsWith(cachePrefix) && name !== cacheName)
    await Promise.all(oldCaches.map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(scope)) return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match(entry)) || Response.error()))
    return
  }
  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
      return (await cache.match(request)) || fetch(request)
    }
    return fetch(request).catch(async () => (await cache.match(request)) || Response.error())
  })())
})
