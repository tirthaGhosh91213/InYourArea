import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import mackup from "../assets/neswimage1.png";
import homes from "../assets/residential.png";

export default function InYourArea() {
  const [postcode, setPostcode] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  // Example valid postcodes
  const validPostcodes = ["700001", "700002", "700003","713407","713102"];

  const onSubmit = () => {
    if (postcode.trim() === "") {
      showToastMessage("Please enter a postcode!", "error");
      return;
    }

    if (validPostcodes.includes(postcode)) {
      showToastMessage("Postcode is valid!", "success");
      setTimeout(() => navigate("/localnews"), 2000); // Navigate after 2s
    } else {
      showToastMessage("Postcode does not exist!", "error");
    }
  };

  const showToastMessage = (message, type) => {
    setToast({ message, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000); // Hide after 2s
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      {/* Header */}
      <header className="bg-white shadow flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-3">
          <img src={mackup} alt="logo" className="w-8 h-8 rounded-md" />
          <span className="text-xl font-semibold text-gray-700 tracking-wide">
            InYourArea
          </span>
        </div>
        <nav className="flex gap-6">
          <a
            href="#"
            className="text-gray-600 font-medium hover:text-green-700 transition"
          >
            App
          </a>
          <a
            href="#"
            className="text-gray-600 font-medium hover:text-green-700 transition"
          >
            Advertise
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-12 flex-1 flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-relaxed">
          The Jharkhand Leading{" "}
          <span className="text-green-700">Local News</span>,{" "}
          <span className="text-green-700">Information</span> &amp;{" "}
          <span className="text-green-700">Community</span> Platform
        </h1>
        <p className="mt-2 text-gray-600 text-lg">
          Enter your postcode to see news near you.
        </p>
        <div className="mt-8 flex justify-center">
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Enter your full postcode"
            className="w-72 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-green-600 focus:outline-none"
          />
          <button
            onClick={onSubmit}
            className="px-6 bg-green-700 text-white rounded-r-md font-semibold hover:bg-green-800 transition"
          >
            →
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-500 underline cursor-pointer">
          How We Use Your Data
        </p>
      </section>

      {/* Mockup Image Section */}
      <section className="relative bg-white w-full">
        <div className="flex justify-center py-6">
          <img
            src={mackup}
            alt="Laptop"
            className="w-[65%] max-w-xl rounded-lg border shadow-md"
          />
        </div>
        <div className="absolute left-0 bottom-0 w-full">
          <img
            src={homes}
            alt="Houses"
            className="w-full h-[100px] object-cover"
          />
          <div className="w-full h-[40px] bg-green-800"></div>
        </div>
      </section>

      {/* Featured On Section */}
      <footer className="bg-green-900 text-white text-center py-10 mt-0">
        <h2 className="text-lg font-semibold mb-6">As Featured On</h2>
        <div className="flex flex-wrap justify-center gap-8 items-center text-gray-200">
          <span className="font-medium">Discovery</span>
          <span className="font-medium">Sky News</span>
          <span className="font-medium">National Geographic</span>
          <span className="font-medium">Sky One</span>
          <span className="font-medium">Mirror</span>
        </div>
      </footer>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-10 right-10 px-6 py-3 rounded-lg font-semibold shadow-lg text-white z-50 ${
            toast.type === "success"
              ? "bg-green-500 animate-fadeInOut"
              : "bg-red-500 animate-fadeInOut"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Tailwind Animations */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
