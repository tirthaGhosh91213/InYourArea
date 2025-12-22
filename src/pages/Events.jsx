import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  PlusCircle,
  Search as SearchIcon,
  MessageCircle,
  Link as LinkIcon,
  X,
} from "lucide-react";
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

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState("All");

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
    }, 10000); // 10 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [largeAds]);

  // Filter events – keep backend order intact
  const filteredEvents = events.filter((e) => {
    const title = (e.title || "").toLowerCase();
    const location = (e.location || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = title.includes(q) || location.includes(q);
    const matchesFilter =
      filterCity === "All"
        ? true
        : location.includes(filterCity.toLowerCase());
    return matchesSearch && matchesFilter;
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

  // Helper: build mobile sequence post–post–ad
  const buildMobileItems = () => {
    const items = [];
    if (!filteredEvents.length) return items;
    let adPtr = 0;

    if (filteredEvents.length === 1) {
      // Ad1, post, Ad2 (if exists)
      if (largeAds.length > 0)
        items.push({ type: "ad", adIndex: largeAdIndexes[0] ?? 0 });
      items.push({ type: "event", event: filteredEvents[0] });
      if (largeAds.length > 1)
        items.push({ type: "ad", adIndex: largeAdIndexes[1] ?? 0 });
      return items;
    }

    if (filteredEvents.length === 2) {
      // post, Ad1, post, Ad2
      items.push({ type: "event", event: filteredEvents[0] });
      if (largeAds.length > 0)
        items.push({ type: "ad", adIndex: largeAdIndexes[0] ?? 0 });
      items.push({ type: "event", event: filteredEvents[1] });
      if (largeAds.length > 1)
        items.push({ type: "ad", adIndex: largeAdIndexes[1] ?? 0 });
      return items;
    }

    // 3+
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

      {/* Small Ads - Close button for both desktop & mobile */}
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
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar activePage="events" />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-2 pt-6 pb-10">
          {/* Top Blue Heading + Search */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="bg-emerald-700 top-0 z-20 text-white rounded-xl p-6 mb-6 shadow-lg w-full max-w-5xl md:max-w-7xl"
          >
            <h2 className="text-2xl font-semibold text-center mb-4">
              Upcoming Events
            </h2>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <div className="relative w-full sm:w-96">
                  <div className="absolute inset-y-0 left-2 flex items-center justify-center pointer-events-none">
                    <SearchIcon size={18} className="text-blue-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-blue-300 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder-gray-300"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create/events")}
                className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-xl shadow-lg hover:bg-blue-50 transition font-semibold"
              >
                <PlusCircle size={18} /> Add Event
              </motion.button>
            </div>
          </motion.div>

          {/* Show loader while loading */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader />
            </div>
          ) : (
            <>
              {/* MOBILE: events + ads interleaved, aligned with header width */}
              <div className="flex flex-col gap-6 w-full max-w-5xl md:hidden pb-6">
                {mobileItems.map((item, idx) =>
                  item.type === "event" ? (
                    <motion.div
                      key={`m-event-${item.event.id}-${idx}`}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        delay: idx * 0.03,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 25px 40px rgba(59,130,246,0.25)",
                      }}
                      className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-gray-200 shadow-md border border-blue-100 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100"
                      onClick={() => navigate(`/events/${item.event.id}`)}
                    >
                      {Array.isArray(item.event.imageUrls) &&
                      item.event.imageUrls.length > 0 ? (
                        <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                          <img
                            src={item.event.imageUrls[0]}
                            alt={item.event.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-xl mb-4 text-gray-400">
                          No image
                        </div>
                      )}
                      <div className="mb-3">
                        <h2 className="pb-5 font-semibold text-gray-800 text-lg">
                          {item.event.title}
                        </h2>
                      </div>
                      <div className="space-y-2 text-gray-700 mb-3">
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-blue-700" />{" "}
                          {item.event.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-600" />
                          {item.event.eventDate
                            ? new Date(
                                item.event.eventDate
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock size={16} className="text-indigo-600" />
                          {item.event.eventDate
                            ? new Date(item.event.eventDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-between items-center border-t pt-3 border-blue-200">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.event.reglink) {
                              window.open(item.event.reglink, "_blank");
                            }
                          }}
                          className="flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition"
                        >
                          <LinkIcon size={18} /> Register
                        </motion.button>
                        <motion.div className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
                          <MessageCircle size={18} /> Comment
                        </motion.div>
                      </div>
                      {item.event.author && (
                        <p className="text-xs text-gray-400 mt-2">
                          Posted by: {item.event.author.firstName}{" "}
                          {item.event.author.lastName}
                        </p>
                      )}
                    </motion.div>
                  ) : largeAds[item.adIndex] ? (
                    <motion.div
                      key={`m-ad-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="rounded-2xl shadow-md border border-blue-100 overflow-hidden h-52"
                    >
                      <LargeAd
                        ad={largeAds[item.adIndex]}
                        className="w-full h-full"
                      />
                    </motion.div>
                  ) : null
                )}
              </div>

              {/* DESKTOP/TABLET: events grid + sticky ads, aligned with header */}
              <div className="hidden md:grid md:grid-cols-3 gap-8 w-full max-w-7xl pb-10">
                {/* First Column: Events (even indexes) */}
                <div className="flex flex-col gap-6">
                  {leftEvents.length === 0 && !loading && (
                    <div className="text-center text-gray-500 mt-12 col-span-full">
                      No events found.
                    </div>
                  )}
                  {leftEvents.map((event, idx) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        delay: idx * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 25px 40px rgba(59,130,246,0.25)",
                      }}
                      className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-gray-200 shadow-md border border-blue-100 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      {Array.isArray(event.imageUrls) &&
                      event.imageUrls.length > 0 ? (
                        <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                          <img
                            src={event.imageUrls[0]}
                            alt={event.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-xl mb-4 text-gray-400">
                          No image
                        </div>
                      )}
                      <div className="mb-3">
                        <h2 className="pb-5 font-semibold text-gray-800 text-lg">
                          {event.title}
                        </h2>
                      </div>
                      <div className="space-y-2 text-gray-700 mb-3">
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-blue-700" />{" "}
                          {event.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-600" />
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleDateString()
                            : "-"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock size={16} className="text-indigo-600" />
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-between items-center border-t pt-3 border-blue-200">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.reglink) {
                              window.open(event.reglink, "_blank");
                            }
                          }}
                          className="flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition"
                        >
                          <LinkIcon size={18} /> Register
                        </motion.button>
                        <motion.div className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
                          <MessageCircle size={18} /> Comment
                        </motion.div>
                      </div>
                      {event.author && (
                        <p className="text-xs text-gray-400 mt-2">
                          Posted by: {event.author.firstName}{" "}
                          {event.author.lastName}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Second Column: Events (odd indexes) */}
                <div className="flex flex-col gap-6">
                  {centerEvents.map((event, idx) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        delay: idx * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 25px 40px rgba(59,130,246,0.25)",
                      }}
                      className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-gray-200 shadow-md border border-blue-100 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      {Array.isArray(event.imageUrls) &&
                      event.imageUrls.length > 0 ? (
                        <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                          <img
                            src={event.imageUrls[0]}
                            alt={event.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-xl mb-4 text-gray-400">
                          No image
                        </div>
                      )}
                      <div className="mb-3">
                        <h2 className="pb-5 font-semibold text-gray-800 text-lg">
                          {event.title}
                        </h2>
                      </div>
                      <div className="space-y-2 text-gray-700 mb-3">
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-blue-700" />{" "}
                          {event.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-600" />
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleDateString()
                            : "-"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock size={16} className="text-indigo-600" />
                          {event.eventDate
                            ? new Date(event.eventDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-between items-center border-t pt-3 border-blue-200">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (event.reglink) {
                              window.open(event.reglink, "_blank");
                            }
                          }}
                          className="flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition"
                        >
                          <LinkIcon size={18} /> Register
                        </motion.button>
                        <motion.div className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition">
                          <MessageCircle size={18} /> Comment
                        </motion.div>
                      </div>
                      {event.author && (
                        <p className="text-xs text-gray-400 mt-2">
                          Posted by: {event.author.firstName}{" "}
                          {event.author.lastName}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Third Column: Sponsored Ads (sticky, wider, aligned) */}
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
                            className="relative rounded-2xl shadow-md border border-blue-100 overflow-hidden"
                            style={{ height: "260px", minHeight: "260px" }}
                          >
                            {/* Close button for mobile only (desktop sticky but button hidden via lg) */}
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
