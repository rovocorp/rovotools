"use client";

import { useEffect } from "react";

export const SW_UPDATE_EVENT = "rovotools:sw-update";

function notifyUpdateAvailable(): void {
  window.dispatchEvent(new CustomEvent(SW_UPDATE_EVENT));
}

export default function PWARegister(): null {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Whether this page load was already controlled by a worker. A
    // controller change on a previously-UNcontrolled page is just the first
    // install (skipWaiting + clients.claim) — reloading there wipes whatever
    // the user just typed. Only a change on an already-controlled page means
    // a freshly deployed update took over and deserves exactly one reload.
    const hadControllerAtStart = navigator.serviceWorker.controller !== null;
    let refreshed = false;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // A waiting worker means a freshly deployed version is ready.
        if (registration.waiting !== null) {
          notifyUpdateAvailable();
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (worker === null) {
            return;
          }
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller !== null) {
              notifyUpdateAvailable();
            }
          });
        });
      })
      .catch(() => {
        // Offline-first: registration failure must never break the app.
      });

    const onControllerChange = (): void => {
      if (hadControllerAtStart && !refreshed) {
        refreshed = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
