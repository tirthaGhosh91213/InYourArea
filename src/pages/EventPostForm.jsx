import React from "react";

export default function EventPostForm({ formData, handleChange }) {
  return (
    <>
      {/* Event Name */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Event Name
        </label>
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

      {/* Location */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Location
        </label>
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

      {/* Date and Time */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-2">
            Date
          </label>
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
          <label className="block text-gray-700 font-medium mb-2">
            Time
          </label>
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
    </>
  );
}
