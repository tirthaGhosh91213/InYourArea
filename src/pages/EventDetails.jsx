// src/pages/EventDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Edit2,
  Trash2,
  Share2,
  MoreVertical,
  Clock,
  ExternalLink,
  MessageSquare,
  Link2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { MdVerified } from "react-icons/md";
import { Helmet } from "react-helmet-async";
import SmallAdd from "../components/SmallAdd";
import Loader from '../components/Loader';

// Helper: circular index
const getNextIndex = (current, total) => {
  if (total === 0) return 0;
  return (current + 1) % total;
};

// LocalStorage keys for EventDetails ads
const SLOT_KEYS = {
  TOP_RIGHT: "EVENTDETAILS_AD_INDEX_TOP_RIGHT",
  BOTTOM_RIGHT: "EVENTDETAILS_AD_INDEX_BOTTOM_RIGHT",
};

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
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Reply functionality states
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [postingReply, setPostingReply] = useState(false);

  // Collapse/Expand replies state - BY DEFAULT ALL COLLAPSED
  const [collapsedReplies, setCollapsedReplies] = useState({});

  // YouTube-style menu state
  const [openMenuId, setOpenMenuId] = useState(null);

  // Ads state
  const [ads, setAds] = useState([]);
  const [topRightIndex, setTopRightIndex] = useState(0);
  const [bottomRightIndex, setBottomRightIndex] = useState(1);
  const [topRightClosed, setTopRightClosed] = useState(false);
  const [bottomRightClosed, setBottomRightClosed] = useState(false);

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

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 604800)}w`;

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatFullDate = (date) =>
    new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // 🆕 Format date without time (for end date)
  const formatDateOnly = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { 
      day: "2-digit",
      month: "short", 
      year: "numeric" 
    });
  };

  // Share Functions
  const getShareUrl = () => {
    return window.location.href;
  };

  const getShareText = () => {
    if (!event) return "";
    const plainText = event.description.replace(/<[^>]*>/g, "");
    const truncatedText = plainText.substring(0, 100);
    return `${event.title}\n\n${truncatedText}${
      plainText.length > 100 ? "..." : ""
    }`;
  };

  const handleShareWhatsApp = () => {
    const parts = [getShareText()];

    if (event?.eventDate) {
      parts.push(
        `Event Date: ${new Date(event.eventDate).toLocaleDateString("en-GB")}`
      );
    }

    if (event?.location?.trim()) {
      parts.push(`Location: ${event.location}`);
    }

    parts.push(`Read more: ${getShareUrl()}`);

    const text = parts.join("\n\n");
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) setOpenMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

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

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/events/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setComments(res.data.data);
        // Initialize all replies as collapsed by default
        const allCollapsed = {};
        const markAsCollapsed = (comments) => {
          comments.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
              allCollapsed[comment.id] = true;
              markAsCollapsed(comment.replies);
            }
          });
        };
        markAsCollapsed(res.data.data);
        setCollapsedReplies(allCollapsed);
      }
    } catch {
      toast.error("Failed to fetch comments");
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://api.jharkhandbiharupdates.com/api/v1/events/${id}`,
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

    // Fetch small ads
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
        console.error("Error fetching event details ads:", err);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // Rotate ad index for next refresh when a slot is closed
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

  const postComment = async () => {
    if (!commentText.trim()) return toast.error("Comment cannot be empty");
    try {
      setPosting(true);
      const res = await axios.post(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/events/${id}`,
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

  // Start Reply
  const handleStartReply = (commentId) => {
    setReplyingToId(commentId);
    setReplyText("");
  };

  // Cancel Reply
  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyText("");
  };

  // Post Reply
  const handlePostReply = async (parentId) => {
    if (!replyText.trim()) {
      toast.warning("Reply cannot be empty!");
      return;
    }
    try {
      setPostingReply(true);
      const res = await axios.post(
        `https://api.jharkhandbiharupdates.com/api/v1/comments/events/${id}`,
        { content: replyText, parentId: parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Reply added successfully!");
        setReplyText("");
        setReplyingToId(null);
        fetchComments();
      } else toast.error("Failed to add reply.");
    } catch {
      toast.error("Error adding reply.");
    } finally {
      setPostingReply(false);
    }
  };

  // Toggle replies visibility
  const toggleReplies = (commentId) => {
    setCollapsedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Count total replies
  const countReplies = (comment) => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.length;
  };

  // Start Edit Comment
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
    setOpenMenuId(null);
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
    setOpenMenuId(null);
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

  // Check if user can delete comment (comment owner or event owner)
  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    const isCommentOwner = comment.author?.id === currentUser.id;
    const isPostOwner = event?.author?.id === currentUser.id;
    return isCommentOwner || isPostOwner;
  };

  // 🔥 PERFECT HIERARCHY - Recursive Comment Renderer
  const renderComment = (comment, level = 0) => {
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingToId === comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const repliesCount = countReplies(comment);
    const areRepliesCollapsed = collapsedReplies[comment.id] !== false;
    const isMenuOpen = openMenuId === comment.id;
    const isCommentAuthorAdmin = comment.author?.role === "ADMIN";

    // MAX DEPTH LIMIT - Industry Standard (3 levels)
    const maxLevel = Math.min(level, 3);

    return (
      <div key={comment.id} className="relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex gap-3 py-2"
        >
          {/* Avatar */}
          <div className="flex-shrink-0 relative z-10">
            {comment.author?.profileImageUrl ? (
              <img
                src={comment.author.profileImageUrl}
                alt={`${comment.author.firstName} ${comment.author.lastName}`}
                className="w-9 h-9 rounded-full object-cover bg-white border border-white"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-9 h-9 bg-gray-300 text-gray-600 flex items-center justify-center rounded-full font-semibold text-sm"
              style={{
                display: comment.author?.profileImageUrl ? "none" : "flex",
              }}
            >
              {(comment.author?.firstName?.[0] || "U").toUpperCase()}
            </div>
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {comment.author
                        ? `${comment.author.firstName} ${comment.author.lastName}`
                        : "Anonymous"}
                    </span>
                    {isCommentAuthorAdmin && (
                      <MdVerified 
                        size={16} 
                        className="text-blue-500 flex-shrink-0" 
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {/* Edit Mode */}
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                      rows="3"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-md transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
                    {comment.content}
                  </p>
                )}

                {/* 🔥 Reply Button + View Replies on SAME LINE */}
                {!isEditing && (
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <button
                      onClick={() => handleStartReply(comment.id)}
                      className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
                    >
                      Reply
                    </button>
                    
                    {/* View/Hide Replies Button */}
                    {hasReplies && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                      >
                        {areRepliesCollapsed ? (
                          <>
                            <ChevronDown size={14} />
                            <span>{repliesCount} {repliesCount === 1 ? "reply" : "replies"}</span>
                          </>
                        ) : (
                          <>
                            <ChevronUp size={14} />
                            <span>Hide {repliesCount}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Reply Input */}
                {isReplying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2"
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author?.firstName}...`}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-green-500 text-sm resize-none"
                      rows="2"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        disabled={postingReply}
                        onClick={() => handlePostReply(comment.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md disabled:opacity-60 transition"
                      >
                        {postingReply ? "Posting..." : "Post"}
                      </button>
                      <button
                        onClick={handleCancelReply}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-md transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 🔥 CORRECT: Nested Replies INSIDE parent's content, maintaining hierarchy */}
                {hasReplies && !areRepliesCollapsed && (
                  <div className="mt-2 ml-0">
                    {[...comment.replies].reverse().map((reply) => 
                      renderComment(reply, level + 1)
                    )}
                  </div>
                )}

              </div>

              {/* YouTube-style 3-Dot Menu */}
              {currentUser && (canEditComment(comment) || canDeleteComment(comment)) && !isEditing && (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : comment.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                    title="More options"
                  >
                    <MoreVertical size={18} />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-xl py-1 z-20 min-w-[140px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canEditComment(comment) && (
                          <button
                            onClick={() => handleStartEdit(comment)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition"
                          >
                            <Edit2 size={16} className="text-blue-600" />
                            <span className="font-medium">Edit</span>
                          </button>
                        )}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => handleOpenDeleteModal(comment.id)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition"
                          >
                            <Trash2 size={16} />
                            <span className="font-medium">Delete</span>
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  const topRightAd = ads.length ? ads[topRightIndex % ads.length] : null;
  const bottomRightAd = ads.length ? ads[bottomRightIndex % ads.length] : null;

  if (loading || !event)
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader />
    </div>
  );

  return (
    <>
      {/* 🔥 HELMET FOR SEO & SHARE META */}
      <Helmet>
  <title>{event.title || "Event Details"} | {window.location.hostname === 'jharkhandupdates.com' ? 'Jharkhand Updates' : 'Jharkhand Bihar Updates'}</title>
  <meta
    name="description"
    content={
      event.description
        ? event.description.replace(/<[^>]*>/g, "").slice(0, 150)
        : "Event details and updates."
    }
  />

  <link rel="canonical" href={window.location.href} />

  <meta property="og:type" content="article" />
  <meta
    property="og:title"
    content={event.title || "Event Details"}
  />
  <meta
    property="og:description"
    content={
      event.description
        ? event.description.replace(/<[^>]*>/g, "").slice(0, 150)
        : "Event details and updates."
    }
  />
  <meta property="og:url" content={window.location.href} />
  <meta property="og:site_name" content={window.location.hostname === 'jharkhandupdates.com' ? 'Jharkhand Updates' : 'Jharkhand Bihar Updates'} />
  {event.imageUrls?.[0] ? (
    <>
      <meta property="og:image" content={event.imageUrls[0]} />
      <meta property="og:image:secure_url" content={event.imageUrls[0]} />
    </>
  ) : (
    <meta property="og:image" content={`${window.location.origin}/banner.jpg`} />
  )}

  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content={event.title || "Event Details"}
  />
  <meta
    name="twitter:description"
    content={
      event.description
        ? event.description.replace(/<[^>]*>/g, "").slice(0, 150)
        : "Event details and updates."
    }
  />
  {event.imageUrls?.[0] ? (
    <meta name="twitter:image" content={event.imageUrls[0]} />
  ) : (
    <meta name="twitter:image" content={`${window.location.origin}/banner.jpg`} />
  )}
</Helmet>

      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {/* Ads */}
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

            {/* Title & Share */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1">
                  {event.title}
                </h1>
                <div className="relative flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition"
                    title="Share"
                  >
                    <Share2 size={20} />
                  </motion.button>

                  {/* Share Menu */}
                  <AnimatePresence>
                    {showShareMenu && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/20 z-40"
                          onClick={() => setShowShareMenu(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-12 right-0 z-50"
                        >
                          <div className="bg-white rounded-2xl shadow-2xl p-3 border border-gray-200 flex flex-col gap-2 min-w-[160px]">
                            <button
                              onClick={handleShareWhatsApp}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition text-left text-sm"
                            >
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                              </svg>
                              <span className="font-medium text-gray-700">WhatsApp</span>
                            </button>

                            <button
                              onClick={handleShareFacebook}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition text-left text-sm"
                            >
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                              <span className="font-medium text-gray-700">Facebook</span>
                            </button>

                            <button
                              onClick={handleShareTwitter}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition text-left text-sm"
                            >
                              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                              <span className="font-medium text-gray-700">X/Twitter</span>
                            </button>

                            <button
                              onClick={handleCopyLink}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition text-left text-sm"
                            >
                              <Link2 size={18} className="text-gray-600" />
                              <span className="font-medium text-gray-700">Copy Link</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Event Info - ONLY IF PROVIDED */}
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                {event.eventDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-green-600 flex-shrink-0" />
                    <span className="font-medium">
                      {new Date(event.eventDate).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      {" at "}
                      {new Date(event.eventDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {event.endDate && ` - ${formatDateOnly(event.endDate)}`}
                    </span>
                  </div>
                )}

                {event.location && event.location.trim() && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-green-600 flex-shrink-0" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}
              </div>

              {/* Registration Button - ONLY IF PROVIDED */}
              {event.reglink && event.reglink.trim() && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(event.reglink, "_blank")}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
                >
                  <ExternalLink size={18} />
                  Register Now
                </motion.button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* About Section */}
            <div className="relative">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
              <div
                className={`text-gray-700 leading-relaxed ${
                  isExpanded ? "" : "line-clamp-6"
                }`}
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-green-700 font-semibold hover:underline text-sm"
              >
                {isExpanded ? "Show Less" : "Read More"}
              </motion.button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Discussion Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={22} className="text-green-600" />
                Discussion ({comments.length})
              </h2>

              {/* Add Comment */}
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0">
                  {currentUser?.profileImageUrl ? (
                    <img src={currentUser.profileImageUrl} alt="User" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-green-200 text-green-700 flex items-center justify-center rounded-full font-semibold">
                      {currentUser?.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add your thoughts..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                  />
                  <div className="flex justify-end">
                    <motion.button
                      disabled={posting}
                      onClick={postComment}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-60 transition"
                    >
                      {posting ? "Posting..." : "Post"}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-1">
                {comments.length > 0 ? (
                  [...comments].reverse().map((comment) => renderComment(comment, 0))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <MessageSquare size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium">No comments yet</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to comment!</p>
                  </div>
                )}
              </div>
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
              className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-5 right-5 text-white bg-black/40 rounded-full p-3 hover:bg-black/60 transition"
              >
                <X size={28} />
              </button>
              {event.imageUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-5 text-white bg-black/40 rounded-full p-3 hover:bg-black/60 transition"
                  >
                    <ChevronLeft size={36} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-5 text-white bg-black/40 rounded-full p-3 hover:bg-black/60 transition"
                  >
                    <ChevronRight size={36} />
                  </button>
                </>
              )}
              <img
                src={event.imageUrls[currentImage]}
                alt={event.title}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
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
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Comment?</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCloseDeleteModal}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteComment}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
