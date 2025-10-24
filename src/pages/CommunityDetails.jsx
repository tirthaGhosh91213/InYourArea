import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  Calendar,
  MapPin,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function CommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [post, setPost] = useState(null);
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
    if (!post?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === 0 ? post.imageUrls.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    if (!post?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === post.imageUrls.length - 1 ? 0 : prev + 1
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

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8000/api/v1/community/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setPost(res.data.data);
    } catch {
      toast.error("Failed to fetch post");
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
    } catch {
      toast.error("Failed to fetch comments");
    }
  };

  const sendComment = async () => {
    if (!commentText.trim()) return toast.error("Comment cannot be empty");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/community-posts/${id}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.data]);
        setCommentText("");
        toast.success("Comment added!");
      }
    } catch {
      toast.error("Failed to send comment");
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
    fetchPost();
    fetchComments();
  }, [id]);

  if (loading || !post)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg animate-pulse">
        Loading...
      </div>
    );

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
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
            className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-6 space-y-6 border border-green-200"
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

            {/* Author Info */}
            <div className="flex justify-between items-center text-gray-700">
              <div className="flex items-center gap-3">
                <UserCircle size={24} className="text-green-600" />
                <div>
                  <div className="font-semibold text-gray-800">
                    {post.author
                      ? `${post.author.firstName} ${post.author.lastName}`
                      : "Unknown Author"}
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

            {/* Content with See More */}
            <div className="relative">
              <div
                className={`text-gray-700 whitespace-pre-line leading-relaxed text-lg transition-all duration-500 ${
                  isExpanded ? "" : "line-clamp-4"
                }`}
              >
                {post.content}
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-green-700 font-semibold hover:underline"
              >
                {isExpanded ? "See Less" : "See More"}
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                💬 Comments
              </h3>

              {/* Comment Input */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-400 transition outline-none"
                />
                <button
                  onClick={sendComment}
                  className="bg-green-600 text-white px-5 py-3 rounded-full hover:bg-green-700 transition shadow"
                >
                  Post
                </button>
              </div>

              {/* Comments List */}
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
                        className="bg-white p-4 rounded-2xl shadow-md flex items-start gap-4 border border-green-100 hover:shadow-lg transition hover:scale-[1.01]"
                      >
                        <div className="w-12 h-12 bg-green-100 text-green-700 flex items-center justify-center rounded-full font-bold text-lg shadow-sm">
                          {(c.author?.firstName?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-800">
                              {c.author
                                ? `${c.author.firstName} ${c.author.lastName}`
                                : "Anonymous"}
                            </h4>
                            <span className="text-xs text-gray-500 italic">
                              {new Date(c.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700 bg-green-50 px-4 py-2 rounded-xl leading-relaxed border border-green-100 mt-2">
                            {c.content}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center italic">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </main>

        {/* Fullscreen Image Viewer */}
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
