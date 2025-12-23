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
  Calendar,
  Clock,
} from "lucide-react";
import NotificationPanel from "./NotificationPanel";
import Sidebar from "./SideBar";
import axios from "axios";

const WEATHER_API_KEY = "08e6542c3ce14ae39f1174408252212";

// localStorage keys
const WEATHER_CACHE_KEY = "JBU_WEATHER_CACHE";
const GEO_PERMISSION_STATE_KEY = "JBU_GEO_PERMISSION_STATE";
const LAST_KNOWN_POSITION_KEY = "JBU_LAST_POSITION";
const OAUTH_REDIRECT_FLAG = "JBU_OAUTH_REDIRECT";

// Cache TTL
const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Maximum distance drift before re-fetching weather (in km)
const MAX_LOCATION_DRIFT_KM = 5;

// Minimum accuracy required (in meters)
const MIN_ACCURACY_METERS = 1000;

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}

// Weather cache helpers
function setWeatherCache(weatherData) {
  try {
    const cacheEntry = {
      data: weatherData,
      cachedAt: Date.now(),
      expiresAt: Date.now() + WEATHER_CACHE_TTL,
    };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheEntry));

    // Also store last known position
    localStorage.setItem(
      LAST_KNOWN_POSITION_KEY,
      JSON.stringify({ lat: weatherData.lat, lon: weatherData.lon })
    );
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
      console.log("Weather cache expired");
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }

    return cacheEntry.data;
  } catch (e) {
    localStorage.removeItem(WEATHER_CACHE_KEY);
    return null;
  }
}

