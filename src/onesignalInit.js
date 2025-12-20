// src/onesignalInit.js
import { syncPlayerIdToBackend } from './utils/onesignalSync';

export function initOneSignal() {
  if (!window.OneSignal) {
    console.warn('OneSignal SDK not loaded on window');
    return;
  }

  // If you already initialize elsewhere, keep that; this is safe to call once
  window.OneSignal.initialize({
    appId: 'YOUR_ONESIGNAL_APP_ID', // keep your real app id here
    // any other options you already use
  });

  // Handles: user clicks "Allow" after already logged in
  window.OneSignal.on('subscriptionChange', async (isSubscribed) => {
    console.log('🔔 subscriptionChange:', isSubscribed);

    if (!isSubscribed) return;

    try {
      const subscriptionId =
        await window.OneSignal?.User?.PushSubscription?.id;
      const accessToken = localStorage.getItem('accessToken');

      if (subscriptionId && accessToken) {
        await syncPlayerIdToBackend(subscriptionId, accessToken);
      } else {
        console.warn('subscriptionChange: missing subscriptionId or token', {
          subscriptionId,
          accessToken,
        });
      }
    } catch (e) {
      console.error('Error during subscriptionChange sync:', e);
    }
  });
}
