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
        // 1) Check push support
        if (
          OneSignal.Notifications &&
          OneSignal.Notifications.isPushSupported
        ) {
          const supported = await OneSignal.Notifications.isPushSupported();
          if (!supported) {
            console.warn("Push not supported in this browser");
            return;
          }
        }

        // 2) Figure out current permission with a SAFE wrapper
        let permission = null;

        try {
          if (
            OneSignal.Notifications &&
            typeof OneSignal.Notifications.getPermissionAsync === "function"
          ) {
            // Newer web SDK API
            permission =
              (await OneSignal.Notifications.getPermissionAsync()) || null;
          } else if (
            OneSignal.Notifications &&
            typeof OneSignal.Notifications.hasPermission === "function"
          ) {
            // Older boolean API
            const has = await OneSignal.Notifications.hasPermission();
            permission = has ? "granted" : "default";
          } else if (
            OneSignal.Notifications &&
            typeof OneSignal.Notifications.permission === "string"
          ) {
            // Fallback if SDK exposes a property
            permission = OneSignal.Notifications.permission;
          }
        } catch (e) {
          console.error("Permission check failed:", e);
        }

        // 3) If already granted, sync immediately
        if (permission === "granted") {
          try {
            const sub =
              OneSignal.User &&
              OneSignal.User.PushSubscription &&
              (await OneSignal.User.PushSubscription.getSubscription());
            const playerId = sub && sub.id;
            if (playerId) {
              await syncPlayerIdToBackend(playerId, accessToken);
            } else {
              console.warn("No playerId found even though permission granted");
            }
          } catch (e) {
            console.error("Failed to get subscription / sync playerId:", e);
          }
          return;
        }

        // 4) Otherwise, listen for permission changes (user clicks Allow later)
        if (
          OneSignal.Notifications &&
          typeof OneSignal.Notifications.addEventListener === "function"
        ) {
          const handler = async (event) => {
            try {
              console.log("🔔 permissionChange event:", event);
              if (!event || event.to !== "granted") return;

              const sub =
                OneSignal.User &&
                OneSignal.User.PushSubscription &&
                (await OneSignal.User.PushSubscription.getSubscription());
              const playerId = sub && sub.id;
              if (playerId) {
                await syncPlayerIdToBackend(playerId, accessToken);
              } else {
                console.warn(
                  "permissionChange fired but no playerId on subscription"
                );
              }
            } catch (e) {
              console.error("Error in permissionChange handler:", e);
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
        } else {
          console.warn(
            "OneSignal.Notifications.addEventListener not available on this SDK"
          );
        }
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
