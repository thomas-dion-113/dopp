import {registerRoute, setCatchHandler} from "workbox-routing";
import {cleanupOutdatedCaches, matchPrecache, precacheAndRoute} from "workbox-precaching";
import {BackgroundSyncPlugin} from 'workbox-background-sync';

import {
    NetworkOnly,
    NetworkFirst,
    StaleWhileRevalidate,
    CacheFirst,
} from 'workbox-strategies';

import {CacheableResponsePlugin} from 'workbox-cacheable-response';
import {ExpirationPlugin} from 'workbox-expiration';
import {clientsClaim, skipWaiting} from "workbox-core";

// console.log("INSTALL");
skipWaiting();
clientsClaim();

// addEventListener('install', event => {
//     console.log("INSTALL");
//     skipWaiting();
// });

// addEventListener('message', (event) => {
//     if (event.data && event.data.type === 'SKIP_WAITING') {
//         // console.log("SKIP WAINTING");
//         // skipWaiting();
//         // console.log("CLEANUP OUTDATED CACHES");
//         // cleanupOutdatedCaches();
//         console.log("CLEANUP WITHOUT WORKBOX");
//         caches.keys().then(function(keyList) {
//             return Promise.all(keyList.map(function(key) {
//                 return caches.delete(key);
//             }));
//         }).then(() => {
//             console.log("SKIP WAINTING");
//             skipWaiting();
//         });
//     }
// });

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

// Catch routing errors, like if the user is offline
setCatchHandler(async ({ event }) => {
    // Return the precached offline page if a document is being requested
    if (event.request.destination === 'document') {
        return matchPrecache('/offline.html');
    }

    return Response.error();
});

//BackgroundSync
//On https://ptsv2.com/t/n5y9f-1556037444 you can check for received posts
const bgSyncPlugin = new BackgroundSyncPlugin('queue', {
    maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
});

registerRoute(
    ({url}) => url.origin === process.env.SITE_URL && (
        url.pathname === '/api/private/create_releve' ||
        url.pathname === '/api/private/edit_releve' ||
        url.pathname === '/api/private/create_pluvio' ||
        url.pathname === '/api/private/edit_user' ||
        url.pathname === '/api/public/request_reset_password' ||
        url.pathname === '/api/public/reset_password' ||
        url.pathname === '/api/public/register'
    ),
    new NetworkOnly({
        plugins: [bgSyncPlugin]
    }),
    'POST'
);

registerRoute(
    ({url}) =>  url.origin === process.env.SITE_URL && (
        url.pathname.startsWith('/api/private/releve/')
    ),
    new NetworkOnly(),
    'GET'
);

registerRoute(
    ({url}) => url.origin === process.env.SITE_URL && (
        url.pathname.startsWith('/api/')
    ),
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            })
        ]
    }),
    'GET'
);

registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com' || 'https://fonts.gstatic.com',
    new CacheFirst({
        cacheName: 'google-font-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            })
        ]
    })
);

registerRoute(
    ({url}) => url.origin === 'https://api.mapbox.com',
    new CacheFirst({
        cacheName: 'leaflet-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            })
        ]
    })
);

// Cache page navigations (html) with a Network First strategy
registerRoute(
    // Check to see if the request is a navigation to a new page
    ({request}) => request.mode === 'navigate',
    // Use a Network First caching strategy
    new NetworkFirst({
        // Put all cached files in a cache named 'pages'
        cacheName: 'pages',
        plugins: [
            // Ensure that only requests that result in a 200 status are cached
            new CacheableResponsePlugin({
                statuses: [200],
            }),
        ],
    }),
);

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
registerRoute(
    // Check to see if the request's destination is style for stylesheets, script for JavaScript, or worker for web worker
    ({request}) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'font' ||
        request.destination === 'worker',
    // Use a Stale While Revalidate caching strategy
    new StaleWhileRevalidate({
        // Put all cached files in a cache named 'assets'
        cacheName: 'assets',
        plugins: [
            // Ensure that only requests that result in a 200 status are cached
            new CacheableResponsePlugin({
                statuses: [200],
            }),
        ],
    }),
);

// Cache images with a Cache First strategy
registerRoute(
    // Check to see if the request's destination is style for an image
    ({request}) => request.destination === 'image',
    // Use a Cache First caching strategy
    new CacheFirst({
        // Put all cached files in a cache named 'images'
        cacheName: 'images',
        plugins: [
            // Ensure that only requests that result in a 200 status are cached
            new CacheableResponsePlugin({
                statuses: [200],
            }),
            // Don't cache more than 50 items, and expire them after 30 days
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
            }),
        ],
    }),
);