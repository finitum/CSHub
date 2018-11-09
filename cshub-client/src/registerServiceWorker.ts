/* tslint:disable:no-console */

import {register} from "register-service-worker";

if (process.env.NODE_ENV === "production") {
    register(`${process.env.BASE_URL}service-worker.js`, {
        ready() {
            console.log(
                "App is being served from cache by a service worker.\n" +
                "For more details, visit https://goo.gl/AFskqB",
            );
        },
        cached() {
            console.log("Content has been cached for offline use.");
        },
        updated() {
            const promiseChain = caches.keys()
                .then((cacheNames) => {
                    // Step through each cache name and delete it
                    return Promise.all(
                        cacheNames.map((cacheName) => caches.delete(cacheName))
                    );
                });

            // Keep the service worker alive until all caches are deleted.
            (event as any).waitUntil(promiseChain);

            window.location.reload(true);
        },
        offline() {
            console.log("No internet connection found. App is running in offline mode.");
        },
        error(error) {
            console.error("Error during service worker registration:", error);
        },
    });
}
