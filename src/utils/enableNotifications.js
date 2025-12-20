// src/utils/enableNotifications.js
import OneSignal from "react-onesignal";
import { syncPlayerIdToBackend } from "./onesignalSync";

export async function promptAndSyncNotifications() {
  try {
    await OneSignal.Slidedown.promptPush();

    setTimeout(async () => {
      try {
        const sub = OneSignal.User.PushSubscription;
        const subscriptionId = sub && sub.id; // ✅ property, not function
        const accessToken = localStorage.getItem("accessToken");

        if (subscriptionId && accessToken) {
          await syncPlayerIdToBackend(subscriptionId, accessToken);
        } else {
          console.warn("promptAndSync: missing subscriptionId or token", {
            subscriptionId,
            accessToken,
          });
        }
      } catch (e) {
        console.error("Jobs notif prompt: error getting playerId", e);
      }
    }, 1000);
  } catch (e) {
    console.error("Error enabling notifications:", e);
  }
}
