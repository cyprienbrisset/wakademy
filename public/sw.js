// Service Worker Wakademy - Cache intelligent côté client
// Version 1.0.0

const CACHE_NAME = 'wakademy-v1'
const STATIC_CACHE = 'wakademy-static-v1'
const API_CACHE = 'wakademy-api-v1'
const IMAGE_CACHE = 'wakademy-images-v1'

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/library',
  '/_next/static/css/',
  '/_next/static/js/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
]

// Stratégies de cache
const CACHE_STRATEGIES = {
  // Cache First - Pour les assets statiques
  CACHE_FIRST: 'cache-first',
  // Network First - Pour les APIs dynamiques
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate - Pour les contenus semi-statiques
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
}

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installation')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Service Worker: Mise en cache des assets statiques')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker: Installation terminée')
        return self.skipWaiting()
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activation')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Supprimer les anciens caches
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ Service Worker: Suppression ancien cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker: Activation terminée')
        return self.clients.claim()
      })
  )
})

// Interception des requêtes
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) return
  
  // Stratégie selon le type de ressource
  if (url.pathname.startsWith('/api/')) {
    // APIs - Network First avec cache de secours
    event.respondWith(handleApiRequest(request))
  } else if (url.pathname.startsWith('/_next/static/') || 
             url.pathname.startsWith('/icons/')) {
    // Assets statiques - Cache First
    event.respondWith(handleStaticRequest(request))
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    // Images - Stale While Revalidate
    event.respondWith(handleImageRequest(request))
  } else {
    // Pages HTML - Stale While Revalidate
    event.respondWith(handlePageRequest(request))
  }
})

// Gestion des requêtes API - Network First
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    // Essayer le réseau d'abord
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Mettre en cache la réponse si elle est valide
      const responseClone = networkResponse.clone()
      await cache.put(request, responseClone)
      
      // Ajouter un header pour indiquer que c'est du réseau
      const response = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'X-Cache-Status': 'NETWORK'
        }
      })
      
      return response
    }
  } catch (error) {
    console.log('🌐 Service Worker: Réseau indisponible, utilisation du cache pour', request.url)
  }
  
  // Fallback sur le cache
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    // Ajouter un header pour indiquer que c'est du cache
    const response = new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers: {
        ...Object.fromEntries(cachedResponse.headers.entries()),
        'X-Cache-Status': 'CACHE'
      }
    })
    return response
  }
  
  // Aucune réponse disponible
  return new Response('Service indisponible', { status: 503 })
}

// Gestion des assets statiques - Cache First
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  
  // Vérifier le cache d'abord
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Sinon, récupérer du réseau et mettre en cache
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('❌ Service Worker: Erreur lors du chargement de', request.url)
    return new Response('Ressource indisponible', { status: 404 })
  }
}

// Gestion des images - Stale While Revalidate
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  
  // Récupérer du cache immédiatement
  const cachedResponse = await cache.match(request)
  
  // Récupérer du réseau en arrière-plan
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => null)
  
  // Retourner le cache s'il existe, sinon attendre le réseau
  return cachedResponse || await networkResponsePromise || 
         new Response('Image indisponible', { status: 404 })
}

// Gestion des pages HTML - Stale While Revalidate
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  
  // Récupérer du cache immédiatement
  const cachedResponse = await cache.match(request)
  
  // Récupérer du réseau en arrière-plan
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => null)
  
  // Retourner le cache s'il existe, sinon attendre le réseau
  return cachedResponse || await networkResponsePromise || 
         new Response('Page indisponible', { status: 404 })
}

// Gestion des messages du client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status)
    })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})

// Obtenir le statut du cache
async function getCacheStatus() {
  const cacheNames = await caches.keys()
  const status = {}
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    status[cacheName] = keys.length
  }
  
  return status
}

// Vider tous les caches
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(name => caches.delete(name)))
  console.log('🗑️ Service Worker: Tous les caches supprimés')
}

// Synchronisation en arrière-plan
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  console.log('🔄 Service Worker: Synchronisation en arrière-plan')
  // Ici on peut synchroniser les données offline, etc.
} 