// src/pages/Events.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";

const initialEvents = [
  { id: 1, title: "Tech Meetup 2025", location: "New Delhi", date: "Oct 15, 2025", time: "5:00 PM", isFavorite: false },
  { id: 2, title: "Startup Workshop", location: "Bangalore", date: "Oct 20, 2025", time: "2:00 PM", isFavorite: true },
  { id: 3, title: "AI Conference", location: "Mumbai", date: "Nov 5, 2025", time: "10:00 AM", isFavorite: false },
  { id: 4, title: "Web3 Hackathon", location: "Hyderabad", date: "Nov 12, 2025", time: "11:00 AM", isFavorite: false },
];

export default function Events() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", location: "", date: "", time: "" });

  const toggleFavorite = (id) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
    );
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.location || !newEvent.date || !newEvent.time) return;
    setEvents((prev) => [...prev, { ...newEvent, id: prev.length + 1, isFavorite: false }]);
    setNewEvent({ title: "", location: "", date: "", time: "" });
    setShowModal(false);
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar activePage="events" />

      {/* Main Content */}
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

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 relative"
        >
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {["All", "Delhi", "Bangalore", "Mumbai", "Hyderabad"].map((loc) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={loc}
              className={`px-4 py-1 rounded-full border ${
                loc === "All" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700"
              }`}
              onClick={() => setSearch(loc === "All" ? "" : loc)}
            >
              {loc}
            </motion.button>
          ))}
        </div>

        {/* Events Grid */}
        <AnimatePresence>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }}
                  className="bg-white rounded-2xl p-6 relative cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition"
                >
                  <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                  <div className="flex items-center text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 mr-2" /> {event.location}
                  </div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-2" /> {event.date}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" /> {event.time}
                  </div>

                  {/* Favorite Button */}
                  <motion.button
                    onClick={() => toggleFavorite(event.id)}
                    whileTap={{ scale: 1.2 }}
                    className="absolute top-4 right-4 text-red-500"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        event.isFavorite ? "fill-red-500" : "fill-none"
                      }`}
                    />
                  </motion.button>
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
      </div>

      {/* Right Sidebar */}
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
              className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold mb-4">Add New Event</h2>
              <input
                type="text"
                placeholder="Event Title"
                className="w-full mb-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full mb-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
              <input
                type="date"
                className="w-full mb-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              />
              <input
                type="time"
                className="w-full mb-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddEvent}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Add Event
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
