import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

export default function EventPostForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    imageUrls: [],
  });
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image URLs input (comma separated)
  const handleImagesChange = (e) => {
    const urls = e.target.value.split(",").map((url) => url.trim());
    setFormData({ ...formData, imageUrls: urls });
  };

  // Submit form
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.title || !formData.description || !formData.location || !formData.date || !formData.time) {
    alert("Please fill in all fields");
    return;
  }

  try {
    setLoading(true);
    const eventDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    const token = localStorage.getItem("accessToken");

    const res = await axios.post(
      "http://localhost:8000/api/v1/events",
      {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        eventDate: eventDateTime,
        imageUrls: formData.imageUrls.length ? formData.imageUrls : [],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data.success) {
      alert(res.data.message);
      navigate("/events");
    }
  } catch (err) {
    console.error("Error creating event:", err);
    alert(err.response?.data?.message || "Failed to create event");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 p-8">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl space-y-6"
      >
        <h1 className="text-3xl font-bold text-green-600 text-center">Create New Event</h1>

        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Event Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter event description"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            rows={6}
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter event location"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        {/* Date and Time */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-medium mb-2">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>
        </div>

        {/* Image URLs */}
       

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? "Creating Event..." : "Create Event"}
        </motion.button>
      </motion.form>
    </div>
  );
}
