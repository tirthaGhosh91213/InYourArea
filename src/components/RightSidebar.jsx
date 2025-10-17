// src/components/RightSidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  ChevronDown,
  MapPin,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import Sidebar from "./SideBar";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const isLoggedIn = Boolean(token);
  const isAdmin = role?.toLowerCase().includes("admin");

  // ✅ Redirect to login if user tries to access restricted sidebar
  useEffect(() => {
    if (!isLoggedIn) {
      // do not auto-redirect immediately on all pages
      // only when trying to access dashboard or profile
    }
  }, [isLoggedIn]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const mockData = [
        {
          id: 1,
          title: "Event Approved",
          message: "Your event 'Bokaro Bazaar' has been approved by admin!",
          createdAt: new Date(),
          read: false,
        },
        {
          id: 2,
          title: "Event Pending",
          message: "Your event 'Delhi Meetup' is pending approval.",
          createdAt: new Date(),
          read: false,
        },
        {
          id: 3,
          title: "Comment Received",
          message: "Someone commented on your event 'Bokaro Bazaar'.",
          createdAt: new Date(),
          read: false,
        },
      ];
      setNotifications(mockData);
      setUnreadCount(mockData.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate(path);
    setDropdownOpen(false);
    setRightSidebarOpen(false);
    setLeftSidebarOpen(false);
  };

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

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setNotifOpen(false);
        setRightSidebarOpen(false);
        setLeftSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <>
      {/* ✅ Top Navbar */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-md flex justify-between items-center px-4 sm:px-6 py-3 gap-4"
      >
        {/* Left side */}
        <div className="flex items-center gap-3">
          {/* Left sidebar (menu icon on small screens) */}
          <div className="sm:hidden">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!isLoggedIn) return navigate("/login"); // ✅ redirect if not logged in
                setLeftSidebarOpen(true);
              }}
              className="p-2 rounded-full hover:bg-green-100 transition"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="font-extrabold w-6 h-6 sm:w-9 sm:h-9 text-green-600" />
            <span className="font-extrabold text-lg sm:text-xl text-green-700">
              Jharkhand
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications (only for logged in users) */}
          {isLoggedIn && (
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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
              <NotificationPanel
                notifOpen={notifOpen}
                notifications={notifications}
                loading={loading}
                onClose={() => setNotifOpen(false)}
                onClear={handleClearNotifications}
              />
            </div>
          )}

          {/* ✅ If logged in → show My Account dropdown */}
          {isLoggedIn ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
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
                        onClick={() => handleNavigation("/dashboard")}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 transition"
                      >
                        Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavigation("/user-dashboard")}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 transition"
                      >
                        Profile
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // ✅ If not logged in → show Register/Login button
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="hidden sm:block px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
            >
              Register / Login
            </motion.button>
          )}

          {/* ✅ Mobile: Profile or Register icon */}
          <div className="sm:hidden">
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRightSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-green-100 transition"
              >
                <User className="w-6 h-6 text-gray-700" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
              >
                <User className="w-6 h-6" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ✅ Left Sidebar (only if logged in) */}
      <AnimatePresence>
        {leftSidebarOpen && isLoggedIn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setLeftSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLeftSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Right Profile Sidebar (mobile) */}
      <AnimatePresence>
        {rightSidebarOpen && isLoggedIn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] sm:hidden"
              onClick={() => setRightSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-[70] sm:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  My Account
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRightSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>

              <div className="flex flex-col p-4 gap-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <User className="w-6 h-6 text-green-700" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {isAdmin ? "Admin User" : "Regular User"}
                    </p>
                    <p className="text-sm text-gray-600">User Settings</p>
                  </div>
                </div>

                {isAdmin ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-green-50 rounded-lg transition"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    Dashboard
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/user-dashboard")}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-green-50 rounded-lg transition"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    Profile
                  </motion.button>
                )}

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 rounded-lg text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
