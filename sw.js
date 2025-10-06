// Service Worker for Karam Libnan - Cache static assets
const CACHE_NAME = 'karam-libnan-v2.0'; // Updated version to force cache refresh
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/hero.png',
  '/images/logo.png',
  '/images/ourstory.png',
  '/favicon.ico',
  '/components/navigation.html'
];

// Install Service Worker and cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch Strategy: Cache First for static assets, Network First for dynamic content
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip cross-origin requests and non-GET requests
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }
  
  // Always fetch fresh for critical app files (CSS, JS, HTML)
  if (url.pathname.includes('/js/app.js') || 
      url.pathname.includes('/css/styles.css') ||
      url.pathname.includes('/admin.html') ||
      url.pathname.includes('/index.html') ||
      url.pathname.includes('components/navigation.html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Cache strategy for static assets (images only)
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Network first for API calls and dynamic content
    event.respondWith(networkFirstStrategy(request));
  }
});

// Cache First Strategy for static assets (images, CSS, JS)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache', request.url);
      return cachedResponse;
    }
    
    // If not in cache, fetch and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      console.log('Service Worker: Fetched and cached', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache first failed', error);
    return fetch(request); // Fallback to network
  }
}

// Network First Strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Optionally cache successful responses
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Helper function to identify static assets
function isStaticAsset(url) {
  const staticExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.css', '.js', '.ico'];
  const staticPaths = ['/images/', '/css/', '/js/', '/components/'];
  
  return staticExtensions.some(ext => url.endsWith(ext)) || 
         staticPaths.some(path => url.includes(path)) ||
         url.endsWith('/') || url.endsWith('/index.html');
}
