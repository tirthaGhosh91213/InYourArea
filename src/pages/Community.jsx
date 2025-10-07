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
  Car,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";

const posts = [
  {
    id: 1,
    author: "Samantha Green",
    location: "Baker Street, London",
    content:
      "Lost my dog near the park this morning. Please message if seen 🐶💔",
    image:
      "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 2,
    author: "David Johnson",
    location: "Camden Town",
    content:
      "Hosting a free community yoga class this Sunday! Everyone’s welcome 🙏",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    author: "Mia Patel",
    location: "South Kensington",
    content:
      "Anyone up for a street clean-up this weekend? Let's make our area shine ✨",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60",
  },
];

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 overflow-y-auto">
        {/* Community Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80 }}
          className="bg-emerald-700 text-white rounded-xl p-6 mb-6 shadow-lg"
        >
          {/* Title */}
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
          <div className="flex justify-center mt-7 gap-11 text-white">
            <div className="flex flex-col items-center cursor-pointer hover:text-green-300 transition">
              <Clock size={18} />
              <span className="text-sm mt-1">Updates</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer hover:text-green-300 transition">
              <Cloud size={18} />
              <span className="text-sm mt-1">Weather</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer relative hover:text-green-300 transition">
              <Car size={18} />
              <span className="text-sm mt-1">Travel</span>
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full px-1.5 animate-pulse">
                9+
              </span>
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
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
                  {/* Image */}
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={post.image}
                      alt="post"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Post Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCircle className="text-green-600" size={18} />
                      <span className="font-semibold">{post.author}</span> ·{" "}
                      <span>{post.location}</span>
                    </div>

                    <p className="text-gray-800 font-medium">{post.content}</p>

                    {/* Reaction Bar */}
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

        {/* Floating Create Post Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-10 right-10 flex items-center gap-2 bg-green-600 text-white font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-green-700 transition-all"
        >
          <PlusCircle size={20} />
          Create Post
        </motion.button>
      </main>

      <RightSidebar />
    </div>
  );
}
