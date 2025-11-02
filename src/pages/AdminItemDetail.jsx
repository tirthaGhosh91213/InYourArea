import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, MapPin, Calendar, User, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE_API = "https://rehabilitation-cost-additionally-pci.trycloudflare.com/api/v1";

export default function AdminItemDetail() {
  const { type, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${BASE_API}/${type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItem(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [type, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-green-50">
        <motion.div
          className="w-14 h-14 border-4 border-t-green-600 border-l-green-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-green-50 text-gray-600 font-semibold text-lg">
        Item not found
      </div>
    );
  }

  const images = item.imageUrls || [];

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white font-semibold bg-gradient-to-r from-green-700 to-green-500 px-3 py-2 rounded-lg shadow-md hover:scale-105 transition-transform duration-300 mb-4"
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} /> Back
        </motion.button>

        {/* Glass Card */}
        <motion.div
          className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden border border-white/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Image Carousel */}
          <div className="relative w-full h-64 sm:h-72 overflow-hidden rounded-t-2xl">
            <AnimatePresence mode="wait">
              {images.length > 0 && (
                <motion.img
                  key={currentImage}
                  src={images[currentImage]}
                  alt={`${item.title} - ${currentImage + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                />
              )}
              {images.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
                  No Images
                </div>
              )}
            </AnimatePresence>

            {/* Carousel Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-white/30 transition"
                >
                  <ChevronLeft size={20} className="text-green-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-1.5 rounded-full hover:bg-white/30 transition"
                >
                  <ChevronRight size={20} className="text-green-700" />
                </button>
              </>
            )}

            {/* Image Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full ${
                      idx === currentImage ? "bg-green-700" : "bg-green-400/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-4">
            <motion.h1
              className="text-3xl sm:text-4xl font-bold text-gray-900 drop-shadow-md"
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {item.title || "Untitled"}
            </motion.h1>

            <motion.p
              className="text-gray-600 italic text-sm sm:text-base"
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              Created on: {new Date(item.createdAt).toLocaleDateString()}
            </motion.p>

            <motion.p
              className="text-gray-700 text-base sm:text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {item.description || "No description available."}
            </motion.p>

            {/* Info Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 bg-green-200/60 backdrop-blur-sm p-3 rounded-xl shadow-sm hover:scale-105 transition-transform duration-300">
                <MapPin className="text-green-800" />
                <span className="text-green-900 font-medium">
                  <strong>Location:</strong> {item.location || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-200/60 backdrop-blur-sm p-3 rounded-xl shadow-sm hover:scale-105 transition-transform duration-300">
                <Calendar className="text-green-800" />
                <span className="text-green-900 font-medium">
                  <strong>Date:</strong>{" "}
                  {item.eventDate
                    ? new Date(item.eventDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-700/70 backdrop-blur-sm p-3 rounded-xl shadow-sm hover:scale-105 transition-transform duration-300">
                <User className="text-green-50" />
                <span className="text-green-50 font-semibold">
                  <strong>Author:</strong> {item.author?.firstName}{" "}
                  {item.author?.lastName}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
