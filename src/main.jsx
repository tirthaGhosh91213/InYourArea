import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import OneSignal from "react-onesignal";

// Initialize OneSignal ONCE
OneSignal.init({
  appId: "8f6aeaec-1885-4245-b351-0885c4cb7312",
  serviceWorkerPath: "/OneSignalSDKWorker.js",
  serviceWorkerUpdaterPath: "/OneSignalSDKWorkerUpdater.js",
  allowLocalhostAsSecureOrigin: true
})
  .then(() => console.log("✅ OneSignal initialized"))
  .catch((e) => console.error("❌ OneSignal init failed:", e));

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
