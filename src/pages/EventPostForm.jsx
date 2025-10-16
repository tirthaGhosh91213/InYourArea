// src/components/EventPostForm.jsx
import React, { useState } from "react";
import axios from "axios";

/**
 * Props:
 *  - onSuccess(createdEvent) => called when event created successfully. createdEvent is the response data object.
 */
export default function EventPostForm({ onSuccess }) {
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
    setImages(files);
  };

  const resetForm = () => {
    setFormData({ eventName: "", eventDescription: "", eventLocation: "", eventDate: "", eventTime: "" });
    setImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!formData.eventName || !formData.eventLocation || !formData.eventDate || !formData.eventTime) {
      return window.alert("Please fill all required fields (name, location, date, time).");
    }

    try {
      setSubmitting(true);

      const eventPayload = {
        title: formData.eventName,
        description: formData.eventDescription,
        location: formData.eventLocation,
        eventDate: `${formData.eventDate}T${formData.eventTime}:00`,
      };

      const fd = new FormData();
      // backend expects a key 'event' with JSON string
      fd.append("event", JSON.stringify(eventPayload));

      // append each image file as 'images'
      images.forEach((file) => {
        fd.append("images", file);
      });

      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // Note: axios will automatically set Content-Type multipart/form-data with proper boundary when sending FormData
      const res = await axios.post("http://localhost:8000/api/v1/events", fd, { headers });

      if (res.data && res.data.success) {
        const created = res.data.data;
        window.alert(res.data.message || "Event created successfully and pending approval");
        if (onSuccess) onSuccess(created);
        resetForm();
      } else {
        console.error("Unexpected create response", res);
        window.alert("Failed to create event");
      }
    } catch (err) {
      console.error("Error creating event", err);
      window.alert(err?.response?.data?.message || "Error creating event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">Event Name</label>
        <input
          type="text"
          name="eventName"
          value={formData.eventName}
          onChange={handleChange}
          placeholder="Enter the event name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
          name="eventDescription"
          value={formData.eventDescription}
          onChange={handleChange}
          placeholder="Enter event description"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Location</label>
        <input
          type="text"
          name="eventLocation"
          value={formData.eventLocation}
          onChange={handleChange}
          placeholder="Enter the event location"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-2">Date</label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
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
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">Images (you can select multiple)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />
        {images.length > 0 && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {images.map((f, idx) => (
              <div key={idx} className="w-24 h-24 rounded-md overflow-hidden border">
                <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Event"}
        </button>
        <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          Reset
        </button>
      </div>
    </form>
  );
}
