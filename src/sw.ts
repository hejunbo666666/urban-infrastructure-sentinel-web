/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import type { PrecacheEntry } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

/** Background Sync API（部分环境未在 lib 中声明） */
interface SyncEventLike extends ExtendableEvent {
  readonly tag: string
}

const CACHE_NAME = 'uis-cache-v2'
const API_CACHE_NAME = 'uis-api-v1'

const precacheManifest = (self as ServiceWorkerGlobalScope & { __WB_MANIFEST: PrecacheEntry[] }).__WB_MANIFEST
precacheAndRoute(precacheManifest)
cleanupOutdatedCaches()

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter(
            (key) =>
              key !== CACHE_NAME &&
              !key.startsWith('workbox-'),
          )
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  if (req.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE_NAME)
        try {
          const response = await fetch(req)
          if (response && response.ok) {
            cache.put(req, response.clone()).catch(() => undefined)
          }
          return response
        } catch {
          const cached = await cache.match(req)
          if (cached) return cached
          throw new Error('offline')
        }
      })(),
    )
    return
  }

  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req)
        .then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned))
          return response
        })
        .catch(async () => {
          const fallback = await caches.match('/index.html')
          if (fallback) return fallback
          return new Response('offline', { status: 503, statusText: 'Service Unavailable' })
        })
    }),
  )
})

self.addEventListener('sync', (event: Event) => {
  const syncEvent = event as SyncEventLike
  if (syncEvent.tag !== 'sync-offline-reports') return
  syncEvent.waitUntil(self.clients.matchAll().then((clients) => clients.forEach((c) => c.postMessage('sync'))))
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || typeof data !== 'object') return

  if (data.type === 'API_CACHE_INVALIDATE' && data.scope === 'reports') {
    const userId = typeof data.userId === 'string' ? data.userId : null
    event.waitUntil(
      (async () => {
        const cache = await caches.open(API_CACHE_NAME)
        const keys = await cache.keys()
        await Promise.all(
          keys
            .filter((request) => {
              try {
                const u = new URL(request.url)
                if (!u.pathname.startsWith('/api/reports')) return false
                if (!userId) return true
                return u.searchParams.get('userId') === userId
              } catch {
                return false
              }
            })
            .map((request) => cache.delete(request)),
        )
      })(),
    )
  }
})
