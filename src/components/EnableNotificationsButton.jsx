import React from "react";
import OneSignal from "react-onesignal";
import { syncPlayerIdToBackend } from "../utils/onesignalSync";

function EnableNotificationsButton() {
  const handleEnable = async () => {
    try {
      // Show OneSignal permission prompt
      await OneSignal.Slidedown.promptPush();

      // After user responds, wait a bit and fetch playerId
      setTimeout(async () => {
        try {
          const subscriptionId = await OneSignal.User.PushSubscription.id();
          const accessToken = localStorage.getItem("accessToken");

          if (subscriptionId && accessToken) {
            await syncPlayerIdToBackend(subscriptionId, accessToken);
          } else {
            console.warn("EnableNotifications: missing subscriptionId or token", {
              subscriptionId,
              accessToken,
            });
          }
        } catch (e) {
          console.error("Error getting playerId after prompt:", e);
        }
      }, 1000);
    } catch (e) {
      console.error("Error enabling notifications:", e);
    }
  };

  return (
    <button
      onClick={handleEnable}
      className="px-4 py-2 rounded bg-emerald-600 text-white text-sm"
    >
      Enable Notifications
    </button>
  );
}

export default EnableNotificationsButton;
