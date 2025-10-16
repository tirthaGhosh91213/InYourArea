// src/pages/Events.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  PlusCircle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import EventPostForm from "./EventPostForm";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterCity, setFilterCity] = useState("All");

  // fetch all approved events
  useEffect(() => {
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
    fetchEvents();
  }, []);

  // called by EventPostForm on successful create to add the new event to list
  const handleAddEventToList = (newEvent) => {
    // place newest first
    setEvents((prev) => [newEvent, ...prev]);
  };

  const toggleFavorite = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
    );
  };

  const filteredEvents = events.filter((e) => {
    // guard against undefined fields
    const title = (e.title || "").toLowerCase();
    const location = (e.location || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = title.includes(q) || location.includes(q);
    const matchesFilter = filterCity === "All" ? true : (e.location || "").toLowerCase().includes(filterCity.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar activePage="events" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800"
          >
            Upcoming Events
          </motion.h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            <PlusCircle className="w-5 h-5" /> Add Event
          </motion.button>
        </div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {["All", "Bokaro", "Delhi", "Bangalore", "Mumbai", "Hyderabad"].map((loc) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={loc}
              className={`px-4 py-1 rounded-full border ${filterCity === loc ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700"}`}
              onClick={() => setFilterCity(loc)}
            >
              {loc}
            </motion.button>
          ))}
        </div>

        {/* Events Grid */}
        <AnimatePresence>
          {loading ? (
            <motion.div className="text-gray-500">Loading events...</motion.div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onToggleFav={() => toggleFavorite(event.id)} />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500 text-xl mt-10">
              No events found 🔍
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RightSidebar />

      {/* Add Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white p-6 rounded-2xl w-full max-w-2xl relative shadow-2xl"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Create Event</h2>
              <EventPostForm
                onSuccess={(createdEvent) => {
                  handleAddEventToList(createdEvent);
                  setShowModal(false);
                  window.alert("Event created and is pending approval.");
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Small EventCard sub-component to keep Events.jsx tidy */
function EventCard({ event, onToggleFav }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasImages = Array.isArray(event.imageUrls) && event.imageUrls.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.03, boxShadow: "0 20px 30px rgba(0,0,0,0.08)" }}
      className="bg-white rounded-2xl p-4 relative cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition"
    >
      {/* Image carousel */}
      <div className="relative rounded-lg overflow-hidden mb-3">
        {hasImages ? (
          <>
            <img
              src={event.imageUrls[currentImageIndex]}
              alt={event.title}
              className="w-full h-44 object-cover rounded-lg"
            />
            {event.imageUrls.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((i) => (i - 1 + event.imageUrls.length) % event.imageUrls.length);
                  }}
                >
                  <ChevronLeft />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((i) => (i + 1) % event.imageUrls.length);
                  }}
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-44 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">No image</div>
        )}
      </div>

      <div className="flex justify-between items-start gap-2">
        <div>
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <p className="text-sm text-gray-600">{event.description?.slice(0, 120)}{event.description && event.description.length > 120 ? "…" : ""}</p>

          <div className="mt-3 text-gray-600 text-sm flex gap-3 items-center flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "-"}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.eventDate ? new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
          </div>

          <p className="text-xs text-gray-400 mt-2">Posted by: {event.author ? `${event.author.firstName} ${event.author.lastName}` : "Unknown"}</p>
        </div>

        <motion.button onClick={(e) => { e.stopPropagation(); onToggleFav(); }} whileTap={{ scale: 1.1 }} className="text-red-500">
          <Heart className={`w-6 h-6 ${event.isFavorite ? "fill-red-500" : "fill-none"}`} />
        </motion.button>
      </div>
    </motion.div>
  );
}
