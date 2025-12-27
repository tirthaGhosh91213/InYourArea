import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  PlusCircle,
  Search as SearchIcon,
  ExternalLink,
  ArrowRight,
  X,
  Users,
} from "lucide-react";
import { MdVerified } from "react-icons/md";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import SmallAdd from "../components/SmallAdd";
import LargeAd from "../components/LargeAd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

// Helper: Get next index in circular manner
function getNextIndex(current, total) {
  if (total === 0) return 0;
  return (current + 1) % total;
}

// Helper: Shuffle an array (for large ads order)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const SLOT_KEYS = {
  TOP_RIGHT: "EVENTS_AD_INDEX_TOP_RIGHT",
  BOTTOM_RIGHT: "EVENTS_AD_INDEX_BOTTOM_RIGHT",
  LARGE_AD_1: "EVENTS_LARGE_AD_INDEX_1",
  LARGE_AD_2: "EVENTS_LARGE_AD_INDEX_2",
};

// 🔥 Check if event is over - using END DATE if available, otherwise START DATE
const isEventOver = (eventDate, endDate) => {
  // Use endDate if available, otherwise use eventDate
  const dateToCheck = endDate || eventDate;
  
  if (!dateToCheck) return false;
  
  const now = new Date();
  const eventDateTime = new Date(dateToCheck);
  
  // Set time to midnight (00:00:00) for both dates to compare only dates
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventOnlyDate = new Date(eventDateTime.getFullYear(), eventDateTime.getMonth(), eventDateTime.getDate());
  
  // Event is over if the event date is before today's date
  return eventOnlyDate < todayDate;
};

