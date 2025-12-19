// src/pages/CommunityDetails.jsx
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
  Edit2,
  Trash2,
  Save,
  XCircle,
  Share2,
  Link2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import SmallAdd from "../components/SmallAdd";

// Helper: circular index for rotating ads
const getNextIndex = (current, total) => {
  if (total === 0) return 0;
  return (current + 1) % total;
};

// LocalStorage keys for CommunityDetails ads
const SLOT_KEYS = {
  TOP_RIGHT: "COMMUNITYDETAILS_AD_INDEX_TOP_RIGHT",
  BOTTOM_RIGHT: "COMMUNITYDETAILS_AD_INDEX_BOTTOM_RIGHT",
};

export default function CommunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Ads state
  const [ads, setAds] = useState([]);
  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const renderMedia = (url, alt, className, isFullscreen = false) => {
    if (
      url &&
      (url.endsWith(".mp4") ||
        url.endsWith(".webm") ||
        url.endsWith(".ogg") ||
        url.includes("video"))
    ) {
      return (
        <video
          src={url}
          controls
          autoPlay={isFullscreen}
          className={className}
          style={{ background: "#111" }}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <img
        src={url}
        alt={alt}
        className={className}
        onClick={() => setIsFullscreen(true)}
        style={{ cursor: "pointer" }}
      />
    );
  };

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
      post && post.imageUrls && post.imageUrls.length
        ? prev === 0
          ? post.imageUrls.length - 1
          : prev - 1
        : 0
    );

  const nextImage = () =>
    setCurrentImage((prev) =>
      post && post.imageUrls && post.imageUrls.length
        ? prev === post.imageUrls.length - 1
          ? 0
          : prev + 1
        : 0
    );

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Share Functions
  const getShareUrl = () => {
    return window.location.href;
  };

  const getShareText = () => {
    if (!post) return "";
    const plainText = post.content.replace(/<[^>]*>/g, "");
    const truncatedText = plainText.substring(0, 100);
    return `${post.title}\n\n${truncatedText}${
      plainText.length > 100 ? "..." : ""
    }`;
  };

  const handleShareWhatsApp = () => {
    const text = `${getShareText()}\n\nLocation: ${
      post.location || "Not specified"
    }\n\nRead more: ${getShareUrl()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    setShowShareMenu(false);
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      getShareUrl()
    )}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  const handleShareInstagram = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.info(
      "Link copied! Open Instagram app and paste in your story or bio."
    );
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    const text = getShareText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast.success("Link copied to clipboard!");
      setShowShareMenu(false);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  // Fetch Current User
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          "https://api.jharkhandbiharupdates.com/api/v1/user/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) setCurrentUser(res.data.data);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };
    fetchCurrentUser();
  }, [token]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://api.jharkhandbiharupdates.com/api/v1/community/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) setPost(res.data.data);
        else toast.error("Failed to fetch post");
      } catch {
        toast.error("Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };
    if (!token) {
      navigate("/login");
      return;
    }
    fetchPost();

    // Fetch small ads for CommunityDetails
    fetch(
      "https://api.jharkhandbiharupdates.com/api/v1/banner-ads/active/small"
    )
      .then((res) => res.json())
      .then((data) => {
        if (
          data &&
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          const orderedAds = [...data.data];
          setAds(orderedAds);

          const total = orderedAds.length;
          let savedTop = parseInt(
            localStorage.getItem(SLOT_KEYS.TOP_RIGHT) ?? "0",
            10
          );
          let savedBottom = parseInt(
            localStorage.getItem(SLOT_KEYS.BOTTOM_RIGHT) ?? "1",
            10
          );

          if (isNaN(savedTop) || savedTop < 0 || savedTop >= total) {
            savedTop = 0;
          }
          if (isNaN(savedBottom) || savedBottom < 0 || savedBottom >= total) {
            savedBottom = total > 1 ? 1 : 0;
          }

          if (savedTop === savedBottom && total > 1) {
            savedBottom = getNextIndex(savedTop, total);
          }

          setTopRightIndex(savedTop);
          setBottomRightIndex(savedBottom);
        }
      })
      .catch((err) => {
        console.error("Error fetching community details ads:", err);
      });
  }, [id, token, navigate]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/community-posts/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setComments(res.data.data);
      else toast.error("Failed to fetch comments");
    } catch {
      toast.error("Failed to fetch comments");
    }
  };

  useEffect(() => {
    if (token) fetchComments();
  }, [id, token]);

  // Rotate ad index on next refresh after a close
  useEffect(() => {
    if (!ads.length) return;
    const total = ads.length;

    if (topRightClosed) {
      const nextTop = getNextIndex(topRightIndex, total);
      localStorage.setItem(SLOT_KEYS.TOP_RIGHT, String(nextTop));
    }

    if (bottomRightClosed) {
      const nextBottom = getNextIndex(bottomRightIndex, total);
      localStorage.setItem(SLOT_KEYS.BOTTOM_RIGHT, String(nextBottom));
    }
  }, [topRightClosed, bottomRightClosed, topRightIndex, bottomRightIndex, ads]);

  const handlePostComment = async () => {
    if (!commentText.trim()) {
      toast.warning("Comment cannot be empty!");
      return;
    }
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setPosting(true);
      const res = await axios.post(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/community-posts/${id}`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Comment added successfully!");
        setCommentText("");
        fetchComments();
      } else toast.error("Failed to add comment.");
    } catch {
      toast.error("Error adding comment.");
    } finally {
      setPosting(false);
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
    const isPostOwner = post?.author?.id === currentUser.id;
    return isCommentOwner || isPostOwner;
  };

  const topRightAd = ads.length ? ads[topRightIndex % ads.length] : null;
  const bottomRightAd = ads.length ? ads[bottomRightIndex % ads.length] : null;

  if (loading || !post)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg animate-pulse">
        Loading...
      </div>
    );

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Ads like other detail pages */}
        {topRightAd && !topRightClosed && (
          <SmallAdd
            ad={topRightAd}
            position="top-right"
            open={true}
            onClose={() => setTopRightClosed(true)}
          />
        )}
        {bottomRightAd && !bottomRightClosed && (
          <SmallAdd
            ad={bottomRightAd}
            position="bottom-right"
            open={true}
            onClose={() => setBottomRightClosed(true)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => {
    if (window.history.length > 2) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }}
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
            {post.imageUrls?.length > 0 && (
              <div className="relative w-full h-60 sm:h-72 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                {renderMedia(
                  post.imageUrls[currentImage],
                  post.title,
                  "w-full h-full object-cover rounded-2xl transition-all duration-500 bg-black"
                )}
                {post.imageUrls.length > 1 && (
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

            {/* AUTHOR INFO AND SHARE BUTTON */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-row items-center gap-3 flex-1">
                  {post.author?.profileImageUrl ? (
                    <img
                      src={post.author.profileImageUrl}
                      alt={`${post.author.firstName} ${post.author.lastName}`}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-green-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                  ) : null}
                  <UserCircle
                    size={48}
                    className="text-green-600 flex-shrink-0"
                    style={{
                      display: post.author?.profileImageUrl ? "none" : "block",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-base sm:text-lg truncate">
                      {post.author
                        ? `${post.author.firstName} ${post.author.lastName}`
                        : "Unknown Author"}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} className="shrink-0" />
                      <span className="truncate">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <div className="relative flex items-center gap-3 justify-between sm:justify-end">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={16} className="text-green-600 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">
                      {post.location || "Unknown Location"}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition flex-shrink-0"
                    title="Share this post"
                  >
                    <Share2 size={20} className="sm:hidden" />
                    <Share2 size={22} className="hidden sm:block" />
                  </motion.button>

                  {/* Horizontal Share Menu - Fully Responsive */}
                  <AnimatePresence>
                    {showShareMenu && (
                      <>
                        {/* Backdrop for mobile */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/20 z-40 md:hidden"
                          onClick={() => setShowShareMenu(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-16 sm:top-20 right-0 z-50 
                                   w-[280px] xs:w-[300px] sm:w-auto"
                        >
                          <div className="bg-blue-600 rounded-full shadow-2xl px-2 sm:px-3 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
                            {/* Close Button */}
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowShareMenu(false)}
                              className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition flex-shrink-0"
                              title="Close"
                            >
                              <X size={18} className="sm:hidden" />
                              <X size={20} className="hidden sm:block" />
                            </motion.button>

                            {/* WhatsApp */}
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleShareWhatsApp}
                              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white hover:bg-blue-700 rounded-full transition flex-shrink-0"
                              title="Share on WhatsApp"
                            >
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                            </motion.button>

                            {/* Facebook */}
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleShareFacebook}
                              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white hover:bg-blue-700 rounded-full transition flex-shrink-0"
                              title="Share on Facebook"
                            >
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            </motion.button>

                            {/* Instagram */}
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleShareInstagram}
                              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white hover:bg-blue-700 rounded-full transition flex-shrink-0"
                              title="Share on Instagram"
                            >
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                            </motion.button>

                            {/* Twitter/X */}
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleShareTwitter}
                              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white hover:bg-blue-700 rounded-full transition flex-shrink-0"
                              title="Share on X (Twitter)"
                            >
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </motion.button>

                            {/* Copy Link */}
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleCopyLink}
                              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white hover:bg-blue-700 rounded-full transition flex-shrink-0"
                              title="Copy link"
                            >
                              <Link2 size={18} className="sm:hidden" />
                              <Link2 size={20} className="hidden sm:block" />
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <h1
              className="text-2xl md:text-3xl font-bold text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />
            <div className="relative">
              <div
                className={`text-gray-700 whitespace-pre-line leading-relaxed text-base md:text-lg transition-all duration-500 ${
                  isExpanded ? "" : "line-clamp-4"
                }`}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-green-700 font-semibold hover:underline"
              >
                {isExpanded ? "See Less" : "See More"}
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                💬 Comments
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows="2"
                  className="w-full sm:flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={posting}
                  onClick={handlePostComment}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-5 py-3 w-full sm:w-auto disabled:opacity-60 transition"
                >
                  <Send size={18} />
                  {posting ? "Posting..." : "Post"}
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
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-green-200 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-12 h-12 bg-green-100 text-green-700 flex items-center justify-center rounded-full font-bold text-lg shadow-sm flex-shrink-0"
                          style={{
                            display: c.author?.profileImageUrl
                              ? "none"
                              : "flex",
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
                                {formatDate(c.createdAt)}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            {currentUser &&
                              (canEditComment(c) || canDeleteComment(c)) && (
                                <div className="flex items-center gap-2">
                                  {canEditComment(c) &&
                                    editingCommentId !== c.id && (
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
                                  {canDeleteComment(c) &&
                                    editingCommentId !== c.id && (
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          handleOpenDeleteModal(c.id)
                                        }
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
                                onChange={(e) =>
                                  setEditCommentText(e.target.value)
                                }
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
              {renderMedia(
                post.imageUrls[currentImage],
                post.title,
                "max-h-full max-w-full object-contain rounded-lg shadow-lg bg-black",
                true
              )}
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
                  Are you sure you want to delete this comment? This action
                  cannot be undone.
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
