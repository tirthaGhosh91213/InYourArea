// src/hooks/useOneSignalAfterLogin.js
import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { syncPlayerIdToBackend } from "../utils/onesignalSync";

export function useOneSignalAfterLogin() {
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("🔔 useOneSignalAfterLogin mounted, token present:", !!accessToken);
    if (!accessToken) return;

    let unsubscribe = null;

    async function setup() {
      try {
        // 1) Check push support (if API exists)
        if (
          OneSignal.Notifications &&
          typeof OneSignal.Notifications.isPushSupported === "function"
        ) {
          const supported = await OneSignal.Notifications.isPushSupported();
          console.log("🔔 Push supported:", supported);
          if (!supported) {
            console.warn("Push not supported in this browser");
            return;
          }
        }

        // 2) Determine current permission with safe fallbacks
        let permission = null;
        try {
          if (
            OneSignal.Notifications &&
            typeof OneSignal.Notifications.getPermissionAsync === "function"
          ) {
            permission = await OneSignal.Notifications.getPermissionAsync();
            console.log("🔔 permission via getPermissionAsync:", permission);
          } else if (
            OneSignal.Notifications &&
            typeof OneSignal.Notifications.hasPermission === "function"
          ) {
            const has = await OneSignal.Notifications.hasPermission();
            permission = has ? "granted" : "default";
            console.log("🔔 permission via hasPermission:", permission);
          } else if (
            OneSignal.Notifications &&
            typeof OneSignal.Notifications.permission === "string"
          ) {
            permission = OneSignal.Notifications.permission;
            console.log("🔔 permission via property:", permission);
          } else {
            console.warn("🔔 No permission API found on OneSignal.Notifications");
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
            console.log("🔔 existing subscription object:", sub);

            const playerId = sub && sub.id;
            console.log("🔔 existing playerId:", playerId);

            if (playerId) {
              await syncPlayerIdToBackend(playerId, accessToken);
            } else {
              console.warn("No playerId found even though permission granted");
            }
          } catch (e) {
            console.error("Failed to get subscription / sync playerId:", e);
          }
          // still continue to listen for changes, in case subscription is created later
        }

        // 4) Listen for permission changes (user clicks Allow after login)
        if (
          OneSignal.Notifications &&
          typeof OneSignal.Notifications.addEventListener === "function"
        ) {
          const handler = async (event) => {
            console.log("🔔 permissionChange event:", event);

            try {
              // We only care when it becomes granted
              if (!event || event.to !== "granted") {
                console.log("🔔 permissionChange not granted, skip sync");
                return;
              }

              const sub =
                OneSignal.User &&
                OneSignal.User.PushSubscription &&
                (await OneSignal.User.PushSubscription.getSubscription());
              console.log("🔔 subscription object after grant:", sub);

              const playerId = sub && sub.id;
              console.log("🔔 resolved playerId after grant:", playerId);

              const latestToken = localStorage.getItem("accessToken");
              console.log("🔔 latest accessToken present:", !!latestToken);

              if (!playerId || !latestToken) {
                console.warn(
                  "Missing playerId or token in permissionChange, NOT syncing"
                );
                return;
              }

              await syncPlayerIdToBackend(playerId, latestToken);
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
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
}
