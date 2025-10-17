// src/components/RightSidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, Bell } from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import axios from "axios";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const isLoggedIn = Boolean(token);
  const isAdmin = role?.toLowerCase().includes("admin");

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  // ✅ Fetch Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Clear all notifications
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // ✅ Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-md flex justify-end items-center px-6 py-3 gap-4"
    >
      {/* ===== Notification Bell ===== */}
      <div className="relative" ref={notifRef}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setNotifOpen((prev) => !prev);
            if (!notifOpen) fetchNotifications();
          }}
          className="relative p-2 rounded-full hover:bg-green-100 transition"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
              {notifications.length}
            </span>
          )}
        </motion.button>

        {/* ✅ Connected Notification Panel */}
        <NotificationPanel
          notifOpen={notifOpen}
          notifications={notifications}
          loading={loading}
          onClose={() => setNotifOpen(false)}
          onClear={handleClearNotifications}
        />
      </div>

      {/* ===== My Account Dropdown ===== */}
      <div className="relative" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
        >
          <User size={18} />
          My Account
          <ChevronDown size={16} />
        </motion.button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-50"
            >
              {isAdmin ? (
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 transition"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 transition"
                >
                  Profile
                </button>
              )}

              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("role");
                  navigate("/login");
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
