// src/components/RightSidebar.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Check if user is logged in
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="w-80 flex flex-col gap-6 px-2 sm:px-0">
      {/* Login/Register or My Account Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 80 }}
        className="flex justify-end relative"
      >
        {isLoggedIn ? (
          <div className="relative">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(34,197,94,0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-full px-5 py-2 shadow-md transition-all duration-300 flex items-center gap-1"
            >
              My Account <ChevronDown size={18} />
            </motion.button>

            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl overflow-hidden z-10"
              >
                <button
                  onClick={() => navigate("/my-account")}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 transition"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 transition"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 transition"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(34,197,94,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-full px-5 py-2 shadow-md transition-all duration-300"
          >
            Register or Sign In
          </motion.button>
        )}
      </motion.div>

      {/* Email Updates */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
        whileHover={{ scale: 1.03, boxShadow: "0 15px 25px rgba(0,0,0,0.1)" }}
        className="bg-white p-4 rounded-xl shadow-lg flex gap-3 items-start transition-all duration-300 cursor-pointer hover:bg-green-50"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/561/561127.png"
          alt="Email Icon"
          className="w-10 h-10"
        />
        <div>
          <h4 className="font-semibold text-gray-800">Daily Email Updates</h4>
          <p className="text-sm text-gray-500 mt-1">
            Updates in your area sent directly to your email inbox
          </p>
        </div>
      </motion.div>

      {/* Grow Your Business */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
        whileHover={{ scale: 1.03, boxShadow: "0 15px 25px rgba(0,0,0,0.1)" }}
        className="bg-white p-4 rounded-xl shadow-lg flex gap-3 items-start transition-all duration-300 cursor-pointer hover:bg-green-50"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/2721/2721292.png"
          alt="Business Icon"
          className="w-10 h-10"
        />
        <div>
          <h4 className="font-semibold text-gray-800">
            Grow your business with us
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            We connect you with the people and communities that matter to your
            business.
          </p>
        </div>
      </motion.div>

      {/* Advert Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
        whileHover={{ scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.15)" }}
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300"
      >
        <img
          src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500"
          alt="Ad"
          className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="p-4">
          <h4 className="font-semibold text-gray-800 text-base">
            Radnor House Sevenoaks is where individual talent meets academic
            excellence
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Advertorial by Radnor House Sevenoaks
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Discover Radnor for yourself at the Whole School Open Day on
            Saturday, October 4
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(34,197,94,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-full py-1.5 px-4 shadow-md transition-all duration-300"
          >
            Learn More
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
