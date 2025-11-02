import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NotificationPanel({
  notifOpen,
  onClose,
  onUnreadChange,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        "https://miami-only-great-buf.trycloudflare.com/api/v1/notifications/recent?limit=50",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.data || [];
      setNotifications(data);
      if (onUnreadChange) onUnreadChange(data.length > 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen]);

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.delete("https://miami-only-great-buf.trycloudflare.com/api/v1/notifications/clear-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications([]);
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

      await axios.delete(`https://miami-only-great-buf.trycloudflare.com/api/v1/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      if (onUnreadChange) onUnreadChange(updated.length > 0);
    } catch (err) {
      console.error(`Error deleting notification ${id}:`, err);
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
                  <h5 className="font-semibold text-gray-900 text-sm sm:text-base">
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
