import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, XCircle, Plus, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function CreateEventPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    endDate: "", // 🆕 Added End Date
    reglink: "",
    description: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ REQUIRED VALIDATIONS
    if (!formData.title.trim()) {
      toast.error("Please add an event title!");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please add event description!");
      return;
    }

    if (formData.images.length === 0) {
      toast.error("Please upload at least one image!");
      return;
    }

    // 🔥 VALIDATION: If date provided, time is also required
    if (formData.date && !formData.time) {
      toast.error("Please provide event time along with the date!");
      return;
    }

    // 🆕 VALIDATION: If endDate provided, start date must also be provided
    if (formData.endDate && !formData.date) {
      toast.error("Please provide start date before adding end date!");
      return;
    }

    // 🆕 VALIDATION: End date should be >= Start date
    if (formData.endDate && formData.date && formData.endDate < formData.date) {
      toast.error("End date cannot be before start date!");
      return;
    }

    setLoading(true);
    try {
      // ✅ Build event object with required fields
      const eventData = {
        title: formData.title,
        description: formData.description,
      };

      // ⚠️ Add optional fields only if they have values
      if (formData.location?.trim()) {
        eventData.location = formData.location;
      }

      if (formData.reglink?.trim()) {
        eventData.reglink = formData.reglink;
      }

      // ✅ Add eventDate only if BOTH date AND time provided
      if (formData.date && formData.time) {
        eventData.eventDate = `${formData.date}T${formData.time}:00`;
      }

      // 🆕 Add endDate only if provided (date only, no time)
      if (formData.endDate) {
        eventData.endDate = formData.endDate;
      }

      const data = new FormData();
      data.append("event", JSON.stringify(eventData));

      // ✅ Add images
      formData.images.forEach((img) => data.append("images", img.file));

      const accessToken = localStorage.getItem("accessToken");

      const res = await axios.post(
        "https://api.jharkhandbiharupdates.com/api/v1/events",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.data.success) {
        setShowPopup(true);
        setFormData({
          title: "",
          location: "",
          date: "",
          time: "",
          endDate: "",
          reglink: "",
          description: "",
          images: [],
        });
      }
    } catch (err) {
      console.error("Error creating event:", err);
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center py-10 px-6">
      <button
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-2 text-green-600 font-semibold mb-6 hover:text-green-800"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <motion.div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">
          Create Event
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ REQUIRED: Title */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* ⚠️ OPTIONAL: Location */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Event Location <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* ⚠️ OPTIONAL: Registration Link */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Registration Link <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <input
              name="reglink"
              value={formData.reglink}
              onChange={handleChange}
              placeholder="Enter registration link"
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* ⚠️ OPTIONAL: Start Date & Time */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Start Date <span className="text-gray-400 text-sm">(Optional)</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Time <span className="text-gray-400 text-sm">(If Date Provided)</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* 🆕 OPTIONAL: End Date (for multi-day events) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              End Date <span className="text-gray-400 text-sm">(Optional - For Multi-Day Events)</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.date || undefined} // 🔥 Prevent selecting date before start date
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
            />
            {formData.date && formData.endDate && (
              <p className="text-xs text-green-600 mt-1">
                📅 Event Duration: {formData.date} to {formData.endDate}
              </p>
            )}
          </div>

          {/* ✅ REQUIRED: Description */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Event Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows={6}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* ✅ REQUIRED: Images */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Event Images <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative border rounded-lg overflow-hidden w-28 h-28"
                >
                  <img
                    src={img.preview}
                    alt={`preview-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ))}
              <label className="flex items-center justify-center w-28 h-28 border-2 border-dashed rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition">
                <Plus size={30} className="text-green-500" />
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              At least one image is required. You can also upload videos.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-full shadow-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Event"}
          </motion.button>
        </form>
      </motion.div>

      {/* Success Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl w-80 text-center relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CheckCircle size={50} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-green-600 mb-2">
                Success!
              </h2>
              <p className="text-gray-700 mb-4">
                Your event has been created successfully and is pending approval.
              </p>
              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate("/events");
                }}
                className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
              >
                Go to Events
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
