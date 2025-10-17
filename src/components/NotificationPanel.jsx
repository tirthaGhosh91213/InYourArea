// src/components/NotificationPanel.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";
import axios from "axios";

export default function NotificationPanel({ notifOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications for the logged-in author
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await axios.get("http://localhost:8000/api/v1/notifications?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen]);

  const handleClear = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      await axios.delete("http://localhost:8000/api/v1/notifications/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  return (
    <AnimatePresence>
      {notifOpen && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl z-20 border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <h4 className="font-semibold">Notifications</h4>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-sm hover:opacity-80"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="animate-spin text-green-500 w-6 h-6" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-gray-500 py-6 text-sm">
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-green-50 transition cursor-pointer ${
                    !n.read ? "bg-green-50" : ""
                  }`}
                >
                  <h5 className="font-medium text-gray-800">{n.title}</h5>
                  <p className="text-sm text-gray-500">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
