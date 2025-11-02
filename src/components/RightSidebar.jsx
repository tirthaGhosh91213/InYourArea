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
import axios from "axios";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasNewNotif, setHasNewNotif] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");
  const isLoggedIn = Boolean(token);
  const isAdmin = role?.toLowerCase().includes("admin");

  // Media query for desktop sizing
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await axios.get(
        "https://cached-nursery-kevin-advances.trycloudflare.com//api/v1/notifications/recent?limit=50",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data?.data || [];
      setNotifications(data);
      setUnreadCount(data.length);
      setHasNewNotif(data.length > 0);
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
      setHasNewNotif(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    setHasNewNotif(false);
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

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
                if (!isLoggedIn) return navigate("/login");
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
              Jharkhand & Bihar
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isLoggedIn && (
            <div className="relative" ref={notifRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  if (!notifOpen) {
                    fetchNotifications();
                    setHasNewNotif(false);
                  }
                }}
                className="relative p-2 rounded-full hover:bg-green-100 transition"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {hasNewNotif && unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="hidden sm:block px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
            >
              Register / Login
            </motion.button>
          )}

          {/* Mobile Account Icon */}
          <div className="sm:hidden">
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRightSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-green-100 transition"
              >
                <User className="w-6 h-6" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
              >
                Login
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ALWAYS show sidebar on desktop, toggle on mobile */}
      <Sidebar
        sidebarOpen={isDesktop || leftSidebarOpen}
        onClose={() => setLeftSidebarOpen(false)}
      />

      {/* Right Profile Sidebar */}
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
