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
  Sun,
  CloudRain,
  Cloud,
  Moon,
  Zap,
} from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import Sidebar from "./SideBar";
import axios from "axios";

const WEATHER_API_KEY = "08e6542c3ce14ae39f1174408252212";

// localStorage keys
const GEO_DENIED_KEY = "JBU_LOCAL_GEO_DENIED_AT";
const WEATHER_CACHE_KEY = "JBU_WEATHER_CACHE";

// Time constants
const GEO_RETRY_AFTER_MS = 24 * 60 * 60 * 1000; // 1 day
const WEATHER_CACHE_TTL = 60 * 60 * 1000; // 1 hour

const FALLBACK_CITIES = [
  "Ranchi, Jharkhand",
  "Jamshedpur, Jharkhand",
  "Dhanbad, Jharkhand",
  "Bokaro, Jharkhand",
  "Deoghar, Jharkhand",
  "Patna, Bihar",
  "Gaya, Bihar",
  "Bhagalpur, Bihar",
  "Muzaffarpur, Bihar",
  "Darbhanga, Bihar",
];

function getRandomFallbackCity() {
  return FALLBACK_CITIES[Math.floor(Math.random() * FALLBACK_CITIES.length)];
}

// Weather cache helpers with TTL
function setWeatherCache(weatherData) {
  try {
    const cacheEntry = {
      data: weatherData,
      cachedAt: Date.now(),
      expiresAt: Date.now() + WEATHER_CACHE_TTL,
    };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (e) {
    console.error("Failed to cache weather:", e);
  }
}

function getWeatherCache() {
  try {
    const stored = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!stored) return null;

    const cacheEntry = JSON.parse(stored);
    if (Date.now() > cacheEntry.expiresAt) {
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }

    return cacheEntry.data;
  } catch (e) {
    localStorage.removeItem(WEATHER_CACHE_KEY);
    return null;
  }
}

