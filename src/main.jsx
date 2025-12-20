import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import OneSignal from 'react-onesignal';

// Initialize OneSignal
OneSignal.init({
  appId: "8f6aeaec-1885-4245-b351-0885c4cb7312",
  allowLocalhostAsSecureOrigin: true,
}).then(() => {
  console.log("✅ OneSignal initialized successfully");
}).catch((error) => {
  console.error("❌ OneSignal initialization failed:", error);
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('✅ PWA Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('❌ PWA Service Worker registration failed:', error);
      });
  });
}
