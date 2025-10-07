// src/pages/Community.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  UserCircle,
  PlusCircle,
  Search,
  Clock,
  Cloud,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import Weather from "../components/Weather";

const posts = [
  {
    id: 1,
    author: "Samantha Green",
    location: "Baker Street, London",
    content: "Lost my dog near the park this morning. Please message if seen 🐶💔",
    image: "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 2,
    author: "David Johnson",
    location: "Camden Town",
    content: "Hosting a free community yoga class this Sunday! Everyone’s welcome 🙏",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    author: "Mia Patel",
    location: "South Kensington",
    content: "Anyone up for a street clean-up this weekend? Let's make our area shine ✨",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60",
  },
];

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("updates");

  const filteredPosts = posts.filter(
    (post) =>
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLike = (id) => {
    setLikedPosts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Example coordinates
  const location = { latitude: 23.25, longitude: 87.31 };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="bg-emerald-700 text-white rounded-xl p-6 mb-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold text-center mb-4">Community</h2>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="relative w-full sm:w-80 mx-auto"
          >
            <input
              type="text"
              placeholder="Search posts..."
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
          <div className="flex justify-center gap-12 mt-6 relative">
            {["updates", "weather"].map((tab) => (
              <motion.div
                key={tab}
                className="flex flex-col items-center cursor-pointer relative group"
                onClick={() => setActiveTab(tab)}
                whileTap={{ scale: 0.95 }}
              >
                {tab === "updates" ? (
                  <Clock
                    size={20}
                    className={`transition ${
                      activeTab === "updates"
                        ? "text-emerald-300"
                        : "text-white group-hover:text-emerald-200"
                    }`}
                  />
                ) : (
                  <Cloud
                    size={20}
                    className={`transition ${
                      activeTab === "weather"
                        ? "text-emerald-300"
                        : "text-white group-hover:text-emerald-200"
                    }`}
                  />
                )}
                <span
                  className={`text-sm mt-1 transition ${
                    activeTab === tab
                      ? "text-emerald-300 font-semibold"
                      : "text-white group-hover:text-emerald-200"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>

                {/* Underline */}
                <AnimatePresence>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="underline"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -bottom-2 w-8 h-1 bg-emerald-300 rounded-full"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === "updates" && (
          <AnimatePresence>
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 20px 30px rgba(0,0,0,0.15)",
                    }}
                    className="bg-white rounded-2xl shadow-md overflow-hidden border hover:shadow-xl transition-all cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-50"
                  >
                    <div className="h-48 w-full overflow-hidden">
                      <img
                        src={post.image}
                        alt="post"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserCircle className="text-green-600" size={18} />
                        <span className="font-semibold">{post.author}</span> ·{" "}
                        <span>{post.location}</span>
                      </div>
                      <p className="text-gray-800 font-medium">{post.content}</p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t text-gray-600">
                        <motion.button
                          whileTap={{ scale: 1.2 }}
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1 transition ${
                            likedPosts.includes(post.id)
                              ? "text-red-500"
                              : "hover:text-red-500 text-gray-500"
                          }`}
                        >
                          <Heart size={18} /> Like
                        </motion.button>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition">
                          <MessageCircle size={18} /> Comment
                        </button>
                        <button className="flex items-center gap-1 hover:text-green-500 transition">
                          <Share2 size={18} /> Share
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 col-span-full mt-10 text-xl"
              >
                No results found for "<span className="font-semibold">{searchTerm}</span>"
              </motion.p>
            )}
          </AnimatePresence>
        )}

        {activeTab === "weather" && (
          <div className="w-full overflow-x-auto">
            <div className="flex gap-4 py-4">
              <Weather {...location} hours={24} /> {/* Pass 24 hours prop for timeline */}
            </div>
          </div>
        )}

      </main>

      <RightSidebar />
    </div>
  );
}
