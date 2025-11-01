// src/components/InYourArea.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./Footer.jsx";
import FeatureRail from "./FeautreRail.jsx";
import heroImage from "../assets/hero.jpg";
import logo from "../assets/logo.png"; // Import your logo here

export default function InYourArea() {
  const navigate = useNavigate();

  const districts = [
    "----------- Jharkhand -----------",
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka",
    "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla",
    "Hazaribagh", "Jamtara", "Jamshedpur", "Khunti", "Koderma",
    "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh",
    "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum",
    "----------- Bihar -----------",
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar",
    "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
    "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura",
    "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas",
    "Saharsa", "Samastipur", "Saran (Chhapra)", "Sheikhpura", "Sheohar", "Sitamarhi",
    "Siwan", "Supaul", "Vaishali", "West Champaran (Bettiah)",
  ];

  const [selectedDistrict, setSelectedDistrict] = useState("");

  const onSubmit = () => {
    if (!selectedDistrict || selectedDistrict.startsWith("-")) {
      toast.error("Please select your district!", { autoClose: 1000 });
      return;
    }
    localStorage.setItem("district", selectedDistrict); // Sync district
    navigate(`/localnews/${encodeURIComponent(selectedDistrict)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
        className="bg-white shadow-md flex justify-between items-center px-6 sm:px-10 py-4"
      >
        <div className="flex items-center gap-2">
          
          <img
            src={logo}
            alt="Platform Logo"
            className="h-12 sm:h-16 w-auto object-contain"
            style={{ display: "block" }}
            loading="eager"
            decoding="async"
          />
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-relaxed">
          The Jharkhand & Bihar Leading{" "}
          <span className="text-green-700">Local News</span>,{" "}
          <span className="text-green-700">Events</span> &amp;{" "}
          <span className="text-green-700">Jobs</span> &amp;{" "}
          <span className="text-green-700">Community</span> Platform
        </h1>
        <p className="mt-2 text-gray-600 text-base sm:text-lg">
          Select your district to see local news near you.
        </p>
        {/* District Dropdown */}
        <motion.div
          className="mt-8  mb-20 flex flex-col sm:flex-row justify-center items-center gap-3"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="w-72  sm:w-80 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:outline-none text-gray-700 placeholder-gray-400 transition-all"
          >
            <option value="">-- Select Your District --</option>
            {districts.map((district) =>
              district.startsWith("-----------") ? (
                <option
                  key={district}
                  disabled
                  style={{
                    fontWeight: "bold",
                    color: "#10b981",
                    background: "#f1f5f9",
                    fontSize: "1rem",
                    letterSpacing: "2px",
                  }}
                >
                  {district}
                </option>
              ) : (
                <option key={district} value={district}>
                  {district}
                </option>
              )
            )}
          </select>
          <button
            onClick={onSubmit}
            className="px-8 py-3 bg-green-700 text-white rounded-md font-semibold hover:bg-green-800 transition-all duration-300 hover:scale-105 w-72 sm:w-auto"
          >
            Continue →
          </button>
        </motion.div>
      </motion.section>
      {/* Hero Image */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-0"
      >
        <div className="relative w-screen h-full left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white py-0">
  <img
    src={heroImage}
    alt="InYourArea preview"
    className="block mx-auto w-full max-h-[500px] object-contain"
    loading="eager"
    decoding="async"
  />
</div>

      </motion.section>
      <FeatureRail />
      <Footer className="mt-0 pt-0" />
      {/* Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover={false}
        draggable
        theme="colored"
      />
    </div>
  );
}
