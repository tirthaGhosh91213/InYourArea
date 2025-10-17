// src/pages/Community.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, MessageCircle, Search, PlusCircle, Calendar } from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [showCommentInput, setShowCommentInput] = useState({});
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/v1/community", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setPosts(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/comments/community-posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCommentsMap((prev) => ({ ...prev, [postId]: res.data.data }));
      }
    } catch (err) {
      toast.error("Failed to fetch comments");
    }
  };

  const sendComment = async (postId) => {
    if (!commentText[postId]) return toast.error("Comment cannot be empty");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/community-posts/${postId}`,
        { content: commentText[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Comment added!");
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
        fetchComments(postId);
      }
    } catch (err) {
      toast.error("Failed to send comment");
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${post.author.firstName} ${post.author.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>

      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="bg-emerald-700 text-white rounded-xl p-6 mb-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-center mb-4">
              Community Posts
            </h2>
            <div className="flex justify-center">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-2 flex items-center justify-center pointer-events-none">
                  <Search size={18} className="text-emerald-700" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-emerald-300 text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none transition placeholder-gray-400"
                />
              </div>
            </div>
          </motion.div>

          {/* Posts */}
          {loading ? (
            <div className="flex justify-center py-12 text-gray-600">
              Loading...
            </div>
          ) : filteredPosts.length > 0 ? (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {filteredPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      delay: idx * 0.05,
                      type: "spring",
                      stiffness: 100,
                    }}
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 25px 40px rgba(52, 211, 153, 0.25)",
                    }}
                    className="relative rounded-2xl overflow-hidden p-5 flex flex-col justify-between bg-white/90 shadow-md border border-green-100 backdrop-blur transition-all cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100 hover:via-green-50 hover:to-teal-100"
                    onClick={() => navigate(`/community/${post.id}`)}
                  >
                    {post.imageUrls?.[0] && (
                      <img
                        src={post.imageUrls[0]}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                    )}

                    <div className="mb-3 flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-2">
                        <UserCircle size={20} className="text-green-600" />
                        <span className="font-semibold">
                          {post.author.firstName} {post.author.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Calendar size={16} /> {formatDate(post.createdAt)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {post.title}
                      </h2>
                      <p className="text-gray-700 line-clamp-4 mt-1">
                        {post.content}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCommentInput((prev) => ({
                            ...prev,
                            [post.id]: !prev[post.id],
                          }));
                          if (!commentsMap[post.id]) fetchComments(post.id);
                        }}
                        className="flex items-center gap-2 text-green-700 font-semibold"
                      >
                        <MessageCircle size={18} /> Comment
                      </motion.button>

                      {showCommentInput[post.id] && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentText[post.id] || ""}
                              onChange={(e) =>
                                setCommentText((prev) => ({
                                  ...prev,
                                  [post.id]: e.target.value,
                                }))
                              }
                              className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button
                              onClick={() => sendComment(post.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
                            >
                              Send
                            </button>
                          </div>

                          <div className="mt-2 max-h-40 overflow-y-auto space-y-2">
                            {commentsMap[post.id]?.map((c) => (
                              <div
                                key={c.id}
                                className="flex gap-2 items-start text-gray-700"
                              >
                                <UserCircle
                                  size={18}
                                  className="text-green-500 mt-1"
                                />
                                <div>
                                  <span className="font-semibold text-gray-800">
                                    {c.author.firstName} {c.author.lastName}:
                                  </span>{" "}
                                  {c.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 col-span-full mt-10 text-xl"
            >
              No results found for <span className="font-semibold">{searchTerm}</span>
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create/community")}
            className="fixed bottom-10 right-10 flex items-center gap-2 bg-emerald-600 text-white font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all z-50"
          >
            <PlusCircle size={20} /> Post
          </motion.button>
        </main>
      </div>
    </>
  );
}
