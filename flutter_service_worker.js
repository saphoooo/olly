'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "aa4cee45888b6cadbbcd998c3b03cd98",
"index.html": "996322e4316b7c5d2c5792e9d9f1cdb6",
"/": "996322e4316b7c5d2c5792e9d9f1cdb6",
"main.dart.js": "dd1b45b60e1fe5d85e73b2d616baacba",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"favicon.png": "05798434d6543c7bdd7eeb566742ca2a",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "51c0c2626b65eb7eef4dac0c299bd553",
"assets/images/dog.png": "b86d75891a439fff7577730d21310a79",
"assets/images/chucky.png": "b1102d9bc7627ca53b4372f42438c170",
"assets/images/crowd.png": "6da507fb6d56f70dbe7bf49973850072",
"assets/images/laugh.png": "0d556915ebf9f3d31edf2f918f392d0d",
"assets/images/button1.png": "5e0580134cde323cc6e2d54254b1a605",
"assets/images/yeah.png": "661db3273d5007192b38c4aea8699eba",
"assets/images/breaking-news.png": "708b2a988980fce2513afa554bc6a578",
"assets/images/meow.png": "7b243fd710140e2ffed827f594996ba7",
"assets/images/sherlock.png": "5e7b3cfcf989b80990909806f5f56765",
"assets/images/congratulations.png": "6d711685b5338c1545ece9d1cf58f20e",
"assets/images/noanswer.png": "37646f6bf70397c99f4944ccd0ec4fd7",
"assets/images/claps.png": "fdea71e1130d4cdee6b8489c3967c216",
"assets/images/welcome.png": "b54fb44994321312ba5400ec3762e1f2",
"assets/AssetManifest.json": "2444a214e922e28f32e26c6ba22d690b",
"assets/NOTICES": "04be4fb48679e25feeadb4493d4f7c02",
"assets/sounds/noanswer.mp3": "c7ed0e9bdaba660a970a11204e8daf7e",
"assets/sounds/welcome.mp3": "6819e435f27e74910c0a45c9a9f420d3",
"assets/sounds/claps.mp3": "e254a01832f174720938abcfe4716a2c",
"assets/sounds/dog.wav": "82e7d893bda811e08ef5a710ece9b8b9",
"assets/sounds/sherlock.mp3": "1e07c3236685ee4ede8e589695365cfb",
"assets/sounds/breaking-news.mp3": "38d316380774e3f59d61172718d37c80",
"assets/sounds/laugh.mp3": "85e767fe63c60dc174666d4100bafe0b",
"assets/sounds/congratulations.wav": "009c3d3a606315c33cada64d2c4cc06c",
"assets/sounds/meow.wav": "ab5628dc06012ab637b6f8d5f4e9e321",
"assets/sounds/crowd.mp3": "aee6dfd70bf96d41bcf18c47aad52b2d",
"assets/sounds/yeah.wav": "17ca448bc7d70f1f298255517fa2989c",
"assets/sounds/chucky.mp3": "ffdb36ca09628cf572df7ca52fb29d9a",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "251fb22450022979415cb9ac1f294d46",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