// Map weather condition to icon component and theme
function getWeatherStyle(conditionText, isDay) {
  const text = (conditionText || "").toLowerCase();

  if (text.includes("thunder") || text.includes("storm")) {
    return {
      icon: Zap,
      gradient: "from-slate-700 via-slate-600 to-indigo-600",
      iconColor: "text-yellow-300",
    };
  }
  if (text.includes("rain") || text.includes("drizzle") || text.includes("shower")) {
    return {
      icon: CloudRain,
      gradient: isDay
        ? "from-sky-600 via-sky-500 to-blue-500"
        : "from-slate-800 via-slate-700 to-blue-900",
      iconColor: isDay ? "text-blue-100" : "text-blue-300",
    };
  }
  if (text.includes("cloud") || text.includes("overcast")) {
    return {
      icon: Cloud,
      gradient: isDay
        ? "from-slate-400 via-slate-300 to-gray-400"
        : "from-slate-900 via-slate-800 to-slate-700",
      iconColor: isDay ? "text-slate-100" : "text-slate-400",
    };
  }
  if (text.includes("clear") || text.includes("sunny")) {
    return {
      icon: isDay ? Sun : Moon,
      gradient: isDay
        ? "from-amber-400 via-orange-400 to-yellow-500"
        : "from-indigo-900 via-slate-800 to-slate-900",
      iconColor: isDay ? "text-yellow-100" : "text-indigo-200",
    };
  }

  return {
    icon: isDay ? Sun : Moon,
    gradient: isDay
      ? "from-sky-500 via-sky-400 to-blue-500"
      : "from-slate-900 via-slate-800 to-slate-700",
    iconColor: isDay ? "text-sky-100" : "text-slate-400",
  };
}

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

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const fetchWeatherAndCache = async (query, type = "geo") => {
    try {
      setWeatherLoading(true);
      const res = await axios.get("https://api.weatherapi.com/v1/current.json", {
        params: { key: WEATHER_API_KEY, q: query, aqi: "no" },
      });
      const loc = res.data.location;
      const cur = res.data.current;

      const weatherData = {
        type,
        query,
        city: loc.name,
        tempC: cur.temp_c,
        conditionText: cur.condition?.text,
        isDay: cur.is_day === 1,
      };

      setWeather(weatherData);
      setWeatherCache(weatherData);
    } catch (e) {
      console.error("Weather fetch failed:", e);
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Initialize weather on mount
  useEffect(() => {
    const initWeather = async () => {
      // Step 1: Check cache first
      const cached = getWeatherCache();
      if (cached) {
        setWeather(cached);
        setWeatherLoading(false);
        return;
      }

      // Step 2: No cache, check if we should retry geolocation
      const shouldRetryGeo = () => {
        try {
          const stored = localStorage.getItem(GEO_DENIED_KEY);
          if (!stored) return true;
          const lastDenied = parseInt(stored, 10);
          if (Number.isNaN(lastDenied)) return true;
          return Date.now() - lastDenied > GEO_RETRY_AFTER_MS;
        } catch {
          return true;
        }
      };

      // Step 3: Handle geolocation or fallback
      const fallbackToStateCity = async () => {
        const city = getRandomFallbackCity();
        await fetchWeatherAndCache(city, "fallback");
      };

      if (!("geolocation" in navigator)) {
        await fallbackToStateCity();
        return;
      }

      if (!shouldRetryGeo()) {
        await fallbackToStateCity();
        return;
      }

      // Try geolocation
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            localStorage.removeItem(GEO_DENIED_KEY);
          } catch {}
          await fetchWeatherAndCache(
            `${pos.coords.latitude},${pos.coords.longitude}`,
            "geo"
          );
        },
        async (error) => {
          try {
            localStorage.setItem(GEO_DENIED_KEY, String(Date.now()));
          } catch {}
          await fallbackToStateCity();
        },
        { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 }
      );
    };

    initWeather();
  }, []);

  // Notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/notifications/recent?limit=50",
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

  // Weather UI
  const renderWeather = () => {
    if (weatherLoading && !weather) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs shadow-sm">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span className="hidden sm:inline">Detecting...</span>
        </div>
      );
    }

    if (!weather) {
      return (
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          <span className="font-bold text-sm sm:text-base text-green-700">
            Jharkhand & Bihar
          </span>
        </div>
      );
    }

    const { icon: WeatherIcon, gradient, iconColor } = getWeatherStyle(
      weather.conditionText,
      weather.isDay
    );

    return (
      <motion.div
        className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:py-2 rounded-full bg-gradient-to-r ${gradient} text-white shadow-md`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <WeatherIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg font-bold">
            {Math.round(weather.tempC)}°
          </span>
          <div className="h-3 w-[1px] bg-white/30" />
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 opacity-80" />
            <span className="text-xs sm:text-sm font-medium truncate max-w-[60px] sm:max-w-[80px]">
              {weather.city}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm flex justify-between items-center px-3 sm:px-6 py-2.5 sm:py-3"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="sm:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!isLoggedIn) return navigate("/login");
                setLeftSidebarOpen(true);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
          {renderWeather()}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn && (
            <div className="relative" ref={notifRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  if (!notifOpen) {
                    fetchNotifications();
                    setHasNewNotif(false);
                  }
                }}
                className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {hasNewNotif && unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition text-sm"
              >
                <User size={16} />
                <span>Account</span>
                <ChevronDown size={14} />
              </motion.button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg overflow-hidden z-50"
                  >
                    {isAdmin ? (
                      <button
                        onClick={() => handleNavigation("/dashboard")}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
                      >
                        Dashboard
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavigation("/user-dashboard")}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition"
                      >
                        Profile
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="hidden sm:block px-3 py-1.5 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition"
            >
              Login
            </motion.button>
          )}

          <div className="sm:hidden">
            {isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRightSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5 text-gray-700" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition"
              >
                Login
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      <Sidebar
        sidebarOpen={isDesktop || leftSidebarOpen}
        onClose={() => setLeftSidebarOpen(false)}
      />

      <AnimatePresence>
        {rightSidebarOpen && isLoggedIn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[60] sm:hidden"
              onClick={() => setRightSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-[70] sm:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-base font-semibold text-gray-800">Account</h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRightSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>
              <div className="flex flex-col p-4 gap-2">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <User className="w-5 h-5 text-green-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {isAdmin ? "Admin" : "User"}
                    </p>
                    <p className="text-xs text-gray-600">Settings</p>
                  </div>
                </div>
                {isAdmin ? (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/user-dashboard")}
                    className="flex items-center gap-2 p-3 text-left hover:bg-gray-50 rounded-lg text-sm"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-3 text-left hover:bg-red-50 rounded-lg text-red-600 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
