// src/hooks/useOneSignalAfterLogin.js
import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { syncPlayerIdToBackend } from "../utils/onesignalSync";

export function useOneSignalAfterLogin() {
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    let unsubscribe = null;

    async function setup() {
      try {
        const supported = await OneSignal.Notifications.isPushSupported();
        if (!supported) {
          console.warn("Push not supported in this browser");
          return;
        }

        // If already subscribed, just sync once
        const permission = await OneSignal.Notifications.getPermission();
        if (permission === "granted") {
          const sub = await OneSignal.User.PushSubscription.getSubscription();
          const playerId = sub && sub.id;
          if (playerId) {
            await syncPlayerIdToBackend(playerId, accessToken);
          }
          return;
        }

        // Otherwise, listen for permission change (user clicks Allow)
        const handler = async (event) => {
          console.log("🔔 permissionChange event:", event);
          if (event.to !== "granted") return;

          const sub = await OneSignal.User.PushSubscription.getSubscription();
          const playerId = sub && sub.id;
          if (playerId) {
            await syncPlayerIdToBackend(playerId, accessToken);
          }
        };

        OneSignal.Notifications.addEventListener(
          "permissionChange",
          handler
        );
        unsubscribe = () =>
          OneSignal.Notifications.removeEventListener(
            "permissionChange",
            handler
          );
      } catch (e) {
        console.error("useOneSignalAfterLogin error:", e);
      }
    }

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
}
