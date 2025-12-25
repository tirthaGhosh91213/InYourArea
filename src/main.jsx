import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import OneSignal from "react-onesignal";
import { syncPlayerIdToBackend } from "./utils/onesignalSync";
import { HelmetProvider } from "react-helmet-async";


async function initOneSignalReact() {
  try {
    await OneSignal.init({
      appId: "8f6aeaec-1885-4245-b351-0885c4cb7312",
      serviceWorkerPath: "/OneSignalSDKWorker.js",
      serviceWorkerUpdaterPath: "/OneSignalSDKWorkerUpdater.js",
      allowLocalhostAsSecureOrigin: true,
    });
    console.log("✅ OneSignal initialized");


    // ✅ Use the global OneSignal object for events
    if (window.OneSignal && window.OneSignal.on) {
      window.OneSignal.on("subscriptionChange", async (isSubscribed) => {
        console.log("🔔 subscriptionChange:", isSubscribed);
        if (!isSubscribed) return;


        try {
          const subscriptionId =
            await window.OneSignal.User.PushSubscription.id();
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
    } else {
      console.warn("window.OneSignal.on is not available");
    }
  } catch (e) {
    console.error("❌ OneSignal init failed:", e);
  }
}


initOneSignalReact();


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
