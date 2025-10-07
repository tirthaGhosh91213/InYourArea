import React, { useState } from "react";
import { MapPin, ChevronDown, Edit3 } from "lucide-react"; // lightweight, modern icons

export default function PostcodeDropdown({ initialPostcode }) {
  const [postcode, setPostcode] = useState(initialPostcode || "SW1A1AA");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempPostcode, setTempPostcode] = useState(postcode);

  const handleSave = () => {
    if (tempPostcode.trim() === "") {
      alert("Please enter a valid postcode.");
      return;
    }
    setPostcode(tempPostcode);
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative px-4 py-3">
      {/* Main Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex items-center justify-between border rounded-full px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
      >
        <span className="flex items-center gap-2">
          <MapPin size={18} className="text-green-700" />
          {postcode}
        </span>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-4 mt-2 bg-white border rounded-lg shadow-md w-40 z-10">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 transition"
            >
              <Edit3 size={16} className="text-green-700" /> Edit
            </button>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              <input
                type="text"
                value={tempPostcode}
                onChange={(e) => setTempPostcode(e.target.value)}
                className="border rounded-md px-2 py-1 w-full focus:ring-green-600 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="text-sm text-green-700 font-semibold hover:text-green-800"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
