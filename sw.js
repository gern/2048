var CACHE_STATIC_NAME = 'static-v5';
var CACHE_DYNAMIC_NAME = 'dynamic-v5';
var URL_PREFIX = '/2048';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/js/bind_polyfill.js',
    '/js/classlist_polyfill.js',
    '/js/animframe_polyfill.js',
    '/js/keyboard_input_manager.js',
    '/js/html_actuator.js',
    '/js/grid.js',
    '/js/tile.js',
    '/js/local_storage_manager.js',
    '/js/game_manager.js',
    '/js/promise.js',
    '/js/fetch.js',
    '/js/application.js',
    '/style/main.css',
    '/style/fonts/clear-sans.css',
    '/style/fonts/ClearSans-Bold-webfont.woff',
    '/style/fonts/ClearSans-Regular-webfont.woff'
];

if(URL_PREFIX.length > 0) {
    for (var i in STATIC_FILES)
        STATIC_FILES[i] = URL_PREFIX + STATIC_FILES[i];
}

self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll(STATIC_FILES);
            })
    )
});

self.addEventListener('activate', function (event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    event.waitUntil(
        caches.keys()
            .then(function (keyList) {
                return Promise.all(keyList.map(function (key) {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache.', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

function isInArray(string, array) {
    var cachePath;
    if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
        cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
    } else {
        cachePath = string; // store the full request (for CDNs)
    }
    return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function (event) {
    if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request);
                    }
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(function (res) {
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function (cache) {
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            });
                    }
                })
        );
    }
});
