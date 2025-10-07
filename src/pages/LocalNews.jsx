// src/pages/LocalNews.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import { Clock, Cloud, Car, Search, Heart, Share2 } from "lucide-react";

export default function LocalNews() {
  const [likedItems, setLikedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const feedItems = [
    {
      img: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=500",
      title: "Tesco Mobile encourages people to stay connected",
      source: "Advertorial",
    },
    {
      img: "https://images.unsplash.com/photo-1581091870622-9b6f7e33f0c6?w=500",
      title: "Tate Britain to get ‘garden classroom’",
      source: "bbc.com • 22 minutes ago",
    },
    {
      img: "https://images.unsplash.com/photo-1571607388263-8b35b5b3d1a3?w=500",
      title: "Car meets: The hobby that petrolheads love",
      source: "bbc.com • 23 minutes ago",
    },
    {
      img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500",
      title: "Leader’s Community Reassurance update",
      source: "westminster.gov.uk • 9 hours ago",
    },
    {
      img: "https://images.unsplash.com/photo-1606813902913-cf3b7f1b4e47?w=500",
      title: "This 5-star beauty organiser is now 79% off",
      source: "inyourarea.co.uk • 13 hours ago",
    },
    {
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500",
      title: "Rosie Jones says wine bottle was thrown at her",
      source: "rutland-times.co.uk • 14 hours ago",
    },
  ];

  const toggleLike = (i) => {
    setLikedItems((prev) =>
      prev.includes(i) ? prev.filter((id) => id !== i) : [...prev, i]
    );
  };

  const filteredFeed = feedItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 flex gap-6 p-6 overflow-y-auto">
        <div className="flex-1">
          {/* Header with Search */}
          <div className="bg-emerald-700 text-white rounded-xl p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-semibold text-center mb-4">
              Local News
            </h2>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 80 }}
              className="relative w-full sm:w-80 mx-auto"
            >
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-white/70 bg-white/80 text-gray-800 focus:ring-2 focus:ring-green-500 outline-none shadow-sm placeholder-gray-500 transition backdrop-blur"
              />
              <motion.span
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="absolute left-3 top-2.5 text-gray-600 hover:text-green-700 transition cursor-pointer"
              >
                <Search size={20} />
              </motion.span>
            </motion.div>

            {/* Tabs */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="flex flex-col items-center cursor-pointer hover:text-green-200 transition">
                <Clock size={18} />
                <span className="text-sm mt-1">Updates</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer hover:text-green-200 transition">
                <Cloud size={18} />
                <span className="text-sm mt-1">Weather</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer relative hover:text-green-200 transition">
                <Car size={18} />
                <span className="text-sm mt-1">Travel</span>
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 animate-pulse">
                  9+
                </span>
              </div>
            </div>
          </div>

          {/* Feed Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredFeed.map((item, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(16, 185, 129, 0.25)",
                  }}
                  className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-green-100 transition-all cursor-pointer hover:bg-gradient-to-br hover:from-emerald-100 hover:via-green-50 hover:to-teal-100"
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105"
                  />

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.source}</p>

                    <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
                      <motion.button
                        whileTap={{ scale: 1.2 }}
                        onClick={() => toggleLike(i)}
                        className={`flex items-center gap-1 transition ${
                          likedItems.includes(i)
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        <Heart size={16} /> Like
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition"
                      >
                        <Share2 size={16} /> Share
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <RightSidebar />
      </main>
    </div>
  );
}
