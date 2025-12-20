import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import OneSignal from "react-onesignal";
import { syncPlayerIdToBackend } from "./utils/onesignalSync";

// Initialize OneSignal ONCE
OneSignal.init({
  appId: "8f6aeaec-1885-4245-b351-0885c4cb7312",
  serviceWorkerPath: "/OneSignalSDKWorker.js",
  serviceWorkerUpdaterPath: "/OneSignalSDKWorkerUpdater.js",
  allowLocalhostAsSecureOrigin: true,
})
  .then(async () => {
    console.log("✅ OneSignal initialized");

    // 🔔 Handle case: user clicks "Allow" AFTER login
    OneSignal.on("subscriptionChange", async (isSubscribed) => {
      console.log("🔔 subscriptionChange:", isSubscribed);
      if (!isSubscribed) return;

      try {
        const subscriptionId =
          await window.OneSignal?.User?.PushSubscription?.id;
        const accessToken = localStorage.getItem("accessToken");

        if (subscriptionId && accessToken) {
          await syncPlayerIdToBackend(subscriptionId, accessToken);
        } else {
          console.warn(
            "subscriptionChange: missing subscriptionId or token",
            { subscriptionId, accessToken }
          );
        }
      } catch (e) {
        console.error("Error during subscriptionChange sync:", e);
      }
    });
  })
  .catch((e) => console.error("❌ OneSignal init failed:", e));

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
