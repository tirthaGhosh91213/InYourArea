// src/components/EventPostForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EventPostForm({ onSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventLocation: "",
    eventDate: "",
    eventTime: "",
  });

  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const resetForm = () => {
    setFormData({
      eventName: "",
      eventDescription: "",
      eventLocation: "",
      eventDate: "",
      eventTime: "",
    });
    setImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.eventName || !formData.eventLocation || !formData.eventDate || !formData.eventTime) {
      return window.alert("Please fill all required fields (name, location, date, time).");
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        window.alert("Please log in to post an event.");
        return navigate("/login");
      }

      setSubmitting(true);

      const eventPayload = {
        title: formData.eventName,
        description: formData.eventDescription,
        location: formData.eventLocation,
        eventDate: `${formData.eventDate}T${formData.eventTime}:00`,
      };

      const fd = new FormData();
      fd.append("event", JSON.stringify(eventPayload));
      images.forEach((file) => fd.append("images", file));

      const res = await axios.post("http://localhost:8000/api/v1/events", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data && res.data.success) {
        const created = res.data.data;
        window.alert(res.data.message || "Event created successfully and pending approval");
        if (onSuccess) onSuccess(created);
        resetForm();
      } else {
        window.alert("Failed to create event");
      }
    } catch (err) {
      console.error(err);
      window.alert(err?.response?.data?.message || "Error creating event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-6 border border-gray-100"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
        Create New Event
      </h2>

      {/* Event Name */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Event Name</label>
        <input
          type="text"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          placeholder="Enter the event name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
          name="eventDescription"
          value={formData.eventDescription}
          onChange={handleChange}
          placeholder="Enter event description"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          rows={4}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Location</label>
        <input
          type="text"
          name="eventLocation"
          value={formData.eventLocation}
          onChange={handleChange}
          placeholder="Enter the event location"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          required
        />
      </div>

      {/* Date & Time */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-2">Date</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-2">Time</label>
          <input
            type="time"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            required
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Images <span className="text-gray-500 text-sm">(you can select multiple)</span>
        </label>
        <div className="flex gap-3 overflow-x-auto py-2">
          <AnimatePresence>
            {images.map((file, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-24 h-24 rounded-lg overflow-hidden border shadow-sm flex-shrink-0"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
            <label className="w-24 h-24 rounded-lg border-dashed border-2 border-gray-400 flex items-center justify-center cursor-pointer flex-shrink-0 hover:border-green-500 hover:bg-green-50 transition">
              <Plus className="text-gray-500" size={26} />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </AnimatePresence>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap">
        <motion.button
          type="submit"
          disabled={submitting}
          whileTap={{ scale: 0.97 }}
          className="flex-1 flex justify-center items-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium shadow-md disabled:opacity-60"
        >
          {submitting && <Loader2 className="animate-spin" size={18} />}
          {submitting ? "Creating..." : "Create Event"}
        </motion.button>

        <button
          type="button"
          onClick={resetForm}
          className="px-5 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium transition shadow-sm"
        >
          Reset
        </button>
      </div>
    </motion.form>
  );
}
