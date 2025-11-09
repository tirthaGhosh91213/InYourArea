// src/pages/Events.jsx
import React, { useState, useEffect } from "react";
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
import axios from "axios";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterCity, setFilterCity] = useState("All");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/v1/events");
      setEvents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((e) => {
    const title = (e.title || "").toLowerCase();
    const location = (e.location || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = title.includes(q) || location.includes(q);
    const matchesFilter =
      filterCity === "All"
        ? true
        : (e.location || "").toLowerCase().includes(filterCity.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 relative"
          >
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
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 20px 30px rgba(0,0,0,0.08)",
                    }}
                    className="bg-white rounded-2xl p-4 relative hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition cursor-pointer"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    {/* Image Section */}
                    {Array.isArray(event.imageUrls) && event.imageUrls.length > 0 ? (
                      <img
                        src={event.imageUrls[0]}
                        alt={event.title}
                        className="w-full h-44 object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full h-44 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400 mb-3">
                        No image
                      </div>
                    )}

                    {/* Event Info */}
                    <h2 className="text-lg font-semibold">{event.title}</h2>
                    <p className="text-sm text-gray-600">
                      {event.description?.slice(0, 100)}
                      {event.description && event.description.length > 100 ? "…" : ""}
                    </p>
                    <div className="mt-3 text-gray-600 text-sm flex gap-3 items-center flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />{" "}
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString()
                          : "-"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />{" "}
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Posted by:{" "}
                      {event.author
                        ? `${event.author.firstName} ${event.author.lastName}`
                        : "Unknown"}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.id}`);
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
                          window.open(event.reglink, "_blank");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700 transition"
                      >
                        <LinkIcon className="w-4 h-4" /> Register
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
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
