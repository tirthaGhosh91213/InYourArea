import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OneSignal from 'react-onesignal';

// Initialize OneSignal
OneSignal.init({
  appId: "8f6aeaec-1885-4245-b351-0885c4cb7312",
  allowLocalhostAsSecureOrigin: true,
  serviceWorkerPath: 'OneSignalSDKWorker.js',
  serviceWorkerUpdaterPath: 'OneSignalSDKWorkerUpdater.js',
}).then(() => {
  console.log("✅ OneSignal Page SDK Initialized");
}).catch((error) => {
  console.error("❌ OneSignal Init Error:", error);
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ PWA Worker registered');
      })
      .catch((error) => {
        console.error('❌ PWA Worker failed:', error);
      });
  });
}
