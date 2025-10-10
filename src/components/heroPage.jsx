import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Footer from "./Footer.jsx";
import FeatureRail from "./FeautreRail.jsx";
import heroImage from "../assets/image.png";

export default function InYourArea() {
  const [postcode, setPostcode] = useState("");
  const navigate = useNavigate();

  const validPostcodes = ["700001", "700002", "700003", "713407", "713102"];

  const onSubmit = () => {
    if (postcode.trim() === "") {
      toast.error("Please enter a postcode!", { autoClose: 2000 });
      return;
    }

    if (validPostcodes.includes(postcode)) {
      toast.success("Postcode is valid!", { autoClose: 2000 });
      setTimeout(() => navigate("/localnews"), 2000);
    } else {
      toast.error("Postcode does not exist!", { autoClose: 2000 });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
        className="bg-white shadow-md flex justify-between items-center px-8 py-4"
      >
        <div className="flex items-center gap-2">
          <MapPin className="text-green-700 w-6 h-6" />
          <span className="text-xl font-bold text-gray-800 tracking-wide">
            InYourArea
          </span>
        </div>

        <nav className="flex gap-6">
          <a
            href="#"
            className="text-gray-600 font-medium hover:text-green-700 transition-colors duration-300"
          >
            App
          </a>
          <a
            href="#"
            className="text-gray-600 font-medium hover:text-green-700 transition-colors duration-300"
          >
            Advertise
          </a>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center px-6 py-12 flex-1 flex flex-col justify-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-relaxed">
          The Jharkhand Leading{" "}
          <span className="text-green-700">Local News</span>,{" "}
          <span className="text-green-700">Information</span> &amp;{" "}
          <span className="text-green-700">Community</span> Platform
        </h1>

        <p className="mt-2 text-gray-600 text-lg">
          Enter your postcode to see news near you.
        </p>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Enter your full postcode"
            onKeyDown={(e) => e.key === "Enter" && onSubmit()} // ✅ Enter key triggers submit
            className="w-72 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-green-600 focus:outline-none text-gray-700 placeholder-gray-400 transition-all"
          />
          <button
            onClick={onSubmit}
            className="px-6 bg-green-700 text-white rounded-r-md font-semibold hover:bg-green-800 transition-all duration-300 hover:scale-105"
          >
            →
          </button>
        </motion.div>

        <motion.p
          className="mt-3 text-sm text-gray-500 underline cursor-pointer hover:text-green-700 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          How We Use Your Data
        </motion.p>
      </motion.section>

      {/* Hero Image */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-0 -mb-px"
      >
        <div className="relative w-screen h-full left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-white py-0">
          <img
            src={heroImage}
            alt="InYourArea preview"
            className="block mx-auto w-full h-full mt-14 object-contain align-top drop-shadow-2xl"
            loading="eager"
            decoding="async"
          />
        </div>
      </motion.section>

      <FeatureRail />
      <Footer className="mt-0 pt-0" />

      {/* ✅ Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
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
