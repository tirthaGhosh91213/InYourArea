import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import axios from 'axios';

export const useOneSignal = () => {
  useEffect(() => {
    const initializeOneSignal = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('⏭️ No token found, skipping OneSignal setup');
          return;
        }

        console.log("🔔 Starting OneSignal subscription process...");

        // Wait a bit for OneSignal to fully initialize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Request notification permission
        const permission = await OneSignal.Notifications.requestPermission();
        
        if (!permission) {
          console.log("❌ Notification permission denied by user");
          return;
        }

        console.log("✅ Notification permission granted");

        // Wait for subscription
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the OneSignal Player ID
        const playerId = OneSignal.User.PushSubscription.id;
        
        if (playerId) {
          console.log("✅ OneSignal Player ID obtained:", playerId);
          
          // Send Player ID to backend
          const response = await axios.put(
            'https://api.jharkhandbiharupdates.com/api/v1/user/onesignal-id',
            { playerId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          console.log("✅ Player ID sent to backend successfully:", response.data);
        } else {
          console.log("⚠️ Player ID not available yet, will retry...");
          
          // Retry after 3 seconds if player ID not available
          setTimeout(async () => {
            const retryPlayerId = OneSignal.User.PushSubscription.id;
            if (retryPlayerId) {
              await axios.put(
                'https://api.jharkhandbiharupdates.com/api/v1/user/onesignal-id',
                { playerId: retryPlayerId },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              console.log("✅ Player ID sent on retry:", retryPlayerId);
            }
          }, 3000);
        }

      } catch (error) {
        console.error("❌ OneSignal setup error:", error);
      }
    };

    // Run initialization after component mounts
    const timer = setTimeout(initializeOneSignal, 1500);
    
    return () => clearTimeout(timer);
  }, []);
};
