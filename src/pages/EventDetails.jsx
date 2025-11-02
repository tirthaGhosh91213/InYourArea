import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  UserCircle,
  MessageCircle,
  Link2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
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

  useEffect(() => {
    if (!token) navigate("/login");
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://miami-only-great-buf.trycloudflare.com/api/v1/events/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) setEvent(res.data.data);
      } catch {
        toast.error("Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
    fetchComments();
    // eslint-disable-next-line
  }, [id, token]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://miami-only-great-buf.trycloudflare.com/api/v1/comments/events/${id}`,
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
      setPosting(true);
      const res = await axios.post(
        `https://miami-only-great-buf.trycloudflare.com/api/v1/comments/events/${id}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCommentText("");
        fetchComments();
        toast.success("Comment added!");
      }
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  if (loading || !event)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg animate-pulse">Loading...</div>
    );

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
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
            className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-4 md:p-6 space-y-6 border border-green-200"
          >
            {/* Images */}
            {event.imageUrls?.length > 0 && (
              <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-lg">
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
                      className="absolute top-1/2 left-2 sm:left-3 -translate-y-1/2 bg-white/70 text-green-700 p-2 rounded-full hover:bg-white/90 transition"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute top-1/2 right-2 sm:right-3 -translate-y-1/2 bg-white/70 text-green-700 p-2 rounded-full hover:bg-white/90 transition"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Author and Event Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-gray-700">
              <div className="flex flex-row items-center gap-3 order-1">
                <UserCircle size={24} className="text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-800 text-base sm:text-lg">
                    {event.author
                      ? `${event.author.firstName} ${event.author.lastName}`
                      : "Unknown Author"}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} className="shrink-0" />
                    {event.eventDate
                      ? new Date(event.eventDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })
                      : "-"}
                    <span>
                      {event.eventDate
                        ? new Date(event.eventDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 order-2 sm:order-3 mt-1 sm:mt-0">
                <MapPin size={16} className="text-green-600 flex-shrink-0" />
                {event.location || "Unknown Location"}
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: event.title }} />
            <div className="relative">
              <div
                className={`text-gray-700 whitespace-pre-line leading-relaxed text-base md:text-lg transition-all duration-500 ${
                  isExpanded ? "" : "line-clamp-4"
                }`}
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-green-700 font-semibold hover:underline"
              >
                {isExpanded ? "See Less" : "See More"}
              </button>
            </div>
            {event.reglink && (
              <button
                onClick={() => window.open(event.reglink, "_blank")}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
              >
                <Link2 size={20} /> Register
              </button>
            )}

            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">💬 Comments</h2>
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full sm:flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={posting}
                  onClick={postComment}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-5 py-3 w-full sm:w-auto disabled:opacity-60 transition"
                >
                  <MessageCircle size={18} />
                  {posting ? "Posting..." : "Comment"}
                </motion.button>
              </div>
              <AnimatePresence>
                <motion.div
                  layout
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.15 }}
                >
                  {comments.length > 0 ? (
                    comments.map((c, index) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 80,
                        }}
                        className="bg-white p-4 rounded-2xl shadow-md flex items-start gap-4 border border-green-100 hover:shadow-lg transition-transform duration-300 hover:scale-[1.01]"
                      >
                        <div className="w-10 h-10 bg-green-100 text-green-700 flex items-center justify-center rounded-full font-bold text-lg shadow-sm">
                          {(c.author?.firstName?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <h4 className="font-semibold text-gray-800">
                              {c.author
                                ? `${c.author.firstName} ${c.author.lastName}`
                                : "Anonymous"}
                            </h4>
                            <span className="text-xs text-gray-500 italic">
                              {formatDate(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 bg-green-50 px-4 py-2 rounded-xl leading-relaxed border border-green-100 mt-2">
                            {c.content}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-center">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
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
