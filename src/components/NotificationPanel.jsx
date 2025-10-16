// src/components/NotificationPanel.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Trash2 } from "lucide-react";

export default function NotificationPanel({
  notifOpen,
  notifications,
  loading,
  onClose,
  onClear,
}) {
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
              onClick={onClear}
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
                  className="px-4 py-3 hover:bg-green-50 transition cursor-pointer"
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
