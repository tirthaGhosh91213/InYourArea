// src/pages/EventDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  UserCircle,
  MessageCircle,
  Link2,
} from "lucide-react";
import Sidebar from "../components/SideBar";
import RightSidebar from "../components/RightSidebar";
import axios from "axios";
import { toast } from "react-toastify";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextImage();
    if (diff < -50) prevImage();
  };

  const prevImage = () => {
    if (!event?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === 0 ? event.imageUrls.length - 1 : prev - 1
    );
  };
  const nextImage = () => {
    if (!event?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === event.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/v1/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setEvent(res.data.data);
    } catch {
      toast.error("Failed to fetch event");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/comments/events/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setComments(res.data.data);
    } catch {
      toast.error("Failed to fetch comments");
    }
  };

  const postComment = async () => {
    if (!commentText.trim()) return toast.error("Comment cannot be empty");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/events/${id}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.data]);
        setCommentText("");
        toast.success("Comment added!");
      }
    } catch {
      toast.error("Failed to post comment");
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
    fetchEvent();
    fetchComments();
  }, [id, token]);

  if (loading || !event)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg animate-pulse">
        Loading...
      </div>
    );

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-green-700 font-semibold hover:text-teal-700 transition"
          >
            <ArrowLeft size={20} /> Back
          </motion.button>

          <motion.div
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-6 space-y-6 border border-green-200"
          >
            {/* Image Section */}
            {event.imageUrls?.length > 0 && (
              <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={event.imageUrls[currentImage]}
                  alt={event.title}
                  className="w-full h-full object-cover transition-all duration-500 rounded-2xl cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                />
                {event.imageUrls.length > 1 && (
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

            {/* Event Info */}
            <div className="flex justify-between items-center text-gray-700">
              <div className="flex items-center gap-3">
                <UserCircle size={24} className="text-green-600" />
                <div>
                  <div className="font-semibold text-gray-800">
                    {event.author
                      ? `${event.author.firstName} ${event.author.lastName}`
                      : "Unknown Author"}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} /> {formatDate(event.eventDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin size={16} className="text-green-600" /> {event.location}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>

            {/* Description with "See More" */}
            <div className="relative">
              <div
                className={`text-gray-700 whitespace-pre-line leading-relaxed text-lg transition-all duration-500 ${
                  isExpanded ? "" : "line-clamp-4"
                }`}
              >
                {event.description}
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-green-700 font-semibold hover:underline"
              >
                {isExpanded ? "See Less" : "See More"}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {event.portalLink && (
                <button
                  onClick={() =>
                    event.portalLink && window.open(event.portalLink, "_blank")
                  }
                  disabled={!event.portalLink}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition ${
                    event.portalLink
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Link2 size={20} /> Register
                </button>
              )}

              <div className="flex-1 flex gap-2 items-center">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  onClick={postComment}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition shadow-lg"
                >
                  <MessageCircle size={18} /> Comment
                </button>
              </div>
            </div>

            {/* Animated Comments */}
            <AnimatePresence>
              <motion.div
                layout
                className="mt-6 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {comments.length > 0 ? (
                  comments.map((c, index) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, type: "spring" }}
                      className="flex gap-3 items-start text-gray-700 bg-green-50 rounded-xl p-3 shadow-sm"
                    >
                      <UserCircle size={20} className="text-green-500 mt-1" />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {c.author
                            ? `${c.author.firstName} ${c.author.lastName}`
                            : "Anonymous"}
                        </div>
                        <div className="text-gray-700">{c.content}</div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>

        {/* Fullscreen Image */}
        <AnimatePresence>
          {isFullscreen && event.imageUrls?.length > 0 && (
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
              {event.imageUrls.length > 1 && (
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
                src={event.imageUrls[currentImage]}
                alt={event.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
