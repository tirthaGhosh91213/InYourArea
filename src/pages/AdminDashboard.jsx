import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Bell } from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch pending events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/v1/events/pending"); // Your pending events API
        setEvents(res.data.data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Approve event
  const approveEvent = async (id) => {
    try {
      const res = await axios.post(`http://localhost:8000/api/v1/events/${id}/approve`);
      if (res.data.success) {
        alert(res.data.message);
        setEvents(events.filter((event) => event.id !== id));
      }
    } catch (err) {
      console.error("Error approving event:", err);
    }
  };

  // Reject event (optional)
  const rejectEvent = (id) => {
    setEvents(events.filter((event) => event.id !== id));
    alert("Event rejected");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-green-600 mb-6"
      >
        Admin Dashboard
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading && <p className="text-gray-500 col-span-full">Loading events...</p>}

        {!loading && events.length === 0 && <p className="text-gray-500 col-span-full">No pending events</p>}

        {events.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ scale: 1.03 }}
            className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center"
          >
            {event.imageUrls[0] && (
              <img src={event.imageUrls[0]} alt={event.title} className="rounded-lg w-full h-40 object-cover mb-4" />
            )}
            <h2 className="mt-2 text-lg font-semibold">{event.title}</h2>
            <p className="text-gray-500 text-sm mt-1 line-clamp-3">{event.description}</p>
            <p className="text-gray-400 text-xs mt-2">Date: {new Date(event.eventDate).toLocaleDateString()}</p>
            <p className="text-gray-400 text-xs">Location: {event.location}</p>

            <div className="mt-4 flex gap-2 w-full">
              <button
                onClick={() => approveEvent(event.id)}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition"
              >
                <CheckCircle size={20} /> Approve
              </button>
              <button
                onClick={() => rejectEvent(event.id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition"
              >
                <XCircle size={20} /> Reject
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
