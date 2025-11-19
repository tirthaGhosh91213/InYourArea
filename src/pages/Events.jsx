import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import SmallAdd from "../components/SmallAdd";
import LargeAd from "../components/LargeAd";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  PlusCircle,
  Search,
  MessageCircle,
  Link as LinkIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Helper: Shuffle an array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterCity, setFilterCity] = useState("All");
  const [ads, setAds] = useState([]);
  const [largeAds, setLargeAds] = useState([]);

  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);
  const navigate = useNavigate();

  // Slot keys for persistent small ad positions
  const SLOT_KEYS = {
    TOP_RIGHT: "EVENTS_AD_INDEX_TOP_RIGHT",
    BOTTOM_RIGHT: "EVENTS_AD_INDEX_BOTTOM_RIGHT",
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://api.jharkhandbiharupdate/api/v1/events"
      );
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch small ads
  useEffect(() => {
    fetch("https://api.jharkhandbiharupdate/api/v1/banner-ads/active/small")
      .then((res) => res.json())
      .then((data) => {
        if (
          data &&
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          const orderedAds = [...data.data];
          setAds(orderedAds);
          const total = orderedAds.length;
          let savedTop = parseInt(
            localStorage.getItem(SLOT_KEYS.TOP_RIGHT) ?? "0", 10
          );
          let savedBottom = parseInt(
            localStorage.getItem(SLOT_KEYS.BOTTOM_RIGHT) ?? "1", 10
          );
          if (isNaN(savedTop) || savedTop < 0 || savedTop >= total) savedTop = 0;
          if (isNaN(savedBottom) || savedBottom < 0 || savedBottom >= total) savedBottom = total > 1 ? 1 : 0;
          if (savedTop === savedBottom && total > 1) savedBottom = (savedTop + 1) % total;
          setTopRightIndex(savedTop);
          setBottomRightIndex(savedBottom);
        }
      }).catch(console.error);

    fetchEvents();

    // Fetch large ads once (shuffle every time page renders)
    fetch("https://api.jharkhandbiharupdate/api/v1/banner-ads/active/large")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setLargeAds(shuffle(data.data));
        }
      })
      .catch(console.error);

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!ads.length) return;
    const total = ads.length;
    if (topRightClosed) {
      const nextTop = (topRightIndex + 1) % total;
      localStorage.setItem(SLOT_KEYS.TOP_RIGHT, String(nextTop));
    }
    if (bottomRightClosed) {
      const nextBottom = (bottomRightIndex + 1) % total;
      localStorage.setItem(SLOT_KEYS.BOTTOM_RIGHT, String(nextBottom));
    }
  }, [topRightClosed, bottomRightClosed, topRightIndex, bottomRightIndex, ads]);

  // Filter events
  const filteredEvents = events.filter((e) => {
    const title = (e.title || "").toLowerCase();
    const location = (e.location || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = title.includes(q) || location.includes(q);
    const matchesFilter = filterCity === "All"
      ? true
      : (e.location || "").toLowerCase().includes(filterCity.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const topRightAd = ads.length ? ads[topRightIndex % ads.length] : null;
  const bottomRightAd = ads.length ? ads[bottomRightIndex % ads.length] : null;

  // Final grid: interleave large ads and events (ad -> event -> event -> ad ...)
  function buildInterleavedGrid(eventsArr, adsArr) {
    const result = [];
    let eventIdx = 0, adIdx = 0;
    while (eventIdx < eventsArr.length || adIdx < adsArr.length) {
      if (adIdx < adsArr.length) {
        result.push({ type: "ad", data: adsArr[adIdx] });
        adIdx++;
      }
      for (let k = 0; k < 2 && eventIdx < eventsArr.length; k++) {
        result.push({ type: "event", data: eventsArr[eventIdx] });
        eventIdx++;
      }
    }
    return result;
  }
  const gridItems = buildInterleavedGrid(filteredEvents, largeAds);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Ad: Top-right */}
      {topRightAd && !topRightClosed && (
        <AnimatePresence>
          <SmallAdd
            ad={topRightAd}
            position="top-right"
            open={true}
            onClose={() => setTopRightClosed(true)}
          />
        </AnimatePresence>
      )}
      {/* Ad: Bottom-right */}
      {bottomRightAd && !bottomRightClosed && (
        <AnimatePresence>
          <SmallAdd
            ad={bottomRightAd}
            position="bottom-right"
            open={true}
            onClose={() => setBottomRightClosed(true)}
          />
        </AnimatePresence>
      )}

      <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar refreshEvents={fetchEvents} />
      </header>

      <div className="flex flex-1 pt-16 overflow-hidden">
        <aside className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar activePage="events" />
        </aside>
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-bold text-gray-800"
            >
              Upcoming Events
            </motion.h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create/events")}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              <PlusCircle className="w-5 h-5" /> Add Event
            </motion.button>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 text-sm sm:text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </motion.div>
          <div className="flex gap-2 sm:gap-3 mb-6 flex-wrap">
            {["All", "Bokaro"].map((loc) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={loc}
                className={`px-3 sm:px-4 py-1 rounded-full border text-sm sm:text-base ${
                  filterCity === loc
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700"
                }`}
                onClick={() => setFilterCity(loc)}
              >
                {loc}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {loading ? (
              <motion.div className="text-gray-500 text-center">
                Loading events...
              </motion.div>
            ) : gridItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {gridItems.map((item, idx) =>
                  item.type === "ad" ? (
                    <LargeAd
  key={"ad-" + (item.data.id ?? idx)}
  ad={item.data}
  onClose={() => {
    setLargeAds((prev) => prev.filter((a) => a.id !== item.data.id));
  }}
/>

                  ) : (
                    <motion.div
                      key={"event-" + item.data.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 20px 30px rgba(0,0,0,0.08)",
                      }}
                      className="bg-white rounded-2xl p-4 relative hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition cursor-pointer"
                      onClick={() => navigate(`/events/${item.data.id}`)}
                    >
                      {Array.isArray(item.data.imageUrls) && item.data.imageUrls.length > 0 ? (
                        <img
                          src={item.data.imageUrls[0]}
                          alt={item.data.title}
                          className="w-full h-44 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="w-full h-44 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 mb-3">
                          No image
                        </div>
                      )}
                      <h2 className="text-lg font-semibold">{item.data.title}</h2>
                      <p className="text-sm text-gray-600">
                        {item.data.description?.slice(0, 100)}
                        {item.data.description && item.data.description.length > 100 ? "…" : ""}
                      </p>
                      <div className="mt-3 text-gray-600 text-sm flex gap-3 items-center flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {item.data.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />{" "}
                          {item.data.eventDate
                            ? new Date(item.data.eventDate).toLocaleDateString()
                            : "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />{" "}
                          {item.data.eventDate
                            ? new Date(item.data.eventDate).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Posted by:{" "}
                        {item.data.author
                          ? `${item.data.author.firstName} ${item.data.author.lastName}`
                          : "Unknown"}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${item.data.id}`);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-xl text-sm hover:bg-green-700 transition"
                        >
                          <MessageCircle className="w-4 h-4" /> Comment
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.data.reglink) {
                              window.open(item.data.reglink, "_blank");
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700 transition"
                        >
                          <LinkIcon className="w-4 h-4" /> Register
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 text-xl mt-10"
              >
                No events found 🔍
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
