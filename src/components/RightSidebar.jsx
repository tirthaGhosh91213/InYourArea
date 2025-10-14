// src/components/RightSidebar.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Bell, Trash2, X, Loader2 } from "lucide-react";
import AdminDashboard from "../pages/AdminDashboard"; // ✅ Import

export default function RightSidebar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false); // ✅ New

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const isLoggedIn = Boolean(token);
  const isAdmin = role?.toLowerCase().includes("admin"); // ✅ robust check

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

  useEffect(() => {
    if (isLoggedIn) fetchNotifications();
  }, [isLoggedIn]);

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/notifications/clear-all", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    setShowDashboard(false);
    navigate("/login");
  };

  // ✅ Show dashboard directly if admin clicked Dashboard
  if (showDashboard && isAdmin) {
    return <AdminDashboard onBack={() => setShowDashboard(false)} />;
  }

  return (
    <div className="w-80 flex flex-col pr-32 sm:px-0">
      {/* ======= HEADER (Notifications + Account) ======= */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 80 }}
        className="flex justify-end items-center gap-3 relative"
      >
        {/* 🔔 Notification Bell */}
        {isLoggedIn && (
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

            {/* Notification Dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 80 }}
                  className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-xl z-20 border border-gray-100"
                >
                  <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-green-400 to-green-500 text-white rounded-t-xl">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Clear All
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="p-4 flex justify-center text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No new notifications ✨
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto">
                      {notifications.map((notif) => (
                        <motion.li
                          key={notif.id}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-between items-start p-3 border-b hover:bg-green-50 transition"
                        >
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {notif.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {notif.message}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-red-500 hover:text-red-600 transition"
                          >
                            <X size={16} />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 👤 Account / Login */}
        {isLoggedIn ? (
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

            {/* Dropdown */}
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
                          setShowDashboard(true);
                          setDropdownOpen(false);
                          navigate("/dashboard")
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
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-full px-5 py-2 shadow-md"
          >
            Register or Sign In
          </motion.button>
        )}
      </motion.div>

      {/* Sidebar Cards */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-xl shadow-lg flex gap-3 items-start mt-5 hover:bg-green-50 transition"
      >
        <img src="https://cdn-icons-png.flaticon.com/512/561/561127.png" alt="Email Icon" className="w-10 h-10" />
        <div>
          <h4 className="font-semibold text-gray-800">Daily Email Updates</h4>
          <p className="text-sm text-gray-500 mt-1">
            Updates in your area sent directly to your email inbox
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-4 rounded-xl shadow-lg flex gap-3 items-start mt-3 hover:bg-green-50 transition"
      >
        <img src="https://cdn-icons-png.flaticon.com/512/2721/2721292.png" alt="Business Icon" className="w-10 h-10" />
        <div>
          <h4 className="font-semibold text-gray-800">Grow your business with us</h4>
          <p className="text-sm text-gray-500 mt-1">
            We connect you with the people and communities that matter to your business.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
