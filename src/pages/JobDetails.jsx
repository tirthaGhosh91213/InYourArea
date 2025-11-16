import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  Save,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [job, setJob] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

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
    if (!job?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === 0 ? job.imageUrls.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    if (!job?.imageUrls) return;
    setCurrentImage((prev) =>
      prev === job.imageUrls.length - 1 ? 0 : prev + 1
    );
  };

  // Fetch Current User
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return;

      try {
        const res = await axios.get("https://api.jharkhandbiharupdates.com/api/v1/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setCurrentUser(res.data.data);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };
    fetchCurrentUser();
  }, [token]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.jharkhandbiharupdates.com/api/v1/jobs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const foundJob = res.data.data.find((j) => j.id.toString() === id);
      setJob(foundJob);
    } catch {
      toast.error("Failed to fetch job");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/jobs/${id}`,
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
        `https://api.jharkhandbiharupdates.com/api/v1/comments/jobs/${id}`,
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

  // Start Edit Comment
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  // Update Comment
  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) {
      toast.warning("Comment cannot be empty!");
      return;
    }

    try {
      const res = await axios.put(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/${commentId}`,
        { content: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Comment updated successfully!");
        setEditingCommentId(null);
        setEditCommentText("");
        fetchComments();
      } else {
        toast.error("Failed to update comment.");
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("You are not authorized to update this comment.");
      } else {
        toast.error("Error updating comment.");
      }
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (commentId) => {
    setDeletingCommentId(commentId);
    setShowDeleteModal(true);
  };

  // Close Delete Modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingCommentId(null);
  };

  // Delete Comment
  const handleDeleteComment = async () => {
    try {
      const res = await axios.delete(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/${deletingCommentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Comment deleted successfully!");
        handleCloseDeleteModal();
        fetchComments();
      } else {
        toast.error("Failed to delete comment.");
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("You are not authorized to delete this comment.");
      } else {
        toast.error("Error deleting comment.");
      }
    }
  };

  // Check if user can edit comment (only comment owner)
  const canEditComment = (comment) => {
    return currentUser && comment.author?.id === currentUser.id;
  };

  // Check if user can delete comment (comment owner or post owner)
  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    const isCommentOwner = comment.author?.id === currentUser.id;
    const isPostOwner = job?.author?.id === currentUser.id;
    return isCommentOwner || isPostOwner;
  };

  useEffect(() => {
    if (!token) navigate("/login");
    fetchJob();
    fetchComments();
  }, [id, token]);

  if (loading || !job)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg animate-pulse">
        Loading...
      </div>
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
            {job.imageUrls?.length > 0 && (
              <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={job.imageUrls[currentImage]}
                  alt={job.title}
                  className="w-full h-full object-cover transition-all duration-500 rounded-2xl cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                />
                {job.imageUrls.length > 1 && (
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
            {/* Responsive Job Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-gray-700">
              <div className="flex flex-row items-center gap-3 order-1">
                <Building2 size={24} className="text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-800 text-base sm:text-lg">
                    {job.company}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} className="shrink-0" />
                    Deadline:
                    <span className="text-red-500 ml-1">
                      {job.applicationDeadline}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 order-2 sm:order-3 mt-1 sm:mt-0">
                <MapPin size={16} className="text-green-600 flex-shrink-0" />
                {job.location || "Unknown Location"}
              </div>
            </div>
            {job.salary && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold mt-1">
                <DollarSign size={16} className="text-green-600" />
                {job.salary}
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {job.title}
            </h1>

            <div className="relative">
              <div
                className={`text-gray-700 whitespace-pre-line leading-relaxed text-base md:text-lg transition-all duration-500 ${
                  isExpanded ? "" : "line-clamp-4"
                }`}
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-green-700 font-semibold hover:underline"
              >
                {isExpanded ? "See Less" : "See More"}
              </button>
            </div>

            {job.reglink && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(job.reglink || "", "_blank")}
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition shadow-md mb-4 md:mb-6 w-full md:w-auto"
              >
                Apply Now
              </motion.button>
            )}

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                💬 Comments
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full sm:flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={postComment}
                  className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700 transition w-full sm:w-auto"
                >
                  Post
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
                        {c.author?.profileImageUrl ? (
                          <img
                            src={c.author.profileImageUrl}
                            alt={`${c.author.firstName} ${c.author.lastName}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-green-200 shadow-sm flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-10 h-10 bg-green-100 text-green-700 flex items-center justify-center rounded-full font-bold text-lg shadow-sm flex-shrink-0"
                          style={{
                            display: c.author?.profileImageUrl ? "none" : "flex",
                          }}
                        >
                          {(c.author?.firstName?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1">
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

                            {/* Action Buttons */}
                            {currentUser && (canEditComment(c) || canDeleteComment(c)) && (
                              <div className="flex items-center gap-2">
                                {canEditComment(c) && editingCommentId !== c.id && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStartEdit(c)}
                                    className="text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition"
                                    title="Edit comment"
                                  >
                                    <Edit2 size={16} />
                                  </motion.button>
                                )}
                                {canDeleteComment(c) && editingCommentId !== c.id && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleOpenDeleteModal(c.id)}
                                    className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                                    title="Delete comment"
                                  >
                                    <Trash2 size={16} />
                                  </motion.button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Edit Mode */}
                          {editingCommentId === c.id ? (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                rows="3"
                              />
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleUpdateComment(c.id)}
                                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 text-sm transition"
                                >
                                  <Save size={14} />
                                  Save
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleCancelEdit}
                                  className="flex items-center gap-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg px-4 py-2 text-sm transition"
                                >
                                  <XCircle size={14} />
                                  Cancel
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 bg-green-50 px-4 py-2 rounded-xl leading-relaxed border border-green-100 mt-2">
                              {c.content}
                            </p>
                          )}
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
        <AnimatePresence>
          {isFullscreen && job.imageUrls?.length > 0 && (
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
              {job.imageUrls.length > 1 && (
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
                src={job.imageUrls[currentImage]}
                alt={job.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={handleCloseDeleteModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Delete Comment
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this comment? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCloseDeleteModal}
                    className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteComment}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}