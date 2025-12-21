import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, BellOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LAST_NOTIFICATION_ID_KEY = "lastSeenNotificationId";

export default function NotificationPanel({
  notifOpen,
  onClose,
  onUnreadChange,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const pollingIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Request notification permission on mount
  useEffect(() => {
    const checkAndRequestPermission = async () => {
      if (typeof Notification === "undefined") {
        console.warn("❌ Browser notifications not supported");
        return;
      }

      console.log("🔔 Current permission:", Notification.permission);
      setNotificationPermission(Notification.permission);
    };
    checkAndRequestPermission();
  }, []);

  const showBrowserNotification = (title, body, notifId) => {
    console.log("🔔 Attempting to show notification:", { title, body, notifId });
    
    if (typeof Notification === "undefined") {
      console.warn("❌ Notification API not available");
      return;
    }
    
    if (Notification.permission !== "granted") {
      console.warn("❌ Permission not granted:", Notification.permission);
      return;
    }

    try {
      const notification = new Notification(title, {
        body: body,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: `notification-${notifId}`,
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        console.log("🔔 Notification clicked");
        window.focus();
        notification.close();
      };

      console.log("✅ Browser notification created successfully");
    } catch (e) {
      console.error("❌ Error creating notification:", e);
    }
  };

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("❌ No access token");
        return;
      }

      const res = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/notifications/recent?limit=50",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.data || [];
      console.log("🔔 Fetched notifications:", data.length, "items");

      // ✅ Get last seen notification ID from localStorage
      const lastSeenIdStr = localStorage.getItem(LAST_NOTIFICATION_ID_KEY);
      const lastSeenId = lastSeenIdStr ? parseInt(lastSeenIdStr, 10) : null;
      console.log("🔔 Last seen notification ID:", lastSeenId);

      // ✅ Find NEW notifications (ID greater than last seen)
      const newNotifications = data.filter((notif) => {
        if (lastSeenId === null) return false; // First time, don't push
        return notif.id > lastSeenId;
      });

      console.log("🔔 New notifications found:", newNotifications.length);

      // ✅ Show OS notification for each NEW notification
      if (newNotifications.length > 0 && Notification.permission === "granted") {
        console.log("🔔 Showing OS notifications for new items");
        newNotifications.forEach((notif) => {
          console.log("🔔 Pushing:", notif.message);
          showBrowserNotification(
            "New Notification 🔔",
            notif.message || "You have a new notification",
            notif.id
          );
        });
      }

      // ✅ Update last seen ID in localStorage (highest ID)
      if (data.length > 0) {
        const highestId = Math.max(...data.map(n => n.id));
        localStorage.setItem(LAST_NOTIFICATION_ID_KEY, String(highestId));
        console.log("🔔 Updated last seen ID to:", highestId);
      }

      setNotifications(data);
      if (onUnreadChange) onUnreadChange(data.length > 0);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ✅ Start polling on mount
  useEffect(() => {
    console.log("🔔 NotificationPanel mounted - starting background polling");
    
    // Initial fetch
    fetchNotifications(true);

    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      console.log("🔔 Background polling...");
      fetchNotifications(true);
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        console.log("🔔 Stopping background polling");
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Refresh display when panel opens
  useEffect(() => {
    if (notifOpen) {
      console.log("🔔 Panel opened - refreshing display");
      fetchNotifications();
    }
  }, [notifOpen]);

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(
        "https://api.jharkhandbiharupdates.com/api/v1/notifications/clear-all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNotifications([]);
      // Reset last seen ID when clearing
      localStorage.removeItem(LAST_NOTIFICATION_ID_KEY);
      if (onUnreadChange) onUnreadChange(false);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete(
        `https://api.jharkhandbiharupdates.com/api/v1/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      if (onUnreadChange) onUnreadChange(updated.length > 0);
    } catch (err) {
      console.error(`Error deleting notification ${id}:`, err);
    }
  };

  const handleRequestPermission = async () => {
    if (typeof Notification === "undefined") {
      alert("Your browser doesn't support notifications");
      return;
    }

    console.log("🔔 Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log("🔔 Permission granted:", permission);
    setNotificationPermission(permission);

    if (permission === "granted") {
      showBrowserNotification(
        "Notifications Enabled! 🎉",
        "You will now receive push notifications",
        "test"
      );
    }
  };

  const handleTestNotification = () => {
    console.log("🔔 Manual test notification triggered");
    showBrowserNotification(
      "Test Notification",
      "This is a test notification from the panel",
      "manual-test-" + Date.now()
    );
  };

  return (
    <AnimatePresence>
      {notifOpen && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="
            absolute right-2 sm:right-4 md:right-0 mt-3 
            w-80 sm:w-80 md:w-96 
            bg-white shadow-2xl rounded-lg 
            border border-gray-200 z-50 overflow-hidden
            text-sm sm:text-base md:text-base
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
            <h4 className="font-semibold text-base sm:text-lg tracking-wide">
              Notifications
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleTestNotification}
                className="text-xs bg-green-800 hover:bg-green-900 px-2 py-1 rounded"
                title="Test notification"
              >
                Test
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:opacity-80 focus:outline-none"
                title="Clear All Notifications"
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Clear
              </button>
            </div>
          </div>

          {/* Permission Banner */}
          {notificationPermission !== "granted" && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 py-3">
              <div className="flex items-start gap-3">
                <BellOff
                  size={20}
                  className="text-yellow-600 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-yellow-800 font-medium">
                    Enable notifications to stay updated
                  </p>
                  <button
                    onClick={handleRequestPermission}
                    className="mt-2 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-md transition"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-[21rem] overflow-y-auto divide-y divide-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin text-green-600 w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-xs sm:text-sm font-medium">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="relative px-4 sm:px-6 py-3 sm:py-4 hover:bg-green-50 transition cursor-pointer border-l-4 border-green-600 rounded-r-lg"
                >
                  <h5 className="font-semibold text-gray-900 text-sm sm:text-base pr-6">
                    {n.message || "Notification"}
                  </h5>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 select-none">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>

                  <button
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-400 hover:text-red-500 focus:outline-none"
                    onClick={() => handleDeleteNotification(n.id)}
                    title="Delete notification"
                  >
                    <Trash2 size={14} className="sm:size-[16px]" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
