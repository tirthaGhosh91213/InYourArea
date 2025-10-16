// src/components/RightSidebar.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Bell } from "lucide-react";
import NotificationPanel from "./NotificationPanel";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const isLoggedIn = Boolean(token);
  const isAdmin = role?.toLowerCase().includes("admin");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/v1/notifications/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    if (isLoggedIn) fetchNotifications();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="w-80 flex flex-col pr-32 sm:px-0">
      {/* ====== Sidebar Cards ====== */}
      <motion.div className="bg-white p-4 rounded-xl shadow-lg flex gap-3 items-start mt-5 hover:bg-green-50 transition">
        <img
          src="https://cdn-icons-png.flaticon.com/512/561/561127.png"
          alt="Email Icon"
          className="w-10 h-10"
        />
        <div>
          <h4 className="font-semibold text-gray-800">Daily Email Updates</h4>
          <p className="text-sm text-gray-500 mt-1">
            Get community and business updates delivered to your inbox.
          </p>
        </div>
      </motion.div>

      <motion.div className="bg-white p-4 rounded-xl shadow-lg flex gap-3 items-start mt-3 hover:bg-green-50 transition">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2721/2721292.png"
          alt="Business Icon"
          className="w-10 h-10"
        />
        <div>
          <h4 className="font-semibold text-gray-800">Grow Your Business</h4>
          <p className="text-sm text-gray-500 mt-1">
            Connect with local users and boost your brand visibility.
          </p>
        </div>
      </motion.div>

      {/* ====== Account Section ====== */}
      {isLoggedIn && (
        <motion.div className="flex justify-end items-center gap-3 mt-5 relative">
          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setNotifOpen((p) => !p);
                setDropdownOpen(false);
              }}
              className="relative bg-white rounded-full p-2 shadow-md hover:bg-green-50 transition"
            >
              <Bell className="text-green-500" size={22} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </motion.button>

            <NotificationPanel
              notifOpen={notifOpen}
              notifications={notifications}
              loading={loading}
              onClose={() => setNotifOpen(false)}
              onClear={clearNotifications}
            />
          </div>

          {/* My Account Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDropdownOpen((p) => !p);
                setNotifOpen(false);
              }}
              className="bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-full px-5 py-2 shadow-md flex items-center gap-1"
            >
              My Account <ChevronDown size={18} />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-10"
                >
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => {
                          navigate("/dashboard");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 transition"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 transition"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