function getLastKnownPosition() {
  try {
    const stored = localStorage.getItem(LAST_KNOWN_POSITION_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

// Check if this is an OAuth redirect
function checkOAuthRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  const hasOAuthParams = urlParams.has("code") || urlParams.has("state");

  if (hasOAuthParams) {
    console.log("OAuth redirect detected");
    localStorage.setItem(OAUTH_REDIRECT_FLAG, "true");
    return true;
  }

  // Check if we previously detected OAuth
  const wasOAuth = localStorage.getItem(OAUTH_REDIRECT_FLAG) === "true";
  if (wasOAuth) {
    localStorage.removeItem(OAUTH_REDIRECT_FLAG);
  }

  return wasOAuth;
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
  if (
    text.includes("rain") ||
    text.includes("drizzle") ||
    text.includes("shower")
  ) {
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

// Date/Time Component for when geolocation is denied
function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <motion.div
      className="flex items-stretch gap-2 sm:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-300/60 bg-white/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Left: Clock icon + time */}
      <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-slate-300/50">
        <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-slate-300/60 bg-slate-50/50">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-700" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-medium">
            Current Time
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-900 tabular-nums">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Right: Date */}
      <div className="flex flex-col justify-center pl-0.5 sm:pl-1">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Today
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600" />
          <span className="text-[11px] sm:text-xs font-medium text-slate-900">
            {formatDate(currentTime)}
          </span>
        </div>
      </div>
    </motion.div>
  );
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
  const watchIdRef = useRef(null);
  const isWatchingRef = useRef(false);
  const positionAttemptRef = useRef(0);

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
  const [geoPermissionDenied, setGeoPermissionDenied] = useState(false);

  // Fetch weather with coordinates
  const fetchWeatherAndCache = async (lat, lon, accuracy) => {
    try {
      console.log(
        `Fetching weather for: ${lat}, ${lon} (accuracy: ${accuracy}m)`
      );

      const res = await axios.get(
        "https://api.weatherapi.com/v1/current.json",
        {
          params: {
            key: WEATHER_API_KEY,
            q: `${lat},${lon}`,
            aqi: "no",
          },
        }
      );

      const loc = res.data.location;
      const cur = res.data.current;

      const weatherData = {
        city: loc.name,
        region: loc.region,
        tempC: cur.temp_c,
        conditionText: cur.condition?.text,
        isDay: cur.is_day === 1,
        lat,
        lon,
        accuracy,
        fetchedAt: Date.now(),
      };

      console.log("Weather fetched successfully:", weatherData.city);
      setWeather(weatherData);
      setWeatherCache(weatherData);
      setWeatherLoading(false);
    } catch (e) {
      console.error("Weather fetch failed:", e);
      setWeatherLoading(false);
    }
  };

  // Initialize geolocation with watchPosition
  useEffect(() => {
    if (isWatchingRef.current) {
      console.log("Already watching position, skipping initialization");
      return;
    }

    const initWeather = async () => {
      console.log("Initializing weather system...");

      const isOAuthRedirect = checkOAuthRedirect();

      if (isOAuthRedirect) {
        console.log("OAuth redirect detected - forcing fresh location");
        localStorage.removeItem(WEATHER_CACHE_KEY);
        localStorage.removeItem(LAST_KNOWN_POSITION_KEY);
      }

      if (!("geolocation" in navigator)) {
        console.log("Geolocation not supported");
        setGeoPermissionDenied(true);
        setWeatherLoading(false);
        localStorage.setItem(GEO_PERMISSION_STATE_KEY, "unsupported");
        return;
      }

      const storedPermission = localStorage.getItem(GEO_PERMISSION_STATE_KEY);

      if (
        storedPermission === "denied" ||
        storedPermission === "unsupported"
      ) {
        console.log("Geolocation previously denied or unsupported");
        setGeoPermissionDenied(true);
        setWeatherLoading(false);
        return;
      }

      if (!isOAuthRedirect) {
        const cached = getWeatherCache();
        const lastPosition = getLastKnownPosition();

        if (cached && lastPosition) {
          console.log("Using cached weather:", cached.city);
          setWeather(cached);
          setWeatherLoading(false);
        }
      }

      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      };

      const successCallback = (position) => {
        positionAttemptRef.current += 1;
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log(
          `Position #${positionAttemptRef.current}: ${newLat}, ${newLon} (accuracy: ${accuracy}m)`
        );

        if (
          (positionAttemptRef.current === 1 || isOAuthRedirect) &&
          accuracy > MIN_ACCURACY_METERS
        ) {
          console.log(
            `Rejecting low-accuracy position (${accuracy}m > ${MIN_ACCURACY_METERS}m), waiting for better...`
          );
          return;
        }

        setGeoPermissionDenied(false);
        localStorage.setItem(GEO_PERMISSION_STATE_KEY, "granted");

        const lastPos = getLastKnownPosition();
        const cached = getWeatherCache();
        let shouldFetch = true;

        if (lastPos && cached && !isOAuthRedirect) {
          const distance = calculateDistance(
            lastPos.lat,
            lastPos.lon,
            newLat,
            newLon
          );

          console.log(`Distance from last position: ${distance.toFixed(2)} km`);

          if (distance < MAX_LOCATION_DRIFT_KM) {
            const cacheAge = Date.now() - (cached.fetchedAt || 0);
            if (cacheAge < WEATHER_CACHE_TTL) {
              console.log(
                "Location drift minimal and cache valid, using cache"
              );
              shouldFetch = false;
            }
          } else {
            console.log(
              "Location changed significantly, fetching new weather"
            );
            localStorage.removeItem(WEATHER_CACHE_KEY);
          }
        }

        if (shouldFetch) {
          fetchWeatherAndCache(newLat, newLon, accuracy);
        }
      };

      const errorCallback = (error) => {
        console.error("Geolocation error:", error.message, error.code);

        if (error.code === 1) {
          console.log("User denied geolocation");
          setGeoPermissionDenied(true);
          localStorage.setItem(GEO_PERMISSION_STATE_KEY, "denied");
          localStorage.removeItem(WEATHER_CACHE_KEY);
          localStorage.removeItem(LAST_KNOWN_POSITION_KEY);
        } else if (error.code === 2) {
          console.log("Position unavailable");
        } else if (error.code === 3) {
          console.log("Geolocation timeout - retrying with longer timeout");
        }

        setWeatherLoading(false);
      };

      if (isOAuthRedirect || positionAttemptRef.current === 0) {
        console.log("Getting immediate high-accuracy position...");
        try {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("Immediate position obtained");
              successCallback(position);

              if (!isWatchingRef.current) {
                console.log(
                  "Starting position watch after immediate position..."
                );
                isWatchingRef.current = true;
                watchIdRef.current = navigator.geolocation.watchPosition(
                  successCallback,
                  errorCallback,
                  geoOptions
                );
                console.log(
                  "Position watch started with ID:",
                  watchIdRef.current
                );
              }
            },
            (error) => {
              console.error("Failed to get immediate position:", error);
              errorCallback(error);

              if (error.code !== 1 && !isWatchingRef.current) {
                console.log(
                  "Starting position watch despite immediate position failure..."
                );
                isWatchingRef.current = true;
                watchIdRef.current = navigator.geolocation.watchPosition(
                  successCallback,
                  errorCallback,
                  geoOptions
                );
              }
            },
            { ...geoOptions, timeout: 20000 }
          );
        } catch (e) {
          console.error("Error getting immediate position:", e);
          errorCallback({ code: 2, message: e.message });
        }
      } else {
        try {
          console.log("Starting position watch...");
          isWatchingRef.current = true;

          watchIdRef.current = navigator.geolocation.watchPosition(
            successCallback,
            errorCallback,
            geoOptions
          );

          console.log("Position watch started with ID:", watchIdRef.current);
        } catch (e) {
          console.error("Error setting up geolocation watch:", e);
          setGeoPermissionDenied(true);
          setWeatherLoading(false);
          isWatchingRef.current = false;
        }
      }
    };

    initWeather();

    return () => {
      if (watchIdRef.current !== null) {
        console.log("Stopping position watch with ID:", watchIdRef.current);
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        isWatchingRef.current = false;
      }
    };
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

  // Render weather or date/time
  const renderLocationInfo = () => {
    if (weatherLoading && !weather && !geoPermissionDenied) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300/60 bg-white/40 backdrop-blur-sm shadow-sm">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs sm:text-sm text-slate-600 hidden sm:inline">
            Loading...
          </span>
        </div>
      );
    }

    if (geoPermissionDenied) {
      return <DateTimeDisplay />;
    }

    if (!weather) {
      return <DateTimeDisplay />;
    }

    const { icon: WeatherIcon, gradient, iconColor } = getWeatherStyle(
      weather.conditionText,
      weather.isDay
    );

    return (
      <motion.div
        key={`weather-${weather.city}-${weather.lat}`}
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
          {renderLocationInfo()}
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
                <h2 className="text-base font-semibold text-gray-800">
                  Account
                </h2>
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
