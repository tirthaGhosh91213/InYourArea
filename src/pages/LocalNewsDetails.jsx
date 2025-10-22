// src/pages/LocalNewsDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  UserCircle,
  Calendar,
  MapPin,
  Send,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function LocalNewsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Image swipe gestures
  const handleTouchStart = (e) =>
    (touchStartX.current = e.changedTouches[0].screenX);
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextImage();
    if (diff < -50) prevImage();
  };

  const prevImage = () =>
    setCurrentImage((prev) =>
      prev === 0 ? news.imageUrls.length - 1 : prev - 1
    );

  const nextImage = () =>
    setCurrentImage((prev) =>
      prev === news.imageUrls.length - 1 ? 0 : prev + 1
    );

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ✅ Fetch news details
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8000/api/v1/district-news/details/${id}`
        );
        if (res.data.success) setNews(res.data.data);
      } catch {
        toast.error("Failed to fetch news details.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  // ✅ Fetch comments
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/comments/district-news/${id}`
      );
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  // ✅ Post comment
 const handlePostComment = async () => {
  if (!commentText.trim()) {
    toast.warning("Comment cannot be empty!");
    return;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    // User is not logged in, redirect to /login
    navigate("/login");
    return;
  }

  try {
    setPosting(true);
    const res = await axios.post(
      `http://localhost:8000/api/v1/comments/district-news/${id}`,
      { content: commentText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      toast.success("Comment added successfully!");
      setCommentText("");
      fetchComments(); // refresh comments
    } else {
      toast.error("Failed to add comment.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error adding comment.");
  } finally {
    setPosting(false);
  }
};


  if (loading || !news)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg animate-pulse">
        Loading...
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-8">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-green-700 font-semibold hover:text-teal-700 transition"
        >
          <ArrowLeft size={20} /> Back
        </motion.button>

        {/* News Card */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-6 space-y-6 border border-green-200"
        >
          {/* Image Carousel */}
          {news.imageUrls?.length > 0 && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={news.imageUrls[currentImage]}
                alt={news.title}
                className="w-full h-full object-cover transition-all duration-500 cursor-pointer"
                onClick={() => setIsFullscreen(true)}
              />
              {news.imageUrls.length > 1 && (
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

          {/* Author & Location */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-700 gap-3">
            <div className="flex items-center gap-3">
              <UserCircle size={24} className="text-green-600" />
              <div>
                <div className="font-semibold text-gray-800">
                  {news.author
                    ? `${news.author.firstName} ${news.author.lastName}`
                    : "Unknown Author"}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar size={14} /> {formatDate(news.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin size={16} className="text-green-600" />{" "}
              {news.districtName}
            </div>
          </div>

          {/* Title & Content */}
          <h1 className="text-3xl font-bold text-gray-800">{news.title}</h1>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
            {news.content}
          </p>

          {/* ✅ Comments Section */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Comments
            </h2>

            {/* Comment Input */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
                rows="2"
                className="w-full sm:flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                disabled={posting}
                onClick={handlePostComment}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-5 py-3 w-full sm:w-auto disabled:opacity-60 transition"
              >
                <Send size={18} />
                {posting ? "Posting..." : "Post"}
              </motion.button>
            </div>

            {/* Comments List */}
            {/* Comments List */}
<div className="space-y-4">
  {comments.length === 0 ? (
    <p className="text-gray-500 text-center">
      No comments yet. Be the first to comment!
    </p>
  ) : (
    comments.map((comment) => (
      <div
        key={comment.id}
        className="bg-gray-50 border border-gray-200 p-4 rounded-2xl"
      >
        <div className="flex items-center gap-2 mb-1">
          <UserCircle size={20} className="text-green-600" />
          <span className="font-medium text-gray-800">
            {comment.author
              ? `${comment.author.firstName} ${comment.author.lastName}`
              : "Anonymous"}
          </span>
        </div>
        <p className="text-gray-700">{comment.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(comment.createdAt)}
        </p>
      </div>
    ))
  )}
</div>

          </div>
        </motion.div>

        {/* Fullscreen Image Viewer */}
        <AnimatePresence>
          {isFullscreen && news.imageUrls?.length > 0 && (
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

              {news.imageUrls.length > 1 && (
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
                src={news.imageUrls[currentImage]}
                alt={news.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
