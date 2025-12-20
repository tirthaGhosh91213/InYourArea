import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2, Bell, BellOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../utils/notificationService";

export default function NotificationPanel({
  notifOpen,
  onClose,
  onUnreadChange,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    Notification.permission
  );
  const previousNotificationsRef = useRef([]);
  const pollingIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Request notification permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const permission = await notificationService.requestPermission();
      setNotificationPermission(permission);
    };
    checkPermission();
  }, []);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/notifications/recent?limit=50",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.data || [];
      
      // Check for new notifications
      if (previousNotificationsRef.current.length > 0) {
        const newNotifications = data.filter(
          (newNotif) =>
            !previousNotificationsRef.current.some(
              (oldNotif) => oldNotif.id === newNotif.id
            )
        );

        // Show browser notification for each new notification
        if (newNotifications.length > 0 && notificationService.hasPermission()) {
          newNotifications.forEach((notif) => {
            notificationService.showNotification(
              "New Notification",
              {
                body: notif.message || "You have a new notification",
                icon: "/logo.png",
                tag: `notification-${notif.id}`, // Prevent duplicate notifications
                data: { id: notif.id, createdAt: notif.createdAt },
              }
            );
          });
        }
      }

      previousNotificationsRef.current = data;
      setNotifications(data);
      if (onUnreadChange) onUnreadChange(data.length > 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
      
      // Start polling
      pollingIntervalRef.current = setInterval(() => {
        fetchNotifications(true); // Silent fetch
      }, 30000); // 30 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
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
      previousNotificationsRef.current = [];
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
      previousNotificationsRef.current = updated;
      if (onUnreadChange) onUnreadChange(updated.length > 0);
    } catch (err) {
      console.error(`Error deleting notification ${id}:`, err);
    }
  };

  const handleRequestPermission = async () => {
    const permission = await notificationService.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      // Show test notification
      notificationService.showNotification(
        "Notifications Enabled! 🎉",
        {
          body: "You will now receive push notifications",
          icon: "/logo.png",
        }
      );
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
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm hover:opacity-80 focus:outline-none"
              title="Clear All Notifications"
            >
              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Clear
            </button>
          </div>

          {/* Permission Banner */}
          {notificationPermission !== 'granted' && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 sm:px-6 py-3">
              <div className="flex items-start gap-3">
                <BellOff size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
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

                  {/* Delete button */}
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
