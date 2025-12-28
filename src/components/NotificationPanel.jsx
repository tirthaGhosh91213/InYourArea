import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, BellOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import OneSignal from "react-onesignal";

const LAST_NOTIFICATION_ID_KEY = "lastSeenNotificationId";

export default function NotificationPanel({
  notifOpen,
  onClose,
  onUnreadChange,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const pollingIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Check OneSignal subscription status
  const checkSubscriptionStatus = async () => {
    try {
      const isPushEnabled = await OneSignal.User.PushSubscription.optedIn;
      console.log("🔔 OneSignal subscription status:", isPushEnabled);
      setIsSubscribed(isPushEnabled);
      return isPushEnabled;
    } catch (e) {
      console.warn("OneSignal not ready yet:", e);
      return false;
    }
  };

  // On mount: check subscription + set listener
  useEffect(() => {
    checkSubscriptionStatus();

    if (window.OneSignal && window.OneSignal.User) {
      try {
        window.OneSignal.User.PushSubscription.addEventListener(
          "change",
          (event) => {
            console.log("🔔 Subscription changed:", event);
            setIsSubscribed(event.current.optedIn);
          }
        );
      } catch (e) {
        console.warn("Unable to attach PushSubscription change listener:", e);
      }
    }
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
        body,
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

      const lastSeenIdStr = localStorage.getItem(LAST_NOTIFICATION_ID_KEY);
      const lastSeenId = lastSeenIdStr ? parseInt(lastSeenIdStr, 10) : null;
      console.log("🔔 Last seen notification ID:", lastSeenId);

      const newNotifications = data.filter((notif) => {
        if (lastSeenId === null) return false;
        return notif.id > lastSeenId;
      });

      console.log("🔔 New notifications found:", newNotifications.length);

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

      if (data.length > 0) {
        const highestId = Math.max(...data.map((n) => n.id));
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

  // ✅ UPDATED: Handle notification click and redirect
  const handleNotificationClick = (notification) => {
    console.log("🔔 Notification clicked:", notification);

    const message = notification.message || "";
    const type = notification.type || "";
    const referenceId = notification.referenceId || null;
    const referenceType = notification.referenceType || "";

    // Close notification panel
    if (onClose) onClose();

    // Priority 1: Use backend-provided type and referenceId
    if (referenceId && referenceType) {
      switch (referenceType.toUpperCase()) {
        case "JOB":
          navigate(`/jobs/${referenceId}`);
          return;
        case "EVENT":
          navigate(`/events/${referenceId}`);
          return;
        case "COMMUNITY":
        case "COMMUNITY_POST":
          navigate(`/community/${referenceId}`);
          return;
        case "LOCAL_NEWS":
        case "NEWS":
          navigate(`/statenews/${referenceId}`);
          return;
        case "PROPERTY":  // ✅ NEW: Added PROPERTY support
          navigate(`/properties/${referenceId}`);
          return;
        default:
          console.warn("Unknown referenceType:", referenceType);
      }
    }

    // Priority 2: Parse message text for patterns
    const lowerMessage = message.toLowerCase();

    // Job approval
    if (lowerMessage.includes("job posting") && lowerMessage.includes("approved")) {
      navigate("/jobs");
      return;
    }

    // Event approval
    if (lowerMessage.includes("event") && lowerMessage.includes("approved")) {
      navigate("/events");
      return;
    }

    // Community post approval
    if (lowerMessage.includes("community post") && lowerMessage.includes("approved")) {
      navigate("/community");
      return;
    }

    // Property approval
    if (lowerMessage.includes("property") && lowerMessage.includes("approved")) {
      navigate("/properties");
      return;
    }

    // Comment on post
    if (lowerMessage.includes("commented on your post")) {
      // Try to determine post type from context
      if (referenceId) {
        // If we have referenceId but no referenceType, try community first
        navigate(`/community/${referenceId}`);
      } else {
        // Fallback to community page
        navigate("/community");
      }
      return;
    }

    // Reply to comment
    if (lowerMessage.includes("replied to your comment")) {
      if (referenceId) {
        navigate(`/community/${referenceId}`);
      } else {
        navigate("/community");
      }
      return;
    }

    // Default: Stay on current page or go to dashboard
    console.log("No specific redirect found for notification");
  };

  // Start polling on mount
  useEffect(() => {
    console.log("🔔 NotificationPanel mounted - starting background polling");

    fetchNotifications(true);

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
      checkSubscriptionStatus();
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
      localStorage.removeItem(LAST_NOTIFICATION_ID_KEY);
      if (onUnreadChange) onUnreadChange(false);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const handleDeleteNotification = async (id, event) => {
    // ✅ MODIFIED: Stop propagation to prevent triggering click handler
    event.stopPropagation();
    
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

  // Use OneSignal slidedown, forced, when user clicks Enable
  const handleRequestPermission = async () => {
    try {
      console.log("🔔 Showing OneSignal subscription prompt (forced)...");
      await OneSignal.Slidedown.promptPush({ force: true });

      // Re-check subscription after user interacts
      setTimeout(async () => {
        const subscribed = await checkSubscriptionStatus();
        if (subscribed) {
          console.log("✅ User subscribed successfully!");
        } else {
          console.log("ℹ️ User did not subscribe");
        }
      }, 2000);
    } catch (error) {
      console.error("❌ Error showing OneSignal prompt:", error);
    }
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
            fixed left-1/2 -translate-x-1/2 top-16
            sm:absolute sm:left-auto sm:translate-x-0 sm:right-4 sm:top-auto md:right-0 sm:mt-3 
            w-[90vw] max-w-[320px] sm:w-80 md:w-96 
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
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:opacity-80 focus:outline-none"
              title="Clear All Notifications"
            >
              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Clear
            </button>
          </div>

          {/* Permission Banner – only when NOT subscribed */}
          {!isSubscribed && (
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
                  onClick={() => handleNotificationClick(n)}
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
                    onClick={(e) => handleDeleteNotification(n.id, e)}
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