// Event Card Component - WITH EVENT OVER STAMP
const EventCard = ({ event, index }) => {
  const navigate = useNavigate();
  
  const hasLocation = event.location && event.location.trim();
  const hasDate = event.eventDate;
  const hasEndDate = event.endDate; // 🆕 Check for end date
  const hasRegLink = event.reglink && event.reglink.trim();
  const eventIsOver = isEventOver(event.eventDate, event.endDate); // 🆕 Pass both dates

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      fullDate: date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // 🆕 Format date without time (for end date)
  const formatDateOnly = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const dateInfo = hasDate ? formatDate(event.eventDate) : null;
  const endDateInfo = hasEndDate ? formatDateOnly(event.endDate) : null; // 🆕

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
      className={`relative bg-white rounded-3xl p-4 shadow-2xl transition-all duration-300 ${
        eventIsOver 
          ? "opacity-75 hover:shadow-[0_20px_40px_-12px_rgba(100,100,100,0.3)]" 
          : "hover:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.4)]"
      }`}
      style={{ 
        boxShadow: eventIsOver 
          ? "0 15px 20px -5px rgba(0, 0, 0, 0.15), 0 8px 8px -5px rgba(0, 0, 0, 0.08)"
          : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
      {/* 🔥 EVENT OVER STAMP - Top Right Corner */}
      {eventIsOver && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            delay: index * 0.05 + 0.2 
          }}
          className="absolute -top-2 -right-2 z-20"
        >
          <div className="relative">
            {/* Stamp Background */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-4 py-2 rounded-xl shadow-2xl border-2 border-red-300 transform rotate-12">
              <div className="flex flex-col items-center">
                <span className="text-xs font-black tracking-wider">EVENT</span>
                <span className="text-lg font-black leading-none">OVER</span>
              </div>
            </div>
            {/* Stamp Border Effect */}
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-xl transform rotate-12 -z-10"></div>
          </div>
        </motion.div>
      )}

      {/* INNER CARD */}
      <div className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
        eventIsOver ? "grayscale-[50%]" : ""
      }`}>
        {/* Image Container with Date Badge */}
        <div className="relative h-56 overflow-hidden group">
          {Array.isArray(event.imageUrls) && event.imageUrls.length > 0 ? (
            <img
              src={event.imageUrls[0]}
              alt={event.title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                eventIsOver 
                  ? "group-hover:scale-105 filter brightness-75" 
                  : "group-hover:scale-110"
              }`}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              eventIsOver 
                ? "bg-gradient-to-br from-gray-400 to-gray-500" 
                : "bg-gradient-to-br from-purple-400 to-blue-500"
            }`}>
              <Calendar size={48} className="text-white opacity-50" />
            </div>
          )}

          {/* Semi-transparent overlay for past events */}
          {eventIsOver && (
            <div className="absolute inset-0 bg-black/20"></div>
          )}

          {/* Date Badge - Top Left */}
          {dateInfo && (
            <div className={`absolute top-4 left-4 rounded-xl shadow-lg overflow-hidden ${
              eventIsOver ? "opacity-80" : ""
            }`}>
              <div className={`text-white text-center py-1 px-4 ${
                eventIsOver 
                  ? "bg-gradient-to-r from-gray-500 to-gray-600" 
                  : "bg-gradient-to-r from-purple-600 to-blue-600"
              }`}>
                <div className="text-xs font-semibold">{dateInfo.month}</div>
              </div>
              <div className="bg-white text-center py-2 px-4">
                <div className={`text-2xl font-bold ${
                  eventIsOver ? "text-gray-500" : "text-gray-800"
                }`}>
                  {dateInfo.day}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 bg-white">
          {/* Title */}
          <h3 className={`text-xl font-bold mb-3 line-clamp-2 transition ${
            eventIsOver 
              ? "text-gray-500 hover:text-gray-700" 
              : "text-gray-800 hover:text-purple-600"
          }`}>
            {event.title}
          </h3>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            {hasLocation && (
              <div className={`flex items-center gap-2 ${
                eventIsOver ? "text-gray-400" : "text-gray-600"
              }`}>
                <MapPin size={16} className={`flex-shrink-0 ${
                  eventIsOver ? "text-gray-400" : "text-purple-600"
                }`} />
                <span className="text-sm line-clamp-1">{event.location}</span>
              </div>
            )}

            {/* 🆕 Date Range Display (if both start and end dates exist) */}
            {dateInfo && endDateInfo && (
              <div className={`flex items-center gap-2 ${
                eventIsOver ? "text-gray-400" : "text-gray-600"
              }`}>
                <Calendar size={16} className={`flex-shrink-0 ${
                  eventIsOver ? "text-gray-400" : "text-blue-600"
                }`} />
                <span className="text-sm">
                  {dateInfo.fullDate} - {endDateInfo}
                </span>
              </div>
            )}

            {/* Single Date Display (if only start date exists) */}
            {dateInfo && !endDateInfo && (
              <div className={`flex items-center gap-2 ${
                eventIsOver ? "text-gray-400" : "text-gray-600"
              }`}>
                <Calendar size={16} className={`flex-shrink-0 ${
                  eventIsOver ? "text-gray-400" : "text-blue-600"
                }`} />
                <span className="text-sm">{dateInfo.fullDate}</span>
              </div>
            )}

            {dateInfo && (
              <div className={`flex items-center gap-2 ${
                eventIsOver ? "text-gray-400" : "text-gray-600"
              }`}>
                <Clock size={16} className={`flex-shrink-0 ${
                  eventIsOver ? "text-gray-400" : "text-indigo-600"
                }`} />
                <span className="text-sm">{dateInfo.time}</span>
              </div>
            )}
          </div>

          {/* ❌ REMOVED: Author Info Section */}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {hasRegLink && !eventIsOver && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(event.reglink, "_blank");
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Registration
              </motion.button>
            )}

            {/* View Details Button - Always visible */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/events/${event.id}`)}
              className={`${
                hasRegLink && !eventIsOver ? "flex-none px-6" : "flex-1"
              } py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                eventIsOver 
                  ? "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-700" 
                  : "text-gray-700 hover:text-purple-600"
              }`}
            >
              View Details
              <ArrowRight size={18} />
            </motion.button>
          </div>

          {/* 🔥 Event Over Notice (below buttons) */}
          {eventIsOver && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-center"
            >
              <p className="text-sm text-red-700 font-medium">
                🕐 This event has ended
              </p>
              <p className="text-xs text-red-600 mt-1">
                You can still view event details for reference
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [ads, setAds] = useState([]);
  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);

  const [largeAds, setLargeAds] = useState([]);
  const [largeAdIndexes, setLargeAdIndexes] = useState([0, 1]);
  const [largeAd1Closed, setLargeAd1Closed] = useState(false);
  const [largeAd2Closed, setLargeAd2Closed] = useState(false);
  const timerRef = useRef();

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.jharkhandbiharupdates.com/api/v1/events"
      );
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Fetch small ads
    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/small")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          const orderedAds = [...data.data];
          setAds(orderedAds);

          const total = orderedAds.length;
          let savedTop = parseInt(
            localStorage.getItem(SLOT_KEYS.TOP_RIGHT) ?? "0",
            10
          );
          let savedBottom = parseInt(
            localStorage.getItem(SLOT_KEYS.BOTTOM_RIGHT) ?? "1",
            10
          );

          if (total === 1) {
            setTopRightIndex(0);
            setBottomRightIndex(-1);
            localStorage.setItem(SLOT_KEYS.TOP_RIGHT, "0");
            localStorage.removeItem(SLOT_KEYS.BOTTOM_RIGHT);
          } else {
            if (isNaN(savedTop) || savedTop < 0 || savedTop >= total) savedTop = 0;
            if (isNaN(savedBottom) || savedBottom < 0 || savedBottom >= total)
              savedBottom = total > 1 ? 1 : 0;
            if (savedTop === savedBottom && total > 1)
              savedBottom = getNextIndex(savedTop, total);

            setTopRightIndex(savedTop);
            setBottomRightIndex(savedBottom);
          }
        }
      })
      .catch((err) => console.error("Error fetching events small ads:", err));

    // Fetch large ads
    fetch("https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/large")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const shuffled = shuffle(data.data);
          setLargeAds(shuffled);

          let largeAdIdx1 = parseInt(
            localStorage.getItem(SLOT_KEYS.LARGE_AD_1) ?? "0",
            10
          );
          let largeAdIdx2 = parseInt(
            localStorage.getItem(SLOT_KEYS.LARGE_AD_2) ?? "1",
            10
          );
          const total = shuffled.length;

          if (total === 1) {
            setLargeAdIndexes([0]);
            localStorage.setItem(SLOT_KEYS.LARGE_AD_1, "0");
            localStorage.removeItem(SLOT_KEYS.LARGE_AD_2);
          } else {
            if (isNaN(largeAdIdx1) || largeAdIdx1 < 0 || largeAdIdx1 >= total)
              largeAdIdx1 = 0;
            if (isNaN(largeAdIdx2) || largeAdIdx2 < 0 || largeAdIdx2 >= total)
              largeAdIdx2 = total > 1 ? 1 : 0;
            if (largeAdIdx1 === largeAdIdx2 && total > 1)
              largeAdIdx2 = getNextIndex(largeAdIdx1, total);

            setLargeAdIndexes([largeAdIdx1, largeAdIdx2]);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching events large ads:", err);
      });
  }, []);

  useEffect(() => {
    if (!ads.length || ads.length === 1) return;
    const total = ads.length;
    if (topRightClosed) {
      const nextTop = getNextIndex(topRightIndex, total);
      localStorage.setItem(SLOT_KEYS.TOP_RIGHT, String(nextTop));
    }
    if (bottomRightClosed) {
      const nextBottom = getNextIndex(bottomRightIndex, total);
      localStorage.setItem(SLOT_KEYS.BOTTOM_RIGHT, String(nextBottom));
    }
  }, [topRightClosed, bottomRightClosed, topRightIndex, bottomRightIndex, ads]);

  useEffect(() => {
    if (largeAds.length === 0 || largeAds.length === 1) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setLargeAdIndexes(([idx1, idx2]) => {
        const total = largeAds.length;
        let nextIdx1 = getNextIndex(idx1, total);
        let nextIdx2 = getNextIndex(idx2, total);
        if (nextIdx1 === nextIdx2 && total > 1)
          nextIdx2 = getNextIndex(nextIdx1, total);

        localStorage.setItem(SLOT_KEYS.LARGE_AD_1, String(nextIdx1));
        localStorage.setItem(SLOT_KEYS.LARGE_AD_2, String(nextIdx2));
        return [nextIdx1, nextIdx2];
      });
    }, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [largeAds]);

  // Filter events
  const filteredEvents = events.filter((e) => {
    const title = (e.title || "").toLowerCase();
    const location = (e.location || "").toLowerCase();
    const q = search.toLowerCase();
    return title.includes(q) || location.includes(q);
  });

  // Desktop: split into two event columns
  const leftEvents = [];
  const centerEvents = [];
  filteredEvents.forEach((event, idx) => {
    if (idx % 2 === 0) leftEvents.push(event);
    else centerEvents.push(event);
  });

  // Small ads
  const topRightAd =
    ads.length === 1 ? ads[0] : ads.length ? ads[topRightIndex % ads.length] : null;
  const bottomRightAd =
    ads.length > 1 && !topRightClosed && bottomRightIndex >= 0
      ? ads[bottomRightIndex % ads.length]
      : null;

  // Helper: build mobile sequence
  const buildMobileItems = () => {
    const items = [];
    if (!filteredEvents.length) return items;
    let adPtr = 0;

    if (filteredEvents.length === 1) {
      if (largeAds.length > 0)
        items.push({ type: "ad", adIndex: largeAdIndexes[0] ?? 0 });
      items.push({ type: "event", event: filteredEvents[0] });
      if (largeAds.length > 1)
        items.push({ type: "ad", adIndex: largeAdIndexes[1] ?? 0 });
      return items;
    }

    if (filteredEvents.length === 2) {
      items.push({ type: "event", event: filteredEvents[0] });
      if (largeAds.length > 0)
        items.push({ type: "ad", adIndex: largeAdIndexes[0] ?? 0 });
      items.push({ type: "event", event: filteredEvents[1] });
      if (largeAds.length > 1)
        items.push({ type: "ad", adIndex: largeAdIndexes[1] ?? 0 });
      return items;
    }

    for (let i = 0; i < filteredEvents.length; i++) {
      items.push({ type: "event", event: filteredEvents[i] });
      const isEndOfPair = (i + 1) % 2 === 0;
      const isNotLast = i !== filteredEvents.length - 1;
      if (isEndOfPair && isNotLast && largeAds.length > 0) {
        const useIdx =
          largeAds.length === 1
            ? largeAdIndexes[0] ?? 0
            : largeAdIndexes[adPtr % largeAdIndexes.length] ?? 0;
        items.push({ type: "ad", adIndex: useIdx });
        adPtr++;
      }
    }
    return items;
  };

  const mobileItems = buildMobileItems();

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar refreshEvents={fetchEvents} />
      </div>

      {/* Small Ads */}
      <AnimatePresence>
        {topRightAd && !topRightClosed && (
          <SmallAdd
            ad={topRightAd}
            position="top-right"
            open={true}
            onClose={() => setTopRightClosed(true)}
          />
        )}
        {bottomRightAd && !bottomRightClosed && (
          <SmallAdd
            ad={bottomRightAd}
            position="bottom-right"
            open={true}
            onClose={() => setBottomRightClosed(true)}
          />
        )}
      </AnimatePresence>

      {/* Page Layout */}
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar activePage="events" />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-4 pt-6 pb-10">
          {/* Top Header + Search */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-6 mb-8 shadow-2xl w-full max-w-5xl md:max-w-7xl"
          >
            <h2 className="text-3xl font-bold text-center mb-4">
              ✨ Discover Amazing Events
            </h2>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="relative w-full sm:w-96">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <SearchIcon size={20} className="text-purple-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events by title or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-white focus:border-white outline-none transition"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create/events")}
                className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition font-bold"
              >
                <PlusCircle size={20} /> Create Event
              </motion.button>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader />
            </div>
          ) : (
            <>
              {/* MOBILE: events + ads interleaved */}
              <div className="flex flex-col gap-6 w-full max-w-5xl md:hidden pb-6">
                {mobileItems.length === 0 && (
                  <div className="text-center text-gray-500 mt-12">
                    <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-semibold">No events found</p>
                    <p className="text-sm mt-2">Try searching with different keywords</p>
                  </div>
                )}
                {mobileItems.map((item, idx) =>
                  item.type === "event" ? (
                    <EventCard key={`m-event-${item.event.id}`} event={item.event} index={idx} />
                  ) : largeAds[item.adIndex] ? (
                    <motion.div
                      key={`m-ad-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-2xl shadow-lg border-2 border-purple-100 overflow-hidden h-52"
                    >
                      <LargeAd
                        ad={largeAds[item.adIndex]}
                        className="w-full h-full"
                      />
                    </motion.div>
                  ) : null
                )}
              </div>

              {/* DESKTOP: events grid + sticky ads */}
              <div className="hidden md:grid md:grid-cols-3 gap-6 w-full max-w-7xl pb-10">
                {/* First Column: Events (even indexes) */}
                <div className="flex flex-col gap-6">
                  {leftEvents.length === 0 && !loading && filteredEvents.length === 0 && (
                    <div className="text-center text-gray-500 mt-12 col-span-full">
                      <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-xl font-semibold">No events found</p>
                      <p className="text-sm mt-2">Try searching with different keywords</p>
                    </div>
                  )}
                  {leftEvents.map((event, idx) => (
                    <EventCard key={`left-${event.id}`} event={event} index={idx * 2} />
                  ))}
                </div>

                {/* Second Column: Events (odd indexes) */}
                <div className="flex flex-col gap-6">
                  {centerEvents.map((event, idx) => (
                    <EventCard key={`center-${event.id}`} event={event} index={idx * 2 + 1} />
                  ))}
                </div>

                {/* Third Column: Sponsored Ads (sticky) */}
                <div className="flex">
                  <div className="sticky top-28 w-full flex flex-col gap-6 max-h-[80vh]">
                    {largeAds.length > 0 &&
                      largeAdIndexes.map((idx, i) => {
                        if (i === 0 && largeAd1Closed) return null;
                        if (i === 1 && largeAd2Closed) return null;
                        if (!largeAds[idx]) return null;

                        return (
                          <motion.div
                            key={"large-ad-wrapper-" + i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative rounded-2xl shadow-lg border-2 border-purple-100 overflow-hidden"
                            style={{ height: "260px", minHeight: "260px" }}
                          >
                            <motion.button
                              className="absolute -top-0 -right-0 z-20 lg:hidden bg-white rounded-full p-1.5 shadow-lg border-2 border-gray-200 hover:bg-gray-100 transition-all duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (i === 0) setLargeAd1Closed(true);
                                if (i === 1) setLargeAd2Closed(true);
                              }}
                            >
                              <X className="w-4 h-4 text-gray-700" />
                            </motion.button>

                            <LargeAd
                              ad={largeAds[idx]}
                              className="w-full h-full"
                            />
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
