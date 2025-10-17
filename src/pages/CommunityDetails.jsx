// src/pages/CommunityDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, MessageCircle, Calendar, MapPin, ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import axios from "axios";
import { toast } from "react-toastify";

export default function CommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextImage();
    if (diff < -50) prevImage();
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/v1/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setPost(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch post details");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/comments/community-posts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setComments(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch comments");
    }
  };

  const sendComment = async () => {
    if (!commentText) return toast.error("Comment cannot be empty");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/community-posts/${id}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Comment added!");
        setCommentText("");
        fetchComments();
      }
    } catch (err) {
      toast.error("Failed to send comment");
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const prevImage = () => {
    if (!post?.imageUrls) return;
    setCurrentImage((prev) => (prev === 0 ? post.imageUrls.length - 1 : prev - 1));
  };

  const nextImage = () => {
    if (!post?.imageUrls) return;
    setCurrentImage((prev) => (prev === post.imageUrls.length - 1 ? 0 : prev + 1));
  };

  if (loading || !post) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full fixed top-0 left-0 z-50 bg-white shadow-md border-b border-gray-200">
        <RightSidebar />
      </div>

      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden pt-16">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-md border-r border-gray-200">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-green-700 font-semibold hover:text-teal-700 transition"
          >
            <ArrowLeft size={20} /> Back
          </motion.button>

          {/* Post Card */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-gradient-to-br from-white via-green-50 to-white rounded-3xl shadow-2xl p-6 space-y-6 border border-green-200"
          >
            {/* Image Carousel */}
            {post.imageUrls?.length > 0 && (
              <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={post.imageUrls[currentImage]}
                  alt={post.title}
                  className="w-full h-full object-cover transition-all duration-500 rounded-2xl cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                />
                {post.imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/70 text-green-700 p-2 rounded-full hover:bg-white/90 transition"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/70 text-green-700 p-2 rounded-full hover:bg-white/90 transition"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Author & Date */}
            <div className="flex justify-between items-center text-gray-700">
              <div className="flex items-center gap-3">
                <UserCircle size={24} className="text-green-600" />
                <div>
                  <div className="font-semibold text-gray-800">
                    {post.author ? `${post.author.firstName} ${post.author.lastName}` : "Unknown Author"}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} /> {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={16} className="text-green-600" /> {post.location}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>

            {/* Content */}
            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{post.content}</p>

            {/* Comments Section */}
            <div className="mt-6 space-y-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCommentInput((prev) => !prev)}
                className="flex items-center gap-2 text-green-700 font-semibold"
              >
                <MessageCircle size={20} /> Comment
              </motion.button>

              {showCommentInput && (
                <div className="mt-3 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                      onClick={sendComment}
                      className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition"
                    >
                      Send
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="flex gap-3 items-start text-gray-700 bg-green-50 rounded-xl p-3 shadow-sm"
                      >
                        <UserCircle size={20} className="text-green-500 mt-1" />
                        <div>
                          <div className="font-semibold text-gray-800">
                            {c.author ? `${c.author.firstName} ${c.author.lastName}` : "Unknown User"}
                          </div>
                          <div className="text-gray-700">{c.content}</div>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet.</p>}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>

        {/* Fullscreen Image Modal with Swipe */}
        <AnimatePresence>
          {isFullscreen && post.imageUrls?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-5 right-5 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition"
              >
                <X size={24} />
              </button>
              {post.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-5 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-5 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition"
                  >
                    <ChevronRight size={32} />
                  </button>
                </>
              )}
              <img
                src={post.imageUrls[currentImage]}
                alt={post.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
