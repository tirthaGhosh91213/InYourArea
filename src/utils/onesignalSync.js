// src/utils/onesignalSync.js

export async function syncPlayerIdToBackend(playerId, accessToken) {
  if (!playerId || !accessToken) {
    console.warn("syncPlayerIdToBackend: missing playerId or accessToken");
    return;
  }

  try {
    const response = await fetch(
      "https://api.jharkhandbiharupdates.com/api/v1/user/onesignal-id",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ playerId }),
      }
    );

    if (response.ok) {
      console.log("✅ OneSignal Player ID synced:", playerId);
    } else {
      console.error("❌ Failed to sync OneSignal ID:", response.status);
    }
  } catch (e) {
    console.error("❌ Error syncing OneSignal ID:", e);
  }
}
